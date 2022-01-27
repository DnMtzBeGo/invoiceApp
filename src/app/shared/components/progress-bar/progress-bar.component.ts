import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'bego-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit {

  @Input() progress: any;

  percentage = "0";

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      for(let i=0; i < this.progress*100; i++){
        this.percentage = i + "%";
      }
    }, 1000);
  }

}
