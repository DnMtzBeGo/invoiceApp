import { Component, EventEmitter, OnInit, Output, OnChanges, Input } from '@angular/core';

@Component({
  selector: 'app-add-remove-counter',
  templateUrl: './add-remove-counter.component.html',
  styleUrls: ['./add-remove-counter.component.scss']
})
export class AddRemoveCounterComponent implements OnInit, OnChanges {

  @Input() allDriversInvitations: any = [];
  @Input() optionalCallback: Function = new Function();
  @Output() sendNumberOfDrivers = new EventEmitter();

  public totalDrivers: number = 1;
  public driverObj = { name: '', email: '', tabOpened: false, completed: false };
  public drivers = [{ name: '', email: '', tabOpened: true, completed: false }];

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: any): void {
    console.log("con los cambios en add remove", changes);
    if(changes.hasOwnProperty('allDriversInvitations') && changes.allDriversInvitations.previousValue) {
      for (const [i, iterator] of changes.allDriversInvitations.previousValue.entries()) {
        console.log("ITERANDO ANDO", iterator, i)
        if(iterator.completed) {
          this.drivers[i] = {...changes.allDriversInvitations.previousValue[i]}
        }
      }
      console.log("ANTES DE ENVIAR OTRA VEZ A TRACKING", this.drivers)
      this.sendNumberOfDrivers.emit({
        totalDrivers: this.totalDrivers,
        drivers: this.drivers
      });
    }
  }

  addDriver() {
    if (this.totalDrivers < 20) {
      this.totalDrivers++;
      console.log("CON LOS DRIVERS", this.drivers);
      this.drivers.push({ ...this.driverObj });
      
    }
    this.sendNumberOfDrivers.emit({
      totalDrivers: this.totalDrivers,
      drivers: this.drivers
    });

    console.log("CON EL ARRAY DE DRIVERS", this.drivers);
    // this.getSendButtonValidity();
  }

  removeDriver() {
    if (this.totalDrivers > 1) {
      this.totalDrivers--;
      this.drivers.pop();
      
    }
    this.sendNumberOfDrivers.emit({
      totalDrivers: this.totalDrivers,
      drivers: this.drivers
    });
    
    // this.getSendButtonValidity();
  }

}
