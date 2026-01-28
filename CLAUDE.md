# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fermi Tests TFM** - A Vue 3 web application for conducting Fermi estimation problem studies as part of a master's thesis research on numerical estimation abilities in secondary students and adults.

The application serves two main user groups:
1. **Teachers**: Register, download printable test PDFs (models A/B/C/D), receive group codes for student tracking
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
python generate_test_pdf.py A              # Generate single test model (A, B, C, or D)
python generate_full_pdf.py                # Generate complete 10-page PDF with all models
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ADMIN_PASSWORD=admin_password
```

## Architecture

### Frontend Stack
- **Vue 3** (Composition API) with Vite
- **Vue Router** for navigation (5 main routes)
- **Tailwind CSS 4** for styling
- **Supabase JS Client** for direct database access (no backend API layer)

### Data Flow Architecture

**Questions System**: Questions are loaded from `/public/questions.xlsx` at runtime using `xlsx` library. The Excel file has two sheets:
- `questions`: All questions with category, level, and text
- `tests`: Maps which questions belong to each test model (A/B/C/D)

The `src/lib/questions.js` module caches the parsed Excel data and provides functions:
- `getAllQuestions()` - Returns all available questions
- `getTestQuestions(testId)` - Returns questions for specific test model
- `getRandomQuestion()` - Returns random question

**Database Structure** (Supabase tables):
- `profesores` - Teacher registrations with auto-generated 6-character group codes
- `log_descargas` - PDF download tracking
- `respuestas_online` - Online test responses (adults) stored as JSONB with format `{p1: value, p2: value, ...}`
- `respuestas_papel` - Manual paper test entry (admin) using scientific notation (base_a × 10^exp_b)
- `preguntas` - Question bank (currently contains example data, populated via SQL)

**Response Format**: Online responses store answers and timing data as JSONB:
```javascript
respuestas: { p1: 5200000, p2: 340, ... }  // Raw numeric values
tiempos: { p1: 45, p2: 120, ... }          // Time in seconds per question
```

### Key Routes & Views

- `/` (HomeView) - Landing page with two buttons: teacher or adult participant
- `/profe` (ProfeView) - Teacher registration form, generates group code, provides PDF downloads
- `/test` (TestView) - Main test interface with 180s timer per question, sequential question flow
- `/random` (RandomView) - Single random question tester
- `/admin` (AdminView) - Manual paper test entry with data grid, CSV export functionality

### Composables (Shared Logic)

- `useTimer.js` - Countdown timer logic for test questions (180 seconds per question)
- `useNumberFormat.js` - Formats large numbers with thousand separators for display

### Supabase Integration

All database operations go through helper functions in `src/lib/supabase.js`:
- `registrarProfesor()` - Creates teacher record, auto-generates unique group code
- `registrarDescarga()` - Logs PDF download events
- `guardarRespuestasOnline()` - Saves complete test submission (metadata + answers + timing)
- `guardarRespuestasPapel()` - Upserts paper test answers in scientific notation format
- `obtenerGrupos()` - Fetches teacher/group list for admin selector
- `exportarTabla()` - Exports table data for CSV generation

Row Level Security (RLS) is enabled with public INSERT policies for anonymous users and authenticated-only policies for admin operations.

### PDF Generation Utilities

Python scripts in `utils/pdf_generator/` use ReportLab to generate printable test PDFs:
- Reads questions from Excel files in `utils/pdf_generator/data/`
- `generate_test_pdf.py` - Single test model generation
- `generate_full_pdf.py` - Complete booklet (instructions + all 4 models, 10 pages for double-sided printing)
- `pdf_params.py` - Shared layout parameters and constants

## Component Organization

```
src/components/
├── admin/      - Data grid, CSV export, group selector for manual paper test entry
├── adultos/    - Test metadata form, question cards, timer display for online test flow
├── common/     - Shared buttons, inputs, cards, loading states
├── layout/     - Header, footer, page containers
└── profe/      - Teacher registration form, download buttons, group code display
```

## Important Implementation Notes

- **Timer Behavior**: Each question has 180-second countdown. Timer color changes to warning state at low time remaining.
- **Test Models**: Four parallel test models (A, B, C, D) with different questions but equivalent difficulty distribution.
- **Group Code Generation**: 6-character alphanumeric codes auto-generated via Supabase function (excludes ambiguous characters: I, O, 1, 0).
- **Admin Entry Format**: Paper tests entered as scientific notation (base × 10^exponent) to handle wide range of Fermi estimates.
- **No Backend API**: Application uses Supabase client-side SDK directly with RLS for security.

## Node Version

Requires Node.js `^20.19.0 || >=22.12.0` as specified in package.json engines.

## Key Files Reference

- `src/lib/supabase.js` - All database operations, central integration point
- `src/lib/questions.js` - Excel-based question loading and caching
- `src/router/index.js` - Route definitions
- `supabase/schema.sql` - Complete database schema with RLS policies and seed data
- `public/questions.xlsx` - Question bank source (two sheets: questions + tests)
- `utils/pdf_generator/` - Python PDF generation tools for printable tests
