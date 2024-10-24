import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CataloguesListService } from '../invoice/carta-porte/services/catalogues-list.service';
import { searchInList } from '../../containers/factura-edit-page/factura.core';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: [
    './location.component.scss',
    '../invoice/carta-porte/ubicaciones/components/ubicacion/ubicacion.component.scss',
  ],
})
export class LocationComponent implements OnInit {
  @Input() locationInfo: any;
  @Output() locationInfoChanges = new EventEmitter<any>();

  public infoIsLoaded: boolean = false;

  public states: any[] = [];
  public filteredStates: any[];

  public municipalities: any[] = [];
  public filteredMunicipalities: any[];

  public localities: any[] = [];
  public filteredLocalities: any[];

  public colonies: any[] = [];
  public filteredColonies: any[];

  public countries: any[];
  public filteredCountries: any[];

  public domicilioForm = new FormGroup({
    pais: new FormControl('', Validators.required),
    estado: new FormControl('', Validators.required),
    codigo_postal: new FormControl('', Validators.required),
    calle: new FormControl(''),
    municipio: new FormControl(''),
    localidad: new FormControl(''),
    numero_exterior: new FormControl(''),
    numero_interior: new FormControl(''),
    colonia: new FormControl(''),
    referencia: new FormControl(''),
  });

  constructor(private cataloguesListService: CataloguesListService) {
    this.cataloguesListService.countriesSubject.subscribe((data: any[]) => {
      this.countries = data;
      this.filteredCountries = [...data];
    });
  }

  public async ngOnInit(): Promise<void> {
    this.domicilioForm.get('pais').valueChanges.subscribe(async (newVal: any) => {
      if (newVal) {
        this.states = await this.cataloguesListService.getCatalogue('states', {
          pais: newVal,
        });
      }

      this.domicilioForm.patchValue({
        estado: this.domicilioForm.value.estado,
      });
      this.filteredStates = Object.assign([], this.states);
    });

    this.domicilioForm.get('estado').valueChanges.subscribe(async (inputValue: any = '') => {
      //if value just changed
      if (typeof inputValue == 'string') {
        if (inputValue) {
          this.localities = await this.cataloguesListService.getCatalogue('locations', { estado: inputValue });
          this.municipalities = await this.cataloguesListService.getCatalogue('municipalities', { estado: inputValue });
        }
        this.filteredMunicipalities = [...this.municipalities];
        this.filteredLocalities = [...this.localities];
      }
      const { municipio, localidad } = this.domicilioForm.value;
      this.domicilioForm.patchValue({ municipio, localidad });
    });

    await this.getColonias(this.domicilioForm.value.codigo_postal);
    this.domicilioForm.patchValue(this.domicilioForm.value);

    this.domicilioForm.valueChanges.subscribe((val) => {
      this.locationInfoChanges.emit(val);
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.locationInfo?.currentValue) {
      this.domicilioForm.patchValue(this.locationInfo);
    }
  }

  public async getColonias(event: FocusEvent | string): Promise<void> {
    let postalCode = event;
    if (typeof event !== 'string') {
      postalCode = event.target['value'];
    }
    if (postalCode) {
      this.colonies = await this.cataloguesListService.getCatalogue('suburbs', {
        cp: postalCode,
      });
      this.filteredColonies = [...this.colonies];
    } else this.filteredColonies = [];

    this.domicilioForm.patchValue({
      colonia: this.infoIsLoaded ? '' : this.domicilioForm.value.colonia,
    });
  }

  public clearDependentInputs() {
    this.domicilioForm.patchValue({
      estado: '',
      municipio: '',
      localidad: '',
    });
  }

  public searchCountries(code: string): void {
    searchInList(this, 'countries', 'filteredCountries', code);
  }

  public searchStates(code: string): void {
    searchInList(this, 'states', 'filteredStates', code, 'clave', 'nombre');
  }

  public searchMunicipalities(code: string): void {
    searchInList(this, 'municipalities', 'filteredMunicipalities', code, 'clave', 'nombre');
  }

  public searchLocalities(code: string): void {
    searchInList(this, 'localities', 'filteredLocalities', code, 'clave', 'nombre');
  }

  public searchColonies(code: string): void {
    searchInList(this, 'colonies', 'filteredColonies', code, 'clave', 'nombre');
  }
}
