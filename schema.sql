-- =============================================================================
-- PATREON CLONE DATABASE SCHEMA (PostgreSQL) - SECURITY HARDENED & PRODUCTION READY
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('admin', 'creator', 'patron');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'paused');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'annually');
CREATE TYPE post_access_level AS ENUM ('public', 'patrons_only', 'tier_only');
CREATE TYPE post_type AS ENUM ('text', 'image', 'video', 'audio', 'poll', 'link');
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE notification_type AS ENUM (
    'new_post',
    'new_comment',
    'new_subscription',
    'payment_failed',
    'payout_processed',
    'tier_upgrade',
    'direct_message'
);

-- -----------------------------------------------------------------------------
-- AUTOMATED TIMESTAMP FUNCTION
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- TABLES
-- -----------------------------------------------------------------------------

-- 1. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE CHECK (username ~* '^[a-zA-Z0-9_]{3,50}$'),
    avatar_url TEXT,
    bio TEXT,
    role user_role NOT NULL DEFAULT 'patron',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. CATEGORIES
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE CHECK (slug ~* '^[a-z0-9-]+$'),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. CAMPAIGNS (CREATOR PAGES)
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE CHECK (slug ~* '^[a-z0-9-]+$'),
    summary VARCHAR(255),
    about TEXT,
    cover_image_url TEXT,
    creation_name VARCHAR(100) NOT NULL DEFAULT 'is creating content',
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_nsfw BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_creator_campaign UNIQUE(creator_id)
);

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON campaigns
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. GOALS
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    target_amount_cents BIGINT CHECK (target_amount_cents > 0),
    reach_by_patrons_count INT CHECK (reach_by_patrons_count > 0),
    is_reached BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_goal_target CHECK (
        (target_amount_cents IS NOT NULL AND reach_by_patrons_count IS NULL) OR
        (target_amount_cents IS NULL AND reach_by_patrons_count IS NOT NULL) OR
        (target_amount_cents IS NOT NULL AND reach_by_patrons_count IS NOT NULL)
    )
);

-- 5. TIERS (MEMBERSHIP LEVELS)
CREATE TABLE tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    cover_image_url TEXT,
    is_custom_amount_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    patron_count INT NOT NULL DEFAULT 0 CHECK (patron_count >= 0),
    max_patrons INT CHECK (max_patrons IS NULL OR max_patrons > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_tiers_updated_at
BEFORE UPDATE ON tiers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. BENEFITS
CREATE TABLE benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. TIER BENEFITS (JOIN TABLE)
CREATE TABLE tier_benefits (
    tier_id UUID NOT NULL REFERENCES tiers(id) ON DELETE CASCADE,
    benefit_id UUID NOT NULL REFERENCES benefits(id) ON DELETE CASCADE,
    PRIMARY KEY (tier_id, benefit_id)
);

-- 8. SUBSCRIPTIONS
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patron_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES tiers(id) ON DELETE RESTRICT,
    status subscription_status NOT NULL DEFAULT 'active',
    amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0),
    billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_patron_campaign_sub UNIQUE(patron_id, campaign_id),
    CONSTRAINT check_sub_dates CHECK (current_period_end >= current_period_start)
);

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. POSTS
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    content TEXT,
    teaser_text TEXT,
    post_type post_type NOT NULL DEFAULT 'text',
    access_level post_access_level NOT NULL DEFAULT 'public',
    min_tier_amount_cents BIGINT NOT NULL DEFAULT 0 CHECK (min_tier_amount_cents >= 0),
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. POST TIER ACCESS
CREATE TABLE post_tier_access (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES tiers(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tier_id)
);

-- 11. MEDIA ATTACHMENTS
CREATE TABLE media_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT CHECK (file_size_bytes > 0),
    duration_seconds INT CHECK (duration_seconds >= 0),
    mime_type VARCHAR(100),
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. POLLS
CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
    question VARCHAR(255) NOT NULL,
    is_multiple_choice BOOLEAN NOT NULL DEFAULT FALSE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. POLL OPTIONS
CREATE TABLE poll_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_text VARCHAR(255) NOT NULL,
    votes_count INT NOT NULL DEFAULT 0 CHECK (votes_count >= 0),
    position INT NOT NULL DEFAULT 0
);

-- 14. POLL VOTES
CREATE TABLE poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_poll_vote UNIQUE(poll_id, user_id, option_id)
);

-- 15. COMMENTS
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. LIKES
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_like_target CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX unique_user_post_like ON likes(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX unique_user_comment_like ON likes(user_id, comment_id) WHERE comment_id IS NOT NULL;

-- 17. PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    patron_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
    fee_cents BIGINT NOT NULL DEFAULT 0 CHECK (fee_cents >= 0),
    net_cents BIGINT NOT NULL CHECK (net_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'stripe',
    transaction_reference VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_financial_math CHECK (net_cents + fee_cents = amount_cents)
);

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 18. PAYOUTS
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status payout_status NOT NULL DEFAULT 'pending',
    destination_info JSONB,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_payouts_updated_at
BEFORE UPDATE ON payouts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 19. CONVERSATIONS
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patron_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_patron_creator_conversation UNIQUE(patron_id, creator_id)
);

