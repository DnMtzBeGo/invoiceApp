import { Component, OnInit, ViewChild } from '@angular/core';
import EmblaCarousel from 'embla-carousel';

@Component({
  selector: 'app-investors',
  templateUrl: './investors.component.html',
  styleUrls: ['./investors.component.scss']
})
export class InvestorsComponent implements OnInit {
  @ViewChild('embla', { static: true }) protected embla: any;
  @ViewChild('viewPort', { static: true }) protected viewPort: any;

  slider: any;

  constructor() {}

  ngOnInit(): void {
    const options = {
      loop: true,
      dragFree: false,
      inViewThreshold: 0.5,
      slidesToScroll: 2
    };

    const wrap = this.embla.nativeElement;
    const viewPort = this.viewPort.nativeElement;
    const embla = EmblaCarousel(viewPort, options);
    this.slider = embla;
  }
}
