import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CartaPorteInfoService } from '../../../services/carta-porte-info.service';
import { CataloguesListService } from '../../../services/catalogues-list.service';
import { MatTable } from '@angular/material/table';
import { searchInList } from 'src/app/pages/invoice/containers/factura-edit-page/factura.core';

@Component({
  selector: 'app-figura',
  templateUrl: './figura.component.html',
  styleUrls: ['./figura.component.scss'],
})
export class FiguraComponent implements OnInit {
  @ViewChild(MatTable) table: MatTable<any>;
  @Input() figuraInfo: any;

  public dataSource: Array<object> = [];
  public displayedColumns: string[] = ['value', 'action'];

  public locationComponentInfo: any;

  public figuraTransporteForm = new FormGroup({
    partes_transporte: new FormControl([], Validators.required),
    tipo_figura: new FormControl('', Validators.required),
    rfc_figura: new FormControl(
      '',
      Validators.compose([
        Validators.pattern(/^([A-Z&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z\d&]{2}(?:[A\d]))?$/),
        Validators.required,
      ]),
    ),
    nombre_figura: new FormControl(''),
    residencia_fiscal_figura: new FormControl('', Validators.required),
    num_reg_id_trib_figura: new FormControl('', Validators.required),
    transportParts: new FormControl(''),
    num_licencia: new FormControl(''),
  });

  public domicilioForm = new FormGroup({
    pais: new FormControl(''),
    estado: new FormControl(''),
    codigo_postal: new FormControl(''),
    calle: new FormControl(''),
    municipio: new FormControl(''),
    localidad: new FormControl(''),
    numero_exterior: new FormControl('', Validators.pattern('^[0-9]*$')),
    numero_interior: new FormControl('', Validators.pattern('^[0-9]*$')),
    colonia: new FormControl(''),
    referencia: new FormControl(''),
  });

  public tiposDeTransporte;

  public transportParts: any[] = [];
  public filteredTransportParts: any[];

  public estados: any[] = [];
  public filteredEstados: any[];

  public municipios: any[] = [];
  public filteredMunicipios: any[];

  public localidades: any[] = [];
  public filteredLocalidades: any[];

  public colonias: any[] = [];
  public filteredColonias: any[];

  public tipoEstacionOptions: any[];

  public tipoUbicacion: any[] = [
    {
      clave: 'Origen',
      descripcion: 'Origen',
    },
    {
      clave: 'Destino',
      descripcion: 'Destino',
    },
  ];

  public countriesOfResidence: any[];
  public filteredCountriesOfResidence: any[];

  public hideCountryOfResidence: boolean = true;

  constructor(
    public cataloguesListService: CataloguesListService,
    public cartaPorteInfoService: CartaPorteInfoService,
  ) {
    this.cataloguesListService.countriesSubject.subscribe((data: any[]) => {
      this.countriesOfResidence = data;
      this.filteredCountriesOfResidence = [...data];
    });

    this.cataloguesListService.consignmentNoteSubject.subscribe((data: any) => {
      this.transportParts = data.partes_del_transporte;
      this.filteredTransportParts = [...data.partes_del_transporte];

      this.tiposDeTransporte = data.figuras_de_transporte;

      this.loadCatalogs1();
    });
  }

  public async loadCatalogs1() {
    this.updatePartesTransporte();

    this.figuraTransporteForm.get('rfc_figura').valueChanges.subscribe((val) => {
      if (val.toUpperCase() === 'XEXX010101000') {
        if (!this.figuraTransporteForm.get('residencia_fiscal_figura'))
          this.figuraTransporteForm.addControl('residencia_fiscal_figura', new FormControl('', Validators.required));
        if (!this.figuraTransporteForm.get('num_reg_id_trib_figura'))
          this.figuraTransporteForm.addControl('num_reg_id_trib_figura', new FormControl('', Validators.required));

        this.hideCountryOfResidence = false;
      } else {
        this.figuraTransporteForm.removeControl('residencia_fiscal_figura');
        this.figuraTransporteForm.removeControl('num_reg_id_trib_figura');
        this.hideCountryOfResidence = true;
      }
    });

    this.figuraTransporteForm.get('rfc_figura').statusChanges.subscribe((val) => {
      if (val === 'VALID')
        if (!this.figuraTransporteForm.get('rfc_figura'))
          this.figuraTransporteForm.addControl(
            'rfc_figura',
            new FormControl(
              '',
              Validators.compose([
                Validators.pattern(
                  /^([A-Z&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z\d&]{2}(?:[A\d]))?$/,
                ),
                Validators.required,
              ]),
            ),
          );
    });
  }

