import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'bego-ticket',
  templateUrl: './bego-ticket.component.html',
  styleUrls: ['./bego-ticket.component.scss']
})
export class BegoTicketComponent implements OnInit {

  @Input() removeHeaderSeparator: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
