import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

export interface CantidadTansporta {
  cantidad: number | string;
  id_origen: string;
  id_destino: string;
  cves_transporte?: string;
}

export interface CantidadTansportaChangedEvent {
  item: CantidadTansporta;
  index: number;
}

@Component({
  selector: 'app-cantidad-transporta',
  templateUrl: './cantidad-transporta.component.html',
  styleUrls: ['./cantidad-transporta.component.scss'],
})
export class CantidadTransportaComponent implements OnInit {
  @Input() data: CantidadTansporta;
  @Input() public index: number;
  @Input() public totalRows: number;

  @Output() public itemRemoved: EventEmitter<number> = new EventEmitter();
  @Output() public itemChanged: EventEmitter<CantidadTansportaChangedEvent> = new EventEmitter();

  public form: FormGroup;

  constructor(private readonly formBuilder: FormBuilder) {
    // prettier-ignore
    this.form = this.formBuilder.group({
      cantidad: [''],
      id_origen: [''],
      id_destino: [''],
      cves_transporte: ['']
    });
    this.bindOnFormChanges();
  }

  public ngOnInit(): void {
    this.form.patchValue(this.data);
  }

  private bindOnFormChanges() {
    this.form.valueChanges.subscribe((val) => {
      this.updateItem(val);
    });
  }

  // public ngOnChanges(_changes: SimpleChanges): void {
  //   this.form.patchValue(this.data);
  // }

  public removeItem() {
    this.itemRemoved.emit(this.index);
  }

  public updateItem(item: CantidadTansporta) {
    this.itemChanged.emit({ index: this.index, item });
  }
}
