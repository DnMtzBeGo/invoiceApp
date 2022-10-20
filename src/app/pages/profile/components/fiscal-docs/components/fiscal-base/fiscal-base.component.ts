import { 
  Component, 
  OnInit, 
  Output, 
  Input, 
  EventEmitter, 
  Injector, 
  ViewChild, 
  ElementRef 
} from '@angular/core';

import { FiscalDocumentsService } from '../../services/fiscal-documents.service';
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

  sanitizer: DomSanitizer;
  fiscalDocumentsService: FiscalDocumentsService;
  deleteAlertOpen: boolean = false;
  translateService: TranslateService;

  deleteAlertHandlers!: BegoAlertHandler[];

  constructor(
    public injector: Injector,

  ) { 
    this.sanitizer = this.injector.get(DomSanitizer);
    this.fiscalDocumentsService = this.injector.get(FiscalDocumentsService);
    this.translateService = this.injector.get(TranslateService);


   this.deleteAlertHandlers = [
      {
        text : this.translateService.instant('fiscal-documents.cancel'),
        action: ()=> {
          this.deleteAlertOpen = false;
        }
          
      },
      {
        text : this.translateService.instant('fiscal-documents.remove-file'),
        color: '#FFE000',
        action: async ()=> {
          await this.deleteFile();
          this.deleteAlertOpen = false;
        }
          
      },
    ];

  }

  ngOnInit(): void {
  }



  uploadStart!: number;



  afterFileUploaded!: void | Function;

  @Input() fileInfo!: FileInfo;
  @Input() filesUploaded!: FileInfo[];

  @Output() onFileDeleted = new EventEmitter<any>();
  @Output() onFileUploaded = new EventEmitter<any>();
  @Output() updateMissingFiles = new EventEmitter<void>();

  @ViewChild('viewFile') viewFile!: ElementRef;


  uploadFile(file: File):void{

        //copy of fileInfo
    let updateFileInfo = {...this.fileInfo};
    const extension = /[^.]+$/.exec(file.name)![0];
    const fileName = updateFileInfo.key + '.' + extension;

    const prevSrc = updateFileInfo.src;
    updateFileInfo.src = this.sanitizer.bypassSecurityTrustUrl( URL.createObjectURL(file) );
    updateFileInfo.file = file;
    updateFileInfo.extension = extension;
    updateFileInfo.fileName = fileName;

    if(!updateFileInfo.fileIsSelected){
      updateFileInfo.fileIsSelected = true;
    }

    updateFileInfo.prevSrc = prevSrc;
    updateFileInfo.fileNeedsUpdate = true;

    //getting the biggest hierarchy and then assigning a that val + 1 to new hierarchy
    const hierarchies = this.filesUploaded.map(e => e.hierarchy || 0);
    updateFileInfo.hierarchy = hierarchies.reduce((a,b)=>  a > b ? a : b ,hierarchies[0]) + 1;
    
    Object.assign(this.fileInfo, updateFileInfo);


    this.fiscalDocumentsService.addFile(updateFileInfo)
    .then( ( progressObserver: any ) => {
      // this.fileInfo.uploadFileStatus.uploadRequest
      this.fileInfo.uploadFileStatus!.uploadRequest  = progressObserver.subscribe( ( resp: any )=> {

        //if file was uploaded successfully
        if (resp.type === HttpEventType.Response) {
          setTimeout(async ()=>{
            if(this.afterFileUploaded){
              await this.afterFileUploaded();
            }

            this.fileInfo.uploadFileStatus!.documentIsBeingUploaded = false;
            this.onFileUploaded.emit();

          },600);
        }

        //if file upload is in progress
        if (resp.type === HttpEventType.UploadProgress) {
            this.fileInfo.uploadFileStatus!.documentIsBeingUploaded = true;

            //File upload just started
            if(!this.fileInfo.uploadFileStatus?.firstTime){
              this.fileInfo.uploadFileStatus!.firstTime = performance.now();
              this.fileInfo.uploadFileStatus!.currentPercentage = 0;

              this.updateMissingFiles.emit();

            } 
            this.fileInfo.uploadFileStatus!.currentTime = performance.now();
            this.fileInfo.uploadFileStatus!.lastPercentage = this.fileInfo.uploadFileStatus?.currentPercentage;
            this.fileInfo.uploadFileStatus!.currentPercentage = Math.round(100 * resp.loaded / resp.total);

            const timeElapsed = (this.fileInfo.uploadFileStatus!.currentTime - this.fileInfo.uploadFileStatus!.firstTime)/1000;

            this.fileInfo.uploadFileStatus!.missingSecs = Math.round((100- this.fileInfo.uploadFileStatus!.currentPercentage) * timeElapsed / this.fileInfo.uploadFileStatus!.currentPercentage );

        } 
      });


    })
    .catch( (e) => {
      console.log('An error ocurred uploading new file', e.message );
    });
  }

  async deleteFile(){
    const  fileName  = this.fileInfo.fileName || '';
    this.fiscalDocumentsService.deleteFile( fileName  ).then(( ) => {
      const {key,text } = this.fileInfo;
      this.fileInfo = {key, text,uploadFileStatus : {}};
      this.onFileDeleted.emit();
    });
  }


  openFile(){
    window.open(this.fileInfo.src?.toString());
  }

  cancelRequest(){
    this.fileInfo.uploadFileStatus?.uploadRequest?.unsubscribe();
    this.fileInfo.fileIsSelected = false;
    this.fileInfo.uploadFileStatus!.documentIsBeingUploaded = false;
    this.onFileDeleted.emit();

    this.updateMissingFiles.emit();
  }
}
