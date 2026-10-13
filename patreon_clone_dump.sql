--
-- PostgreSQL database dump
--

\restrict fPIcG7VwwghYSoTm6D0E3zDq0dnfyTVWAd2Gi3YSjxnhvae1f3aBMDiNNwRbsjo

-- Dumped from database version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP POLICY IF EXISTS subscriptions_participant_policy ON public.subscriptions;
DROP POLICY IF EXISTS payouts_creator_policy ON public.payouts;
DROP POLICY IF EXISTS payments_participant_policy ON public.payments;
DROP POLICY IF EXISTS notifications_owner_policy ON public.notifications;
DROP POLICY IF EXISTS messages_participant_policy ON public.messages;
ALTER TABLE IF EXISTS ONLY public.tiers DROP CONSTRAINT IF EXISTS tiers_campaign_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tier_benefits DROP CONSTRAINT IF EXISTS tier_benefits_tier_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tier_benefits DROP CONSTRAINT IF EXISTS tier_benefits_benefit_id_fkey;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_tier_id_fkey;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_patron_id_fkey;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_campaign_id_fkey;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_campaign_id_fkey;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE IF EXISTS ONLY public.post_tier_access DROP CONSTRAINT IF EXISTS post_tier_access_tier_id_fkey;
ALTER TABLE IF EXISTS ONLY public.post_tier_access DROP CONSTRAINT IF EXISTS post_tier_access_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.post_tags DROP CONSTRAINT IF EXISTS post_tags_tag_id_fkey;
ALTER TABLE IF EXISTS ONLY public.post_tags DROP CONSTRAINT IF EXISTS post_tags_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.polls DROP CONSTRAINT IF EXISTS polls_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.poll_votes DROP CONSTRAINT IF EXISTS poll_votes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.poll_votes DROP CONSTRAINT IF EXISTS poll_votes_poll_id_fkey;
ALTER TABLE IF EXISTS ONLY public.poll_votes DROP CONSTRAINT IF EXISTS poll_votes_option_id_fkey;
ALTER TABLE IF EXISTS ONLY public.poll_options DROP CONSTRAINT IF EXISTS poll_options_poll_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payouts DROP CONSTRAINT IF EXISTS payouts_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payouts DROP CONSTRAINT IF EXISTS payouts_campaign_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_subscription_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_patron_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_campaign_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.media_attachments DROP CONSTRAINT IF EXISTS media_attachments_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.likes DROP CONSTRAINT IF EXISTS likes_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.likes DROP CONSTRAINT IF EXISTS likes_comment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.goals DROP CONSTRAINT IF EXISTS goals_campaign_id_fkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_patron_id_fkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_parent_comment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.campaigns DROP CONSTRAINT IF EXISTS campaigns_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.campaigns DROP CONSTRAINT IF EXISTS campaigns_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.benefits DROP CONSTRAINT IF EXISTS benefits_campaign_id_fkey;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_tiers_updated_at ON public.tiers;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
DROP TRIGGER IF EXISTS update_payouts_updated_at ON public.payouts;
DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
DROP TRIGGER IF EXISTS trigger_update_tier_patron_count ON public.subscriptions;
DROP TRIGGER IF EXISTS trigger_update_poll_option_vote_count ON public.poll_votes;
DROP TRIGGER IF EXISTS audit_users_trigger ON public.users;
DROP TRIGGER IF EXISTS audit_payouts_trigger ON public.payouts;
DROP TRIGGER IF EXISTS audit_payments_trigger ON public.payments;
DROP INDEX IF EXISTS public.unique_user_post_like;
DROP INDEX IF EXISTS public.unique_user_comment_like;
DROP INDEX IF EXISTS public.idx_tiers_campaign;
DROP INDEX IF EXISTS public.idx_subscriptions_tier;
DROP INDEX IF EXISTS public.idx_subscriptions_status;
DROP INDEX IF EXISTS public.idx_subscriptions_patron;
DROP INDEX IF EXISTS public.idx_subscriptions_campaign;
DROP INDEX IF EXISTS public.idx_posts_title_trgm;
DROP INDEX IF EXISTS public.idx_posts_campaign_published;
DROP INDEX IF EXISTS public.idx_posts_author;
DROP INDEX IF EXISTS public.idx_posts_access;
DROP INDEX IF EXISTS public.idx_payments_subscription;
DROP INDEX IF EXISTS public.idx_payments_patron;
DROP INDEX IF EXISTS public.idx_payments_campaign;
DROP INDEX IF EXISTS public.idx_notifications_user_unread;
DROP INDEX IF EXISTS public.idx_messages_conversation;
DROP INDEX IF EXISTS public.idx_likes_post;
DROP INDEX IF EXISTS public.idx_likes_comment;
DROP INDEX IF EXISTS public.idx_comments_post;
DROP INDEX IF EXISTS public.idx_comments_parent;
DROP INDEX IF EXISTS public.idx_campaigns_title_trgm;
DROP INDEX IF EXISTS public.idx_campaigns_creator;
DROP INDEX IF EXISTS public.idx_campaigns_category;
DROP INDEX IF EXISTS public.idx_audit_logs_table_record;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.poll_votes DROP CONSTRAINT IF EXISTS unique_user_poll_vote;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS unique_patron_creator_conversation;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS unique_patron_campaign_sub;
ALTER TABLE IF EXISTS ONLY public.campaigns DROP CONSTRAINT IF EXISTS unique_creator_campaign;
ALTER TABLE IF EXISTS ONLY public.tiers DROP CONSTRAINT IF EXISTS tiers_pkey;
ALTER TABLE IF EXISTS ONLY public.tier_benefits DROP CONSTRAINT IF EXISTS tier_benefits_pkey;
ALTER TABLE IF EXISTS ONLY public.tags DROP CONSTRAINT IF EXISTS tags_pkey;
ALTER TABLE IF EXISTS ONLY public.tags DROP CONSTRAINT IF EXISTS tags_name_key;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_pkey;
ALTER TABLE IF EXISTS ONLY public.post_tier_access DROP CONSTRAINT IF EXISTS post_tier_access_pkey;
ALTER TABLE IF EXISTS ONLY public.post_tags DROP CONSTRAINT IF EXISTS post_tags_pkey;
ALTER TABLE IF EXISTS ONLY public.polls DROP CONSTRAINT IF EXISTS polls_post_id_key;
ALTER TABLE IF EXISTS ONLY public.polls DROP CONSTRAINT IF EXISTS polls_pkey;
ALTER TABLE IF EXISTS ONLY public.poll_votes DROP CONSTRAINT IF EXISTS poll_votes_pkey;
ALTER TABLE IF EXISTS ONLY public.poll_options DROP CONSTRAINT IF EXISTS poll_options_pkey;
ALTER TABLE IF EXISTS ONLY public.payouts DROP CONSTRAINT IF EXISTS payouts_pkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_transaction_reference_key;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.media_attachments DROP CONSTRAINT IF EXISTS media_attachments_pkey;
ALTER TABLE IF EXISTS ONLY public.likes DROP CONSTRAINT IF EXISTS likes_pkey;
ALTER TABLE IF EXISTS ONLY public.goals DROP CONSTRAINT IF EXISTS goals_pkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_pkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_slug_key;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_name_key;
ALTER TABLE IF EXISTS ONLY public.campaigns DROP CONSTRAINT IF EXISTS campaigns_slug_key;
ALTER TABLE IF EXISTS ONLY public.campaigns DROP CONSTRAINT IF EXISTS campaigns_pkey;
ALTER TABLE IF EXISTS ONLY public.benefits DROP CONSTRAINT IF EXISTS benefits_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS public.tags ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.tier_benefits;
DROP SEQUENCE IF EXISTS public.tags_id_seq;
DROP TABLE IF EXISTS public.tags;
DROP TABLE IF EXISTS public.post_tags;
DROP TABLE IF EXISTS public.polls;
DROP TABLE IF EXISTS public.poll_votes;
DROP TABLE IF EXISTS public.poll_options;
DROP TABLE IF EXISTS public.payouts;
DROP VIEW IF EXISTS public.patron_feed_view;
DROP TABLE IF EXISTS public.tiers;
DROP TABLE IF EXISTS public.post_tier_access;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.media_attachments;
DROP TABLE IF EXISTS public.likes;
DROP TABLE IF EXISTS public.goals;
DROP TABLE IF EXISTS public.conversations;
DROP TABLE IF EXISTS public.comments;
DROP SEQUENCE IF EXISTS public.categories_id_seq;
DROP TABLE IF EXISTS public.categories;
DROP VIEW IF EXISTS public.campaign_analytics;
DROP TABLE IF EXISTS public.subscriptions;
DROP TABLE IF EXISTS public.posts;
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.campaigns;
DROP TABLE IF EXISTS public.benefits;
DROP TABLE IF EXISTS public.audit_logs;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.update_tier_patron_count();
DROP FUNCTION IF EXISTS public.update_poll_option_vote_count();
DROP FUNCTION IF EXISTS public.log_security_audit();
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.subscription_status;
DROP TYPE IF EXISTS public.post_type;
DROP TYPE IF EXISTS public.post_access_level;
DROP TYPE IF EXISTS public.payout_status;
DROP TYPE IF EXISTS public.payment_status;
DROP TYPE IF EXISTS public.notification_type;
DROP TYPE IF EXISTS public.billing_cycle;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS pg_trgm;
--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: billing_cycle; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.billing_cycle AS ENUM (
    'monthly',
    'annually'
);


