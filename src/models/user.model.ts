import mongoose, { Schema, Document } from "mongoose";

enum Gender {
  Male = "male",
  Female = "female",
  Other = "other",
}

interface IUser extends Document {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  gender?: Gender;
  photo?: string;
  height?: string;
  weight?: string;
  age?: string;
  isAdmin: boolean;
  isPremium: boolean;
  aiUsageCount: number;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String },
  gender: { type: String, enum: Object.values(Gender) },
  photo: {
    type: String,
    default:
      "https://c8.alamy.com/compfr/r6er5k/voir-le-profil-de-jeunes-beau-persian-woman-thinking-r6er5k.jpg",
  },
  height: { type: String },
  weight: { type: String },
  age: { type: String },
  isAdmin: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  aiUsageCount: { type: Number, default: 3 }, // Free users get 3 uses, premium users get unlimited
  stripeSubscriptionId: { type: String }, // ID de l'abonnement Stripe
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

UserSchema.index({ location: "2d" });

const User = mongoose.model<IUser>("User", UserSchema);
export { User, Gender, IUser };
