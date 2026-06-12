"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, GraduationCap, ArrowRight, Users } from "lucide-react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim()) {
      toast.error("Please enter your access key");
      return;
    }
    setIsLoading(true);
    try {
      if (username === process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = `token=${encodeURIComponent(username)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
        toast.success("Welcome back! Redirecting...");
        router.push("/searchStudent");
      } else {
        toast.error("Invalid access key. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="flex min-h-screen bg-orange-50">
      {/* ── Left Brand Panel ────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 bg-white/10 rounded-full" />
        <div className="absolute top-1/3 right-[-40px] w-40 h-40 bg-white/5 rounded-full" />

        <div className="relative z-10 text-center text-white animate-slideUp">
          <div className="flex items-center justify-center w-24 h-24 bg-white/20 rounded-3xl mx-auto mb-6 shadow-xl">
            <GraduationCap size={52} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">NPPS</h1>
          <p className="text-xl font-medium text-orange-100 mb-1">
            New Progressive Public School
          </p>
          <p className="text-sm text-orange-200">Nauroo, Jehanabad — Bihar</p>

          <div className="mt-10 grid grid-cols-2 gap-4 text-left max-w-xs mx-auto">
            {[
              { emoji: "📋", text: "Fee Management" },
              { emoji: "🧾", text: "Bill Generation" },
              { emoji: "📢", text: "Announcements" },
              { emoji: "📊", text: "Analytics" },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
                <span className="text-lg">{emoji}</span>
                <span className="text-sm font-medium text-white">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Login Panel ───────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden flex-col items-center mb-8 animate-slideDown">
          <div className="flex items-center justify-center w-16 h-16 bg-orange-600 rounded-2xl mb-3 shadow-lg">
            <GraduationCap size={34} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-orange-600">NPPS</h1>
          <p className="text-sm text-gray-500">New Progressive Public School</p>
        </div>

        {/* Login Card */}
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-8 animate-scaleIn">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-7">Sign in to access the management system</p>

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Access Key
          </label>
          <div className="relative mb-5">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your access key"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="w-full px-4 py-3 pr-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 text-gray-800 placeholder-gray-400 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading || !username.trim()}
            className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-md shadow-orange-200"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-mono">Enter</kbd> to login
          </p>
        </div>

        {/* Student List Link */}
        <Link
          href="/studentList"
          className="mt-5 flex items-center gap-2 text-sm text-orange-600 font-medium hover:text-orange-700 transition-colors group"
        >
          <Users size={16} />
          View Student List
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
