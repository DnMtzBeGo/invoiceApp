import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-simple-avatar',
  templateUrl: './simple-avatar.component.html',
  styleUrls: ['./simple-avatar.component.scss']
})
export class SimpleAvatarComponent implements OnInit {

  @Input() picture: string;

  constructor() { }

  ngOnInit(): void {
  }

  setDefaultProfilePic(){
    this.picture = '../../../../assets/images/avatar-outline.svg';
  }

}
