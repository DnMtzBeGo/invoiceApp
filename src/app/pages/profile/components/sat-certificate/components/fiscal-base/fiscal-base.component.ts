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
    this.sanitizer = this.injector.get(DomSanitizer);
    this.fiscalDocumentsService = this.injector.get(FiscalDocumentsService);
    this.translateService = this.injector.get(TranslateService);

    this.fiscalDocumentsService.fileInfo = this.fiscalDocumentsService.getDocumentTypes();

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

  setSelectedFile(file: File, input?: any): void {
    if (file) {
      let updateFileInfo = { ...this.fiscalDocumentsService.fileInfo[this.fileIndex] };
      const extension = /[^.]+$/.exec(file.name)![0];
      const fileName = updateFileInfo.key + '.' + extension;

      const prevSrc = updateFileInfo.src;

      updateFileInfo = {
        ...updateFileInfo,
        src: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)),
        file,
        extension,
        fileName,
        fileIsSelected: !updateFileInfo.fileIsSelected ? true : false,
        prevSrc,
        fileNeedsUpdate: true
      };

      if (input) this.fiscalDocumentsService.fileInputs[this.fileIndex] = input;

      const hierarchies = this.filesUploaded.map((e) => e.hierarchy || 0);
      updateFileInfo.hierarchy = hierarchies.reduce((a, b) => (a > b ? a : b), hierarchies[0]) + 1;

      Object.assign(this.fiscalDocumentsService.fileInfo[this.fileIndex], updateFileInfo);

      this.fiscalDocumentsService.addFile(this.fiscalDocumentsService.fileInfo[this.fileIndex]);
    }
  }

  uploadFile(file: File, input?: any): void {
    //copy of fileInfo

    this.setSelectedFile(file, input);

    this.fiscalDocumentsService
      .sendFiles()
      .then((progressObserver: any) => {
        // this.fiscalDocumentsService.fileInfo.uploadFileStatus.uploadRequest
        this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus!.uploadRequest = progressObserver.subscribe((resp: any) => {
          //if file was uploaded successfully
          if (resp.type === HttpEventType.Response) {
            setTimeout(async () => {
              if (this.afterFileUploaded) {
                await this.afterFileUploaded();
              }

              this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus!.documentIsBeingUploaded = false;
              this.onFileUploaded.emit();
            }, 600);
          }

          //if file upload is in progress
          if (resp.type === HttpEventType.UploadProgress) {
            this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus!.documentIsBeingUploaded = true;

            //File upload just started
            if (!this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus?.firstTime) {
              this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus!.firstTime = performance.now();
              this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus!.currentPercentage = 0;

              this.updateMissingFiles.emit();
            }
            this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus!.currentTime = performance.now();
            this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus!.lastPercentage =
              this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus?.currentPercentage;
            this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus!.currentPercentage = Math.round(
              (100 * resp.loaded) / resp.total
            );

            const timeElapsed =
              (this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus!.currentTime -
                this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus!.firstTime) /
              1000;

            this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus!.missingSecs = Math.round(
              ((100 - this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus!.currentPercentage) * timeElapsed) /
                this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus!.currentPercentage
            );
          }
        });
      })
      .catch((e) => {
        console.log('An error ocurred uploading new file', e.message);
      });
  }

  async deleteFile() {
    const { key, text } = this.fiscalDocumentsService.fileInfo[this.fileIndex];
    this.fiscalDocumentsService.deleteFile(key);
    this.fiscalDocumentsService.fileInfo[this.fileIndex] = { key, text, uploadFileStatus: {} };
    this.onFileDeleted.emit();
  }

  openFile() {
    window.open(this.fiscalDocumentsService.fileInfo[this.fileIndex].src?.toString());
  }

  cancelRequest() {
    this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus?.uploadRequest?.unsubscribe();
    this.fiscalDocumentsService.fileInfo[this.fileIndex].fileIsSelected = false;
    this.fiscalDocumentsService.fileInfo[this.fileIndex].uploadFileStatus!.documentIsBeingUploaded = false;
    this.onFileDeleted.emit();

    this.updateMissingFiles.emit();
  }

  emptySelectedFiles() {
    this.fiscalDocumentsService.fileInfo = [];
  }
}
