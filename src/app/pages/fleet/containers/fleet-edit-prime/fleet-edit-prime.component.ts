import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { ReceviedPicture } from '../../components/pictures-grid/pictures-grid.component';
import { UploadFileInfo } from '../../components/upload-files/upload-files.component';
import { routes } from '../../consts';

@Component({
  selector: 'app-fleet-edit-prime',
  templateUrl: './fleet-edit-prime.component.html',
  styleUrls: ['./fleet-edit-prime.component.scss']
})
export class FleetEditPrimeComponent {
  form: FormGroup<{
    brand: FormControl<string>;
    year: FormControl<string>;
    vehicle_number: FormControl<string>;
    color: FormControl<string>;
  }>;

  requiredImgs = 1;
  pictures: UploadFileInfo[] = [];
  files = [];

  years = this.createDateOptions();

  id = '';
  fleetId = '';
  isNew = false;

  constructor(
    private fb: FormBuilder,
    private notificationsService: NotificationsService,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private webService: AuthService
  ) {
    this.isNew = this.router.url.includes(routes.NEW_PRIME);
    this.id = this.route.snapshot.params.id;
    this.fleetId = this.route.snapshot.queryParams.fleet_id;

    this.form = this.fb.group({
      brand: ['', Validators.required],
      year: ['', Validators.required],
      vehicle_number: ['', Validators.required],
      color: ['', Validators.required]
    });
  }

  async ngOnInit() {
    if (!this.isNew) this.getVehicleData();
  }

  async getVehicleData() {
    const vehicle = await (await this.webService.apiRestGet(`api/vehicle/${this.id}`, { apiVersion: 'vehicle-service' })).toPromise();
    if (!vehicle) return;

    this.pictures = vehicle.pictures.map((url) => ({ url }));
    this.form.patchValue(vehicle.attributes);
  }

  async handleFileInput({ file, dialog, i }: ReceviedPicture) {
    const acceptedFiles = ['image/jpeg', 'image/jpg', 'image/png'];

    if (!acceptedFiles.includes(file.type)) {
      this.notificationsService.showErrorToastr(this.translateService.instant('fleet.only-imgs'));
      return;
    }

    const fileInfo = dialog.componentInstance.info.files[i];
    const reader = new FileReader();

    reader.onload = async () => {
      fileInfo.url = reader.result as string;
      this.pictures[i] = { url: fileInfo.url };
      this.files[i] = file;
    };

    reader.readAsDataURL(file);
  }

  async updateVehicle() {
    const v = this.form.value;

    const payload = {
      id_vehicle_type: undefined,
      attributes: {
        ...v,
        year: Number(v.year)
      }
    };

    if (this.isNew) {
      payload.id_vehicle_type = this.fleetId;
      const res = await (
        await this.webService.apiRest(JSON.stringify(payload), 'api/vehicle', { apiVersion: 'vehicle-service' })
      ).toPromise();

      this.id = res._id;
    } else {
      await (
        await this.webService.apiRestPut(JSON.stringify(payload), `api/vehicle/${this.id}`, { apiVersion: 'vehicle-service' })
      ).toPromise();
    }

    await this.updatePicture();

    this.router.navigate(['/fleet'], { state: { showCompleteModal: true } });
  }

  private async updatePicture() {
    const formData = new FormData();

    this.files.forEach((file, i) => {
      formData.append('pictures', file, String(i + 1));
    });

    return (
      await this.webService.uploadFilesSerivce(formData, `api/vehicle/${this.id}/upload_pictures`, { apiVersion: 'vehicle-service' })
    ).toPromise();
  }

  private createDateOptions() {
    const startYear = 1980;
    const endYear = new Date().getFullYear();
    const length = endYear - startYear;

    return Array.from({ length }, (_, i) => endYear - i);
  }
}
