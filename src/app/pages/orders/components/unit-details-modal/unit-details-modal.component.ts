import { Component, OnInit, Inject } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from 'src/app/shared/services/auth.service';

interface Option {
  value?: string;
  displayValue?: string;
}

interface UnitDetailsModalData {
  satUnit: Option;
  qty: number;
  description: string;
}

@Component({
  selector: 'app-unit-details-modal',
  templateUrl: './unit-details-modal.component.html',
  styleUrls: ['./unit-details-modal.component.scss'],
})
export class UnitDetailsModalComponent implements OnInit {
  public unitForm = new FormGroup({
    qty: new FormControl(1),
    description: new FormControl(''),
  });

  public selected: Option = { value: '', displayValue: '' };
  public unitsCatalog: Option[] = [];

  public actionButtons: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UnitDetailsModalData,
    private apiRestService: AuthService,
    private translateService: TranslateService,
    public dialogRef: MatDialogRef<UnitDetailsModalComponent>,
  ) {
    this.actionButtons = [
      {
        textBtn: this.translateService.instant('orders.btn-save'),
        textEmit: 'close',
        activated: true,
      },
    ];
  }

  public ngOnInit(): void {
    this.getCatalog();
    this.loadPrevData();
  }

  private loadPrevData() {
    this.data.qty && this.unitForm.get('qty')!.setValue(this.data.qty);
    this.data.description && this.unitForm.get('description')!.setValue(this.data.description);
    this.data.satUnit && (this.selected = this.data.satUnit);
  }

  public async getCatalog(query?: string) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('limit', '10');

    const req = await this.apiRestService.apiRestGet(
      `invoice/catalogs/query/sat_cp_unidades_de_peso?${params.toString()}`,
    );
    const { result } = await req.toPromise();

    this.unitsCatalog = result.map((item: any) => ({
      value: item?.code,
      displayValue: `${item?.code} - ${item?.description}`,
    }));
  }

  public updateQuantity(value: number) {
    this.unitForm.get('qty')!.setValue(value);
  }

  public updateUnitType(code: string) {
    this.selected = this.unitsCatalog.find((item) => item.value === code);
  }

  public updateDescription(data: any) {
    this.unitForm.get(data.key)!.setValue(data.details);
  }

  public save() {
    const result = { ...this.unitForm.value, ...this.selected };
    this.dialogRef.close(result);
  }
}
