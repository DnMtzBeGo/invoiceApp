import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { BegoChatBox } from '@begomx/ui-components';
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
  @ViewChild('chatBox') chatBox: BegoChatBox;
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
    else this.cleanChat();
  }

  async loadChat() {
    this.chatBox?.cleanData();
    (await this.webService.apiRestGet(`assistant/${this.chatId}`, { apiVersion: 'v1.1', getLoader: 'true' })).subscribe({
      next: ({ result: { messages } }) => {
        this.messages = messages;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error sending message', error);
      }
    });
  }

  cleanChat() {
    this.messages = [];
    this.chatBox?.cleanData();
  }

  async sendQuestion({ message, files }: Question) {
    let testgFormDta = new FormData()
    if(files) {
      files.forEach((file: File, index: number) => {
        testgFormDta.append("files", file, index.toString());
      });
    }
    testgFormDta.append("message", message)
    this.sendingMessage = true;
// c hecks if chat id is true to make de put or post request
    const uploadFunction = this.chatId
    ? this.webService.uploadFilesServicePut.bind(this.webService)
    : this.webService.uploadFilesSerivce.bind(this.webService);

    this.messages = [...this.messages, { role: 'user', content: message, files }];
    this.scrollToBottom();

    (
      await uploadFunction(testgFormDta, `assistant/${this.chatId}`, {
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
