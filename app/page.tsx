"use client";

import { useState, useEffect } from "react";
import {
  fetchSiteData,
  fetchWorkshops,
  saveWorkshop as apiSaveWorkshop,
  deleteWorkshop as apiDeleteWorkshop,
  fetchSettings,
  saveSettings as apiSaveSettings,
  fetchRegistrations,
  BACKEND_URL,
} from "@/lib/api";
import { Workshop, SiteSettings, StoredRegistration, CurriculumModule } from "@/lib/types";
import {
  Calendar,
  Clock,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  RefreshCw,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  BookOpen,
  ArrowRight,
  GitBranch,
  Video,
  FileText,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"workshops" | "settings" | "registrations">("workshops");

  // Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [registrations, setRegistrations] = useState<StoredRegistration[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Workshop Edit / Create Modal state
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [isNewWorkshop, setIsNewWorkshop] = useState<boolean>(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Check login on mount
  useEffect(() => {
    const session = localStorage.getItem("metaquest_admin_session");
    if (session === "authenticated_v2") {
      setIsAuthenticated(true);
    }
  }, []);

  // Show status banner with auto-hide
  const notify = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  // Load all data from live backend
  const loadAllData = async () => {
    setLoading(true);
    try {
      const siteData = await fetchSiteData();
      if (siteData.workshops) setWorkshops(siteData.workshops);
      if (siteData.siteSettings) setSettings(siteData.siteSettings);
      try {
        const regs = await fetchRegistrations();
        setRegistrations(regs);
      } catch {
        // optional registrations
      }
    } catch (err: any) {
      notify("error", `Failed to connect to backend: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  // Auth handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      authEmail.trim().toLowerCase() === "admin@metaquestsolutions.com" &&
      authPassword === "MetaQuest@2026"
    ) {
      localStorage.setItem("metaquest_admin_session", "authenticated_v2");
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid credentials. Please verify your email and password.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("metaquest_admin_session");
    setIsAuthenticated(false);
  };

  // Workshop Actions
  const handleCreateNewWorkshop = () => {
    const newW: Workshop = {
      id: `mq-workshop-${Date.now()}`,
      slug: `new-workshop-${Date.now()}`,
      title: "New Deep-Tech Masterclass",
      subtitle: "Hands-on engineering curriculum with live mentorship and code deliverables.",
      date: "Saturday, Nov 14, 2026",
      time: "10:00 AM - 1:00 PM IST",
      duration: "3 Hours (Live Hands-on)",
      originalPrice: 1999,
      discountedPrice: 499,
      totalSeats: 60,
      seatsBooked: 0,
      badge: "LIVE WORKSHOP",
      category: "AI/ML",
      status: "UPCOMING",
      googleMeetLink: "https://meet.google.com/xyz-metaquest",
      googleFormUrl: "https://docs.google.com/forms/d/e/.../viewform",
      curriculum: [
        {
          step: 1,
          title: "Architecture & Problem Formulation",
          duration: "30 min",
          topics: ["Domain overview", "System requirements", "Algorithm fundamentals"],
          handsOnActivity: "Mathematical claims and model selection",
          deliverable: "Architecture blueprint",
          speaker: "Abhay",
        },
      ],
      handsOnOutcomes: ["Production-ready code repository", "Verified hardware schema & dataset"],
      prerequisites: ["Basic coding curiosity"],
      toolsProvided: ["Source Code", "Jupyter Notebooks", "Google Meet Recording"],
    };
    setEditingWorkshop(newW);
    setIsNewWorkshop(true);
  };

  const handleSaveWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkshop) return;
    setSyncing(true);
    try {
      const updatedList = await apiSaveWorkshop(editingWorkshop);
      setWorkshops(updatedList);
      setEditingWorkshop(null);
      notify("success", `Workshop "${editingWorkshop.title}" saved & synced to live site!`);
    } catch (err: any) {
      notify("error", `Save failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteWorkshop = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will remove it immediately from the public site.`)) {
      return;
    }
    // Optimistic UI update
    setWorkshops((prev) => prev.filter((w) => w.id !== id));
    setSyncing(true);
    try {
      const updated = await apiDeleteWorkshop(id);
      setWorkshops(updated);
      notify("success", `Workshop deleted and removed from live website!`);
    } catch (err: any) {
      notify("error", `Delete failed: ${err.message}`);
      loadAllData(); // rollback
    } finally {
      setSyncing(false);
    }
  };

  // Settings Actions
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSyncing(true);
    try {
      const saved = await apiSaveSettings(settings);
      setSettings(saved);
      notify("success", "Site settings & countdown timer updated successfully!");
    } catch (err: any) {
      notify("error", `Failed to save settings: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Helper for curriculum editing
  const updateCurriculumStep = (index: number, field: keyof CurriculumModule, val: any) => {
    if (!editingWorkshop) return;
    const cur = [...editingWorkshop.curriculum];
    cur[index] = { ...cur[index], [field]: val };
    setEditingWorkshop({ ...editingWorkshop, curriculum: cur });
  };

  const addCurriculumStep = () => {
    if (!editingWorkshop) return;
    const cur = [...editingWorkshop.curriculum];
    cur.push({
      step: cur.length + 1,
      title: `Module ${cur.length + 1}: Implementation`,
      duration: "30 min",
      topics: ["Key topic 1", "Key topic 2"],
      handsOnActivity: "Hands-on coding session",
      deliverable: "Deliverable item",
      speaker: "Anant",
    });
    setEditingWorkshop({ ...editingWorkshop, curriculum: cur });
  };

  const removeCurriculumStep = (index: number) => {
    if (!editingWorkshop) return;
    const cur = editingWorkshop.curriculum.filter((_, i) => i !== index);
    setEditingWorkshop({ ...editingWorkshop, curriculum: cur });
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#070A12] relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl p-8 glass-panel border border-white/10 shadow-2xl relative z-10"
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
              M
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">MetaQuest Admin Panel</h1>
            <p className="text-xs text-gray-400 mt-1 font-mono">Website Management & Workshop Settings</p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="admin@metaquestsolutions.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm text-black bg-white hover:bg-gray-100 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] mt-2"
            >
              Sign In to Admin Panel
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center text-[11px] font-mono text-gray-500">
            Backend Endpoint: {BACKEND_URL}
          </div>
        </motion.div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#070A12] text-gray-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-white/10 bg-[#0D1322]/80 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-cyan-500/20">
              MQ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">MetaQuest Solutions</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold">
                  Admin Hub
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Connected: {BACKEND_URL}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={loadAllData}
              disabled={loading || syncing}
              className="px-3 py-1.5 rounded-xl text-xs font-mono bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-gray-300 flex items-center gap-1.5 transition-all"
              title="Refresh Data from Live Server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || syncing ? "animate-spin text-cyan-400" : ""}`} />
              <span>Sync</span>
            </button>

            <a
              href={BACKEND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-mono bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-gray-300 flex items-center gap-1.5 transition-all"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl text-xs font-mono bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Status Toast */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-mono border backdrop-blur-xl ${
              statusMessage.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200"
                : "bg-rose-950/90 border-rose-500/30 text-rose-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </motion.div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1 w-full space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-950/70 border border-white/10 backdrop-blur-md">
            <span className="text-xs font-mono text-gray-400 uppercase">Active Workshops</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {workshops.length}
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">Live on Website</span>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/70 border border-white/10 backdrop-blur-md">
            <span className="text-xs font-mono text-gray-400 uppercase">Total Capacity</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {workshops.reduce((acc, w) => acc + (w.totalSeats || 0), 0)} Seats
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">Google Meet Ready</span>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/70 border border-white/10 backdrop-blur-md">
            <span className="text-xs font-mono text-gray-400 uppercase">Registrations</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {registrations.length}
            </div>
            <span className="text-[11px] text-amber-400 font-mono">Google Form + DB</span>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/70 border border-white/10 backdrop-blur-md">
            <span className="text-xs font-mono text-gray-400 uppercase">Cloud Persistence</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">Active</div>
            <span className="text-[11px] text-indigo-400 font-mono">Synced to GitHub DB</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("workshops")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "workshops"
                ? "bg-white text-black font-bold shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Workshops & Syllabus ({workshops.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "settings"
                ? "bg-white text-black font-bold shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Countdown & Site Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("registrations")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "registrations"
                ? "bg-white text-black font-bold shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Registrations ({registrations.length})</span>
          </button>
        </div>

        {/* TAB 1: WORKSHOPS LIST & CRUD */}
        {activeTab === "workshops" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Workshop Catalog</h2>
                <p className="text-xs text-gray-400">
                  Manage workshops, update syllabus topics, or configure Google Form registration links.
                </p>
              </div>

              <button
                onClick={handleCreateNewWorkshop}
                className="px-4 py-2.5 rounded-full text-xs font-bold text-black bg-white hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/10 hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Add New Workshop</span>
              </button>
            </div>

            {/* Workshops Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workshops.map((w) => (
                <div
                  key={w.id}
                  className="rounded-3xl p-6 bg-zinc-950/70 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                        {w.category}
                      </span>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold">
                        {w.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1.5">{w.title}</h3>
                    <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">{w.subtitle}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-300 p-3 rounded-xl bg-black/40 border border-white/5 mb-4">
                      <div>🗓️ {w.date}</div>
                      <div>⏱️ {w.duration}</div>
                      <div>🎟️ ₹{w.discountedPrice} (reg.)</div>
                      <div>👥 {w.seatsBooked || 0}/{w.totalSeats} seats</div>
                    </div>

                    {w.googleFormUrl && (
                      <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] font-mono text-cyan-300 mb-4 truncate">
                        Google Form: {w.googleFormUrl}
                      </div>
                    )}

                    <div className="text-xs text-gray-400 font-mono mb-4">
                      Syllabus: {w.curriculum?.length || 0} modules configured
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingWorkshop(w);
                        setIsNewWorkshop(false);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Edit & Syllabus</span>
                    </button>

                    <button
                      onClick={() => handleDeleteWorkshop(w.id, w.title)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: COUNTDOWN TIMER & SITE CMS */}
        {activeTab === "settings" && settings && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Workshop Countdown Timer & Settings</h2>
                <p className="text-xs text-gray-400">
                  Update the next workshop date & time, announcement bar, and headline copy.
                </p>
              </div>

              <button
                type="submit"
                disabled={syncing}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-black bg-white hover:bg-gray-100 transition-all shadow-md hover:scale-105 active:scale-95"
              >
                {syncing ? "Saving to Backend..." : "Save Settings to Live Site"}
              </button>
            </div>

            {/* Countdown Target Date Card */}
            <div className="p-6 rounded-3xl bg-zinc-950/70 border border-cyan-500/30 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Next Workshop Date & Time</h3>
              </div>
              <p className="text-xs text-gray-300">
                This exact ISO timestamp drives the countdown clock on the website. Enter the scheduled date and time of the next workshop.
              </p>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Target Timestamp (ISO 8601 with timezone)
                </label>
                <input
                  type="text"
                  required
                  value={settings.nextCohortDate}
                  onChange={(e) => setSettings({ ...settings, nextCohortDate: e.target.value })}
                  placeholder="2026-10-24T10:00:00+05:30"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-sm text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[11px] text-gray-500 font-mono mt-1 block">
                  Example: 2026-10-24T10:00:00+05:30 (Saturday, Oct 24, 2026 at 10:00 AM IST)
                </span>
              </div>
            </div>

            {/* Hero Copy */}
            <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-md space-y-4">
              <h3 className="text-base font-bold text-white">Hero Section Copy</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                    Announcement Pill Banner
                  </label>
                  <input
                    type="text"
                    value={settings.announcement}
                    onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                      Hero Headline
                    </label>
                    <input
                      type="text"
                      value={settings.heroHeadline}
                      onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                      Hero Highlight Keyword
                    </label>
                    <input
                      type="text"
                      value={settings.heroHighlight}
                      onChange={(e) => setSettings({ ...settings, heroHighlight: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-cyan-300 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                    Hero Subtitle
                  </label>
                  <textarea
                    rows={3}
                    value={settings.heroSubtitle}
                    onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white"
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* TAB 3: REGISTRATIONS */}
        {activeTab === "registrations" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Registered Students</h2>
                <p className="text-xs text-gray-400">
                  Participant registrations and Google Form attendee list.
                </p>
              </div>

              <button
                onClick={loadAllData}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Attendees</span>
              </button>
            </div>

            {registrations.length > 0 ? (
              <div className="rounded-3xl border border-white/10 overflow-hidden bg-zinc-950/70">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/5 border-b border-white/10 text-gray-400">
                    <tr>
                      <th className="p-4">Ticket</th>
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Workshop</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {registrations.map((r) => (
                      <tr key={r.id} className="hover:bg-white/[0.02]">
                        <td className="p-4 text-cyan-300 font-bold">{r.ticketCode}</td>
                        <td className="p-4 font-sans text-white font-semibold">{r.name}</td>
                        <td className="p-4">{r.email}</td>
                        <td className="p-4">{r.phone}</td>
                        <td className="p-4 truncate max-w-[200px]">{r.workshopTitle}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl glass-panel border border-white/10 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-3 text-gray-500" />
                <h3 className="text-base font-semibold text-white mb-1">No Direct Database Registrations Yet</h3>
                <p className="text-xs">
                  Registrations configured via Google Form are collected directly in your linked Google Sheet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* WORKSHOP EDIT / CREATE MODAL */}
        <AnimatePresence>
          {editingWorkshop && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl my-8 rounded-3xl p-6 sm:p-8 bg-zinc-950 border border-white/20 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {isNewWorkshop ? "Create New Workshop" : `Edit Workshop: ${editingWorkshop.title}`}
                    </h3>
                    <p className="text-xs text-gray-400">Changes will reflect live on the public site.</p>
                  </div>
                  <button
                    onClick={() => setEditingWorkshop(null)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveWorkshop} className="space-y-6">
                  {/* Basic Details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold">1. General Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Title</label>
                        <input
                          type="text"
                          required
                          value={editingWorkshop.title}
                          onChange={(e) => setEditingWorkshop({ ...editingWorkshop, title: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Category</label>
                        <input
                          type="text"
                          required
                          value={editingWorkshop.category}
                          onChange={(e) => setEditingWorkshop({ ...editingWorkshop, category: e.target.value })}
                          placeholder="Agritech, AI/ML, Patents, IoT"
                          className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Subtitle</label>
                      <textarea
                        rows={2}
                        value={editingWorkshop.subtitle}
                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, subtitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Date String</label>
                        <input
                          type="text"
                          required
                          value={editingWorkshop.date}
                          onChange={(e) => setEditingWorkshop({ ...editingWorkshop, date: e.target.value })}
                          placeholder="Saturday, Oct 24, 2026"
                          className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Time</label>
                        <input
                          type="text"
                          required
                          value={editingWorkshop.time}
                          onChange={(e) => setEditingWorkshop({ ...editingWorkshop, time: e.target.value })}
                          placeholder="10:00 AM - 1:00 PM IST"
                          className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Duration</label>
                        <input
                          type="text"
                          required
                          value={editingWorkshop.duration}
                          onChange={(e) => setEditingWorkshop({ ...editingWorkshop, duration: e.target.value })}
                          placeholder="3 Hours (Live Hands-on)"
                          className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Google Form Registration */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold">2. Registration & Seats</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Original Price (₹)</label>
                        <input
                          type="number"
                          value={editingWorkshop.originalPrice}
                          onChange={(e) => setEditingWorkshop({ ...editingWorkshop, originalPrice: Number(e.target.value) })}
                          className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Discount Price (₹)</label>
                        <input
                          type="number"
                          value={editingWorkshop.discountedPrice}
                          onChange={(e) => setEditingWorkshop({ ...editingWorkshop, discountedPrice: Number(e.target.value) })}
                          className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-emerald-400 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Total Capacity</label>
                        <input
                          type="number"
                          value={editingWorkshop.totalSeats}
                          onChange={(e) => setEditingWorkshop({ ...editingWorkshop, totalSeats: Number(e.target.value) })}
                          className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Seats Booked</label>
                        <input
                          type="number"
                          value={editingWorkshop.seatsBooked || 0}
                          onChange={(e) => setEditingWorkshop({ ...editingWorkshop, seatsBooked: Number(e.target.value) })}
                          className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-cyan-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-cyan-300 font-bold mb-1">
                        Official Google Form Registration URL
                      </label>
                      <input
                        type="url"
                        value={editingWorkshop.googleFormUrl || ""}
                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, googleFormUrl: e.target.value })}
                        placeholder="https://docs.google.com/forms/d/e/.../viewform"
                        className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-cyan-500/40 text-xs text-white font-mono focus:border-cyan-400"
                      />
                      <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                        Students on the public website clicking "Register via Google Form" will be routed to this link.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Google Meet Link</label>
                      <input
                        type="url"
                        value={editingWorkshop.googleMeetLink || ""}
                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, googleMeetLink: e.target.value })}
                        placeholder="https://meet.google.com/xyz-metaquest"
                        className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Curriculum Roadmap Builder */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold">
                          3. Animated Curriculum Roadmap Modules ({editingWorkshop.curriculum?.length || 0})
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={addCurriculumStep}
                        className="px-3 py-1 rounded-lg text-xs font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20"
                      >
                        + Add Step
                      </button>
                    </div>

                    <div className="space-y-3">
                      {editingWorkshop.curriculum?.map((mod, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono text-cyan-400 font-bold">
                              Step 0{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeCurriculumStep(idx)}
                              className="text-rose-400 hover:text-rose-300 text-xs font-mono"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-mono text-gray-400 mb-1">Step Title</label>
                              <input
                                type="text"
                                value={mod.title}
                                onChange={(e) => updateCurriculumStep(idx, "title", e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono text-gray-400 mb-1">Duration</label>
                              <input
                                type="text"
                                value={mod.duration}
                                onChange={(e) => updateCurriculumStep(idx, "duration", e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-gray-400 mb-1">
                              Topics (comma separated)
                            </label>
                            <input
                              type="text"
                              value={mod.topics?.join(", ")}
                              onChange={(e) =>
                                updateCurriculumStep(
                                  idx,
                                  "topics",
                                  e.target.value.split(",").map((s) => s.trim())
                                )
                              }
                              className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-white font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-gray-400 mb-1">Mentor Name</label>
                            <input
                              type="text"
                              value={mod.speaker || ""}
                              onChange={(e) => updateCurriculumStep(idx, "speaker", e.target.value)}
                              placeholder="Abhay / Anant / Anamika"
                              className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingWorkshop(null)}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={syncing}
                      className="px-6 py-2.5 rounded-full text-xs font-bold text-black bg-white hover:bg-gray-100 transition-all shadow-lg shadow-cyan-500/20"
                    >
                      {syncing ? "Saving..." : "Save & Sync Workshop"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
