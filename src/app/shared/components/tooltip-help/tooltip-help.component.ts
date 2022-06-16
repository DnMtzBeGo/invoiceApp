import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tooltip-help',
  templateUrl: './tooltip-help.component.html',
  styleUrls: ['./tooltip-help.component.scss']
})
export class TooltipHelpComponent implements OnInit {

  @Input() content: string;

  constructor() { }

  ngOnInit(): void {
  }

}
