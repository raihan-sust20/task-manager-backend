import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { Auth } from './schemas/auth.schema';
import { SignupDto } from './dto/signup.dto';
import { createClient } from 'redis';
import { User } from '../user/schemas/user.schema';
import { REDIS_CLIENT } from '../../../redis/redis.module';
import { RedisService } from '../../../redis/redis.service';
import { RABBITMQ_CONNECTION } from '../../../rabbitmq/rabbitmq.module';
import { RabbitMQService } from '../../../rabbitmq/rabbitmq.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private readonly authModel: Model<Auth>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject(REDIS_CLIENT) private readonly redisService: RedisService,
    @Inject(RABBITMQ_CONNECTION)
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  private async saveSignupData(signupDto: SignupDto) {
    const { email, password, firstName, lastName } = signupDto;


    const newUser = new this.userModel({
      firstName,
      lastName,
      // role: 'user'
    });

    const savedUser = await newUser.save();

    const newAuth = new this.authModel({
      email,
      passwordHash: password, // Mongoose pre-save hook will hash this
      user: savedUser._id,
    });

    const savedAuth = await newAuth.save();

  }

  private async sendVerificationEmail(email: string, firstName: string) {
    const nanoid = customAlphabet('1234567890', 6);
    // Store email verification data in Redis
    const verificationToken = nanoid();
    const expiryTimeInSeconds = 3600; // 1 hour
    await this.redisService.redisClient.set(
      `email_verification_token:${email}`,
      verificationToken,
      {
        expiration: {
          type: 'EX',
          value: expiryTimeInSeconds,
        },
      },
    );

    // Dispatch email task to RabbitMQ
    this.rabbitMQService.emailChannel.sendToQueue(
      'email',
      Buffer.from(
        JSON.stringify({
          to: email,
          subject: 'Verify Your Email Address',
          template: 'email-verification',
          data: {
            firstName,
            verificationToken,
          },
        }),
      ),
    );
  }

  async signup(signupDto: SignupDto): Promise<any> {
    const { email, firstName } = signupDto;

    // Check if user already exists
    const existingUser = await this.authModel.findOne({ email }).lean().exec();
    if (existingUser) {
      throw new ConflictException('Email already in use.');
    }

    await this.saveSignupData(signupDto);
    await this.sendVerificationEmail(email, firstName);

    return {
      success: true,
    };
  }
}
