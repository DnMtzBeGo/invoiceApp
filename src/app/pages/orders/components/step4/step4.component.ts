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
  styleUrls: ['./step4.component.scss'],
})
export class Step4Component implements OnInit {
  @Input() public orderData: Order;
  @Input() public draftData: any;
  @Output() public step4FormData: EventEmitter<any> = new EventEmitter();
  @Output() public validFormStep4: EventEmitter<any> = new EventEmitter();

  public invoiceEditable = false;
  private cfdiOptions: any[] = [];
  private taxRegimeOptions: any[] = [];
  private serieOptions: any[] = [];

  private step4Form: FormGroup;

  public pickupContent: BegoCheckoutCardContent[] = [
    { propertyName: 'Full name', value: '' },
    { propertyName: 'Phone number', value: '' },
    { propertyName: 'Email', value: '' },
    { propertyName: 'Reference', value: '' },
    { propertyName: 'RFC', value: '' },
    { propertyName: 'Date', value: '' },
    { propertyName: 'Time', value: '' },
  ];

  public dropoffContent: BegoCheckoutCardContent[] = [
    { propertyName: 'Full name', value: '' },
    { propertyName: 'Phone number', value: '' },
    { propertyName: 'Email', value: '' },
    { propertyName: 'Description', value: '' },
  ];

  public cargoContent: BegoCheckoutCardContent[] = [
    { propertyName: 'Units', value: '' },
    { propertyName: 'Weight', value: '' },
    { propertyName: 'Cargo type', value: '' },
    { propertyName: 'Description', value: '' },
  ];