ALTER TYPE public.billing_cycle OWNER TO postgres;

--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_type AS ENUM (
    'new_post',
    'new_comment',
    'new_subscription',
    'payment_failed',
    'payout_processed',
    'tier_upgrade',
    'direct_message'
);


ALTER TYPE public.notification_type OWNER TO postgres;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'succeeded',
    'failed',
    'refunded'
);


ALTER TYPE public.payment_status OWNER TO postgres;

--
-- Name: payout_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payout_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);


ALTER TYPE public.payout_status OWNER TO postgres;

--
-- Name: post_access_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.post_access_level AS ENUM (
    'public',
    'patrons_only',
    'tier_only'
);


ALTER TYPE public.post_access_level OWNER TO postgres;

--
-- Name: post_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.post_type AS ENUM (
    'text',
    'image',
    'video',
    'audio',
    'poll',
    'link'
);


ALTER TYPE public.post_type OWNER TO postgres;

--
-- Name: subscription_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subscription_status AS ENUM (
    'active',
    'canceled',
    'past_due',
    'paused'
);


ALTER TYPE public.subscription_status OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'creator',
    'patron'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: log_security_audit(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_security_audit() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, action, record_id, old_data)
        VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, to_jsonb(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (table_name, action, record_id, old_data, new_data)
        VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, action, record_id, new_data)
        VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.log_security_audit() OWNER TO postgres;

