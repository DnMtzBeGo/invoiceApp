import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-web-menu-button',
  templateUrl: './web-menu-button.component.html',
  styleUrls: ['./web-menu-button.component.scss']
})
export class WebMenuButtonComponent implements OnInit {

  @Input() menuOpened: boolean = false;

  constructor() {}

  ngOnInit(): void {}

}