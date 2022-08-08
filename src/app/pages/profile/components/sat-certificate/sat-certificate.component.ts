import { 
  Component, 
  OnInit, 
  ViewChild,
  ElementRef,
  Injector
} from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { FiscalDocumentsService } from './services/sat-certificate.service';
import { FileInfo } from './interfaces/FileInfo';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpEventType } from '@angular/common/http';
import { AnimationOptions } from 'ngx-lottie';
import { BegoAlertHandler } from 'src/app/shared/components/bego-alert/BegoAlertHandlerInterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sat-certificate',
  templateUrl: './sat-certificate.component.html',
  styleUrls: ['./sat-certificate.component.scss']
})
export class SatCertificateComponent implements OnInit {

  sanitizer: DomSanitizer;
  fiscalDocumentsService: FiscalDocumentsService;
  deleteAlertOpen: boolean = false;
  translateService: TranslateService;
  deleteAlertHandlers!: BegoAlertHandler[];
  documentsToUpload!: FileInfo[];

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('fiscalDocument') fiscalDocument!: ElementRef;

  filesToUploadSatCertificate: FileInfo[]  = [
    {
      text : 'Certificado del sello digital(.cer)',
      key:"CSD",
    },
    {
      text : 'Llave del sello digital(.key)',
      key:"key",
    }
  ];

  public formSatCertificate: any = new FormGroup({
    password: new FormControl("", Validators.required),
  });
  // fileSize = '0KB';
  // draggingToCard: boolean = false;
  // dropLottie: AnimationOptions = {
  //   path:'/assets/images/fiscal-documents/folder.json',
  // }

  // showMenu: boolean = false;
  // showCheckmarkComponent: boolean = false;

  // addFileEventListeners =  {
  //   dragOver: ( event: DragEvent ) => {
  //     this.draggingToCard = true;
  //     event.preventDefault();
  //     this.fiscalDocument.nativeElement.classList.add('dragging-file');
  //   },

  //   dragLeave: ( event: DragEvent ) => {
  //     event.preventDefault();
  //     this.draggingToCard = false;
  //     this.fiscalDocument.nativeElement.classList.remove('dragging-file');

  //   },

  //   drop: ( event: any ) => {
  //     event.preventDefault();
  //     this.removeDragFileEventListener();
  //     const { files } = event.dataTransfer;
  //     this.draggingToCard = false;
  //     this.fiscalDocument.nativeElement.classList.remove('dragging-file');
  //     this.uploadFile(files[0]);

  //   }
  // }

  // fileUploadedEventListeners = {
  //   dragOver: ( event: any ) => {
  //     event.preventDefault();
  //     event.dataTransfer.dropEffect = 'none';

  //   }
  // }

  constructor(
    public injector: Injector
  ) { 
    // this.sanitizer = this.injector.get(DomSanitizer);
    // this.fiscalDocumentsService = this.injector.get(FiscalDocumentsService);
    // this.translateService = this.injector.get(TranslateService);
    // this.deleteAlertHandlers = [
    //   {
    //     text : this.translateService.instant('fiscal-documents.cancel'),
    //     action: ()=> {
    //       this.deleteAlertOpen = false;
    //     }
          
    //   },
    //   {
    //     text : this.translateService.instant('fiscal-documents.remove-file'),
    //     color: '#ffbe00',
    //     action: async ()=> {
    //       await this.deleteFile();
    //       this.deleteAlertOpen = false;
    //     }
          
    //   },
    // ];
  }

  ngOnInit(): void {
  }

  refreshDocumentsToUpload():void{

    // const atLeastOneFileIsUpdating = this.fiscalCards?.filter( 
    //   (e) => e.fileInfo.uploadFileStatus?.documentIsBeingUploaded == true ).length >= 1;
    // this.fiscalDocumentsService.getFilesList(this.userType, this.documentsToUpload)
    //   .then( ( result: FileInfo[] ) => {
      
    //     this.documentsToUpload = result;
    //     console.log('Documents to upload: ', this.documentsToUpload);

    //     this.updateMissingFiles();
    //     this.updateFiscalDocSelected(this.missingFiles[0]?.key)
    // });
  }

  // addDragFileEventListener():void{

  //   this.removeFileUploadedEventListeners();

  //   const card = this.fiscalDocument.nativeElement;

  //   card.addEventListener("dragover", this.addFileEventListeners.dragOver);
  //   card.addEventListener('dragleave', this.addFileEventListeners.dragLeave);
  //   card.addEventListener('drop', this.addFileEventListeners.drop);

  // }

  // removeDragFileEventListener():void{

  //   this.addFileUploadedEventListeners();

  //   const card = this.fiscalDocument.nativeElement;

  //   card.removeEventListener("dragover", this.addFileEventListeners.dragOver);
  //   card.removeEventListener('dragleave', this.addFileEventListeners.dragLeave);
  //   card.removeEventListener('drop', this.addFileEventListeners.drop);

  // }

  // addFileUploadedEventListeners():void{

  //   const card = this.fiscalDocument.nativeElement;

  //   card.addEventListener('dragover', this.fileUploadedEventListeners.dragOver);


  // }

  // removeFileUploadedEventListeners():void{

  //   const card = this.fiscalDocument.nativeElement;

  //   card.removeEventListener('dragover', this.fileUploadedEventListeners.dragOver);

  // }

