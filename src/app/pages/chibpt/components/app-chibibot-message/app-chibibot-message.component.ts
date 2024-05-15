import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-app-chibibot-message',
  templateUrl: './app-chibibot-message.component.html',
  styleUrls: ['./app-chibibot-message.component.scss']
})
export class AppChibibotMessageComponent {

  @Input() message: string;

}
