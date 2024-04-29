import { Component, EventEmitter, Output } from '@angular/core';
import { SavedLocationsService } from '../../services/saved-locations.service';
import { throttleTime } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-saved-locations',
  templateUrl: './saved-locations.component.html',
  styleUrls: ['./saved-locations.component.scss']
})
export class SavedLocationsComponent {
  @Output() goBack = new EventEmitter();
  @Output() pickLocation = new EventEmitter();

  locations = [];
  filterInput = new Subject<string>();
  private _filterInput = '';

  constructor(public savedLocations: SavedLocationsService) {}

  ngOnInit() {
    this.setupFilter();
  }

  private setupFilter() {
    this.savedLocations.locationsChange.subscribe(() => {
      this.filterLocations();
    });

    this.filterInput.pipe(throttleTime(300, undefined, { leading: true, trailing: true })).subscribe((v) => {
      this._filterInput = v.toLowerCase();
      this.filterLocations();
    });

    this.filterLocations();
  }

  filterLocations() {
    const { locations } = this.savedLocations;
    const input = this._filterInput;

    this.locations = input ? locations.filter((item) => item.name.toLowerCase().includes(input)) : locations;
  }
}
