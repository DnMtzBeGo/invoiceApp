import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CataloguesListService } from "../invoice/carta-porte/services/catalogues-list.service";

@Component({
  selector: "app-location",
  templateUrl: "./location.component.html",
  styleUrls: [
    "./location.component.scss",
    "../invoice/carta-porte/ubicaciones/components/ubicacion/ubicacion.component.scss",
  ],
})
export class LocationComponent implements OnInit {
  @Input() locationInfo: any;
  @Output() locationInfoChanges = new EventEmitter<any>();

  public infoIsLoaded: boolean = false;

  public estados: any[] = [];
  public filteredEstados: any[];

  public municipios: any[] = [];
  public filteredMunicipios: any[];

  public localidades: any[] = [];
  public filteredLocalidades: any[];

  public colonias: any[] = [];
  public filteredColonias: any[];

  public paisCatalogue: any[];

  public domicilioForm = new FormGroup({
    pais: new FormControl("", Validators.required),
    estado: new FormControl("", Validators.required),
    codigo_postal: new FormControl("", Validators.required),
    calle: new FormControl(""),
    municipio: new FormControl(""),
    localidad: new FormControl(""),
    numero_exterior: new FormControl(""),
    numero_interior: new FormControl(""),
    colonia: new FormControl(""),
    referencia: new FormControl(""),
  });

  constructor(private cataloguesListService: CataloguesListService) {
    this.cataloguesListService.countriesSubject.subscribe((data: any[]) => {
      this.paisCatalogue = data;
    });
  }

  async ngOnInit(): Promise<void> {
    this.domicilioForm.controls.pais.valueChanges.subscribe(
      async (newVal: any) => {
        if (newVal) {
          this.estados = await this.cataloguesListService.getCatalogue(
            "states",
            {
              pais: newVal,
            }
          );
        }

        this.domicilioForm.patchValue({
          estado: this.domicilioForm.value.estado,
        });
        this.filteredEstados = Object.assign([], this.estados);
      }
    );

    this.domicilioForm.controls.estado.valueChanges.subscribe(
      async (inputValue = "") => {
        this.filteredEstados = this.estados.filter((e) => {
          const currentValue = `${e.clave} ${e.nombre}`.toLowerCase();
          const input =
            inputValue && typeof inputValue == "object"
              ? `${inputValue.clave} ${inputValue.nombre}`.toLowerCase()
              : inputValue.toLowerCase();
          return currentValue.includes(input);
        });
        //if value just changed
        if (typeof inputValue == "string") {
          if (inputValue) {
            this.localidades = await this.cataloguesListService.getCatalogue(
              "locations",
              { estado: inputValue }
            );
            this.municipios = await this.cataloguesListService.getCatalogue(
              "municipalities",
              { estado: inputValue }
            );
          }
          this.filteredMunicipios = Object.assign([], this.municipios);
          this.filteredLocalidades = Object.assign([], this.localidades);
        }
        const { municipio, localidad } = this.domicilioForm.value;
        this.domicilioForm.patchValue({ municipio, localidad });
      }
    );

    this.domicilioForm.controls.municipio.valueChanges.subscribe(
      (inputValue = "") => {
        this.filteredMunicipios = this.municipios.filter((e) => {
          const currentValue = `${e.clave} ${e.nombre}`.toLowerCase();
          const input =
            inputValue && typeof inputValue == "object"
              ? `${inputValue.clave} ${inputValue.nombre}`.toLowerCase()
              : inputValue.toLowerCase();
          return currentValue.includes(input);
        });
      }
    );

    this.domicilioForm.controls.colonia.valueChanges.subscribe(
      (inputValue = "") => {
        this.filteredColonias = this.colonias.filter((e) => {
          const currentValue = `${e.clave} ${e.nombre}`.toLowerCase();
          const input =
            inputValue && typeof inputValue == "object"
              ? `${inputValue.clave} ${inputValue.nombre}`.toLowerCase()
              : inputValue.toLowerCase();
          return currentValue.includes(input);
        });
      }
    );

    this.domicilioForm.controls.localidad.valueChanges.subscribe(
      (inputValue = "") => {
        this.filteredLocalidades = this.localidades.filter((e) => {
          const currentValue = `${e.clave} ${e.nombre}`.toLowerCase();
          const input =
            inputValue && typeof inputValue == "object"
              ? `${inputValue.clave} ${inputValue.nombre}`.toLowerCase()
              : inputValue.toLowerCase();
          return currentValue.includes(input);
        });
      }
    );

    await this.getColonias(this.domicilioForm.value.codigo_postal);
    this.domicilioForm.patchValue(this.domicilioForm.value);

    this.domicilioForm.valueChanges.subscribe((val) => {
      this.locationInfoChanges.emit(val);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.locationInfo?.currentValue) {
      this.domicilioForm.patchValue(this.locationInfo);
    }
  }

  async getColonias(event: FocusEvent | string): Promise<void> {
    let postalCode = event;
    if (typeof event !== "string") {
      postalCode = event.target["value"];
    }
    if (postalCode) {
      this.colonias = await this.cataloguesListService.getCatalogue("suburbs", {
        cp: postalCode,
      });
    }
    this.filteredColonias = Object.assign([], this.colonias);
    this.domicilioForm.patchValue({
      colonia: this.infoIsLoaded ? "" : this.domicilioForm.value.colonia,
    });
  }

  clearDependentInputs() {
    this.domicilioForm.patchValue({
      estado: "",
      municipio: "",
      localidad: "",
    });
  }

  getLocationText(filtered, option) {
    let stateFound = option
      ? this[filtered].find((x) => x.clave === option)
      : undefined;
    return stateFound
      ? `${stateFound.clave} - ${stateFound.nombre}`
      : undefined;
  }
}
