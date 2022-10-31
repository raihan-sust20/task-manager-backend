export interface IValidateJwtRequest {
  jwt: string;
}

export interface IValidateJwtResponse {
  userId?: string;
  email?: string;
  role?: string;
}
