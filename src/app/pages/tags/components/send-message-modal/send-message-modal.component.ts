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

  public typeForm: FormGroup;
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
      message: new FormControl('', [Validators.required])
    });

    this.typeForm = new FormGroup({ sms: new FormControl(true), push: new FormControl('') });
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
      const { controls } = this.sendMessageForm;
      const { controls: typeControls } = this.typeForm;

      if (typeControls['sms'].value || typeControls['sms'].value) {
        this.disableSend();
        const message: Message = {
          tags_ids: [this.data.tag_id],
          sms: typeControls['sms'].value,
          app: typeControls['push'].value,
          title: controls['title'].value,
          message: controls['message'].value
        };

        (await this.apiService.apiRest(JSON.stringify(message), `managers_tags/send_notification`, { apiVersion: 'v1.1' })).subscribe({
          next: (data) => {
            this.close(true);
          },
          error: (error: any) => {
            console.log('saving tag', error);
          },
          complete: () => {
            this.enableSend();
          }
        });
      }
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

  public getTypeCheckboxError(): boolean {
    if (this.typeForm.controls) return !this.typeForm.controls['sms'].value && !this.typeForm.controls['sms'].value;
  }

  public close(sent: boolean = false) {
    this.dialogRef.close(sent);
  }
}
