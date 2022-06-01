import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { Component, OnInit, ViewChild } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { initializeApp } from "firebase/app";
import { of, from, Subject, pipe, merge, Observable } from "rxjs";
import {
  map,
  pluck,
  switchMap,
  mergeAll,
  first,
  filter,
  share,
  tap,
  withLatestFrom,
  exhaustMap,
  mapTo,
} from "rxjs/operators";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { fromRef, ListenEvent } from "rxfire/database";
import { Query } from "firebase/database";
import * as moment from "moment";
import { ofType } from "src/app/shared/utils/operators.rx";
import { consecutiveEquals } from "src/app/shared/utils/array";
import { AuthService } from "src/app/shared/services/auth.service";
import { ChatMsg } from "src/app/shared/components/chat-message/chat-message.model";

@Component({
  selector: "app-contact-support",
  templateUrl: "./contact-support.component.html",
  styleUrls: ["./contact-support.component.scss"],
})
export class ContactSupportComponent implements OnInit {
  chatEmmiter = new Subject();
  profilePicture: SafeUrl =
    localStorage.getItem("profilePicture") ?? "/assets/images/user-outline.svg";
  message = "";
  attachment?: File;
  attachmentPreview?: SafeUrl;
  isDragging = false;
  messages$: Observable<ChatMsg[]>;
  sendMessageLoading$: Observable<boolean>;

  moment = moment;

  @ViewChild("chatWrapper") chatWrapper: any;
  @ViewChild("autosize") autosize: any;
  @ViewChild("attachmentInput") attachmentInput: any;

  constructor(private auth: AuthService, private sanitizer: DomSanitizer) {
    const app = initializeApp({
      apiKey: "AIzaSyADYKcsLUlwvMCwYQeasfJmPg-BiKYPqUU",
      databaseURL:
        "https://bego-push-notifications-default-rtdb.firebaseio.com",
    });
    const firedb = getDatabase(app);
    const refPath = ref.bind(null, firedb);

    const conversationInfo$ = this.getConversation();

    const dbRef$ = conversationInfo$.pipe(pluck("db_ref"), map(refPath));

    this.messages$ = dbRef$.pipe(
      switchMap((dbRef: Query) => fromRef(dbRef, ListenEvent.value)),
      pluck("snapshot"),
      map(snapshotToArray),
      withLatestFrom(conversationInfo$),
      map(([allMessages, { base_url }]) => {
        const clientTypes = new Set(["carriers", "shippers"]);

        const consecutiveTypeMessages = consecutiveEquals(
          allMessages.map((message) => message.type)
        );

        return consecutiveTypeMessages.map((N, index) => {
          const from = consecutiveTypeMessages.slice(0, index).reduce(add, 0);
          const to = from + N;
          const message = allMessages[to - 1];

          // TODO: cerrar la conversacion
          // content = action
          // message = #close
          return {
            ...message,
            avatar: clientTypes.has(message.type)
              ? this.profilePicture
              : "/assets/images/avatar-support.svg",
            messages: allMessages
              .slice(from, to)
              .map(({ message, key, content, mimetype, file_name }) => ({
                message,
                stampStr: moment(Number(key)).format("MMM DD, YYYY HH:mm"),
                file:
                  content === "attachment" ? [base_url, key].join("/") : void 0,
                mimetype,
                file_name,
              })),
            stamp: Number(message.key),
            status: "received",
          };
        });
      }),
      tap(() => {
        window.requestAnimationFrame(() =>
          this.chatWrapper.nativeElement.scrollTo({
            top: this.chatWrapper.nativeElement.scrollHeight,
            behavior: "smooth",
          })
        );
      })
    );

    const sendMessageAction$ = this.chatEmmiter.pipe(
      ofType("send_message"),
      filter(
        ({ message, attachment }) => message !== "" || attachment != void 0
      )
    );

    const sendMessageRequest$ = sendMessageAction$.pipe(
      withLatestFrom(conversationInfo$),
      exhaustMap(
        ([{ message, attachment }, { conversation_id }]: Array<any>) => {
          if (attachment == void 0) {
            return this.auth.apiRest(
              JSON.stringify({
                message,
                conversation_id,
                type: "carriers",
              }),
              "chat/send_message"
            );
          }

          const formData = new FormData();
          formData.append("file", attachment);
          formData.append("message", message);
          formData.append("conversation_id", conversation_id);
          formData.append("type", "carriers");

          return this.auth.uploadFilesSerivce(
            formData,
            "chat/send_attachment"
            // { reportProgress : true, observe: 'events' },
          );
        }
      ),
      mergeAll(),
      tap(() => {
        this.message = "";
        this.resetAttachment();
      })
    );

    this.sendMessageLoading$ = merge(
      of(false),
      sendMessageAction$.pipe(mapTo(true)),
      sendMessageRequest$.pipe(mapTo(false))
    ).pipe(share());
  }

  ngOnInit(): void {}

  getConversation(): Observable<any> {
    return from(
      this.auth.apiRest(
        JSON.stringify({ type: "carriers" }),
        "chat/enter_conversation"
      )
    ).pipe(mergeAll(), pluck("result"), share());
  }

  sendMessage(event: Event): void {
    event.preventDefault();

    this.chatEmmiter.next([
      "send_message",
      { message: this.message, attachment: this.attachment },
    ]);
  }

  addLn() {
    this.message += "\n";
  }

  selectAttachment(event: any): void {
    if (event.target?.files?.[0] == void 0) return;

    this.attachment = event.target?.files?.[0];
    this.attachmentPreview = /image\/.+$/i.test(this.attachment?.type ?? "")
      ? this.sanitizer.bypassSecurityTrustUrl(
          window.URL.createObjectURL(this.attachment)
        )
      : void 0;
  }

  resetAttachment(): void {
    this.attachment = void 0;
    this.attachmentPreview = void 0;
    this.attachmentInput.nativeElement.value = "";
  }

  attachmentDelete(event: Event): void {
    if (!(event.target as Element)?.closest(".mat-badge-content")) return;

    this.resetAttachment();
  }

  dragover(event: any) {
    event.preventDefault();
    this.isDragging = true;
  }

  dragleave(event: any) {
    event.preventDefault();
    this.isDragging = false;
  }

  drop(event: any) {
    event.preventDefault();
    this.isDragging = false;

    this.selectAttachment({
      target: {
        files: event.dataTransfer.files,
      },
    });
  }
}

const add = (y: number, x: number) => x + y;

const snapshotToArray = (snapshot: any) => {
  const returnArr: any[] = [];

  snapshot.forEach((childSnapshot: any) => {
    const item = childSnapshot.val();
    item.key = childSnapshot.key;
    returnArr.push(item);
  });

  return returnArr;
};
