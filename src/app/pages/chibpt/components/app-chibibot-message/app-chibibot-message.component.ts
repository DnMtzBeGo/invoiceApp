import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Component({
  selector: 'app-app-chibibot-message',
  templateUrl: './app-chibibot-message.component.html',
  styleUrls: ['./app-chibibot-message.component.scss'],
  animations: [
    trigger('fadeIn', [
      state(
        'void',
        style({
          opacity: 0
        })
      ),
      state(
        '*',
        style({
          opacity: 1
        })
      ),
      transition(':enter', [animate('0.75s ease-in')])
    ])
  ]
})
export class AppChibibotMessageComponent implements OnInit {
  @Input() message: string;
  @Input() image: string = '';
  @Input() loader: boolean = false;
  formattedString: SafeHtml;

  loadingImage: boolean = true;
  errorImage: boolean = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    if (this.loader) return;

    this.formattedString = this.sanitizer.bypassSecurityTrustHtml(this.message.replace(/\n/g, '<br>'));
  }

  onLoad() {
    this.loadingImage = false;
  }
  onError() {
    this.loadingImage = false;
    this.errorImage = true;
  }
}
