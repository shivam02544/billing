import { Schema, model, models } from "mongoose";
const studentSchema = new Schema({
  pageId: { type: String, set: (value) => value.toUpperCase().trim() },
  name: { type: String, set: (value) => value.toUpperCase().trim() },
  className: { type: String, set: (value) => value.toUpperCase().trim() },
  village: { type: String, set: (value) => value.toUpperCase().trim() },
  session: { type: String, set: (value) => value.toUpperCase().trim() },
  fatherName: { type: String, set: (value) => value.toUpperCase().trim() },

  contact: { type: String, trim: true },
  transport: { type: Number },
  extraClassesFee: { type: Number },
  dueFee: Number,
}, {
  timestamps: true,
  versionKey: false,
});

// Add indexes for better query performance
studentSchema.index({ pageId: 1 });
studentSchema.index({ className: 1 });
studentSchema.index({ name: 1 });

export default studentSchema;
