import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-app-user-message',
  templateUrl: './app-user-message.component.html',
  styleUrls: ['./app-user-message.component.scss']
})
export class AppUserMessageComponent {
  @Input() message: string;

}
