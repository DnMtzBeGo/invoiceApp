import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { CartaPorteInfoService } from "../../../services/carta-porte-info.service";
import { CataloguesListService } from "../../../services/catalogues-list.service";
import { MatTable } from "@angular/material/table";

@Component({
  selector: "app-figura",
  templateUrl: "./figura.component.html",
  styleUrls: ["./figura.component.scss"],
})
export class FiguraComponent implements OnInit {
  @ViewChild(MatTable) table: MatTable<any>;
  @Input() figuraInfo: any;

  dataSource: Array<object> = [];
  displayedColumns: string[] = ["value", "action"];

  public locationComponentInfo: any;

  public figuraTransporteForm = new FormGroup({
    partes_transporte: new FormControl([], Validators.required),
    tipo_figura: new FormControl("", Validators.required),
    rfc_figura: new FormControl(
      "",
      Validators.compose([
        Validators.pattern(
          /^([A-Z&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z\d&]{2}(?:[A\d]))?$/
        ),
        Validators.required,
      ])
    ),
    nombre_figura: new FormControl(""),
    residencia_fiscal_figura: new FormControl("", Validators.required),
    num_reg_id_trib_figura: new FormControl("", Validators.required),
    parteTransporte: new FormControl(""),
    num_licencia: new FormControl(""),
  });

  public domicilioForm = new FormGroup({
    pais: new FormControl(""),
    estado: new FormControl(""),
    codigo_postal: new FormControl(""),
    calle: new FormControl(""),
    municipio: new FormControl(""),
    localidad: new FormControl(""),
    numero_exterior: new FormControl("", Validators.pattern("^[0-9]*$")),
    numero_interior: new FormControl("", Validators.pattern("^[0-9]*$")),
    colonia: new FormControl(""),
    referencia: new FormControl(""),
  });

  public tiposDeTransporte;