  // onCardClicked(){
  //   if(!this.fileInfo.fileIsSelected){
  //     this.fileInput.nativeElement.click();
  //   }
  //   else if(!this.fileInfo.uploadFileStatus?.documentIsBeingUploaded){
  //     this.openFile();
  //   }
  // } 


  // afterFileUploaded = ():Promise<void> => {
  //   this.showCheckmarkComponent = true;
  //   return new Promise( ( resolve ) => {
  //     setTimeout(() => {
  //       console.log(' afterFileUploadedwaited 2 secs b4 moving on');
  //       this.showCheckmarkComponent = false;
  //       resolve();
  //     },2000);
  //   });
  // }

  // ngAfterViewInit():void{

  //   if(!this.fileInfo.fileIsSelected){
  //     this.addDragFileEventListener();
  //   }else{
  //     this.addFileUploadedEventListeners();
  //   }

  //   this.onFileDeleted.subscribe(() => {
  //     this.addDragFileEventListener();
  //   });
    
  // }


  // showOptionsMenu(event: MouseEvent ):void{
  //   event.stopPropagation();
  //   this.showMenu = true;

  //   document.addEventListener('click', () => {
  //     this.showMenu = false;
  //   },{
  //     capture : true,
  //     once: true,
  //   });

  // }

  // fileInputChanged(){
  //   const { files }   = this.fileInput.nativeElement;
  //   this.uploadFile(files[0]);
  // }

  // showFileUploadedAnimation(){
  //   this.showCheckmarkComponent = true;
  // }

  // uploadFile(file: File):void{

  //     //copy of fileInfo
  // let updateFileInfo = {...this.fileInfo};
  // const extension = /[^.]+$/.exec(file.name)![0];
  // const fileName = updateFileInfo.key + '.' + extension;

  // const prevSrc = updateFileInfo.src;
  // updateFileInfo.src = this.sanitizer.bypassSecurityTrustUrl( URL.createObjectURL(file) );
  // updateFileInfo.file = file;
  // updateFileInfo.extension = extension;
  // updateFileInfo.fileName = fileName;

  // if(!updateFileInfo.fileIsSelected){
  //   updateFileInfo.fileIsSelected = true;
  // }

  // updateFileInfo.prevSrc = prevSrc;
  // updateFileInfo.fileNeedsUpdate = true;

  // //getting the biggest hierarchy and then assigning a that val + 1 to new hierarchy
  // const hierarchies = this.filesUploaded.map(e => e.hierarchy || 0);
  // updateFileInfo.hierarchy = hierarchies.reduce((a,b)=>  a > b ? a : b ,hierarchies[0]) + 1;

  // Object.assign(this.fileInfo, updateFileInfo);


  // this.fiscalDocumentsService.addFile(updateFileInfo)
  // .then( ( progressObserver: any ) => {
  //   // this.fileInfo.uploadFileStatus.uploadRequest
  //   this.fileInfo.uploadFileStatus!.uploadRequest  = progressObserver.subscribe( ( resp: any )=> {

  //     //if file was uploaded successfully
  //     if (resp.type === HttpEventType.Response) {
  //       setTimeout(async ()=>{
  //         if(this.afterFileUploaded){
  //           await this.afterFileUploaded();
  //         }

  //         this.fileInfo.uploadFileStatus!.documentIsBeingUploaded = false;
  //         this.onFileUploaded.emit();

  //       },600);
  //     }

  //     //if file upload is in progress
  //     if (resp.type === HttpEventType.UploadProgress) {
  //         this.fileInfo.uploadFileStatus!.documentIsBeingUploaded = true;

  //         //File upload just started
  //         if(!this.fileInfo.uploadFileStatus?.firstTime){
  //           this.fileInfo.uploadFileStatus!.firstTime = performance.now();
  //           this.fileInfo.uploadFileStatus!.currentPercentage = 0;

  //           this.updateMissingFiles.emit();

  //         } 
  //         this.fileInfo.uploadFileStatus!.currentTime = performance.now();
  //         this.fileInfo.uploadFileStatus!.lastPercentage = this.fileInfo.uploadFileStatus?.currentPercentage;
  //         this.fileInfo.uploadFileStatus!.currentPercentage = Math.round(100 * resp.loaded / resp.total);

  //         const timeElapsed = (this.fileInfo.uploadFileStatus!.currentTime - this.fileInfo.uploadFileStatus!.firstTime)/1000;

  //         this.fileInfo.uploadFileStatus!.missingSecs = Math.round((100- this.fileInfo.uploadFileStatus!.currentPercentage) * timeElapsed / this.fileInfo.uploadFileStatus!.currentPercentage );

  //     } 
  //   });


  // })
  // .catch( (e) => {
  //   console.log('An error ocurred uploading new file', e.message );
  // });
  // }

  // async deleteFile(){
  //   const  fileName  = this.fileInfo.fileName || '';
  //   this.fiscalDocumentsService.deleteFile( fileName  ).then(( ) => {
  //     const {key,text } = this.fileInfo;
  //     this.fileInfo = {key, text,uploadFileStatus : {}};
  //     this.onFileDeleted.emit();
  //   });
  // }


  // openFile(){
  //   window.open(this.fileInfo.src?.toString());
  // }

  // cancelRequest(){
  //   this.fileInfo.uploadFileStatus?.uploadRequest?.unsubscribe();
  //   this.fileInfo.fileIsSelected = false;
  //   this.fileInfo.uploadFileStatus!.documentIsBeingUploaded = false;
  //   this.onFileDeleted.emit();

  //   this.updateMissingFiles.emit();
  // }
}
