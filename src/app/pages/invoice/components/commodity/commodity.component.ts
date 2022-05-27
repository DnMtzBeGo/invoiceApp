import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatTable } from "@angular/material/table";
import { CartaPorteInfoService } from '../invoice/carta-porte/services/carta-porte-info.service';
import { CataloguesListService } from "../invoice/carta-porte/services/catalogues-list.service";
@Component({
  selector: "app-commodity",
  templateUrl: "./commodity.component.html",
  styleUrls: ["./commodity.component.scss"],
})
export class CommodityComponent implements OnInit {
  @ViewChild(MatTable) table: MatTable<any>;
  @Input() dataCoin: any;
  @Input() commodityInfo: any;
  public embalaje: Array<object> = [];
  public filteredBienesTransportados: any[] = [];
  public bienesTransportados: any[] = [];
  public claveUnidad: any[] = [];
  public filteredClaveUnidad: any[];
  public materialPeligroso: any[] = [];
  public filteredMaterialPeligroso: any[];
  public pedimento: any[] = [];
  public dataSourcePedimento: Array<object> = [];
  public displayedColumns: string[] = ["value", "action"];
  public showFraccion: boolean = false;
  public commodity: any = new FormGroup({
    bienesTransportados: new FormControl(""),
    bienesTransportadosDescripcion: new FormControl(""),
    // claveSCTT: new FormControl(''),
    claveUnidad: new FormControl(""),
    dimensiones: new FormControl(
      "",
      Validators.compose([
        Validators.pattern(/^\d{1,3}\/\d{1,3}\/\d{1,3}(cm|plg)$/),
      ])
    ),
    peso: new FormControl(""),
    valorMercancia: new FormControl(""),
    moneda: new FormControl("MXN"),
    pedimento: new FormControl(""),
    materialPeligroso: new FormControl(false),
    claveMaterialPeligroso: new FormControl(""),
    embalaje: new FormControl(""),
    cantidad: new FormControl(""),
    fraccionArancelaria: new FormControl(''),
    UUIDComercioExt: new FormControl(     '',
    Validators.compose([
      Validators.pattern(/^[a-f0-9A-F]{8}-[a-f0-9A-F]{4}-[a-f0-9A-F]{4}-[a-f0-9A-F]{4}-[a-f0-9A-F]{12}$/),
    ]))
  });

  constructor(
    private catalogListService: CataloguesListService,
    private cartaPorteInfoService: CartaPorteInfoService
  ) {}

  async ngOnInit() {
    this.cartaPorteInfoService.emitShowFraccion.subscribe((value) => {
      if(value) this.showFraccion = true;
      else this.showFraccion = false;
    })
    
    this.catalogListService.consignmentNoteSubject.subscribe((data: any) => {
      this.embalaje = data.tipos_de_embalaje;
      this.claveUnidad = data.claves_de_unidad;
      this.filteredClaveUnidad = Object.assign([], this.claveUnidad);
    });
    //Obtener Autocomplete de Bienes Transportados
    this.commodity.controls.bienesTransportados.valueChanges.subscribe(
      async (val: string) => {
        if (val !== "") {
          this.bienesTransportados = await this.catalogListService.getCatalogue(
            "consignment-note/productos-y-servicios",
            {
              term: val,
              limit: 30,
            }
          );
          this.filteredBienesTransportados = Object.assign(
            [],
            this.bienesTransportados
          );

          if (this.filteredBienesTransportados.length < 1) {
            let productsCatalogs = await this.catalogListService.getCatalogue(
              "consignment-note/productos-y-servicios",
              {
                term: "01010101",
                limit: 1,
              }
            );
            this.filteredBienesTransportados = Object.assign(
              [],
              productsCatalogs
            );
          }
        }
      }
    );

    //Obtener Autocomplete de Material Peligroso
    this.commodity.controls.claveMaterialPeligroso.valueChanges.subscribe(
      async (val: string) => {
        if (val !== "") {
          this.materialPeligroso = await this.catalogListService.getCatalogue(
            "consignment-note/material-peligroso",
            {
              term: val,
              limit: 30,
            }
          );
          this.filteredMaterialPeligroso = Object.assign(
            [],
            this.materialPeligroso
          );
        }
      }
    );

    this.commodity.controls.claveUnidad.valueChanges.subscribe(
      async (val: any) => {
        if (val !== "") {
          this.filteredClaveUnidad = this.claveUnidad.filter((e) => {
            const currentValue = `${e.clave} ${e.nombre}`.toLowerCase();
            const input =
              typeof val == "string"
                ? val.toLowerCase()
                : val
                ? `${val.clave} ${val.nombre}`.toLowerCase()
                : "";
            return currentValue.includes(input);
          });
        }
      }
    );
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.commodityInfo && this.commodityInfo) {
      const {
        bienes_transp,
        cantidad,
        clave_unidad,
        dimensiones,
        moneda,
        pedimentos,
        peso_en_kg,
        valor_mercancia,
        embalaje,
        material_peligroso,
        cve_material_peligroso,
      } = this.commodityInfo;
      if (pedimentos) this.dataSourcePedimento = pedimentos;
      if (bienes_transp) {
        this.bienesTransportados = await this.catalogListService.getCatalogue(
          "consignment-note/productos-y-servicios",
          { term: bienes_transp }
        );
      }
      if (cve_material_peligroso) {
        this.materialPeligroso = await this.catalogListService.getCatalogue(
          "consignment-note/material-peligroso",
          {
            term: cve_material_peligroso,
            limit: 30,
          }
        );
      }
      this.commodity.patchValue({
        bienesTransportados: bienes_transp,
        // claveSCTT: new FormControl(''),
        claveUnidad: clave_unidad,
        dimensiones: dimensiones,
        peso: peso_en_kg,
        valorMercancia: valor_mercancia,
        moneda: moneda,
        pedimento: pedimentos,
        materialPeligroso: material_peligroso == "Sí",
        claveMaterialPeligroso: cve_material_peligroso,
        embalaje: embalaje,
        cantidad: cantidad,
      });
    }
  }

  async addPedimento(event: KeyboardEvent) {
    const valuePedimento = event.target["value"];
    event.target["value"] = "";
    this.dataSourcePedimento.push({
      pedimento: valuePedimento,
    });
    this.table?.renderRows();
    this.commodity.get("pedimento").reset();
    this.commodity.patchValue({ pedimento: this.dataSourcePedimento });
  }

  getBienesTransportadosText(option: string) {
    const optionInfo = this.bienesTransportados.find((e) => e.code == option);
    this.commodity.patchValue({
      bienesTransportadosDescripcion: optionInfo?.description,
    });
    return optionInfo ? `${optionInfo.code} - ${optionInfo.description}` : "";
  }

  getClaveUnidadText(option) {
    let stateFound = option
      ? this.claveUnidad.find((x) => x.clave === option)
      : undefined;
    return stateFound
      ? `${stateFound.clave} - ${stateFound.nombre}`
      : undefined;
  }

  getMaterialPeligrosoText(option: string) {
    const optionInfo = this.materialPeligroso.find((e) => e.clave == option);
    return optionInfo ? `${optionInfo.clave} - ${optionInfo.descripcion}` : "";
  }

  removeData(id) {
    this.dataSourcePedimento = this.dataSourcePedimento.filter(
      (item, index) => index !== id
    );
    this.table.renderRows();
  }

  acceptOnlyNumbers(event: Event): void {
    event.target["value"] = event.target["value"].replace(/\D/g, "");
  }
}