--
-- Name: update_poll_option_vote_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_poll_option_vote_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE poll_options SET votes_count = votes_count + 1 WHERE id = NEW.option_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE poll_options SET votes_count = GREATEST(0, votes_count - 1) WHERE id = OLD.option_id;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_poll_option_vote_count() OWNER TO postgres;

--
-- Name: update_tier_patron_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_tier_patron_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.status = 'active' THEN
            UPDATE tiers SET patron_count = patron_count + 1 WHERE id = NEW.tier_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF OLD.tier_id = NEW.tier_id THEN
            IF OLD.status != 'active' AND NEW.status = 'active' THEN
                UPDATE tiers SET patron_count = patron_count + 1 WHERE id = NEW.tier_id;
            ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
                UPDATE tiers SET patron_count = GREATEST(0, patron_count - 1) WHERE id = NEW.tier_id;
            END IF;
        ELSE
            IF OLD.status = 'active' THEN
                UPDATE tiers SET patron_count = GREATEST(0, patron_count - 1) WHERE id = OLD.tier_id;
            END IF;
            IF NEW.status = 'active' THEN
                UPDATE tiers SET patron_count = patron_count + 1 WHERE id = NEW.tier_id;
            END IF;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD.status = 'active' THEN
            UPDATE tiers SET patron_count = GREATEST(0, patron_count - 1) WHERE id = OLD.tier_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_tier_patron_count() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    table_name character varying(100) NOT NULL,
    action character varying(20) NOT NULL,
    record_id uuid,
    old_data jsonb,
    new_data jsonb,
    performed_by character varying(100) DEFAULT CURRENT_USER,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: benefits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.benefits (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    campaign_id uuid NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.benefits OWNER TO postgres;

--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaigns (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    creator_id uuid NOT NULL,
    category_id integer,
    title character varying(150) NOT NULL,
    slug character varying(150) NOT NULL,
    summary character varying(255),
    about text,
    cover_image_url text,
    creation_name character varying(100) DEFAULT 'is creating content'::character varying NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    is_nsfw boolean DEFAULT false NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT campaigns_slug_check CHECK (((slug)::text ~* '^[a-z0-9-]+$'::text))
);


ALTER TABLE public.campaigns OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    subscription_id uuid,
    patron_id uuid NOT NULL,
    campaign_id uuid NOT NULL,
    amount_cents bigint NOT NULL,
    fee_cents bigint DEFAULT 0 NOT NULL,
    net_cents bigint NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    payment_method character varying(50) DEFAULT 'stripe'::character varying NOT NULL,
    transaction_reference character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_financial_math CHECK (((net_cents + fee_cents) = amount_cents)),
    CONSTRAINT payments_amount_cents_check CHECK ((amount_cents > 0)),
    CONSTRAINT payments_fee_cents_check CHECK ((fee_cents >= 0)),
    CONSTRAINT payments_net_cents_check CHECK ((net_cents >= 0))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    campaign_id uuid NOT NULL,
    author_id uuid NOT NULL,
    title character varying(200) NOT NULL,
    slug character varying(200) NOT NULL,
    content text,
    teaser_text text,
    post_type public.post_type DEFAULT 'text'::public.post_type NOT NULL,
    access_level public.post_access_level DEFAULT 'public'::public.post_access_level NOT NULL,
    min_tier_amount_cents bigint DEFAULT 0 NOT NULL,
    is_pinned boolean DEFAULT false NOT NULL,
    published_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT posts_min_tier_amount_cents_check CHECK ((min_tier_amount_cents >= 0))
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    patron_id uuid NOT NULL,
    campaign_id uuid NOT NULL,
    tier_id uuid NOT NULL,
    status public.subscription_status DEFAULT 'active'::public.subscription_status NOT NULL,
    amount_cents bigint NOT NULL,
    billing_cycle public.billing_cycle DEFAULT 'monthly'::public.billing_cycle NOT NULL,
    current_period_start timestamp with time zone NOT NULL,
    current_period_end timestamp with time zone NOT NULL,
    cancel_at_period_end boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_sub_dates CHECK ((current_period_end >= current_period_start)),
    CONSTRAINT subscriptions_amount_cents_check CHECK ((amount_cents >= 0))
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: campaign_analytics; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.campaign_analytics AS
 SELECT id AS campaign_id,
    title AS campaign_title,
    creator_id,
    ( SELECT count(s.id) AS count
           FROM public.subscriptions s
          WHERE ((s.campaign_id = c.id) AND (s.status = 'active'::public.subscription_status))) AS active_patrons_count,
    ( SELECT COALESCE(sum(s.amount_cents), (0)::numeric) AS "coalesce"
           FROM public.subscriptions s
          WHERE ((s.campaign_id = c.id) AND (s.status = 'active'::public.subscription_status))) AS monthly_recurring_revenue_cents,
    ( SELECT COALESCE(sum(p.net_cents), (0)::numeric) AS "coalesce"
           FROM public.payments p
          WHERE ((p.campaign_id = c.id) AND (p.status = 'succeeded'::public.payment_status))) AS total_net_revenue_cents,
    ( SELECT count(post.id) AS count
           FROM public.posts post
          WHERE (post.campaign_id = c.id)) AS total_posts_count
   FROM public.campaigns c;


ALTER VIEW public.campaign_analytics OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT categories_slug_check CHECK (((slug)::text ~* '^[a-z0-9-]+$'::text))
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    parent_comment_id uuid,
    content text NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    patron_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    last_message_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- Name: goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goals (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    campaign_id uuid NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    target_amount_cents bigint,
    reach_by_patrons_count integer,
    is_reached boolean DEFAULT false NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_goal_target CHECK ((((target_amount_cents IS NOT NULL) AND (reach_by_patrons_count IS NULL)) OR ((target_amount_cents IS NULL) AND (reach_by_patrons_count IS NOT NULL)) OR ((target_amount_cents IS NOT NULL) AND (reach_by_patrons_count IS NOT NULL)))),
    CONSTRAINT goals_reach_by_patrons_count_check CHECK ((reach_by_patrons_count > 0)),
    CONSTRAINT goals_target_amount_cents_check CHECK ((target_amount_cents > 0))
);


ALTER TABLE public.goals OWNER TO postgres;

--
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    post_id uuid,
    comment_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_like_target CHECK ((((post_id IS NOT NULL) AND (comment_id IS NULL)) OR ((post_id IS NULL) AND (comment_id IS NOT NULL))))
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- Name: media_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_attachments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    post_id uuid,
    media_type character varying(50) NOT NULL,
    file_url text NOT NULL,
    file_size_bytes bigint,
    duration_seconds integer,
    mime_type character varying(100),
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT media_attachments_duration_seconds_check CHECK ((duration_seconds >= 0)),
    CONSTRAINT media_attachments_file_size_bytes_check CHECK ((file_size_bytes > 0))
);


