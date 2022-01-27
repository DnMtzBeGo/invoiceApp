import { Component, OnInit } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  mapOptions: AnimationOptions = {
    path: '/assets/lottie/trajectories.json'
  };

  constructor() {}

  ngOnInit(): void {}

  mapCreated(animationItem: AnimationItem): void {}
}
