# AGENTS.md

## Project

This repository contains an AI-powered Call Quality Assurance and Coaching platform.

The platform allows businesses to define required call structures, upload agent call recordings, transcribe the calls, and use AI to determine whether agents followed the required call process.

## Before Coding (MANDATORY)

1. **Invoke Superpowers First (STRICT RULE)**:
   - **NEVER write code, edit files, or make modifications without invoking the relevant Superpowers skill first.**
   - Follow the designated superpower workflow for every request:
     - **Starting any task/session**: `using-superpowers`
     - **New feature / creative work**: `brainstorming` ➔ `writing-plans` ➔ `subagent-driven-development` / `executing-plans`
     - **UI design, styling, polish, or layout fixes**: `impeccable`
     - **Bug fixes / errors / unexpected behavior**: `systematic-debugging` ➔ `test-driven-development`
     - **Before declaring work complete / committing**: `verification-before-completion`
2. **Read Documentation**:
   - `docs/PRODUCT.md`
   - `docs/MVP.md`
   - `docs/ARCHITECTURE.md`
   - `docs/DATABASE.md`
   - `docs/CALL_ANALYSIS.md`
   - `docs/UI_DESIGN.md`
3. **Inspect Codebase & Plan**:
   - Always inspect the existing code and obtain approval for implementation plans before coding.

## Development Rules

- **Superpowers First**: Always load and adhere to the relevant Superpowers skill before touching code or proposing solutions.
- Plan features before implementing them.
- Do not implement features outside the MVP unless explicitly requested.
- Prefer simple architecture over premature abstraction.
- Reuse existing components before creating new ones.
- Keep components small and focused.
- Use TypeScript with strict typing.
- Validate external input.
- Never expose API keys to the browser.
- Keep AI prompts server-side.
- Use environment variables for secrets.

## Workflow

For every task and feature:

1. **Invoke Superpowers Skill First**:
   - New feature/creative work: `brainstorming` -> `writing-plans` -> `subagent-driven-development` / `executing-plans`.
   - Bug/issue: `systematic-debugging` -> `test-driven-development`.
   - UI work/design polish: `impeccable`.
   - Verification before completion: `verification-before-completion`.
2. Read relevant documentation (`docs/`).
3. Inspect the existing codebase.
4. Create an implementation plan and obtain approval before coding.
5. Implement with Test-Driven Development (TDD) where applicable.
6. Run linting, type checks, and tests (`npm run lint`, `tsc --noEmit`, `npm run build`).
7. Review implementation against specification.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- OpenAI API
- Vercel