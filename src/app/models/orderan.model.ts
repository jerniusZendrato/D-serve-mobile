


// POST DATA ORDERAN (REQUESTER)
export interface postoderan{
  requesterUserId: string;
  requesterUnitId: string;
  requestedUnitTypeId: string;
  description:string;
  location: string|null
}




// RESPONTE DATA GET
export interface HelpRequestsResponse {
  errors: any;
  data: SupportsData;
  timestamp: string;
  isSuccess: boolean;
}
export interface SupportsData {
  supports: supports[];
}

export interface pesanData {
  data: {
    supports: supports[]; // pastikan Support adalah interface atau type yang sudah didefinisikan
  };

}

export interface supports {
  id: string;
  status: string;
  requesterUserId: String;
  requesterUserName: String;
  requesterUnitId: String;
  requesterUnitName:String;
  requesterUnitTypeId:String;
  requesterUnitTypeName:String;
  responderUserId:String;
  responderUserName:String;
  responderUnitId:String;
  responderUnitName:String;
  description:String;
  location:string;
  acceptedAt:Date;
  prosessAt:Date;
  completedAt: Date;
  targetUnitTypeId: string;
  targetUnitTypeName:string
}












