export interface units {
    id: string;
    name: string;
    status: string;
    unitType: unitType;
}

export interface unitType{
    id: string;
    name: string;
    description:string;
    roleUnitType: string;
}


export interface ApiResponse {
  errors: any;
  data: {
    units: units[]; // <-- PERBAIKI DI SINI
  };
  timestamp: string;
  isSuccess: boolean;
}

//get unit types
export interface ApiResponseunittypes {
  errors: any | null;
  data: UnitTypeResponse;
  timestamp: string;
}

export interface UnitTypeResponse {
  "unit-types": unitType[];
}
