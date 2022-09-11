import { Component, OnInit, Output, Input, EventEmitter, Injector, ViewChild, ElementRef } from '@angular/core';

import { FiscalDocumentsService } from '../../services/sat-certificate.service';
import { FileInfo } from '../../interfaces/FileInfo';
import { HttpEventType } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { BegoAlertHandler } from 'src/app/shared/components/bego-alert/BegoAlertHandlerInterface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-fiscal-base',
  templateUrl: './fiscal-base.component.html',
  styleUrls: ['./fiscal-base.component.scss']
})
export class FiscalBaseComponent implements OnInit {
  public fileInfo: FileInfo[];
  @Input() filesUploaded!: FileInfo[];

  @Output() onFileDeleted = new EventEmitter<any>();
  @Output() onFileUploaded = new EventEmitter<any>();
  @Output() updateMissingFiles = new EventEmitter<void>();

  @ViewChild('viewFile') viewFile!: ElementRef;

  sanitizer: DomSanitizer;
  fiscalDocumentsService: FiscalDocumentsService;
  deleteAlertOpen: boolean = false;
  translateService: TranslateService;

  deleteAlertHandlers!: BegoAlertHandler[];

  uploadStart!: number;

  fileIndex: number = -1;
  afterFileUploaded!: void | Function;

  constructor(public injector: Injector) {
    console.log('this.fileInfo', this.fileInfo);

    this.sanitizer = this.injector.get(DomSanitizer);
    this.fiscalDocumentsService = this.injector.get(FiscalDocumentsService);
    this.translateService = this.injector.get(TranslateService);

    this.fileInfo = this.fiscalDocumentsService.getDocumentTypes();

    this.deleteAlertHandlers = [
      {
        text: this.translateService.instant('fiscal-documents.cancel'),
        action: () => {
          this.deleteAlertOpen = false;
        }
      },
      {
        text: this.translateService.instant('fiscal-documents.remove-file'),
        color: '#ffbe00',
        action: async () => {
          await this.deleteFile();
          this.deleteAlertOpen = false;
        }
      }
    ];
  }

  ngOnInit(): void {}

  setSelectedFile(file: File): void {
    console.log('setSelectedFile', file);

    let updateFileInfo = { ...this.fileInfo[this.fileIndex] };
    const extension = /[^.]+$/.exec(file.name)![0];
    const fileName = updateFileInfo.key + '.' + extension;

    const prevSrc = updateFileInfo.src;
    updateFileInfo.src = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
    updateFileInfo.file = file;
    updateFileInfo.extension = extension;
    updateFileInfo.fileName = fileName;

    if (!updateFileInfo.fileIsSelected) {
      updateFileInfo.fileIsSelected = true;
    }

    updateFileInfo.prevSrc = prevSrc;
    updateFileInfo.fileNeedsUpdate = true;

    const hierarchies = this.filesUploaded.map((e) => e.hierarchy || 0);
    updateFileInfo.hierarchy = hierarchies.reduce((a, b) => (a > b ? a : b), hierarchies[0]) + 1;

    Object.assign(this.fileInfo[this.fileIndex], updateFileInfo);

    this.fiscalDocumentsService.addFile(this.fileInfo[this.fileIndex]);
  }

  uploadFile(file: File): void {
    //copy of fileInfo

    this.setSelectedFile(file);

    this.fiscalDocumentsService
      .sendFiles()
      .then((progressObserver: any) => {
        // this.fileInfo.uploadFileStatus.uploadRequest
        this.fileInfo[this.fileIndex].uploadFileStatus!.uploadRequest = progressObserver.subscribe((resp: any) => {
          //if file was uploaded successfully
          if (resp.type === HttpEventType.Response) {
            setTimeout(async () => {
              if (this.afterFileUploaded) {
                await this.afterFileUploaded();
              }

              this.fileInfo[this.fileIndex].uploadFileStatus!.documentIsBeingUploaded = false;
              this.onFileUploaded.emit();
            }, 600);
          }

          //if file upload is in progress
          if (resp.type === HttpEventType.UploadProgress) {
            this.fileInfo[this.fileIndex].uploadFileStatus!.documentIsBeingUploaded = true;

            //File upload just started
            if (!this.fileInfo[this.fileIndex].uploadFileStatus?.firstTime) {
              this.fileInfo[this.fileIndex].uploadFileStatus!.firstTime = performance.now();
              this.fileInfo[this.fileIndex].uploadFileStatus!.currentPercentage = 0;

              this.updateMissingFiles.emit();
            }
            this.fileInfo[this.fileIndex].uploadFileStatus!.currentTime = performance.now();
            this.fileInfo[this.fileIndex].uploadFileStatus!.lastPercentage =
              this.fileInfo[this.fileIndex].uploadFileStatus?.currentPercentage;
            this.fileInfo[this.fileIndex].uploadFileStatus!.currentPercentage = Math.round((100 * resp.loaded) / resp.total);

            const timeElapsed =
              (this.fileInfo[this.fileIndex].uploadFileStatus!.currentTime - this.fileInfo[this.fileIndex].uploadFileStatus!.firstTime) /
              1000;

            this.fileInfo[this.fileIndex].uploadFileStatus!.missingSecs = Math.round(
              ((100 - this.fileInfo[this.fileIndex].uploadFileStatus!.currentPercentage) * timeElapsed) /
                this.fileInfo[this.fileIndex].uploadFileStatus!.currentPercentage
            );
          }
        });
      })
      .catch((e) => {
        console.log('An error ocurred uploading new file', e.message);
      });
  }

  async deleteFile() {
    const { key, text } = this.fileInfo[this.fileIndex];
    this.fiscalDocumentsService.deleteFile(key);
    this.fileInfo[this.fileIndex] = { key, text, uploadFileStatus: {} };
    this.onFileDeleted.emit();
  }

  openFile() {
    window.open(this.fileInfo[this.fileIndex].src?.toString());
  }

  cancelRequest() {
    this.fileInfo[this.fileIndex].uploadFileStatus?.uploadRequest?.unsubscribe();
    this.fileInfo[this.fileIndex].fileIsSelected = false;
    this.fileInfo[this.fileIndex].uploadFileStatus!.documentIsBeingUploaded = false;
    this.onFileDeleted.emit();

    this.updateMissingFiles.emit();
  }
}
