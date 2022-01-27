import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  invoiceForm: FormGroup = this.formBuilder.group({
    fullName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    phoneCode: ['', Validators.required],
    dialCode: ['', Validators.required],
    address: ['', Validators.required],
    email: ['', Validators.required],
    company: ['', Validators.required],
    rfc: ['', Validators.required],
    cfdi: ['', Validators.required],
  });

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

  ngAfterViewInit(){
    this.invoiceForm.disable();
  }

  ngOnChanges(changes: SimpleChanges): void{
    if(changes.userData && this.userData) {



      const { nickname, email, country_code, raw_telephone, attributes } = this.userData;

      let phoneNumber = raw_telephone.split(' ')
      const dialCode = phoneNumber.shift();
      phoneNumber = phoneNumber.join(' ');

      this.invoiceForm.patchValue({
        fullName: nickname,
        phoneNumber: phoneNumber,
        phoneCode: country_code,
        dialCode: dialCode,
        address: attributes.address,
        email: email,
        company: attributes.companyName,
        rfc: attributes.RFC,
        cfdi:  attributes.CFDI,
      });

    }
  }

  editForm(): void {
    this.invoiceFormIsEnabled = true;
    this.invoiceForm.enable();
  }

  saveForm(): void {
    this.invoiceFormIsEnabled = false;
    this.invoiceForm.disable();
    this.invoiceData.emit(this.invoiceForm.value)
  }

  updateCFDI(cfdi: string){
    this.cfdiSelected = cfdi;
  }

  changeFlag(value: string){
    this.invoiceForm.patchValue({
      phoneCode: value
    });
  }

  changeCode(value: string){
    this.invoiceForm.patchValue({
      dialCode: value
    });
  }

  changePhone(value: string){
    this.invoiceForm.patchValue({
      phoneNumber: value
    });
  }



}
