import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'bego-tabs',
  templateUrl: './bego-tabs.component.html',
  styleUrls: ['./bego-tabs.component.scss']
})
export class BegoTabComponent implements OnInit {

  @Input() tabs: string[];
  //the index of the tab that must be selected at the beginning
  @Input() selectedTab: number = 0;

  @Output() onTabChange = new EventEmitter<number>();


  public currentTabIndex: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.selectedTab){
      this.currentTabIndex = this.selectedTab;
    }
  }

  selectTab(index: number){
    this.currentTabIndex = index;
    this.onTabChange.emit(index);
  }

}
