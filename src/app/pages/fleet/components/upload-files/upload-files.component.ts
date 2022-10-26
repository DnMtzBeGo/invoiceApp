import { Component, Inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { url } from 'inspector';

export interface UploadFileInfo {
  url: string, 
  uploadPercentage?: number
}

export interface UploadFilesProps {
  places: number,
  obligatoryImages?: number,
  files: UploadFileInfo[],
  handleFileInput: (file: File)=>void
};



@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.scss']
})
export class UploadFilesComponent implements OnInit {
  public filesToUPload: File[] = [];
  public filesUrl: (string | ArrayBuffer)[];

  @Input() info: UploadFilesProps = {
    places: 5,
    files: [],
    handleFileInput: (file: File)=> {}
  };


  constructor( @Inject(MAT_DIALOG_DATA)  info: UploadFilesProps,     public matDialogRef: MatDialogRef<UploadFilesComponent>,
  ) {
    this.info = info;
    const { places, files } = this.info;

    //if all files are already filled or even if we receive more images than expected, just show the first needed images
    if(files.length >= places){
      this.info.files.splice(places);
      return;
    } 

    const missingFiles = Array.from(new Array(places - files.length), ()=>({url: ''}))
    this.info.files = [...files, ...missingFiles];
   }

  ngOnInit(): void {
  }

  close(){
    this.matDialogRef.close(this.filesToUPload);
  }

}
