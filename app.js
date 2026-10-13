// Complete App Integration File (app.js) - Synchronized with PostgreSQL DB via REST API

const STORAGE_KEYS = {
  CREATORS: 'brutal_creators_v1',
  POSTS: 'brutal_posts_v1',
  USER: 'brutal_current_user_v1',
};

// Global Application State Store with API Syncing
class Store {
  constructor() {
    this.creators = [];
    this.posts = [];
    this.user = this.loadUser();
    this.activeView = 'explore';
    this.selectedCreatorId = null;
    this.filterCategory = 'ALL';
    this.searchQuery = '';
    this.isLoading = true;
    this.signupTemp = {
      role: 'creator',
      name: '',
      username: '',
      email: '',
      password: '',
    };
  }

  loadUser() {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) {
      const defaultUser = {
        id: 'user-guest',
        name: 'Visitor Guest',
        username: 'guest',
        role: 'guest',
        subscribedCreatorIds: [],
        creatorProfileId: null,
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
      return defaultUser;
    }
    try {
      return JSON.parse(data);
    } catch {
      return {
        id: 'user-guest',
        name: 'Visitor Guest',
        username: 'guest',
        role: 'guest',
        subscribedCreatorIds: [],
        creatorProfileId: null,
      };
    }
  }

  saveUser() {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user));
    window.dispatchEvent(new Event('store-updated'));
  }

  async fetchCreators() {
    try {
      const res = await fetch('/api/creators');
      if (res.ok) {
        this.creators = await res.json();
        if (!this.selectedCreatorId && this.creators.length > 0) {
          this.selectedCreatorId = this.creators[0].id;
        }
      }
    } catch (err) {
      console.error('Failed to fetch creators:', err);
    }
  }

  async fetchPosts() {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        this.posts = await res.json();
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  }

  async fetchUserSubscriptions() {
    if (!this.user || !this.user.id) return;
    try {
      const res = await fetch(`/api/users/${this.user.id}/subscriptions`);
      if (res.ok) {
        this.user.subscribedCreatorIds = await res.json();
        this.saveUser();
      }
    } catch (err) {
      console.error('Failed to fetch user subscriptions:', err);
    }
  }

  async init() {
    this.isLoading = true;
    await Promise.all([this.fetchCreators(), this.fetchPosts(), this.fetchUserSubscriptions()]);
    this.isLoading = false;
    renderApp();
  }

  getCreator(id) {
    return this.creators.find((c) => c.id === id) || this.creators[0] || null;
  }

  getPostsByCreator(creatorId) {
    return this.posts.filter((p) => p.creatorId === creatorId);
  }

  async updateCreatorThemeAndMedia(creatorId, theme, avatarUrl, bannerUrl) {
    try {
      const res = await fetch(`/api/creators/${creatorId}/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, avatarUrl, bannerUrl }),
      });
      if (res.ok) {
        await this.fetchCreators();
        renderApp();
      }
    } catch (err) {
      console.error('Failed to update theme:', err);
    }
  }

  async addPost(postData) {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (res.ok) {
        const newPost = await res.json();
        this.posts.unshift(newPost);
        await this.fetchCreators();
        renderApp();
      }
    } catch (err) {
      console.error('Failed to add post:', err);
    }
  }

  async subscribeToCreator(creatorId, tierId, price) {
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patronId: this.user.id,
          campaignId: creatorId,
          tierId,
          price,
        }),
      });
      if (res.ok) {
        if (!this.user.subscribedCreatorIds.includes(creatorId)) {
          this.user.subscribedCreatorIds.push(creatorId);
          this.saveUser();
        }
        await Promise.all([this.fetchCreators(), this.fetchPosts()]);
        renderApp();
      }
    } catch (err) {
      console.error('Failed to subscribe:', err);
    }
  }

  async likePost(postId) {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.user.id }),
      });
      if (res.ok) {
        const data = await res.json();
        const post = this.posts.find((p) => p.id === postId);
        if (post) {
          post.likesCount = data.likesCount;
          renderApp();
        }
      }
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  }

  async onboardCreator(creatorData) {
    try {
      const res = await fetch('/api/creators/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.signupTemp.name,
          username: this.signupTemp.username,
          email: this.signupTemp.email,
          displayName: creatorData.displayName,
          bio: creatorData.bio,
          avatarUrl: creatorData.avatarUrl,
          bannerUrl: creatorData.bannerUrl,
          theme: creatorData.theme,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        this.user = data.user;
        this.selectedCreatorId = data.campaignId;
        this.activeView = 'creator-studio';
        this.saveUser();
        await Promise.all([this.fetchCreators(), this.fetchPosts()]);
        closeModal();
        renderApp();
      }
    } catch (err) {
      console.error('Failed to onboard creator:', err);
    }
  }
}

const store = new Store();

// Modal Management
function openModal(htmlContent) {
  const overlay = document.getElementById('global-modal-overlay');
  const container = document.getElementById('modal-content');
  container.innerHTML = htmlContent;
  overlay.classList.add('active');
}

function closeModal() {
  const overlay = document.getElementById('global-modal-overlay');
  overlay.classList.remove('active');
}

document.getElementById('modal-close-btn').addEventListener('click', closeModal);

// Modal Signup Step 1: Role Selection
function showRoleSelectionModal() {
  const html = `
    <div style="text-align: center; margin-bottom: 1.2rem;">
      <span class="brutal-badge brutal-badge-black" style="font-size: 0.85rem;">JOIN BRUTAL.FAN</span>
      <h2 style="font-size: 1.5rem; margin-top: 0.4rem;">SELECT ACCOUNT TYPE</h2>
      <p style="font-size: 0.85rem; margin-top: 0.2rem;">Choose how you want to interact with the platform.</p>
    </div>

    <div class="step-indicator">
      <div class="step-pill active"></div>
      <div class="step-pill"></div>
      <div class="step-pill"></div>
    </div>

    <div class="grid-2" style="margin-bottom: 1.2rem;">
      <div class="brutal-card brutal-card-interactive" id="role-card-creator" style="border-width: 3px; border-color: #000; text-align: left;">
        <div style="font-size: 1.8rem; margin-bottom: 0.3rem;">🎨</div>
        <h3 style="font-size: 1.2rem;">CREATOR</h3>
        <p style="font-size: 0.8rem; margin-top: 0.4rem; color: #444;">
          Publish posts, create subscription tiers, and <strong>custom RGB theme colorize</strong> your entire home page.
        </p>
      </div>

      <div class="brutal-card brutal-card-interactive" id="role-card-subscriber" style="border-width: 3px; text-align: left;">
        <div style="font-size: 1.8rem; margin-bottom: 0.3rem;">⚡</div>
        <h3 style="font-size: 1.2rem;">SUBSCRIBER</h3>
        <p style="font-size: 0.8rem; margin-top: 0.4rem; color: #444;">
          Discover top creators, unlock exclusive audio & visual drops, and support creators.
        </p>
      </div>
    </div>

    <button id="btn-role-next" class="brutal-btn brutal-btn-black" style="width: 100%;">
      CONTINUE &rarr;
    </button>
  `;

  openModal(html);

  let selectedRole = 'creator';
  const creatorCard = document.getElementById('role-card-creator');
  const subscriberCard = document.getElementById('role-card-subscriber');

  creatorCard.style.backgroundColor = '#f0f0f0';

  creatorCard.addEventListener('click', () => {
    selectedRole = 'creator';
    creatorCard.style.backgroundColor = '#f0f0f0';
    subscriberCard.style.backgroundColor = '#ffffff';
  });

  subscriberCard.addEventListener('click', () => {
    selectedRole = 'subscriber';
    subscriberCard.style.backgroundColor = '#f0f0f0';
    creatorCard.style.backgroundColor = '#ffffff';
  });

  document.getElementById('btn-role-next').addEventListener('click', () => {
    store.signupTemp.role = selectedRole;
    showCredentialFormModal();
  });
}

// Modal Signup Step 2: Credentials Form
function showCredentialFormModal() {
  const html = `
    <div style="text-align: center; margin-bottom: 1.2rem;">
      <span class="brutal-badge brutal-badge-black">STEP 2 OF 3</span>
      <h2 style="font-size: 1.5rem; margin-top: 0.4rem;">CREATE YOUR CREDENTIALS</h2>
      <p style="font-size: 0.85rem; margin-top: 0.2rem;">Account Type: <strong>${store.signupTemp.role.toUpperCase()}</strong></p>
    </div>

    <div class="step-indicator">
      <div class="step-pill active"></div>
      <div class="step-pill active"></div>
      <div class="step-pill"></div>
    </div>

    <form id="signup-credentials-form" style="display: flex; flex-direction: column; gap: 0.8rem;">
      <div>
        <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">FULL NAME</label>
        <input type="text" id="input-signup-name" class="brutal-input" placeholder="e.g. Jordan Vance" required value="${store.signupTemp.name}">
      </div>

      <div>
        <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">USERNAME / HANDLE</label>
        <input type="text" id="input-signup-username" class="brutal-input" placeholder="e.g. jordan_v" required value="${store.signupTemp.username}">
      </div>

      <div>
        <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">EMAIL ADDRESS</label>
        <input type="email" id="input-signup-email" class="brutal-input" placeholder="jordan@example.com" required value="${store.signupTemp.email}">
      </div>

      <div>
        <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">PASSWORD</label>
        <input type="password" id="input-signup-password" class="brutal-input" placeholder="••••••••" required value="password123">
      </div>

      <div style="display: flex; gap: 0.8rem; margin-top: 0.5rem; flex-wrap: wrap;">
        <button type="button" id="btn-signup-back" class="brutal-btn" style="flex: 1; min-width: 100px;">&larr; BACK</button>
        <button type="submit" class="brutal-btn brutal-btn-black" style="flex: 2; min-width: 140px;">NEXT STEP &rarr;</button>
      </div>
    </form>
  `;

  openModal(html);

  document.getElementById('btn-signup-back').addEventListener('click', showRoleSelectionModal);

  document.getElementById('signup-credentials-form').addEventListener('submit', (e) => {
    e.preventDefault();
    store.signupTemp.name = document.getElementById('input-signup-name').value;
    store.signupTemp.username = document.getElementById('input-signup-username').value.toLowerCase().replace(/\s+/g, '_');
    store.signupTemp.email = document.getElementById('input-signup-email').value;

    if (store.signupTemp.role === 'creator') {
      showCreatorOnboardingModal();
    } else {
      showSubscriberOnboardingModal();
    }
  });
}

// Creator Onboarding Step 3 with Live RGB Customizer
function showCreatorOnboardingModal() {
  const defaultPrimary = { r: 255, g: 87, b: 34 };
  const defaultAccent = { r: 255, g: 235, b: 59 };

  let currentPrimary = { ...defaultPrimary };
  let currentAccent = { ...defaultAccent };

  const html = `
    <div style="text-align: center; margin-bottom: 1rem;">
      <span class="brutal-badge brutal-badge-black">STEP 3 OF 3: CREATOR SETUP</span>
      <h2 style="font-size: 1.4rem; margin-top: 0.4rem;">CUSTOMIZE YOUR CREATOR BRAND</h2>
      <p style="font-size: 0.8rem; margin-top: 0.2rem;">Set profile image, cover banner, and live RGB theme colors!</p>
    </div>

    <div class="step-indicator">
      <div class="step-pill active"></div>
      <div class="step-pill active"></div>
      <div class="step-pill active"></div>
    </div>

    <form id="creator-onboarding-form" style="display: flex; flex-direction: column; gap: 0.8rem;">
      <div>
        <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">CREATOR BRAND NAME</label>
        <input type="text" id="creator-display-name" class="brutal-input" value="${store.signupTemp.name || 'Digital Creator'} Studios" required>
      </div>

      <div>
        <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">BIO / DESCRIPTION</label>
        <textarea id="creator-bio" class="brutal-textarea" style="height: 50px;" required>Creator producing high-contrast digital artifacts and exclusive drops.</textarea>
      </div>

      <div class="grid-2">
        <div>
          <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">PROFILE AVATAR URL</label>
          <input type="url" id="creator-avatar-url" class="brutal-input" value="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80">
        </div>
        <div>
          <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">BANNER COVER URL</label>
          <input type="url" id="creator-banner-url" class="brutal-input" value="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80">
        </div>
      </div>

      <!-- Live RGB Color Control Suite -->
      <div style="border: 3px solid #000; padding: 0.8rem; background: #fafafa; box-shadow: 3px 3px 0px #000;">
        <h3 style="font-size: 1rem; margin-bottom: 0.6rem;">🎨 LIVE RGB THEME COLOR PICKERS</h3>

        <div class="grid-2">
          <!-- Primary RGB Picker -->
          <div>
            <h4 style="font-size: 0.85rem; margin-bottom: 0.4rem;">PRIMARY COLOR (RGB)</h4>
            <div class="rgb-slider-group">
              <div class="rgb-slider-header"><span>RED</span><span id="txt-pr">255</span></div>
              <input type="range" min="0" max="255" value="255" id="slider-pr" class="rgb-slider rgb-slider-red">
            </div>
            <div class="rgb-slider-group">
              <div class="rgb-slider-header"><span>GREEN</span><span id="txt-pg">87</span></div>
              <input type="range" min="0" max="255" value="87" id="slider-pg" class="rgb-slider rgb-slider-green">
            </div>
            <div class="rgb-slider-group">
              <div class="rgb-slider-header"><span>BLUE</span><span id="txt-pb">34</span></div>
              <input type="range" min="0" max="255" value="34" id="slider-pb" class="rgb-slider rgb-slider-blue">
            </div>
            <div id="preview-primary-box" class="rgb-preview-box" style="background-color: rgb(255, 87, 34);">
              PRIMARY COLOR
            </div>
          </div>

          <!-- Accent RGB Picker -->
          <div>
            <h4 style="font-size: 0.85rem; margin-bottom: 0.4rem;">ACCENT COLOR (RGB)</h4>
            <div class="rgb-slider-group">
              <div class="rgb-slider-header"><span>RED</span><span id="txt-ar">255</span></div>
              <input type="range" min="0" max="255" value="255" id="slider-ar" class="rgb-slider rgb-slider-red">
            </div>
            <div class="rgb-slider-group">
              <div class="rgb-slider-header"><span>GREEN</span><span id="txt-ag">235</span></div>
              <input type="range" min="0" max="255" value="235" id="slider-ag" class="rgb-slider rgb-slider-green">
            </div>
            <div class="rgb-slider-group">
              <div class="rgb-slider-header"><span>BLUE</span><span id="txt-ab">59</span></div>
              <input type="range" min="0" max="255" value="59" id="slider-ab" class="rgb-slider rgb-slider-blue">
            </div>
            <div id="preview-accent-box" class="rgb-preview-box" style="background-color: rgb(255, 235, 59);">
              ACCENT COLOR
            </div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 0.8rem; margin-top: 0.5rem; flex-wrap: wrap;">
        <button type="button" id="btn-creator-onboarding-back" class="brutal-btn" style="flex: 1; min-width: 100px;">&larr; BACK</button>
        <button type="submit" class="brutal-btn brutal-btn-black" style="flex: 2; min-width: 160px;">LAUNCH CREATOR PAGE 🎉</button>
      </div>
    </form>
  `;

  openModal(html);

  document.getElementById('btn-creator-onboarding-back').addEventListener('click', showCredentialFormModal);

  const updateRGBPreviews = () => {
    currentPrimary.r = parseInt(document.getElementById('slider-pr').value);
    currentPrimary.g = parseInt(document.getElementById('slider-pg').value);
    currentPrimary.b = parseInt(document.getElementById('slider-pb').value);

    currentAccent.r = parseInt(document.getElementById('slider-ar').value);
    currentAccent.g = parseInt(document.getElementById('slider-ag').value);
    currentAccent.b = parseInt(document.getElementById('slider-ab').value);

    document.getElementById('txt-pr').textContent = currentPrimary.r;
    document.getElementById('txt-pg').textContent = currentPrimary.g;
    document.getElementById('txt-pb').textContent = currentPrimary.b;

    document.getElementById('txt-ar').textContent = currentAccent.r;
    document.getElementById('txt-ag').textContent = currentAccent.g;
    document.getElementById('txt-ab').textContent = currentAccent.b;

    document.getElementById('preview-primary-box').style.backgroundColor = `rgb(${currentPrimary.r}, ${currentPrimary.g}, ${currentPrimary.b})`;
    document.getElementById('preview-accent-box').style.backgroundColor = `rgb(${currentAccent.r}, ${currentAccent.g}, ${currentAccent.b})`;
  };

  ['pr', 'pg', 'pb', 'ar', 'ag', 'ab'].forEach((id) => {
    document.getElementById(`slider-${id}`).addEventListener('input', updateRGBPreviews);
  });

  document.getElementById('creator-onboarding-form').addEventListener('submit', (e) => {
    e.preventDefault();

    store.onboardCreator({
      displayName: document.getElementById('creator-display-name').value,
      bio: document.getElementById('creator-bio').value,
      avatarUrl: document.getElementById('creator-avatar-url').value,
      bannerUrl: document.getElementById('creator-banner-url').value,
      theme: {
        primaryColor: currentPrimary,
        accentColor: currentAccent,
      },
    });
  });
}

// Subscriber Onboarding Step 3
function showSubscriberOnboardingModal() {
  const html = `
    <div style="text-align: center; margin-bottom: 1.2rem;">
      <span class="brutal-badge brutal-badge-black">STEP 3 OF 3: INTERESTS</span>
      <h2 style="font-size: 1.5rem; margin-top: 0.4rem;">WHAT DO YOU WANT TO EXPLORE?</h2>
      <p style="font-size: 0.85rem; margin-top: 0.2rem;">Select topics to personalize your feed.</p>
    </div>

    <div class="step-indicator">
      <div class="step-pill active"></div>
      <div class="step-pill active"></div>
      <div class="step-pill active"></div>
    </div>

    <form id="subscriber-onboarding-form" style="display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        <label class="brutal-badge brutal-card-interactive" style="padding: 0.5rem 0.8rem; cursor: pointer;">
          <input type="checkbox" value="Digital Art & Music" checked style="margin-right: 0.3rem;"> 🎨 Digital Art & Music
        </label>
        <label class="brutal-badge brutal-card-interactive" style="padding: 0.5rem 0.8rem; cursor: pointer;">
          <input type="checkbox" value="Architecture & Design" checked style="margin-right: 0.3rem;"> 🏛️ Architecture & Design
        </label>
        <label class="brutal-badge brutal-card-interactive" style="padding: 0.5rem 0.8rem; cursor: pointer;">
          <input type="checkbox" value="Tech & Code" checked style="margin-right: 0.3rem;"> 💻 Tech & Code
        </label>
      </div>

      <div style="border: 3px solid #000; padding: 0.8rem; background: #fff;">
        <h4 style="font-size: 0.9rem; margin-bottom: 0.6rem;">RECOMMENDED CREATORS FOR YOU</h4>

        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
          ${store.creators
            .map(
              (c) => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.4rem; border: 2px solid #000; background: #f9f9f9; flex-wrap: wrap; gap: 0.4rem;">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <img src="${c.avatarUrl}" style="width: 36px; height: 36px; border: 2px solid #000; object-fit: cover;">
                <div>
                  <strong style="display: block; font-size: 0.85rem;">${c.displayName}</strong>
                  <span style="font-size: 0.7rem; color: #555;">@${c.handle} • ${c.category}</span>
                </div>
              </div>
              <label style="font-size: 0.75rem; font-weight: 800; cursor: pointer;">
                <input type="checkbox" name="sub-creator" value="${c.id}" checked> FOLLOW
              </label>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <div style="display: flex; gap: 0.8rem; margin-top: 0.5rem; flex-wrap: wrap;">
        <button type="button" id="btn-sub-onboarding-back" class="brutal-btn" style="flex: 1; min-width: 100px;">&larr; BACK</button>
        <button type="submit" class="brutal-btn brutal-btn-black" style="flex: 2; min-width: 140px;">ENTER PLATFORM 🚀</button>
      </div>
    </form>
  `;

  openModal(html);

  document.getElementById('btn-sub-onboarding-back').addEventListener('click', showCredentialFormModal);

  document.getElementById('subscriber-onboarding-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedCreators = Array.from(document.querySelectorAll('input[name="sub-creator"]:checked')).map(
      (cb) => cb.value
    );

    store.user = {
      id: '00000000-0000-0000-0000-000000000004', // John Doe patron ID
      name: store.signupTemp.name || 'John Doe',
      username: store.signupTemp.username || 'johndoe',
      role: 'subscriber',
      subscribedCreatorIds: selectedCreators,
      creatorProfileId: null,
    };

    store.activeView = 'feed';
    store.saveUser();

    for (const cId of selectedCreators) {
      await store.subscribeToCreator(cId, null, 5);
    }

    closeModal();
    renderApp();
  });
}

// Creator Studio Metrics & Post Creation Component
function renderCreatorStudioMetricsAndPostTool(creator) {
  if (!creator) {
    return `<div class="brutal-card"><h3>No creator profile found</h3></div>`;
  }

  const posts = store.getPostsByCreator(creator.id);

  return `
    <div style="margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
        <div>
          <span class="brutal-badge brutal-badge-black">CREATOR DASHBOARD</span>
          <h1 style="font-size: 2rem; margin-top: 0.2rem;">${creator.displayName}</h1>
          <p style="font-size: 0.9rem; color: #555;">Manage metrics, publish exclusive posts, and customize your RGB theme.</p>
        </div>
        <button id="btn-view-public-page" class="brutal-btn brutal-btn-creator">
          PREVIEW PUBLIC PAGE ↗
        </button>
      </div>

      <!-- Metrics Cards Grid -->
      <div class="grid-3" style="margin-bottom: 2rem;">
        <div class="brutal-card" style="border-width: 3px; background: #ffffff;">
          <span style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #666;">ACTIVE SUBSCRIBERS</span>
          <div style="font-size: 2.2rem; font-weight: 900; margin-top: 0.2rem;">${creator.subscribersCount}</div>
          <span class="brutal-badge brutal-badge-accent" style="margin-top: 0.5rem;">DB SYNCED</span>
        </div>

        <div class="brutal-card" style="border-width: 3px; background: #ffffff;">
          <span style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #666;">ESTIMATED MONTHLY REVENUE</span>
          <div style="font-size: 2.2rem; font-weight: 900; margin-top: 0.2rem;">$${creator.monthlyRevenue}</div>
          <span class="brutal-badge brutal-badge-creator" style="margin-top: 0.5rem;">${creator.tiers.length} TIERS ACTIVE</span>
        </div>

        <div class="brutal-card" style="border-width: 3px; background: #ffffff;">
          <span style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #666;">PUBLISHED POSTS</span>
          <div style="font-size: 2.2rem; font-weight: 900; margin-top: 0.2rem;">${posts.length}</div>
          <span class="brutal-badge brutal-badge-black" style="margin-top: 0.5rem;">${posts.filter((p) => p.isExclusive).length} EXCLUSIVE DROPS</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="brutal-tabs">
        <button class="brutal-tab active" id="tab-btn-posts">POST MANAGEMENT</button>
        <button class="brutal-tab" id="tab-btn-theme">RGB THEME CUSTOMIZER</button>
      </div>

      <div id="studio-main-area">
        <div class="grid-main-side">
          <div>
            <h3 style="font-size: 1.2rem; margin-bottom: 1rem;">PUBLISHED CONTENT FEED</h3>
            ${
              posts.length === 0
                ? '<p>No posts published yet.</p>'
                : posts
                    .map(
                      (p) => `
              <div class="brutal-card" style="margin-bottom: 1.2rem; border-width: 3px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                  <h4 style="font-size: 1.05rem;">${p.title}</h4>
                  ${p.isExclusive ? '<span class="brutal-badge brutal-badge-accent">🔒 EXCLUSIVE</span>' : '<span class="brutal-badge">PUBLIC</span>'}
                </div>
                <p style="font-size: 0.9rem; margin-bottom: 0.8rem;">${p.content}</p>
                ${p.imageUrl ? `<img src="${p.imageUrl}" style="width: 100%; max-height: 250px; object-fit: cover; border: 2px solid #000; margin-bottom: 0.8rem;">` : ''}
                <div style="font-size: 0.8rem; font-weight: 700; color: #666; display: flex; gap: 1rem;">
                  <span>🕒 ${p.createdAt}</span>
                  <span>❤️ ${p.likesCount} Likes</span>
                </div>
              </div>
            `
                    )
                    .join('')
            }
          </div>

          <!-- New Post Creator Form -->
          <div>
            <div class="brutal-card" style="border-width: 3px; background: #fafafa;">
              <h3 style="font-size: 1.2rem; margin-bottom: 1rem;">✏️ CREATE NEW POST</h3>

              <form id="studio-create-post-form" style="display: flex; flex-direction: column; gap: 0.8rem;">
                <div>
                  <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">POST TITLE</label>
                  <input type="text" id="post-title" class="brutal-input" placeholder="e.g. Exclusive Synth Stem Pack #04" required>
                </div>

                <div>
                  <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">CONTENT / MESSAGE</label>
                  <textarea id="post-content" class="brutal-textarea" style="height: 80px;" placeholder="Write your post content here..." required></textarea>
                </div>

                <div>
                  <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">MEDIA IMAGE URL (OPTIONAL)</label>
                  <input type="url" id="post-image-url" class="brutal-input" placeholder="https://images.unsplash.com/...">
                </div>

                <div>
                  <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">VISIBILITY PERMISSION</label>
                  <select id="post-visibility" class="brutal-select">
                    <option value="public">🌐 PUBLIC (Everyone can view)</option>
                    <option value="exclusive">🔒 EXCLUSIVE (Subscribers only)</option>
                  </select>
                </div>

                <button type="submit" class="brutal-btn brutal-btn-black" style="margin-top: 0.4rem;">
                  PUBLISH DROP NOW 🚀
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Creator Live RGB Theme Studio Controls Component
function renderRGBThemeStudioControls(creator) {
  const theme = creator.theme;

  return `
    <div class="brutal-card" style="border-width: 3px; background: #ffffff; margin-top: 0.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <span class="brutal-badge brutal-badge-black">RGB COLOR ENGINE</span>
          <h2 style="font-size: 1.4rem; margin-top: 0.2rem;">LIVE RGB THEME CUSTOMIZER</h2>
        </div>
        <button id="btn-save-rgb-theme" class="brutal-btn brutal-btn-creator">
          💾 SAVE CHANGES
        </button>
      </div>

      <p style="font-size: 0.85rem; margin-bottom: 1.2rem;">
        Adjust RGB color sliders to immediately change primary and accent colors across your public profile, buttons, borders, and badges.
      </p>

      <div class="grid-2" style="margin-bottom: 1.2rem;">
        <!-- Primary RGB Controls -->
        <div style="border: 3px solid #000; padding: 0.8rem; background: #fafafa; box-shadow: 3px 3px 0px #000;">
          <h3 style="font-size: 1rem; margin-bottom: 0.6rem;">PRIMARY RGB COLOR</h3>

          <div class="rgb-slider-group">
            <div class="rgb-slider-header"><span>RED</span><span id="studio-txt-pr">${theme.primaryColor.r}</span></div>
            <input type="range" min="0" max="255" value="${theme.primaryColor.r}" id="studio-slider-pr" class="rgb-slider rgb-slider-red">
          </div>

          <div class="rgb-slider-group">
            <div class="rgb-slider-header"><span>GREEN</span><span id="studio-txt-pg">${theme.primaryColor.g}</span></div>
            <input type="range" min="0" max="255" value="${theme.primaryColor.g}" id="studio-slider-pg" class="rgb-slider rgb-slider-green">
          </div>

          <div class="rgb-slider-group">
            <div class="rgb-slider-header"><span>BLUE</span><span id="studio-txt-pb">${theme.primaryColor.b}</span></div>
            <input type="range" min="0" max="255" value="${theme.primaryColor.b}" id="studio-slider-pb" class="rgb-slider rgb-slider-blue">
          </div>

          <div id="studio-preview-primary-box" class="rgb-preview-box" style="background-color: rgb(${theme.primaryColor.r}, ${theme.primaryColor.g}, ${theme.primaryColor.b});">
            PRIMARY PREVIEW
          </div>
        </div>

        <!-- Accent RGB Controls -->
        <div style="border: 3px solid #000; padding: 0.8rem; background: #fafafa; box-shadow: 3px 3px 0px #000;">
          <h3 style="font-size: 1rem; margin-bottom: 0.6rem;">ACCENT RGB COLOR</h3>

          <div class="rgb-slider-group">
            <div class="rgb-slider-header"><span>RED</span><span id="studio-txt-ar">${theme.accentColor.r}</span></div>
            <input type="range" min="0" max="255" value="${theme.accentColor.r}" id="studio-slider-ar" class="rgb-slider rgb-slider-red">
          </div>

          <div class="rgb-slider-group">
            <div class="rgb-slider-header"><span>GREEN</span><span id="studio-txt-ag">${theme.accentColor.g}</span></div>
            <input type="range" min="0" max="255" value="${theme.accentColor.g}" id="studio-slider-ag" class="rgb-slider rgb-slider-green">
          </div>

          <div class="rgb-slider-group">
            <div class="rgb-slider-header"><span>BLUE</span><span id="studio-txt-ab">${theme.accentColor.b}</span></div>
            <input type="range" min="0" max="255" value="${theme.accentColor.b}" id="studio-slider-ab" class="rgb-slider rgb-slider-blue">
          </div>

          <div id="studio-preview-accent-box" class="rgb-preview-box" style="background-color: rgb(${theme.accentColor.r}, ${theme.accentColor.g}, ${theme.accentColor.b});">
            ACCENT PREVIEW
          </div>
        </div>
      </div>

      <!-- Media Assets Customizer -->
      <div style="border: 3px solid #000; padding: 0.8rem; background: #fafafa; box-shadow: 3px 3px 0px #000;">
        <h3 style="font-size: 1rem; margin-bottom: 0.6rem;">🖼️ PROFILE & COVER BANNER IMAGES</h3>

        <div class="grid-2">
          <div>
            <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">PROFILE AVATAR IMAGE URL</label>
            <input type="url" id="studio-avatar-url" class="brutal-input" value="${creator.avatarUrl}">
          </div>

          <div>
            <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">BANNER COVER IMAGE URL</label>
            <input type="url" id="studio-banner-url" class="brutal-input" value="${creator.bannerUrl}">
          </div>
        </div>
      </div>
    </div>
  `;
}

function attachRGBStudioListeners(creator) {
  const ids = ['pr', 'pg', 'pb', 'ar', 'ag', 'ab'];

  const updateLiveVarsAndPreview = () => {
    const pr = document.getElementById('studio-slider-pr')?.value;
    const pg = document.getElementById('studio-slider-pg')?.value;
    const pb = document.getElementById('studio-slider-pb')?.value;

    const ar = document.getElementById('studio-slider-ar')?.value;
    const ag = document.getElementById('studio-slider-ag')?.value;
    const ab = document.getElementById('studio-slider-ab')?.value;

    if (!pr) return;

    document.getElementById('studio-txt-pr').textContent = pr;
    document.getElementById('studio-txt-pg').textContent = pg;
    document.getElementById('studio-txt-pb').textContent = pb;

    document.getElementById('studio-txt-ar').textContent = ar;
    document.getElementById('studio-txt-ag').textContent = ag;
    document.getElementById('studio-txt-ab').textContent = ab;

    document.getElementById('studio-preview-primary-box').style.backgroundColor = `rgb(${pr}, ${pg}, ${pb})`;
    document.getElementById('studio-preview-accent-box').style.backgroundColor = `rgb(${ar}, ${ag}, ${ab})`;

    document.documentElement.style.setProperty('--creator-r', pr);
    document.documentElement.style.setProperty('--creator-g', pg);
    document.documentElement.style.setProperty('--creator-b', pb);

    document.documentElement.style.setProperty('--accent-r', ar);
    document.documentElement.style.setProperty('--accent-g', ag);
    document.documentElement.style.setProperty('--accent-b', ab);
  };

  ids.forEach((id) => {
    const elem = document.getElementById(`studio-slider-${id}`);
    if (elem) elem.addEventListener('input', updateLiveVarsAndPreview);
  });

  const saveBtn = document.getElementById('btn-save-rgb-theme');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const pr = parseInt(document.getElementById('studio-slider-pr').value);
      const pg = parseInt(document.getElementById('studio-slider-pg').value);
      const pb = parseInt(document.getElementById('studio-slider-pb').value);

      const ar = parseInt(document.getElementById('studio-slider-ar').value);
      const ag = parseInt(document.getElementById('studio-slider-ag').value);
      const ab = parseInt(document.getElementById('studio-slider-ab').value);

      const avatarUrl = document.getElementById('studio-avatar-url').value;
      const bannerUrl = document.getElementById('studio-banner-url').value;

      await store.updateCreatorThemeAndMedia(
        creator.id,
        {
          primaryColor: { r: pr, g: pg, b: pb },
          accentColor: { r: ar, g: ag, b: ab },
        },
        avatarUrl,
        bannerUrl
      );

      alert('RGB Theme and Media Assets synced to Database!');
    });
  }
}

// Creator Public Profile Page Renderer
function renderCreatorPublicProfilePage(creator) {
  if (!creator) return `<div class="brutal-card"><p>Creator not found.</p></div>`;

  document.documentElement.style.setProperty('--creator-r', creator.theme.primaryColor.r);
  document.documentElement.style.setProperty('--creator-g', creator.theme.primaryColor.g);
  document.documentElement.style.setProperty('--creator-b', creator.theme.primaryColor.b);

  document.documentElement.style.setProperty('--accent-r', creator.theme.accentColor.r);
  document.documentElement.style.setProperty('--accent-g', creator.theme.accentColor.g);
  document.documentElement.style.setProperty('--accent-b', creator.theme.accentColor.b);

  const posts = store.getPostsByCreator(creator.id);
  const isSubscribed = store.user.subscribedCreatorIds.includes(creator.id);

  return `
    <div>
      <div class="creator-banner" style="background-image: url('${creator.bannerUrl}');">
        <div style="position: absolute; bottom: 8px; right: 8px;">
          <span class="brutal-badge brutal-badge-creator">RGB THEME ACTIVE</span>
        </div>
      </div>

      <div class="creator-avatar-container">
        <img src="${creator.avatarUrl}" class="creator-avatar">
        <div style="flex: 1; padding-bottom: 0.2rem;">
          <h1 style="font-size: 1.8rem; display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            ${creator.displayName}
            <span class="brutal-badge brutal-badge-accent">VERIFIED CREATOR</span>
          </h1>
          <p style="font-weight: 700; font-size: 0.9rem; color: #444;">@${creator.handle} • ${creator.category}</p>
        </div>
        <div>
          ${
            isSubscribed
              ? `
            <button class="brutal-btn brutal-btn-black" disabled style="opacity: 0.9;">✓ SUBSCRIBED</button>
          `
              : `
            <button class="brutal-btn brutal-btn-creator" id="btn-subscribe-header">
              ⚡ SUBSCRIBE ($${creator.tiers[0]?.price || 5}/MO)
            </button>
          `
          }
        </div>
      </div>

      <div class="brutal-card creator-theme-soft-bg" style="margin-bottom: 1.5rem; border-width: 3px;">
        <p style="font-size: 1rem; font-weight: 600; margin-bottom: 0.8rem;">${creator.bio}</p>
        <div style="display: flex; gap: 1.5rem; font-weight: 800; font-size: 0.85rem; flex-wrap: wrap;">
          <div><span style="font-size: 1.1rem;">${creator.subscribersCount}</span> SUBSCRIBERS</div>
          <div><span style="font-size: 1.1rem;">${posts.length}</span> POSTS DROPPED</div>
          <div><span style="font-size: 1.1rem;">${creator.tiers.length}</span> MEMBERSHIP TIERS</div>
        </div>
      </div>

      <div class="grid-main-side">
        <div>
          <h3 style="font-size: 1.3rem; margin-bottom: 1rem; border-bottom: 3px solid #000; padding-bottom: 0.3rem;">
            🔥 CREATOR FEED
          </h3>

          ${posts.length === 0 ? '<div class="brutal-card"><p>No posts published by this creator yet.</p></div>' : ''}

          ${posts
            .map((p) => {
              if (p.isExclusive && !isSubscribed) {
                return `
                <div class="post-locked-card" style="margin-bottom: 1.2rem;">
                  <span class="brutal-badge brutal-badge-accent" style="margin-bottom: 0.8rem;">🔒 EXCLUSIVE SUBSCRIBER DROP</span>
                  <h3 style="font-size: 1.3rem; color: #fff; margin-bottom: 0.4rem;">${p.title}</h3>
                  <p style="color: #ccc; max-width: 500px; margin: 0 auto 1.2rem auto; font-size: 0.85rem;">
                    This drop contains exclusive synth stems, audio files, or architectural MONOGRAPHS reserved for subscribers.
                  </p>
                  <button class="brutal-btn brutal-btn-creator btn-unlock-paywall" data-creator="${creator.id}">
                    UNLOCK THIS CONTENT ($${creator.tiers[0]?.price || 5}/MO) &rarr;
                  </button>
                </div>
              `;
              }

              return `
              <div class="brutal-card" style="margin-bottom: 1.2rem; border-width: 3px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.4rem;">
                  <div>
                    <h3 style="font-size: 1.2rem;">${p.title}</h3>
                    <span style="font-size: 0.75rem; font-weight: 700; color: #666;">🕒 ${p.createdAt}</span>
                  </div>
                  ${p.isExclusive ? '<span class="brutal-badge brutal-badge-accent">🔒 EXCLUSIVE UNLOCKED</span>' : '<span class="brutal-badge">PUBLIC DROP</span>'}
                </div>

                <p style="font-size: 0.95rem; margin-bottom: 0.8rem;">${p.content}</p>

                ${p.imageUrl ? `<img src="${p.imageUrl}" style="width: 100%; border: 3px solid #000; box-shadow: 3px 3px 0px #000; margin-bottom: 0.8rem; max-height: 400px; object-fit: cover;">` : ''}

                <div style="display: flex; align-items: center; justify-content: space-between; border-top: 2px solid #000; padding-top: 0.6rem;">
                  <button class="brutal-btn brutal-btn-sm btn-like-post" data-id="${p.id}">
                    ❤️ LIKE (${p.likesCount})
                  </button>
                  <span style="font-weight: 700; font-size: 0.8rem;">💬 ACTIVE DROP</span>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>

        <div>
          <h3 style="font-size: 1.3rem; margin-bottom: 1rem; border-bottom: 3px solid #000; padding-bottom: 0.3rem;">
            ⚡ MEMBERSHIP TIERS
          </h3>

          ${creator.tiers
            .map(
              (t) => `
            <div class="brutal-card" style="margin-bottom: 1rem; border-width: 3px; background: #ffffff;">
              <span class="brutal-badge brutal-badge-creator" style="margin-bottom: 0.4rem;">SUBSCRIPTION TIER</span>
              <h4 style="font-size: 1.2rem; margin-top: 0.2rem;">${t.name}</h4>
              <div style="font-size: 1.8rem; font-weight: 900; margin: 0.4rem 0;">
                $${t.price} <span style="font-size: 0.85rem; font-weight: 700;">/ MONTH</span>
              </div>
              <p style="font-size: 0.8rem; margin-bottom: 0.8rem; color: #333;">${t.description}</p>

              <ul style="list-style: none; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.8rem; font-weight: 700;">
                ${t.perks.map((perk) => `<li>✓ ${perk}</li>`).join('')}
              </ul>

              ${
                isSubscribed
                  ? `
                <button class="brutal-btn brutal-btn-black" disabled style="width: 100%; opacity: 0.8;">CURRENT PLAN</button>
              `
                  : `
                <button class="brutal-btn brutal-btn-creator btn-join-tier" data-tier="${t.id}" data-price="${t.price}" style="width: 100%;">
                  JOIN TIER NOW &rarr;
                </button>
              `
              }
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

// Tier Purchase Modal
function showTierPurchaseModal(creatorId, tierId, tierPrice) {
  const creator = store.getCreator(creatorId);

  const html = `
    <div style="text-align: center; margin-bottom: 1.2rem;">
      <span class="brutal-badge brutal-badge-black">SUBSCRIBE TO CREATOR</span>
      <h2 style="font-size: 1.4rem; margin-top: 0.4rem;">CONFIRM SUBSCRIPTION</h2>
      <p style="font-size: 0.85rem;">Supporting <strong>${creator ? creator.displayName : 'Creator'}</strong></p>
    </div>

    <div class="brutal-card" style="border-width: 3px; background: #fdfdfd; margin-bottom: 1.2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <strong style="display: block; font-size: 1rem;">MONTHLY SUBSCRIPTION</strong>
          <span style="font-size: 0.8rem; color: #555;">Instant access to exclusive drops</span>
        </div>
        <div style="font-size: 1.5rem; font-weight: 900;">$${tierPrice} / mo</div>
      </div>
    </div>

    <form id="tier-checkout-form" style="display: flex; flex-direction: column; gap: 0.8rem;">
      <div>
        <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">CARDHOLDER NAME</label>
        <input type="text" class="brutal-input" value="${store.user.name || 'JOHN DOE'}" required>
      </div>

      <div>
        <label style="display: block; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.2rem;">CARD NUMBER (SIMULATED)</label>
        <input type="text" class="brutal-input" value="4242 •••• •••• 4242" required>
      </div>

      <button type="submit" class="brutal-btn brutal-btn-black brutal-btn-lg" style="margin-top: 0.4rem; width: 100%;">
        CONFIRM & PAY $${tierPrice} 💳
      </button>
    </form>
  `;

  openModal(html);

  document.getElementById('tier-checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await store.subscribeToCreator(creatorId, tierId, tierPrice);
    closeModal();
    alert(`Successfully subscribed to creator! Exclusive content unlocked in PostgreSQL DB.`);
  });
}

// Enhanced Homepage / Explore Page Renderer
function renderExploreCreatorsPage() {
  const categories = ['ALL', 'Podcasts', 'Gaming', 'Digital Art & Music', 'Architecture & Design', 'Tech & Code'];

  const filteredCreators = store.creators.filter((c) => {
    const matchesCategory = store.filterCategory === 'ALL' || c.category === store.filterCategory;
    const matchesQuery =
      store.searchQuery === '' ||
      c.displayName.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
      c.bio.toLowerCase().includes(store.searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return `
    <div>
      <!-- Neubrutalist Hero Banner -->
      <div class="brutal-card" style="border-width: 4px; background: #ffffff; padding: 2rem 1.2rem; margin-bottom: 1.5rem; position: relative; overflow: hidden;">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
          <div style="display: inline-block; margin-bottom: 0.6rem;">
            <span class="brutal-badge brutal-badge-black" style="font-size: 0.8rem;">MONOCHROME & RGB CUSTOM CREATOR PLATFORM</span>
          </div>
          <h1 style="font-size: 2.6rem; line-height: 1.05; margin-bottom: 0.8rem;">
            BUILD YOUR FANBASE IN <span style="background: #000; color: #fff; padding: 0.1rem 0.4rem;">STARK NEUBRUTALISM</span>
          </h1>
          <p style="font-size: 1rem; font-weight: 600; color: #333; margin-bottom: 1.5rem;">
            The ultra-simple platform where creators customize their RGB homepages, publish exclusive drops, and monetize directly through subscriber tiers.
          </p>
          <div style="display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap;">
            <button class="brutal-btn brutal-btn-black brutal-btn-lg" id="hero-btn-start-creator">
              START CREATING NOW 🎨
            </button>
            <button class="brutal-btn brutal-btn-lg" id="hero-btn-explore-feed">
              EXPLORE DROPS ⚡
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Ticker Bar -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.8rem; margin-bottom: 2rem;">
        <div class="brutal-card" style="text-align: center; border-width: 3px; padding: 0.8rem;">
          <div style="font-size: 1.5rem; font-weight: 900;">POSTGRESQL</div>
          <div style="font-size: 0.75rem; font-weight: 800; color: #555;">DATABASE BACKED</div>
        </div>
        <div class="brutal-card" style="text-align: center; border-width: 3px; padding: 0.8rem;">
          <div style="font-size: 1.5rem; font-weight: 900;">100% SYNCED</div>
          <div style="font-size: 0.75rem; font-weight: 800; color: #555;">REALTIME REST API</div>
        </div>
        <div class="brutal-card" style="text-align: center; border-width: 3px; padding: 0.8rem;">
          <div style="font-size: 1.5rem; font-weight: 900;">100% RGB</div>
          <div style="font-size: 0.75rem; font-weight: 800; color: #555;">CUSTOM THEMED PAGES</div>
        </div>
        <div class="brutal-card" style="text-align: center; border-width: 3px; padding: 0.8rem;">
          <div style="font-size: 1.5rem; font-weight: 900;">0% BLOAT</div>
          <div style="font-size: 0.75rem; font-weight: 800; color: #555;">PURE BRUTALIST UI</div>
        </div>
      </div>

      <!-- Category Filter Pills & Search Input -->
      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.8rem; margin-bottom: 1.2rem;">
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            ${categories
              .map(
                (cat) => `
              <button class="brutal-btn brutal-btn-sm category-filter-btn ${store.filterCategory === cat ? 'brutal-btn-black' : ''}" data-category="${cat}">
                ${cat}
              </button>
            `
              )
              .join('')}
          </div>

          <div style="flex: 1; min-width: 220px; max-width: 100%;">
            <input type="text" id="homepage-search-input" class="brutal-input" placeholder="🔍 Search creators or topics..." value="${store.searchQuery}">
          </div>
        </div>
      </div>

      <!-- Creators Grid -->
      <h2 style="font-size: 1.4rem; margin-bottom: 1rem; border-bottom: 3px solid #000; padding-bottom: 0.3rem;">
        FEATURED CREATOR HOMEPAGES
      </h2>

      ${
        filteredCreators.length === 0
          ? `
        <div class="brutal-card" style="text-align: center; padding: 1.5rem;">
          <h3>NO CREATORS MATCH YOUR SEARCH</h3>
          <p>Try searching for a different handle or selecting "ALL" categories.</p>
        </div>
      `
          : `
        <div class="grid-2" id="explore-creators-grid">
          ${filteredCreators
            .map(
              (c) => `
            <div class="brutal-card brutal-card-interactive btn-open-creator-profile" data-id="${c.id}" style="border-width: 3px; padding: 0; overflow: hidden; background: #fff;">
              <div style="height: 110px; background-image: url('${c.bannerUrl}'); background-size: cover; background-position: center; border-bottom: 3px solid #000; position: relative;">
                <span class="brutal-badge" style="position: absolute; top: 8px; right: 8px; background: rgb(${c.theme.primaryColor.r}, ${c.theme.primaryColor.g}, ${c.theme.primaryColor.b}); color: #000;">
                  RGB THEMED
                </span>
              </div>

              <div style="padding: 1.2rem; position: relative;">
                <img src="${c.avatarUrl}" style="width: 65px; height: 65px; border: 3px solid #000; box-shadow: 3px 3px 0px #000; object-fit: cover; margin-top: -45px; background: #fff;">

                <h3 style="font-size: 1.2rem; margin-top: 0.4rem;">${c.displayName}</h3>
                <p style="font-size: 0.8rem; font-weight: 700; color: #666;">@${c.handle} • ${c.category}</p>

                <p style="font-size: 0.88rem; margin: 0.6rem 0 1rem 0; line-height: 1.35;">${c.bio}</p>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #000; padding-top: 0.6rem;">
                  <span style="font-weight: 800; font-size: 0.8rem;">⚡ ${c.subscribersCount} SUBSCRIBERS</span>
                  <span class="brutal-btn brutal-btn-sm brutal-btn-black">VISIT HOMEPAGE &rarr;</span>
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `
      }
    </div>
  `;
}

// Subscriber Feed Page Renderer
function renderSubscriberFeedPage() {
  const subscribedPosts = store.posts.filter((p) => store.user.subscribedCreatorIds.includes(p.creatorId));

  return `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="margin-bottom: 1.5rem; border-bottom: 4px solid #000; padding-bottom: 0.8rem;">
        <span class="brutal-badge brutal-badge-black">SUBSCRIBER DASHBOARD</span>
        <h1 style="font-size: 2rem; margin-top: 0.2rem;">YOUR SUBSCRIBED FEED</h1>
        <p style="font-size: 0.9rem; color: #444;">
          Latest posts and unlocked exclusive drops from creators you support.
        </p>
      </div>

      ${
        subscribedPosts.length === 0
          ? `
        <div class="brutal-card" style="text-align: center; padding: 2rem 1rem;">
          <h2 style="font-size: 1.3rem; margin-bottom: 0.4rem;">NO SUBSCRIBED CREATORS YET</h2>
          <p style="margin-bottom: 1.2rem;">Discover and subscribe to creators to see their exclusive drops here.</p>
          <button class="brutal-btn brutal-btn-black" id="btn-goto-explore">EXPLORE CREATORS NOW &rarr;</button>
        </div>
      `
          : subscribedPosts
              .map((p) => {
                const creator = store.getCreator(p.creatorId);
                return `
          <div class="brutal-card" style="margin-bottom: 1.5rem; border-width: 3px; background: #ffffff;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem; border-bottom: 2px solid #000; padding-bottom: 0.6rem; flex-wrap: wrap; gap: 0.4rem;">
              <div style="display: flex; align-items: center; gap: 0.6rem; cursor: pointer;" class="btn-open-creator-profile" data-id="${creator ? creator.id : p.creatorId}">
                <img src="${creator ? creator.avatarUrl : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}" style="width: 42px; height: 42px; border: 2px solid #000; object-fit: cover;">
                <div>
                  <strong style="display: block; font-size: 0.95rem;">${creator ? creator.displayName : 'Creator'}</strong>
                  <span style="font-size: 0.75rem; font-weight: 700; color: #555;">@${creator ? creator.handle : 'creator'} • 🕒 ${p.createdAt}</span>
                </div>
              </div>
              ${p.isExclusive ? '<span class="brutal-badge brutal-badge-accent">🔒 EXCLUSIVE UNLOCKED</span>' : '<span class="brutal-badge">PUBLIC DROP</span>'}
            </div>

            <h3 style="font-size: 1.2rem; margin-bottom: 0.4rem;">${p.title}</h3>
            <p style="font-size: 0.9rem; margin-bottom: 0.8rem; line-height: 1.4;">${p.content}</p>

            ${p.imageUrl ? `<img src="${p.imageUrl}" style="width: 100%; border: 3px solid #000; box-shadow: 3px 3px 0px #000; margin-bottom: 0.8rem; max-height: 350px; object-fit: cover;">` : ''}

            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 2px solid #000; padding-top: 0.6rem; flex-wrap: wrap; gap: 0.5rem;">
              <button class="brutal-btn brutal-btn-sm btn-like-post" data-id="${p.id}">
                ❤️ LIKE (${p.likesCount})
              </button>
              <button class="brutal-btn brutal-btn-sm btn-open-creator-profile" data-id="${creator ? creator.id : p.creatorId}">
                VISIT HOMEPAGE ↗
              </button>
            </div>
          </div>
        `;
              })
              .join('')
      }
    </div>
  `;
}

// Navigation Bar Controls
function renderNavbarControls() {
  const container = document.getElementById('nav-links-container');

  let html = `
    <button id="nav-btn-explore" class="brutal-btn brutal-btn-sm ${store.activeView === 'explore' ? 'brutal-btn-black' : ''}">
      🔍 EXPLORE
    </button>
  `;

  if (store.user.role === 'subscriber' || store.user.role === 'creator') {
    html += `
      <button id="nav-btn-feed" class="brutal-btn brutal-btn-sm ${store.activeView === 'feed' ? 'brutal-btn-black' : ''}">
        ⚡ MY FEED
      </button>
    `;
  }

  if (store.user.role === 'creator') {
    html += `
      <button id="nav-btn-studio" class="brutal-btn brutal-btn-sm brutal-btn-creator ${store.activeView === 'creator-studio' ? 'brutal-btn-black' : ''}">
        🎨 CREATOR STUDIO
      </button>
    `;
  }

  html += `
    <div class="nav-role-group" style="display: flex; align-items: center; gap: 0.4rem; border-left: 3px solid #000; padding-left: 0.6rem; margin-left: 0.4rem; flex-wrap: wrap;">
      <select id="role-switcher-select" class="brutal-select" style="padding: 0.3rem 0.5rem; font-size: 0.8rem; min-width: 140px;">
        <option value="guest" ${store.user.role === 'guest' ? 'selected' : ''}>👤 GUEST MODE</option>
        <option value="subscriber" ${store.user.role === 'subscriber' ? 'selected' : ''}>⚡ SUBSCRIBER MODE</option>
        <option value="creator" ${store.user.role === 'creator' ? 'selected' : ''}>🎨 CREATOR MODE</option>
      </select>

      <button id="nav-btn-signup" class="brutal-btn brutal-btn-sm brutal-btn-accent">
        ✨ SIGN UP FUNNEL
      </button>
    </div>
  `;

  container.innerHTML = html;

  document.getElementById('nav-btn-explore')?.addEventListener('click', () => {
    store.activeView = 'explore';
    renderApp();
  });

  document.getElementById('nav-btn-feed')?.addEventListener('click', () => {
    store.activeView = 'feed';
    renderApp();
  });

  document.getElementById('nav-btn-studio')?.addEventListener('click', () => {
    store.activeView = 'creator-studio';
    renderApp();
  });

  document.getElementById('nav-btn-signup')?.addEventListener('click', () => {
    showRoleSelectionModal();
  });

  document.getElementById('role-switcher-select')?.addEventListener('change', async (e) => {
    const val = e.target.value;
    if (val === 'guest') {
      store.user = { id: 'user-guest', name: 'Visitor Guest', username: 'guest', role: 'guest', subscribedCreatorIds: [], creatorProfileId: null };
      store.activeView = 'explore';
    } else if (val === 'subscriber') {
      store.user = { id: '00000000-0000-0000-0000-000000000004', name: 'John Doe', username: 'johndoe', role: 'subscriber', subscribedCreatorIds: [], creatorProfileId: null };
      await store.fetchUserSubscriptions();
      store.activeView = 'feed';
    } else if (val === 'creator') {
      const creator = store.creators[0];
      store.user = {
        id: creator ? creator.creatorId : '00000000-0000-0000-0000-000000000002',
        name: creator ? creator.displayName : 'Alex Rivera',
        username: creator ? creator.handle : 'techoverload',
        role: 'creator',
        subscribedCreatorIds: creator ? [creator.id] : [],
        creatorProfileId: creator ? creator.id : null,
      };
      if (creator) store.selectedCreatorId = creator.id;
      store.activeView = 'creator-studio';
    }
    store.saveUser();
    renderApp();
  });
}

// Main Render Function
function renderApp() {
  renderNavbarControls();

  const main = document.getElementById('main-content');

  if (store.isLoading) {
    main.innerHTML = `<div class="brutal-card" style="text-align: center; padding: 2rem;"><h2>LOADING PLATFORM DATA FROM POSTGRESQL...</h2></div>`;
    return;
  }

  if (store.activeView === 'explore') {
    main.innerHTML = renderExploreCreatorsPage();

    // Homepage Event Listeners
    document.getElementById('hero-btn-start-creator')?.addEventListener('click', showRoleSelectionModal);
    document.getElementById('hero-btn-explore-feed')?.addEventListener('click', () => {
      store.activeView = 'feed';
      renderApp();
    });

    document.querySelectorAll('.category-filter-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        store.filterCategory = e.currentTarget.getAttribute('data-category') || 'ALL';
        renderApp();
      });
    });

    const searchInput = document.getElementById('homepage-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        store.searchQuery = e.target.value;
        const filteredCreators = store.creators.filter((c) => {
          const matchesCategory = store.filterCategory === 'ALL' || c.category === store.filterCategory;
          const matchesQuery =
            store.searchQuery === '' ||
            c.displayName.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
            c.handle.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
            c.bio.toLowerCase().includes(store.searchQuery.toLowerCase());
          return matchesCategory && matchesQuery;
        });

        const grid = document.getElementById('explore-creators-grid');
        if (grid) {
          grid.innerHTML = filteredCreators
            .map(
              (c) => `
            <div class="brutal-card brutal-card-interactive btn-open-creator-profile" data-id="${c.id}" style="border-width: 3px; padding: 0; overflow: hidden; background: #fff;">
              <div style="height: 110px; background-image: url('${c.bannerUrl}'); background-size: cover; background-position: center; border-bottom: 3px solid #000; position: relative;">
                <span class="brutal-badge" style="position: absolute; top: 8px; right: 8px; background: rgb(${c.theme.primaryColor.r}, ${c.theme.primaryColor.g}, ${c.theme.primaryColor.b}); color: #000;">
                  RGB THEMED
                </span>
              </div>

              <div style="padding: 1.2rem; position: relative;">
                <img src="${c.avatarUrl}" style="width: 65px; height: 65px; border: 3px solid #000; box-shadow: 3px 3px 0px #000; object-fit: cover; margin-top: -45px; background: #fff;">

                <h3 style="font-size: 1.2rem; margin-top: 0.4rem;">${c.displayName}</h3>
                <p style="font-size: 0.8rem; font-weight: 700; color: #666;">@${c.handle} • ${c.category}</p>

                <p style="font-size: 0.88rem; margin: 0.6rem 0 1rem 0; line-height: 1.35;">${c.bio}</p>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #000; padding-top: 0.6rem;">
                  <span style="font-weight: 800; font-size: 0.8rem;">⚡ ${c.subscribersCount} SUBSCRIBERS</span>
                  <span class="brutal-btn brutal-btn-sm brutal-btn-black">VISIT HOMEPAGE &rarr;</span>
                </div>
              </div>
            </div>
          `
            )
            .join('');

          // Rebind click listeners on dynamic filtered items
          document.querySelectorAll('.btn-open-creator-profile').forEach((btn) => {
            btn.addEventListener('click', (ev) => {
              const id = ev.currentTarget.getAttribute('data-id');
              if (id) {
                store.selectedCreatorId = id;
                store.activeView = 'creator-page';
                renderApp();
              }
            });
          });
        }
      });
    }
  } else if (store.activeView === 'feed') {
    main.innerHTML = renderSubscriberFeedPage();
  } else if (store.activeView === 'creator-page') {
    const creator = store.getCreator(store.selectedCreatorId);
    main.innerHTML = renderCreatorPublicProfilePage(creator);
  } else if (store.activeView === 'creator-studio') {
    const creatorId = store.user.creatorProfileId || store.selectedCreatorId || (store.creators[0] ? store.creators[0].id : null);
    const creator = store.getCreator(creatorId);
    main.innerHTML = renderCreatorStudioMetricsAndPostTool(creator);

    // Studio Event Listeners
    document.getElementById('btn-view-public-page')?.addEventListener('click', () => {
      if (creator) store.selectedCreatorId = creator.id;
      store.activeView = 'creator-page';
      renderApp();
    });

    const postsTab = document.getElementById('tab-btn-posts');
    const themeTab = document.getElementById('tab-btn-theme');
    const studioMainArea = document.getElementById('studio-main-area');

    postsTab?.addEventListener('click', () => {
      postsTab.classList.add('active');
      themeTab.classList.remove('active');
      renderApp();
    });

    themeTab?.addEventListener('click', () => {
      themeTab.classList.add('active');
      postsTab.classList.remove('active');
      if (creator) {
        studioMainArea.innerHTML = renderRGBThemeStudioControls(creator);
        attachRGBStudioListeners(creator);
      }
    });

    document.getElementById('studio-create-post-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('post-title').value;
      const content = document.getElementById('post-content').value;
      const imageUrl = document.getElementById('post-image-url').value;
      const visibility = document.getElementById('post-visibility').value;

      await store.addPost({
        creatorId: creator ? creator.id : store.selectedCreatorId,
        title,
        content,
        imageUrl: imageUrl || undefined,
        isExclusive: visibility === 'exclusive',
      });

      alert('New drop published and saved to PostgreSQL!');
    });
  }

  // Bind Global Dynamic Action Listeners
  document.querySelectorAll('.btn-open-creator-profile').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (id) {
        store.selectedCreatorId = id;
        store.activeView = 'creator-page';
        renderApp();
      }
    });
  });

  document.querySelectorAll('.btn-unlock-paywall, .btn-join-tier, #btn-subscribe-header').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const creatorId = e.currentTarget.getAttribute('data-creator') || store.selectedCreatorId;
      const tierId = e.currentTarget.getAttribute('data-tier') || null;
      const price = e.currentTarget.getAttribute('data-price') || 5;
      showTierPurchaseModal(creatorId, tierId, price);
    });
  });

  document.querySelectorAll('.btn-like-post').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (id) {
        await store.likePost(id);
      }
    });
  });

  document.getElementById('btn-goto-explore')?.addEventListener('click', () => {
    store.activeView = 'explore';
    renderApp();
  });
}

// Logo click resets to Explore
document.getElementById('logo-btn').addEventListener('click', (e) => {
  e.preventDefault();
  store.activeView = 'explore';
  renderApp();
});

// App Initialization
window.addEventListener('DOMContentLoaded', () => {
  store.init();
});
