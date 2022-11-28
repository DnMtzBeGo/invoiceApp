import { Component, ElementRef, QueryList, ViewChild, ViewChildren, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FiscalDocumentsService } from './services/fiscal-documents.service';
import { FileInfo } from './interfaces/FileInfo';
import { DomSanitizer } from '@angular/platform-browser';
// import { variables } from 'src/variables.js';
import { AnimationOptions } from 'ngx-lottie';
import { FiscalDocumentItemComponent } from './components/fiscal-document-item/fiscal-document-item.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { TranslateService } from '@ngx-translate/core';

type FileInterfaceFormats = 'cards' | 'list';
@Component({
  selector: 'app-upload-fiscal-docs',
  templateUrl: './upload-fiscal-docs.component.html',
  styleUrls: ['./upload-fiscal-docs.component.scss'],
  providers:  [FiscalDocumentsService]
})
export class UploadFiscalDocsComponent implements OnInit {
  selectedFormat: FileInterfaceFormats = 'cards';
  documentsToUpload!: FileInfo[];
  userType: string = 'carriers';
  fiscalDocSelected!: any;

  showImgTest: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('uploadFilesBar') uploadFilesBar!: ElementRef;
  @ViewChild('fiscalDocsPage') fiscalDocsPage!: ElementRef;
  @ViewChildren('fiscalItems') fiscalItems!: QueryList<FiscalDocumentItemComponent>;
  @ViewChildren('fiscalCards') fiscalCards!: QueryList<FiscalDocumentItemComponent>;

  dropdownSelectedDoc!: FileInfo;

  dropEventListenerAdded!: boolean;
  missingFiles: Array<any> = [];

  dropEvent(event: any) {
    event.preventDefault();
    console.log('drop prevented');
  }

  constructor(
    @Inject(FiscalDocumentsService) public fiscalDocumentsService: FiscalDocumentsService,
    private sanitizer: DomSanitizer,
    private alertService: AlertService,
    private translateService: TranslateService,
    public route: ActivatedRoute
  ) { }

  /**
   * Function that helps refresh the list of files that
   * have been uploaded in the server
   */
  refreshDocumentsToUpload(): void {
    const atLeastOneFileIsUpdating =
      this.fiscalCards?.filter((e) => e.fileInfo.uploadFileStatus?.documentIsBeingUploaded == true).length >= 1;

    if (!atLeastOneFileIsUpdating) {
      this.fiscalDocumentsService.getFilesList(this.userType, this.documentsToUpload).then((result: FileInfo[]) => {
        this.documentsToUpload = result;
        //console.log('Documents to upload: ', this.documentsToUpload);

        this.updateMissingFiles();
        this.updateFiscalDocSelected(this.missingFiles[0]?.key);
      });
    }
  }

  getSortedFilesList() {
    if (this.documentsToUpload) {
      return [...this.documentsToUpload].sort((a, b) => (b.hierarchy || -1) - (a.hierarchy || -1));
    }
    return [];
  }

  ngAfterViewChecked(): void {
    if (this.fiscalDocsPage && !this.dropEventListenerAdded) {
      this.dropEventListenerAdded = true;

      this.fiscalDocsPage.nativeElement.addEventListener('dragover', (event: any) => {
        event.preventDefault();
      });

      this.fiscalDocsPage.nativeElement.addEventListener('dragleave', (event: any) => {
        event.preventDefault();
      });

      this.fiscalDocsPage.nativeElement.addEventListener('drop', (event: any) => {
        event.preventDefault();
      });
    }
  }

  ngAfterComponentInit(): void {
    console.log('fiscal element ngAfterComponentInit : ', this.fiscalDocsPage.nativeElement);
  }

  filesUploaded() {
    return this.documentsToUpload.filter((e) => e.fileIsSelected);
  }

  updateMissingFiles(): void {
    this.missingFiles = this.documentsToUpload.filter((e) => {
      return !e.fileIsSelected && !e.uploadFileStatus?.documentIsBeingUploaded;
    });

    this.updateFiscalDocSelected(this.missingFiles[0]?.key);
  }

  setSelectedFormat(format: FileInterfaceFormats): void {
    this.selectedFormat = format;
  }

  dragFileBarChanged(file: any): void {
    const selectedItem = this.fiscalDocSelected;

    this.fiscalItems.find((e: any) => selectedItem == e.fileInfo.key)?.uploadFile(file);

    this.updateMissingFiles();
  }

  updateFiscalDocSelected(value: any): void {
    if (value) {
      this.fiscalDocSelected = value;
    }
  }

  /**
   * Notifies to backend the user is ready for his documentation to be checked
   */
  requestDocsVerification(): void {
    this.fiscalDocumentsService.requestVerification(this.userType).then(() => {
      this.alertService.create({
        title: this.translateService.instant('fiscal-documents.required-verification-modal.title'),
        body: this.translateService.instant('fiscal-documents.required-verification-modal.body'),
        handlers: [
          {
            text: 'OK',
            color: '#FFE000',
            action: async () => {
              this.alertService.close();
            }
          }
        ]
      });
    });
  }

  verificationRequestAvailable(): boolean {
    const resquestUnavailable = this.documentsToUpload
      .map((e: FileInfo) => {
        return e.fileIsSelected || e.fileIsOptional;
      })
      .some((e) => !e);

    return !resquestUnavailable;
  }

  ngOnInit(): void {
    this.fiscalDocumentsService.id = this.route.snapshot.queryParamMap.get('id') || null;

    this.refreshDocumentsToUpload();
  }
}
