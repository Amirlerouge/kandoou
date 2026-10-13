-- =============================================================================
-- PATREON CLONE FEATURE QUERIES
-- =============================================================================

-- 1. CREATOR DASHBOARD: MRR & ACTIVE PATRON METRICS
SELECT
    c.id AS campaign_id,
    c.title AS campaign_title,
    COUNT(DISTINCT s.id) AS total_active_patrons,
    COALESCE(SUM(s.amount_cents), 0) / 100.0 AS mrr_usd,
    (
        SELECT COALESCE(SUM(p.net_cents), 0) / 100.0
        FROM payments p
        WHERE p.campaign_id = c.id AND p.status = 'succeeded'
    ) AS lifetime_net_earnings_usd
FROM campaigns c
LEFT JOIN subscriptions s ON c.id = s.campaign_id AND s.status = 'active'
WHERE c.id = '11111111-1111-1111-1111-111111111111'
GROUP BY c.id, c.title;

-- 2. PATRON FEED WITH TIER ACCESS CHECK
SELECT
    p.id AS post_id,
    p.title,
    p.post_type,
    p.access_level,
    p.published_at,
    p.teaser_text,
    CASE
        WHEN p.access_level = 'public' THEN p.content
        WHEN pf.has_access = TRUE THEN p.content
        ELSE NULL
    END AS post_content,
    COALESCE(pf.has_access, FALSE) AS user_has_access
FROM posts p
LEFT JOIN patron_feed_view pf ON p.id = pf.post_id AND pf.patron_id = '00000000-0000-0000-0000-000000000004'
WHERE p.campaign_id = '11111111-1111-1111-1111-111111111111'
ORDER BY p.published_at DESC;

-- 3. CAMPAIGN GOAL PROGRESS ACCORDING TO CURRENT REVENUE
SELECT
    g.id AS goal_id,
    g.title AS goal_title,
    g.target_amount_cents / 100.0 AS target_amount_usd,
    g.reach_by_patrons_count AS target_patrons,
    ca.monthly_recurring_revenue_cents / 100.0 AS current_mrr_usd,
    ca.active_patrons_count AS current_patrons,
    CASE
        WHEN g.target_amount_cents IS NOT NULL THEN
            LEAST(100.0, ROUND((ca.monthly_recurring_revenue_cents::numeric / g.target_amount_cents::numeric) * 100, 2))
        WHEN g.reach_by_patrons_count IS NOT NULL THEN
            LEAST(100.0, ROUND((ca.active_patrons_count::numeric / g.reach_by_patrons_count::numeric) * 100, 2))
    END AS progress_percentage
FROM goals g
JOIN campaign_analytics ca ON g.campaign_id = ca.campaign_id
WHERE g.campaign_id = '11111111-1111-1111-1111-111111111111';

-- 4. THREADED COMMENT TREE WITH LIKES
SELECT
    c.id AS comment_id,
    c.parent_comment_id,
    c.content,
    c.created_at,
    u.username AS author_username,
    u.avatar_url AS author_avatar,
    COUNT(l.id) AS likes_count
FROM comments c
JOIN users u ON c.user_id = u.id
LEFT JOIN likes l ON c.id = l.comment_id
WHERE c.post_id = '66666666-6666-6666-6666-666666666661' AND c.is_deleted = FALSE
GROUP BY c.id, c.parent_comment_id, c.content, c.created_at, u.username, u.avatar_url
ORDER BY c.created_at ASC;

-- 5. CREATOR PAYOUT BALANCE CALCULATION
SELECT
    c.id AS campaign_id,
    COALESCE(SUM(p.net_cents), 0) / 100.0 AS total_net_received_usd,
    COALESCE(
        (SELECT SUM(po.amount_cents) FROM payouts po WHERE po.campaign_id = c.id AND po.status = 'completed'),
        0
    ) / 100.0 AS total_payouts_processed_usd,
    (
        COALESCE(SUM(p.net_cents), 0) -
        COALESCE((SELECT SUM(po.amount_cents) FROM payouts po WHERE po.campaign_id = c.id AND po.status = 'completed'), 0)
    ) / 100.0 AS available_payout_balance_usd
FROM campaigns c
LEFT JOIN payments p ON c.id = p.campaign_id AND p.status = 'succeeded'
WHERE c.id = '11111111-1111-1111-1111-111111111111'
GROUP BY c.id;
