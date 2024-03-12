import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/shared/services/auth.service';

interface DialogLang {
  selected: string;
}

interface Message {
  tags_ids: string[];
  sms: boolean;
  app: boolean;
  message: string;
  title: string;
}

interface DialogData {
  tag_id: string;
  tag_name: string;
}

@Component({
  selector: 'app-send-message-modal',
  templateUrl: './send-message-modal.component.html',
  styleUrls: ['./send-message-modal.component.scss']
})
export class SendMessageModalComponent implements OnInit, AfterViewInit {
  @ViewChild('firstInput', { static: false, read: ElementRef }) firstInput: ElementRef;

  public sendMessageForm: FormGroup;
  public lang: DialogLang;
  public sendButtonDisabled: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialogRef: MatDialogRef<SendMessageModalComponent>,
    private readonly apiService: AuthService,
    private readonly translateService: TranslateService
  ) {
    this.setLang();
  }

  ngOnInit() {
    this.sendMessageForm = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.minLength(1)]),
      message: new FormControl('', [Validators.required]),
      type: new FormControl('SMS', [Validators.required])
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.firstInput.nativeElement.focus();
    }, 500);
  }

  setLang(): SendMessageModalComponent {
    this.lang = {
      selected: 'es'
    };

    return this;
  }

  public translate(word: string, type: string): string {
    return this.translateService.instant(type === 'paginator' ? `${type}.${word}` : `tags.${type}.${word}`);
  }

  public async send(): Promise<void> {
    if (this.sendMessageForm.valid) {
      this.disableSend();

      const { controls } = this.sendMessageForm;

      const message: Message = {
        tags_ids: [this.data.tag_id],
        sms: controls['type'].value === 'sms',
        app: controls['type'].value === 'push',
        title: controls['title'].value,
        message: controls['message'].value
      };

      (await this.apiService.apiRest(JSON.stringify(message), `managers_tags/send_notification`, { apiVersion: 'v1.1' })).subscribe({
        next: (data) => {
          console.log(data);
          this.enableSend();
        },
        error: (error: any) => {
          console.log('saving tag', error);
          this.enableSend();
        }
      });
    }
  }

  private disableSend(): void {
    this.sendButtonDisabled = false;
  }

  private enableSend(): void {
    this.sendButtonDisabled = true;
  }

  public getError(controlName: string, errorName: string): boolean {
    return this.sendMessageForm.controls[controlName].hasError(errorName);
  }

  public close() {
    this.dialogRef.close();
  }
}
