# SIH26097 — Master 3-Minute Hero Demonstration Script

**Platform:** PM-AJAY Livelihood Intelligence Platform (LIP)  
**Target:** MoSJE Grants-in-Aid (GIA) Component for Scheduled Caste Communities  
**Role Context:** Team Leader / Principal Product Engineer presenting to SIH Grand Finale Jury

---

## 0. The Hook (0:00 - 0:25)
> "Good morning, respected judges. In India, over 90% of our vocational workforce acquire their skills informally in roadside workshops, home tailoring units, and agricultural fields. But when a rural youth from a Scheduled Caste community enters a government skilling portal, they are greeted by 50-field bureaucratic forms and job-role codes like *ASC/Q1411* that mean nothing to them.
>
> Today, we present **LIP: The Livelihood Intelligence Platform** — not a chatbot that spits course links, but a **closed-loop, voice-first operating system** that turns spoken trade experience into an accredited NSQF pathway, and aggregates those individual journeys into real district planning intelligence."

---

## Beat 1: Spoken Experience → Verified Skill Graph (0:25 - 1:00)
**Action:** Open `/demo` or `/interview`. Click **"Load Ramesh Mesram (Automotive Hero)"** or speak via live microphone in Marathi/Hindi:  
*“मी १०वी शिकलो आहे. वडिलांसोबत २-व्हीलर गॅरेजमध्ये काम करतो. इंजिन खोलणे, ब्रेक पॅड बदलणे, वायरिंग तपासणे करतो. १५ किमी पर्यंत जाऊ शकतो.”*

**What the Jury Sees:**
1. Real-time extraction preview with **Evidence Spans**:
   - Spoken Tasks: Engine dismantling, brake shoe replacement, wiring fault tracing.
   - Tools Detected: Spanners, multimeter, air compressor.
   - Education: Class 10 | Radius: 15 km | Wage preference: Hybrid (immediate income then workshop).
2. Switch to **Livelihood Passport (`/passport`)**:
   - Inferred Skills mapped to **NCO-2015 Code: 7231.0100 (Motorcycle Mechanic)**.
   - Distinct labels: *AI Inferred*, *Beneficiary Confirmed*, *Worker Verified*.

---

## Beat 2: NSQF Alignment, RPL & Hard Validity Filtering (1:00 - 1:40)
**Action:** Navigate to **Living Pathway (`/pathways`)**.

**What the Jury Sees:**
1. **Signature Living Pathway Node Graph:**
   - Spoken Experience → Verified Skills → Mapped Qualification: **ASC/Q1411 (Two-Wheeler Service Technician, NSQF Level 4)**.
2. **Recognition of Prior Learning (RPL) Evaluation:**
   - System flags: *75% Competency Evidenced*.
   - Exact NOS Gap Identified: *NOS ASC/N1413: Electrical & Electronic System Troubleshooting*.
   - Recommendation: Instead of a redundant 4-month beginner course, offers **RPL Assessment + 80-hour Bridge Skilling**.
3. **Hard Constraint & Validity Proof:**
   - Show that expired qualifications (e.g. `CON/Q0101-LEGACY`) are **strictly excluded** from recommendations.
   - Factor breakdown: Existing skill fit (42%), Mobility fit (24%), Local district demand (20%), Prerequisite readiness (14%).

---

## Beat 3: Live Judge-Controlled Constraint Variation (1:40 - 2:15)
> "Judges, any static demo can look pretty. Let’s change a material constraint live."

**Action:** On the `/demo` or `/pathways` screen, ask a judge to adjust the **Mobility Slider from 15 km to 25 km** or switch **Employment Preference to Self-Employment**.
- Watch the pathways dynamically recompute in milliseconds!
- At 25 km: **ASC/Q1412 (Electric Vehicle Service Lead, NSQF Level 5)** unlocks at PMKK Hingna.
- On Self-Employment: The **Micro-Enterprise Workshop Route** moves to #1 with startup capital bands (₹1.5L - ₹3.0L) and pre-screening for **NSFDC GIA Subsidy** & **MUDRA Shishu Loan**.

---

## Beat 4: Low-Tech Continuity & Closed-Loop Action (2:15 - 2:40)
**Action:** Show the **Interactive Telephone IVR Keypad** on `/demo`.
- Dial `1800-LIP-AJAY`, press `1` for Marathi, input digits `1` for Mechanic.
- Show **Missed-Call Callback** registration: Beneficiary without smartphone data gets a voice callback that syncs to their same case profile.
- Show **Dominant Next Action** on `/journey`: *Verify high-school marksheet & schedule RPL batch at PMKK Hingna*.

---

## Beat 5: Individual Journeys → District Planning Intelligence (2:40 - 3:00)
**Action:** Open District Admin Portal (`/admin`).
- Show the **Supply-Demand Gap Matrix**: 84 beneficiaries in Nagpur demanded automotive & EV servicing, but only 30 sanctioned seats exist at PMKK Hingna.
- Show the **Batch Planner Simulator**: Simulates adding a 30-seat evening batch for EV technicians with cost assumptions under PM-AJAY GIA norms.
- Conclude with the North Star:
  > *"We did not build another chatbot. We built the intelligence layer that empowers the beneficiary, unburdens the field worker, and gives the District Collector real evidence for livelihood investments under PM-AJAY."*
