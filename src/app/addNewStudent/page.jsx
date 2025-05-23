"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import ResponsiveMenu from "@/components/ResponsiveMenu";

const Page = () => {
  const [pageId, setPageId] = useState("");
  const [isYearllyFee, setYearlyFee] = useState(false)
  const [name, setName] = useState("");
  const [className, setClass] = useState("PRE-NC");
  const [village, setVillage] = useState("");

  const [fatherName, setFatherName] = useState("");

  const [contact, setContact] = useState("");
  const [transport, setTransport] = useState("");
  const [dueFee, setDueFee] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [isSiblings, setIsSiblings] = useState(false)
  const [extraClassesFee, setExtraClassesFee] = useState("");

  const getUserDetail = async (pageId) => {
    try {
      const response = await fetch(`/api/studentsData?pageId=${pageId}`);
      const data = await response.json();
      if (data.status === 200) {

        setIsSiblings(true)
        setVillage(data.data[0].village);


        setFatherName(data.data[0].fatherName);

        setContact(data.data[0].contact);
        setTransport(data.data[0].transport)
      } else {
        setName("");
        setClass("PRE-NC");
        setVillage("");

        setFatherName("");

        setContact("");
        setTransport("");
        setDueFee("0");
        setIsSiblings(false)
      }
    } catch (error) {
      toast.error('Failed to fetch student detail. Please try again.');
    }
  }

  function handleFormChange() {
    if (isYearllyFee) {
      setDueFee("0")
      setExtraClassesFee("0")
      setTransport("0")
    } else {
      setDueFee("")
      setExtraClassesFee("")
      setTransport('')
    }

  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const studentData = {
      pageId,
      name,
      className,
      village,

      fatherName,

      contact,
      transport,
      dueFee,
      extraClassesFee,
      isYearllyFee
    };
    try {
      const response = await fetch('/api/studentsData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      const data = await response.json();
      if (data.status === 201) {
        toast.success(data.message);
        // Optionally, clear the form fields
        setPageId("");
        setName("");
        setClass("PRE-NC");
        setVillage("");


        setFatherName("");

        setContact("");
        setTransport("");
        setDueFee("");
        setIsSiblings(false)
        setExtraClassesFee("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to add student. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ResponsiveMenu />
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 px-4">
        <div className="flex items-center justify-between mb-4">
          <label className="mr-2 text-sm md:text-base font-medium text-orange-700">Add yearly student?</label>
          <button
            className={` w-14 h-7 flex items-center rounded-full p-1 transition duration-300 ${isYearllyFee ? 'bg-green-500' : 'bg-gray-300'}`}
            onClick={() => {
              setYearlyFee(!isYearllyFee)
              handleFormChange()
            }
            }
          >
            <div
              className={`w-6 h-6 bg-white rounded-full shadow-md transform duration-300 ${isYearllyFee ? 'translate-x-7' : ''}`}
            />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-2xl"
        >
          <h2 className="text-2xl font-semibold text-center text-orange-600 mb-6">
            Add New Student
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Page ID", name: "pageId", type: "text", value: pageId, setter: setPageId, },
              { label: "Name", name: "name", type: "text", value: name, setter: setName },
              { label: "Class", name: "className", type: "select", options: ["PRE-NC", "NC", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8"], value: className, setter: setClass },
              { label: "Village", name: "village", type: "text", value: village, setter: setVillage },

              { label: "Father's Name", name: "fatherName", type: "text", value: fatherName, setter: setFatherName },

              { label: "Contact", name: "contact", type: "text", value: contact, setter: setContact },
              { label: "Transport fee", name: "transport", type: "number", value: transport, setter: setTransport, display: isYearllyFee },
              { label: "Extra Classes Fee", name: "extraClassesFee", type: "number", value: extraClassesFee, setter: setExtraClassesFee, display: isYearllyFee },
              ...(!isSiblings ? [{ label: "Due Fee", name: "dueFee", type: "number", value: dueFee, setter: setDueFee, display: isYearllyFee }] : []),
            ].map((field, index) => (
              <div key={index} className="flex flex-col">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-gray-700 mb-1"
                  hidden={field.display}
                >
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className="border border-orange-400 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {field.options.map((option, i) => (
                      <option key={i} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    hidden={field.display}
                    required={!isYearllyFee}
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    onBlur={field.name === "pageId" ? () => getUserDetail(pageId) : undefined}
                    className="border border-orange-400 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`cursor-pointer mt-6 w-full ${isLoading ? 'bg-gray-400' : 'bg-orange-600'} text-white py-2 rounded-lg hover:bg-orange-700 transition`}
          >
            {isLoading ? 'Loading...' : 'Submit'}
          </button>
        </form>
      </div>
    </>
  );
};

export default Page;
