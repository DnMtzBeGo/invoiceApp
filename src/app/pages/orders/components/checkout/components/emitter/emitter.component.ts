import { Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { from } from 'rxjs';
import { map, mergeAll } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-emitter',
  templateUrl: './emitter.component.html',
  styleUrls: ['./emitter.component.scss']
})
export class EmitterComponent implements OnInit {

  @Input() userData: any;
  @Output() emitterData: any = new EventEmitter<any>();

  public hasSatFiles: boolean = false;
  public maxSize: number = 5242880;
  public cerDate: number;
  cerSize: string;
  public keyDate: number;
  keySize: string;
  public password: string = '';
  hasCer: boolean = false;
  hasKey: boolean = false;

  receiverForm: FormGroup = this.formBuilder.group({
    address: [''],
    place_id: [''],
    archivo_cer: [null],
    archivo_key: [null],
    tax_regime: [''],
    archivo_key_pswd: [''],
  });


  addressName: string = '';

  tax_regimes: Array<any>;
  taxSelected: string = 'select-document';

  constructor(
    private formBuilder: FormBuilder,
    private apiRestService: AuthService,
    private alerService: AlertService,
    private traslateService: TranslateService
  ) {}

  async ngOnInit() {
    console.log('userData',this.userData)
    if(this.userData.attributes.address){
      this.setAddressName(this.userData.attributes.address);
    }
   this.fetchCatalogs().subscribe(data => {
     this.tax_regimes = data[0].documents;
   })
  }

   ngOnChanges(changes: any): void{
    console.log('cambios emitter',changes)
    if(changes.userData && this.userData) {

      const {attributes } = this.userData;

      this.taxSelected = attributes.tax_regime;

      this.receiverForm.patchValue({
        address: attributes.address,
        tax_regime: attributes.tax_regime,
        place_id : attributes.place_id
      });
    }
  }

  fetchCatalogs(){
    return from(
      this.apiRestService.apiRest(JSON.stringify({
        catalogs:[
      {
        name: 'sat_regimen_fiscal',
        version: 0,
      }
    ]
      }), '/invoice/catalogs/fetch')
   ).pipe(
     mergeAll(),
     map(data => data.result.catalogs)
     )
  }

  async updateTaxRegime(tax_regime: string){
    this.taxSelected = tax_regime;
    await this.receiverForm.patchValue({
      taxRegime: tax_regime
    })
    this.emit()
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
      this.emit()
    }
    

    onFileChange(event: File, type: string ) {
        if(event[0].name.includes('.cer') || event[0].name.includes('.key')){
          if(type === 'cer'){
            this.receiverForm.patchValue({
              archivo_cer: event[0]
            })
            this.cerDate = event[0].lastModifiedDate;
            this.hasCer = true;
            this.cerSize =  (event[0].size / (1024 * 1024)).toFixed(2) + ' MB';
          }else{
            this.receiverForm.patchValue({
              archivo_key: event[0]
            })
            this.keyDate = event[0].lastModifiedDate;
            this.hasKey = true;
            this.keySize =  (event[0].size / (1024 * 1024)).toFixed(2) + ' MB';
          }
          this.emit()
        }
        else{
          this.alerService.create({
            title: this.traslateService.instant('checkout.alerts.fileType'),
            handlers:[
              {
                text: this.traslateService.instant('Ok'),
                  color: '#ffbe00',
                action: async () => {
                this.alerService.close();
              }
              }
            ]
          })
        }
    }

    removeFile(type: string){
      if(type === 'cer'){
        this.hasCer = false;
        this.receiverForm.patchValue({
          archivo_cer: null
        })
        this.cerSize = '';
      }else{
        this.hasKey = false;
        this.receiverForm.patchValue({
          archivo_key: null
        })
        this.keySize = '';
      }
      this.emit();
    }

    emit(){
      this.emitterData.emit(this.receiverForm.value);
    }
}
