import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
@Component({
  selector: 'app-messages-modal',
  templateUrl: './messages-modal.component.html',
  styleUrls: ['./messages-modal.component.scss']
})
export class MessagesModalComponent implements OnInit {
  @ViewChild('scroll') scrollContainer: ElementRef;
  @ViewChild('text') textArea;

  notes: any[] = [];
  message: string = '';
  validated: boolean = false;
  loaderOnInit: boolean = true;
  private chatRef: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<MessagesModalComponent>,
    private webService: AuthService,
    private notificationsService: NotificationsService
  ) {}

  async ngOnInit() {
    await this.getNotes(this.data._id);
    this.chatRef = setInterval(() => {
      this.getNotes(this.data._id);
    }, 30000);
  }
  ngOnDestroy() {
    clearInterval(this.chatRef);
  }

  async getNotes(payment_id: string) {
    (await this.webService.apiRestGet(`carriers_payments/get_messages/`+payment_id, { apiVersion: 'v1.1'})).subscribe({
      next: ({ result }) => {
        this.loaderOnInit = false;
        this.notes = result;
        setTimeout(() => {
          this.scrollToBottom();
        }, 0);
      },
      error: (err) => {
        this.loaderOnInit = false;
        this.notificationsService.showErrorToastr('There was an error, try again later');
      }
    });
  }

  async addNote() {
    const message = this.message.trim();
    if (!message) return;
    const requestJson = JSON.stringify({ payment_id: this.data._id, message });

    (await this.webService.apiRestPut(requestJson, `carriers_payments/add_message`, { apiVersion: 'v1.1' })).subscribe({
      next: ({ result }) => {
        this.message = '';
        this.textArea.defaultValue = '';
        this.notes = [...this.notes, result];
        this.getNotes(this.data._id);
        
        setTimeout(() => {
          this.scrollToBottom();
        }, 0);
      },
      error: (err) => {
        this.notificationsService.showErrorToastr('There was an error, try again later');
      }
    });
  }

  private scrollToBottom(): void {
    const scrollContainer = this.scrollContainer.nativeElement;
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }

  getDataFromInput({ target }) {
    this.message = target.value;
  }

  close(uploaded: boolean) {
    this.dialogRef.close(uploaded);
  }
}
