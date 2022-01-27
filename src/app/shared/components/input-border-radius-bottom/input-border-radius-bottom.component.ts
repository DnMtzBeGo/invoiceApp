import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-input-border-radius-bottom',
  templateUrl: './input-border-radius-bottom.component.html',
  styleUrls: ['./input-border-radius-bottom.component.scss']
})
export class InputBorderRadiusBottomComponent implements OnInit {

  @Input() title: string = '';
  @Input() inputType: string = '';
  @Input() inputName: string = '';
  @Output() sendValidateDriver = new EventEmitter();
  public inputValue: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  public getValueFromInput(event: Event): void {
    //console.log("CON EL VALUE DEL INPUT", event);

  }

  public getInputName(event: Event): void {
    // (<HTMLInputElement>event.target)
    console.log("CON EL NAME DEL INPUT", (<HTMLInputElement>event.target).id);
    if((<HTMLInputElement>event.target).id === 'fullname') {
      this.sendValidateDriver.emit({
        name: this.inputValue
      });
    }

    if((<HTMLInputElement>event.target).id === 'email') {
      this.sendValidateDriver.emit({
        email: this.inputValue
      })
    }

  }

}
