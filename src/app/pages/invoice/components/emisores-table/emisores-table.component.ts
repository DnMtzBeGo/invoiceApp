import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
} from "@angular/core";
import { EmitterAttributesInterface } from "../../models/invoice/emisores";
import { MatTableDataSource, MatTable } from "@angular/material/table";
// import { ApiRestService, NotificationsService } from "src/app/core/services";
import { AuthService } from "src/app/shared/services/auth.service";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { FacturaEmitterComponent } from "../../components/factura-emitter/factura-emitter.component";
import { Router } from "@angular/router";
import { routes } from "../../consts";

@Component({
  selector: "app-emisores-table",
  templateUrl: "./emisores-table.component.html",
  styleUrls: ["./emisores-table.component.scss"],
})
export class EmisoresTableComponent implements OnInit {
  @ViewChild(MatTable) table: MatTable<EmitterAttributesInterface>;
  @Input() emisoresTableData: EmitterAttributesInterface[];
  @Input() regimenFiscal: any;
  @Output() refresh: EventEmitter<void> = new EventEmitter();

  public routes: typeof routes = routes;
  public dataSource: MatTableDataSource<EmitterAttributesInterface>;
  displayedColumns: string[] = [
    "rfcPadre",
    "emisor",
    "nombre",
    "regimenFiscal",
    "email",
    "validado",
    "actions",
  ];

  constructor(
    public dialog: MatDialog,
    // private notificationsService: NotificationsService,
    private router: Router,
    private apiRestService: AuthService
  ) {}

  ngOnInit(): void {}

  ngOnChanges() {
    this.dataSource = new MatTableDataSource<EmitterAttributesInterface>(
      this.emisoresTableData
    );
    console.log(this.regimenFiscal);
  }

  editEmisor(emisor: any): void {
    const dialogRef = this.dialog.open(FacturaEmitterComponent, {
      data: emisor,
      panelClass: ["dialog-solid"],
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result.close) {
        if (result.success) {
          // this.notificationsService.showSuccessToastr("Cambio exitoso");
          this.refresh.emit();
          this.table.renderRows();
        } else {
          // this.notificationsService.showErrorToastr(
          //   "No se pudo editar el Emisor"
          // );
        }
      }
    });
  }

  public async deleteEmisor(id: string) {
    let requestJson = {
      _id: id,
    };

    (
      await this.apiRestService.apiRest(
        JSON.stringify(requestJson),
        `invoice/emitters/delete`
      )
    ).subscribe(
      (res) => {
        // this.notificationsService.showErrorToastr("Emisor Borrado");
        this.refresh.emit();
        this.table.renderRows();
      },
      (err) => {
        // this.notificationsService.showErrorToastr(
        //   "No se pudo borrar el Emisor"
        // );
        console.log(err);
      }
    );
  }

  getSeries(id_emisor: string): void {
    this.router.navigate([routes.SERIES, { id: id_emisor }]);
  }
}
