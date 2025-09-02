import { Schema, model, models } from "mongoose";

const feeSchema = new Schema({
  className: { type: String },
  fee: { type: Number, required: true },
  examFee: { type: Number, required: true },
}, {
  timestamps: true,
  versionKey: false,
});

// Add indexes for better query performance
feeSchema.index({ className: 1 });

const FeeSchema = models.FeeSchema || model("FeeSchema", feeSchema);
export default FeeSchema;
