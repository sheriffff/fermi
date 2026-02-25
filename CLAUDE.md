# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fermi Tests TFM** - A Vue 3 web application for conducting Fermi estimation problem studies as part of a master's thesis research on numerical estimation abilities in secondary students and adults. Deployed at https://fermi.gosheriff.es

The application serves two main user groups:
1. **Teachers**: Download printable test PDFs (models A/B/C/D) from `/profe`
2. **Adults**: Take online tests with timed questions, submit responses directly to database

## Commands

### Development
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### PDF Generation (Python utilities)
```bash
cd utils/pdf_generator
python build_test_pdf.py A              # Generate single test model (A, B, C, or D)
python build_full_pdf.py                # Generate complete PDF with all models
```

## Environment Setup
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_LOG_TO_DDBB=true          # set to 'false' to skip all DB writes in dev
VITE_WIP=false                 # true in prod to show WIP banner
```

## Architecture

### Frontend Stack
- **Vue 3** (Composition API) with Vite
- **Vue Router** for navigation (5 main routes)
- **Tailwind CSS 4** for styling
- **Supabase JS Client** for direct database access (no backend API layer)

### Data Flow Architecture

**Questions System**: Questions are loaded from `/public/questions.xlsx` at runtime using `read-excel-file` library. The Excel file has four sheets:
- `categories`: Reference list of category names
- `questions`: All questions with columns `category, level, id, question`
- `tests`: Maps test models to questions with columns `test, id_question` (FK → questions.id)
- `other_questions`: Extra questions for the /random play mode with columns `id_question, question`

The `src/lib/questions.js` module caches the parsed Excel data and provides functions:
- `getAllQuestions()` - Returns all available questions
- `getTestQuestions(testId)` - Returns questions for specific test model
- `getRandomQuestion()` - Returns random question

**Database Structure** (Supabase tables):
- `logs_download` - PDF download tracking (id, created_at)
- `users_online` - Online test participants (age, sex, pi_vs_e, which_tests_before, user_alias, test_model)
- `responses_online` - Tidy: one row per question per online user (user_id FK → users_online, test_model, question_n, response, time)
- `users_paper` - Paper test students entered by admin (age, sex, time_of_day, favorite_subject, math_mark_last_period, is_physics_chemistry_student, school_type, mood, test_model)
- `responses_paper` - Tidy: one row per question per paper student (user_id FK → users_paper, test_model, question_n, base_a, exp_b)

**Response Format**: Online flow inserts one `users_online` row, then N `responses_online` rows. Paper flow inserts one `users_paper` row per student, then N `responses_paper` rows.

### Key Routes & Views

- `/` (HomeView) - Landing page with two buttons: teacher or adult participant
- `/profe` (ProfeView) - PDF download page for teachers (no registration)
- `/test` (TestView) - Main test interface with 150s timer per question, sequential question flow
- `/random` (RandomView) - Single random question tester
- `/admin` (AdminView) - Manual paper test entry with data grid, CSV export functionality

### Composables (Shared Logic)

- `useTimer.js` - Countdown timer logic for test questions (180 seconds per question)
- `useNumberFormat.js` - Formats large numbers with thousand separators for display

### Supabase Integration

All database operations go through helper functions in `src/lib/supabase.js`:
- `logDownload()` - Logs PDF download events
- `createUserOnline()` - Creates online user record, returns id
- `saveResponsesOnline()` - Inserts per-question response rows for an online user
- `createUserPaper()` - Creates paper student record, returns id
- `saveResponsesPaper()` - Inserts per-question paper responses for a student
- `savePlayResponse()` - Saves a single play response from /random
- `exportTable()` - Exports table data for CSV generation

Row Level Security (RLS) is enabled. All policies use the `anon` role (no Supabase Auth). Admin authentication is client-side only (SHA-256 hash). The `VITE_LOG_TO_DDBB` env var controls whether DB writes are executed (set to `'false'` to disable in dev).

### PDF Generation Utilities

Python scripts in `utils/pdf_generator/` use ReportLab to generate printable test PDFs:
- Reads questions from Excel files in `utils/pdf_generator/data/`
- `build_test_pdf.py` - Single test model generation
- `build_full_pdf.py` - Complete booklet (instructions + all 4 models for double-sided printing)
- `pdf_params.py` - Shared layout parameters and constants

## Component Organization

```
src/components/
├── admin/      - Data grid, CSV export, group selector for manual paper test entry
├── adultos/    - Test metadata form, question cards, timer display for online test flow
├── common/     - Shared buttons, inputs, cards, loading states
├── layout/     - Header, footer, page containers
└── profe/      - PDF download buttons
```

## Important Implementation Notes

- **Timer Behavior**: Each question has 150-second countdown. Timer color changes to warning state at 30s remaining.
- **Test Models**: Four parallel test models (A, B, C, D) with different questions but equivalent difficulty distribution.
- **Admin Entry Format**: Paper tests entered as scientific notation (base × 10^exponent) to handle wide range of Fermi estimates.
- **No Backend API**: Application uses Supabase client-side SDK directly with RLS for security.
- **Admin Easter Egg**: Triple-click "por" in the footer of HomeView to navigate to `/admin`. There is no visible admin button.

## Node Version

Requires Node.js `24.x` as specified in package.json engines.

## Key Files Reference

- `src/lib/supabase.js` - All database operations, central integration point
- `src/lib/questions.js` - Excel-based question loading and caching
- `src/router/index.js` - Route definitions
- `supabase/schema.sql` - Complete database schema with RLS policies and seed data
- `public/questions.xlsx` - Question bank source (four sheets: categories, questions, tests, other_questions)
- `utils/pdf_generator/` - Python PDF generation tools for printable tests
