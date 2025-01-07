import { Component, OnInit } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { from, Observable, Subject } from 'rxjs';
import { debounceTime, finalize, map, switchMap } from 'rxjs/operators';

import { GoogleLocation } from 'src/app/shared/interfaces/google-location';
import { AuthService } from 'src/app/shared/services/auth.service';
import { GoogleMapsService } from 'src/app/shared/services/google-maps/google-maps.service';

interface SearchDraft {
  dataInput: string;
  page: number;
}

@Component({
  selector: 'app-drafts',
  templateUrl: './drafts.component.html',
  styleUrls: ['./drafts.component.scss'],
  animations: [
    trigger('enterAnimation', [transition(':enter', [style({ opacity: 0 }), animate('800ms', style({ opacity: 1 }))])]),
  ],
})
export class DraftsComponent implements OnInit {
  public draftData: any;
  public selectedDraft: any;
  public loader: boolean = false;
  public showDraftList: boolean = false;
  public showSearchDraftList: boolean = false;
  public indexSelectedDraft: number = 0;

  public mapData: GoogleLocation = {
    pickup: '',
    dropoff: '',
    pickupLat: '',
    pickupLng: '',
    dropoffLat: '',
    dropoffLng: '',
    pickupPostalCode: 0,
    dropoffPostalCode: 0,
  };

  public search: string = '';

  constructor(private auth: AuthService, private googlemaps: GoogleMapsService, private router: Router) {}

  private searchSubject = new Subject<SearchDraft>();

  public async ngOnInit(): Promise<void> {
    this.searchSubject
      .pipe(
        debounceTime(300),
        switchMap((searchDraft) => this.getDrafts(searchDraft)),
      )
      .subscribe((drafts) => {
        this.draftData = drafts;

        if (drafts.length) {
          this.updateDataDraft(drafts[0]);
        } else {
          this.draftData = [];
          this.googlemaps.updateDataLocations(0);
          this.showSearchDraftList = true;
        }
      });

    this.searchDraft();
  }

  public updateDataDraft(draftData: any) {
    this.setMapData(draftData);
    this.googlemaps.updateDataLocations(this.mapData);
  }

  public indexDraft(index: number) {
    this.indexSelectedDraft = index;
  }

  public async deleteDraft() {
    const requestJson = {
      order_id: this.draftData[this.indexSelectedDraft]._id,
      order_status: -2,
    };
    (await this.auth.apiRest(JSON.stringify(requestJson), 'orders/update_status')).subscribe(
      async (res) => {
        this.searchDraft();
      },
      async (res) => {
        console.log(res);
      },
    );
  }

  public async loadMoreDrafts(page: any) {
    this.getDrafts({ dataInput: this.search, page }).subscribe((drafts) => {
      this.draftData = [...this.draftData, ...drafts];
    });
  }

  private setMapData(draftData) {
    const [pickup, dropoff] = draftData.destinations;
    this.mapData.pickup = pickup.address;
    this.mapData.dropoff = dropoff.address;
    this.mapData.pickupLat = pickup.lat;
    this.mapData.pickupLng = pickup.lng;
    this.mapData.dropoffLat = dropoff.lat;
    this.mapData.dropoffLng = dropoff.lng;
    this.mapData.pickupPostalCode = pickup.zip_code;
    this.mapData.dropoffPostalCode = dropoff.zip_code;
  }

  private getDrafts({ dataInput, page }: SearchDraft): Observable<any[]> {
    this.loader = true;

    return from(
      this.auth.apiRestGet(`orders/carriers/drafts?search=${dataInput}&page=${page}&size=10`, {
        apiVersion: 'v1.1',
      }),
    ).pipe(
      switchMap((r) => r.pipe(map(({ result }) => result.result))),
      finalize(() => (this.loader = false)),
    );
  }

  public searchDraft({ dataInput = '', page = 1 }: SearchDraft = { dataInput: '', page: 1 }) {
    this.search = dataInput;
    this.searchSubject.next({ dataInput, page });
  }

  public continueOrder() {
    this.router.navigate(['/home'], {
      state: {
        draft: this.draftData[this.indexSelectedDraft],
      },
    });
  }
}
