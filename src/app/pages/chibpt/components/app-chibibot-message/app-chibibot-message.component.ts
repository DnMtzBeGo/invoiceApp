import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
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
  @Input() public message: string;
  @Input() public image: string = '';
  @Input() public loader: boolean = false;
  public formattedString: SafeHtml;

  public loadingImage: boolean = true;
  public errorImage: boolean = false;

  constructor(private sanitizer: DomSanitizer) {}

  public async ngOnInit(): Promise<void> {
    if (this.loader) return;

    const messageString = this.message;
    const rawHtml = await marked(messageString);
    const cleanHtml = this.sanitizer.sanitize(SecurityContext.HTML, rawHtml) || '';

    this.formattedString = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);

   //this.formattedString = this.sanitizer.bypassSecurityTrustHtml(this.message.replace(/\n/g, '<br>'));
  }

  public onLoad(): void  {
    this.loadingImage = false;
  }
  public onError(): void {
    this.loadingImage = false;
    this.errorImage = true;
  }
}
