import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { SeriesNewComponent } from '../../components/series-new/series-new.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-series-page',
  templateUrl: './series-page.component.html',
  styleUrls: ['./series-page.component.scss']
})
export class SeriesPageComponent implements OnInit {
  public stateSubscriptionSeries: Subscription;
  dataSource: unknown[];

  constructor(
    public dialog: MatDialog,
    private notificationsService: NotificationsService,
    public apiRestService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.getSeries();
  }

  ngOnInit(): void {}

  newSeries(): void {
    const dialogRef = this.dialog.open(SeriesNewComponent, {
      data: {
        emisor: this.route.snapshot.paramMap.get('id')
      },
      restoreFocus: false,
      autoFocus: false,
      backdropClass: ['brand-dialog-1']
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.message != '') {
        this.notificationsService.showSuccessToastr(result.message);
        this.getSeries();
      }
    });
  }

  ngOnDestroy(): void {}

  public async getSeries() {
    let requestJson = {
      emisor: this.route.snapshot.paramMap.get('id')
    };
    (await this.apiRestService.apiRestGet('invoice/series', requestJson)).subscribe(
      (res) => {
        this.dataSource = res.result.series;
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
