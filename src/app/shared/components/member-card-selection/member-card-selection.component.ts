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

  constructor() { }

  ngOnInit(): void { }

  public getFleetMember(data: any) {
    this.sendMemberSelected.emit({
      memberType: this.titleFleetMembers,
      member: data
    });
  }

  public onPicError(data: any) {
    data['photo'] = '../../../../assets/images/truck.svg'
  }

}
