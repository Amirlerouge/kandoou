// Complete App Integration File (app.js) with Mobile Responsiveness Optimizations

// State Management and Storage Helpers
const STORAGE_KEYS = {
  CREATORS: 'brutal_creators_v1',
  POSTS: 'brutal_posts_v1',
  USER: 'brutal_current_user_v1',
};

const DEFAULT_CREATORS = [
  {
    id: 'creator-1',
    handle: 'pixelpunk',
    displayName: 'Alex Rivers // Audio & Glitch',
    bio: 'Crafting cyber-monochrome digital synth soundscapes & 8-bit visual glitches.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    category: 'Digital Art & Music',
    theme: {
      primaryColor: { r: 255, g: 87, b: 34 },
      accentColor: { r: 255, g: 235, b: 59 }
    },
    subscribersCount: 1420,
    monthlyRevenue: 4260,
    tiers: [
      {
        id: 'tier-1',
        name: 'STREET CYBER',
        price: 5,
        description: 'Access to subscriber-only audio logs and raw WIP assets.',
        perks: ['Subscriber Badge', 'Weekly Audio Stems', 'Private Discord Access']
      },
      {
        id: 'tier-2',
        name: 'NEO MATRIX',
        price: 15,
        description: 'Complete source project files, custom synth presets & 1-on-1 Q&A.',
        perks: ['All Previous Perks', 'Ableton Live Files', 'Direct Q&A Sessions']
      }
    ]
  },
  {
    id: 'creator-2',
    handle: 'brutal_arch',
    displayName: 'Concrete & Steel Studio',
    bio: 'Monochrome architectural photography, brutalist structures, and modern minimalism analysis.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    category: 'Architecture & Design',
    theme: {
      primaryColor: { r: 0, g: 230, b: 118 },
      accentColor: { r: 0, g: 184, b: 212 }
    },
    subscribersCount: 890,
    monthlyRevenue: 2670,
    tiers: [
      {
        id: 'tier-b1',
        name: 'DRAFT CLUB',
        price: 3,
        description: 'High-res RAW photo downloads and weekly architectural breakdown notes.',
        perks: ['Full Res RAW Downloads', 'Weekly Architecture Essays']
      }
    ]
  },
  {
    id: 'creator-3',
    handle: 'cyber_code',
    displayName: 'Vortex Developer // Web3 & GLSL',
    bio: 'WebGL shader experiments, generative canvas art, and open-source frontend toolkits.',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    category: 'Tech & Code',
    theme: {
      primaryColor: { r: 233, g: 30, b: 99 },
      accentColor: { r: 0, g: 229, b: 255 }
    },
    subscribersCount: 2100,
    monthlyRevenue: 8400,
    tiers: [
      {
        id: 'tier-c1',
        name: 'SHADER GOD',
        price: 10,
        description: 'Full Three.js and GLSL source code downloads with video walkthroughs.',
        perks: ['Source Code Repository Access', 'Weekly GLSL Breakdown', 'Discord VIP']
      }
    ]
  }
];

const DEFAULT_POSTS = [
  {
    id: 'post-1',
    creatorId: 'creator-1',
    title: 'NEW SYNTH MODULE RELEASED! 🎛️',
    content: 'Just finished coding the modular synth engine patch for our latest track! Subscribers can grab the preset files below.',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
    createdAt: '2 hours ago',
    isExclusive: false,
    likesCount: 142
  },
  {
    id: 'post-2',
    creatorId: 'creator-1',
    title: '[VIP EXCLUSIVE] Unreleased Synthesizer Stems & Ableton Project',
    content: 'Here is the full multitrack stem breakdown for "BRUTAL_CORE_09". Free for Neo Matrix tier members.',
    createdAt: '1 day ago',
    isExclusive: true,
    tierId: 'tier-2',
    likesCount: 89
  },
  {
    id: 'post-3',
    creatorId: 'creator-2',
    title: 'Shadows on Raw Concrete: Berlin Brutalism Study',
    content: 'High contrast monograph on 1970s municipal architecture in West Berlin.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    createdAt: '3 days ago',
    isExclusive: false,
    likesCount: 215
  }
];

const DEFAULT_USER = {
  id: 'user-guest',
  name: 'Visitor Guest',
  username: 'guest',
  role: 'guest',
  subscribedCreatorIds: ['creator-1'],
  creatorProfileId: null
};

