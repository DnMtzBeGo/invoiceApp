import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Component({
  selector: 'app-app-chibibot-message',
  templateUrl: './app-chibibot-message.component.html',
  styleUrls: ['./app-chibibot-message.component.scss']
})
export class AppChibibotMessageComponent implements OnInit {

  @Input() message: string;
  formattedString: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.formattedString = this.sanitizer.bypassSecurityTrustHtml(this.message.replace(/\n/g,'<br>'));
  }



}
