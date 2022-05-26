import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { CartaPorteCountries } from "src/app/pages/invoice/models/invoice/carta-porte/CartaPorteCountries";
import { ClavesDeTransporte } from "src/app/pages/invoice/models/invoice/carta-porte/ClavesDeTransporte";
import { SubtiposRemolques } from "src/app/pages/invoice/models/invoice/carta-porte/subtipos-remolques";
import { TiposDePermiso } from "src/app/pages/invoice/models/invoice/carta-porte/TiposDePermiso";
import { CartaPorteInfoService } from "../services/carta-porte-info.service";
import { CataloguesListService } from "../services/catalogues-list.service";

@Component({
  selector: "app-transporte",
  templateUrl: "./transporte.component.html",
  styleUrls: ["./transporte.component.scss"],
})
export class TransporteComponent implements OnInit {
  @Input() subtiposRemolques: SubtiposRemolques[] = [];
  @Input() info: any;

  public autotransportesInfo: any;

  public ingresoSalidaPais: ClavesDeTransporte[];
  public countries: CartaPorteCountries[];

  public cartaPorteType: string = 'autotransporte';

  public internationalTransport: boolean = false;
  firstFormGroup: FormGroup = new FormGroup({
    transp_internac: new FormControl(""),
    pais_origen_destino: new FormControl(""),
    entrada_salida_merc: new FormControl(""),
    via_entrada_salida: new FormControl(""),
  });

  constructor(
    private _formBuilder: FormBuilder,
    public cataloguesListService: CataloguesListService,
    public cartaPorteInfoService: CartaPorteInfoService
  ) {
    this.cataloguesListService.countriesSubject.subscribe((data: any[]) => {
      this.countries = data;
    });

    this.cataloguesListService.consignmentNoteSubject.subscribe((data: any) => {
      this.ingresoSalidaPais = data.claves_de_transporte;
    });
  }

  ngOnInit(): void {
    this.firstFormGroup.controls["transp_internac"].setValue('No');
    this.cartaPorteInfoService.infoRecolector.subscribe((value) => {
      this.cartaPorteInfoService.addRecolectedInfo({
        ...this.firstFormGroup.value,
        transp_internac: this.firstFormGroup.value.transp_internac
          ? "Sí"
          : "No",
        isValid: this.firstFormGroup.status,
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    //MAYBE THIS FUNCTION IS NOT NECESSARY
    if (changes.subtiposRemolques) {
      if (this.subtiposRemolques == null) {
        this.subtiposRemolques = [];
      }
    }

    if (changes.info && this.info) {
      this.autotransportesInfo = this.info?.mercancias.autotransporte;
      const {
        transp_internac,
        pais_origen_destino,
        entrada_salida_merc,
        via_entrada_salida,
      } = this.info;

      this.firstFormGroup.patchValue({
        transp_internac: transp_internac !== "No",
        pais_origen_destino: pais_origen_destino,
        entrada_salida_merc: entrada_salida_merc,
        via_entrada_salida: via_entrada_salida,
      });
    }
  }

}
