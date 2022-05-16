import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { AuthService } from "src/app/shared/services/auth.service";
// import { ApiRestService, NotificationsService } from "src/app/core/services";
import { SerieAttributesInterface } from "../../models/invoice/series";
import { SeriesNewComponent } from "../series-new/series-new.component";

@Component({
  selector: "app-series-table",
  templateUrl: "./series-table.component.html",
  styleUrls: ["./series-table.component.scss"],
})
export class SeriesTableComponent implements OnInit {
  @ViewChild(MatTable) table: MatTable<SerieAttributesInterface>;
  @Input() seriesTableData: SerieAttributesInterface[];

  public dataSource: MatTableDataSource<SerieAttributesInterface>;
  displayedColumns: string[] = [
    "serie",
    "comprobante",
    "folio",
    "color",
    "logo",
    "actions",
  ];

  @Output() refresh: EventEmitter<void> = new EventEmitter();

  constructor(
    public dialog: MatDialog,
    // private notificationsService: NotificationsService,
    private router: Router,
    private apiRestService: AuthService
  ) {}

  ngOnInit(): void {}

  ngOnChanges() {
    this.dataSource = new MatTableDataSource<SerieAttributesInterface>(
      this.seriesTableData
    );
  }

  editSerie(serie: any): void {
    const dialogRef = this.dialog.open(SeriesNewComponent, {
      data: serie,
      restoreFocus: false,
      autoFocus: false,
      backdropClass: ["brand-dialog-1"],
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.message != "") {
        // this.notificationsService.showSuccessToastr("Serie guardado");
        this.refresh.emit();
        this.table.renderRows();
      }
    });
  }

  async deleteSerie(serie: string) {
    let requestJson = {
      _id: serie,
    };
    (
      await this.apiRestService.apiRest(
        JSON.stringify(requestJson),
        `invoice/series/delete`
      )
    ).subscribe(
      (res) => {
        // this.notificationsService.showErrorToastr("Serie Borrado");
        this.refresh.emit();
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
