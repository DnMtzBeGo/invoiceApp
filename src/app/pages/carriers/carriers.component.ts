import { Component, OnInit } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-carriers',
  templateUrl: './carriers.component.html',
  styleUrls: ['./carriers.component.scss']
})
export class CarriersComponent implements OnInit {

  mapOptions: AnimationOptions = {
    path: '/assets/lottie/animated-map.json',
  };

  constructor() {}

  ngOnInit(): void {}
  
  mapCreated(animationItem: AnimationItem): void {}

}
