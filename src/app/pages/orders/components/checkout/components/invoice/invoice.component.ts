import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { from } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import {map, mergeAll} from "rxjs/operators";

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {

  @Input() userData: any;
  @Output() receiverData: any = new EventEmitter<any>();

  receiverForm: FormGroup = this.formBuilder.group({
    address: [''],
    place_id: [''],
    company: [''],
    rfc: [''],
    cfdi: [''],
    taxRegime: [''],
  });


  validRFC: boolean = true;
  addressName: string = '';

  CFDIs!: Array<any>;
  tax_regimes: Array<any>;
  taxSelected: string = 'select-document';
  cfdiSelected: string = 'select-document';

  constructor(
    private formBuilder: FormBuilder,
    private apiRestService: AuthService,
  ) {}

  ngOnInit() {
   this.fetchCatalogs().subscribe(data => {
     this.CFDIs = data[0].documents;
     this.tax_regimes = data[1].documents;
   })
  }


  fetchCatalogs(){
    return from(
      this.apiRestService.apiRest(JSON.stringify({
        catalogs:[{
          name: 'sat_usos_cfdi',
          version: 0,
        },
      {
        name: 'sat_regimen_fiscal',
        version: 0,
      }]
      }), '/invoice/catalogs/fetch')
   ).pipe(
     mergeAll(),
     map(data => data.result.catalogs)
     )
  }

  async updateCFDI(cfdi: string){
    this.cfdiSelected = cfdi;
    await this.receiverForm.patchValue({
      cfdi: cfdi
    })
    this.emitreceiverData()
  }

  async updateTaxRegime(tax_regime: string){
    this.taxSelected = tax_regime;
    await this.receiverForm.patchValue({
      taxRegime: tax_regime
    })
    this.emitreceiverData()
  }



  setAddressName(value: any){
  console.log('address',value)
    this.receiverForm.patchValue({
      address: value
    });
    this.addressName = value;
  }

  setPlaceId(value: any){
    console.log('placeId',value)
      this.receiverForm.patchValue({
        place_id: value
      });
      this.emitreceiverData()
    }

    emitreceiverData(){
      this.receiverData.emit(this.receiverForm.value);
    }

    validateRFC(){
      if(
        /^([A-Z&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z&\d]{2}(?:[A&\d]))?$/.test(
          this.receiverForm.value.rfc
          ) && this.receiverForm.value.rfc.length >= 12
          ){
            this.validRFC = true;
            this.emitreceiverData()
          }
          else{
            this.validRFC = false;
          }
    }
}