  async ngOnInit(): Promise<void> {
    this.domicilioForm.controls.pais.valueChanges.subscribe(async (newVal: any) => {
      if (newVal) {
        this.estados = await this.cataloguesListService.getCatalogue('states', {
          pais: newVal,
        });
        this.filteredEstados = Object.assign([], this.estados);
      }
      this.domicilioForm.patchValue({ estado: '' });
    });

    this.domicilioForm.controls.estado.valueChanges.subscribe(async (inputValue: any = '') => {
      this.filteredEstados = this.estados.filter((e) => {
        const currentValue = `${e.clave} ${e.nombre}`.toLowerCase();
        const input =
          inputValue && typeof inputValue == 'object'
            ? `${inputValue.clave} ${inputValue.nombre}`
            : inputValue.toLowerCase();
        return currentValue.includes(input);
      });
      //if value just changed
      if (typeof inputValue == 'string') {
        if (inputValue) {
          this.localidades = await this.cataloguesListService.getCatalogue('locations', {
            estado: inputValue,
          });
          this.municipios = await this.cataloguesListService.getCatalogue('municipalities', { estado: inputValue });
        }
        this.filteredMunicipios = Object.assign([], this.municipios);
        this.filteredLocalidades = Object.assign([], this.localidades);
      }
      this.domicilioForm.patchValue({
        municipio: '',
        localidad: '',
      });
    });

    this.domicilioForm.controls.municipio.valueChanges.subscribe((inputValue: any = '') => {
      this.filteredMunicipios = this.municipios.filter((e) => {
        const currentValue = `${e.clave} ${e.nombre}`.toLowerCase();
        const input =
          inputValue && typeof inputValue == 'object'
            ? `${inputValue.clave} ${inputValue.nombre}`
            : inputValue.toLowerCase();
        return currentValue.includes(input);
      });
    });

    this.domicilioForm.controls.codigo_postal.valueChanges.subscribe(async (inputValue = '') => {
      if (inputValue) {
        this.colonias = await this.cataloguesListService.getCatalogue('suburbs', { cp: inputValue });
        this.filteredColonias = Object.assign([], this.colonias);
      }
      this.domicilioForm.patchValue({ colonia: '' });
    });

    this.domicilioForm.controls.localidad.valueChanges.subscribe((inputValue: any = '') => {
      this.filteredLocalidades = this.localidades.filter((e) => {
        const currentValue = `${e.clave} ${e.nombre}`.toLowerCase();
        const input =
          inputValue && typeof inputValue == 'object'
            ? `${inputValue.clave} ${inputValue.nombre}`
            : inputValue.toLowerCase();
        return currentValue.includes(input);
      });
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.figuraInfo?.currentValue) {
      this.figuraTransporteForm.patchValue(this.figuraInfo);
      this.updatePartesTransporte();
    }
  }

  // formChanged() {
  //   console.log("Figura Transporte: ", this.figuraTransporteForm);
  //   console.log("Domicilio: ", this.domicilioForm);
  // }

  public getAutoCompleteText(option) {
    return '';
    return option ? `${option.clave} - ${option.descripcion}` : '';
  }

  public getLocationText(filtered, option) {
    let stateFound = option ? this[filtered].find((x) => x.clave === option) : undefined;
    return stateFound ? `${stateFound.clave} - ${stateFound.nombre}` : undefined;
  }

  public async addParteTransporte(valueParteTransporte) {
    this.dataSource.push({
      clave: valueParteTransporte.clave,
      descripcion: valueParteTransporte.descripcion,
    });
    this.table?.renderRows();
    this.figuraTransporteForm.get('transportParts').reset();

    let partes_transporte = this.dataSource.map((x: any) => ({
      parte_transporte: x.clave,
    }));

    this.figuraTransporteForm.patchValue({ partes_transporte });
    this.filteredTransportParts = this.transportParts;
    (document.activeElement as HTMLElement).blur();
  }

  public removeData(id) {
    console.log(this.figuraInfo);
    this.dataSource = this.dataSource.filter((item, index) => index !== id);
    this.figuraInfo.partes_transporte.splice(id, 1);
    this.table.renderRows();
  }

  public catchLocationInfoChanges(info: any) {
    this.locationComponentInfo = info;
  }

  public updatePartesTransporte() {
    this.dataSource = this.figuraInfo?.partes_transporte || [];
    if (this.figuraInfo?.partes_transporte) {
      if (this.transportParts?.length) {
        const dataSource = this.figuraInfo.partes_transporte.map((el) => {
          return this.transportParts.find((t) => {
            return el.parte_transporte == t.clave;
          });
        });

        if (!dataSource.some((e) => e == undefined)) {
          this.dataSource = dataSource;
        }
      }
    }
  }

  public searchCountryOfResidence(code: string): void {
    searchInList(this, 'countriesOfResidence', 'filteredCountriesOfResidence', code);
  }

  public searchTransportPart(code: string): void {
    searchInList(this, 'transportParts', 'filteredTransportParts', code, 'clave', 'descripcion');
  }
}
