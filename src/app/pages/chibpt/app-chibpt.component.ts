import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PrimeService } from 'src/app/shared/services/prime.service';

@Component({
  selector: 'app-app-chibpt',
  templateUrl: './app-chibpt.component.html',
  styleUrls: ['./app-chibpt.component.scss'],
})
export class AppChibptComponent implements OnInit {
  @Input() public chatId: string = '';
  public isHistoryHidden: boolean = false;

  constructor(private readonly router: Router, public readonly primeService: PrimeService) {}

  public async ngOnInit(): Promise<void> {
    if (this.primeService.loaded.isStopped) {
      this.handleMustRedirect();
    } else {
      this.primeService.loaded.subscribe(() => this.handleMustRedirect());
    }
  }

  public handleMustRedirect(): void {
    if (!this.primeService.isPrime) this.router.navigate(['/home']);
  }

  public toggleHistory(): void {
    this.isHistoryHidden = !this.isHistoryHidden;
  }

  public loadChat(chatId: string): void {
    this.chatId = chatId;
  }
}