ALTER TABLE public.media_attachments OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    type public.notification_type NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    link text,
    is_read boolean DEFAULT false NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: post_tier_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_tier_access (
    post_id uuid NOT NULL,
    tier_id uuid NOT NULL
);


ALTER TABLE public.post_tier_access OWNER TO postgres;

--
-- Name: tiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tiers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    campaign_id uuid NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    amount_cents bigint NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    cover_image_url text,
    is_custom_amount_allowed boolean DEFAULT true NOT NULL,
    patron_count integer DEFAULT 0 NOT NULL,
    max_patrons integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tiers_amount_cents_check CHECK ((amount_cents >= 0)),
    CONSTRAINT tiers_max_patrons_check CHECK (((max_patrons IS NULL) OR (max_patrons > 0))),
    CONSTRAINT tiers_patron_count_check CHECK ((patron_count >= 0))
);


ALTER TABLE public.tiers OWNER TO postgres;

--
-- Name: patron_feed_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.patron_feed_view AS
 SELECT p.id AS post_id,
    p.campaign_id,
    c.title AS campaign_title,
    p.title AS post_title,
    p.slug AS post_slug,
    p.teaser_text,
    p.content,
    p.post_type,
    p.access_level,
    p.min_tier_amount_cents,
    p.published_at,
    s.patron_id,
    t.id AS patron_tier_id,
    t.amount_cents AS patron_tier_amount_cents,
        CASE
            WHEN (p.access_level = 'public'::public.post_access_level) THEN true
            WHEN ((s.status = 'active'::public.subscription_status) AND (p.access_level = 'patrons_only'::public.post_access_level)) THEN true
            WHEN ((s.status = 'active'::public.subscription_status) AND (p.access_level = 'tier_only'::public.post_access_level) AND ((t.amount_cents >= p.min_tier_amount_cents) OR (EXISTS ( SELECT 1
               FROM public.post_tier_access pta
              WHERE ((pta.post_id = p.id) AND (pta.tier_id = s.tier_id)))))) THEN true
            ELSE false
        END AS has_access
   FROM (((public.posts p
     JOIN public.campaigns c ON ((p.campaign_id = c.id)))
     LEFT JOIN public.subscriptions s ON (((p.campaign_id = s.campaign_id) AND (s.status = 'active'::public.subscription_status))))
     LEFT JOIN public.tiers t ON ((s.tier_id = t.id)));


ALTER VIEW public.patron_feed_view OWNER TO postgres;

--
-- Name: payouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payouts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    campaign_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    amount_cents bigint NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    status public.payout_status DEFAULT 'pending'::public.payout_status NOT NULL,
    destination_info jsonb,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT payouts_amount_cents_check CHECK ((amount_cents > 0))
);


ALTER TABLE public.payouts OWNER TO postgres;

--
-- Name: poll_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.poll_options (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    poll_id uuid NOT NULL,
    option_text character varying(255) NOT NULL,
    votes_count integer DEFAULT 0 NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    CONSTRAINT poll_options_votes_count_check CHECK ((votes_count >= 0))
);


