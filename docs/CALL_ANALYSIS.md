# Call Analysis System

## Objective

Determine whether an agent followed the required call framework.

The AI must not simply give an opinion.

Every conclusion should be supported by transcript evidence when possible.

---

# Call Framework

Businesses create a framework containing multiple stages.

Example:

## Stage 1: Opening

Requirements:

- Agent introduces themselves.
- Agent mentions the company.
- Agent explains the reason for calling.
- Agent asks permission to continue.

Weight: 10%

## Stage 2: Discovery

Requirements:

- Agent asks about the prospect's current situation.
- Agent identifies at least one pain point.
- Agent asks follow-up questions.

Weight: 25%

## Stage 3: Qualification

Requirements:

- Ask about timeline.
- Ask about budget.
- Determine decision-making authority.

Weight: 20%

## Stage 4: Offer

Requirements:

- Explain the solution.
- Connect the solution to the prospect's pain point.

Weight: 15%

## Stage 5: Objection Handling

Requirements:

- Identify the objection.
- Respond to the objection.
- Attempt to continue the conversation.

Weight: 15%

## Stage 6: Close

Requirements:

- Ask for the next step.
- Confirm appointment/date/action.

Weight: 15%

---

# Analysis Output

The AI should return structured data.

Example:

{
  "overall_score": 82,
  "stages": [],
  "strengths": [],
  "improvements": [],
  "summary": ""
}

Each requirement should include:

- status
- score
- transcript evidence
- timestamp
- explanation

Possible statuses:

PASS
PARTIAL
FAIL
NOT_APPLICABLE

The system should distinguish between:

Required behavior

and

Optional coaching suggestions.

Missing evidence should not automatically be treated as proof that something happened.