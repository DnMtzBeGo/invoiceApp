import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmisoresTableComponent } from "./emisores-table.component";

describe("EmisoresTableComponent", () => {
  let component: EmisoresTableComponent;
  let fixture: ComponentFixture<EmisoresTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmisoresTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmisoresTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
