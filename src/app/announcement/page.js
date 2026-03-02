"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Send } from "lucide-react";
import SimpleMenu from "@/components/ResponsiveMenu";

export default function AnnouncementPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    setLoading(true);
    setIsConfirming(false);

    try {
      const response = await fetch("/api/announcement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Message sent successfully to ${data.recipientsCount} numbers!`);
        setMessage("");
      } else {
        toast.error(data.message || "Failed to send announcement.");
      }
    } catch (error) {
      console.error("Error sending announcement:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SimpleMenu />
      
      <main className="flex-grow p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-orange-600 p-6 text-white text-center">
            <h1 className="text-2xl font-bold">📢 Send Announcement</h1>
            <p className="mt-2 text-orange-100">
              Broadcast important messages, holiday alerts, or festival greetings to all students.
            </p>
          </div>
          
          <div className="px-6 pt-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded text-sm text-blue-800">
              <strong>💡 Pro Tip for Hindi typing:</strong> You can type in Hindi using Windows built-in tools (Press <b>Windows Key + Space</b> to switch language) or type using English on <a href="https://translate.google.co.in/?sl=en&tl=hi&op=translate" target="_blank" className="underline text-blue-600">Google Translate</a> and paste it here!
            </div>
          </div>
          
          <div className="p-6">
            {!isConfirming ? (
              <>
                <label className="block text-gray-700 font-semibold mb-2">
                  Announcement Message
                </label>
                <textarea
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                  placeholder="Type your message here... (e.g., Dear Parents, the school will remain closed tomorrow due to Holi...)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                ></textarea>

                <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded text-sm text-yellow-800">
                  <strong>Note:</strong> The school name and a "do not reply" instruction will be automatically added to the end of your message. The message will be sent to ALL contact numbers in the student database.
                </div>
              </>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Message Preview</h3>
                <div className="bg-white p-4 rounded border border-gray-300 whitespace-pre-wrap text-gray-700 font-medium">
                  {message.trim()}
                  {"\n\n"}New Progressive Public School, Nauroo{"\n"}Jehanabad.{"\n"}(यह एक स्वचालित संदेश है, कृपया इसका उत्तर न दें।){"\n"}~Antesh Sir
                </div>
                <div className="mt-4 bg-red-50 text-red-700 p-3 rounded text-sm border border-red-200 font-semibold">
                  ⚠️ This message will be sent to ALL active numbers. Please review carefully.
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              {!isConfirming ? (
                <button
                  onClick={() => {
                    if (!message.trim()) {
                      toast.error("Please enter a message.");
                      return;
                    }
                    setIsConfirming(true);
                  }}
                  disabled={loading || !message.trim()}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                  Review & Send
                </button>
              ) : (
                <div className="flex gap-4 w-full sm:w-auto mt-2">
                  <button
                    onClick={() => setIsConfirming(false)}
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    Edit Message
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow transition disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Yes, Broadcast Now"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
