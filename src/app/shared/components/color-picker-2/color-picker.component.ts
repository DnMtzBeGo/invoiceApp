import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import colorsList from '../../../shared/utils/nameColors.json';

@Component({
  selector: 'bego-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class BegoColorPicker implements OnInit {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() colorName = new EventEmitter<string>();

  @ViewChild('canvas') canvasRef: ElementRef<HTMLCanvasElement>;

  colorOptions = [
    { color: 'rgb(0,71,255)', name: 'blue' },
    { color: 'rgb(250,15,0)', name: 'red' },
    { color: 'rgb(102,218,61)', name: 'green' },
    { color: 'rgb(234,234,234)', name: 'white' }
  ];

  showPicker = false;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.initCanvas();
  }

  pickColor(color: string, colorName?: string) {
    this.setColor(color, colorName);
    this.showPicker = false;
  }

  pickCustom(e: MouseEvent) {
    this.setColor('');
    this.showPicker = true;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    this.drawGradient(canvas, ctx);

    const imgData = ctx.getImageData(
      (e.offsetX / canvas.clientWidth) * canvas.width,
      (e.offsetY / canvas.clientHeight) * canvas.height,
      1,
      1
    );

    this.drawCircle(ctx, e);
    this.pickColor(`rgb(${imgData.data.slice(0, 3).join(',')})`);
  }

  toggleCustom() {
    this.setColor('');
    this.showPicker = !this.showPicker;
  }

  rgbToHex(color: string) {
    if (!color.startsWith('rgb')) return color;

    const rgb = color
      .replace(/rgba?\(/, '')
      .slice(0, -1)
      .split(',');
    return `#${rgb.map((c) => Number(c).toString(16).padStart(2, '0')).join('')}`;
  }

  getColorStyle(color: string) {
    if (!color.startsWith('rgb')) {
      const rgb = this.colorOptions.find((c) => c[1] === color);

      if (!rgb) return { background: color };

      color = rgb[0];
    }

    const rgb = color
      .replace(/rgba?\(/, '')
      .slice(0, -1)
      .split(',')
      .map(Number);
    const hsl = this.rgbToHsl(rgb);
    const shade1 = `hsl(${hsl[0] * 360}, ${hsl[1] * 100}%, ${hsl[2] * 1.5 * 100}%)`;
    const shade2 = `hsl(${hsl[0] * 360}, ${hsl[1] * 100}%, ${hsl[2] * 0.5 * 100}%)`;

    return {
      background: color,
      boxShadow: `inset 2px 2px 4px 0 ${shade1}, inset -2px -2px 4px 0 ${shade2}`
    };
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    if (window.devicePixelRatio > 1) {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      canvas.width = canvasWidth * window.devicePixelRatio;
      canvas.height = canvasHeight * window.devicePixelRatio;
      canvas.style.width = canvasWidth + 'px';
      canvas.style.height = canvasHeight + 'px';

      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    this.drawGradient(canvas, ctx);
    this.drawCircle(ctx);
  }

  private setColor(color: string, colorName?: string) {
    this.valueChange.emit(color);
    this.colorName.emit(colorName || (color.startsWith('rgb') ? this.getColorName(color) : color));
  }

  private drawGradient(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width / window.devicePixelRatio, 0);
    const colors = ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f'];
    const step = 1 / (colors.length - 1);

    colors.forEach((color, i) => {
      gradient.addColorStop(step * i, color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height);
  }

  private drawCircle(ctx: CanvasRenderingContext2D, e?: MouseEvent) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(e?.offsetX || 100, 5, 4, 0, 2 * Math.PI);
    ctx.stroke();
  }

  private rgbToHsl(color: number[]) {
    let [r, g, b] = color;
    (r /= 255), (g /= 255), (b /= 255);

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h, s, l];
  }

  private getColorName(color: string) {
    const rgb = color
      .replace(/rgba?\(/, '')
      .slice(0, -1)
      .split(',')
      .map(Number);
    let [hue] = this.rgbToHsl(rgb);
    hue *= 360;

    return colorsList.range.find((data) => data['heu-start'] <= hue && data['hue-end'] >= hue)?.color;
  }
}
