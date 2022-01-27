import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'bego-input-search',
  templateUrl: './input-search.component.html',
  styleUrls: ['./input-search.component.scss']
})
export class InputSearchComponent implements OnInit {

  @Output() inputData = new EventEmitter<any>();

  public data: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  onChange(data: any) {
    this.inputData.emit(data);
  }

}
