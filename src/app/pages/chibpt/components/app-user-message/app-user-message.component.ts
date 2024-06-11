import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
  uploadedImageUrls: SafeUrl[] = []; // Array to store multiple image URLs
  formattedString: SafeHtml;
  @Input() files: File[] = [];
  //@Input() files: string[] = [];

  private defaultProfilePicture = "/assets/images/user-outline.svg";

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    const storedProfilePicture = localStorage.getItem("profilePicture");
    this.profilePicture = storedProfilePicture ? this.sanitizer.bypassSecurityTrustUrl(storedProfilePicture) : this.defaultProfilePicture;
    this.formattedString = this.sanitizer.bypassSecurityTrustHtml(this.message.replace(/\n/g,'<br>'));
  }

  /*
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.files) {
      this.loadUploadedImages();
    }
  }
  */

  onError() {
    this.profilePicture = this.defaultProfilePicture;
  }

  /*
  loadUploadedImages(){
    const imageExtensions = /\.(jpeg|jpg|gif|png|bmp|svg)$/i;
    this.uploadedImageUrls = this.files
      .filter(fileUrl => imageExtensions.test(fileUrl))
      .map(fileUrl => this.sanitizer.bypassSecurityTrustUrl(fileUrl));
    console.log('Filtered image URLs:', this.uploadedImageUrls);
  }
  */
}