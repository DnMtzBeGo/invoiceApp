import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter
} from '@angular/core';
import { Router } from '@angular/router';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-web-menu',
  templateUrl: './web-menu.component.html',
  styleUrls: ['./web-menu.component.scss']
})
export class WebMenuComponent implements OnInit {
  @ViewChild('menuTitle1', { static: true }) protected menuTitle1: any = null;
  @ViewChild('menuTitle2', { static: true }) protected menuTitle2: any = null;
  @ViewChild('menuTitle3', { static: true }) protected menuTitle3: any = null;
  @ViewChild('menuTitle4', { static: true }) protected menuTitle4: any = null;
  public menuTitles = [
    this.menuTitle1,
    this.menuTitle2,
    this.menuTitle3,
    this.menuTitle4
  ];

  @Input() menuOpened: boolean = false;
  @Input() removeDelay: boolean = false;
  @Output() menuEmitter = new EventEmitter<boolean>();

  mapOptions: AnimationOptions = {
    path: '/assets/lottie/animated-map.json'
  };

  constructor(private router: Router) {}

  ngOnInit(): void {}

  applyClipPath(index: number) {
    for (let k = 0; k < 4; k++)
      if (k + 1 != index)
        this.menuTitles[k]?.nativeElement.classList.add('focused-out');
  }

  removeClipPath() {
    for (let k = 0; k < 4; k++)
      this.menuTitles[k]?.nativeElement.classList.remove('focused-out');
  }

  nav(url: string) {
    this.menuOpened = false;
    this.menuEmitter.emit(false);
    // TODO: open link in new tab
    this.router.navigate([url]);
  }

  mapCreated(animationItem: AnimationItem): void {}
}
