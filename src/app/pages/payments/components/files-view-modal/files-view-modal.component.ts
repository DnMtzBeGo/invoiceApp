import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-files-view-modal',
  templateUrl: './files-view-modal.component.html',
  styleUrls: ['./files-view-modal.component.scss']
})
export class FilesViewModalComponent implements OnInit {
  files: any[] = [];

  fileInfo: any = null;
  order_number: string = '';
  reference_number: string = '';
  total_upfronts: string = '';
  lang: any;
  size: string = 'extra-small';

  hand_information: any = {
    file: null,
    amount: null
  };

  templat_text: any = {
    title: "",
    subtitle: ""
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<FilesViewModalComponent>) {
    this.lang = {
      name: 'File Name',
      labelBrowse: 'Browse your file',
      labelOr: 'or',
      btnBrowse: 'Choose File',
      labelMax: 'max',
      uploading: 'Uploading...'
    };
    this.files = this.data?.[this.data?.modal_key];
    this.templat_text.title = 'payments.'+this.data?.modal_key+'.title';
    this.templat_text.subtitle = 'payments.'+this.data?.modal_key+'.subtitle';
  }

  ngOnInit(): void {}

  onIconClick(data: any) {
    if (data.iconName === 'begon-eye') {
      this.openFileInNewTab(this.data?.[this.data.modal_key][data.position].url, this.data?.[this.data.modal_key][data.position].type);
    }
  }

  openFileInNewTab(fileUrl: string, type: string): void {
    const supportedFileTypes = ['image/*', 'txt', 'doc', 'docx', 'pdf', 'csv', 'xlsx', 'xls', 'png', 'jpg', 'jpeg'];
    const fileExtension = type.startsWith('image/') ? type.split('/').pop()?.toLowerCase() : type.toLowerCase();
    const isFileTypeSupported = supportedFileTypes.some((supportedType) =>
      supportedType === 'image/*' ? type.startsWith('image/') : supportedType === fileExtension
    );
    if (isFileTypeSupported) {
      window.open(fileUrl, '_blank');
    } else {
      console.log('Unsupported file type.');
      //this.notificationToast.showErrorToastr('Unsupported file type.');
    }
  }

  close(edited: string = '') {
    this.dialogRef.close(edited);
  }
}
