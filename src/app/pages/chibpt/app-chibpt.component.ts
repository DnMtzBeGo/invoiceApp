import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-app-chibpt',
  templateUrl: './app-chibpt.component.html',
  styleUrls: ['./app-chibpt.component.scss']
})
export class AppChibptComponent {
  @Input() chatId: string = '';
  public isHistoryHidden: boolean = false;

  constructor() {}

  toggleHistory() {
    this.isHistoryHidden = !this.isHistoryHidden;
  }

  loadChat(chatId: string) {
    this.chatId = chatId;
  }
}
