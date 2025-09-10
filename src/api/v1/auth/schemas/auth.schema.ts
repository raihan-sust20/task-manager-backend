import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import mongoose, { Document, HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type AuthDocument = HydratedDocument<Auth>;

@Schema({ timestamps: true })
export class Auth {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, ref: 'User' })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ default: false, required: true })
  emailVerified: boolean;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);

AuthSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10); // Hash with a salt round of 10
  }
  next();
});
