import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AutotransporteComponent } from "./autotransporte.component";

describe("AutotransporteComponent", () => {
  let component: AutotransporteComponent;
  let fixture: ComponentFixture<AutotransporteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AutotransporteComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutotransporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
