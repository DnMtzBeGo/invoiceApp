import {
  Component,
  Input,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { MatTable } from "@angular/material/table";
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { Pedimento } from "../../../../models/invoice/carta-porte/ubicaciones";
import { CartaPorteInfoService } from "../services/carta-porte-info.service";
import { CommodityComponent } from "../../../commodity/commodity.component";
import { CataloguesListService } from "../services/catalogues-list.service";

const ELEMENT_DATA: Pedimento[] = [];

@Component({
  selector: "app-mercancias",
  templateUrl: "./mercancias.component.html",
  styleUrls: ["./mercancias.component.scss"],
})
export class MercanciasComponent implements OnInit {
  @ViewChildren(CommodityComponent) commodityRef: QueryList<CommodityComponent>;
  @ViewChild(MatTable) table: MatTable<Pedimento>;

  @Input() info: any;

  displayedColumns: string[] = ["value", "action"];
  dataSource = [...ELEMENT_DATA];

  public pesoBrutoTotal: number;
  public filteredUnidadPeso: any[] = [];
  public unidadPeso: any[];
  public numTotalMercancias: number;

  public commodities: Array<any> = [1];
  public monedas: any[] = [
    { clave: "MXN", valor: "MXN" },
    { clave: "USD", valor: "USD" },
  ];

  public mercanciasForm = new FormGroup({
    peso_bruto_total: new FormControl("", Validators.required),
    unidad_peso: new FormControl("", Validators.required),
  });

  constructor(
    public cartaPorteInfoService: CartaPorteInfoService,
    private cataloguesListService: CataloguesListService
  ) {
    this.cataloguesListService.consignmentNoteSubject.subscribe((data: any) => {
      this.unidadPeso = data.unidades_de_peso;
      this.filteredUnidadPeso = Object.assign([], this.unidadPeso);
    });
  }

  async ngOnInit(): Promise<void> {
    this.cartaPorteInfoService.infoRecolector.subscribe(() => {
      const mercancia = this.sendDataToService();
      const { peso_bruto_total, unidad_peso } = this.mercanciasForm.value;
      this.cartaPorteInfoService.addRecoletedInfoMercancias({
        peso_bruto_total: peso_bruto_total,
        unidad_peso: unidad_peso,
        num_total_mercancias: mercancia.length,
        mercancia: mercancia,
        // isValid: this.isValid()
      });
    });

    this.mercanciasForm.controls.unidad_peso.valueChanges.subscribe(
      (inputValue) => {
        if (inputValue) {
          this.filteredUnidadPeso = this.unidadPeso.filter((e) => {
            const currentValue = `${e.clave} ${e.nombre}`.toLowerCase();
            const input =
              inputValue && typeof inputValue == "object"
                ? `${inputValue.clave} ${inputValue.nombre}`.toLowerCase()
                : inputValue.toLowerCase();
            return currentValue.includes(input);
          });
        }
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.info && this.info) {
      const { mercancia, peso_bruto_total, unidad_peso } = this.info;
      if (mercancia) this.commodities = mercancia;
      this.mercanciasForm.patchValue({
        peso_bruto_total,
        unidad_peso,
      });
    }
  }

  addPedimento() {
    this.commodities.push(1);
  }

  removeData() {
    if (this.commodities.length > 1) this.commodities.pop();
  }

  public sendDataToService() {
    return this.commodityRef.toArray().map((e) => {
      const info = e.commodity.value;
      const response = {
        clave_unidad: info.claveUnidad,
        peso_en_kg: info.peso,
        material_peligroso: info.materialPeligroso ? "Sí" : "No",
        cve_material_peligroso: e.commodity.value.claveMaterialPeligroso
          ? e.commodity.value.claveMaterialPeligroso
          : "",
        embalaje: info.embalaje,
        descrip_embalaje: info.embalaje?.descripcion,
        bienes_transp: e.commodity.value.bienesTransportados,
        descripcion: e.commodity.value.bienesTransportadosDescripcion,
        dimensiones: info.dimensiones,
        valor_mercancia: parseFloat(info.valorMercancia),
        moneda: info.moneda,
        cantidad: parseInt(info.cantidad),

        pedimentos: info.pedimento,
      };

      if (!info.materialPeligroso) {
        delete response.cve_material_peligroso;
        delete response.embalaje;
      }
      return response;
    });
  }

  public isValid() {
    if (this.commodityRef) {
      const commodityRef = this.commodityRef.toArray();

      const validityArr = commodityRef.filter(
        (x): any => x.commodity.status == "VALID"
      );
      const validity = validityArr.length == commodityRef.length;
      return validity;
    }
  }

  getUnidadPesoText(option: string): string {
    let stateFound = option
      ? this.unidadPeso.find((x) => x.clave === option)
      : undefined;
    return stateFound
      ? `${stateFound.clave} - ${stateFound.nombre}`
      : undefined;
  }
}