// Global Application State Store
class Store {
  constructor() {
    this.creators = this.load(STORAGE_KEYS.CREATORS, DEFAULT_CREATORS);
    this.posts = this.load(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
    this.user = this.load(STORAGE_KEYS.USER, DEFAULT_USER);
    this.activeView = 'explore';
    this.selectedCreatorId = 'creator-1';
    this.filterCategory = 'ALL';
    this.searchQuery = '';
    this.signupTemp = {
      role: 'creator',
      name: '',
      username: '',
      email: '',
      password: ''
    };
  }

  load(key, fallback) {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    try {
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  }

  save() {
    localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify(this.creators));
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(this.posts));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user));
    window.dispatchEvent(new Event('store-updated'));
  }

  getCreator(id) {
    return this.creators.find(c => c.id === id) || this.creators[0];
  }

  getPostsByCreator(creatorId) {
    return this.posts.filter(p => p.creatorId === creatorId);
  }

  updateCreatorTheme(creatorId, theme) {
    const creator = this.creators.find(c => c.id === creatorId);
    if (creator) {
      creator.theme = theme;
      this.save();
    }
  }

  updateCreatorProfile(creatorId, details) {
    const creator = this.creators.find(c => c.id === creatorId);
    if (creator) {
      Object.assign(creator, details);
      this.save();
    }
  }

  addPost(post) {
    this.posts.unshift(post);
    this.save();
  }

  subscribeToCreator(creatorId) {
    if (!this.user.subscribedCreatorIds.includes(creatorId)) {
      this.user.subscribedCreatorIds.push(creatorId);
      const creator = this.getCreator(creatorId);
      if (creator) creator.subscribersCount += 1;
      this.save();
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

  ['pr', 'pg', 'pb', 'ar', 'ag', 'ab'].forEach(id => {
    document.getElementById(`slider-${id}`).addEventListener('input', updateRGBPreviews);
  });

  document.getElementById('creator-onboarding-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const newCreatorId = 'creator-' + Date.now();
    const newCreator = {
      id: newCreatorId,
      handle: store.signupTemp.username,
      displayName: document.getElementById('creator-display-name').value,
      bio: document.getElementById('creator-bio').value,
      avatarUrl: document.getElementById('creator-avatar-url').value,
      bannerUrl: document.getElementById('creator-banner-url').value,
      category: 'Digital Art & Music',
      theme: {
        primaryColor: currentPrimary,
        accentColor: currentAccent
      },
      subscribersCount: 1,
      monthlyRevenue: 0,
      tiers: [
        {
          id: 'tier-' + Date.now(),
          name: 'FOUNDING MEMBER',
          price: 5,
          description: 'Early access to posts, project updates, and exclusive creator content.',
          perks: ['Founding Member Badge', 'Subscriber Posts Access', 'Direct Chat Access']
        }
      ]
    };

    store.creators.push(newCreator);

    store.user = {
      id: 'user-' + Date.now(),
      name: store.signupTemp.name,
      username: store.signupTemp.username,
      role: 'creator',
      subscribedCreatorIds: [newCreatorId],
      creatorProfileId: newCreatorId
    };

    store.selectedCreatorId = newCreatorId;
    store.activeView = 'creator-studio';
    store.save();

    closeModal();
    renderApp();
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
          ${store.creators.map(c => `
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
          `).join('')}
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

  document.getElementById('subscriber-onboarding-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedCreators = Array.from(document.querySelectorAll('input[name="sub-creator"]:checked')).map(cb => cb.value);

    store.user = {
      id: 'user-' + Date.now(),
      name: store.signupTemp.name || 'Subscriber User',
      username: store.signupTemp.username || 'sub_user',
      role: 'subscriber',
      subscribedCreatorIds: selectedCreators.length > 0 ? selectedCreators : ['creator-1'],
      creatorProfileId: null
    };

    store.activeView = 'feed';
    store.save();

    closeModal();
    renderApp();
  });
}

// Creator Studio Metrics & Post Creation Component
function renderCreatorStudioMetricsAndPostTool(creator) {
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
          <span class="brutal-badge brutal-badge-accent" style="margin-top: 0.5rem;">+12% THIS MONTH</span>
        </div>

        <div class="brutal-card" style="border-width: 3px; background: #ffffff;">
          <span style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #666;">ESTIMATED MONTHLY REVENUE</span>
          <div style="font-size: 2.2rem; font-weight: 900; margin-top: 0.2rem;">$${creator.monthlyRevenue}</div>
          <span class="brutal-badge brutal-badge-creator" style="margin-top: 0.5rem;">${creator.tiers.length} TIERS ACTIVE</span>
        </div>

        <div class="brutal-card" style="border-width: 3px; background: #ffffff;">
          <span style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #666;">PUBLISHED POSTS</span>
          <div style="font-size: 2.2rem; font-weight: 900; margin-top: 0.2rem;">${posts.length}</div>
          <span class="brutal-badge brutal-badge-black" style="margin-top: 0.5rem;">${posts.filter(p => p.isExclusive).length} EXCLUSIVE DROPS</span>
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
            ${posts.length === 0 ? '<p>No posts published yet.</p>' : posts.map(p => `
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
            `).join('')}
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

  ids.forEach(id => {
    const elem = document.getElementById(`studio-slider-${id}`);
    if (elem) elem.addEventListener('input', updateLiveVarsAndPreview);
  });

  const saveBtn = document.getElementById('btn-save-rgb-theme');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const pr = parseInt(document.getElementById('studio-slider-pr').value);
      const pg = parseInt(document.getElementById('studio-slider-pg').value);
      const pb = parseInt(document.getElementById('studio-slider-pb').value);

      const ar = parseInt(document.getElementById('studio-slider-ar').value);
      const ag = parseInt(document.getElementById('studio-slider-ag').value);
      const ab = parseInt(document.getElementById('studio-slider-ab').value);

      const avatarUrl = document.getElementById('studio-avatar-url').value;
      const bannerUrl = document.getElementById('studio-banner-url').value;

      store.updateCreatorTheme(creator.id, {
        primaryColor: { r: pr, g: pg, b: pb },
        accentColor: { r: ar, g: ag, b: ab }
      });

      store.updateCreatorProfile(creator.id, { avatarUrl, bannerUrl });
      alert('RGB Theme and Media Assets updated successfully!');
      renderApp();
    });
  }
}

