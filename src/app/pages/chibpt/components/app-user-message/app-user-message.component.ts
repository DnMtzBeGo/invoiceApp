import { Component, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-app-user-message',
  templateUrl: './app-user-message.component.html',
  styleUrls: ['./app-user-message.component.scss']
})
export class AppUserMessageComponent {
  @Input() message: string;
  profilePicture: SafeUrl = localStorage.getItem("profilePicture") ?? "/assets/images/user-outline.svg"

}
