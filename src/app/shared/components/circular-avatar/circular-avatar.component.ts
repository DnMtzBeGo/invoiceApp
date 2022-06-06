import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-circular-avatar',
  templateUrl: './circular-avatar.component.html',
  styleUrls: ['./circular-avatar.component.scss']
})
export class CircularAvatarComponent implements OnInit, OnChanges {

  @Input() data: any;
  @Input() userWantCP: boolean = false;
  @Input() title: string = '';
  @Input() radioButton: boolean= true;
  @Input() notAvailable: boolean = false;

  public fallbackImage: string = '';

  constructor() { }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.hasOwnProperty('title')) {
      switch (this.title) {
        case 'drivers':
          this.fallbackImage = '../../../../assets/images/avatar-outline.svg';
          break;
        case 'trucks':
          this.fallbackImage = '../../../../assets/images/truck.svg';
          break;
        case 'trailers':
          this.fallbackImage = '../../../../assets/images/trailer.svg';
          break;
      }
    }
  }
}