// Creator Public Profile Page Renderer
function renderCreatorPublicProfilePage(creator) {
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
          ${isSubscribed ? `
            <button class="brutal-btn brutal-btn-black" disabled style="opacity: 0.9;">✓ SUBSCRIBED</button>
          ` : `
            <button class="brutal-btn brutal-btn-creator" id="btn-subscribe-header">
              ⚡ SUBSCRIBE ($${creator.tiers[0]?.price || 5}/MO)
            </button>
          `}
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

          ${posts.map(p => {
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
                  <span style="font-weight: 700; font-size: 0.8rem;">💬 12 COMMENTS</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div>
          <h3 style="font-size: 1.3rem; margin-bottom: 1rem; border-bottom: 3px solid #000; padding-bottom: 0.3rem;">
            ⚡ MEMBERSHIP TIERS
          </h3>

          ${creator.tiers.map(t => `
            <div class="brutal-card" style="margin-bottom: 1rem; border-width: 3px; background: #ffffff;">
              <span class="brutal-badge brutal-badge-creator" style="margin-bottom: 0.4rem;">SUBSCRIPTION TIER</span>
              <h4 style="font-size: 1.2rem; margin-top: 0.2rem;">${t.name}</h4>
              <div style="font-size: 1.8rem; font-weight: 900; margin: 0.4rem 0;">
                $${t.price} <span style="font-size: 0.85rem; font-weight: 700;">/ MONTH</span>
              </div>
              <p style="font-size: 0.8rem; margin-bottom: 0.8rem; color: #333;">${t.description}</p>

              <ul style="list-style: none; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.8rem; font-weight: 700;">
                ${t.perks.map(perk => `<li>✓ ${perk}</li>`).join('')}
              </ul>

              ${isSubscribed ? `
                <button class="brutal-btn brutal-btn-black" disabled style="width: 100%; opacity: 0.8;">CURRENT PLAN</button>
              ` : `
                <button class="brutal-btn brutal-btn-creator btn-join-tier" data-tier="${t.id}" data-price="${t.price}" style="width: 100%;">
                  JOIN TIER NOW &rarr;
                </button>
              `}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Tier Purchase Modal
function showTierPurchaseModal(creatorId, tierPrice) {
  const creator = store.getCreator(creatorId);

  const html = `
    <div style="text-align: center; margin-bottom: 1.2rem;">
      <span class="brutal-badge brutal-badge-black">SUBSCRIBE TO CREATOR</span>
      <h2 style="font-size: 1.4rem; margin-top: 0.4rem;">CONFIRM SUBSCRIPTION</h2>
      <p style="font-size: 0.85rem;">Supporting <strong>${creator.displayName}</strong></p>
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
        <input type="text" class="brutal-input" value="${store.user.name || 'JORDAN VANCE'}" required>
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

  document.getElementById('tier-checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    store.subscribeToCreator(creatorId);
    closeModal();
    alert(`Successfully subscribed to ${creator.displayName}! Exclusive content unlocked.`);
    renderApp();
  });
}

// Enhanced Homepage / Explore Page Renderer
function renderExploreCreatorsPage() {
  const categories = ['ALL', 'Digital Art & Music', 'Architecture & Design', 'Tech & Code'];

  const filteredCreators = store.creators.filter(c => {
    const matchesCategory = store.filterCategory === 'ALL' || c.category === store.filterCategory;
    const matchesQuery = store.searchQuery === '' ||
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
          <div style="font-size: 1.5rem; font-weight: 900;">$1.2M+</div>
          <div style="font-size: 0.75rem; font-weight: 800; color: #555;">PAID TO CREATORS</div>
        </div>
        <div class="brutal-card" style="text-align: center; border-width: 3px; padding: 0.8rem;">
          <div style="font-size: 1.5rem; font-weight: 900;">10,000+</div>
          <div style="font-size: 0.75rem; font-weight: 800; color: #555;">ACTIVE SUBSCRIBERS</div>
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
            ${categories.map(cat => `
              <button class="brutal-btn brutal-btn-sm category-filter-btn ${store.filterCategory === cat ? 'brutal-btn-black' : ''}" data-category="${cat}">
                ${cat}
              </button>
            `).join('')}
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

      ${filteredCreators.length === 0 ? `
        <div class="brutal-card" style="text-align: center; padding: 1.5rem;">
          <h3>NO CREATORS MATCH YOUR SEARCH</h3>
          <p>Try searching for a different handle or selecting "ALL" categories.</p>
        </div>
      ` : `
        <div class="grid-2" id="explore-creators-grid">
          ${filteredCreators.map(c => `
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
          `).join('')}
        </div>
      `}
    </div>
  `;
}

// Subscriber Feed Page Renderer
function renderSubscriberFeedPage() {
  const subscribedPosts = store.posts.filter(p => store.user.subscribedCreatorIds.includes(p.creatorId));

  return `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="margin-bottom: 1.5rem; border-bottom: 4px solid #000; padding-bottom: 0.8rem;">
        <span class="brutal-badge brutal-badge-black">SUBSCRIBER DASHBOARD</span>
        <h1 style="font-size: 2rem; margin-top: 0.2rem;">YOUR SUBSCRIBED FEED</h1>
        <p style="font-size: 0.9rem; color: #444;">
          Latest posts and unlocked exclusive drops from creators you support.
        </p>
      </div>

      ${subscribedPosts.length === 0 ? `
        <div class="brutal-card" style="text-align: center; padding: 2rem 1rem;">
          <h2 style="font-size: 1.3rem; margin-bottom: 0.4rem;">NO SUBSCRIBED CREATORS YET</h2>
          <p style="margin-bottom: 1.2rem;">Discover and subscribe to creators to see their exclusive drops here.</p>
          <button class="brutal-btn brutal-btn-black" id="btn-goto-explore">EXPLORE CREATORS NOW &rarr;</button>
        </div>
      ` : subscribedPosts.map(p => {
        const creator = store.getCreator(p.creatorId);
        return `
          <div class="brutal-card" style="margin-bottom: 1.5rem; border-width: 3px; background: #ffffff;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem; border-bottom: 2px solid #000; padding-bottom: 0.6rem; flex-wrap: wrap; gap: 0.4rem;">
              <div style="display: flex; align-items: center; gap: 0.6rem; cursor: pointer;" class="btn-open-creator-profile" data-id="${creator.id}">
                <img src="${creator.avatarUrl}" style="width: 42px; height: 42px; border: 2px solid #000; object-fit: cover;">
                <div>
                  <strong style="display: block; font-size: 0.95rem;">${creator.displayName}</strong>
                  <span style="font-size: 0.75rem; font-weight: 700; color: #555;">@${creator.handle} • 🕒 ${p.createdAt}</span>
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
              <button class="brutal-btn brutal-btn-sm btn-open-creator-profile" data-id="${creator.id}">
                VISIT HOMEPAGE ↗
              </button>
            </div>
          </div>
        `;
      }).join('')}
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

  document.getElementById('role-switcher-select')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'guest') {
      store.user = { id: 'user-guest', name: 'Visitor Guest', username: 'guest', role: 'guest', subscribedCreatorIds: ['creator-1'], creatorProfileId: null };
      store.activeView = 'explore';
    } else if (val === 'subscriber') {
      store.user = { id: 'user-sub', name: 'Jordan Vance', username: 'jordan_v', role: 'subscriber', subscribedCreatorIds: ['creator-1'], creatorProfileId: null };
      store.activeView = 'feed';
    } else if (val === 'creator') {
      store.user = { id: 'user-creator-1', name: 'Alex Rivers', username: 'pixelpunk', role: 'creator', subscribedCreatorIds: ['creator-1'], creatorProfileId: 'creator-1' };
      store.selectedCreatorId = 'creator-1';
      store.activeView = 'creator-studio';
    }
    store.save();
    renderApp();
  });
}

// Main Render Function
function renderApp() {
  renderNavbarControls();

  const main = document.getElementById('main-content');

  if (store.activeView === 'explore') {
    main.innerHTML = renderExploreCreatorsPage();

    // Homepage Event Listeners
    document.getElementById('hero-btn-start-creator')?.addEventListener('click', showRoleSelectionModal);
    document.getElementById('hero-btn-explore-feed')?.addEventListener('click', () => {
      store.activeView = 'feed';
      renderApp();
    });

    document.querySelectorAll('.category-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        store.filterCategory = e.currentTarget.getAttribute('data-category') || 'ALL';
        renderApp();
      });
    });

    const searchInput = document.getElementById('homepage-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        store.searchQuery = e.target.value;
        const filteredCreators = store.creators.filter(c => {
          const matchesCategory = store.filterCategory === 'ALL' || c.category === store.filterCategory;
          const matchesQuery = store.searchQuery === '' ||
            c.displayName.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
            c.handle.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
            c.bio.toLowerCase().includes(store.searchQuery.toLowerCase());
          return matchesCategory && matchesQuery;
        });

        const grid = document.getElementById('explore-creators-grid');
        if (grid) {
          grid.innerHTML = filteredCreators.map(c => `
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
          `).join('');

          // Rebind click listeners on dynamic filtered items
          document.querySelectorAll('.btn-open-creator-profile').forEach(btn => {
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
    const creatorId = store.user.creatorProfileId || store.selectedCreatorId || 'creator-1';
    const creator = store.getCreator(creatorId);
    main.innerHTML = renderCreatorStudioMetricsAndPostTool(creator);

    // Studio Event Listeners
    document.getElementById('btn-view-public-page')?.addEventListener('click', () => {
      store.selectedCreatorId = creator.id;
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
      studioMainArea.innerHTML = renderRGBThemeStudioControls(creator);
      attachRGBStudioListeners(creator);
    });

    document.getElementById('studio-create-post-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('post-title').value;
      const content = document.getElementById('post-content').value;
      const imageUrl = document.getElementById('post-image-url').value;
      const visibility = document.getElementById('post-visibility').value;

      const newPost = {
        id: 'post-' + Date.now(),
        creatorId: creator.id,
        title,
        content,
        imageUrl: imageUrl || undefined,
        createdAt: 'Just now',
        isExclusive: visibility === 'exclusive',
        likesCount: 0
      };

      store.addPost(newPost);
      alert('New drop published successfully!');
      renderApp();
    });
  }

  // Bind Global Dynamic Action Listeners
  document.querySelectorAll('.btn-open-creator-profile').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (id) {
        store.selectedCreatorId = id;
        store.activeView = 'creator-page';
        renderApp();
      }
    });
  });

  document.querySelectorAll('.btn-unlock-paywall, .btn-join-tier, #btn-subscribe-header').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const creatorId = e.currentTarget.getAttribute('data-creator') || store.selectedCreatorId;
      const price = e.currentTarget.getAttribute('data-price') || 5;
      showTierPurchaseModal(creatorId, price);
    });
  });

  document.querySelectorAll('.btn-like-post').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const post = store.posts.find(p => p.id === id);
      if (post) {
        post.likesCount += 1;
        store.save();
        renderApp();
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
  renderApp();
});