ALTER TABLE public.poll_options OWNER TO postgres;

--
-- Name: poll_votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.poll_votes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    poll_id uuid NOT NULL,
    option_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.poll_votes OWNER TO postgres;

--
-- Name: polls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.polls (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    post_id uuid NOT NULL,
    question character varying(255) NOT NULL,
    is_multiple_choice boolean DEFAULT false NOT NULL,
    closed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.polls OWNER TO postgres;

--
-- Name: post_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_tags (
    post_id uuid NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.post_tags OWNER TO postgres;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: tier_benefits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tier_benefits (
    tier_id uuid NOT NULL,
    benefit_id uuid NOT NULL
);


ALTER TABLE public.tier_benefits OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(100) NOT NULL,
    username character varying(50) NOT NULL,
    avatar_url text,
    bio text,
    role public.user_role DEFAULT 'patron'::public.user_role NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT users_email_check CHECK (((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT users_username_check CHECK (((username)::text ~* '^[a-zA-Z0-9_]{3,50}$'::text))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, table_name, action, record_id, old_data, new_data, performed_by, created_at) FROM stdin;
6b5714d0-1704-416c-9f35-bd9c2fb5b4f5	payments	INSERT	99999999-9999-9999-9999-999999999991	\N	{"id": "99999999-9999-9999-9999-999999999991", "status": "succeeded", "currency": "USD", "fee_cents": 75, "net_cents": 1425, "patron_id": "00000000-0000-0000-0000-000000000004", "created_at": "2026-10-13T09:35:00.111147+00:00", "updated_at": "2026-10-13T09:35:00.111147+00:00", "campaign_id": "11111111-1111-1111-1111-111111111111", "amount_cents": 1500, "payment_method": "stripe", "subscription_id": "55555555-5555-5555-5555-555555555551", "transaction_reference": "ch_3M1234567890"}	postgres	2026-10-13 09:35:00.111147+00
40b3c115-6f32-4dc1-91c2-d6c4b560e250	payments	INSERT	99999999-9999-9999-9999-999999999992	\N	{"id": "99999999-9999-9999-9999-999999999992", "status": "succeeded", "currency": "USD", "fee_cents": 25, "net_cents": 475, "patron_id": "00000000-0000-0000-0000-000000000005", "created_at": "2026-10-13T09:35:00.111147+00:00", "updated_at": "2026-10-13T09:35:00.111147+00:00", "campaign_id": "11111111-1111-1111-1111-111111111111", "amount_cents": 500, "payment_method": "stripe", "subscription_id": "55555555-5555-5555-5555-555555555552", "transaction_reference": "ch_3M0987654321"}	postgres	2026-10-13 09:35:00.111147+00
8cab5ad7-632e-4808-b615-e17a5d72994c	payouts	INSERT	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	\N	{"id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "status": "completed", "currency": "USD", "created_at": "2026-10-13T09:35:00.111147+00:00", "creator_id": "00000000-0000-0000-0000-000000000002", "updated_at": "2026-10-13T09:35:00.111147+00:00", "campaign_id": "11111111-1111-1111-1111-111111111111", "amount_cents": 1000, "processed_at": "2026-10-12T09:35:00.111147+00:00", "destination_info": {"bank": "Chase", "last4": "1234"}}	postgres	2026-10-13 09:35:00.111147+00
\.


--
-- Data for Name: benefits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.benefits (id, campaign_id, title, description, created_at) FROM stdin;
44444444-4444-4444-4444-444444444441	11111111-1111-1111-1111-111111111111	Early Access Episodes	Listen to new episodes 48 hours before public release	2026-10-13 09:35:00.111147+00
44444444-4444-4444-4444-444444444442	11111111-1111-1111-1111-111111111111	Exclusive Bonus Episodes	Monthly bonus episode only for VIP patrons	2026-10-13 09:35:00.111147+00
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campaigns (id, creator_id, category_id, title, slug, summary, about, cover_image_url, creation_name, currency, is_nsfw, is_published, published_at, created_at, updated_at) FROM stdin;
11111111-1111-1111-1111-111111111111	00000000-0000-0000-0000-000000000002	1	Tech Overload Podcast	tech-overload	Weekly deep dives into modern tech & AI	Welcome to Tech Overload!	\N	is creating podcasts	USD	f	t	2026-09-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, created_at) FROM stdin;
1	Podcasts	podcasts	Audio shows and talk podcasts	2026-10-13 09:35:00.111147+00
2	Gaming	gaming	Video games, streaming, and esports	2026-10-13 09:35:00.111147+00
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, post_id, user_id, parent_comment_id, content, is_deleted, created_at, updated_at) FROM stdin;
77777777-7777-7777-7777-777777777771	66666666-6666-6666-6666-666666666661	00000000-0000-0000-0000-000000000004	\N	Great episode! Loved the section on error correction.	f	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
77777777-7777-7777-7777-777777777772	66666666-6666-6666-6666-666666666661	00000000-0000-0000-0000-000000000002	77777777-7777-7777-7777-777777777771	Thanks John! Glad you enjoyed it.	f	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, patron_id, creator_id, last_message_at, created_at) FROM stdin;
\.


--
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.goals (id, campaign_id, title, description, target_amount_cents, reach_by_patrons_count, is_reached, completed_at, created_at) FROM stdin;
22222222-2222-2222-2222-222222222221	11111111-1111-1111-1111-111111111111	Upgrade Studio Microphones	Get high quality audio gear for better listener experience	50000	\N	f	\N	2026-10-13 09:35:00.111147+00
\.


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.likes (id, user_id, post_id, comment_id, created_at) FROM stdin;
88888888-8888-8888-8888-888888888881	00000000-0000-0000-0000-000000000005	\N	77777777-7777-7777-7777-777777777771	2026-10-13 09:35:00.111147+00
\.


--
-- Data for Name: media_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_attachments (id, post_id, media_type, file_url, file_size_bytes, duration_seconds, mime_type, "position", created_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, conversation_id, sender_id, content, is_read, read_at, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, message, link, is_read, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, subscription_id, patron_id, campaign_id, amount_cents, fee_cents, net_cents, currency, status, payment_method, transaction_reference, created_at, updated_at) FROM stdin;
99999999-9999-9999-9999-999999999991	55555555-5555-5555-5555-555555555551	00000000-0000-0000-0000-000000000004	11111111-1111-1111-1111-111111111111	1500	75	1425	USD	succeeded	stripe	ch_3M1234567890	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
99999999-9999-9999-9999-999999999992	55555555-5555-5555-5555-555555555552	00000000-0000-0000-0000-000000000005	11111111-1111-1111-1111-111111111111	500	25	475	USD	succeeded	stripe	ch_3M0987654321	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
\.


--
-- Data for Name: payouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payouts (id, campaign_id, creator_id, amount_cents, currency, status, destination_info, processed_at, created_at, updated_at) FROM stdin;
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	11111111-1111-1111-1111-111111111111	00000000-0000-0000-0000-000000000002	1000	USD	completed	{"bank": "Chase", "last4": "1234"}	2026-10-12 09:35:00.111147+00	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
\.


--
-- Data for Name: poll_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.poll_options (id, poll_id, option_text, votes_count, "position") FROM stdin;
\.


--
-- Data for Name: poll_votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.poll_votes (id, poll_id, option_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: polls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.polls (id, post_id, question, is_multiple_choice, closed_at, created_at) FROM stdin;
\.


--
-- Data for Name: post_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_tags (post_id, tag_id) FROM stdin;
\.


--
-- Data for Name: post_tier_access; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_tier_access (post_id, tier_id) FROM stdin;
66666666-6666-6666-6666-666666666661	33333333-3333-3333-3333-333333333331
66666666-6666-6666-6666-666666666661	33333333-3333-3333-3333-333333333332
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, campaign_id, author_id, title, slug, content, teaser_text, post_type, access_level, min_tier_amount_cents, is_pinned, published_at, created_at, updated_at) FROM stdin;
66666666-6666-6666-6666-666666666661	11111111-1111-1111-1111-111111111111	00000000-0000-0000-0000-000000000002	Episode 42: The Future of Quantum Computing	ep-42-quantum	Here is full content for Episode 42 discussing quantum algorithms...	Teaser for Episode 42: Quantum breakthroughs in 2026	audio	tier_only	500	f	2026-10-11 09:35:00.111147+00	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
66666666-6666-6666-6666-666666666662	11111111-1111-1111-1111-111111111111	00000000-0000-0000-0000-000000000002	Welcome to Tech Overload!	welcome-post	Public welcome announcement to all fans and followers!	Welcome everyone!	text	public	0	f	2026-09-28 09:35:00.111147+00	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, patron_id, campaign_id, tier_id, status, amount_cents, billing_cycle, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at) FROM stdin;
55555555-5555-5555-5555-555555555551	00000000-0000-0000-0000-000000000004	11111111-1111-1111-1111-111111111111	33333333-3333-3333-3333-333333333332	active	1500	monthly	2026-10-03 09:35:00.111147+00	2026-11-02 09:35:00.111147+00	f	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
55555555-5555-5555-5555-555555555552	00000000-0000-0000-0000-000000000005	11111111-1111-1111-1111-111111111111	33333333-3333-3333-3333-333333333331	active	500	monthly	2026-10-08 09:35:00.111147+00	2026-11-07 09:35:00.111147+00	f	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (id, name) FROM stdin;
\.


--
-- Data for Name: tier_benefits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tier_benefits (tier_id, benefit_id) FROM stdin;
33333333-3333-3333-3333-333333333331	44444444-4444-4444-4444-444444444441
33333333-3333-3333-3333-333333333332	44444444-4444-4444-4444-444444444441
33333333-3333-3333-3333-333333333332	44444444-4444-4444-4444-444444444442
\.


--
-- Data for Name: tiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tiers (id, campaign_id, title, description, amount_cents, currency, cover_image_url, is_custom_amount_allowed, patron_count, max_patrons, is_active, created_at, updated_at) FROM stdin;
33333333-3333-3333-3333-333333333332	11111111-1111-1111-1111-111111111111	VIP Insider	Early access to episodes, bonus episodes, and Q&A priority	1500	USD	\N	t	1	\N	t	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
33333333-3333-3333-3333-333333333331	11111111-1111-1111-1111-111111111111	Listener Support	Access to patron-only posts and community discord	500	USD	\N	t	1	\N	t	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, full_name, username, avatar_url, bio, role, is_verified, created_at, updated_at) FROM stdin;
00000000-0000-0000-0000-000000000001	admin@example.com	$2b$12$e8vE9x1...	Platform Admin	admin	\N	\N	admin	t	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
00000000-0000-0000-0000-000000000002	techpodcasts@example.com	$2b$12$e8vE9x1...	Alex Rivera	techoverload	\N	\N	creator	t	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
00000000-0000-0000-0000-000000000003	gamer@example.com	$2b$12$e8vE9x1...	Sam Wilson	samplays	\N	\N	creator	t	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
00000000-0000-0000-0000-000000000004	john.doe@example.com	$2b$12$e8vE9x1...	John Doe	johndoe	\N	\N	patron	f	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
00000000-0000-0000-0000-000000000005	jane.smith@example.com	$2b$12$e8vE9x1...	Jane Smith	janesmith	\N	\N	patron	f	2026-10-13 09:35:00.111147+00	2026-10-13 09:35:00.111147+00
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 1, false);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tags_id_seq', 1, false);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: benefits benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.benefits
    ADD CONSTRAINT benefits_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_slug_key UNIQUE (slug);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: media_attachments media_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_attachments
    ADD CONSTRAINT media_attachments_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_transaction_reference_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_transaction_reference_key UNIQUE (transaction_reference);


