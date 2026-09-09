# Google Form Response Automation System

An educational automation testing platform designed for university demonstrations, software testing labs, and academic evaluation. Built using **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Playwright**.

> [!IMPORTANT]
> **Educational & Authorized Testing Only**:
> This system is designed exclusively for software engineering education and automated testing of Google Forms that the developer or tester personally owns or has explicit permission to test.
> - Uses **synthetic test data** only (strictly labeled as `[TEST DATA]`).
> - **Zero database**: Maintains in-memory operational state with zero data retention.
> - **No bypass mechanisms**: Does NOT bypass CAPTCHA, authentication, rate limits, IP blocks, or bot detection.

---

## Features

- **Modern University Dashboard**: Clean, minimal white-and-blue layout with responsive KPI metrics.
- **In-Memory State Management**: Next.js server-side state tracking active session stats (`running`, `total`, `completed`, `successful`, `failed`, `remaining`) with no database required.
- **Playwright Headless Automation**: Automated browser interactions filling text fields, radios, and submitting forms.
- **Real-Time Activity Log**: Live timestamped console displaying submission status (`✓`, `→`, `!`, `✗`).
- **Interactive Progress Bar**: Live percentage indicator and ASCII progress preview (`███████░░░ 70%`).
- **Synthetic Response Generator**: Predefined and randomized student survey data, strictly labeled with `[TEST DATA]`.
- **Built-in Local Mock Form (`/mock-form`)**: Instantly demonstrate the full automation loop locally on `localhost:3000/mock-form` without needing internet or an active Google Form!

---

## Project Structure

```
google-form-automation/
├── app/
│   ├── page.tsx                      # Main dashboard page
│   ├── layout.tsx                    # Root layout with university header & styling
│   ├── globals.css                   # Tailwind styles and custom scrollbars
│   ├── api/
│   │   └── automation/
│   │       └── route.ts              # In-memory Next.js API route (GET & POST)
│   ├── components/
│   │   ├── Dashboard.tsx             # Main interactive dashboard container
│   │   ├── Statistics.tsx            # KPI cards and animated progress bar
│   │   └── ActivityLog.tsx           # Real-time console activity log
│   ├── lib/
│   │   ├── automation.ts             # In-memory state and runner coordinator
│   │   └── responseGenerator.ts      # Synthetic data generator labeled [TEST DATA]
│   └── mock-form/
│       └── page.tsx                  # Built-in local mock form mimicking Google Forms
├── playwright/
│   └── formAutomation.ts             # Playwright browser script for form submission
├── .env.local                        # Local configuration
├── .env.example                      # Configuration template
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## Installation & Setup

### 1. Prerequisites
- **Node.js** 18.x, 20.x, or higher
- **npm** 9.x or higher

### 2. Setup Commands
Run the following exact terminal commands:

```bash
# Clone or navigate into the project directory
cd google-form-automation

# Install dependencies (Next.js, Playwright, Tailwind, Lucide)
npm install

# Install Playwright browser binaries (Chromium)
npx playwright install chromium

# Start local development server
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## Configuration (`.env.local`)

Create or update `.env.local` in the root directory:

```env
# URL of your test Google Form (must be the public viewform link)
GOOGLE_FORM_URL=https://docs.google.com/forms/d/e/1FAIpQLScExampleFormIdHere/viewform

# Optional: Set to 'false' if you want to watch the browser fill out fields live on your desktop!
HEADLESS=true

# Optional: Delay in milliseconds between consecutive responses (default: 1500)
RESPONSE_DELAY_MS=1500
```

---

## How to Configure Your Test Google Form

To test your own Google Form:

1. **Create a Test Google Form**:
   - Go to [Google Forms](https://forms.google.com/) and click **Blank form**.
   - Title: `Student Feedback Survey (Testing)`.
2. **Add Sample Fields**:
   - Question 1: `Student Name` (Short answer).
   - Question 2: `Course Name` (Short answer).
   - Question 3: `Email Address` (Short answer, optional).
   - Question 4: `Satisfaction Level` (Multiple choice: "Very Satisfied", "Satisfied", "Neutral").
   - Question 5: `Comments / Feedback` (Paragraph, optional).
3. **Form Settings**:
   - Click **Settings** at the top.
   - Under **Responses**, ensure **"Limit to 1 response" is OFF** (so multiple test responses can be submitted).
   - Ensure **"Collect email addresses" is OFF** or set to not require Google login.
4. **Copy the Public URL**:
   - Click the **Send** button (top right).
   - Select the link icon `🔗` and copy the URL (it should end in `/viewform`).
5. **Run the Automation**:
   - Paste the copied URL into the Dashboard input.
   - Set the number of test responses (e.g. `5` or `10`).
   - Click **Start Automation**.

---

## Instant Local Demonstration (Built-in Mock Form)

If you do not have an active Google Form or wish to demonstrate the system offline:

1. Click the **"Use Local Mock Form"** button in the dashboard (or enter `http://localhost:3000/mock-form`).
2. Set response count to `3`.
3. Click **Start Automation**.
4. The system will launch Playwright, fill the synthetic student responses into the mock form, submit, verify confirmation, and update the statistics and activity log in real time!

---

## Educational Architecture & Compliance

- **No Persistent Database**: In compliance with testing best practices, responses are not stored in any external database (MongoDB, Firebase, or SQL).
- **Graceful Control**: Students can click **Stop Automation** at any time to cleanly halt the batch loop.
- **Strict Compliance**: The system does not attempt to bypass CAPTCHA, firewalls, or bot mitigation algorithms. If an unauthorized form presents a CAPTCHA or requires login, testing will fail cleanly as intended by design.
