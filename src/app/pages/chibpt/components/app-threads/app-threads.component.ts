import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-app-threads',
  templateUrl: './app-threads.component.html',
  styleUrls: ['./app-threads.component.scss']
})
export class AppThreadsComponent {
  @Input() messages: {sender:string, content: string }[] = [];

  getMessageComponentType(sender: string) {
    return sender === 'bot' ? 'app-app-chibibot-message' : 'app-app-user-message';
  }
}
