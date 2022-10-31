import * as R from 'ramda';
import * as grpc from 'grpc';
import { MailerService } from '@nestjs-modules/mailer';
import {
  forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import * as fs from 'fs';
import { renderTemplate } from '../../modules/ejs/render-template';
import { naas } from '../../proto/naas.auth';
import { SigninService } from '../signin/signin.service';
import { DEFAULT_CLIENT_URL } from '../user.constants';
import { UserService } from '../user.service';
import { ForgotPasswordRepository } from './forgot-password.repository';
import { IResetPasswordResponse } from './interfaces/reset-password-response.interface';
import { ISendForgotPasswordEmailResponse } from './interfaces/send-forgot-password-email-response.interface';
import { IValidateForgotPasswordResponse } from './interfaces/validate-forgot-password-response.interface';

@Injectable()
export class ForgotPasswordService {
  private CLIENT_URL = ''

  private ADMIN_EMAIL = ''

  constructor(
    @InjectRepository(ForgotPasswordRepository)
    private forgotPasswordRepository: ForgotPasswordRepository,

    @Inject(forwardRef(() => SigninService))
    private readonly signinService: SigninService,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly mailerService: MailerService,

    private readonly configService: ConfigService
  ) {
    this.CLIENT_URL = configService.get('CLIENT_URL') || DEFAULT_CLIENT_URL;
    this.ADMIN_EMAIL = configService.get('ADMIN_EMAIL');
  }

  @Transactional()
  async sendForgotPasswordEmail(
    email:string,
    lang:string
  ): Promise<ISendForgotPasswordEmailResponse> {
    const user = await this.userService.getUser({ email });
    const { hash } = await this.signinService.getSignin({ email });
    const forgotPassword = await this.forgotPasswordRepository.createForgotPassword(
      user.userId, hash
    );

    if (!forgotPassword.forgotPasswordId) {
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Create forgot password failed'
      });
    }

    let langToUse = lang;
    if (fs.existsSync(`templates/activation-email-${lang}.ejs`) === false) {
      langToUse = 'en';
    }
    const template = R.pipe(
      (forgotPasswordId: string) => (
        { link: `${this.CLIENT_URL}/forgot-password/${forgotPasswordId}?lng=${lang}` }
      ),
      renderTemplate(`templates/forgot-password-email-${langToUse}.ejs`),
    )(forgotPassword.forgotPasswordId);

    try {
      const data = await this
        .mailerService
        .sendMail({
          to: email,
          from: this.ADMIN_EMAIL,
          subject: 'Reset password',
          html: template,
        });
      const { messageId } = data;
      if (!messageId) {
        throw new RpcException({
          code: grpc.status.INTERNAL,
          message: 'Send forgot password email failed'
        });
      }
    } catch (error) {
      const { message, code } = error;
      if (code === 'SignatureDoesNotMatch') {
        throw new RpcException({
          code: grpc.status.UNAVAILABLE,
          message: 'Send forgot password email failed. Unable to access email server'
        });
      }
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message
      });
    }

    return {
      status: naas.auth.SendForgotPasswordEmailResponse.SendForgotPasswordEmailResponseStatus.OK
    };
  }

  @Transactional()
  async resetPassword(
    newPassword:string,
    forgotPasswordId:string,
  ): Promise<IResetPasswordResponse> {
    const forgotPassword = await this.forgotPasswordRepository.findOne({
      forgotPasswordId
    });
    const user = await this.userService.getUserById({ userId: forgotPassword.userId });

    const isPasswordChanged = await this.signinService.changeUserPassword(user.email, newPassword);
    if (!isPasswordChanged) {
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Reset user password failed'
      });
    }

    const isForgotPasswordChanged = await this.forgotPasswordRepository.updateForgotPassword(
      {
        forgotPasswordId
      },
      {
        active: false
      }
    );

    if (!isForgotPasswordChanged) {
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Reset user password failed'
      });
    }

    return {
      status: naas.auth.ResetPasswordResponse.ResetPasswordResponseStatus.OK
    };
  }

  @Transactional()
  async validateForgotPassword(
    forgotPasswordId:string,
  ): Promise<IValidateForgotPasswordResponse> {
    const forgotPassword = await this.forgotPasswordRepository.findOne({
      forgotPasswordId,
      active: true
    });
    if (!forgotPassword) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'Forgot password request not found'
      });
    }

    return {
      status: naas.auth.ValidateForgotPasswordResponse.ValidateForgotPasswordResponseStatus.OK
    };
  }
}
