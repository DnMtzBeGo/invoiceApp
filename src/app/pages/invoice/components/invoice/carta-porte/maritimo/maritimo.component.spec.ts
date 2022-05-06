import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { MaritimoComponent } from "./maritimo.component";

describe("MaritimoComponent", () => {
  let component: MaritimoComponent;
  let fixture: ComponentFixture<MaritimoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MaritimoComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaritimoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