--
-- Name: payouts payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_pkey PRIMARY KEY (id);


--
-- Name: poll_options poll_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_options
    ADD CONSTRAINT poll_options_pkey PRIMARY KEY (id);


--
-- Name: poll_votes poll_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_pkey PRIMARY KEY (id);


--
-- Name: polls polls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.polls
    ADD CONSTRAINT polls_pkey PRIMARY KEY (id);


--
-- Name: polls polls_post_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.polls
    ADD CONSTRAINT polls_post_id_key UNIQUE (post_id);


--
-- Name: post_tags post_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT post_tags_pkey PRIMARY KEY (post_id, tag_id);


--
-- Name: post_tier_access post_tier_access_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tier_access
    ADD CONSTRAINT post_tier_access_pkey PRIMARY KEY (post_id, tier_id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tier_benefits tier_benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tier_benefits
    ADD CONSTRAINT tier_benefits_pkey PRIMARY KEY (tier_id, benefit_id);


--
-- Name: tiers tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tiers
    ADD CONSTRAINT tiers_pkey PRIMARY KEY (id);


--
-- Name: campaigns unique_creator_campaign; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT unique_creator_campaign UNIQUE (creator_id);


--
-- Name: subscriptions unique_patron_campaign_sub; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT unique_patron_campaign_sub UNIQUE (patron_id, campaign_id);


--
-- Name: conversations unique_patron_creator_conversation; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT unique_patron_creator_conversation UNIQUE (patron_id, creator_id);


--
-- Name: poll_votes unique_user_poll_vote; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT unique_user_poll_vote UNIQUE (poll_id, user_id, option_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_audit_logs_table_record; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_table_record ON public.audit_logs USING btree (table_name, record_id);


--
-- Name: idx_campaigns_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaigns_category ON public.campaigns USING btree (category_id);


--
-- Name: idx_campaigns_creator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaigns_creator ON public.campaigns USING btree (creator_id);


--
-- Name: idx_campaigns_title_trgm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaigns_title_trgm ON public.campaigns USING gin (title public.gin_trgm_ops);


--
-- Name: idx_comments_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_parent ON public.comments USING btree (parent_comment_id);


--
-- Name: idx_comments_post; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_post ON public.comments USING btree (post_id);


--
-- Name: idx_likes_comment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_likes_comment ON public.likes USING btree (comment_id) WHERE (comment_id IS NOT NULL);


--
-- Name: idx_likes_post; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_likes_post ON public.likes USING btree (post_id) WHERE (post_id IS NOT NULL);


--
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id, created_at);


--
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, is_read) WHERE (is_read = false);


