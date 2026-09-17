import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { BASE_URL } from "../../Service/helper.js";
import axios from "axios";
import ErrorMessageModel from "../../components/Models/ErrorMessageModel";

import {
  FaUsers,
  FaCalendarAlt,
  FaSchool,
  FaTrophy,
  FaArrowRight,
  FaUserPlus,
  FaCalendarPlus,
  FaClipboardList,
  FaUserTie,
  FaAddressBook,
} from "react-icons/fa";

const extractYear = (val) => {
  if (!val) return null;
  const str = String(val);
  const kMatch = str.match(/\b2[kK](\d{2})\b/);
  if (kMatch) return 2000 + Number(kMatch[1]);
  const match = str.match(/\b(19\d{2}|20\d{2})\b/);
  if (match) return Number(match[1]);
  const num = Number(val);
  return !isNaN(num) && num >= 1990 && num <= 2100 ? num : null;
};

const getDistinctYears = (eventsList = [], pocList = []) => {
  return Array.from(
    new Set(
      [
        ...eventsList.map((e) => extractYear(e.year || e.festName)),
        ...pocList.map((pc) => extractYear(pc.year)),
      ].filter(Boolean)
    )
  ).sort((a, b) => b - a);
};

const AntyodayaDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [winners, setWinners] = useState([]);
  const [poc, setPoc] = useState([]);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const allYears = useMemo(() => getDistinctYears(events, poc), [events, poc]);

  useEffect(() => {
    if (allYears.length > 0) {
      setSelectedYear((prev) =>
        prev === "all" || !allYears.includes(Number(prev)) ? allYears[0] : prev
      );
    } else if (!loading) {
      setSelectedYear("all");
    }
  }, [allYears, loading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        eventsResponse,
        pocResponse,
        participantsResponse,
        winnersResponse,
      ] = await Promise.all([
        axios.get(`${BASE_URL}/getEvents`),
        axios.get(`${BASE_URL}/pocList`),
        axios.get(`${BASE_URL}/participantList`),
        axios.get(`${BASE_URL}/getEventsWithWinners`),
      ]);

      setEvents(eventsResponse.data || []);
      setPoc(pocResponse.data || []);
      setParticipants(participantsResponse.data || []);
      setWinners(winnersResponse.data || []);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to fetch Antyodaya dashboard data. Please try again.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const countWinners = (eventsList) => {
    let count = 0;
    // for now keep it as 0 in future we will implement it
    return count;
  };

  const filteredParticipants = useMemo(
    () =>
      selectedYear === "all"
        ? participants
        : participants.filter(
            (p) => extractYear(p.year) === Number(selectedYear)
          ),
    [participants, selectedYear]
  );

  const filteredEvents = useMemo(
    () =>
      selectedYear === "all"
        ? events
        : events.filter(
            (e) => extractYear(e.year || e.festName) === Number(selectedYear)
          ),
    [events, selectedYear]
  );

  const filteredPoc = useMemo(
    () =>
      selectedYear === "all"
        ? poc
        : poc.filter((p) => extractYear(p.year) === Number(selectedYear)),
    [poc, selectedYear]
  );

  const filteredWinnerEvents = useMemo(
    () =>
      selectedYear === "all"
        ? winners
        : winners.filter(
            (w) => extractYear(w.year || w.festName) === Number(selectedYear)
          ),
    [winners, selectedYear]
  );

  const totalWinnersCount = countWinners(filteredWinnerEvents);

  const actions = [
    {
      title: "Add Participant",
      description: "Register a new participant for events",
      icon: FaUserPlus,
      action: () => navigate("/addParticipant"),
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "View Participants",
      description: "Manage registered participants and details",
      icon: FaUsers,
      action: () => navigate("/viewParticipants"),
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Add Event",
      description: "Create and configure new festival events",
      icon: FaCalendarPlus,
      action: () => navigate("/addEvent"),
      adminOnly: true,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Check Events",
      description: "View scheduled upcoming and past events",
      icon: FaClipboardList,
      action: () => navigate("/checkEvents"),
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Add School POC",
      description: "Register a point of contact for a school",
      icon: FaUserTie,
      action: () => navigate("/addPoc"),
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "View School POC",
      description: "View and manage school contact information",
      icon: FaAddressBook,
      action: () => navigate("/viewPoc"),
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Winner List",
      description: "View and export winners across all events",
      icon: FaTrophy,
      action: () => navigate("/viewWinners"),
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
  ];

  return (
    <DashboardLayout>
      <ErrorMessageModel
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onRetry={() => {
          setShowErrorModal(false);
          fetchDashboardData();
        }}
        title="Dashboard Error"
        message={error}
      />

      <div className="m-3 sm:m-4 md:m-10 mt-20 sm:mt-24 p-4 sm:p-5 md:p-6 bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-800">
            Welcome Back, {user ? user.name : "Mentor"}!
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Antyodaya Annual Fest Management — Manage events, student participants, school POCs, and winners
          </p>
        </div>
      </div>

      <div className="w-full px-3 sm:px-4 md:px-10 pb-10 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-end px-0.5">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-sm transition-all">
            <FaCalendarAlt className="text-indigo-600 text-xs shrink-0" />
            <span className="text-slate-500 text-[11px] sm:text-xs font-medium">
              Year:
            </span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 border-0 border-none outline-none focus:outline-none focus:ring-0 cursor-pointer text-xs pr-1 shadow-none"
              aria-label="Filter stats by year"
            >
              <option value="all">All Years</option>
              {allYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white p-4 sm:p-5 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm space-y-2.5"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-slate-200 rounded w-16"></div>
                  <div className="h-7 w-7 bg-slate-200 rounded-lg"></div>
                </div>
                <div className="h-7 bg-slate-200 rounded w-14"></div>
                <div className="h-2.5 bg-slate-100 rounded w-24"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium text-[11px] sm:text-xs">
                  Participants
                </span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FaUsers className="text-xs sm:text-sm" />
                </div>
              </div>

              <div className="mt-2 sm:mt-3">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 tracking-tight block">
                  {filteredParticipants.length}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                  {selectedYear === "all"
                    ? "All-time registered"
                    : `Registered for ${selectedYear}`}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium text-[11px] sm:text-xs">
                  Events
                </span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FaCalendarAlt className="text-xs sm:text-sm" />
                </div>
              </div>

              <div className="mt-2 sm:mt-3">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 tracking-tight block">
                  {filteredEvents.length}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                  {selectedYear === "all"
                    ? "Total active events"
                    : `Competitions in ${selectedYear}`}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium text-[11px] sm:text-xs">
                  Schools
                </span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FaSchool className="text-xs sm:text-sm" />
                </div>
              </div>

              <div className="mt-2 sm:mt-3">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 tracking-tight block">
                  {filteredPoc.length}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                  {selectedYear === "all"
                    ? "Partner institutions"
                    : `Connected POCs in ${selectedYear}`}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium text-[11px] sm:text-xs">
                  Winners
                </span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FaTrophy className="text-xs sm:text-sm" />
                </div>
              </div>

              <div className="mt-2 sm:mt-3">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 tracking-tight block">
                  {totalWinnersCount}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                  {selectedYear === "all"
                    ? "Across all competitions"
                    : `Awarded in ${selectedYear}`}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-5 md:p-6">
          <div className="border-b border-slate-100 pb-3 sm:pb-3.5 mb-3.5 sm:mb-4">
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-800">
              Actions & Management
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Quick shortcuts to manage participants, events, school contacts, and competition results
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
            {actions
              .filter((item) => !item.adminOnly || user?.isAdmin === true)
              .map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    onClick={item.action}
                    className="flex items-center gap-3 sm:gap-3.5 rounded-xl md:rounded-2xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4 text-left hover:bg-slate-100/80 cursor-pointer"
                  >
                    <div
                      className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}
                    >
                      <Icon className="text-sm sm:text-base" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-800 truncate">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] sm:text-xs text-slate-500 truncate">
                        {item.description}
                      </p>
                    </div>

                    <FaArrowRight className="text-xs text-indigo-400 shrink-0" />
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AntyodayaDashboard;