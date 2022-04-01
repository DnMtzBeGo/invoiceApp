import {
  Component,
  Input,
  OnInit,
  ViewChild,
  OnChanges,
  AfterViewInit,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";

// import {
// NotificationsService,
// } from "../../../../core/services";
import { Paginator, TableFactura } from "../../models";
import { routes } from "../../consts";
import { environment } from "../../../../../environments/environment";
import {
  facturaPermissions,
  previewFactura,
  facturaStatus,
} from "../../containers/factura-edit-page/factura.core";
import {
  ActionSendEmailFacturaComponent,
  ActionCancelarFacturaComponent,
  ActionConfirmationComponent,
} from "../../modals";

@Component({
  selector: "app-factura-table",
  templateUrl: "./factura-table.component.html",
  styleUrls: ["./factura-table.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class FacturaTableComponent implements OnInit, OnChanges, AfterViewInit {
  public routes: typeof routes = routes;
  public URL_BASE = environment.URL_BASE;
  public token = localStorage.getItem("token") || "";

  //Table data
  @Input() orderTableData: TableFactura[];
  public displayedColumns: string[] = [
    "fecha_emision",
    "emisor",
    "receptor",
    "serie",
    "tipo",
    "status",
    "subtotal",
    "total",
    "actions",
  ];
  public dataSource: MatTableDataSource<TableFactura>;

  // Loading
  @Input() loading: boolean = false;

  //Filter
  public isShowFilterInput: boolean = false;

  //Paginator
  @Input() page: Paginator;
  @Output() pageChange: EventEmitter<Paginator> = new EventEmitter();
  public sizeOptions = [5, 10, 20, 50, 100];

  //Sorting
  @ViewChild(MatSort) sort: MatSort;

  //Refresh
  @Output() refresh: EventEmitter<void> = new EventEmitter();

  constructor(
    // private notificationsService: NotificationsService,
    private matDialog: MatDialog,
    private router: Router
  ) {}

  public ngOnChanges(): void {
    this.handleUpdateTable();
  }

  public ngOnInit(): void {
    this.dataSource = new MatTableDataSource<TableFactura>(this.orderTableData);
  }

  public ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  //Table data
  public handleUpdateTable() {
    if (this.dataSource) {
      this.dataSource.data = [];
      this.dataSource = new MatTableDataSource<TableFactura>(
        this.orderTableData
      );
      this.dataSource.sort = this.sort;
    }
  }

  public pageChangeEmiter(page: number = 1) {
    this.page.pageIndex = page;
    this.pageChange.emit(this.page);
  }

  //Paginator
  public pagination(page: number) {
    this.pageChangeEmiter(page);
  }

  // Filter
  public applyFilter(event: any): void {
    if (event.key === "Enter" || event.keyCode === 13) {
      this.page.pageSearch = (event.target as HTMLInputElement).value;
      this.pageChangeEmiter();
    }
  }

  public showFilterInput(close = false): void {
    if (close) {
      this.page.pageSearch = "";
      this.pageChangeEmiter();
    }
    this.isShowFilterInput = !this.isShowFilterInput;
  }

  // Actions

  // MODALS
  sendEmailFactura(_id: string) {
    this.matDialog.open(ActionSendEmailFacturaComponent, {
      data: {
        _id,
        to: [],
        reply_to: "",
      },
      restoreFocus: false,
      panelClass: ["dialog-solid"],
    });
  }

  cancelarFactura(_id: string) {
    this.matDialog.open(ActionCancelarFacturaComponent, {
      data: {
        _id,
        afterSuccessDelay: () => {
          this.refresh.emit();
        },
      },
      restoreFocus: false,
      panelClass: ["dialog-solid"],
    });
  }

  deleteFactura(_id: string) {
    const dialogRef = this.matDialog.open(ActionConfirmationComponent, {
      data: {
        modalTitle: "Warning",
        modalMessage: `Are you sure you want to delete this factura with ID: ${_id}?
      This action can't be undone.`,
        modalPayload: {
          body: {
            _id,
          },
          endpoint: "invoice/delete",
          successMessage: "Factura deleted!",
          errorMessage: "Error deleting factura",
          // TODO: remove action?
          action: "emitBegoUser",
        },
      },
      restoreFocus: false,
      panelClass: ["dialog-solid"],
    });

    // TODO: false/positive when close event
    dialogRef.afterClosed().subscribe((res?) => {
      if (res) {
        this.refresh.emit();
      }
    });
  }

  // UTILS
  p = facturaPermissions;

  facturaStatus = facturaStatus;

  downloadPreview = (factura?) => {
    if (factura == void 0) return;

    window
      .fetch(this.URL_BASE + "invoice/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Acceontrol-Allow-Headers": "Content-Type, Accept",
          "Access-Css-Control-Allow-Methods": "POST,GET,OPTIONS",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(previewFactura(factura)),
      })
      .then((responseData) => responseData.arrayBuffer())
      .then((buffer) => {
        const blob = new Blob([buffer], {
          type: "application/pdf",
        });

        const linkSource = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.target = "_blank";
        // downloadLink.download = 'Vista previa.pdf'
        downloadLink.click();
        setTimeout(() => URL.revokeObjectURL(linkSource), 5000);
      })
      .catch(() => {
        // this.notificationsService.showErrorToastr(
        //   "Error al generar vista previa"
        // );
      });
  };
}