--
-- Name: idx_payments_campaign; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_campaign ON public.payments USING btree (campaign_id);


--
-- Name: idx_payments_patron; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_patron ON public.payments USING btree (patron_id);


--
-- Name: idx_payments_subscription; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_subscription ON public.payments USING btree (subscription_id);


--
-- Name: idx_posts_access; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_access ON public.posts USING btree (access_level, min_tier_amount_cents);


--
-- Name: idx_posts_author; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_author ON public.posts USING btree (author_id);


--
-- Name: idx_posts_campaign_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_campaign_published ON public.posts USING btree (campaign_id, published_at DESC);


--
-- Name: idx_posts_title_trgm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_title_trgm ON public.posts USING gin (title public.gin_trgm_ops);


--
-- Name: idx_subscriptions_campaign; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_campaign ON public.subscriptions USING btree (campaign_id);


--
-- Name: idx_subscriptions_patron; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_patron ON public.subscriptions USING btree (patron_id);


--
-- Name: idx_subscriptions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_status ON public.subscriptions USING btree (status);


--
-- Name: idx_subscriptions_tier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_tier ON public.subscriptions USING btree (tier_id);


--
-- Name: idx_tiers_campaign; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tiers_campaign ON public.tiers USING btree (campaign_id);


--
-- Name: unique_user_comment_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_user_comment_like ON public.likes USING btree (user_id, comment_id) WHERE (comment_id IS NOT NULL);


