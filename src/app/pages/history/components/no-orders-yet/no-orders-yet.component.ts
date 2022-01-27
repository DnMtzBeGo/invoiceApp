import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-no-orders-yet',
  templateUrl: './no-orders-yet.component.html',
  styleUrls: ['./no-orders-yet.component.scss'],
})
export class NoOrdersYetComponent implements OnInit {

  @Input() translations: any;
  constructor(    
    ) { }

  ngOnInit() {
  }

}
