# Esquema de Base de Datos — Fermi Tests TFM

## Relaciones

```
users_online  1───N  responses_online
users_paper   1───N  responses_paper
responses_play_unique  (sin FK, respuestas sueltas)
logs_download          (sin FK, solo registro)
```

---

## 1. `logs_download`

| Columna      | Tipo                     | Restricciones          |
|--------------|--------------------------|------------------------|
| `id`         | UUID                     | PK, default random     |
| `created_at` | TIMESTAMP WITH TIME ZONE | default NOW()          |

| id                                   | created_at               |
|--------------------------------------|--------------------------|
| `a1b2c3d4-e5f6-7890-abcd-ef1234567890` | 2026-02-20 10:30:00+01 |
| `b2c3d4e5-f6a7-8901-bcde-f12345678901` | 2026-02-21 14:15:00+01 |

---

## 2. `users_online`

| Columna          | Tipo         | Restricciones                                              |
|------------------|--------------|------------------------------------------------------------|
| `id`             | UUID         | PK, default random                                         |
| `age`            | INTEGER      | NOT NULL, CHECK 4–120                                      |
| `sex`            | VARCHAR(20)  | nullable, IN (masculino, femenino, otro, prefiero_no_decir)|
| `pi_vs_e`        | VARCHAR(10)  | NOT NULL, IN (pi, e, no_se)                                |
| `which_tests_before` | VARCHAR(10) | NOT NULL, default ''                                      |
| `user_alias`     | VARCHAR(100) | nullable                                                   |
| `test_model`     | CHAR(1)      | NOT NULL, IN (A, B, C, D)                                  |
| `user_agent`     | TEXT         | nullable                                                   |
| `created_at`     | TIMESTAMPTZ  | default NOW()                                              |

| id       | age | sex       | pi_vs_e | which_tests_before | user_alias | test_model | user_agent          | created_at               |
|----------|-----|-----------|---------|---------------------|------------|------------|---------------------|--------------------------|
| `uuid-1` | 34  | masculino | pi      |                     | pepito23   | A          | Mozilla/5.0 ...     | 2026-02-20 10:30:00+01   |
| `uuid-2` | 27  | NULL      | no_se   | AC                  | NULL       | C          | Chrome/120 ...      | 2026-02-21 14:15:00+01   |

---

## 3. `responses_online`

| Columna      | Tipo       | Restricciones                          |
|--------------|------------|----------------------------------------|
| `id`         | UUID       | PK, default random                     |
| `user_id`    | UUID       | NOT NULL, FK → users_online(id) CASCADE|
| `test_model` | CHAR(1)    | NOT NULL, IN (A, B, C, D)              |
| `question_n` | INTEGER    | NOT NULL                               |
| `response`   | NUMERIC    | nullable                               |
| `time`       | INTEGER    | nullable (segundos usados)             |
| `created_at` | TIMESTAMPTZ| default NOW()                          |

UNIQUE(user_id, question_n)

| id       | user_id  | test_model | question_n | response     | time | created_at               |
|----------|----------|------------|------------|--------------|------|--------------------------|
| `uuid-r1`| `uuid-1` | A          | 1          | 50000        | 45   | 2026-02-20 10:31:00+01   |
| `uuid-r2`| `uuid-1` | A          | 2          | 1200000000   | 120  | 2026-02-20 10:34:00+01   |

---

## 4. `users_paper`

| Columna                       | Tipo         | Restricciones                                              |
|-------------------------------|--------------|------------------------------------------------------------|
| `id`                          | UUID         | PK, default random                                         |
| `age`                         | INTEGER      | NOT NULL, CHECK 4–120                                      |
| `sex`                         | VARCHAR(20)  | NOT NULL, IN (masculino, femenino, otro, prefiero_no_decir)|
| `time_of_day`                 | VARCHAR(20)  | nullable                                                   |
| `favorite_subject`            | VARCHAR(100) | nullable                                                   |
| `math_mark_last_period`       | NUMERIC      | nullable                                                   |
| `is_physics_chemistry_student`| BOOLEAN      | default FALSE                                              |
| `school_type`                 | VARCHAR(20)  | CHECK IN (publico, privado, concertado)                    |
| `mood`                        | VARCHAR(20)  | CHECK IN (mal, regular, bien, muy_bien)                    |
| `test_model`                  | CHAR(1)      | NOT NULL, IN (A, B, C, D)                                  |
| `created_at`                  | TIMESTAMPTZ  | default NOW()                                              |

| id       | age | sex       | time_of_day | favorite_subject | math_mark | fyq   | school_type | mood    | test_model | created_at             |
|----------|-----|-----------|-------------|------------------|-----------|-------|-------------|---------|------------|------------------------|
| `uuid-p1`| 15  | femenino  | mañana      | matematicas      | 7.5       | true  | publico     | bien    | B          | 2026-02-22 09:00:00+01 |
| `uuid-p2`| 14  | masculino | tarde       | historia         | 5.0       | false | concertado  | regular | D          | 2026-02-22 11:30:00+01 |

---

## 5. `responses_paper`

| Columna      | Tipo          | Restricciones                          |
|--------------|---------------|----------------------------------------|
| `id`         | UUID          | PK, default random                     |
| `user_id`    | UUID          | NOT NULL, FK → users_paper(id) CASCADE |
| `test_model` | CHAR(1)       | NOT NULL, IN (A, B, C, D)              |
| `question_n` | INTEGER       | NOT NULL                               |
| `base_a`     | NUMERIC(10,2) | NOT NULL                               |
| `exp_b`      | INTEGER       | NOT NULL                               |
| `created_at` | TIMESTAMPTZ   | default NOW()                          |

UNIQUE(user_id, question_n) — Formato: `base_a × 10^exp_b`

| id       | user_id  | test_model | question_n | base_a | exp_b | created_at               |
|----------|----------|------------|------------|--------|-------|--------------------------|
| `uuid-rp1`| `uuid-p1` | B        | 1          | 3.50   | 4     | 2026-02-22 09:05:00+01   |
| `uuid-rp2`| `uuid-p1` | B        | 2          | 1.20   | 9     | 2026-02-22 09:05:00+01   |

→ Ejemplo: `3.50 × 10^4 = 35 000` y `1.20 × 10^9 = 1 200 000 000`

---

## 6. `responses_play_unique`

| Columna            | Tipo        | Restricciones      |
|--------------------|-------------|--------------------|
| `id`               | UUID        | PK, default random |
| `id_play_question` | INTEGER     | NOT NULL           |
| `response`         | NUMERIC     | nullable           |
| `time`             | INTEGER     | nullable           |
| `created_at`       | TIMESTAMPTZ | default NOW()      |

| id       | id_play_question | response   | time | created_at               |
|----------|------------------|------------|------|--------------------------|
| `uuid-pl1`| 7              | 800000     | 60   | 2026-02-23 18:00:00+01   |
| `uuid-pl2`| 3              | 25000000   | 90   | 2026-02-23 18:05:00+01   |

---

## Vistas

### `view_responses_online`
JOIN de `responses_online` + `users_online` → añade age, sex, pi_vs_e, which_tests_before, user_alias.

### `view_responses_paper`
JOIN de `responses_paper` + `users_paper` → añade age, sex, time_of_day, favorite_subject, math_mark_last_period, is_physics_chemistry_student, school_type, mood + columna calculada `computed_value = base_a × 10^exp_b`.
