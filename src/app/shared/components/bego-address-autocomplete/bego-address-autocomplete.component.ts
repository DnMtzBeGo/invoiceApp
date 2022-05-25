import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {Observable} from 'rxjs'

declare var google: any;


@Component({
  selector: 'bego-address-autocomplete',
  templateUrl: './bego-address-autocomplete.component.html',
  styleUrls: ['./bego-address-autocomplete.component.scss']
})
export class BegoAddressAutocompleteComponent implements OnInit {

  myControl = new FormControl();
  predictions: Array<any> = [];

  autocompleteForm =  this.formBuilder.group({
    address : [''],
  });

  autoCompletePredictions: Array<any> = [];
  GoogleAutocomplete: any;
  anOptionWasSelected: boolean = false;
  selectedValue: string = '';
  originalAddressValue: string = '';


  @Input() address: string = '';
  @Output() addressChange = new EventEmitter<string>();
  @Output() placeIdChange = new EventEmitter<string>();

  @ViewChild('input') input!: ElementRef
  
  constructor(
    private formBuilder: FormBuilder,
  ){
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();

  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void{
      if(changes.address && changes.address.currentValue){
      this.originalAddressValue = this.address;
      this.autocompleteForm.controls.address.setValue(this.address);
      if(this.input?.nativeElement){
          this.input.nativeElement.value = this.originalAddressValue;
        }
    }
  }

  searchGoogleDirections(event: any): void{
    const direction = event.target.value;
    this.GoogleAutocomplete.getPlacePredictions(
      { input: direction, componentRestrictions: { country: ['mx', 'us'] } },
      (predictions: any) => {
        this.predictions = predictions;
      }
    );

  }

  selectOption(event: MatAutocompleteSelectedEvent): void{
    this.selectedValue = event.option.value;
    this.anOptionWasSelected = true;
  }

  closeAutocomplete(): void {
    if(this.anOptionWasSelected){
      this.addressChange.emit(this.input.nativeElement.value)
      this.placeIdChange.emit(this.predictions[0].place_id)
    }else{
      this.input.nativeElement.value = this.originalAddressValue;
    }

    this.anOptionWasSelected = false;
  }

}
