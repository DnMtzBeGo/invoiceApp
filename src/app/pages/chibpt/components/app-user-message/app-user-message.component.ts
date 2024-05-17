import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-app-user-message',
  templateUrl: './app-user-message.component.html',
  styleUrls: ['./app-user-message.component.scss']
})
export class AppUserMessageComponent implements OnInit {
  @Input() message: string;
  @Input() file: string;
  @Input() format: string;
  profilePicture: SafeUrl = localStorage.getItem("profilePicture") ?? "/assets/images/user-outline.svg"
  formattedString: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.formattedString = this.sanitizer.bypassSecurityTrustHtml(this.message.replace(/\n/g,'<br>'));
  }
}

