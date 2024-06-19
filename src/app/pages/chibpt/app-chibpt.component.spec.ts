import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';

import { PrimeService } from 'src/app/shared/services/prime.service';
import { AppChibptComponent } from './app-chibpt.component';

describe('AppChibptComponent', () => {
  let component: AppChibptComponent;
  let fixture: ComponentFixture<AppChibptComponent>;
  let mockRouter = {
    navigate: jest.fn(),
  };
  let mockPrimeService = {
    isPrime: false,
    loaded: new Subject(),
    subscribe: jest.fn().mockImplementation(() => of(null)),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppChibptComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: PrimeService, useValue: mockPrimeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppChibptComponent);
    component = fixture.componentInstance;

    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect if not prime and loaded is stopped', () => {
    mockPrimeService.loaded.isStopped = true;
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should redirect if not prime and loaded is not stopped', () => {
    mockPrimeService.loaded.isStopped = false;
    component.ngOnInit();
    mockPrimeService.loaded.subscribe(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });
    mockPrimeService.loaded.next(); // trigger the observable
  });

  it('should redirect to home if not prime', () => {
    component.handleMustRedirect();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should not redirect if prime', () => {
    mockPrimeService.isPrime = true;
    component.handleMustRedirect();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should toggle history', () => {
    component.isHistoryHidden = false;
    component.toggleHistory();
    expect(component.isHistoryHidden).toBe(true);
    component.toggleHistory();
    expect(component.isHistoryHidden).toBe(false);
  });

  it('should load chat', () => {
    const chatId = '123';
    component.loadChat(chatId);
    expect(component.chatId).toBe(chatId);
  });
});
