"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const handleLogin = () => {
    if (username.trim() === "") {
      toast.error("Please enter a username");
      return;
    }
    if (username == "npps6284@nauroo") {
      document.cookie =
        "token=" + username + "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
      toast.success("Logged in successfully!");
      router.push("/searchStudent");
    } else {
      toast.error("Username is not valid...");
    }
  };
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition"
          >
            Login
          </button>
        </div>
      </div>
    </>
  );
}
