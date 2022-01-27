import { Component, Input, OnInit, Renderer2, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'bego-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {

  @ViewChild('button', { static: false }) default!: ElementRef;

  public iconVisible: boolean = false;

  @Input() multicolor: any;
  @Input() text: any;
  @Input() class: any;
  @Input() disabled: boolean = false;

  constructor(
    private renderer:Renderer2
  ) {

  }

  ngOnInit(): void {
    // let count = this.catchClassIcon(this.class,"icon"); 
    // if(count > 0) {
    //   this.iconVisible = true;
    // }
  }

  ngAfterViewInit():void {
    let parent = this.renderer.parentNode(this.default.nativeElement);
    this.renderer.removeClass(parent,'icon');
  }

  // catchClassIcon(classItem: any, word: any) {
  //   return classItem.split(word).length - 1;
  // }

}
