"use client";

import React from "react";
import UpiQrCode from "./UpiQrCode";
import { DEFAULT_BILL_LAYOUT } from "@/helper/billLayout";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CustomBill({ bill, students = [], settings }) {
  const layout = settings.customBillLayout || DEFAULT_BILL_LAYOUT;
  const billWidth = settings.billWidth || 400;
  
  // Calculate dynamic container height based on elements
  const visibleElements = layout.filter(el => el.visible !== false);
  const autoHeight = Math.max(...visibleElements.map(el => el.top + el.height), 440) + 15;
  const containerHeight = settings.billHeight > 0 ? settings.billHeight : autoHeight;

  const primaryStudent = students[0] || {};
  const studentDetails = {
    name: primaryStudent.name || bill.name || "N/A",
    className: primaryStudent.className || bill.className || "N/A",
    parent: primaryStudent.parent || bill.parent || "N/A",
    village: primaryStudent.village || bill.village || "N/A",
  };

  return (
    <div 
      className="relative bg-white border border-gray-300 rounded-sm mx-auto shadow-sm select-none shrink-0 overflow-hidden print-custom-bill"
      style={{ 
        width: `${billWidth}px`, 
        height: `${containerHeight}px`, 
        fontFamily: "Inter, sans-serif" 
      }}
    >
      {/* Watermark */}
      {settings.billWatermark && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-15deg] select-none text-6xl font-black whitespace-nowrap z-0">
          {settings.billWatermarkText || "NPPS"}
        </div>
      )}

      {layout.map((el) => {
        if (el.visible === false) return null;

        let content = null;
        switch (el.id) {
          case "headerText":
            content = el.text || "Bill Payment Receipt";
            break;
          case "headerDate":
            content = `On ${MONTHS[bill.billGeneratedMonth] || MONTHS[new Date().getMonth()]}`;
            break;
          case "schoolName":
            content = el.text || settings.schoolName || "NEW PROGRESSIVE PUBLIC SCHOOL";
            break;
          case "schoolAddress":
            content = el.text || settings.schoolAddress || "Nauroo, Jehanabad";
            break;
          case "studentName":
            content = `NAME: ${studentDetails.name}`;
            break;
          case "studentClass":
            content = `CLASS: ${studentDetails.className}`;
            break;
          case "studentParent":
            content = `PARENT: ${studentDetails.parent}`;
            break;
          case "studentAddress":
            content = (
              <div className="leading-tight text-left">
                <span>ADDRESS:</span>
                <span className="block truncate">{studentDetails.village}</span>
              </div>
            );
            break;
          case "feesList":
            content = (
              <div className="flex flex-col gap-1 w-full text-xs">
                {Number(bill.tuitionFee || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>SCHOOL FEE:</span>
                    <span>₹{bill.tuitionFee}</span>
                  </div>
                )}
                {Number(bill.transportFee || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>TRANSPORT FEE:</span>
                    <span>₹{bill.transportFee}</span>
                  </div>
                )}
                {(bill.isExamFeeAdded || Number(bill.examFee || 0) > 0) && (
                  <div className="flex justify-between">
                    <span>EXAM FEE:</span>
                    <span>₹{bill.examFee}</span>
                  </div>
                )}
                {Number(bill.lastMonthDue || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>PREVIOUS DUES:</span>
                    <span>₹{bill.lastMonthDue}</span>
                  </div>
                )}
                {Number(bill.otherFee || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>{bill.otherFeeMessage || "OTHER FEE"}:</span>
                    <span>₹{bill.otherFee}</span>
                  </div>
                )}
                {Number(bill.paidAmount || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>PAID AMOUNT:</span>
                    <span>₹{bill.paidAmount}</span>
                  </div>
                )}
              </div>
            );
            break;
          case "qrCode":
            const qrSize = Math.max(50, el.width - 30);
            content = (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <UpiQrCode amount={bill.totalDue} billReference={bill.pageId} size={qrSize} />
              </div>
            );
            break;
          case "dividerLine":
            content = el.text || "--------------------------------------------------------";
            break;
          case "totalDues":
            content = (
              <div className="flex justify-between w-full font-bold">
                <span>TOTAL DUES:</span>
                <span>₹{bill.totalDue}</span>
              </div>
            );
            break;
          case "notesBox":
            content = (
              <div className="flex flex-col leading-tight text-[9px] p-1 font-normal w-full text-left">
                {(el.text || "").split("\n").map((line, i) => (
                  <span key={i} className="truncate">{line}</span>
                ))}
              </div>
            );
            break;
          case "pageId":
            content = bill.pageId;
            break;
        }

        const isBox = el.id === "schoolBox" || el.id === "studentBox" || el.id === "notesBox";

        if (isBox && el.id !== "notesBox") {
          return (
            <div
              key={el.id}
              className="absolute z-10"
              style={{
                left: `${el.left}px`,
                top: `${el.top}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                border: el.border ? "1px solid black" : "none",
                pointerEvents: "none",
              }}
            />
          );
        }

        return (
          <div
            key={el.id}
            className="absolute flex items-start overflow-hidden leading-snug z-10"
            style={{
              left: `${el.left}px`,
              top: `${el.top}px`,
              width: `${el.width}px`,
              height: `${el.height}px`,
              fontSize: `${el.fontSize || 12}px`,
              fontWeight: el.fontWeight || "normal",
              color: el.color || "#000000",
              textAlign: el.align || "left",
              border: isBox && el.border ? "1px solid black" : "none",
              alignItems: el.align === "center" ? "center" : "flex-start",
              justifyContent: el.align === "center" ? "center" : el.align === "right" ? "flex-end" : "flex-start",
            }}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
