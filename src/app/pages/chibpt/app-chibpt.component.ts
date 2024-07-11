import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { PrimeService } from 'src/app/shared/services/prime.service';

@Component({
  selector: 'app-app-chibpt',
  templateUrl: './app-chibpt.component.html',
  styleUrls: ['./app-chibpt.component.scss']
})
export class AppChibptComponent {
  @Input() chatId: string = '';
  public isHistoryHidden: boolean = false;

  constructor(
    private readonly router: Router,
    public readonly primeService: PrimeService
  ) {}

  async ngOnInit() {
    if (this.primeService.loaded.isStopped) {
      this.handleMustRedirect();
    } else {
      this.primeService.loaded.subscribe(() => this.handleMustRedirect());
    }
  }

  handleMustRedirect() {
    if (!this.primeService.isPrime) this.router.navigate(['/home']);
  }

  toggleHistory() {
    this.isHistoryHidden = !this.isHistoryHidden;
  }

  loadChat(chatId: string) {
    this.chatId = chatId;
  }
}
