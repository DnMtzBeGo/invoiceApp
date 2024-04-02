import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from 'src/app/shared/services/auth.service';
const Buffer = require('buffer/').Buffer;

@Component({
  selector: 'app-order-evidence',
  templateUrl: './order-evidence.component.html',
  styleUrls: ['./order-evidence.component.scss']
})
export class OrderEvidenceComponent implements OnInit {

  signature?: any;

  @Input() orderData: any;
  @Input() commentsText?: string;
  @Input() orderId!: string;
  @Input() orderStatus!: number ;

  constructor(
    private sanitizer: DomSanitizer,
    private webService:AuthService,
  ) { }

  ngOnInit(): void {
  }

  openPhoto(photoUrl: string){
    window.open(photoUrl);
  }

  signatureError(event: any ){
    this.signature = 
    event.target.src = '../../../../../assets/images/history/signature-sample.png';
  }
  
  base64(data: Array<number>): SafeUrl {
    const base64 = Buffer.from(data, 'base64').toString('utf-8');
    return this.sanitizer.bypassSecurityTrustUrl(base64);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.orderData){
      
      this.signature = null;
      if(this.orderData?.evidence?.signature?.type === 'Buffer'){
        this.signature = this.base64(this.orderData?.evidence?.signature?.data);
      }

    }
  }

  async getInvoice() {
    
    let requestInvoice = {
      order_id: this.orderId,
    };

    (await this.webService.apiRest(JSON.stringify(requestInvoice), 'orders/create_ticket')).subscribe(
      ({ result }) => {
        window.open(result);
      },
      (error) => {
        console.log(error);
      }
    );
  }

}
