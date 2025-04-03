import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FleetEditTruckComponent } from './fleet-edit-truck.component';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

describe('FleetEditTruckComponent', () => {
  let component: FleetEditTruckComponent;
  let fixture: ComponentFixture<FleetEditTruckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FleetEditTruckComponent],
      imports: [HttpClientModule, TranslateModule.forRoot()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetEditTruckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
