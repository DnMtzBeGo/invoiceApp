import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChibiptService {
  sendingMessage: boolean = false;

  sendNewHistorySub = new Subject();
  sendNewHistorySub$ = this.sendNewHistorySub.asObservable();
  createNewChatSub = new Subject();
  createNewChatSub$ = this.createNewChatSub.asObservable();

  constructor() {}

  addNewHistory(history) {
    this.sendNewHistorySub.next(history);
  }

  createNewChat() {
    this.createNewChatSub.next();
  }
}
