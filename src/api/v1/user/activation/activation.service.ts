import * as R from 'ramda';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { MailerService } from '@nestjs-modules/mailer';
import * as grpc from 'grpc';
import { RpcException } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { Activation } from './activation.entity';
import { ActivationRepository } from './activation.repository';
import { IGetActivation } from './interfaces/get-activation.interface';
import { renderTemplate } from '../../modules/ejs/render-template';
import { DEFAULT_CLIENT_URL } from '../user.constants';
import { IDeleteActivation } from './interfaces/delete-activation.interface';
import { UserService } from '../user.service';

@Injectable()
export class ActivationService {
  private CLIENT_URL = ''

  private ADMIN_EMAIL = ''

  constructor(
    @InjectRepository(ActivationRepository)
    private activationRepository: ActivationRepository,

    private readonly mailerService: MailerService,

    private readonly configService: ConfigService,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {
    this.CLIENT_URL = configService.get('CLIENT_URL') || DEFAULT_CLIENT_URL;
    this.ADMIN_EMAIL = configService.get('ADMIN_EMAIL');
  }

  @Transactional()
  async createActivation(userId: string): Promise<Activation> {
    return this.activationRepository.createActivaton(userId);
  }

  @Transactional()
  async getActivation(query: IGetActivation): Promise<Activation> {
    const activation = await this.activationRepository.findOne(query);

    if (!activation) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'Activation not found'
      });
    }

    return activation;
  }

  @Transactional()
  async resendActivation(userId:string, lang:string): Promise<any> {
    const activation = await this.getActivation({
      userId
    });

    const user = await this.userService.getUser({
      userId
    });

    const response = await this.sendActivationEmail(
      (await activation).activationId, user.email, lang
    );

    return response;
  }

  @Transactional()
  async deleteActivation(query: IDeleteActivation): Promise<Activation> {
    return this.activationRepository.deleteActivation(query);
  }

  async sendActivationEmail(activationId:string, email:string, lang:string): Promise<any> {
    let langToUse = lang;
    if (fs.existsSync(`templates/activation-email-${lang}.ejs`) === false) {
      langToUse = 'en';
    }
    const template = R.pipe(
      (activationId: string) => (
        { link: `${this.CLIENT_URL}/activation/${activationId}?lng=${lang}` }
      ),
      renderTemplate(`templates/activation-email-${langToUse}.ejs`),
    )(activationId);
    try {
      const data = await this
        .mailerService
        .sendMail({
          to: email,
          from: this.ADMIN_EMAIL,
          subject: 'Activate Account',
          html: template,
        });
      const { messageId } = data;
      if (!messageId) {
        throw new RpcException({
          code: grpc.status.FAILED_PRECONDITION,
          message: 'Send activation email failed'
        });
      }
      return data;
    } catch (error) {
      const { message, code } = error;
      if (code === 'SignatureDoesNotMatch') {
        throw new RpcException({
          code: grpc.status.INTERNAL,
          message: 'Send activation email failed. Unable to access email server'
        });
      }
      throw new RpcException({
        code: grpc.status.FAILED_PRECONDITION,
        message
      });
    }
  }
}
