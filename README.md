# Student Wellness Management System (SWMS)

> **NMIMS Shirpur** • Department of Computer Engineering • AY 2025–2026  
> **Course:** Design Experience  
> **Team:** Pranali More (B204), Saloni Patil (B235)  
> **Supervisor:** Dr. Naziya Huzzain  
> **Version:** 1.0 (October 2026)

---

## 🌟 Overview

The **Student Wellness Management System (SWMS)** is a web-based wellness platform designed for university campuses. It brings together self-guided wellness habit logging, standardized clinical screenings (PHQ & GAD), predictive burnout risk estimation with plain-language explanations, appointment booking with simulated notification reminders, and privacy-preserving administrative analytics.

> **Ethical Notice:** *SWMS supports and screens. It does not diagnose or replace professional care.*

---

## 🚀 Key Modules & Capabilities

1. **Role-Based Portals (Screens S1 to S15)**:
   - **Student Portal**:
     - **S1 / S2**: Authentication with Privacy-by-Design dual consent toggles (default **OFF**).
     - **S3**: Interactive Dashboard with 0–100 composite wellness score, AVATAR-style wellness bands (*Flourishing*, *Balanced*, *Needs Care*), insight cards, and alert banners.
     - **S4**: Daily check-in (<3 mins) covering 5 domains: Mood (faces), Sleep (0–14h slider), Physical Activity (0–240m), Nutrition (KIDMED index), and Academic Stress (1–5 scale).
     - **S5**: Weekly standardized screening (PHQ-2 & GAD-2) with dynamic branching to PHQ-9 & GAD-7 on score $\ge 3$. Includes immediate self-harm safety intervention (item 9 > 0).
     - **S6 & S7**: Appointment booking with General Physician (GP) and Campus Counsellor, real-time slot locking, and simulated on-screen Email Previews with reschedule and cancellation support.
     - **S8**: Burnout risk assessment with Low/Moderate/High status and top 3 plain-language SHAP-style contributing factors.
     - **S9**: Privacy settings with consent toggles, JSON data archive export, and permanent data deletion.
   - **Provider Portal**:
     - **S10**: Daily consultation schedule and active Tier 3 priority alerts list.
     - **S11**: Weekly availability manager to add/remove 30-minute consultation slots (10:00–16:00).
     - **S12**: Consented student summaries (blocked if unconsented: *"This student has not shared their data"*), 30-day multi-domain trend charts, and private encrypted clinical consultation notes.
   - **Admin Portal**:
     - **S13**: Anonymised cohort analytics enforcing **$k \ge 5$ k-anonymity** privacy suppression (cohorts under 5 are masked).
     - **S14**: User role management and a 48-Hour Tier 3 Escalation Queue with an interactive **"Fast-Forward 48 Hours"** demo simulation button.
   - **Universal Emergency & Helplines (S15)**:
     - Tele-MANAS (14416 / 1800 891 4416), NMIMS Health Centre desk (+91 02563 286545), Vandrevala Foundation (+91 9999 666 555), and National Emergency Services (112 / 108).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Data Visualization**: Chart.js, react-chartjs-2
- **State Management**: Reactive in-memory and persistent `localStorage` storage service with initial seed data and full demo reset capabilities.

---

## 👥 Demo Personas

| Role | Demo Email | Persona Context | Demo Function |
|---|---|---|---|
| **Student A** | `student.a@demo.edu` | Healthy for 3 weeks, last 3 days low mood | Demonstrates Tier 2 alert banner and booking nudge |
| **Student B** | `student.b@demo.edu` | Stable sleep & activity, consented to share | Demonstrates green dashboard and consented provider summary |
| **Student C** | `student.c@demo.edu` | Poor sleep, high stress, PHQ-9 = 14, unbooked 48h+ | Demonstrates High Burnout Risk, Tier 3 alert, and 48h admin escalation |
| **Provider (GP)** | `gp@demo.edu` | Dr. Ramesh Kulkarni, MD | Manages medical consultations and private clinical notes |
| **Provider (Counsellor)** | `counsellor@demo.edu` | Dr. Ananya Sen, PhD | Manages psychological consultations and support notes |
| **Admin** | `admin@demo.edu` | Dr. Naziya Huzzain (Admin) | Anonymised cohort statistics and 48h escalation trigger |

*All demo accounts use password: `demo123` or one-click demo login buttons in the header / sign-in screen.*

---

## 💻 Local Setup & Development

```bash
# Clone the repository
git clone https://github.com/nexora1412/<repo-name>.git

# Navigate into project directory
cd swms-app

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build for production
npm run build
```

---

## 📄 License & Authors

Project developed for the **Design Experience** course at **NMIMS, Shirpur** by **Pranali More** and **Saloni Patil**, under the supervision of **Dr. Naziya Huzzain**.
