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
  @Input() files: any = [];
  //@Input() files: string[] = [];

  profilePicture: SafeUrl;
  //uploadedImageUrls: SafeUrl[] = []; // Array to store multiple image URLs
  formattedString: SafeHtml;
  imageFiles: any[] = [];
  pdfFiles: any[] = [];
  
  private defaultProfilePicture = "/assets/images/user-outline.svg";

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    const storedProfilePicture = localStorage.getItem("profilePicture");
    this.profilePicture = storedProfilePicture ? this.sanitizer.bypassSecurityTrustUrl(storedProfilePicture) : this.defaultProfilePicture;
    this.formattedString = this.sanitizer.bypassSecurityTrustHtml(this.message.replace(/\n/g,'<br>'));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.files?.currentValue) {
      this.classifyFiles();
    }
  }

  classifyFiles() {
    this.imageFiles = this.files.filter(file => file.type.startsWith('image/')).map(file => {
      if(!file.url){
        file.url = URL.createObjectURL(file);
        console.log("este es el archivo recien adjuntado con url temporal", this.file);
      }
      return file;
    });
    this.pdfFiles = this.files.filter(file => file.type === 'application/pdf');
    console.log("estos mson los opdfs owo", this.pdfFiles);
  }

  onError() {
    this.profilePicture = this.defaultProfilePicture;
  }

  ngOnDestroy() {
    this.imageFiles.forEach(file => {
      if (!file.url) {
        URL.revokeObjectURL(file);
      }
    });
  }
}