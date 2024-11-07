import { Component, OnInit } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';

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

  public async ngOnInit(): Promise<void> {
    await this.searchDraft();
    this.googlemaps.updateDataLocations(this.mapData);
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
    const drafts = await this.getDrafts({ dataInput: this.search, page });
    if (drafts.length) {
      let newArray = this.draftData.concat(drafts);
      setTimeout(() => (this.draftData = newArray), 500);
    }
    this.draftData.concat(drafts);
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

  private async getDrafts({ dataInput, page }: SearchDraft) {
    this.loader = true;
    return (
      await this.auth.apiRestGet(`orders/carriers/drafts?search=${dataInput}&page=${page}&size=10`, {
        apiVersion: 'v1.1',
      })
    )
      .toPromise()
      .then(({ result }) => {
        this.loader = false;
        return result.result;
      });
  }

  public async searchDraft({ dataInput = '', page = 1 }: SearchDraft = { dataInput: '', page: 1 }) {
    this.search = dataInput;

    const drafts = await this.getDrafts({ dataInput, page });

    if (drafts.length > 0) {
      this.draftData = drafts;
      const [draft] = drafts;
      this.setMapData(draft);
    } else {
      setTimeout(() => {
        this.draftData = [];
        this.loader = false;
        this.showSearchDraftList = true;
        this.googlemaps.updateDataLocations(0);
      }, 2000);
    }
    this.loader = false;
  }

  public continueOrder() {
    this.router.navigate(['/home'], {
      state: {
        draft: this.draftData[this.indexSelectedDraft],
      },
    });
  }
}
