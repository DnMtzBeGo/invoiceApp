import { Component, OnInit, Input } from '@angular/core';
import { ChatMsg } from 'src/app/shared/components/chat-message/chat-message.model';

@Component({
  selector: 'bego-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent implements OnInit {
  @Input() msg?: ChatMsg;
  @Input() align: 'left' | 'right' = 'left';
  @Input() sublabel: string = '';

  constructor() {}

  ngOnInit(): void {}

  onPicError(event: any) {
    event.avatar = '../../../../assets/images/avatar-outline.svg';
  }
}
