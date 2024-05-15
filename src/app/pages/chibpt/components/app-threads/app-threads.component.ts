import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-app-threads',
  templateUrl: './app-threads.component.html',
  styleUrls: ['./app-threads.component.scss']
})
export class AppThreadsComponent  {
  /*
  @Input() messages: { role: string, content: string }[] = [];
  */

  private conversationId: string | null = null;

  messageToSend: string = '';
  messages: any[] = [];  

  constructor( private authService: AuthService ) { }

  async createChat() {
    console.log('este es el m,ensaje', this.messageToSend);
    if(!this.conversationId) {
      console.log('we are in if conditional and conversationiId is empty');
      const body = { "message": this.messageToSend };
      console.log('tyhis is the first body!!!!!', body);
      (await this.authService.apiRest(JSON.stringify(body), 'assistant/start_chat', {apiVersion: 'v1.1'})).subscribe(
        {next: (response) => {
          this.messages.push({ role: 'user', content: this.messageToSend });
          this.messages.push({ role: response.result.role, content: response.result.content });
          this.messageToSend = "";
          //hasta aca
          this.conversationId = response.result.conversation_id;
  
          console.log('este es el id owo', this.conversationId);
          console.log('this is the response of chatGPT OwO', response);
          console.log(this.messages);
        },
        error: (error) => {
          console.error('Error sending mssg U.U', error);
        }
      }
      )
    } else {
      console.log('we are inside else conditional and we have a conversation id !!!! owo');
      const body = { "message": this.messageToSend };
      const url = `assistant/chat/${this.conversationId}`;
      (await this.authService.apiRestPut(JSON.stringify(body), url, {apiVersion: 'v1.1'})).subscribe(
        {next: (response) => {
          this.messages.push({ role: 'user', content: this.messageToSend });
          this.messages.push({ role: response.result.role, content: response.result.content });
         // this.conversationId = response.result.conversation_id;
          this.messageToSend = "";
  
          //console.log('este es el id owo', this.conversationId);
          console.log('this is the response of chatGPT OwO', response);
          console.log(this.messages);

        },
        error: (error) => {
          console.error('Error sending mssg u.u', error);
        }
      }
      )

    }

  }

  /*
  logMessages() {
    console.log('this is messages[s] content OwO:', this.messages);
  }
  */

  /*
  getMessageComponentType(role: string) {
    return role === 'assistant' ? 'app-app-chibibot-message' : 'app-app-user-message';
    console.log('estamos dentrode get messg component type');
   
    
  }
  */
}
