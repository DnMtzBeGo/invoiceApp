import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-member-card-selection',
  templateUrl: './member-card-selection.component.html',
  styleUrls: ['./member-card-selection.component.scss'],
})
export class MemberCardSelectionComponent {
  @Input() public data: any;
  @Input() public titleFleetMembers: any;
  @Output() public sendMemberSelected = new EventEmitter<any>();

  public avatarSelected: boolean = false;
  public fallbackImg: string = '';

  constructor() {}

  public getFleetMember(data: any): void {
    this.sendMemberSelected.emit({
      memberType: this.titleFleetMembers,
      member: data,
    });
  }

  public onPicError(): void {
    switch (this.titleFleetMembers) {
      case 'drivers':
        this.fallbackImg = '../../../../assets/images/avatar-outline.svg';
        break;
      case 'trucks':
        this.fallbackImg = '../../../../assets/images/truck.svg';
        break;
      case 'vehicle':
      case 'trailers':
        this.fallbackImg = '../../../../assets/images/trailer.svg';
        break;
    }
  }
}
