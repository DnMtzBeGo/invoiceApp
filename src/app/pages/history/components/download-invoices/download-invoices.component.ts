import { Component, OnInit, Input, SimpleChanges } from "@angular/core";
import { AuthService } from "src/app/shared/services/auth.service";
import { environment } from "src/environments/environment";

interface LinkFiles {
  pdf: string;
  xml: string;
  date: string;
}

@Component({
  selector: "app-download-invoices",
  templateUrl: "./download-invoices.component.html",
  styleUrls: ["./download-invoices.component.scss"],
})
export class DownloadInvoicesComponent implements OnInit {
  @Input() orderId!: string;
  @Input() orderRefNumber: string = "Invoice";
  @Input() pdf!: boolean;
  @Input() xml!: boolean;
  @Input() userRole!: string;

  public showPreview: boolean = false;

  files: LinkFiles = {
    pdf: "",
    xml: "",
    date: "",
  };

  constructor(private webService: AuthService) {}

  async ngOnInit() {
    // const { value: id } = await Storage.get({ key: "orderId" });
    const id = localStorage.getItem("orderId") || "";
    this.getFiles(this.orderId || id);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.orderId) {
      // const { value: id } = await Storage.get({ key: "orderId" });
      const id = localStorage.getItem("orderId") || "";
      this.getFiles(this.orderId || id);
    }
  }

  async getFiles(id: string) {
    if(!id) return;
    
    const requestFile = JSON.stringify({ orderId: id });
    (
      await this.webService.apiRest(requestFile, "invoice/get_pdf_xml")
    ).subscribe(
      async ({ result }) => {
        if (result.pdf && result.xml) {
          this.showPreview = false;
          this.setFilesInfo(result);
        } else {
          this.showPreview = true;
        }
      },
      async (error) => {
      }
    );
  }

  async downloadInvoice(type: "pdf" | "xml") {
    if (this.showPreview) {
      this.getInvoicePreview();
      return;
    }
    type === "pdf"
      ? await window.open(this.files.pdf)
      : await window.open(this.files.xml);
  }

  private setFilesInfo(info: any): void {
    this.files = info;
  }

  public async getInvoicePreview() {
    const token = localStorage.getItem("token");
    window.open(
      `${environment.URL_BASE}/invoice/get_preview_consignment/${this.orderId}/?token=${token}`
    );
  }
}
