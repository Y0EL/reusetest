export interface Submission {
  _id?: string;
  round?: number;
  address: string;
  timestamp: number;
  images?: string[];
  deviceID?: string;
}
