import { Schema, model, models } from "mongoose";

const feeSchema = new Schema({
  className: { type: String },
  fee: { type: Number, required: true },
  examFee: { type: Number, required: true },
});

const FeeSchema = models.FeeSchema || model("FeeSchema", feeSchema);
export default FeeSchema;
