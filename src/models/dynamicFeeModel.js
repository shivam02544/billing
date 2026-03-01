import { Schema } from "mongoose";

const dynamicFeeSchema = new Schema({
  name: { type: String, required: true }, // e.g. "Transport Fee"
  amount: { type: Number, required: true }, // e.g. 1500
  description: { type: String, default: "" }, // Details about this fee
  isActive: { type: Boolean, default: true } // Toggle fee visibility/usability
}, {
  timestamps: true,
  versionKey: false,
});

dynamicFeeSchema.index({ name: 1 });

export default dynamicFeeSchema;
