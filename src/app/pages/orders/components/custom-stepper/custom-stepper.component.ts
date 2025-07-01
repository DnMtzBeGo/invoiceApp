import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-custom-stepper',
  template: `
    <div class="custom-stepper">
      <div *ngFor="let label of labels; let i = index" 
           class="step" 
           [class.active]="i === currentStep"
           [class.disabled]="blockFirstStep && i === 0">
        {{label}}
      </div>
    </div>
  `,
  styles: [`
    .custom-stepper {
      display: flex;
      justify-content: space-between;
      margin: 20px 0;
    }
    .step {
      padding: 10px 20px;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
    }
    .step.active {
      background-color: #FFE000;
    }
    .step.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class CustomStepperComponent {
  @Input() labels: string[] = [];
  @Input() currentStep: number = 0;
  @Input() blockFirstStep: boolean = false;
  @Output() stepStatus = new EventEmitter<any>();
}