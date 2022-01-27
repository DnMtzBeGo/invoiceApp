import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'bego-select',
  templateUrl: './bego-select.component.html',
  styleUrls: ['./bego-select.component.scss']
})
export class BegoSelectComponent implements OnInit {

  selectIsOpen: boolean = false;
  @Input() options: Array<any> = [];

  @Input() value:any = '';
  @Input() selectLegend!: string;
  @Output() valueChange = new EventEmitter<any>();

  closeSelect = ()=>{
    this.selectIsOpen =false;
  }

  constructor(
    translateService: TranslateService
  ) { 
    if(!this.selectLegend)
      this.selectLegend = translateService.instant('bego-select-component.select');
  }

  ngOnInit(): void {
    document.addEventListener('click',this.closeSelect, true);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click',this.closeSelect, true);
  }

  toggleSelect(event: MouseEvent): void{
    this.selectIsOpen = !this.selectIsOpen;
    event.stopPropagation();
  }

  changeValue(newValue: any){
    this.value = newValue;
    this.valueChange.emit(this.value);
  }

  ngOnChanges(changes: SimpleChanges):void{
  }



}
