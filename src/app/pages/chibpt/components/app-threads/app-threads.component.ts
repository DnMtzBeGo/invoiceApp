import { Component } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-app-threads',
  templateUrl: './app-threads.component.html',
  styleUrls: ['./app-threads.component.scss']
})
export class AppThreadsComponent  {

  private conversationId: string | null = null;

  messageToSend: string = '';
  messages: any[] = [];  

  constructor( private authService: AuthService ) { }

  async createChat(userInput) {
    this.messageToSend = userInput.message;
    const files=userInput.files;

    if(!this.conversationId) {
      const body = { "message": this.messageToSend };
      (await this.authService.apiRest(JSON.stringify(body), 'assistant', {apiVersion: 'v1.1'})).subscribe(
        {next: (response) => {
          this.messages.push({ role: 'user', content: this.messageToSend, files });
          this.messages.push({ role: response.result.role, content: response.result.content });
          this.messageToSend = "";
          this.conversationId = response.result.conversation_id;
        },
        error: (error) => {
          console.error('Error sending message', error);
        }
      }
      )
    } else {
      const body = { "message": this.messageToSend };
      const url = `assistant/${this.conversationId}`;
      (await this.authService.apiRestPut(JSON.stringify(body), url, {apiVersion: 'v1.1'})).subscribe(
        {next: (response) => {
          this.messages.push({ role: 'user', content: this.messageToSend, files });
          this.messages.push({ role: response.result.role, content: response.result.content });
          this.messageToSend = "";
        },
        error: (error) => {
          console.error('Error sending message', error);
        }
      }
      )
    }
  }
}
