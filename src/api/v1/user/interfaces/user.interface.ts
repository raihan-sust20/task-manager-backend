export enum UserRole {
  ADMIN,
  USER,
}

export interface IUser {
  userId?: string;
  email?: string;
  name?: string;
  division?: string;
  designation: string;
  joined?: string;
  lastModified?: string;
  lastSignin?: string;
  activated?: boolean;
  role?: UserRole;
}
