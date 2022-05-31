import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
  Input,
  SimpleChanges,
} from "@angular/core";
import { CartaPorteInfoService } from "../services/carta-porte-info.service";
import { CataloguesListService } from "../services/catalogues-list.service";
import { FiguraComponent } from "./components/figura/figura.component";

@Component({
  selector: "app-figura-transporte",
  templateUrl: "./figura-transporte.component.html",
  styleUrls: ["./figura-transporte.component.scss"],
})
export class FiguraTransporteComponent implements OnInit {
  public figuras: any[];
  public counter = 0;

  @ViewChildren(FiguraComponent)
  figurasRef: QueryList<FiguraComponent>;

  @Input() info: any;

  constructor(
    public cataloguesListService: CataloguesListService,
    public cartaPorteInfoService: CartaPorteInfoService,
    public changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.cartaPorteInfoService.infoRecolector.subscribe(() => {
      this.cartaPorteInfoService.addRecolectedInfo({
        figura_transporte: this.getFiguras(),
        isValid: this.isValid(),
      });
    });

    this.figuras = [this.counter];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.info.currentValue) {
      this.figuras = this.info;
    }
  }

  addFigura() {
    this.figuras.push(++this.counter);
  }

  getFiguras() {
    if (this.figurasRef) {
      const figuras = this.figurasRef.toArray().map((e) => {
        const domicilio = e.locationComponentInfo;
        return { ...e.figuraTransporteForm.value, domicilio };
      });
      // console.log(figuras);
      return figuras;
    }
  }

  isValid() {
    if (this.figurasRef) {
      const figurasRef = this.figurasRef.toArray();

      const validityArr = figurasRef.filter(
        (x): any => x.figuraTransporteForm.status == "VALID"
      );

      const validity = validityArr.length == figurasRef.length;
      // console.log(validity);
      return validity;
    }
  }

  delete(index) {
    if (this.figuras.length > 1) {
      this.figuras.splice(index, 1);
      this.changeDetectorRef.markForCheck();
    }
  }
}
