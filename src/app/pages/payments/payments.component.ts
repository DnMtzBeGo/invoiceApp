import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  a = {
    name: 'File Name',
    labelBrowse: 'Browse your file',
    labelOr: 'or',
    btnBrowse: 'Choose File',
    labelMax: 'max'
  };

  options = ['20', '40', '40HQ'];
  constructor() {}

  ngOnInit(): void {}
}