  public parteTransporte: any[] = [];
  public filteredParteTransporte: any[];

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
      clave: "Origen",
      descripcion: "Origen",
    },
    {
      clave: "Destino",
      descripcion: "Destino",
    },
  ];
  public residenciaFiscal: any[];
  public paisCatalogue: any[];

  public hideResidenciaRegistro: boolean = false;
  
  constructor(
    public cataloguesListService: CataloguesListService,
    public cartaPorteInfoService: CartaPorteInfoService
  ) {
    this.cataloguesListService.countriesSubject.subscribe((data: any[]) => {
      this.residenciaFiscal = data;
      this.paisCatalogue = data;
    });

    this.cataloguesListService.consignmentNoteSubject.subscribe((data: any) => {
      this.tiposDeTransporte = data.figuras_de_transporte;
      this.parteTransporte = data.partes_del_transporte;
      this.filteredParteTransporte = Object.assign([], this.parteTransporte);
    });
  }

  async ngOnInit(): Promise<void> {

    this.figuraTransporteForm.get("rfc_figura").statusChanges.subscribe((val) => {
      if (val === 'VALID') {
        if(!this.figuraTransporteForm.get('rfc_figura')) this.figuraTransporteForm.addControl('rfc_figura', new FormControl(
          '',
          Validators.compose([
            Validators.pattern(
              /^([A-Z&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z\d&]{2}(?:[A\d]))?$/
            ),
            Validators.required,
          ])
        ));
        this.figuraTransporteForm.removeControl('residencia_fiscal_figura');
        this.figuraTransporteForm.removeControl('num_reg_id_trib_figura');
        this.hideResidenciaRegistro = true;
      } else {
        this.figuraTransporteForm.removeControl('rfc_figura');
        if(!this.figuraTransporteForm.get('residencia_fiscal_figura')) this.figuraTransporteForm.addControl('residencia_fiscal_figura', new FormControl('', Validators.required));
        if(!this.figuraTransporteForm.get('num_reg_id_trib_figura')) this.figuraTransporteForm.addControl('num_reg_id_trib_figura', new FormControl('', Validators.required));
        this.hideResidenciaRegistro = false;
      }
    });

    this.figuraTransporteForm.controls.parteTransporte.valueChanges.subscribe(
      (inputValue) => {
        if (inputValue) {
          this.filteredParteTransporte = this.parteTransporte.filter((e) => {
            const currentValue = `${e.clave} ${e.descripcion}`.toLowerCase();
            const input =
              inputValue && typeof inputValue == "object"
                ? `${inputValue.clave} ${inputValue.descripcion}`.toLowerCase()
                : inputValue.toLowerCase();
            return currentValue.includes(input);
          });
        }
      }
    );

    this.domicilioForm.controls.pais.valueChanges.subscribe(
      async (newVal: any) => {
        if (newVal) {
          this.estados = await this.cataloguesListService.getCatalogue(
            "states",
            {
              pais: newVal,
            }
          );
          this.filteredEstados = Object.assign([], this.estados);
        }
        this.domicilioForm.patchValue({ estado: "" });
      }
    );

    this.domicilioForm.controls.estado.valueChanges.subscribe(
      async (inputValue = "") => {
        this.filteredEstados = this.estados.filter((e) => {
          const currentValue = `${e.clave} ${e.nombre}`.toLowerCase();
          const input =
            inputValue && typeof inputValue == "object"
              ? `${inputValue.clave} ${inputValue.nombre}`
              : inputValue.toLowerCase();
          return currentValue.includes(input);
        });
        //if value just changed
        if (typeof inputValue == "string") {
          if (inputValue) {
            this.localidades = await this.cataloguesListService.getCatalogue(
              "locations",
              {
                estado: inputValue,
              }
            );
            this.municipios = await this.cataloguesListService.getCatalogue(
              "municipalities",
              { estado: inputValue }
            );
          }
          this.filteredMunicipios = Object.assign([], this.municipios);
          this.filteredLocalidades = Object.assign([], this.localidades);
        }
        this.domicilioForm.patchValue({
          municipio: "",
          localidades: "",
        });
      }
    );

    this.domicilioForm.controls.municipio.valueChanges.subscribe(
      (inputValue = "") => {
        this.filteredMunicipios = this.municipios.filter((e) => {
          const currentValue = `${e.clave} ${e.nombre}`.toLowerCase();
          const input =
            inputValue && typeof inputValue == "object"
              ? `${inputValue.clave} ${inputValue.nombre}`
              : inputValue.toLowerCase();
          return currentValue.includes(input);
        });
      }
    );

    this.domicilioForm.controls.codigo_postal.valueChanges.subscribe(
      async (inputValue = "") => {
        if (inputValue) {
          this.colonias = await this.cataloguesListService.getCatalogue(
            "suburbs",
            { cp: inputValue }
          );
          this.filteredColonias = Object.assign([], this.colonias);
        }
        this.domicilioForm.patchValue({ colonia: "" });
      }
    );

    this.domicilioForm.controls.localidad.valueChanges.subscribe(
      (inputValue = "") => {
        this.filteredLocalidades = this.localidades.filter((e) => {
          const currentValue = `${e.clave} ${e.nombre}`.toLowerCase();
          const input =
            inputValue && typeof inputValue == "object"
              ? `${inputValue.clave} ${inputValue.nombre}`
              : inputValue.toLowerCase();
          return currentValue.includes(input);
        });
      }
    );
    this.updatePartesTransporte();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.figuraInfo?.currentValue) {
      this.figuraTransporteForm.patchValue(this.figuraInfo);
      this.updatePartesTransporte();
    }
  }

  // formChanged() {
  //   console.log("Figura Transporte: ", this.figuraTransporteForm);
  //   console.log("Domicilio: ", this.domicilioForm);
  // }

  getAutoCompleteText(option) {
    return "";
    return option ? `${option.clave} - ${option.descripcion}` : "";
  }

  getLocationText(filtered, option) {
    let stateFound = option
      ? this[filtered].find((x) => x.clave === option)
      : undefined;
    return stateFound
      ? `${stateFound.clave} - ${stateFound.nombre}`
      : undefined;
  }

  async addParteTransporte(valueParteTransporte) {
    this.dataSource.push({
      clave: valueParteTransporte.clave,
      descripcion: valueParteTransporte.descripcion,
    });
    this.table?.renderRows();
    this.figuraTransporteForm.get("parteTransporte").reset();

    let partes_transporte = this.dataSource.map((x: any) => ({
      parte_transporte: x.clave,
    }));

    this.figuraTransporteForm.patchValue({ partes_transporte });
    this.filteredParteTransporte = this.parteTransporte;
    (document.activeElement as HTMLElement).blur();
  }

  removeData(id) {
    this.dataSource = this.dataSource.filter((item, index) => index !== id);
    this.table.renderRows();
  }

  catchLocationInfoChanges(info: any) {
    this.locationComponentInfo = info;
  }

  updatePartesTransporte() {
    this.dataSource = this.figuraInfo.partes_transporte || [];
    if (this.figuraInfo.partes_transporte) {
      const dataSource = this.figuraInfo.partes_transporte.map((e) => {
        return this.parteTransporte.find((t) => {
          return e.parte_transporte == t.clave;
        });
      });

      if (!dataSource.some((e) => e == undefined)) {
        this.dataSource = dataSource;
      }
    }
  }
}
