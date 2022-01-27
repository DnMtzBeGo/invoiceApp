import { Component, OnInit } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-shippers',
  templateUrl: './shippers.component.html',
  styleUrls: ['./shippers.component.scss']
})
export class ShippersComponent implements OnInit {

  mapOptions: AnimationOptions = {
    path: '/assets/lottie/animated-map.json',
  };

  lottieLoaded: boolean = false;

  constructor() {}

  ngOnInit(): void {}
  
  mapCreated(animationItem: AnimationItem): void {
    this.lottieLoaded = true;
  }

}