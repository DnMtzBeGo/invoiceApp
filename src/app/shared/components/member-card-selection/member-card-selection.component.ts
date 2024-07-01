import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-member-card-selection',
  templateUrl: './member-card-selection.component.html',
  styleUrls: ['./member-card-selection.component.scss']
})
export class MemberCardSelectionComponent implements OnInit {

  @Input() data: any;
  @Input() titleFleetMembers: any;
  @Output() sendMemberSelected = new EventEmitter<any>();

  public avatarSelected: boolean = false;
  public fallbackImg: string = '';

  constructor() { }

  ngOnInit(): void { }

  public getFleetMember(data: any) {
    this.sendMemberSelected.emit({
      memberType: this.titleFleetMembers,
      member: data
    });
  }

  public onPicError() {
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