  public invoiceContent: BegoCheckoutCardContent[] = [
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
              componentRestrictions: { country: ['mx', 'us'] },
            },
            (predictions) => {
              resolve(formatPredictions(predictions));
            },
          );
        });
      },
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
          code: e.code,
        }));

        return formattedOptions.filter((e) =>
          `${e.title} ${e.description}`.toLowerCase().includes(search.toLowerCase()),
        );
      },
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
          code: e.code,
        }));

        return formattedOptions.filter((e) =>
          `${e.title} ${e.description}`.toLowerCase().includes(search.toLowerCase()),
        );
      },
    },
    {
      propertyName: 'series_id',
      label: 'Serie',
      value: '',
      type: 'select',
      filterOptions: (search) => {
        console.log('searching series... ', search, this.serieOptions);
        const formattedOptions = this.serieOptions.map((e) => ({
          title: e.serie,
          description: '',
          code: e.serie,
        }));

        return formattedOptions.filter((e) => `${e.title}`.toLowerCase().includes(search.toLowerCase()));
      },
    },
  ];

  constructor(
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private cfdiService: CfdiService,
    private apiRestService: AuthService,
    private stepperService: StepperService,
  ) {
    this.step4Form = this.formBuilder.group({
      address: ['', Validators.required],
      company: ['', Validators.required],
      rfc: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(12),
          Validators.pattern(/^([A-Z&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z&\d]{2}(?:[A&\d]))?$/),
        ]),
      ],
      cfdi: ['', Validators.required],
      tax_regime: ['', Validators.required],
      series_id: ['', Validators.required],
    });

    this.step4Form.statusChanges.subscribe((val) => {
      this.validFormStep4.emit(val === 'VALID');
    });

    this.step4Form.valueChanges.subscribe(() => {
      console.log('step4form changes: ', this.step4Form.value);
      this.step4FormData.emit(this.step4Form.value);
    });
  }

  public ngOnInit(): void {
    this.fetchCFDI();
    this.fetchTaxRegime();
    this.fetchSerie();

    this.updateCardTitles();
    this.translateService.onLangChange.subscribe(() => {
      this.updateCardTitles();
    });
  }

  public async ngOnChanges(changes: SimpleChanges) {
    const orderData = changes.orderData.currentValue;
    this.updatePickup(orderData);
    this.updateDropoff(orderData);
    this.updateCargo(orderData);

    if (changes.draftData && changes.draftData.currentValue) {
      console.log('step 4 draft data: ', this.draftData);

      const { invoice } = changes.draftData.currentValue;
      if (invoice?.receiver) {
        const { receiver } = invoice;

        this.step4Form.setValue(receiver);
        receiver.address = receiver.address.address;

        const setInvoiceContent = async (e) => {
          console.log('setting invoice content: ', e);
          if (e.propertyName == 'cfdi') {
            await this.fetchCFDI();
            const el = this.cfdiOptions.find((el) => el.code == receiver[e.propertyName]);
            if (el) {
              e.value = `${el.code} - ${el.description}`;
              return e;
            }
          }

          if (e.propertyName == 'tax_regime') {
            await this.fetchTaxRegime();
            const el = this.taxRegimeOptions.find((el) => el.code == receiver[e.propertyName]);
            if (el) {
              e.value = `${el.code} - ${el.description}`;
              return e;
            }
          }

          if (e.propertyName == 'series_id') {
            console.log('filtering series...', receiver[e.propertyName]);
            await this.fetchSerie();
            const el = this.serieOptions.find((el) => el.code == receiver[e.propertyName]);
            if (el) {
              console.log('series_id: ', el);
              e.value = el.code;
              return e;
            }
          }

          e.value = receiver[e.propertyName];

          return e;
        };

        //Fill info
        this.invoiceContent = await Promise.all(this.invoiceContent.map(async (e) => await setInvoiceContent(e)));
        console.log('setting invoice content: ', this.invoiceContent);
      }
    }
  }

  private updateCardTitles() {
    this.pickupContent[0].label = this.translateService.instant('orders.title-fullname');
    this.pickupContent[1].label = this.translateService.instant('orders.phone_text');
    this.pickupContent[3].label = this.translateService.instant('orders.title-reference');
    this.pickupContent[5].label = this.translateService.instant('checkout.date');
    this.pickupContent[6].label = this.translateService.instant('checkout.time');

    this.dropoffContent[0].label = this.translateService.instant('orders.title-fullname');
    this.dropoffContent[1].label = this.translateService.instant('orders.phone_text');
    this.dropoffContent[3].label = this.translateService.instant('orders.description');

    this.cargoContent[0].label = this.translateService.instant('checkout.units');
    this.cargoContent[1].label = this.translateService.instant('checkout.weight');
    this.cargoContent[2].label = this.translateService.instant('checkout.cargo-type');
    this.cargoContent[3].label = this.translateService.instant('orders.unit-details-list.description');

    this.invoiceContent[0].label = this.translateService.instant('checkout.txt-address');
    this.invoiceContent[1].label = this.translateService.instant('checkout.txt-company');
    this.invoiceContent[4].label = this.translateService.instant('checkout.txt-tax_regime');
  }

  private async fetchCFDI() {
    const { currentLang } = this.translateService;
    const observable = currentLang === 'es' ? this.cfdiService.getCFDI_es() : this.cfdiService.getCFDI_en();

    this.cfdiOptions = await observable.toPromise();
  }

  private async fetchTaxRegime() {
    const payload = {
      catalogs: [{ name: 'sat_regimen_fiscal', version: '0' }],
    };

    const req = await this.apiRestService.apiRest(JSON.stringify(payload), 'invoice/catalogs/fetch');
    const { result } = await req.toPromise();

    this.taxRegimeOptions = result.catalogs[0].documents;
  }

  private async fetchSerie() {
    const req = await this.apiRestService.apiRestGet(`invoice/series/by-carrier/${'626c27f50eb3fd2dbbd68f3b'}`);
    const { result } = await req.toPromise();

    this.serieOptions = [...result];
  }

  private updatePickup(orderData: Order) {
    const { pickup, reference_number } = orderData;
    const { contact_info, tax_information } = pickup;

    this.pickupContent[0].value = contact_info.name;
    this.pickupContent[1].value = contact_info.telephone;
    this.pickupContent[2].value = contact_info.email;
    this.pickupContent[3].value = reference_number;
    this.pickupContent[4].value = tax_information?.rfc;
    this.pickupContent[5].value = this.formatDate(pickup.startDate);
    this.pickupContent[6].value = this.formatTime(pickup.startDate);
  }

  private updateDropoff(orderdata: Order) {
    const { dropoff } = orderdata;
    const { contact_info, extra_notes } = dropoff;

    this.dropoffContent[0].value = contact_info.name;
    this.dropoffContent[1].value = contact_info.telephone;
    this.dropoffContent[2].value = contact_info.email;
    this.dropoffContent[3].value = extra_notes;
  }

  private updateCargo(orderdata: Order) {
    const { cargo } = orderdata;

    this.cargoContent[0].value = 1;
    this.cargoContent[1].value = this.formatWeight(cargo.weigth || cargo['weight']);
    this.cargoContent[2].value = cargo.type;
    this.cargoContent[3].value = cargo.description;
  }

  public updateInvoice(data: any) {
    console.log('updating invoice: ', data);
    this.invoiceContent[0].value = data.address;
    this.invoiceContent[1].value = data.company;
    this.invoiceContent[2].value = data.rfc;
    this.invoiceContent[3].value = data.cfdi;
    this.invoiceContent[4].value = data.tax_regime;
    this.invoiceContent[5].value = data.series_id;

    this.step4Form.patchValue({
      ...data,
      address: data.addressselected.place_id,
      cfdi: data.cfdiselected.code,
      tax_regime: data.tax_regimeselected.code,
      series_id: data.series_idselected.code,
    });

    this.invoiceEditable = false;
  }

  public formatDate(date: Date | number): string {
    if (!date) return '';

    return new Intl.DateTimeFormat(this.translateService.currentLang, {
      month: 'long',
      day: '2-digit',
    }).format(date);
  }

  public formatTime(date: Date | number): string {
    if (!date) return '';

    return new Intl.DateTimeFormat(this.translateService.currentLang, {
      minute: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  public formatWeight(weight: number[]): string {
    const unit = this.translateService.instant('orders.cargo-weight.unit');
    const quanitity = weight[0];

    return `${unit} 1 - ${quanitity} kg`;
  }

  public redirectToStep(step: number) {
    this.stepperService.setStep(step);
  }

  public editInvoice() {
    this.invoiceEditable = true;
  }
}
