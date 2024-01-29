import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FacturaEmitterComponent } from '../../components/factura-emitter/factura-emitter.component';

@Component({
  selector: 'app-emisores',
  templateUrl: './emisores.component.html',
  styleUrls: ['./emisores.component.scss']
})
export class EmisoresComponent implements OnInit {
  dataSource: unknown[];

  constructor(public dialog: MatDialog, private apiRestService: AuthService) {
    this.getEmisores();
  }

  async ngOnInit() {
    // this.newEmisor();
  }

  public async getEmisores() {
    (await this.apiRestService.apiRestGet('invoice/emitters')).subscribe(
      (res) => {
        this.dataSource = res.result.documents;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  newEmisor(): void {
    const dialogRef = this.dialog.open(FacturaEmitterComponent, {
      restoreFocus: false,
      autoFocus: false,
      disableClose: true,
      backdropClass: ['brand-dialog-1']
    });
    dialogRef.afterClosed().subscribe((result?) => {
      if (result?.success === true) {
        this.getEmisores();
      }
    });
  }
}
