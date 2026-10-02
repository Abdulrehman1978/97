"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, PauseCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface ReadAloudProps {
  text: string;
  lang?: string; // "mr-IN", "hi-IN", "en-IN"
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function ReadAloudButton({ text, lang, className = "", label, size = "md" }: ReadAloudProps) {
  const { locale } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const effectiveLang = lang || (locale === "mr" ? "mr-IN" : locale === "hi" ? "hi-IN" : "en-IN");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSupported("speechSynthesis" in window);
    }
  }, []);

  useEffect(() => {
    // Cleanup any active utterance if component unmounts
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeak = () => {
    if (!isSupported) {
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/<[^>]*>?/gm, "").trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = effectiveLang;
    utterance.rate = 0.9; // deliberate pace for clear field comprehension

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  if (!isSupported) {
    return null;
  }

  const defaultLabel = isPlaying
    ? locale === "mr"
      ? "थांबवा"
      : locale === "hi"
      ? "रोकें"
      : "Stop"
    : locale === "mr"
    ? "ऐका / Listen"
    : locale === "hi"
    ? "सुनें / Listen"
    : "Listen";

  return (
    <button
      onClick={toggleSpeak}
      type="button"
      className={`min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high/90 text-primary font-label-sm text-label-sm active:bg-surface-container-highest transition-colors backdrop-blur-xs ${
        isPlaying ? "ring-2 ring-secondary text-secondary" : ""
      } ${className}`}
      title={isPlaying ? "Stop Audio" : "Listen (Read Aloud)"}
      aria-label={isPlaying ? "Stop speech" : "Read aloud instructions"}
      aria-pressed={isPlaying}
    >
      {isPlaying ? (
        <PauseCircle className="w-4 h-4 text-secondary animate-pulse" />
      ) : (
        <Volume2 className="w-4 h-4 text-secondary" />
      )}
      <span>{label || defaultLabel}</span>
    </button>
  );
}
