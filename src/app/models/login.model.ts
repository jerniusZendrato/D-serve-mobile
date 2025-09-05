export interface Login {
    username: string;
    password: string;
}


export interface LoginResponse {
  errors: any; // bisa diganti tipe spesifik kalau tahu bentuk error
  data: LoginData;
  timestamp: string;
  isSuccess: boolean;
}

export interface LoginData {
  accessToken: string;
  tokenType: string;
  user: user;
}

export interface user {
  id: string;
  username: string;
  role: string;
  unit: unit| null;
}
export interface unit{
  id: string;
  name:string;
  status: string;
  unitType:{
    id:string;
    name:string;
    description: string;
    roleUnitType:string;
  }
}



