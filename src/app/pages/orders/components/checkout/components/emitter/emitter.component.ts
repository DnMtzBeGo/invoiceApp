import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-emitter',
  templateUrl: './emitter.component.html',
  styleUrls: ['./emitter.component.scss']
})
export class EmitterComponent implements OnInit {

  @Input() userData: any

  constructor() { }

  ngOnInit(): void {
  }

}
