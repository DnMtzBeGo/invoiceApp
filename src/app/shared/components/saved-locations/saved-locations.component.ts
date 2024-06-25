import { Component, EventEmitter, Output } from '@angular/core';
import { SavedLocationsService } from '../../services/saved-locations.service';
import { throttleTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { BegoInvoiceAddressLang } from '@begomx/ui-components';
import { NotificationsService } from '../../services/notifications.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-saved-locations',
  templateUrl: './saved-locations.component.html',
  styleUrls: ['./saved-locations.component.scss']
})
export class SavedLocationsComponent {
  @Output() goBack = new EventEmitter();
  @Output() pickLocation = new EventEmitter();

  locations = [];
  filterInput = new Subject<string>();
  private _filterInput = '';

  invoiceState = {
    show: false,
    address: null,
    location: null
  };

  invoiceLang: BegoInvoiceAddressLang;

  constructor(
    private savedLocations: SavedLocationsService,
    private apiRestService: AuthService,
    private notificationService: NotificationsService,
    private translateService: TranslateService
  ) {
    translateService.onLangChange.subscribe(() => (this.invoiceLang = this.makeInvoiceLang()));
    this.invoiceLang = this.makeInvoiceLang()
  }

  ngOnInit() {
    this.setupFilter();
  }

  private setupFilter() {
    this.savedLocations.locationsChange.subscribe(() => {
      this.filterLocations();
    });

    this.filterInput.pipe(throttleTime(300, undefined, { leading: true, trailing: true })).subscribe((v) => {
      this._filterInput = v.toLowerCase();
      this.filterLocations();
    });

    this.filterLocations();
  }

  filterLocations() {
    const { locations } = this.savedLocations;
    const input = this._filterInput;

    this.locations = input ? locations.filter((item) => item.name.toLowerCase().includes(input)) : locations;
  }

  async openInvoiceModal(location: any) {
    if (location.invoicing_address_id) {
      const { result } = await (
        await this.apiRestService.apiRestGet(`favorite_locations/invoice_address/${location._id}`, { apiVersion: 'v1.1' })
      ).toPromise();

      this.invoiceState.address = result.invoicing_address;
    }

    this.invoiceState.location = location;
    this.invoiceState.show = true;
  }

  hideInvoiceModal() {
    this.invoiceState.location = null;
    this.invoiceState.address = null;
    this.invoiceState.show = false;
  }

  async updateInvoiceAddress(address: any) {
    const location = this.invoiceState.location;
    const payload = JSON.stringify(address);

    if (location.invoicing_address_id) {
      await (
        await this.apiRestService.apiRestPut(payload, `favorite_locations/invoice_address/${location._id}`, { apiVersion: 'v1.1' })
      ).toPromise();
    } else {
      await (
        await this.apiRestService.apiRest(payload, `favorite_locations/invoice_address/${location._id}`, { apiVersion: 'v1.1' })
      ).toPromise();
    }

    this.hideInvoiceModal();
    this.notificationService.showSuccessToastr(this.translateService.instant('invoice-address.success-alert'));
  }

  private makeInvoiceLang(): BegoInvoiceAddressLang {
    return {
      title: this.translateService.instant('invoice-address.title'),
      inputs: {
        street: {
          label: this.translateService.instant('invoice-address.inputs.street.label'),
          placeholder: this.translateService.instant('invoice-address.inputs.street.placeholder')
        },
        extNum: {
          label: this.translateService.instant('invoice-address.inputs.external_number.label'),
          placeholder: this.translateService.instant('invoice-address.inputs.external_number.placeholder')
        },
        intNum: {
          label: this.translateService.instant('invoice-address.inputs.internal_number.label'),
          placeholder: this.translateService.instant('invoice-address.inputs.internal_number.placeholder')
        },
        country: {
          label: this.translateService.instant('invoice-address.inputs.country.label'),
          placeholder: this.translateService.instant('invoice-address.inputs.country.placeholder')
        },
        state: {
          label: this.translateService.instant('invoice-address.inputs.state.label'),
          placeholder: this.translateService.instant('invoice-address.inputs.state.placeholder'),
          countryRequired: this.translateService.instant('invoice-address.inputs.state.country_required')
        },
        municipality: {
          label: this.translateService.instant('invoice-address.inputs.municipality.label'),
          placeholder: this.translateService.instant('invoice-address.inputs.municipality.placeholder'),
          stateRequired: this.translateService.instant('invoice-address.inputs.municipality.state_required')
        },
        locality: {
          label: this.translateService.instant('invoice-address.inputs.locality.label'),
          placeholder: this.translateService.instant('invoice-address.inputs.locality.placeholder'),
          stateRequired: this.translateService.instant('invoice-address.inputs.locality.state_required')
        },
        cp: {
          label: this.translateService.instant('invoice-address.inputs.cp.label'),
          placeholder: this.translateService.instant('invoice-address.inputs.cp.placeholder')
        }
      },
      actions: {
        save: this.translateService.instant('invoice-address.actions.save'),
        cancel: this.translateService.instant('invoice-address.actions.cancel')
      }
    };
  }
}