-- 20. MESSAGES
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 21. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 22. TAGS & POST_TAGS
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE post_tags (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- 23. SECURITY AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    performed_by VARCHAR(100) DEFAULT CURRENT_USER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- SECURITY AUDIT TRIGGER FUNCTION
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_security_audit()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_users_trigger
AFTER UPDATE OF role, password_hash, email ON users
FOR EACH ROW EXECUTE FUNCTION log_security_audit();

CREATE TRIGGER audit_payments_trigger
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION log_security_audit();

CREATE TRIGGER audit_payouts_trigger
AFTER INSERT OR UPDATE ON payouts
FOR EACH ROW EXECUTE FUNCTION log_security_audit();

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY messages_participant_policy ON messages
    FOR ALL
    USING (
        NULLIF(current_setting('app.current_user_id', true), '') IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.patron_id::text = current_setting('app.current_user_id', true) OR c.creator_id::text = current_setting('app.current_user_id', true))
        )
    );

CREATE POLICY notifications_owner_policy ON notifications
    FOR ALL
    USING (
        NULLIF(current_setting('app.current_user_id', true), '') IS NOT NULL AND
        user_id::text = current_setting('app.current_user_id', true)
    );

CREATE POLICY payments_participant_policy ON payments
    FOR ALL
    USING (
        NULLIF(current_setting('app.current_user_id', true), '') IS NOT NULL AND
        (
            patron_id::text = current_setting('app.current_user_id', true)
            OR EXISTS (
                SELECT 1 FROM campaigns c
                WHERE c.id = payments.campaign_id
                AND c.creator_id::text = current_setting('app.current_user_id', true)
            )
        )
    );

CREATE POLICY payouts_creator_policy ON payouts
    FOR ALL
    USING (
        NULLIF(current_setting('app.current_user_id', true), '') IS NOT NULL AND
        creator_id::text = current_setting('app.current_user_id', true)
    );

CREATE POLICY subscriptions_participant_policy ON subscriptions
    FOR ALL
    USING (
        NULLIF(current_setting('app.current_user_id', true), '') IS NOT NULL AND
        (
            patron_id::text = current_setting('app.current_user_id', true)
            OR EXISTS (
                SELECT 1 FROM campaigns c
                WHERE c.id = subscriptions.campaign_id
                AND c.creator_id::text = current_setting('app.current_user_id', true)
            )
        )
    );

-- -----------------------------------------------------------------------------
-- TRIGGERS & BUSINESS LOGIC FUNCTIONS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_tier_patron_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tier_patron_count
AFTER INSERT OR UPDATE OR DELETE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_tier_patron_count();

CREATE OR REPLACE FUNCTION update_poll_option_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE poll_options SET votes_count = votes_count + 1 WHERE id = NEW.option_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE poll_options SET votes_count = GREATEST(0, votes_count - 1) WHERE id = OLD.option_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_poll_option_vote_count
AFTER INSERT OR DELETE ON poll_votes
FOR EACH ROW EXECUTE FUNCTION update_poll_option_vote_count();

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX idx_campaigns_creator ON campaigns(creator_id);
CREATE INDEX idx_campaigns_category ON campaigns(category_id);
CREATE INDEX idx_tiers_campaign ON tiers(campaign_id);
CREATE INDEX idx_subscriptions_patron ON subscriptions(patron_id);
CREATE INDEX idx_subscriptions_campaign ON subscriptions(campaign_id);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE INDEX idx_posts_campaign_published ON posts(campaign_id, published_at DESC);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_access ON posts(access_level, min_tier_amount_cents);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_likes_post ON likes(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX idx_likes_comment ON likes(comment_id) WHERE comment_id IS NOT NULL;

CREATE INDEX idx_payments_subscription ON payments(subscription_id);
CREATE INDEX idx_payments_campaign ON payments(campaign_id);
CREATE INDEX idx_payments_patron ON payments(patron_id);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

CREATE INDEX idx_posts_title_trgm ON posts USING gin (title gin_trgm_ops);
CREATE INDEX idx_campaigns_title_trgm ON campaigns USING gin (title gin_trgm_ops);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- -----------------------------------------------------------------------------
-- VIEWS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW campaign_analytics AS
SELECT
    c.id AS campaign_id,
    c.title AS campaign_title,
    c.creator_id,
    (
        SELECT COUNT(s.id)
        FROM subscriptions s
        WHERE s.campaign_id = c.id AND s.status = 'active'
    ) AS active_patrons_count,
    (
        SELECT COALESCE(SUM(s.amount_cents), 0)
        FROM subscriptions s
        WHERE s.campaign_id = c.id AND s.status = 'active'
    ) AS monthly_recurring_revenue_cents,
    (
        SELECT COALESCE(SUM(p.net_cents), 0)
        FROM payments p
        WHERE p.campaign_id = c.id AND p.status = 'succeeded'
    ) AS total_net_revenue_cents,
    (
        SELECT COUNT(post.id)
        FROM posts post
        WHERE post.campaign_id = c.id
    ) AS total_posts_count
FROM campaigns c;

CREATE OR REPLACE VIEW patron_feed_view AS
SELECT
    p.id AS post_id,
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
        WHEN p.access_level = 'public' THEN TRUE
        WHEN s.status = 'active' AND p.access_level = 'patrons_only' THEN TRUE
        WHEN s.status = 'active' AND p.access_level = 'tier_only' AND (
            t.amount_cents >= p.min_tier_amount_cents OR
            EXISTS (SELECT 1 FROM post_tier_access pta WHERE pta.post_id = p.id AND pta.tier_id = s.tier_id)
        ) THEN TRUE
        ELSE FALSE
    END AS has_access
FROM posts p
JOIN campaigns c ON p.campaign_id = c.id
LEFT JOIN subscriptions s ON p.campaign_id = s.campaign_id AND s.status = 'active'
LEFT JOIN tiers t ON s.tier_id = t.id;
