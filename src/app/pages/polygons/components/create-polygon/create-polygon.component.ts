import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-create-polygon',
  templateUrl: './create-polygon.component.html',
  styleUrls: ['./create-polygon.component.scss']
})
export class CreatePolygonComponent implements OnInit {

  public polygonName: any = '';
  public showModal: boolean = false;
  public showSuccess: boolean = false;

    //// Variables Moddal create Polygon
  public  backdrop: boolean = true;
  public  icon: string = 'begon-polygon';
  public activatedDone = false;
  public  langmodal = { 
    done: 'Awesome'
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreatePolygonComponent>,
    private translateService: TranslateService
  ) { 
    
  }

  ngOnInit(): void {
    if (this.data.name) {
      this.polygonName = this.data.name;
      console.log(this.data.name)
    }
  }

  public getNameFromInput(e: Event): void {
    if (e.target['value']!= '') {
      this.activatedDone = true;
    }
    this.polygonName = e.target['value'];
  }

  public actions(e: string): void {
    if (e == 'cancel') {
      this.dialogRef.close();
    } else {
      if(this.polygonName != '' && !this.showSuccess) {
        this.showSuccess = true;
      } else if (this.showSuccess) {
        this.dialogRef.close({data: this.polygonName});
      }
    }
  }

}
