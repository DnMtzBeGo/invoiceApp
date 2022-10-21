import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import colorsList from '../../../shared/utils/nameColors.json';

export interface PickerSelectedColor {
  //color name or color represented in rgb
  color: string;
  colorName: string;
}

const a: [number, number, number] = [255,255,244]

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements OnInit { 

  @ViewChild('selectedColor') selectedColorRef;

  @Input() btnDone: string;
  @Input() selectedColor: PickerSelectedColor;
  @Output() changeColor: EventEmitter<PickerSelectedColor> = new EventEmitter();

  public color: string = 'rgb(0,255,95)';
  public rgbArray: Array<number> = [0, 255, 95];
  public showPicker: boolean = false;
  public colorNameSelected: string = '';


  constructor() { }

  ngOnInit() {
    this.initCanvas();
  }

  private changeColorPicker(color, shade1, shade2) {
    this.selectedColorRef.nativeElement.style.boxShadow = `inset 2px 2px 4px 0 ${shade1}, inset -2px -2px 4px 0 ${shade2}`;
    this.selectedColorRef.nativeElement.style.background = color;
  }

  public initCanvas() {
    let canvas: any = document.getElementById('colorCanvas');
    let canvasContext = canvas.getContext('2d');

    //Retina rendering
    if (window.devicePixelRatio > 1) {
      var canvasWidth = canvas.width;
      var canvasHeight = canvas.height;

      canvas.width = canvasWidth * window.devicePixelRatio;
      canvas.height = canvasHeight * window.devicePixelRatio;
      canvas.style.width = canvasWidth + "px";
      canvas.style.height = canvasHeight + "px";

      canvasContext.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    this.initColorGradient(canvas);
    this.drawCircle(canvas, null);
  
    canvas.onclick = (e) => {
      let imgData = canvasContext.getImageData((e.offsetX / canvas.clientWidth) * canvas.width, (e.offsetY / canvas.clientHeight) * canvas.height, 1, 1);
      let rgba = imgData.data;
      this.color = "rgba(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + "," + rgba[3] + ")";
      this.rgbArray = [rgba[0], rgba[1], rgba[2]]
      let hslColor = this.rgbToHsl(rgba[0], rgba[1], rgba[2]);
      let shade1 = 'hsl(' + hslColor[0]*360 +  ',' + hslColor[1]*100 + '%,' + hslColor[2]*1.5*100 + '%)';
      let shade2 = 'hsl(' + hslColor[0]*360 +  ',' + hslColor[1]*100 + '%,' + hslColor[2]*.5*100 + '%)';
      this.changeColorPicker(this.color, shade1, shade2);
      this.drawCircle(canvas, e);
    }
  }

  public chooseColor() {

    this.changeShowPicker();
    this.setColor(this.rgbArray);

  }

  private initColorGradient(canvas) {
    let gradient = canvas.getContext('2d').createLinearGradient(0, 0, canvas.width / window.devicePixelRatio, 0);

    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(1 / 5, '#ffff00');
    gradient.addColorStop((1 / 5) * 2, '#00ff00');
    gradient.addColorStop((1 / 5) * 3, '#00ffff');
    gradient.addColorStop((1 / 5) * 4, '#0000ff');
    gradient.addColorStop(1, '#ff00ff');
    canvas.getContext('2d').fillStyle = gradient;
    canvas.getContext('2d').fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height);
  }

  private drawCircle(canvas, e) {
    let ctx = canvas.getContext('2d');
    this.initColorGradient(canvas);
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(e?.offsetX || 100, 5, 5, 0, 2 * Math.PI, false);
    ctx.arc(e?.offsetX || 100, 5, 3, 0, 2 * Math.PI, true);
    ctx.fill();
}

  private rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
  }

  public changeShowPicker() {
    this.showPicker = !this.showPicker;
  }


  public setColor(selectedColor: string | number[]) {
    if(typeof selectedColor !== 'string'){
      const [h] = this.rgbToHsl(selectedColor[0],selectedColor[1],selectedColor[2])
      this.colorNameSelected = this.getHSLColorsName(h*360);
      selectedColor = `rgba(${selectedColor[0]},${selectedColor[1]},${selectedColor[2]})`
    }else{
      // this.selectedColor = selectedColor;
      this.colorNameSelected = selectedColor;
    }
    // this.formDataNewTruck.set('color', color);

    this.changeColor.emit({
      color: selectedColor,
      colorName: this.colorNameSelected,
    });

    setTimeout(() => {
      const colorBox = document.getElementById('colorChild');
      const colorCircle = document.getElementById('colorCircle');
      const colorName = document.getElementById('colorName');
      
      colorCircle.style.background = selectedColor as string;
      colorBox.style.border = `0.5px solid ${selectedColor}`;
      colorName.style.color = '#EDEDED';
    }, 30);

  }

  public getHSLColorsName(data) {
    for (const iterator of colorsList.range) {
      if (iterator['heu-start'] <= data && iterator['hue-end'] >= data) {
        return iterator.color
      }
    }
  }

}