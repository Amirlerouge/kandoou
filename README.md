# Patreon Clone Database Schema & System Architecture

A production-ready, security-hardened PostgreSQL database schema and query system designed for a full-featured creator subscription platform (Patreon Clone).

---

## Workspace Directory Overview

This repository root contains all core project artifacts:

| File | Description |
| :--- | :--- |
| **`schema.sql`** | Complete DDL script defining database extensions, custom ENUMs, 23 relational tables, automated timestamp triggers, security audit triggers, Row Level Security (RLS) policies, indexes, and analytical views. |
| **`seed.sql`** | Realistic sample dataset featuring platform admins, creators, patrons, campaigns, membership tiers, subscriptions, posts, comments, likes, payments, and payouts. |
| **`queries.sql`** | Core business logic SQL queries for creator MRR analytics, tier-gated patron content feed, campaign goal tracking, threaded comments with likes, and creator payout balance calculations. |
| **`patreon_clone_dump.sql`** | Full PostgreSQL database dump generated via `pg_dump`, containing both schema structure and seed data for immediate database setup or restoration. |
| **`patreon_clone_db.zip`** | Zip bundle containing all files (`schema.sql`, `seed.sql`, `queries.sql`, `patreon_clone_dump.sql`, `verify.py`, `README.md`) for distribution. |
| **`verify.py`** | Automated Python verification script validating schema integrity, trigger executions, RLS access policies, and query correctness against PostgreSQL. |
| **`README.md`** | Comprehensive documentation covering schema architecture, setup, security design, feature queries, and verification. |

---

## Database Architecture & Design Highlights

### 1. Hardened Core Entities
- **UUID Primary Keys**: Prevents sequential enumeration attacks across `users`, `campaigns`, `tiers`, `posts`, `subscriptions`, and financial transactions.
- **Strict RegEx Constraints**: Ensures email format (`CHECK email ~* ...`) and URL-safe slugs for campaigns and users.
- **Cents-Based Financial Columns**: Amounts (`amount_cents`, `fee_cents`, `net_cents`) are stored as `BIGINT` to eliminate floating-point rounding errors. Mathematical integrity is enforced via `CHECK (net_cents + fee_cents = amount_cents)`.

### 2. Security & Compliance
- **Row Level Security (RLS)**: Enforced on direct messages (`messages`), notifications (`notifications`), payments (`payments`), payouts (`payouts`), and subscriptions (`subscriptions`). Restricts data access based on `app.current_user_id`.
- **Security Audit Logging**: Triggers automatically record sensitive parameter changes (`users.role`, `password_hash`, `email`, financial changes in `payments` and `payouts`) into an immutable `audit_logs` table.

### 3. Automated Business Logic
- **`update_tier_patron_count()`**: Automatically updates `tiers.patron_count` when subscriptions are inserted, updated (status changes/tier switches), or deleted.
- **`update_poll_option_vote_count()`**: Dynamically updates option vote tallies upon poll vote registration or deletion.
- **`update_updated_at_column()`**: Standardized trigger updating `updated_at` timestamps on table updates.

### 4. High-Performance Indexing & Views
- **Trigram Indexes (`pg_trgm`)**: Fast fuzzy search across `campaigns.title` and `posts.title`.
- **Analytical Views**: `campaign_analytics` aggregates active patron counts, Monthly Recurring Revenue (MRR), total net revenue, and post statistics. `patron_feed_view` computes patron content access rights based on public, patron-only, or tier-specific rules.

---

## Quickstart & Setup Guide

### Prerequisites
- PostgreSQL 14+
- Python 3.8+

### Setup Local Database
```bash
# 1. Create PostgreSQL Database
psql -U postgres -c "CREATE DATABASE patreon_clone;"

# 2. Restore Database from Dump
psql -U postgres -d patreon_clone -f patreon_clone_dump.sql

# OR manually execute schema and seed scripts:
# psql -U postgres -d patreon_clone -f schema.sql
# psql -U postgres -d patreon_clone -f seed.sql
```

### Running Feature Queries
```bash
psql -U postgres -d patreon_clone -f queries.sql
```

### Automated Verification
```bash
python3 verify.py
```

---

## Key Query Capabilities

1. **Creator Dashboard Metrics**:
   Calculates total active patrons, Monthly Recurring Revenue (MRR) in USD, and lifetime net earnings.
2. **Patron Feed with Access Verification**:
   Dynamically determines whether a patron can view full post content based on their active tier and post visibility level.
3. **Goal Progress Tracker**:
   Computes percentage progress towards financial or patron-count campaign goals.
4. **Threaded Comment Tree**:
   Fetches structured comments and reply trees along with user metadata and like tallies.
5. **Creator Payout Balance**:
   Calculates total net funds received minus processed payouts to show available payout balances.

---

## Verification & Testing

Run `verify.py` to confirm database setup:
- Checks all 23 base tables and views.
- Validates seed data row counts.
- Tests trigger functionality (`patron_count` updates and `audit_logs`).
- Verifies Row Level Security isolation across patron and creator user contexts.
- Executes and validates all business logic queries.
