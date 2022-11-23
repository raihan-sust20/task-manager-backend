import * as R from 'ramda';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { Activation } from './activation.entity';
import { IGetActivation } from './interfaces/get-activation.interface';
import { renderTemplate } from '../../modules/ejs/render-template';
import { DEFAULT_CLIENT_URL } from '../user.constants';
import { IDeleteActivation } from './interfaces/delete-activation.interface';
import { UserService } from '../user.service';
import { Repository } from 'typeorm';

@Injectable()
export class ActivationService {
  private CLIENT_URL = '';

  private ADMIN_EMAIL = '';

  constructor(
    @InjectRepository(Activation)
    private activationRepository: Repository<Activation>,

    private readonly mailerService: MailerService,

    private readonly configService: ConfigService,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {
    this.CLIENT_URL = configService.get('CLIENT_URL') || DEFAULT_CLIENT_URL;
    this.ADMIN_EMAIL = configService.get('ADMIN_EMAIL');
  }

  async createActivation(userId: string): Promise<Activation> {
    return this.createActivaton(userId);
  }

  async getActivation(query: IGetActivation): Promise<Activation> {
    const activation = await this.activationRepository.findOne({
      where: query,
    });

    if (!activation) {
      throw new NotFoundException('Activation not found');
    }

    return activation;
  }

  async resendActivation(userId: string, lang: string): Promise<any> {
    const activation = await this.getActivation({
      userId,
    });

    const user = await this.userService.getUser({
      userId,
    });

    const response = await this.sendActivationEmail(
      (
        await activation
      ).activationId,
      user.email,
      lang,
    );

    return response;
  }

  async deleteActivation(query: IDeleteActivation): Promise<Activation> {
    const activation = await this.activationRepository.findOne({
      where: query,
    });
    const deletedActivation = await this.activationRepository.delete(query);

    const { affected } = deletedActivation;
    if (affected === 0) {
      throw new BadRequestException('Delete activation data failed');
    }

    return activation;
  }

  async sendActivationEmail(
    activationId: string,
    email: string,
    lang: string,
  ): Promise<any> {
    let langToUse = lang;
    if (fs.existsSync(`templates/activation-email-${lang}.ejs`) === false) {
      langToUse = 'en';
    }
    const template = R.pipe(
      (activationId: string) => ({
        link: `${this.CLIENT_URL}/activation/${activationId}?lng=${lang}`,
      }),
      renderTemplate(`templates/activation-email-${langToUse}.ejs`),
    )(activationId);
    try {
      const data = await this.mailerService.sendMail({
        to: email,
        from: this.ADMIN_EMAIL,
        subject: 'Activate Account',
        html: template,
      });
      const { messageId } = data;
      if (!messageId) {
        throw new BadRequestException('Send activation email failed');
      }
      return data;
    } catch (error) {
      const { message, code } = error;
      if (code === 'SignatureDoesNotMatch') {
        throw new InternalServerErrorException(
          'Send activation email failed. Unable to access email server',
        );
      }
      throw new BadRequestException(message);
    }
  }

  async createActivaton(userId: string): Promise<Activation> {
    const newActivcation = new Activation();
    newActivcation.userId = userId;
    await this.activationRepository.save(newActivcation);

    return newActivcation;
  }
}
