import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'bego-radio-card',
  templateUrl: './bego-radio-card.component.html',
  styleUrls: ['./bego-radio-card.component.scss']
})
export class BegoRadioCardComponent implements OnInit {

  @Input() cardIsSelected: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
