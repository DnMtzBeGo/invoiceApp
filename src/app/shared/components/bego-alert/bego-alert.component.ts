import { Component, OnInit, Input, Output, SimpleChanges, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { BegoAlertHandler } from './BegoAlertHandlerInterface';

@Component({
  selector: 'bego-alert',
  templateUrl: './bego-alert.component.html',
  styleUrls: ['./bego-alert.component.scss']
})
export class BegoAlertComponent implements OnInit {
  @Input() title?: string;
  @Input() handlers?: BegoAlertHandler[];

  constructor() {}
  ngOnInit(): void {}
}
