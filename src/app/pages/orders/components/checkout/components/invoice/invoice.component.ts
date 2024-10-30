import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { from } from 'rxjs';
import { map, mergeAll } from 'rxjs/operators';

import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
})
export class InvoiceComponent implements OnInit {
  @Input() public userData: any;
  @Output() public receiverData: any = new EventEmitter<any>();

  public receiverForm: FormGroup = this.formBuilder.group({
    address: [''],
    place_id: [''],
    company: [''],
    rfc: [''],
    cfdi: [''],
    taxRegime: [''],
  });

  public validRFC: boolean = false;
  public addressName: string = '';

  public CFDIs!: Array<any>;
  public tax_regimes: Array<any>;
  public taxSelected: string = 'select-document';
  public cfdiSelected: string = 'select-document';

  constructor(private formBuilder: FormBuilder, private apiRestService: AuthService) {}

  public ngOnInit() {
    this.fetchCatalogs().subscribe((data) => {
      this.CFDIs = data[0].documents;
      this.tax_regimes = data[1].documents;
    });
  }

  private fetchCatalogs() {
    return from(
      this.apiRestService.apiRest(
        JSON.stringify({
          catalogs: [
            {
              name: 'sat_usos_cfdi',
              version: 0,
            },
            {
              name: 'sat_regimen_fiscal',
              version: 0,
            },
          ],
        }),
        '/invoice/catalogs/fetch',
      ),
    ).pipe(
      mergeAll(),
      map((data) => data.result.catalogs),
    );
  }

  public async updateCFDI(cfdi: string) {
    this.cfdiSelected = cfdi;
    await this.receiverForm.patchValue({
      cfdi: cfdi,
    });
    this.emitreceiverData();
  }

  public async updateTaxRegime(tax_regime: string) {
    this.taxSelected = tax_regime;
    await this.receiverForm.patchValue({
      taxRegime: tax_regime,
    });
    this.emitreceiverData();
  }

  public setAddressName(value: any) {
    this.receiverForm.patchValue({
      address: value,
    });
    this.addressName = value;
  }

  public setPlaceId(value: any) {
    this.receiverForm.patchValue({
      place_id: value,
    });
    this.emitreceiverData();
  }

  public emitreceiverData() {
    this.receiverData.emit(this.receiverForm.value);
  }

  public validateRFC() {
    if (
      /^([A-Z&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z&\d]{2}(?:[A&\d]))?$/.test(
        this.receiverForm.value.rfc,
      ) &&
      this.receiverForm.value.rfc.length >= 12
    ) {
      this.validRFC = true;
      this.emitreceiverData();
    } else {
      this.validRFC && this.receiverData.emit({ ...this.receiverForm.value, rfc: '' });
      this.validRFC = false;
    }
  }
}
