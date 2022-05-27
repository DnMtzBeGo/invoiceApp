import { Component, Input, OnInit } from '@angular/core';


interface FleetAssetCardProps {
  type: 'drivers'| 'trucks' | 'trailers',
  picture: string
}

@Component({
  selector: 'app-fleet-asset-card',
  templateUrl: './fleet-asset-card.component.html',
  styleUrls: ['./fleet-asset-card.component.scss']
})
export class FleetAssetCardComponent implements OnInit {

  @Input() props: FleetAssetCardProps;
  constructor() { }

  ngOnInit(): void {
  }

}
