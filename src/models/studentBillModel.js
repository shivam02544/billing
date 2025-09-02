import { Schema, model, models } from "mongoose";
const billPaymentHistorySchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  totalEducationFee: {
    type: Number,
  },
  totalTransportFee: {
    type: Number,
  },
  totalExamFee: {
    type: Number,
  },
  otherFee: {
    type: Number,
    default: 0,
  },
  otherFeeMessage: {
    type: String,
    set: (value) => value.toUpperCase(),
    trim: true,
  },

  paidAmount: {
    type: Number,
    default: 0,
  },
  totalDue: {
    type: Number,
    default: 0,
  },
  lastMonthDue: {
    type: Number,
  },

  paymentMode: {
    type: String,
    set: (value) => value.toUpperCase(),
  },
  extraClassesFee: {
    type: Number,
    default: 0,
  },
});

const studentBillSchema = new Schema(
  {
    pageId: {
      type: String,
      set: (value) => value.toUpperCase(),
      trim: true,
    },
    studentIds: [
      {
        studentId: {
          type: String,
        },
      },
    ],
    totalEducationFee: {
      type: Number,
    },
    totalTransportFee: {
      type: Number,
    },
    totalExamFee: {
      type: Number,
    },
    otherFee: {
      type: Number,
      default: 0,
    },
    otherFeeMessage: {
      type: String,
      set: (value) => value.toUpperCase(),
      trim: true,
      default: "Other",
    },
    isExamFeeAdded: {
      type: Boolean,
      default: false,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    billGeneratedMonth: {
      type: Number,
      default: () => new Date().getMonth(),
    },

    totalDue: {
      type: Number,
      default: 0,
    },
    lastMonthDue: {
      type: Number,
    },
    extraClassesFee: {
      type: Number,
      default: 0,
    },
    billPaidMonth: {
      type: Number,
      default: () => new Date().getMonth(),
    },
    billPaymentHistory: [billPaymentHistorySchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Add indexes for better query performance
studentBillSchema.index({ pageId: 1 });
studentBillSchema.index({ billGeneratedMonth: 1 });
studentBillSchema.index({ "studentIds.studentId": 1 });

const StudentBillSchema =
  models.StudentBillSchema || model("StudentBillSchema", studentBillSchema);

export default StudentBillSchema;
