import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BegoCheckoutCardContent, StepperService } from '@begomx/ui-components';
import { TranslateService } from '@ngx-translate/core';
import { CfdiService } from 'src/app/services/cfdi.service';
import { Order } from 'src/app/shared/interfaces/order.model';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
  styleUrls: ['./step4.component.scss']
})
export class Step4Component implements OnInit {
  @Input() orderData: Order;
  @Output() step4FormData: EventEmitter<any> = new EventEmitter();
  @Output() validFormStep4: EventEmitter<any> = new EventEmitter();

  invoiceEditable = false;
  cfdiOptions: any[] = [];
  taxRegimeOptions: any[] = [];

  step4Form: FormGroup = this.formBuilder.group({
    address: ['', Validators.required],
    company: ['', Validators.required],
    rfc: [
      '',
      Validators.compose([
        Validators.required,
        Validators.minLength(12),
        Validators.pattern(/^([A-Z&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z&\d]{2}(?:[A&\d]))?$/)
      ])
    ],
    cfdi: ['', Validators.required],
    tax_regime: ['', Validators.required]
  });

  pickupContent: BegoCheckoutCardContent[] = [
    { propertyName: 'Full name', value: '' },
    { propertyName: 'Phone number', value: '' },
    { propertyName: 'Email', value: '' },
    { propertyName: 'Reference', value: '' },
    { propertyName: 'RFC', value: '' },
    { propertyName: 'Date', value: '' },
    { propertyName: 'Time', value: '' }
  ];

  dropoffContent: BegoCheckoutCardContent[] = [
    { propertyName: 'Full name', value: '' },
    { propertyName: 'Phone number', value: '' },
    { propertyName: 'Email', value: '' },
    { propertyName: 'Description', value: '' }
  ];

  cargoContent: BegoCheckoutCardContent[] = [
    { propertyName: 'Units', value: '' },
    { propertyName: 'Weight', value: '' },
    { propertyName: 'Cargo type', value: '' },
    { propertyName: 'Description', value: '' }
  ];

  invoiceContent: BegoCheckoutCardContent[] = [
    {
      propertyName: 'address',
      label: 'Address',
      value: '',
      type: 'select',
      filterOptions: (search) => {
        if (!search) return [];

        const formatPredictions = (predictions: google.maps.places.AutocompletePrediction[]) => {
          return predictions.map((prediction) => {
            const splitted = prediction.description.split(',');
            const title = splitted.shift();
            const description = splitted.join(',');

            return { title, description, place_id: prediction.place_id };
          });
        };

        const autoCompleteService = new google.maps.places.AutocompleteService();

        return new Promise((resolve) => {
          autoCompleteService.getPlacePredictions(
            {
              input: search,
              componentRestrictions: { country: ['mx', 'us'] }
            },
            (predictions) => {
              resolve(formatPredictions(predictions));
            }
          );
        });
      }
    },
    { propertyName: 'company', label: 'Company name', value: '', type: 'input' },
    { propertyName: 'rfc', label: 'RFC', value: '', type: 'input' },
    {
      propertyName: 'cfdi',
      label: 'CFDI use',
      value: '',
      type: 'select',
      filterOptions: (search) => {
        const formattedOptions = this.cfdiOptions.map((e) => ({
          title: e.code,
          description: e.description,
          code: e.code
        }));

        return formattedOptions.filter((e) => `${e.title} ${e.description}`.toLowerCase().includes(search.toLowerCase()));
      }
    },
    {
      propertyName: 'tax_regime',
      label: 'Tax regime',
      value: '',
      type: 'select',
      filterOptions: (search) => {
        const formattedOptions = this.taxRegimeOptions.map((e) => ({
          title: e.code,
          description: e.description,
          code: e.code
        }));

        return formattedOptions.filter((e) => `${e.title} ${e.description}`.toLowerCase().includes(search.toLowerCase()));
      }
    }
  ];

  constructor(
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private cfdiService: CfdiService,
    private apiRestService: AuthService,
    private stepperService: StepperService
  ) {}

  ngOnInit(): void {
    this.fetchCFDI();
    this.fetchTaxRegime();

    this.step4Form.statusChanges.subscribe((val) => {
      this.validFormStep4.emit(val === 'VALID');
    });

    this.step4Form.valueChanges.subscribe(() => {
      this.step4FormData.emit(this.step4Form.value);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const orderData = changes.orderData.currentValue;

    this.updatePickup(orderData);
    this.updateDropoff(orderData);
    this.updateCargo(orderData);
  }

  async fetchCFDI() {
    const { currentLang } = this.translateService;
    const observable = currentLang === 'es' ? this.cfdiService.getCFDI_es() : this.cfdiService.getCFDI_en();

    this.cfdiOptions = await observable.toPromise();
  }

  async fetchTaxRegime() {
    const payload = {
      catalogs: [{ name: 'sat_regimen_fiscal', version: '0' }]
    };

    const req = await this.apiRestService.apiRest(JSON.stringify(payload), 'invoice/catalogs/fetch');
    const { result } = await req.toPromise();

    this.taxRegimeOptions = result.catalogs[0].documents;
  }

  updatePickup(orderData: Order) {
    const { pickup, reference_number } = orderData;
    const { contact_info } = pickup;

    this.pickupContent[0].value = contact_info.name;
    this.pickupContent[1].value = contact_info.telephone;
    this.pickupContent[2].value = contact_info.email;
    this.pickupContent[3].value = reference_number;
    this.pickupContent[4].value = contact_info.rfc;
    this.pickupContent[5].value = this.formatDate(pickup.startDate);
    this.pickupContent[6].value = this.formatTime(pickup.startDate);
  }

  updateDropoff(orderdata: Order) {
    const { dropoff } = orderdata;
    const { contact_info, extra_notes } = dropoff;

    this.dropoffContent[0].value = contact_info.name;
    this.dropoffContent[1].value = contact_info.telephone;
    this.dropoffContent[2].value = contact_info.email;
    this.dropoffContent[3].value = extra_notes;
  }

  updateCargo(orderdata: Order) {
    const { cargo } = orderdata;

    this.cargoContent[0].value = 1;
    this.cargoContent[1].value = this.formatWeight(cargo.weigth);
    this.cargoContent[2].value = cargo.type;
    this.cargoContent[3].value = cargo.description;
  }

  updateInvoice(data: any) {
    this.invoiceContent[0].value = data.address;
    this.invoiceContent[1].value = data.company;
    this.invoiceContent[2].value = data.rfc;
    this.invoiceContent[3].value = data.cfdi;
    this.invoiceContent[4].value = data.tax_regime;

    this.step4Form.patchValue({
      ...data,
      address: data.addressselected.place_id,
      cfdi: data.cfdiselected.code,
      tax_regime: data.tax_regimeselected.code
    });

    this.invoiceEditable = false;
  }

  formatDate(date: Date | number): string {
    if (!date) return '';

    return new Intl.DateTimeFormat(this.translateService.currentLang, {
      month: 'long',
      day: '2-digit'
    }).format(date);
  }

  formatTime(date: Date | number): string {
    if (!date) return '';

    return new Intl.DateTimeFormat(this.translateService.currentLang, {
      minute: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  formatWeight(weight: number[]): string {
    const unit = this.translateService.instant('orders.cargo-weight.unit');
    const quanitity = weight[0];

    return `${unit} 1 - ${quanitity} kg`;
  }

  redirectToStep(step: number) {
    this.stepperService.setStep(step);
  }

  editInvoice() {
    this.invoiceEditable = true;
  }
}
