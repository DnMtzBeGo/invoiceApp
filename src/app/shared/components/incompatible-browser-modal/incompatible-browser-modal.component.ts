import { Component, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-incompatible-browser-modal',
  templateUrl: './incompatible-browser-modal.component.html',
  styleUrls: ['./incompatible-browser-modal.component.scss']
})
export class IncompatibleBrowserModalComponent implements OnInit {

  public lottieOptions: AnimationOptions = {
    path: '../../../../assets/lottie/wifi.json',
  };

  constructor() { }

  ngOnInit(): void {
  }

}
