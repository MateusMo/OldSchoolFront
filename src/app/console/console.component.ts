import { Component, OnInit } from '@angular/core';
import { AnonymousDto } from '../interfaces/AnonymousDto';
import { CommandService } from '../services/command.service';
import { CommonModule } from '@angular/common';
import { ConsoleHistoryDto } from '../interfaces/ConsoleHistoryDto';
import { DefaultResponseDto } from '../interfaces/DefaultResponseDto';
import { CommandDto } from '../interfaces/CommandDto';


@Component({
  selector: 'app-console',
  standalone: true,
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.css'],
  imports: [CommonModule] 
})
export class ConsoleComponent implements OnInit {
  private welcomeMessage1: string = 'WELCOME TO OLD SCHOOL SOCIAL MEDIA';
  private welcomeMessage2: string = 'TYPE HELP TO LEARN HOW TO USE IT';
  private currentIndex: number = 0;
  private typingSpeed: number = 100; // Velocidade de digitação (ms por caractere)
  private erasingSpeed: number = 50; // Velocidade de apagar (ms por caractere)
  private delayBetweenMessages: number = 1000; // Pausa antes de apagar ou mudar de mensagem


  command = '';
  history: ConsoleHistoryDto[] = []; // Lista de comandos e respostas

  constructor(private commandService: CommandService) {}

  ngOnInit(): void {
    this.welcomeAnimation();
  }

  welcomeAnimation() {
    this.typeMessage(this.welcomeMessage1, () => {
      setTimeout(() => this.eraseMessage(() => {
        this.typeMessage(this.welcomeMessage2, () => {
          setTimeout(() => this.eraseMessage(), this.delayBetweenMessages);
        });
      }), this.delayBetweenMessages);
    });
  }

  typeMessage(message: string, callback?: () => void) {
    if (this.currentIndex < message.length) {
      this.command += message.charAt(this.currentIndex);
      this.currentIndex++;
      setTimeout(() => this.typeMessage(message, callback), this.typingSpeed);
    } else {
      this.currentIndex = 0;
      if (callback) callback();
    }
  }

  eraseMessage(callback?: () => void) {
    if (this.command.length > 0) {
      this.command = this.command.substring(0, this.command.length - 1);
      setTimeout(() => this.eraseMessage(callback), this.erasingSpeed);
    } else {
      if (callback) callback();
    }
  }

  onKey(event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      this.command = this.command.slice(0, -1);
    } else if (event.key.length === 1) {
      this.command += event.key.toUpperCase();
    } else if (event.key === "Enter") {
      const endpointOption = this.detectEndpoint(this.command);
      if (endpointOption === 0) {
        this.callAnonymous();
      } 
      
      if (endpointOption === 1) {
        this.callCommands();
      }

      if(endpointOption === 2){
        this.history = [];
        this.command = '';
      }
    }
  }

  detectEndpoint(command: string): number {
    const splitCommand = command.split(" ");
    if (splitCommand[0] === "MAY" && splitCommand[1] === "I" && splitCommand[2] === "COME" && splitCommand[3] === "IN" && splitCommand[4] === "?" && splitCommand[5] === "NICKNAME" && splitCommand[7] === "PASSWORD") {
      return 0;
    }

    if (splitCommand[0] === "CREATE" && splitCommand[1] === "USER" && splitCommand[2] === "NICKNAME" && splitCommand[4] === "PASSWORD") {
      return 0;
    }

    if(splitCommand[0] === "CLEAR"){
      return 2
    }

    return 1;
  }

  callAnonymous() {
    const anonymous: AnonymousDto = {
      content: this.command
    };
    this.commandService.sendAnonymousCommand(anonymous).subscribe((res: DefaultResponseDto) => {
      //adiciona mensagem de login
      if(res.messages && res.messages[0] ==="logged"){
        localStorage.setItem('key',res.messages[2]);
        this.updateHistory([res.messages[1]],[])
        return;
      }
      this.updateHistory(res.messages,res.errors);
    }, (err: any) => {
      console.error(err); // Tratamento de erro
    });
  }

  callCommands() {
    const command:CommandDto={
      content:this.command
    }

    this.commandService.sendCommand(command).subscribe((res:DefaultResponseDto)=>{
      this.updateHistory(res.messages,res.errors)
    },(error:any)=>{

    })
  }

  updateHistory(messages:string[] | null,errors:string[] | null){
    const responseMessages = messages?.join('<br/>') || ''; // Concatena mensagens
    const responseErrors = errors?.join('<br/>') || ''; // Concatena erros
    const response = responseMessages + (responseErrors ? '<br/>' + responseErrors : '');
    // Adiciona a entrada de histórico
    this.history.push({ command: this.command, response: response });
    // Limpa o comando atual
    this.command = '';
  }
}
