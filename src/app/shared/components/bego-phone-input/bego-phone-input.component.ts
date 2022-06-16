import { 
  Component, 
  OnInit, 
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
 } from '@angular/core';

 import { FormBuilder, FormGroup, Validators } from '@angular/forms';

const codesJson = require('./country-codes.json');

@Component({
  selector: 'bego-phone-input',
  templateUrl: './bego-phone-input.component.html',
  styleUrls: ['./bego-phone-input.component.scss']
})
export class BegoPhoneInputComponent implements OnInit {

  public loginPhone: string = '';
  public phone: string= '';
  public mxMask = [/\d/, /\d/, ' ', /\d/, /\d/, ' ', /\d/, /\d/, ' ', /\d/, /\d/, ' ', /\d/, /\d/];
  public usMask = [/[1-9]/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/];
  public generalMask = [/\d/,/\d/,/\d/,/\d/,' ', /\d/,/\d/,/\d/,/\d/,' ', /\d/,/\d/,/\d/,/\d/,' ', /\d/,/\d/,/\d/,/\d/];
  public phoneMask: any = this.mxMask;
  public phoneError: boolean = true;

  phoneInputForm: FormGroup = this.formBuilder.group({
    phoneNumber: ['', Validators.required],
  });

  public defaultPhoneCode = '+52';


  @Input() icon:string = '';
  //Indicates the design that bego phone input should have
  @Input() design: string = '';
  @Input() disabled: boolean = false;
  @Input() hidePhoneIcon: boolean = false;
  @Input() arrow: boolean = true;
  @Input() deleteInputOnPhoneCodeChange: boolean = false;

  @Output() blur = new EventEmitter<any>();
  @Output() phoneInvalid = new EventEmitter<boolean>();

  @Input() phoneFlag: string = 'mx';
  @Output() phoneFlagChange = new EventEmitter<string>();

  @Input() phoneCode: string = this.defaultPhoneCode;
  @Output() phoneCodeChange = new EventEmitter<string>();

  @Input() phoneNumber: string = '';
  @Output() phoneNumberChange = new EventEmitter<string>();




  public allCodes: any = [];

  public isSelectFlag: boolean = false;


  public selectedPhoneCode: string = 'mx';


  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.allCodes = Object.values(codesJson);

  }

  ngAfterViewInit(): void {
    if(this.disabled){
      this.phoneInputForm.controls['phoneNumber'].disable();
    }

  }

  ngOnChanges(changes: SimpleChanges): void{
    if(changes.phoneNumber){
      this.phoneInputForm.patchValue({
        phoneNumber: this.phoneNumber,
      });
    }

    if(changes.phoneCode){
      if(!this.phoneCode){
        this.phoneCode = this.defaultPhoneCode;
      }
    }

    if(changes.disabled){
      if(this.disabled){
        this.phoneInputForm.disable()
      }else{
        this.phoneInputForm.enable();
      }
    }

  }

  public getFocusFromInput(event: Event) {
    let refInput = (<HTMLInputElement>event.target).name;
    let inputRefered = document.getElementById(`${refInput}`);
    inputRefered!.style.top = '-15px';
    inputRefered!.style.fontSize = '10px';
  }

  public getFocusOutInput(event: Event) {
    let refInput = (<HTMLInputElement>event.target).name;
    let valueInput = (<HTMLInputElement>event.target).value;
    let inputRefered = document.getElementById(`${refInput}`);

    if(!valueInput || valueInput.length <= 0) {
      inputRefered!.style.top = '0px';
      inputRefered!.style.fontSize = '18px';
    }

  }

  public openSelector(event: Event) {

    event.stopPropagation();

    document.addEventListener('click', () => {
      this.isSelectFlag = false;
    },{
      once: true,
      capture: false,
    })

    this.isSelectFlag = !this.isSelectFlag;
  }

  public selectFlag(event: Event, codeInfo: any) {
    event.stopPropagation();
    if(codeInfo && codeInfo.dial_code && codeInfo.code) {
      this.isSelectFlag = !this.isSelectFlag;
      this.phoneFlag = codeInfo.code.toLowerCase();
      this.phoneFlagChange.emit(this.phoneFlag);

      this.phoneCode = codeInfo.dial_code || this.phoneCode;
      this.phoneCodeChange.emit(this.phoneCode);
    }

    if(codeInfo.code == 'MX') {
      this.phoneMask = this.mxMask;
    } else if(codeInfo.code == 'US') {
      this.phoneMask = this.usMask;
    } else {
      this.phoneMask = this.generalMask;
    }

    if( this.deleteInputOnPhoneCodeChange){
      this.phoneInputForm.patchValue({
        phoneNumber: '',
      });
    }
  }

  /**
   * Sends emit with the current phone number
   */
  public detectInputChanges(): void{
    const phoneNumber = this.phoneInputForm.controls['phoneNumber'].value;
    this.phoneNumberChange.emit(phoneNumber);
  }

  public blurElement(): void{
    if(this.phoneInputForm.status == 'INVALID'){
      this.phoneInvalid.emit(true);
    }else{
      this.phoneInvalid.emit(false);
    }
    const { phoneFlag, phoneCode} = this;
    const phoneNumber = this.phoneInputForm.value.phoneNumber
    this.blur.emit({phoneFlag, phoneCode, phoneNumber});
  }




}
