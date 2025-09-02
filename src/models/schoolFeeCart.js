import { Schema, model, models } from "mongoose";

const schoolFeeCartSchema = new Schema({
  totalDuesFee: {
    type: Number,
    default: 0,
  },
  totalPaidFee: {
    type: Number,
    default: 0,
  },
  month: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Add indexes for better query performance
schoolFeeCartSchema.index({ month: 1 });

const SchoolFeeCartSchema =
  models.SchoolFeeCartSchema ||
  model("SchoolFeeCartSchema", schoolFeeCartSchema);
export default SchoolFeeCartSchema;
