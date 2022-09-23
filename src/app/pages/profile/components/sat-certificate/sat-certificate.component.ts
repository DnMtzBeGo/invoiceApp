import { Component, ElementRef, QueryList, ViewChild, ViewChildren, OnInit, Inject } from '@angular/core';
import { FiscalDocumentsService } from './services/sat-certificate.service';
import { FileInfo } from './interfaces/FileInfo';
import { DomSanitizer } from '@angular/platform-browser';
import { AnimationOptions } from 'ngx-lottie';
import { BegoAlertHandler } from 'src/app/shared/components/bego-alert/BegoAlertHandlerInterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FiscalDocumentCardComponent } from './components/fiscal-document-card/fiscal-document-card.component';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

type FileInterfaceFormats = 'cards' | 'list';

interface mainEmitterType {
  nombre: string;
  archivo_key: string;
  archivo_cer: string;
  regimen_fiscal: string;
  createdAt: string;
}

@Component({
  selector: 'app-sat-certificate',
  templateUrl: './sat-certificate.component.html',
  styleUrls: ['./sat-certificate.component.scss']
})
export class SatCertificateComponent implements OnInit {
  selectedFormat: FileInterfaceFormats = 'cards';
  documentsToUpload!: FileInfo[];
  userType: string = 'carriers';
  fiscalDocSelected!: any;

  mainEmitter: mainEmitterType;

  form: FormGroup;
  taxRegimes = [];

  selectedTaxRegime: string = '';
  archivo_key_pswd: string = '';

  showImgTest: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('uploadFilesBar') uploadFilesBar!: ElementRef;
  @ViewChild('fiscalDocsPage') fiscalDocsPage!: ElementRef;
  @ViewChildren('fiscalCards')
  fiscalCards!: QueryList<FiscalDocumentCardComponent>;

  selectionchange;

  dropdownSelectedDoc!: FileInfo;

  dropEventListenerAdded!: boolean;
  missingFiles: Array<any> = [];

  dropEvent(event: any) {
    event.preventDefault();
    console.log('drop prevented');
  }

  constructor(
    @Inject(FiscalDocumentsService)
    public fiscalDocumentsService: FiscalDocumentsService,
    private sanitizer: DomSanitizer,
    private alertService: AlertService,
    private translateService: TranslateService,
    public webService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.refreshDocumentsToUpload();
    this.fetchTaxRegimes();

    this.getUserMainEmitter();
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      tax_regime: [new FormControl(this.selectedTaxRegime), Validators.required],
      archivo_key_pswd: [new FormControl(this.archivo_key_pswd), Validators.required]
    });

    this.form.valueChanges.subscribe((values) => {
      this.updateAttributes(values);
    });
  }

  async getUserMainEmitter() {
    await (
      await this.webService.apiRest('', 'carriers/get_main_emitter')
    ).subscribe(
      ({ result }) => {
        this.mainEmitter = result;
        console.log(result);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  /**
   * Function that helps refresh the list of files that
   * have been uploaded in the server
   */
  refreshDocumentsToUpload(): void {
    this.documentsToUpload = this.fiscalDocumentsService.getDocumentTypes();
    this.updateMissingFiles();
    this.updateFiscalDocSelected(this.missingFiles[0]?.key);
    console.log('Documents to upload: ', this.documentsToUpload);
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
    console.log('dragFileBarChanged');
    const selectedItem = this.fiscalDocSelected;

    this.fiscalCards.find((e: any) => selectedItem == e.fileInfo.key)?.uploadFile(file);

    this.updateMissingFiles();
  }

  updateFiscalDocSelected(value: any): void {
    if (value) {
      this.fiscalDocSelected = value;
    }
  }

  updateAttributes(values) {
    values.email = localStorage.getItem('profileEmail');
    const keys = Object.keys(values);

    keys.forEach((k) => {
      console.log('updating', k, values[k]);
      this.fiscalDocumentsService.updateAttribute(k, values[k]);
    });
  }

  async fetchTaxRegimes() {
    const requestJson = {
      catalogs: [
        {
          name: 'sat_regimen_fiscal',
          version: '0'
        }
      ]
    };
    await (
      await this.webService.apiRest(JSON.stringify(requestJson), 'invoice/catalogs/fetch')
    ).subscribe(
      ({ result }) => {
        this.taxRegimes = result.catalogs[0].documents.map((item) => {
          const filteredItem = {
            text: item.code + ' - ' + item.description,
            value: item.code,
            fisica: item.fisica,
            moral: item.moral
          };
          return filteredItem;
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }
  async save() {
    console.log('saving....');

    if (this.form.valid) {
      const data = this.fiscalDocumentsService.formData;
      const files = [data.get('archivo_cer'), data.get('archivo_key')];

      if (files[0] && files[1]) {
        const ob = await this.fiscalDocumentsService.sendFiles();

        ob.subscribe((data: any) => {
          console.log(data);
        });
      } else {
        let error: string = '';
        if (!files[0] && !files[1]) error = 'Agregue los archivos de su sello de facturación';
        else if (!files[0]) error = 'Falta el archivo .cer';
        else if (!files[1]) error = 'Falta el archivo .key';

        alert(error);
      }
    }
  }

  // /**
  //  * Notifies to backend the user is ready for his documentation to be checked
  //  */
  // requestDocsVerification(): void {
  //   this.fiscalDocumentsService.requestVerification(this.userType).then(() => {
  //     this.alertService.create({
  //       title: this.translateService.instant(
  //         "fiscal-documents.required-verification-modal.title"
  //       ),
  //       body: this.translateService.instant(
  //         "fiscal-documents.required-verification-modal.body"
  //       ),
  //       handlers: [
  //         {
  //           text: "OK",
  //           color: "#ffbe00",
  //           action: async () => {
  //             this.alertService.close();
  //           },
  //         },
  //       ],
  //     });
  //   });
  // }

  // verificationRequestAvailable(): boolean {
  //   const resquestUnavailable = this.documentsToUpload
  //     .map((e: FileInfo) => {
  //       return e.fileIsSelected || e.fileIsOptional;
  //     })
  //     .some((e) => !e);

  //   return !resquestUnavailable;
  // }
}
