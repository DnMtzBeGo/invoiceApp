import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AereoComponent } from "./aereo.component";

describe("AereoComponent", () => {
  let component: AereoComponent;
  let fixture: ComponentFixture<AereoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AereoComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AereoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
