import { Component, OnInit } from '@angular/core';
import { GoogleLocation } from 'src/app/shared/interfaces/google-location';
import { AuthService } from 'src/app/shared/services/auth.service';
import { trigger, style, animate, transition } from '@angular/animations';
import { GoogleMapsService } from 'src/app/shared/services/google-maps/google-maps.service';
import { Router } from '@angular/router';

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
    dropoffPostalCode: 0
  }


  constructor(
    private auth: AuthService,
    private  googlemaps: GoogleMapsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getDrafts();
  }

  async getDrafts() {
    let searchOptions: any = {
      pagination: {
          page: 1,
          limit: 2000
      }
    };
    this.loader = true;
    (await this.auth.apiRest(JSON.stringify(searchOptions), 'orders/get_drafts')).subscribe(
      async (res) => {
        console.log(res.result)
        if(res.result.length > 0) {
          console.log(this.showDraftList)
          this.draftData = res.result;
          this.mapData.pickup = res.result[0].pickup.address;
          this.mapData.dropoff = res.result[0].dropoff.address;
          this.mapData.pickupLat = res.result[0].pickup.lat;
          this.mapData.pickupLng = res.result[0].pickup.lng;
          this.mapData.dropoffLat = res.result[0].dropoff.lat;
          this.mapData.dropoffLng = res.result[0].dropoff.lng;
          this.mapData.pickupPostalCode = res.result[0].pickup.zip_code;
          this.mapData.dropoffPostalCode = res.result[0].dropoff.zip_code;
          this.googlemaps.updateDataLocations(this.mapData)
        } else {
          this.showDraftList = true;
          console.log('No hay drafts')
        }
        this.loader = false;
      },
      async (res) => {
        console.log(res);
        this.loader = false;
      }
    );
  }

  updateDataDraft(draftData: any) {
    this.mapData.pickup = draftData.pickup.address;
    this.mapData.dropoff = draftData.dropoff.address;
    this.mapData.pickupLat = draftData.pickup.lat;
    this.mapData.pickupLng = draftData.pickup.lng;
    this.mapData.dropoffLat = draftData.dropoff.lat;
    this.mapData.dropoffLng = draftData.dropoff.lng;
    this.mapData.pickupPostalCode = draftData.pickup.zip_code;
    this.mapData.dropoffPostalCode = draftData.dropoff.zip_code;
    this.googlemaps.updateDataLocations(this.mapData)
  }

  indexDraft(index: number) {
    this.indexSelectedDraft = index;
  }

  async deleteDraft() {
    const requestJson = {
      order_id: this.draftData[this.indexSelectedDraft]._id,
      order_status: -2,
    };
    (await this.auth.apiRest(JSON.stringify(requestJson), 'orders/update_status')).subscribe(
      async (res) => {
        this.getDrafts();
      },
      async (res) => {
        console.log(res);
      }
    );
  }

  async loadMoreDrafts(page: any) {
    console.log(page)
    console.log("Loader: ", this.loader)
    let searchOptions: any = {
      pagination: {
          page: page
      }
    };
    this.loader = true;
    (await this.auth.apiRest(searchOptions, 'orders/get_drafts')).subscribe(
      async (res) => {
        if(res.result.length > 0) {
          let newArray  = this.draftData.concat(res.result);
          setTimeout(() => {
            this.draftData = newArray;
          }, 500);
        } else {
          console.log('No hay mas drafts')
        }
        this.loader = false;
      },
      async (res) => {
        console.log(res);
        this.loader = false;
      }
    );
  }

  async searchDraft(dataInput: any) {

    let searchOptions: any = {
      pagination: {
          page: 1,
          limit: 20
      },
      search: dataInput
    };
    
    (await this.auth.apiRest(searchOptions, 'orders/get_drafts')).subscribe(
      async (res) => {
        if(res.result.length > 0) {
          console.log(res.result)
          this.draftData = res.result;
          this.mapData.pickup = res.result[0].pickup.address;
          this.mapData.dropoff = res.result[0].dropoff.address;
          this.mapData.pickupLat = res.result[0].pickup.lat;
          this.mapData.pickupLng = res.result[0].pickup.lng;
          this.mapData.dropoffLat = res.result[0].dropoff.lat;
          this.mapData.dropoffLng = res.result[0].dropoff.lng;
          this.mapData.pickupPostalCode = res.result[0].pickup.zip_code;
          this.mapData.dropoffPostalCode = res.result[0].dropoff.zip_code;
        } else {
          setTimeout(() => {
            this.draftData = [];
            this.loader = false;
            this.showSearchDraftList = true;
            console.log('No hay resultados')
            this.googlemaps.updateDataLocations(0);
          }, 2000);
        }
        this.loader = false;
      },
      async (res) => {
        console.log(res);
        this.loader = false;
      }
    );
  }

  continueOrder() {
    this.router.navigate(['/home'], {
      state: {
        draft: this.draftData[this.indexSelectedDraft]
      }
    });
  }
}
