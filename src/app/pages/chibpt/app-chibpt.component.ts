import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-app-chibpt',
  templateUrl: './app-chibpt.component.html',
  styleUrls: ['./app-chibpt.component.scss']
})
export class AppChibptComponent {
  private chatStartEndpoint = 'https://rocket.bego.ai/v1.1/assistant/start_chat';
  private chatEndpoint = 'https://rocket.bego.ai/v1.1/assistant/chat';

  private conversationId: string | null = null;

  constructor( private http: HttpClient ) {}

  messageToSend: string = '';
  messages: any[] = [];   //*tipar esto !!!!!!!!!

  sendMessage() {
    console.log('este es el m,ensaje', this.messageToSend);

    if(!this.conversationId){
      console.log('we are in if conditional and conversationiId is empty');

      // este es para el primer mensaje 
      const body = { "message": this.messageToSend };
      //desde aqui
      const headers = new HttpHeaders({
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjYxMjY3YmRkMzQ0NjNiMDA0MjcyMzRjNSIsImVtYWlsIjoiY2FybG9zKzJAYmVnby5haSIsInRlbGVwaG9uZSI6Iis1MjU1MTIyMjIzNzEiLCJyb2xlIjoiY2FycmllcnMiLCJ0eXBlIjoiY2FycmllcnMifSwiaWF0IjoxNzA5NzYyMzYwfQ.Bb3jba7-CjtjFqK393bIMzZF5FsLvh0V8YyjRXkeoiA',
        'Content-Type': 'application/json'
      });
  
      console.log('tyhis is the first body!!!!!', body)
      this.http.post<any>(this.chatStartEndpoint, body, { headers }).subscribe(
        response => {
          this.messages.push({ role: 'user', content: this.messageToSend });
          this.messages.push({ role: response.result.role, content: response.result.content });
          this.messageToSend = "";
          //hasta aca
          this.conversationId = response.result.conversation_id;
  
          console.log('este es el id owo', this.conversationId);
          console.log('this is the response of chatGPT OwO', response);
          console.log(this.messages);
          
        },
        error => {
          console.error('Error sending mssg U.U', error);
        }
      );
      //aqui aca=ba para mandar primer mensaje
    } else {
      console.log('we are inside else conditional and we have a conversation id !!!! owo');
      const body = { "message": this.messageToSend };
      const url = `${this.chatEndpoint}/${this.conversationId}`;
      const headers = new HttpHeaders({
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjYxMjY3YmRkMzQ0NjNiMDA0MjcyMzRjNSIsImVtYWlsIjoiY2FybG9zKzJAYmVnby5haSIsInRlbGVwaG9uZSI6Iis1MjU1MTIyMjIzNzEiLCJyb2xlIjoiY2FycmllcnMiLCJ0eXBlIjoiY2FycmllcnMifSwiaWF0IjoxNzA5NzYyMzYwfQ.Bb3jba7-CjtjFqK393bIMzZF5FsLvh0V8YyjRXkeoiA',
        'Content-Type': 'application/json'
      });
      this.http.put<any>(url, body, { headers }).subscribe(
        response => {
          this.messages.push({ role: 'user', content: this.messageToSend });
          this.messages.push({ role: response.result.role, content: response.result.content });
         // this.conversationId = response.result.conversation_id;
          this.messageToSend = "";
  
          //console.log('este es el id owo', this.conversationId);
          console.log('this is the response of chatGPT OwO', response);
          console.log(this.messages);
          
        },
        error => {
          console.error('Error sending mssg U.U', error);
        }
      );
    }

  }
}
