"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, LogOut, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0C0D10] flex items-center justify-center text-neutral-400">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const created = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

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

      <main className="max-w-lg mx-auto p-6">
        <h1 className="text-xl font-serif font-semibold text-white mb-1">Profile</h1>
        <p className="text-xs text-neutral-500 mb-6">Signed-in litigant account (session data).</p>

        <div className="bg-[#141519] border border-[#2A2B35] rounded-xl p-5 space-y-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Name</p>
            <p className="text-sm text-white font-medium mt-0.5">{user.name}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Email</p>
            <p className="text-sm text-white font-medium mt-0.5">{user.email}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Role</p>
            <p className="text-sm text-[#D4AF37] font-mono mt-0.5">{user.role}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Jurisdiction</p>
            <p className="text-sm text-neutral-200 mt-0.5">{user.jurisdiction}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Account created</p>
            <p className="text-sm text-neutral-200 mt-0.5">{created}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">User id</p>
            <p className="text-xs text-neutral-400 font-mono mt-0.5 break-all">{user.id}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full mt-2 py-2.5 rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-950/40 text-sm font-medium flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </main>
    </div>
  );
}
