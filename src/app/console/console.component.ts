import { Component } from '@angular/core';
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
export class ConsoleComponent {
  command = '';
  history: ConsoleHistoryDto[] = []; // Lista de comandos e respostas

  constructor(private commandService: CommandService) {}

  onKey(event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      this.command = this.command.slice(0, -1);
    } else if (event.key.length === 1) {
      this.command += event.key.toUpperCase();
    } else if (event.key === "Enter") {
      const endpointOption = this.detectEndpoint(this.command);
      if (endpointOption === 0) {
        this.callAnonymous();
      } else if (endpointOption > 0) {
        this.callCommands();
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

    return 1;
  }

  callAnonymous() {
    const anonymous: AnonymousDto = {
      content: this.command
    };

    this.commandService.sendAnonymousCommand(anonymous).subscribe((res: DefaultResponseDto) => {
      //adiciona mensagem de login
      if(res.messages && res.messages[0] ==="logged"){
        this.addLoginTreat(res.messages);
        return;
      }
      const responseMessages = res.messages?.join('<br/>') || ''; // Concatena mensagens
      const responseErrors = res.errors?.join('<br/>') || ''; // Concatena erros
      const response = responseMessages + (responseErrors ? '<br/>' + responseErrors : '');
      // Adiciona a entrada de histórico
      this.history.push({ command: this.command, response: response });

      // Limpa o comando atual
      this.command = '';

    }, (err: any) => {
      console.error(err); // Tratamento de erro
    });
  }

  addLoginTreat(res:string[]){
    localStorage.setItem('key',res[3]);
    localStorage.setItem('id',res[2]);
    const responseMessages = res[1]; // Concatena mensagens
    const response = responseMessages;
    // Adiciona a entrada de histórico
    this.history.push({ command: this.command, response: response });
    // Limpa o comando atual
    this.command = '';
  }

  callCommands() {
    debugger;
    const id = localStorage.getItem('id');
    if(!id) return;

    const command:CommandDto={
      content:this.command,
      userId: parseInt(id)
    }

    this.commandService.sendCommand(command).subscribe((res:DefaultResponseDto)=>{
      const responseMessages = res.messages?.join('<br/>') || ''; // Concatena mensagens
      const responseErrors = res.errors?.join('<br/>') || ''; // Concatena erros
      const response = responseMessages + (responseErrors ? '<br/>' + responseErrors : '');
      // Adiciona a entrada de histórico
      this.history.push({ command: this.command, response: response });

      // Limpa o comando atual
      this.command = '';
    },(error:any)=>{

    })
  }
}
