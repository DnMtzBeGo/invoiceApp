import { 
  Component, 
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { Step } from './interfaces/Step';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements OnInit {

  @Input() steps!: Step[];
  @Input() progress: number = 0;
  @Input() objectValues: any;
  @Input() stepWithPadding: boolean = false;

  @Input() selectedSlide!: number;
  @Output() selectedSlideChange: EventEmitter<number> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  computedProgress() : string{
    return Math.min(this.progress,100) + '%';
  }

  stepActiveClass(step: Step, index: number):string{

    if(this.selectedSlide == index && !step.validated){
      return 'active ';
    }
    return '';
  }

}
