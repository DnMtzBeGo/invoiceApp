import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegimenesAduanerosComponent } from './regimenes-aduaneros.component';

describe('RegimenesAduanerosComponent', () => {
  let component: RegimenesAduanerosComponent;
  let fixture: ComponentFixture<RegimenesAduanerosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegimenesAduanerosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegimenesAduanerosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
