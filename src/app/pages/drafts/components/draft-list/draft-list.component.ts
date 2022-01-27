import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'draft-list',
  templateUrl: './draft-list.component.html',
  styleUrls: ['./draft-list.component.scss'],
  animations: [
    trigger('enterAnimation', [transition(':enter', [style({ opacity: 0 }), animate('800ms', style({ opacity: 1 }))])]),
  ],
})
export class DraftListComponent implements OnInit {

  @Input() draftData: any;
  @Input() loader: boolean = false;
  @Input() noDraftData: boolean = false;
  @Input() noSearchDraftData: boolean = false;
  @Output() selectedDraftData = new EventEmitter<any>();
  @Output() indexDraft = new EventEmitter<number>();
  @Output() moreDrafts = new EventEmitter<any>();
  

  public selectedDraftIndex: number = 0;
  public numberPageDraft: number = 1;

  constructor() { }

  ngOnInit(): void {
  }

  selectDraft(draft: any, index: number) {
    this.selectedDraftIndex = index;
    this.indexDraft.emit(index);
    this.selectedDraftData.emit(draft);
  }

  ngOnChanges() {
  }

  onScroll() {
    this.numberPageDraft++;
    console.log(this.numberPageDraft)
    this.moreDrafts.emit(this.numberPageDraft);
  }

}