--
-- Name: unique_user_post_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_user_post_like ON public.likes USING btree (user_id, post_id) WHERE (post_id IS NOT NULL);


--
-- Name: payments audit_payments_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_payments_trigger AFTER INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.log_security_audit();


--
-- Name: payouts audit_payouts_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_payouts_trigger AFTER INSERT OR UPDATE ON public.payouts FOR EACH ROW EXECUTE FUNCTION public.log_security_audit();


--
-- Name: users audit_users_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_users_trigger AFTER UPDATE OF role, password_hash, email ON public.users FOR EACH ROW EXECUTE FUNCTION public.log_security_audit();


--
-- Name: poll_votes trigger_update_poll_option_vote_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_poll_option_vote_count AFTER INSERT OR DELETE ON public.poll_votes FOR EACH ROW EXECUTE FUNCTION public.update_poll_option_vote_count();


--
-- Name: subscriptions trigger_update_tier_patron_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_tier_patron_count AFTER INSERT OR DELETE OR UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_tier_patron_count();


--
-- Name: campaigns update_campaigns_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: comments update_comments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payments update_payments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payouts update_payouts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON public.payouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: posts update_posts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscriptions update_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tiers update_tiers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tiers_updated_at BEFORE UPDATE ON public.tiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: benefits benefits_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.benefits
    ADD CONSTRAINT benefits_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaigns campaigns_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: campaigns campaigns_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_parent_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: goals goals_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: likes likes_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: likes likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: media_attachments media_attachments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_attachments
    ADD CONSTRAINT media_attachments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: payments payments_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;


--
-- Name: payouts payouts_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: payouts payouts_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: poll_options poll_options_poll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_options
    ADD CONSTRAINT poll_options_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id) ON DELETE CASCADE;


--
-- Name: poll_votes poll_votes_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.poll_options(id) ON DELETE CASCADE;


--
-- Name: poll_votes poll_votes_poll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id) ON DELETE CASCADE;


--
-- Name: poll_votes poll_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: polls polls_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.polls
    ADD CONSTRAINT polls_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_tags post_tags_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT post_tags_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_tags post_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT post_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: post_tier_access post_tier_access_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tier_access
    ADD CONSTRAINT post_tier_access_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_tier_access post_tier_access_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tier_access
    ADD CONSTRAINT post_tier_access_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES public.tiers(id) ON DELETE CASCADE;


--
-- Name: posts posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: posts posts_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES public.tiers(id) ON DELETE RESTRICT;


--
-- Name: tier_benefits tier_benefits_benefit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tier_benefits
    ADD CONSTRAINT tier_benefits_benefit_id_fkey FOREIGN KEY (benefit_id) REFERENCES public.benefits(id) ON DELETE CASCADE;


--
-- Name: tier_benefits tier_benefits_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tier_benefits
    ADD CONSTRAINT tier_benefits_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES public.tiers(id) ON DELETE CASCADE;


--
-- Name: tiers tiers_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tiers
    ADD CONSTRAINT tiers_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: messages messages_participant_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY messages_participant_policy ON public.messages USING (((NULLIF(current_setting('app.current_user_id'::text, true), ''::text) IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.conversations c
  WHERE ((c.id = messages.conversation_id) AND (((c.patron_id)::text = current_setting('app.current_user_id'::text, true)) OR ((c.creator_id)::text = current_setting('app.current_user_id'::text, true))))))));


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_owner_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_owner_policy ON public.notifications USING (((NULLIF(current_setting('app.current_user_id'::text, true), ''::text) IS NOT NULL) AND ((user_id)::text = current_setting('app.current_user_id'::text, true))));


--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: payments payments_participant_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payments_participant_policy ON public.payments USING (((NULLIF(current_setting('app.current_user_id'::text, true), ''::text) IS NOT NULL) AND (((patron_id)::text = current_setting('app.current_user_id'::text, true)) OR (EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.id = payments.campaign_id) AND ((c.creator_id)::text = current_setting('app.current_user_id'::text, true))))))));


--
-- Name: payouts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

--
-- Name: payouts payouts_creator_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payouts_creator_policy ON public.payouts USING (((NULLIF(current_setting('app.current_user_id'::text, true), ''::text) IS NOT NULL) AND ((creator_id)::text = current_setting('app.current_user_id'::text, true))));


--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions subscriptions_participant_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY subscriptions_participant_policy ON public.subscriptions USING (((NULLIF(current_setting('app.current_user_id'::text, true), ''::text) IS NOT NULL) AND (((patron_id)::text = current_setting('app.current_user_id'::text, true)) OR (EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.id = subscriptions.campaign_id) AND ((c.creator_id)::text = current_setting('app.current_user_id'::text, true))))))));


--
-- PostgreSQL database dump complete
--

\unrestrict fPIcG7VwwghYSoTm6D0E3zDq0dnfyTVWAd2Gi3YSjxnhvae1f3aBMDiNNwRbsjo
