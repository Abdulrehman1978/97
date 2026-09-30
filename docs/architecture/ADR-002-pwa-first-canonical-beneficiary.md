# ADR-002: PWA-First Canonical Beneficiary Experience

## Status
Accepted

## Context
Developing separate native Android (Kotlin / React Native) and web client codebases leads to fragmented domain logic, duplicated localization, and divergence in accessibility standards. Beneficiaries frequently have low-storage devices (16GB–32GB) where downloading a 60MB APK is avoided, while web browsers are universally accessible.

## Decision
We build **one canonical Progressive Web Application (PWA)** in Next.js:
- Features an offline service worker and indexed local caching for resilient low-connectivity operation.
- Delivers the 5 core beneficiary concepts: **Talk**, **My Skills**, **My Paths**, **My Journey**, **Help**.
- Responsive and touch-optimized with 48px+ touch targets, high contrast, and voice-assisted read-aloud.
- Can be packaged into a lightweight Android Trusted Web Activity (TWA) or Capacitor APK without codebase duplication.

## Consequences
- Single codebase to audit for GIGW 3.0 and WCAG 2.1/2.2 AA accessibility.
- Zero-friction distribution via web link, QR code at Common Service Centres (CSCs), or PWA install.
- Works uniformly across Android smartphones, kiosk tablets, and desktop workstations.
