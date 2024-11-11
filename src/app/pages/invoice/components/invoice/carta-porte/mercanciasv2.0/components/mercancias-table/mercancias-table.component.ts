import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';

import { Paginator } from 'src/app/pages/invoice/models';
import { CartaPorteInfoService } from '../../../services/carta-porte-info.service';
import { generateUUID } from 'src/app/pages/invoice/containers/factura-edit-page/factura.core';

@Component({
  selector: 'app-mercancias-table',
  templateUrl: './mercancias-table.component.html',
  styleUrls: ['./mercancias-table.component.scss'],
})
export class MercanciasTableComponent implements OnInit {
  @Output() public pageChange: EventEmitter<Paginator> = new EventEmitter();
  @Output() public editRecord: EventEmitter<string> = new EventEmitter();
  @Output() public dataChanged: EventEmitter<any> = new EventEmitter();

  // TODO: TYPE COMMODITIES

  public page: Paginator;
  public commoditiesTable: any;

  constructor(public consignmentNoteService: CartaPorteInfoService, private readonly cd: ChangeDetectorRef) {}

  private filter: any = {};

  public ngOnInit(): void {
    this.page = {
      pageIndex: 1,
      pageSize: 10,
      pageTotal: 1,
      pageSearch: '',
    };

    this._initTable()._initializeData().handleUpdate();
  }

  private _initTable(): MercanciasTableComponent {
    this.commoditiesTable = {
      loading: false,
      columns: [
        { id: 'line', label: 'Línea', filter: 'input' },
        { id: 'bienes_transp', label: 'Bienes transportados' },
        { id: 'descripcion', label: 'Descripción' },
        { id: 'cantidad', label: 'Cantidad' },
        { id: 'clave_unidad', label: 'Clave Unidad' },
        { id: 'peso_en_kg', label: 'Peso' },
        { id: 'material_peligroso', label: 'Material peligroso' },
      ],
      values: [], //this.commodities,
      actions: [
        { id: 'edit', label: 'Editar', translate: 'edit-commodity', icon: 'edit' },
        { id: 'remove', label: 'Eliminar', translate: 'remove-commodity', icon: 'trash' },
      ],
      pageUI: {
        index: this.page.pageIndex,
        total: this.page.total,
        size: this.page.pageSize,
      },
      selectRow: {
        showColumnSelection: false,
        selectionLimit: 0,
        keyPrimaryRow: 'id',
      },
      changingPage: ({ index, size }: any): void => {
        this.page.pageIndex = index;
        this.commoditiesTable.pageUI.index = index;
        if (this.commoditiesTable.pageUI.size !== size) {
          this.page.pageIndex = 1;
          this.commoditiesTable.pageUI.index = 1;
        }
        this.page.pageSize = size;
        this.pageChange.emit(this.page);
        this.cd.markForCheck();
      },
      rowSelected: ($event: any): void => {
        console.log($event);
      },
      selectingAction: ({ type, data }: any) => {
        switch (type) {
          case 'edit':
            this.editRecord.emit(data.id);
            break;
          case 'remove':
            // this.openMessageModal(event?.element);
            break;
          default:
            break;
        }
      },
    };

    return this;
  }

  private _initializeData(): MercanciasTableComponent {
    this.consignmentNoteService.getMerchandise(this, this.page, this.filter);
    return this;
  }

  public reloadData(): void {
    this._initializeData().handleUpdate();
  }

  public handleUpdate(): MercanciasTableComponent {
    // ensure to update data before revalidate table rows and avoid delay
    this.cd.markForCheck();

    //this.consignmentNoteService.addRecoletedInfoMercancias({});
    this._toggleLoading();

    let line = 1;
    this.commoditiesTable.values = this.consignmentNoteService.commodities?.map((commodity) => {
      if (!commodity.id) commodity.id = generateUUID();

      const row = {
        line: 0,
        ...commodity,
        actions: { enabled: true, options: { edit: true, remove: true } },
        selection_check: false,
      };

      if (!this.consignmentNoteService.invoice_id) row.line = line++;

      return row;
    });

    this.commoditiesTable.pageUI = {
      ...this.commoditiesTable.pageUI,
      total: this.consignmentNoteService.commodities.length,
      size: this.page.pageSize,
    };

    this._toggleLoading();

    this.dataChanged.emit();
    return this;
  }

  private _toggleLoading(): void {
    this.commoditiesTable = { ...this.commoditiesTable, loading: !this.commoditiesTable.loading };
  }

  public _getTableCSSClass(): string {
    return this.consignmentNoteService.invoice_id ? '' : 'hide-refresh-button';
  }

  public filterChanged($event: any): void {
    console.log($event);
    this.filter = $event;
    this.reloadData();
  }

  public canSearchLocal(): boolean {
    return this.consignmentNoteService.invoice_id ? false : true;
  }
}
