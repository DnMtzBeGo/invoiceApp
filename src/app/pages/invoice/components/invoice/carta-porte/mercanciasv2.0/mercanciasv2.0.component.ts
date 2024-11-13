import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { CataloguesListService } from '../services/catalogues-list.service';
import { MercanciasTableComponent } from './components/mercancias-table/mercancias-table.component';
import { searchInList } from 'src/app/pages/invoice/containers/factura-edit-page/factura.core';
import { CartaPorteInfoService } from '../services/carta-porte-info.service';

@Component({
  selector: 'app-mercanciasv20',
  templateUrl: './mercanciasv2.0.component.html',
  styleUrls: ['./mercanciasv2.0.component.scss'],
})
export class Mercanciasv20Component implements OnChanges {
  @Input() public info: any;
  @Input() public invoice_id: string = '';
  @ViewChild('commoditiesTable') public commoditiesTable: MercanciasTableComponent;

  public editId: string = null;

  public mercanciasForm: FormGroup = new FormGroup({
    peso_bruto_total: new FormControl('', Validators.required),
    unidad_peso: new FormControl('', Validators.required),
  });

  public weightUnits: any[];
  public filteredWeightUnits: any[] = [];

  constructor(
    public cartaPorteInfoService: CartaPorteInfoService,
    public readonly cataloguesListService: CataloguesListService,
    public readonly cd: ChangeDetectorRef,
  ) {
    this.cataloguesListService.consignmentNoteSubject.subscribe((data: any) => {
      if (data?.unidades_de_peso) {
        this.weightUnits = data.unidades_de_peso;
        this.filteredWeightUnits = [...this.weightUnits];
      }
    });

    this.mercanciasForm.valueChanges.subscribe((data) => {
      this.cartaPorteInfoService.addRecoletedInfoMercancias({ ...data });
    });

    this.cartaPorteInfoService.addRecolectedInfo(this.info || {});
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes?.info?.currentValue) this.mercanciasForm.patchValue({ ...changes.info.currentValue });
  }

  public refreshTableData(): void {
    this.editId = null;
    this.commoditiesTable.handleUpdate();

    this.cd.markForCheck();

    // updating form after some merchandise change
    this.mercanciasForm.patchValue({ ...this.cartaPorteInfoService.info.mercancias });
  }

  public updateMercanciasForm(): void {
    this.mercanciasForm.patchValue({ ...this.cartaPorteInfoService.info.mercancias });
  }

  public tableDataPageChange($event: any): void {
    //  TODO: add search here based on $event.pageSearch
    this.cartaPorteInfoService.getMerchandise(this.commoditiesTable, $event);
  }

  public setActiveEditId(id: string) {
    this.editId = id;
  }

  public searchWeightUnit(code: string): void {
    searchInList(this, 'weightUnits', 'filteredWeightUnits', code, 'clave', 'nombre');
  }
}
