# MVP Scope

## Goal

Build the smallest usable version of CallCoach AI.

The MVP should allow a manager to upload a sales call and determine whether the agent followed the required call structure.

## MVP Features

### 1. Authentication

Users can:

- Sign up
- Log in
- Log out

Use Supabase Auth.

---

### 2. Dashboard

Show:

- Total calls analyzed
- Average call score
- Total agents
- Recent calls

Keep analytics simple.

---

### 3. Agent Management

Users can:

- Create an agent
- Edit an agent
- View agents
- Deactivate an agent

---

### 4. Call Frameworks

Managers can create reusable call frameworks.

Example:

Cold Calling Framework

Stages:

1. Opening
2. Discovery
3. Qualification
4. Pitch
5. Objection Handling
6. Closing

Each stage contains requirements.

Example:

Opening requirements:

- Introduce yourself
- Mention company
- Explain reason for calling
- Ask permission to continue

---

### 5. Call Upload

Manager selects:

- Agent
- Call framework
- Audio recording

Supported formats initially:

- MP3
- WAV
- M4A

---

### 6. Transcription

Use the OpenAI API to transcribe uploaded calls.

Store the transcript in the database.

---

### 7. AI Call Analysis

Analyze:

Transcript

+

Selected Call Framework

The AI determines whether each requirement was:

- PASS
- PARTIAL
- FAIL
- NOT_APPLICABLE

---

### 8. Call Score

Generate an overall score between:

0–100

Also generate stage scores.

---

### 9. Evidence

Whenever possible, analysis results should contain transcript evidence.

Example:

Requirement:

Ask about timeline

Result:

PASS

Evidence:

"When are you hoping to get this started?"

---

### 10. Coaching Feedback

Generate:

- strengths
- weaknesses
- missed steps
- recommended improvement

---

### 11. Call Report

Show:

- agent
- date
- overall score
- stage scores
- requirements
- evidence
- transcript
- coaching recommendations

---

# NOT Included In MVP

Do not build these yet:

- subscriptions
- Stripe
- live phone calls
- Twilio integration
- GoHighLevel integration
- CRM integrations
- real-time transcription
- mobile application
- advanced team permissions
- agent login
- automatic call importing
- sentiment analytics
- leaderboards
- advanced reporting
- white labeling