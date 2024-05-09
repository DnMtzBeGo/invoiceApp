import { Component } from '@angular/core';

@Component({
  selector: 'app-app-chibpt',
  templateUrl: './app-chibpt.component.html',
  styleUrls: ['./app-chibpt.component.scss']
})
export class AppChibptComponent {
  messages = [
    { sender: 'user', content: 'Hello, how r u?'},
    { sender: 'bot', content: 'im great, what about you?' },
    { sender: 'user', content: 'Lorem ipsum dolor sit amet, consectetur adipisci elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
    { sender: 'bot', content: '¿En qué puedo ayudarte hoy?' },
    { sender: 'user', content: 'Check the spelling mistakes in my documentation', files: 'Personal Docs.pdf', format: 'PDF'},
    /*
    { sender: 'user', content: 'Lorem ipsum dolor sit amet, consectetur adipisci elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
    { sender: 'bot', content: 'Lorem ipsum dolor sit amet, consectetur adipisci elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
    { sender: 'user', content: 'Lorem ipsum dolor sit amet, consectetur adipisci elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
    { sender: 'bot', content: 'Lorem ipsum dolor sit amet, consectetur adipisci elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
    */
  ];

  /*
  messages = [];
  */
}
