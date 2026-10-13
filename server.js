const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'patreon_clone',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432,
});

app.use(express.json());
app.use(express.static(__dirname));

// Utility helper to query DB
const query = (text, params) => pool.query(text, params);

// -----------------------------------------------------------------------------
// REST API ENDPOINTS
// -----------------------------------------------------------------------------

// GET /api/creators - Fetch all active creator campaigns with tiers & analytics
app.get('/api/creators', async (req, res) => {
  try {
    const campaignsRes = await query(`
      SELECT
        c.id AS campaign_id,
        c.creator_id,
        c.title AS campaign_title,
        c.slug AS campaign_slug,
        c.summary,
        c.about,
        c.cover_image_url,
        c.theme,
        u.username,
        u.full_name,
        u.avatar_url,
        u.bio AS user_bio,
        cat.name AS category_name,
        COALESCE(ca.active_patrons_count, 0) AS active_patrons_count,
        COALESCE(ca.monthly_recurring_revenue_cents, 0) AS monthly_recurring_revenue_cents
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN campaign_analytics ca ON c.id = ca.campaign_id
      ORDER BY c.created_at ASC
    `);

    const creators = await Promise.all(
      campaignsRes.rows.map(async (c) => {
        // Fetch tiers for campaign
        const tiersRes = await query(
          `SELECT id, title, description, amount_cents FROM tiers WHERE campaign_id = $1 AND is_active = TRUE ORDER BY amount_cents ASC`,
          [c.campaign_id]
        );

        const tiers = await Promise.all(
          tiersRes.rows.map(async (t) => {
            const benefitsRes = await query(
              `SELECT b.title FROM benefits b JOIN tier_benefits tb ON b.id = tb.benefit_id WHERE tb.tier_id = $1`,
              [t.id]
            );
            return {
              id: t.id,
              name: t.title,
              price: Math.round(t.amount_cents / 100),
              description: t.description || '',
              perks: benefitsRes.rows.map((b) => b.title),
            };
          })
        );

        const theme = c.theme || {
          primaryColor: { r: 255, g: 87, b: 34 },
          accentColor: { r: 255, g: 235, b: 59 },
        };

        return {
          id: c.campaign_id,
          creatorId: c.creator_id,
          handle: c.username,
          displayName: c.campaign_title || c.full_name,
          bio: c.about || c.summary || c.user_bio || '',
          avatarUrl:
            c.avatar_url ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          bannerUrl:
            c.cover_image_url ||
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
          category: c.category_name || 'Digital Art & Music',
          theme,
          subscribersCount: parseInt(c.active_patrons_count, 10),
          monthlyRevenue: Math.round(parseInt(c.monthly_recurring_revenue_cents, 10) / 100),
          tiers,
        };
      })
    );

    res.json(creators);
  } catch (err) {
    console.error('Error in GET /api/creators:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/creators/:id/theme - Update theme and media assets
app.put('/api/creators/:id/theme', async (req, res) => {
  const { id } = req.params;
  const { theme, avatarUrl, bannerUrl } = req.body;

  try {
    const campaignRes = await query(`SELECT id, creator_id FROM campaigns WHERE id = $1`, [id]);
    if (campaignRes.rows.length === 0) {
      return res.status(404).json({ error: 'Creator campaign not found' });
    }

    const campaign = campaignRes.rows[0];

    if (theme) {
      await query(`UPDATE campaigns SET theme = $1 WHERE id = $2`, [JSON.stringify(theme), id]);
    }

    if (bannerUrl) {
      await query(`UPDATE campaigns SET cover_image_url = $1 WHERE id = $2`, [bannerUrl, id]);
    }

    if (avatarUrl) {
      await query(`UPDATE users SET avatar_url = $1 WHERE id = $2`, [avatarUrl, campaign.creator_id]);
    }

    res.json({ success: true, message: 'Theme and profile media updated successfully' });
  } catch (err) {
    console.error('Error in PUT /api/creators/:id/theme:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/posts - Fetch posts across platform or by creatorId
app.get('/api/posts', async (req, res) => {
  const { creatorId } = req.query;

  try {
    let sql = `
      SELECT
        p.id,
        p.campaign_id,
        p.author_id,
        p.title,
        p.content,
        p.teaser_text,
        p.access_level,
        p.published_at,
        p.created_at,
        c.creator_id,
        (SELECT file_url FROM media_attachments WHERE post_id = p.id LIMIT 1) AS image_url,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count
      FROM posts p
      JOIN campaigns c ON p.campaign_id = c.id
    `;
    const params = [];

    if (creatorId) {
      sql += ` WHERE p.campaign_id = $1`;
      params.push(creatorId);
    }

    sql += ` ORDER BY p.published_at DESC`;

    const result = await query(sql, params);

    const posts = result.rows.map((p) => {
      const now = new Date();
      const pubDate = new Date(p.published_at || p.created_at);
      const diffHours = Math.max(1, Math.floor((now - pubDate) / (1000 * 60 * 60)));
      const timeAgo = diffHours < 24 ? `${diffHours} hours ago` : `${Math.floor(diffHours / 24)} days ago`;

      return {
        id: p.id,
        creatorId: p.campaign_id,
        title: p.title,
        content: p.content || p.teaser_text || '',
        imageUrl: p.image_url || null,
        createdAt: timeAgo,
        isExclusive: p.access_level !== 'public',
        likesCount: parseInt(p.likes_count, 10) || 0,
      };
    });

    res.json(posts);
  } catch (err) {
    console.error('Error in GET /api/posts:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/posts - Create a new post in PostgreSQL
app.post('/api/posts', async (req, res) => {
  const { creatorId, title, content, imageUrl, isExclusive } = req.body;

  try {
    const campaignRes = await query(`SELECT creator_id FROM campaigns WHERE id = $1`, [creatorId]);
    if (campaignRes.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const authorId = campaignRes.rows[0].creator_id;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'post-' + Date.now();
    const accessLevel = isExclusive ? 'patrons_only' : 'public';
    const minTierCents = isExclusive ? 500 : 0;

    const postRes = await query(
      `INSERT INTO posts (campaign_id, author_id, title, slug, content, teaser_text, post_type, access_level, min_tier_amount_cents, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'text', $7, $8, NOW())
       RETURNING id, created_at`,
      [creatorId, authorId, title, slug, content, content.slice(0, 100), accessLevel, minTierCents]
    );

    const postId = postRes.rows[0].id;

    if (imageUrl) {
      await query(
        `INSERT INTO media_attachments (post_id, media_type, file_url) VALUES ($1, 'image', $2)`,
        [postId, imageUrl]
      );
    }

    res.json({
      id: postId,
      creatorId,
      title,
      content,
      imageUrl: imageUrl || null,
      createdAt: 'Just now',
      isExclusive: !!isExclusive,
      likesCount: 0,
    });
  } catch (err) {
    console.error('Error in POST /api/posts:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/posts/:id/like - Like a post
app.post('/api/posts/:id/like', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    // Default to John Doe patron if userId not supplied or guest
    let effectiveUserId = userId;
    if (!effectiveUserId || effectiveUserId === 'user-guest') {
      const uRes = await query(`SELECT id FROM users WHERE role = 'patron' LIMIT 1`);
      effectiveUserId = uRes.rows[0]?.id;
    }

    if (!effectiveUserId) {
      return res.status(400).json({ error: 'Valid user required to like post' });
    }

    await query(
      `INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT (user_id, post_id) WHERE post_id IS NOT NULL DO NOTHING`,
      [effectiveUserId, id]
    );

    const countRes = await query(`SELECT COUNT(*) FROM likes WHERE post_id = $1`, [id]);
    res.json({ likesCount: parseInt(countRes.rows[0].count, 10) });
  } catch (err) {
    console.error('Error in POST /api/posts/:id/like:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/creators/onboard - Create creator user, campaign, and tiers
app.post('/api/creators/onboard', async (req, res) => {
  const { name, username, email, displayName, bio, avatarUrl, bannerUrl, theme } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cleanUsername = (username || name.toLowerCase().replace(/\s+/g, '_')).replace(/[^a-zA-Z0-9_]/g, '');
    const cleanEmail = email || `${cleanUsername}@example.com`;

    // 1. Insert user
    const userRes = await client.query(
      `INSERT INTO users (full_name, username, email, password_hash, role, avatar_url, bio, is_verified)
       VALUES ($1, $2, $3, '$2b$12$e8vE9x1...', 'creator', $4, $5, TRUE)
       ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      [name, cleanUsername, cleanEmail, avatarUrl, bio]
    );
    const userId = userRes.rows[0].id;

    const slug = (displayName || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // 2. Insert campaign
    const campaignRes = await client.query(
      `INSERT INTO campaigns (creator_id, title, slug, summary, about, cover_image_url, is_published, theme)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7)
       RETURNING id`,
      [
        userId,
        displayName || `${name} Studios`,
        slug,
        bio.slice(0, 150),
        bio,
        bannerUrl,
        JSON.stringify(theme || { primaryColor: { r: 255, g: 87, b: 34 }, accentColor: { r: 255, g: 235, b: 59 } }),
      ]
    );
    const campaignId = campaignRes.rows[0].id;

    // 3. Insert tier
    const tierRes = await client.query(
      `INSERT INTO tiers (campaign_id, title, description, amount_cents)
       VALUES ($1, 'FOUNDING MEMBER', 'Early access to posts, project updates, and exclusive creator content.', 500)
       RETURNING id`,
      [campaignId]
    );
    const tierId = tierRes.rows[0].id;

    // 4. Insert benefit
    const benefitRes = await client.query(
      `INSERT INTO benefits (campaign_id, title, description) VALUES ($1, 'Founding Member Access', 'Exclusive drops access') RETURNING id`,
      [campaignId]
    );
    await client.query(`INSERT INTO tier_benefits (tier_id, benefit_id) VALUES ($1, $2)`, [
      tierId,
      benefitRes.rows[0].id,
    ]);

    await client.query('COMMIT');

    res.json({
      user: {
        id: userId,
        name,
        username: cleanUsername,
        role: 'creator',
        subscribedCreatorIds: [campaignId],
        creatorProfileId: campaignId,
      },
      campaignId,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in POST /api/creators/onboard:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// POST /api/subscriptions - Subscribe patron to creator campaign
app.post('/api/subscriptions', async (req, res) => {
  const { patronId, campaignId, tierId, price } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Default to John Doe patron if patronId not in DB or is guest
    let effectivePatronId = patronId;
    if (!effectivePatronId || effectivePatronId.startsWith('user-')) {
      const uRes = await client.query(`SELECT id FROM users WHERE role = 'patron' LIMIT 1`);
      effectivePatronId = uRes.rows[0]?.id;
    }

    let targetTierId = tierId;
    if (!targetTierId || targetTierId.startsWith('tier-')) {
      const tRes = await client.query(`SELECT id, amount_cents FROM tiers WHERE campaign_id = $1 LIMIT 1`, [campaignId]);
      targetTierId = tRes.rows[0]?.id;
    }

    const amountCents = (price || 5) * 100;

    const subRes = await client.query(
      `INSERT INTO subscriptions (patron_id, campaign_id, tier_id, status, amount_cents, current_period_start, current_period_end)
       VALUES ($1, $2, $3, 'active', $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days')
       ON CONFLICT (patron_id, campaign_id) DO UPDATE SET status = 'active', tier_id = EXCLUDED.tier_id
       RETURNING id`,
      [effectivePatronId, campaignId, targetTierId, amountCents]
    );

    const subId = subRes.rows[0].id;
    const feeCents = Math.round(amountCents * 0.05);
    const netCents = amountCents - feeCents;

    await client.query(
      `INSERT INTO payments (subscription_id, patron_id, campaign_id, amount_cents, fee_cents, net_cents, currency, status, transaction_reference)
       VALUES ($1, $2, $3, $4, $5, $6, 'USD', 'succeeded', $7)`,
      [subId, effectivePatronId, campaignId, amountCents, feeCents, netCents, 'tx-' + Date.now()]
    );

    await client.query('COMMIT');

    res.json({ success: true, message: 'Subscription and payment created successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in POST /api/subscriptions:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// GET /api/users/:id/subscriptions
app.get('/api/users/:id/subscriptions', async (req, res) => {
  const { id } = req.params;

  try {
    let effectiveUserId = id;
    if (id === 'user-guest' || id.startsWith('user-')) {
      const uRes = await query(`SELECT id FROM users WHERE role = 'patron' LIMIT 1`);
      effectiveUserId = uRes.rows[0]?.id;
    }

    const subsRes = await query(
      `SELECT campaign_id FROM subscriptions WHERE patron_id = $1 AND status = 'active'`,
      [effectiveUserId]
    );

    res.json(subsRes.rows.map((s) => s.campaign_id));
  } catch (err) {
    console.error('Error in GET /api/users/:id/subscriptions:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`BRUTAL.FAN Server running on http://0.0.0.0:${PORT}`);
});
