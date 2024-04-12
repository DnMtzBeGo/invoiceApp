import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  public backdrop: boolean = true;
  public icon: string = 'begon-polygon';
  public activatedDone = false;
  public langmodal = {
    done: 'Awesome'
  };

  polygonForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreatePolygonComponent>,
    private translateService: TranslateService,
    private webService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.polygonForm = this.formBuilder.group({
      name: ['', Validators.required]
    });

    this.polygonForm.valueChanges.subscribe(() => {
      console.log('change name: ', this.polygonForm.value, this.polygonForm.valid);
      this.activatedDone = this.polygonForm.valid;
    });
  }

  ngOnInit(): void {
    if (this.data.name) {
      // this.polygonName = this.data.name;
      this.polygonForm.get('name').setValue(this.data.name);
    }
  }

  public getNameFromInput(e: Event): void {
    if (e.target['value'] != '') {
      this.activatedDone = true;
    }
    this.polygonName = e.target['value'];
  }

  public async actions(e: string) {
    console.log('selected action: ', e);
    if (e == 'cancel') {
      this.dialogRef.close();
    } else {
      const name = this.polygonForm.get('name').value;
      if (name && !this.showSuccess) {
        // if (this.polygonName != '' && !this.showSuccess) {
        if (this.data._id) {
          await this.renamePolygon(name);
          return;
        }

        this.showSuccess = true;
      } else if (this.showSuccess) {
        this.dialogRef.close({ data: this.polygonName });
      }
    }
  }

  async renamePolygon(name: string) {
    const requestJson = JSON.stringify({ name });

    (await this.webService.apiRestPut(requestJson, `polygons/rename/${this.data._id}`, { apiVersion: 'v1.1' })).subscribe({
      next: ({ result }) => {
        this.showSuccess = true;
      },
      error: (err) => {
        // this.notificationsService.showErrorToastr('There was an error, try again later');
      },
      complete: () => {}
    });
  }
}
