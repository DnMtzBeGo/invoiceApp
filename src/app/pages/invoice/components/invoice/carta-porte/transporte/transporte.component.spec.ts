import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { TransporteComponent } from "./transporte.component";

describe("TransporteComponent", () => {
  let component: TransporteComponent;
  let fixture: ComponentFixture<TransporteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TransporteComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
