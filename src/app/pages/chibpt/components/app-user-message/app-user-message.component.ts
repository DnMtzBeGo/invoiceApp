import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-app-user-message',
  templateUrl: './app-user-message.component.html',
  styleUrls: ['./app-user-message.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('void', style({
        opacity: 0,
      })),
      state('*', style({
        opacity: 1,
      })),
      transition(':enter', [
        animate('0.75s ease-in')
      ])
    ])
  ]
})
export class AppUserMessageComponent implements OnInit {
  @Input() message: string;
  @Input() file: string;
  @Input() format: string;
  //profilePicture: SafeUrl = localStorage.getItem("profilePicture") ?? "/assets/images/user-outline.svg";
  profilePicture: SafeUrl;
  formattedString: SafeHtml;
  @Input() files: File[] = [];

  private defaultProfilePicture = "/assets/images/user-outline.svg";

  constructor(private sanitizer: DomSanitizer) {
    //this.profilePicture = "/assets/images/user-outline.svg";
  }

  ngOnInit() {
    const storedProfilePicture = localStorage.getItem("profilePicture");
    this.profilePicture = storedProfilePicture ? this.sanitizer.bypassSecurityTrustUrl(storedProfilePicture) : this.defaultProfilePicture;

    this.formattedString = this.sanitizer.bypassSecurityTrustHtml(this.message.replace(/\n/g,'<br>'));
   
  }

  onError() {
    this.profilePicture = this.defaultProfilePicture;
  }
}