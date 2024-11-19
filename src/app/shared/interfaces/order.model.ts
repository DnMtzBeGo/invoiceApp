export interface Order {
  stamp: boolean;
  reference_number?: string;
  status: number;
  cargo: {
    '53_48': string;
    'type': string;
    'required_units': number;
    'description': string;
    'cargo_goods'?: string;
    'hazardous_type'?: string;
    'hazardous_material'?: string;
    'packaging'?: string;
    'weigth': Array<number>;
    'unit_type': string;
    'commodity_quantity': number;
  };
  pickup: {
    lat: number;
    lng: number;
    address: string;
    startDate: number;
    zip_code: number;
    contact_info: {
      name: string;
      telephone: string;
      email: string;
      country_code: string;
    };
    place_id_pickup: string;
    tax_information?: {
      rfc?: string;
      company_name?: string;
      registration_number?: string;
      country_of_residence?: string;
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
    contact_info: {
      name: string;
      telephone: string;
      email: string;
      country_code: string;
    };
    place_id_dropoff: string;
    tax_information?: {
      rfc?: string;
      company_name?: string;
      registration_number?: string;
      country_of_residence?: string;
    };
  };
  pricing: {
    deferred_payment: boolean;
    subtotal: number;
    currency: string;
  };
  invoice: {
    address: string;
    company: string;
    rfc: string;
    cfdi: string;
    tax_regime: string;
    series_id: string;
  };
}
