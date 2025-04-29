import { Schema, model, models } from "mongoose";

const schoolFeeCartSchema = new Schema({
  totalDuesFee: {
    type: Number,
  },
  totalPaidFee: {
    type: Number,
  },
  month: {
    type: String,
  },
});

const SchoolFeeCartSchema =
  models.SchoolFeeCartSchema ||
  model("SchoolFeeCartSchema", schoolFeeCartSchema);
export default SchoolFeeCartSchema;
