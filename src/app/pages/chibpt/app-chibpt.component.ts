import { Component } from '@angular/core';

@Component({
  selector: 'app-app-chibpt',
  templateUrl: './app-chibpt.component.html',
  styleUrls: ['./app-chibpt.component.scss']
})
export class AppChibptComponent {
  public isHistoryHidden: boolean = false;

  constructor( ) {}

  toggleHistory() {
    this.isHistoryHidden = !this.isHistoryHidden;
  }

  loadChat(_id) {
    console.log('loading chat: ', _id);
  }
}
