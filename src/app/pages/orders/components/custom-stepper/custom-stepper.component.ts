import {
  Component,
  AfterContentInit,
  ContentChildren,
  QueryList,
  TemplateRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-custom-stepper',
  templateUrl: './custom-stepper.component.html',
  styleUrls: ['./custom-stepper.component.scss'],
})
export class CustomStepperComponent implements AfterContentInit {
  @Input() labels: string[] = []; // Recibe los labels personalizados desde el HTML
  @Output() stepStatus: any = new EventEmitter<number>();
  @Input() currentStep = 0;
  @Input() onlyStep: boolean = false;
  steps: { label: string; template: TemplateRef<any> }[] = [];
  linePosition: number = 0; // Para almacenar la posición de la línea activa
  lineWidth: number = 0; // Ancho de la línea activa en porcentaje

  // Capturar todos los templates con el atributo 'step'
  @ContentChildren('step') stepElements!: QueryList<TemplateRef<any>>;

  ngAfterContentInit() {
    // Crear la lista de pasos con las etiquetas personalizadas
    this.steps = this.stepElements.toArray().map((stepElement, index) => {
      const label = this.labels[index] || `Paso ${index + 1}`;
      return { label, template: stepElement };
    });
    this.lineWidth = 100 / this.steps.length; // Calcular el ancho de la línea activa
    this.linePosition = 0; // Inicializa la posición de la línea activa
  }

  // Cambiar el paso actual cuando se hace clic en una etiqueta
  goToStep(index: number) {
    this.currentStep = index;
    this.linePosition = index * this.lineWidth; // Establecer la posición de la línea activa
    this.stepStatus.emit(index);
  }
}
