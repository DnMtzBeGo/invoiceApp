import { Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { from } from 'rxjs';
import { map, mergeAll } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from 'src/app/shared/services/auth.service';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  selector: 'app-emitter',
  templateUrl: './emitter.component.html',
  styleUrls: ['./emitter.component.scss'],
})
export class EmitterComponent implements OnInit {
  @Input() public userData: any;
  @Output() public emitterData: any = new EventEmitter<any>();

  public hasSatFiles: boolean = false;
  public maxSize: number = 5242880;
  public cerDate: number;
  public cerSize: string;
  public keyDate: number;
  public keySize: string;
  public password: string = '';
  public hasCer: boolean = false;
  public hasKey: boolean = false;

  public receiverForm: FormGroup = this.formBuilder.group({
    address: [''],
    place_id: [''],
    archivo_cer: [null],
    archivo_key: [null],
    tax_regime: [''],
    archivo_key_pswd: [''],
  });

  public addressName: string = '';

  public tax_regimes: Array<any>;
  public taxSelected: string = 'select-document';

  constructor(
    private formBuilder: FormBuilder,
    private apiRestService: AuthService,
    private alerService: AlertService,
    private traslateService: TranslateService,
  ) {}

  public async ngOnInit() {
    if (this.userData?.attributes?.address) {
      this.setAddressName(this.userData.attributes.address);
    }
    this.fetchCatalogs().subscribe((data) => {
      this.tax_regimes = data[0].documents;
    });
  }

  public ngOnChanges(changes: any): void {
    if (changes.userData && this.userData) {
      const { attributes } = this.userData;

      this.taxSelected = attributes?.tax_regime;

      this.receiverForm.patchValue({
        address: attributes.address,
        tax_regime: attributes?.tax_regime,
        place_id: attributes.place_id,
      });
    }
  }

  private fetchCatalogs() {
    return from(
      this.apiRestService.apiRest(
        JSON.stringify({
          catalogs: [
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

  public async updateTaxRegime(tax_regime: string) {
    this.taxSelected = tax_regime;
    await this.receiverForm.patchValue({
      taxRegime: tax_regime,
    });
    this.emit();
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
    this.emit();
  }

  public onFileChange(event: File, type: string) {
    if (event[0].name.includes('.cer') || event[0].name.includes('.key')) {
      if (event[0].size > this.maxSize) return this.alert(this.traslateService.instant('checkout.file_size_error'));
      if (type === 'cer') {
        this.receiverForm.patchValue({
          archivo_cer: event[0],
        });
        this.cerDate = event[0].lastModifiedDate;
        this.hasCer = true;
        this.cerSize = (event[0].size / (1024 * 1024)).toFixed(2) + ' MB';
      } else {
        this.receiverForm.patchValue({
          archivo_key: event[0],
        });
        this.keyDate = event[0].lastModifiedDate;
        this.hasKey = true;
        this.keySize = (event[0].size / (1024 * 1024)).toFixed(2) + ' MB';
      }
      this.emit();
    } else {
      this.alert(this.traslateService.instant('checkout.alerts.fileType'));
    }
  }

  public alert(message: string) {
    this.alerService.create({
      body: message,
      handlers: [
        {
          text: this.traslateService.instant('Ok'),
          color: '#FFE000',
          action: async () => {
            this.alerService.close();
          },
        },
      ],
    });
  }

  public removeFile(type: string) {
    if (type === 'cer') {
      this.hasCer = false;
      this.receiverForm.patchValue({
        archivo_cer: null,
      });
      this.cerSize = '';
    } else {
      this.hasKey = false;
      this.receiverForm.patchValue({
        archivo_key: null,
      });
      this.keySize = '';
    }
    this.emit();
  }

  public emit() {
    this.emitterData.emit(this.receiverForm.value);
  }
}
