"use client";

import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface ReadAloudProps {
  text: string;
  lang?: string; // "mr-IN", "hi-IN", "en-IN"
  className?: string;
}

export function ReadAloudButton({ text, lang = "mr-IN", className = "" }: ReadAloudProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Clear any queued utterances
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for low-literacy comprehension

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <button
      onClick={toggleSpeak}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 transition-colors touch-target ${className}`}
      title={isPlaying ? "Stop Audio" : "Listen (Read Aloud)"}
      aria-label={isPlaying ? "Stop speech" : "Read aloud"}
    >
      {isPlaying ? <VolumeX className="w-3.5 h-3.5 text-red-600 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5 text-sky-700" />}
      <span>{isPlaying ? "थांबवा (Stop)" : "ऐका (Listen)"}</span>
    </button>
  );
}
