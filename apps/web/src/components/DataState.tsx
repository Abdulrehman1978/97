"use client";
import { Navbar } from "./Navbar";
export function DataState({ title, message, retry }: { title: string; message: string; retry?: () => void }) {
  return <div className="min-h-screen bg-[#fbfaf7]"><Navbar /><main className="max-w-3xl mx-auto p-6 sm:p-12"><section className="bg-white border border-slate-200 rounded-2xl p-8"><h1 className="text-2xl font-semibold text-slate-900">{title}</h1><p role={retry ? "alert" : "status"} className="mt-3 text-slate-600">{message}</p>{retry && <button className="mt-5 px-5 py-3 bg-[#0f4c81] text-white rounded-xl" onClick={retry}>Retry</button>}</section></main></div>;
}
