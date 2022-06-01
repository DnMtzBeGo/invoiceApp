import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetAssetCardComponent } from './fleet-asset-card.component';

describe('FleetAssetCardComponent', () => {
  let component: FleetAssetCardComponent;
  let fixture: ComponentFixture<FleetAssetCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FleetAssetCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetAssetCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
