import { Component, Input, OnInit, ViewChild, OnChanges, AfterViewInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { Paginator, TableFactura } from '../../../invoice/models';
import { routes } from '../../../invoice/consts';
import { environment } from 'src/environments/environment';
import { facturaPermissions, previewFactura, facturaStatus } from '../../../invoice/containers/factura-edit-page/factura.core';
import { clone } from 'src/app/shared/utils/object';
import { ActionSendEmailFacturaComponent, ActionCancelarFacturaComponent, ActionConfirmationComponent } from '../../../invoice/modals';

type FleetTableModel = any;

@Component({
  selector: 'app-fleet-table',
  templateUrl: './fleet-table.component.html',
  styleUrls: ['./fleet-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FleetTableComponent implements OnInit, OnChanges, AfterViewInit {
  public routes: typeof routes = routes;
  public URL_BASE = environment.URL_BASE;

  @Input() model: 'members' | 'trucks' | 'trailers';

  resolvers = {
    members: {
      displayedColumns: ['avatar', 'nickname', 'status', 'operations']
    },
    trucks: {
      displayedColumns: ['avatar', 'brand', 'year', 'plates', 'color', 'operations']
    },
    trailers: {
      displayedColumns: ['avatar', 'plates', 'type', 'trailer_number', 'operations']
    }
  };

  //Table data
  @Input() orderTableData: FleetTableModel[];
  public dataSource: MatTableDataSource<FleetTableModel>;

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
    private matDialog: MatDialog,
    private router: Router,
    private notificationsService: NotificationsService,
    private translateService: TranslateService
  ) {}

  public ngOnChanges(): void {
    this.handleUpdateTable();
  }

  public ngOnInit(): void {
    this.dataSource = new MatTableDataSource<FleetTableModel>(this.orderTableData);
  }

  public ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  //Table data
  public handleUpdateTable() {
    if (this.dataSource) {
      this.dataSource.data = [];
      this.dataSource = new MatTableDataSource<FleetTableModel>(this.orderTableData);
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
    if (event.key === 'Enter' || event.keyCode === 13) {
      this.page.pageSearch = (event.target as HTMLInputElement).value;
      this.pageChangeEmiter();
    }
  }

  public showFilterInput(close = false): void {
    if (close) {
      this.page.pageSearch = '';
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
        reply_to: ''
      },
      restoreFocus: false,
      backdropClass: ['brand-dialog-1']
    });
  }

  cancelarFactura(_id: string) {
    this.matDialog.open(ActionCancelarFacturaComponent, {
      data: {
        _id,
        afterSuccessDelay: () => {
          this.refresh.emit();
        }
      },
      restoreFocus: false,
      backdropClass: ['brand-dialog-1']
    });
  }

  deleteFactura(_id: string) {
    const dialogRef = this.matDialog.open(ActionConfirmationComponent, {
      data: {
        modalTitle: this.translateService.instant('invoice.invoice-table.delete-title'),
        modalMessage: this.translateService.instant('invoice.invoice-table.delete-message'),
        modalPayload: {
          body: {
            _id
          },
          endpoint: 'invoice/delete',
          successMessage: this.translateService.instant('invoice.invoice-table.delete-success'),
          errorMessage: this.translateService.instant('invoice.invoice-table.delete-error'),
          // TODO: remove action?
          action: 'emitBegoUser'
        }
      },
      restoreFocus: false,
      backdropClass: ['brand-dialog-1']
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

  showError = (error: any) => {
    error = error?.message || error?.error;

    return Array.isArray(error) ? error.map((e) => e.error ?? e.message).join('\n') : error;
  };
}
