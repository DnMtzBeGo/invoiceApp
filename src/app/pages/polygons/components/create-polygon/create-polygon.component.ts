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
  public showModal: boolean = false;
  public showSuccess: boolean = false;

  //// Variables Moddal create Polygon
  public backdrop: boolean = true;
  public icon: string = 'begon-polygon';
  public activatedDone = false;
  public langmodal = {
    done: 'Awesome',
    cancel: 'Cancel'
  };

  polygonForm: FormGroup;

  action: string = '';

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
      this.activatedDone = this.polygonForm.valid;
    });

    this.action = this.data.action;
  }

  ngOnInit(): void {
    console.log('initial modal data: ', this.data);
    if (this.data.name) this.polygonForm.get('name').setValue(this.data.name);
  }

  public async actions(e: string) {
    console.log('selected action: ', e);
    if (e == 'cancel') this.dialogRef.close();
    else {
      const name = this.polygonForm.get('name').value;

      if (this.showSuccess) this.dialogRef.close({ name, action: this.action });

      if (this.action === 'create') this.showSuccess = true;
      if (this.action === 'rename') await this.renamePolygon(name);
      if (this.action === 'delete') await this.deletePolygon();
    }
  }

  async renamePolygon(name: string) {
    if (!name) return;

    const requestJson = JSON.stringify({ name });

    (await this.webService.apiRestPut(requestJson, `polygons/rename/${this.data._id}`, { apiVersion: 'v1.1' })).subscribe({
      next: () => {
        this.showSuccess = true;
      },
      error: (err) => {
        // this.notificationsService.showErrorToastr('There was an error, try again later');
      }
    });
  }

  async deletePolygon() {
    (await this.webService.apiRestDelete(`polygons/${this.data._id}`, { apiVersion: 'v1.1' })).subscribe({
      next: () => {
        this.showSuccess = true;
      },
      error: (err) => {
        // this.notificationsService.showErrorToastr('There was an error, try again later');
      }
    });
  }
}
