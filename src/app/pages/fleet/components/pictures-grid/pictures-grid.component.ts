import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { UploadFilesComponent } from '../upload-files/upload-files.component';

export interface ReceviedPicture {
  file: File;
  //index of file in picture list
  i: number;
  //the dialog of the uplaodFiles component
  dialog?: any;
}

@Component({
  selector: 'app-pictures-grid',
  templateUrl: './pictures-grid.component.html',
  styleUrls: ['./pictures-grid.component.scss']
})
export class PicturesGridComponent implements OnInit {
  @Input() pictures: File[];
  @Input() obligatoryImgs: number;
  @Output() onFileInput = new EventEmitter<ReceviedPicture>();

  constructor(private matDialog: MatDialog) {}

  ngOnInit(): void {}

  openFileEditor(flag: boolean) {
    if (!flag) return;
    const dialog = this.matDialog.open(UploadFilesComponent, {
      data: {
        places: 5,
        obligatoryImages: this.obligatoryImgs,
        files: this.pictures,
        handleFileInput: (receivedPicture: ReceviedPicture) => {
          this.onFileInput.emit({ ...receivedPicture, dialog });
        }
      },
      backdropClass: ['brand-dialog-1', 'no-padding']
    });
  }
}
