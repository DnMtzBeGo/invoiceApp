import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-circular-avatar',
  templateUrl: './circular-avatar.component.html',
  styleUrls: ['./circular-avatar.component.scss'],
})
export class CircularAvatarComponent implements OnChanges {
  @Input() public data: any;
  @Input() public userWantCP: boolean = false;
  @Input() public fleetMember: string = '';
  @Input() public radioButton: boolean = true;

  public fallbackImage: string = '';

  constructor() {}

  public ngOnChanges(changes: SimpleChanges): void {
    console.log(this.data);

    if (changes.hasOwnProperty('fleetMember')) {
      switch (this.fleetMember) {
        case 'drivers':
          this.fallbackImage = '../../../../assets/images/avatar-outline.svg';
          break;
        case 'trucks':
          this.fallbackImage = '../../../../assets/images/truck.svg';
          break;
        case 'vehicle':
        case 'trailers':
          this.fallbackImage = '../../../../assets/images/trailer.svg';
          break;
      }
    }
  }

  public get tooltipData(): string {
    if (!this.data) return '';

    const lines = [];

    switch (this.fleetMember) {
      case 'drivers':
        lines.push(this.data.nickname);
        break;
      case 'vehicle':
        lines.push(this.data.attributes.vehicle_number);
        break;
      default:
        lines.push(this.data.model);
        break;
    }

    if (this.data.original_fleet) {
      lines.push(this.data.original_fleet.name);
    }

    return lines.join('\n');
  }
}
