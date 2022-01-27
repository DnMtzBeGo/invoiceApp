import { Component, OnInit } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.scss']
})
export class RoutesComponent implements OnInit {
  routes: Array<any> = [
    {
      name: 'CDMX/Edo Mex - Nuevo Laredo',
      checked: false
    },
    {
      name: 'Guadalajara - Nuevo Laredo',
      checked: false
    },
    {
      name: 'Monterrey - Nuevo Laredo',
      checked: false
    },
    {
      name: 'Querétaro - Nuevo Laredo',
      checked: false
    },
    {
      name: 'Puebla - Nuevo Laredo',
      checked: false
    },
    {
      name: 'Toluca - Nuevo Laredo',
      checked: false
    }
  ];

  mapOptions: AnimationOptions = {
    path: '/assets/lottie/map.json'
  };

  cdmxOptions: AnimationOptions = {
    path: '/assets/lottie/cdmx.json'
  };

  guadalajaraOptions: AnimationOptions = {
    path: '/assets/lottie/guadalajara.json'
  };

  monterreyOptions: AnimationOptions = {
    path: '/assets/lottie/monterrey.json'
  };

  pueblaOptions: AnimationOptions = {
    path: '/assets/lottie/puebla.json'
  };

  queretaroOptions: AnimationOptions = {
    path: '/assets/lottie/queretaro.json'
  };

  tolucaOptions: AnimationOptions = {
    path: '/assets/lottie/toluca.json'
  };

  constructor() {}

  ngOnInit(): void {}

  mapCreated(animationItem: AnimationItem): void {}

  drawRoute(index: number) {
    this.check(index);
  }

  check(index: number) {
    for (let k = 0; k < this.routes.length; k++) this.routes[k].checked = false;

    this.routes[index].checked = true;
  }
}
