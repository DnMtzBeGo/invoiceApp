import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<MessagesModalComponent>,
    private webService: AuthService,
    private notificationsService: NotificationsService
  ) {}

  async ngOnInit() {
    await this.getNotes(this.data._id);
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
