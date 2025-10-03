import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';
export type UserDocument = User & Document;

@Schema({timestamps: true})
export class User {
  
    @Prop()
    userName: string;
    
    @Prop({ unique: true })
    email: string;

    @Prop({})
    password: string;

    @Prop({ default: ""})
    photoUrl: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Channel" })
    channel: string;

    @Prop({ type: String, required: false, default: null })
    resetOtp: string | null;

    @Prop({ type: Date, required: false, default: null })
    otpExpires: Date | null;

    @Prop()
    otpVerified: boolean;
}


export const UserSchema = SchemaFactory.createForClass(User);