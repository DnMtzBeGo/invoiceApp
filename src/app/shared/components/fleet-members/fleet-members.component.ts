import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-fleet-members',
  templateUrl: './fleet-members.component.html',
  styleUrls: ['./fleet-members.component.scss']
})
export class FleetMembersComponent implements OnInit {

  @Input() titleFleetMembers: any;

  constructor() { }

  ngOnInit(): void {
  }

}
