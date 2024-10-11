import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { AnonymousDto } from '../interfaces/AnonymousDto';
import { CommandDto } from '../interfaces/CommandDto';
import { DefaultResponseDto } from '../interfaces/DefaultResponseDto';

@Injectable({
  providedIn: 'root'
})
export class CommandService {

  private baseUrl = 'https://localhost:7206/Process'; // ajuste para o seu domínio da API

  constructor(private http: HttpClient) { }

  // Método para enviar o POST request para o endpoint
  sendAnonymousCommand(anonymous: AnonymousDto): Observable<DefaultResponseDto> {
    const url = `${this.baseUrl}/anonymous`; // o endpoint
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
  
    return this.http.post<any>(url, anonymous, { headers }).pipe(
      map((response:DefaultResponseDto) => {
        return {
          errors: response.errors || null,
          messages: response.messages || null
        } as DefaultResponseDto;
      })
    );
  }

  sendCommand(anonymous: CommandDto): Observable<DefaultResponseDto> {
    const url = `${this.baseUrl}/command`; // o endpoint
    const key = localStorage.getItem('key')?.toString();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key || ''}`
    });
  
    return this.http.post<any>(url, anonymous, { headers }).pipe(
      map((response:DefaultResponseDto) => {
        return {
          errors: response.errors || null,
          messages: response.messages || null
        } as DefaultResponseDto;
      })
    );
  }


}






