"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scale,
  LogOut,
  Loader2,
  ArrowLeft,
  FolderOpen,
  MapPin,
  Gavel,
  User,
  Save,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { loadMatters, saveMatter } from "@/lib/workspace-sync";
import type { Matter } from "@/lib/workspace-data";
import { EMPTY_MATTER } from "@/lib/workspace-data";

export default function MatterProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [name, setName] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [title, setTitle] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [court, setCourt] = useState("");
  const [judge, setJudge] = useState("");
  const [nextCourtDate, setNextCourtDate] = useState("");
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setJurisdiction(user.jurisdiction || "");
    (async () => {
      const list = await loadMatters();
      const active =
        list.find((m) => m.id === user.activeMatterId) ||
        list.find((m) => m.id !== "matter-empty") ||
        null;
      if (active) {
        setMatter(active);
        setTitle(active.title || "");
        setCaseNumber(active.caseNumber || "");
        setCourt(active.court || active.courtName || "");
        setJudge(active.judge || "");
        setNextCourtDate((active.nextCourtDate || "").slice(0, 10));
        setSummary(active.summary || "");
        if (active.jurisdiction) setJurisdiction(active.jurisdiction);
      } else {
        setMatter(null);
      }
      setReady(true);
    })();
  }, [user]);

  if (isLoading || !ready) {
    return (
      <div className="min-h-screen bg-[#0C0D10] flex items-center justify-center text-neutral-400">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      updateUser({ name: name.trim() || user.name, jurisdiction: jurisdiction.trim() });
      if (matter && matter.id !== "matter-empty") {
        const updated: Matter = {
          ...matter,
          title: title.trim() || matter.title,
          caseNumber: caseNumber.trim() || matter.caseNumber,
          court: court.trim(),
          courtName: court.trim(),
          judge: judge.trim(),
          jurisdiction: jurisdiction.trim() || matter.jurisdiction,
          nextCourtDate: nextCourtDate || "",
          summary: summary.trim(),
        };
        const saved = await saveMatter(updated);
        setMatter(saved);
        updateUser({ activeMatterId: saved.id });
      }
      setMsg("Saved.");
    } catch {
      setMsg("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#E1E2E5]">
      <header className="border-b border-[#222328] bg-[#0E0E10] px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-white text-xs">
          <ArrowLeft className="w-4 h-4" />
          Command Center
        </Link>
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#D4AF37]" />
          <span className="font-serif font-bold text-sm text-white">CHAIN OF COMMAND</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] mb-1">Profile</p>
          <h1 className="text-2xl font-serif font-semibold text-white">Matter Profile</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Your account and active matter. Nothing here is filed with a court.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Account */}
          <section className="bg-[#141519] border border-[#2A2B35] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <User className="w-4 h-4" />
              <h2 className="text-sm font-semibold text-white">Account</h2>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Display name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Email
              </label>
              <p className="text-sm text-neutral-300">{user.email}</p>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Jurisdiction
              </label>
              <input
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="e.g. Indiana / Marion County"
              />
            </div>
          </section>

          {/* Matter */}
          <section className="bg-[#141519] border border-[#2A2B35] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <FolderOpen className="w-4 h-4" />
              <h2 className="text-sm font-semibold text-white">Active matter</h2>
            </div>

            {!matter ? (
              <div className="text-sm text-neutral-400 space-y-3">
                <p>No matter open yet. Create one from onboarding or the Docket.</p>
                <Link
                  href="/docket"
                  className="inline-flex items-center gap-2 text-[#D4AF37] text-sm font-medium hover:underline"
                >
                  <Gavel className="w-4 h-4" /> Go to The Docket
                </Link>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                    Matter title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                      Case number
                    </label>
                    <input
                      value={caseNumber}
                      onChange={(e) => setCaseNumber(e.target.value)}
                      className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                      Next court date
                    </label>
                    <input
                      type="date"
                      value={nextCourtDate}
                      onChange={(e) => setNextCourtDate(e.target.value)}
                      className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                    Court
                  </label>
                  <input
                    value={court}
                    onChange={(e) => setCourt(e.target.value)}
                    className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                    Judge (optional)
                  </label>
                  <input
                    value={judge}
                    onChange={(e) => setJudge(e.target.value)}
                    className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                    placeholder="Leave blank if unknown"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={3}
                    className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] resize-y"
                    placeholder="Your own notes — not shared with any court"
                  />
                </div>
              </>
            )}
          </section>

          {msg && (
            <p className="text-xs text-emerald-400" role="status">
              {msg}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-[#D4AF37] text-neutral-950 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save Matter Profile"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="sm:w-auto px-4 py-2.5 rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-950/40 text-sm font-medium flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
