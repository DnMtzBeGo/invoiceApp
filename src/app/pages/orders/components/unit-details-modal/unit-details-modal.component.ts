import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

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
  styleUrls: ['./unit-details-modal.component.scss']
})
export class UnitDetailsModalComponent implements OnInit {
  unitForm = new FormGroup({
    qty: new FormControl(1),
    description: new FormControl('')
  });

  selected: Option = { value: '', displayValue: '' };
  unitsCatalog: Option[] = [];

  actionButtons = [
    {
      textBtn: this.translateService.instant('orders.btn-save'),
      textEmit: 'close',
      activated: true,
    }
  ]

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UnitDetailsModalData,
    private apiRestService: AuthService,
    private translateService: TranslateService,
    public dialogRef: MatDialogRef<UnitDetailsModalComponent>
  ) {}

  ngOnInit(): void {
    this.getCatalog();
    this.loadPrevData();
  }

  loadPrevData() {
    this.data.qty && this.unitForm.get('qty')!.setValue(this.data.qty);
    this.data.description && this.unitForm.get('description')!.setValue(this.data.description);
    this.data.satUnit && (this.selected = this.data.satUnit);
  }

  async getCatalog(query?: string) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('limit', '10');

    const req = await this.apiRestService.apiRestGet(`invoice/catalogs/query/sat_cp_unidades_de_peso?${params.toString()}`);
    const { result } = await req.toPromise();

    this.unitsCatalog = result.map((item: any) => ({
      value: item?.code,
      displayValue: `${item?.code} - ${item?.description}`
    }));
  }

  updateQuantity(value: number) {
    this.unitForm.get('qty')!.setValue(value);
  }

  updateUnitType(code: string) {
    this.selected = this.unitsCatalog.find((item) => item.value === code);
  }

  updateDescription(data: any) {
    this.unitForm.get(data.key)!.setValue(data.details);
  }

  save() {
    const result = { ...this.unitForm.value, ...this.selected };
    this.dialogRef.close(result);
  }
}
