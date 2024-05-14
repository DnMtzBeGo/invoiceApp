import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-app-threads',
  templateUrl: './app-threads.component.html',
  styleUrls: ['./app-threads.component.scss']
})
export class AppThreadsComponent {
  @Input() messages: {role:string, content: string }[] = [];

  

  getMessageComponentType(role: string) {
    return role === 'assistant' ? 'app-app-chibibot-message' : 'app-app-user-message';
    console.log('estamos dentrode get messg component type');
   
    
  }
}
