import { Schema } from "mongoose";

const icardFeeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      set: (value) => value.toUpperCase().trim(),
      trim: true,
    },
    // Optional: link to a student document if the student exists in DB
    studentPageId: {
      type: String,
      default: null,
      set: (value) => (value ? value.toUpperCase().trim() : null),
    },

    // iCard physically given/issued to the student
    isTaken: {
      type: Boolean,
      default: false,
    },

    // iCard fee has been paid — no money is due
    isPaid: {
      type: Boolean,
      default: false,
    },

    // Any remaining due amount (only relevant when isPaid is false)
    dueAmount: {
      type: Number,
      default: 0,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },
    session: {
      type: String,
      default: "2026-2027",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

icardFeeSchema.index({ name: 1 });
icardFeeSchema.index({ session: 1 });
icardFeeSchema.index({ studentPageId: 1 });
icardFeeSchema.index({ isTaken: 1 });
icardFeeSchema.index({ isPaid: 1 });

export default icardFeeSchema;
