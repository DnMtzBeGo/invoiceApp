export interface OrderPayload {
  user_id: string;
  reference_number: string;
  status: number;
  cargo: {
    "53_48": string;
    type: string;
    required_units: number;
    description: string;
    hazardous_type: string;
    weigth: number[];
  };
  pickup: {
    lat: number;
    lng: number;
    address: string;
    startDate: number;
    zip_code: number;
    place_id: string;
    contact_info: {
      name: string;
      telephone: string;
      email: string;
    };
  };
  dropoff: {
    startDate: number;
    endDate: number;
    extra_notes: string;
    lat: number;
    lng: number;
    zip_code: number;
    address: string;
    place_id: string;
    contact_info: {
      name: string;
      telephone: string;
      email: string;
    };
  };
  add_ons: {
    insurance: boolean;
    cruce: boolean;
    customs_agent: boolean;
    cargo_value: number;
  };
  invoice: any;
  completion_percentage: number;
}
