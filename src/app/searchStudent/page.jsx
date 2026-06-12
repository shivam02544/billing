"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import ResponsiveMenu from "@/components/ResponsiveMenu";
import Bill from "@/components/Bill";
import StudentDetailPage from "@/components/StudentDetails";
import { Search, X, ArrowLeft, Users, Receipt, BookOpen, Printer, Filter, ChevronDown } from "lucide-react";

const CLASSES = ["All", "PRE-NC", "NC", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8"];

const StudentSearch = () => {
  const [searchQuery, setSearchQuery]      = useState("");
  const [students, setStudents]            = useState([]);
  const [showBill, setShowBill]            = useState(false);
  const [pageId, setPageId]                = useState("");
  const [showStudentDetail, setShowDetail] = useState(false);
  const [studentName, setStudentName]      = useState("");
  const [isLoading, setIsLoading]          = useState(true);
  const [classFilter, setClassFilter]      = useState("All");
  const [villageFilter, setVillageFilter]  = useState("All");
  const [showFilters, setShowFilters]      = useState(false);
  const searchRef                          = useRef(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/studentsCrud", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const data = await res.json();
        setStudents(data.data || []);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Auto-focus
  useEffect(() => {
    if (!isLoading && searchRef.current) searchRef.current.focus();
  }, [isLoading]);

  // Unique villages for filter dropdown
  const uniqueVillages = useMemo(() => {
    const set = new Set(students.map((s) => s.village).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [students]);

  // Filtered list
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students.filter((s) => {
      const matchesSearch =
        !q ||
        (s.pageId     || "").toLowerCase().includes(q) ||
        (s.name       || "").toLowerCase().includes(q) ||
        (s.className  || "").toLowerCase().includes(q) ||
        (s.fatherName || "").toLowerCase().includes(q) ||
        (s.village    || "").toLowerCase().includes(q);
      const matchesClass   = classFilter   === "All" || s.className === classFilter;
      const matchesVillage = villageFilter === "All" || s.village   === villageFilter;
      return matchesSearch && matchesClass && matchesVillage;
    });
  }, [students, searchQuery, classFilter, villageFilter]);

  const clearAll = () => {
    setSearchQuery("");
    setClassFilter("All");
    setVillageFilter("All");
    searchRef.current?.focus();
  };

  const hasActiveFilters = searchQuery || classFilter !== "All" || villageFilter !== "All";

  /* Initials avatar */
  const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const avatarColors = ["bg-orange-500","bg-blue-500","bg-green-500","bg-purple-500","bg-pink-500","bg-indigo-500"];
  const getColor = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];

  /* ── Back bar ─────────────────────────── */
  const BackBar = ({ onClick }) => (
    <div className="sticky top-0 z-20 bg-orange-50/90 backdrop-blur-sm border-b border-orange-100 px-4 py-3 flex items-center gap-3">
      <button
        onClick={onClick}
        className="flex items-center gap-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-xl transition-colors"
      >
        <ArrowLeft size={15} /> Back to Search
      </button>
    </div>
  );

  if (showBill) return (
    <>
      <BackBar onClick={() => setShowBill(false)} />
      <Bill pageId={pageId} />
    </>
  );

  if (showStudentDetail) return (
    <>
      <BackBar onClick={() => setShowDetail(false)} />
      <StudentDetailPage pageId={pageId} studentName={studentName} />
    </>
  );

  return (
    <>
      <ResponsiveMenu />
      <div className="min-h-screen bg-orange-50">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Users size={24} /> Search Students
            </h1>
            <p className="text-orange-100 text-sm mt-1">
              Find by name, Page ID, class, father's name, or village
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-5">

          {/* Search bar */}
          <div className="relative mb-3 animate-slideDown">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by Page ID, Name, Class, Father's Name or Village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-20 py-3.5 border-2 border-orange-300 rounded-2xl focus:outline-none focus:border-orange-500 bg-white text-gray-800 placeholder-gray-400 shadow-sm transition-all focus:shadow-md"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button onClick={clearAll} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={15} />
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-colors ${
                  showFilters || classFilter !== "All" || villageFilter !== "All"
                    ? "bg-orange-500 text-white"
                    : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                }`}
              >
                <Filter size={11} /> Filter
                {(classFilter !== "All" || villageFilter !== "All") && (
                  <span className="w-4 h-4 bg-white text-orange-600 rounded-full text-[9px] font-extrabold flex items-center justify-center">
                    {(classFilter !== "All" ? 1 : 0) + (villageFilter !== "All" ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter dropdowns */}
          {showFilters && (
            <div className="bg-white border border-orange-200 rounded-2xl p-4 mb-3 grid grid-cols-2 gap-3 animate-slideDown shadow-sm">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Class</label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-orange-500 transition-all"
                >
                  {CLASSES.map((c) => <option key={c} value={c}>{c === "All" ? "All Classes" : `Class ${c}`}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Village</label>
                <select
                  value={villageFilter}
                  onChange={(e) => setVillageFilter(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-orange-500 transition-all"
                >
                  {uniqueVillages.map((v) => <option key={v} value={v}>{v === "All" ? "All Villages" : v}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Result count + clear */}
          {!isLoading && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-bold text-orange-600">{filteredStudents.length}</span>
                {" "}of <span className="font-semibold">{students.length}</span> students
                {hasActiveFilters && (
                  <span className="text-gray-400"> · filtered</span>
                )}
              </p>
              {hasActiveFilters && (
                <button onClick={clearAll} className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Active filter chips */}
          {(classFilter !== "All" || villageFilter !== "All") && (
            <div className="flex flex-wrap gap-2 mb-3">
              {classFilter !== "All" && (
                <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 font-semibold px-2.5 py-1 rounded-full">
                  Class: {classFilter}
                  <button onClick={() => setClassFilter("All")} className="ml-1 hover:text-orange-900">
                    <X size={11} />
                  </button>
                </span>
              )}
              {villageFilter !== "All" && (
                <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
                  {villageFilter}
                  <button onClick={() => setVillageFilter("All")} className="ml-1 hover:text-blue-900">
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* States */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-40 rounded" />
                    <div className="skeleton h-3 w-64 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredStudents.length > 0 ? (
            <ul className="space-y-2.5 animate-fadeIn">
              {filteredStudents.map((student, index) => (
                <li
                  key={index}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 card-hover"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Avatar */}
                    <div
                      className={`${getColor(student.name)} w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}
                    >
                      {getInitials(student.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{student.name}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        <span className="text-xs text-gray-500">
                          Class: <span className="font-semibold text-gray-700">{student.className}</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          Father: <span className="font-semibold text-gray-700">{student.fatherName}</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          Village: <span className="font-semibold text-gray-700">{student.village}</span>
                        </span>
                        <span className="text-xs bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded">
                          {student.pageId}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      <button
                        onClick={() => { setPageId(student.pageId); setShowBill(true); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-colors"
                      >
                        <Receipt size={13} /> Pay Bill
                      </button>
                      <button
                        onClick={() => { setPageId(student.pageId); setStudentName(student.name); setShowDetail(true); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors"
                      >
                        <BookOpen size={13} /> Details
                      </button>
                      <button
                        onClick={() => { setPageId(student.pageId); setShowBill(true); setTimeout(() => window.print(), 800); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors"
                        title="Open & Print Bill"
                      >
                        <Printer size={13} /> Print
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-16 animate-fadeIn">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg font-bold text-gray-700 mb-1">No students found</p>
              <p className="text-sm text-gray-400">Try a different name, class, village, or Page ID</p>
              {hasActiveFilters && (
                <button onClick={clearAll} className="mt-4 text-sm font-semibold text-orange-600 hover:text-orange-700">
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentSearch;
