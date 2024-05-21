import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';

interface Question {
  message: string;
  files?: File[];
}

@Component({
  selector: 'app-app-threads',
  templateUrl: './app-threads.component.html',
  styleUrls: ['./app-threads.component.scss']
})
export class AppThreadsComponent {
  @ViewChild('scrollContainer') private scrollContainer: ElementRef;
  @Input() chatId: string = '';
  sendingMessage: boolean = false;

  question = {
    message: '',
    files: []
  };

  messages: any[] = [];

  quickQuestions = [
    {
      title: 'Write an email',
      description: 'requesting a deadline extension for my project'
    },
    {
      title: 'Write an email',
      description: 'to request a quote from local plumbers'
    },
    {
      title: 'Plan a trip',
      description: 'to see the best of Route 57 in one week'
    },
    {
      title: 'Start an online business',
      description: 'finding a niche'
    }
  ];

  constructor(private webService: AuthService) {}

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.chatId.currentValue) await this.loadChat();
  }

  async loadChat() {
    (await this.webService.apiRestGet(`assistant/${this.chatId}`, { apiVersion: 'v1.1' })).subscribe({
      next: ({ result: { messages } }) => {
        this.messages = messages;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error sending message', error);
      }
    });
  }

  async sendQuestion({ message, files }: Question) {
    this.sendingMessage = true;
    const requestJson = JSON.stringify({ message });
    const verb = this.chatId ? 'apiRestPut' : 'apiRest';

    this.messages = [...this.messages, { role: 'user', content: message, files }];
    this.scrollToBottom();

    (
      await this.webService[verb](requestJson, `assistant/${this.chatId}`, {
        apiVersion: 'v1.1',
        loader: 'false'
      })
    ).subscribe({
      next: ({ result }) => {
        this.sendingMessage = false;
        this.messages = [...this.messages, { role: result.role, content: result.content }];
        if (!this.chatId) this.chatId = result.conversation_id;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error sending message', error);
        this.sendingMessage = false;
      },
      complete: () => {
        this.sendingMessage = false;
      }
    });
  }

  scrollToBottom() {
    window.requestAnimationFrame(() => {
      const top = this.scrollContainer?.nativeElement.scrollHeight;
      this.scrollContainer?.nativeElement?.scrollTo({ top, behavior: 'smooth' });
    });
  }
}
