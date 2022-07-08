export interface GoogleLocation {
    pickup: string;
    dropoff: string;
    pickupLat: string;
    pickupLng: string;
    dropoffLat: string;
    dropoffLng: string;
    pickupPostalCode: number;
    dropoffPostalCode: number;
    place_id_pickup?: '',
    place_id_dropoff?: ''
}