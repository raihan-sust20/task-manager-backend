import * as R from 'ramda';
import {
  mockId,
  mockEmail,
  mockDateISOString,
  mockKey,
  mockPassword,
  mockString,
  mockBool,
  mockInt,
  mockCurrency,
  mockDateInMilisecond,
} from '../../mocks/mock-values.constants';
import { naas } from '../../proto/proto';
import { firstSignin } from '../../first-signin/__test__/first-signin.service.spec.constants';

export const userData = {
  userId: mockId,
  email: mockEmail,
  joined: mockDateISOString,
  modified: mockDateISOString,
  lastSignin: mockDateISOString,
  activated: mockBool,
  role: naas.auth.user.UserRole.USER,
  haveUnUniFiEarning: mockBool,
};

export const authTokenData = {
  accessToken: mockKey,
  accessTokenExpiry: mockDateISOString,
  refreshToken: mockId,
  refreshTokenExpiry: mockDateISOString,
  idToken: mockId,
};

export const userAndAuthTokenData = R.mergeLeft(userData, authTokenData);

export const getUserByIdOutput = {
  user: new naas.auth.GetUserByIdResponse(
    R.omit(['role', 'haveUnUniFiEarning'], userData),
  ),
};

export const signinInput = {
  email: mockEmail,
  password: mockString,
  role: 'USER',
};
export const signinOutput = {
  user: R.omit(['haveUnUniFiEarning'], userData),
  authTokenData
};

export const signupInput = {
  email: mockEmail,
  password: mockString,
  adminKey: mockId,
  lang: 'en',
  settings: {
    emailSubscriptions: {
      newsletter: mockBool,
    }
  },
  skipActivationEmail: mockBool,
  activateUser: mockBool,
  createFirstSignin: mockBool,
};
export const signupOutput = {
  user: R.pipe(
    R.set(R.lensProp('modified'), ''),
    R.set(R.lensProp('lastSignin'), ''),
    R.omit(['haveUnUniFiEarning']),
  )(userData),
  firstSignin,
  authTokenData,
};

export const signupResponseAS = R.pipe(
  R.set(R.lensProp('modified'), ''),
  R.set(R.lensProp('lastSignin'), ''),
  R.omit(['haveUnUniFiEarning']),
  R.assoc('firstSignin', firstSignin),
)(userAndAuthTokenData);

export const formatSignupResponseInput = signupResponseAS;
export const formatSignupResponseOutput = signupOutput;

export const paginationInput = {
  page: 1,
  limit: mockInt,
};
export const paginationMeta = {
  totalItems: mockInt * mockInt,
  itemCount: mockInt * mockInt,
  itemsPerPage: mockInt,
  totalPages: mockInt,
  currentPage: mockInt,
};

export const getUsersQuery = { activated: mockBool };
export const getUsersOutput = {
  items: R.repeat(userData, 3),
  meta: paginationMeta,
};

export const signupUsersInput = {
  data: R.repeat(signupInput, 3),
};
export const signupUsersOutput = {
  items: R.repeat(signupOutput, 3),
};

export const signOutInput = {
  userId: mockId,
  idToken: mockId,
};
export const signOutOutput = new naas.auth.user.SignOutResponse({
  isAuthenticated: mockBool,
});

export const activateUserInput = mockId;
export const activateUserOutput = {
  status: mockBool,
  user: userData,
};

export const validateEmailInput = mockEmail;
export const validateEmailOutput = {
  status: mockBool,
};

export const changeUserEmailInput = {
  userId: mockId,
  newEmail: mockEmail,
};
export const changeUserEmailOutput = {
  email: mockEmail,
};

export const changeUserPasswordInput = {
  userId: mockString,
  oldPassword: mockPassword,
  newPassword: `new-${mockPassword}`,
};
export const changeUserPasswordOutput = {
  status: mockBool,
};

export const validatePasswordInput = {
  activationId: mockId,
  email: mockEmail,
  password: mockPassword,
};
export const validatePasswordOutput = {
  status: mockBool,
};

export const sendForgotPasswordEmailInput = {
  email: mockEmail,
  lang: 'en',
};
export const sendForgotPasswordEmailOutput = {
  status: mockBool,
};

export const resetPasswordInput = {
  newPassword: mockPassword,
  forgotPasswordId: mockId,
};
export const resetPasswordOutput = {
  status: mockBool,
};

export const validateForgotPasswordInput = {
  forgotPasswordId: mockId,
};
export const validateForgotPasswordOutput = {
  status: mockBool,
};

export const resendActivationInput = {
  userId: mockId,
  lang: 'en',
};
export const resendActivationOutput = {
  status: mockBool,
};

export const getActivationInput = {
  activationId: mockId,
};
export const getActivationOutput = new naas.auth.GetActivationResponse({
  activationId: mockId,
  userId: mockId,
  referral: mockString,
});

export const validatePromotionCodeInput = mockString;
export const validatePromotionCodeOutput = new naas.auth.stripe.PromotionCode({
  id: mockId,
  object: 'coupon',
  amountOff: mockInt,
  createdDate: mockDateInMilisecond,
  currency: mockCurrency,
  duration: 'repeating',
  durationInMonths: mockInt,
  livemode: mockBool,
  maxRedemptions: mockString,
  name: mockString,
  percentOff: mockInt,
  timesRedeemed: mockString,
  valid: mockBool,
});
