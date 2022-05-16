import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CfdiService } from 'src/app/services/cfdi.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {

  @Input() userData: any;
  @Output() invoiceData: any = new EventEmitter<any>();

  recieverForm: FormGroup = this.formBuilder.group({
    address: [{
      address: '',
      place_id: '',
    }],
    company: [''],
    rfc: [''],
    cfdi: [''],
    taxRegine: [''],
  });
 
  address: {
    address: string,
    place_id: string,
  } = {
    address: '',
    place_id: '',
  }

  invoiceFormIsEnabled:boolean = false;

  CFDIs!: Array<any>;
  cfdiSelected: string = 'select-document';

  constructor(
    private formBuilder: FormBuilder,
    private cfdiService: CfdiService,
    private translateService: TranslateService,
  ) {
    this.translateService.onLangChange.subscribe((lang: any) => {
      
      if(lang.lang == 'es'){
        this.cfdiService.getCFDI_es().subscribe( ( result ) => {
          this.CFDIs = result;
        })
      }else{
        this.cfdiService.getCFDI_en().subscribe( ( result ) => {
          this.CFDIs = result;
        })
      }
      })
  }

  ngOnInit(): void {
    const lang = localStorage.getItem('lang');
    if(lang == 'es'){
      this.cfdiService.getCFDI_es().subscribe( ( result ) => {
        this.CFDIs = result;
      })
    }else{
      this.cfdiService.getCFDI_en().subscribe( ( result ) => {
        this.CFDIs = result;
      })
    }
  }

  ngOnChanges(changes: SimpleChanges): void{
    console.log('cambios',changes)
    if(changes.userData && this.userData) {

      const {attributes } = this.userData;

      this.recieverForm.patchValue({
        company: attributes.companyName,
        rfc: attributes.RFC,
        cfdi:  attributes.CFDI,
        taxRegine: attributes.taxRegine,
      });

    }
  }


  updateCFDI(cfdi: string){
    this.cfdiSelected = cfdi;
  }



  setAddressName(value: any){
  console.log('address',value)
    this.recieverForm.patchValue({
      address: {
        address: value
      }
    });
    this.address = value;
  }

  setPlaceId(value: any){
    console.log('placeId',value)
      this.recieverForm.patchValue({
        address: {
          place_id: value
        }
      });
    }

}
