import { Schema, model, models } from "mongoose";
const studentSchema = new Schema({
  pageId: { type: String, set: (value) => value.toUpperCase() },
  name: { type: String, set: (value) => value.toUpperCase() },
  className: { type: String, set: (value) => value.toUpperCase() },
  village: { type: String, set: (value) => value.toUpperCase() },
  district: { type: String, set: (value) => value.toUpperCase() },
  dob: Date,
  fatherName: { type: String, set: (value) => value.toUpperCase() },
  motherName: { type: String, set: (value) => value.toUpperCase() },
  contact: { type: String },
  transport: { type: Number },
  extraClassesFee: { type: Number },
  dueFee: Number,
});
const StudentSchema =
  models.StudentSchema || model("StudentSchema", studentSchema);
export default StudentSchema;
