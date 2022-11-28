import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'bego-body',
  templateUrl: './bego-body.component.html',
  styleUrls: ['./bego-body.component.scss']
})
export class BegoBodyComponent implements OnInit {

  @Input() maxWidth: number = 1280;
  
  constructor() { }

  ngOnInit(): void {
  }

}
