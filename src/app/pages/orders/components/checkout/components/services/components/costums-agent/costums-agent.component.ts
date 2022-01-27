import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-costums-agent',
  templateUrl: './costums-agent.component.html',
  styleUrls: ['./costums-agent.component.scss']
})
export class CostumsAgentComponent implements OnInit {

  @Output() getAgentCruce: EventEmitter<any> = new EventEmitter();
  @Input() dataCustomsCruce: any;
  @Input() slide: number = 0;

  data: any = {
    customs_agent: false,
    cruce: false
  }
  cruce: boolean = false;
  customs_agent: boolean = false;
  txtBtnCargo: string = '';
  activeBtnCargo: boolean = true;
  btnQuit: number = 0;
  lang: any;
  radioValue: number = 0;
  valuesAdded: boolean = false;
  
  constructor(
    private translateService: TranslateService
  ) { 
    this.txtBtnCargo = this.translateService.instant('checkout.insurance-modal.btn-add')
  }

  ngOnInit(): void {
    
  }

  changeRadioValue(data: any) {
    this.radioValue = parseInt(data.value)
    if(parseInt(data.value) > -1) {
      this.cruce = true;
      this.customs_agent = true;
    }
    if(parseInt(data.value) > 0) {
      this.cruce = true;
      this.customs_agent = false;
    }
    if(parseInt(data.value) > 1) {
      this.cruce = false;
      this.customs_agent = false;
    }

    this.addCart(false)
  }

  addCart(checkout: boolean) {
    this.getAgentCruce.emit({
      customs_agent: this.customs_agent,
      cruce: this.cruce,
      checkout: checkout
    });
  }

}
