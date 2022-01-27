import { 
  Component, 
  ElementRef, 
  Input, 
  OnInit, 
  Output, 
  ViewChild, 
  EventEmitter 
} from '@angular/core';
// import { PhoneService } from 'src/app/services/phone.service';
import { HttpClient, HttpHeaders} from '@angular/common/http';

@Component({
  selector: 'app-verification-modal',
  templateUrl: './verification-modal.component.html',
  styleUrls: ['./verification-modal.component.scss']
})
export class VerificationModalComponent implements OnInit {

  @ViewChild('firstStep') firstInput!: ElementRef;
  @ViewChild('secondStep') secondInput!: ElementRef;
  @ViewChild('thirdStep') thirdItnput!: ElementRef;
  @ViewChild('fourthStep') fourthInput!: ElementRef;


  @Input() isShipperSelected!: boolean
  @Input() getVerification!: Function;
  @Input() errorMsg?: string;
  @Input() valueToVerify: string = '';

  @Output() onCancel = new EventEmitter<void>();
  @Output() codeSubmit = new EventEmitter<string>();
  @Output() editValueToVerify = new EventEmitter<void>();
  @Output() resendCode = new EventEmitter<void>();

  public haveTime: boolean = true;
  public secondsTimer: number = 60;
  public selectedPhone!: string;
  public selectedEmail!: string;
  public step1: string = '';
  public step2: string = '';
  public step3: string = '';
  public step4: string = '';
  public requestSendCode: object = {};
  public facebookId!: string;

  constructor(
    // private phoneService: PhoneService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.dynamicTimer();
    // this.phoneService.getObservable().subscribe( (res: any) => {
    //   if(res) {
    //     this.selectedPhone = res.phone;
    //     this.requestSendCode = res.request
    //     this.facebookId = res.facebookId
    //     this.selectedEmail = res.email
    //   }
    // })
  }

  submitCode(){
    const resultCode = `${this.step1}${this.step2}${this.step3}${this.step4}`;
    this.codeSubmit.emit(resultCode);
  }

  public dynamicTimer() {
    this.secondsTimer = 60;
    this.haveTime = true;
    let resTimer = setInterval(() => {
      this.secondsTimer -= 1;
      if(this.secondsTimer === 0) {
        this.haveTime = false;
        clearInterval(resTimer);
      }
    }, 1000);
  }

  public changeInput(event: any) {
    if(event.target.id == 'firstStep' && event.target.value) {
      this.secondInput.nativeElement.focus();
    } else if(event.target.id == 'secondStep' && event.target.value) {
      this.thirdItnput.nativeElement.focus();
    } else if(event.target.id == 'thirdStep' && event.target.value) {
      this.fourthInput.nativeElement.focus();
    };

    if(event.target.id == 'secondStep' && event.key == 'Backspace') {
      this.firstInput.nativeElement.focus();
    } else if(event.target.id == 'thirdStep' && event.key == 'Backspace') {
      this.secondInput.nativeElement.focus();
    } else if(event.target.id == 'fourthStep' && event.key == 'Backspace') {
      this.thirdItnput.nativeElement.focus();
    }
  }

  public sendCode() {

    this.resendCode.emit();
    this.dynamicTimer();
    // this.http.post(`https://begomx-develop.herokuapp.com/v1.0/${this.isShipperSelected ? 'shippers' : 'carriers'}/dashboard_code`, this.requestSendCode).subscribe( res => {
    //   this.dynamicTimer();
    // }, error => {
    //   console.log("Error", error.error.error);
    // })
  }

  public editValue(){
    console.log('Emitting value to verify');
    // this.editValueToVerify.emit();
  }



}
