import {
  Component,
  AfterContentInit,
  ContentChildren,
  QueryList,
  TemplateRef,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-custom-stepper',
  templateUrl: './custom-stepper.component.html',
  styleUrls: ['./custom-stepper.component.scss'],
})
export class CustomStepperComponent implements AfterContentInit, OnChanges {
  @Output() public stepStatus: any = new EventEmitter<number>();

  @Input() public labels: string[] = [];
  @Input() public currentStep: number = 0;

  @Input() public blockFirstStep: boolean = false;

  public steps: { label: string; template: TemplateRef<any> }[] = [];
  public linePosition: number = 0;
  public lineWidth: number = 0;

  @ContentChildren('step') public stepElements!: QueryList<TemplateRef<any>>;

  public ngAfterContentInit() {
    console.log('ng after content init...');
    this.steps = this.stepElements.toArray().map((stepElement, index) => {
      const label = this.labels[index] || `Paso ${index + 1}`;
      return { label, template: stepElement };
    });

    this.lineWidth = 100 / this.steps.length;
    this.linePosition = 0;
    this.goToStep(this.currentStep, false);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentStep) {
      console.log('setting current step:... ', changes.currentStep.currentValue);
      this.goToStep(changes.currentStep.currentValue);
    }
  }

  public goToStep(index: number, emit: boolean = true): void {
    this.currentStep = index;
    this.linePosition = index * this.lineWidth;
    if (emit) this.stepStatus.emit(index);
  }
}
