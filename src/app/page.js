"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Home() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleLogin = async () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real application, this should be handled server-side with proper authentication
      if (username === "npps6284@nauroo") {
        // Set cookie with proper security flags
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1); // 1 year expiry
        
        document.cookie = `token=${encodeURIComponent(username)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
        toast.success("Logged in successfully!");
        router.push("/searchStudent");
      } else {
        toast.error("Invalid username");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
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
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleLogin}
            disabled={isLoading || !username.trim()}
            className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>
        <div className="py-2 px-4 md:py-0 hover:bg-orange-700 md:hover:bg-transparent mt-4">
          <Link
            className="block text-center md:inline cursor-pointer"
            href="/studentList"
          >
            Search Students
          </Link>
        </div>
      </div>
    </>
  );
}
