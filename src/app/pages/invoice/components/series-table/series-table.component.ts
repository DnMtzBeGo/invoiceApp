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
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/shared/services/auth.service";
import { NotificationsService } from "src/app/shared/services/notifications.service";
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

  @Input() readonly: boolean = false;

  public dataSource: MatTableDataSource<SerieAttributesInterface>;
  displayedColumns: string[];

  @Output() refresh: EventEmitter<void> = new EventEmitter();

  constructor(
    public dialog: MatDialog,
    private notificationsService: NotificationsService,
    private router: Router,
    private apiRestService: AuthService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.displayedColumns = [
      "serie",
      "comprobante",
      "folio",
      "color",
      "logo",
    ].concat(this.readonly ? [] : ["actions"]);
  }

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
        this.notificationsService.showSuccessToastr(
          this.translateService.instant("invoice.serie-table.save-success")
        );
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
        this.notificationsService.showErrorToastr(
          this.translateService.instant("invoice.serie-table.save-error")
        );
        this.refresh.emit();
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
