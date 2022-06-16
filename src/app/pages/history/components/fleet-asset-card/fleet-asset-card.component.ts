import { Component, Input, OnInit } from '@angular/core';
import { FleetElementType } from '../../../../shared/interfaces/FleetElement.type';


@Component({
  selector: 'app-fleet-asset-card',
  templateUrl: './fleet-asset-card.component.html',
  styleUrls: ['./fleet-asset-card.component.scss']
})
export class FleetAssetCardComponent implements OnInit {

  @Input() type: FleetElementType;
  @Input() data: any;

  constructor() { }

  ngOnInit(): void {
  }

}
