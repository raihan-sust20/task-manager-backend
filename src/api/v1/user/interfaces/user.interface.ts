export enum UserRole {
  ADMIN,
  USER,
}

export interface IUser {
  userId?: string;
  email?: string;
  joined?: string;
  modified?: string;
  lastSignin?: string;
  activated?: boolean
  role?: UserRole;
}
