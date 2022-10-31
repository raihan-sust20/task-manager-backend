import { IUser } from './user.interface';
import { IAuthTokenData } from '../jwt/jwt.interface';
import { IFirstSignin } from '../../first-signin/interfaces/first-signin.interface';

export type ISignupResponseData = IUser & IAuthTokenData & {firstSignin?: IFirstSignin};
