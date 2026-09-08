import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { BASE_URL } from "../../Service/helper.js";
import axios from "axios";

import {
  FaUsers,
  FaCalendarAlt,
  FaSchool,
  FaTrophy,
  FaPlus,
  FaArrowRight,
  FaUserPlus,
  FaList,
  FaCalendarPlus,
  FaClipboardList,
  FaUserTie,
  FaAddressBook,
} from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [winners, setWinners] = useState([]);
  const [poc, setPoc] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
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

        setEvents(eventsResponse.data);
        setPoc(pocResponse.data);
        setParticipants(participantsResponse.data);
        setWinners(winnersResponse.data);
      } catch (error) {
        console.log("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Participants",
      value: participants.length,
      subtitle: "Registered participants",
      icon: FaUsers,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Events",
      value: events.length,
      subtitle: "Total events",
      icon: FaCalendarAlt,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Schools",
      value: poc.length,
      subtitle: "Registered schools",
      icon: FaSchool,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Winners",
      value: winners.length,
      subtitle: "Across all events",
      icon: FaTrophy,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  const quickActions = [
    {
      title: "Add Participant",
      description: "Register a new participant",
      icon: FaUserPlus,
      action: () => navigate("/addParticipant"),
      primary: true,
    },
    {
      title: "View Participants",
      description: "Manage registered participants",
      icon: FaUsers,
      action: () => navigate("/viewParticipants"),
    },
    {
      title: "Add Event",
      description: "Create and manage events",
      icon: FaCalendarPlus,
      action: () => navigate("/addEvent"),
      adminOnly: true,
      primary: true,
    },
    {
      title: "Check Events",
      description: "View upcoming and past events",
      icon: FaClipboardList,
      action: () => navigate("/checkEvents"),
    },
  ];

  const managementActions = [
    {
      title: "Add School POC",
      description: "Add a point of contact for a school",
      icon: FaUserTie,
      action: () => navigate("/addPoc"),
    },
    {
      title: "View School POC",
      description: "View and manage school contacts",
      icon: FaAddressBook,
      action: () => navigate("/viewPoc"),
    },
    {
      title: "Winner List",
      description: "View winners from all events",
      icon: FaTrophy,
      action: () => navigate("/viewWinners"),
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 px-4 py-5 md:px-8 lg:px-10">

        {/* Header */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="mb-1 text-sm font-semibold text-indigo-600">
                Antyodaya Dashboard
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Welcome back, {user?.name || "User"} 
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Manage participants, events, schools and winners from one place.
              </p>
            </div>

            {user?.isAdmin === true && (
              <button
                onClick={() => navigate("/addEvent")}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
              >
                <FaPlus className="text-xs" />
                Add Event
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                <div className="flex items-start justify-between">

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}
                  >
                    <Icon className={`text-lg ${stat.iconColor}`} />
                  </div>

                  <FaArrowRight className="text-xs text-slate-300" />
                </div>

                <p className="mt-4 text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                  {loading ? "..." : stat.value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {stat.subtitle}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <section className="mb-8">

          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Frequently used dashboard actions
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {quickActions
              .filter(
                (item) => !item.adminOnly || user?.isAdmin === true
              )
              .map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    onClick={item.action}
                    className={`group flex items-center gap-4 rounded-2xl border p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      item.primary
                        ? "border-indigo-600 bg-indigo-600"
                        : "border-slate-200 bg-white"
                    }`}
                  >

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        item.primary
                          ? "bg-white/15 text-white"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      <Icon className="text-lg" />
                    </div>

                    <div className="flex-1">

                      <h3
                        className={`font-semibold ${
                          item.primary
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        {item.title}
                      </h3>

                      <p
                        className={`mt-1 text-sm ${
                          item.primary
                            ? "text-indigo-100"
                            : "text-slate-500"
                        }`}
                      >
                        {item.description}
                      </p>

                    </div>

                    <FaArrowRight
                      className={`text-sm transition-transform duration-200 group-hover:translate-x-1 ${
                        item.primary
                          ? "text-white"
                          : "text-slate-300 group-hover:text-indigo-500"
                      }`}
                    />

                  </button>
                );
              })}
          </div>
        </section>

        {/* Management */}
        <section>

          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage schools, contacts and event results
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {managementActions.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  onClick={item.action}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                >

                  <div className="mb-5 flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-indigo-600">
                      <Icon className="text-lg" />
                    </div>

                    <FaArrowRight className="text-sm text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" />

                  </div>

                  <h3 className="font-semibold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.description}
                  </p>

                </button>
              );
            })}

          </div>
        </section>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;