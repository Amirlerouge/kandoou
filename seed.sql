-- =============================================================================
-- PATREON CLONE SEED DATA
-- =============================================================================

BEGIN;

-- 1. CATEGORIES
INSERT INTO categories (id, name, slug, description) VALUES
(1, 'Podcasts', 'podcasts', 'Audio shows and talk podcasts'),
(2, 'Gaming', 'gaming', 'Video games, streaming, and esports');

-- 2. USERS
INSERT INTO users (id, email, password_hash, full_name, username, role, is_verified) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@example.com', '$2b$12$e8vE9x1...', 'Platform Admin', 'admin', 'admin', TRUE),
('00000000-0000-0000-0000-000000000002', 'techpodcasts@example.com', '$2b$12$e8vE9x1...', 'Alex Rivera', 'techoverload', 'creator', TRUE),
('00000000-0000-0000-0000-000000000003', 'gamer@example.com', '$2b$12$e8vE9x1...', 'Sam Wilson', 'samplays', 'creator', TRUE),
('00000000-0000-0000-0000-000000000004', 'john.doe@example.com', '$2b$12$e8vE9x1...', 'John Doe', 'johndoe', 'patron', FALSE),
('00000000-0000-0000-0000-000000000005', 'jane.smith@example.com', '$2b$12$e8vE9x1...', 'Jane Smith', 'janesmith', 'patron', FALSE);

-- 3. CAMPAIGNS
INSERT INTO campaigns (id, creator_id, category_id, title, slug, summary, about, creation_name, currency, is_published, published_at) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 1, 'Tech Overload Podcast', 'tech-overload', 'Weekly deep dives into modern tech & AI', 'Welcome to Tech Overload!', 'is creating podcasts', 'USD', TRUE, CURRENT_TIMESTAMP - INTERVAL '30 days');

-- 4. GOALS
INSERT INTO goals (id, campaign_id, title, description, target_amount_cents, reach_by_patrons_count, is_reached) VALUES
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Upgrade Studio Microphones', 'Get high quality audio gear for better listener experience', 50000, NULL, FALSE);

-- 5. TIERS
INSERT INTO tiers (id, campaign_id, title, description, amount_cents, currency, is_active) VALUES
('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Listener Support', 'Access to patron-only posts and community discord', 500, 'USD', TRUE),
('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'VIP Insider', 'Early access to episodes, bonus episodes, and Q&A priority', 1500, 'USD', TRUE);

-- 6. BENEFITS
INSERT INTO benefits (id, campaign_id, title, description) VALUES
('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'Early Access Episodes', 'Listen to new episodes 48 hours before public release'),
('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', 'Exclusive Bonus Episodes', 'Monthly bonus episode only for VIP patrons');

-- 7. TIER BENEFITS
INSERT INTO tier_benefits (tier_id, benefit_id) VALUES
('33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444441'),
('33333333-3333-3333-3333-333333333332', '44444444-4444-4444-4444-444444444441'),
('33333333-3333-3333-3333-333333333332', '44444444-4444-4444-4444-444444444442');

-- 8. SUBSCRIPTIONS
INSERT INTO subscriptions (id, patron_id, campaign_id, tier_id, status, amount_cents, current_period_start, current_period_end) VALUES
('55555555-5555-5555-5555-555555555551', '00000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'active', 1500, CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP + INTERVAL '20 days'),
('55555555-5555-5555-5555-555555555552', '00000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'active', 500, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '25 days');

-- 9. POSTS
INSERT INTO posts (id, campaign_id, author_id, title, slug, content, teaser_text, post_type, access_level, min_tier_amount_cents, published_at) VALUES
('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'Episode 42: The Future of Quantum Computing', 'ep-42-quantum', 'Here is full content for Episode 42 discussing quantum algorithms...', 'Teaser for Episode 42: Quantum breakthroughs in 2026', 'audio', 'tier_only', 500, CURRENT_TIMESTAMP - INTERVAL '2 days'),
('66666666-6666-6666-6666-666666666662', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'Welcome to Tech Overload!', 'welcome-post', 'Public welcome announcement to all fans and followers!', 'Welcome everyone!', 'text', 'public', 0, CURRENT_TIMESTAMP - INTERVAL '15 days');

-- 10. POST TIER ACCESS
INSERT INTO post_tier_access (post_id, tier_id) VALUES
('66666666-6666-6666-6666-666666666661', '33333333-3333-3333-3333-333333333331'),
('66666666-6666-6666-6666-666666666661', '33333333-3333-3333-3333-333333333332');

-- 11. COMMENTS
INSERT INTO comments (id, post_id, user_id, parent_comment_id, content) VALUES
('77777777-7777-7777-7777-777777777771', '66666666-6666-6666-6666-666666666661', '00000000-0000-0000-0000-000000000004', NULL, 'Great episode! Loved the section on error correction.'),
('77777777-7777-7777-7777-777777777772', '66666666-6666-6666-6666-666666666661', '00000000-0000-0000-0000-000000000002', '77777777-7777-7777-7777-777777777771', 'Thanks John! Glad you enjoyed it.');

-- 12. LIKES
INSERT INTO likes (id, user_id, comment_id) VALUES
('88888888-8888-8888-8888-888888888881', '00000000-0000-0000-0000-000000000005', '77777777-7777-7777-7777-777777777771');

-- 13. PAYMENTS
INSERT INTO payments (id, subscription_id, patron_id, campaign_id, amount_cents, fee_cents, net_cents, currency, status, payment_method, transaction_reference) VALUES
('99999999-9999-9999-9999-999999999991', '55555555-5555-5555-5555-555555555551', '00000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 1500, 75, 1425, 'USD', 'succeeded', 'stripe', 'ch_3M1234567890'),
('99999999-9999-9999-9999-999999999992', '55555555-5555-5555-5555-555555555552', '00000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 500, 25, 475, 'USD', 'succeeded', 'stripe', 'ch_3M0987654321');

-- 14. PAYOUTS
INSERT INTO payouts (id, campaign_id, creator_id, amount_cents, currency, status, destination_info, processed_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 1000, 'USD', 'completed', '{"bank": "Chase", "last4": "1234"}', CURRENT_TIMESTAMP - INTERVAL '1 day');

COMMIT;
