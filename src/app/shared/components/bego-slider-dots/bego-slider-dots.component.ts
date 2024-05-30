import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from "@angular/core";

interface SlideInfo {
  index: number;
  active: boolean;
}

export interface BegoSliderDotsOpts {
  totalElements: number;
  value: number;
  hideBtn?: boolean;
  valueChange?: Function;
  disableBtn?: boolean;
  autoHeight?: boolean;
  sliderDotsClass?: string;
}

@Component({
  selector: "bego-slider-dots",
  templateUrl: "./bego-slider-dots.component.html",
  styleUrls: ["./bego-slider-dots.component.scss"],
})
export class BegoSliderDotsComponent implements OnInit {
  @Input() opts: BegoSliderDotsOpts;

  @Output() valueChange = new EventEmitter<number>();

  public slidesInfo: SlideInfo[];
  public lastIndex: boolean = false;

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.opts && this.opts.totalElements) {
      if (this.opts.totalElements)
        this.slidesInfo = Array.from({
          length: this.opts.totalElements,
        }).map((e, i): SlideInfo => {
          return {
            index: i,
            active: false,
          };
        });
    }
  }

  nextSlide() {
    this.opts.valueChange?.(this.opts.value + 1);
    // this.valueChange.emit(this.opts.value + 1);
  }

  changeIndex(newIndex: number) {
    this.opts.valueChange?.(newIndex);

    this.opts.value = newIndex;
    this.slidesInfo.forEach((slide, index) => {
      slide.active = index === newIndex;
    });
    this.valueChange.emit(this.opts.value);
  }
  
}
