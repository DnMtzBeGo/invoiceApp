import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appUppercase]'
})
export class UppercaseDirective {
  constructor(private el: ElementRef) {
    const toUpperCase = (event: InputEvent) => {
      const value = event.target['value'];
      event.target['value'] = value.toUpperCase();
    };

    if (el.nativeElement.tagName == 'INPUT') {
      el.nativeElement.addEventListener('input', toUpperCase);
    } else {
      const inputs = el.nativeElement.getElementsByTagName('input');
      Array.from(inputs).map((input: HTMLElement) => {
        input.addEventListener('input', toUpperCase);
      });
    }
  }
}