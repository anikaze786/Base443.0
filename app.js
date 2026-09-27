/**
 * Base44 Vibe Coding Platform - Interactive Clone Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initPromptBox();
  initShowcaseWidgets();
  initSuperagents();
  initTemplates();
  initPricing();
  initFaqAccordion();
  initMobileMenu();
  initSimModal();
  initContactModals();
});

// Initialize Lucide Icons
function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// -------------------------------------------------------------
// 1. PROMPT BOX & ROTATING PLACEHOLDERS
// -------------------------------------------------------------
const rotatingPrompts = [
  "A client portal with invoice tracking, Stripe checkout, and automated PDF receipts...",
  "An internal ops dashboard for supply chain inventory and vendor risk scoring...",
  "A modern fitness tracker with workout logs, streak counter, and Strava integration...",
  "A customer support copilot that reads Notion docs and drafts Slack replies...",
  "An e-commerce marketplace for handcrafted ceramics with inventory sync..."
];

let promptIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 50;
let activeCategory = 'apps';
let activeMode = 'build';

function initPromptBox() {
  const promptInput = document.getElementById('heroPromptInput');
  const suggestionChips = document.querySelectorAll('.suggestion-chip');
  const categoryPills = document.querySelectorAll('.category-pill');
  const modeButtons = document.querySelectorAll('.mode-btn');
  const startBuildBtn = document.getElementById('startBuildHeroBtn');

  // Typewriter effect in textarea if empty
  if (promptInput) {
    let typewriterTimeout;
    
    function typeEffect() {
      if (document.activeElement === promptInput && promptInput.value.length > 0) {
        return; // Don't overwrite if user is typing
      }
      
      const currentFullText = rotatingPrompts[promptIndex];
      
      if (!isDeleting) {
        promptInput.setAttribute('placeholder', currentFullText.substring(0, charIndex + 1) + '|');
        charIndex++;
        if (charIndex === currentFullText.length) {
          isDeleting = true;
          typewriterTimeout = setTimeout(typeEffect, 2200);
          return;
        }
      } else {
        promptInput.setAttribute('placeholder', currentFullText.substring(0, charIndex - 1) + '|');
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          promptIndex = (promptIndex + 1) % rotatingPrompts.length;
          typewriterTimeout = setTimeout(typeEffect, 400);
          return;
        }
      }
      
      typewriterTimeout = setTimeout(typeEffect, isDeleting ? 25 : typeSpeed);
    }

    typeEffect();

    promptInput.addEventListener('focus', () => {
      promptInput.setAttribute('placeholder', 'Describe the app or website you want to build in plain English...');
    });
  }

  // Suggestion chips
  suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-prompt');
      if (promptInput) {
        promptInput.value = text;
        promptInput.focus();
        highlightBuildButton();
      }
    });
  });

  // Category pills
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('tab-active', 'bg-white/10', 'text-white'));
      pill.classList.add('tab-active', 'bg-white/10', 'text-white');
      activeCategory = pill.getAttribute('data-category');
      
      // Update prompt placeholder or sample
      if (promptInput && !promptInput.value) {
        const catSamples = {
          apps: "An internal HR portal for leave requests and employee reviews...",
          websites: "A sleek marketing landing page with custom domain, waitlist, and SEO...",
          games: "A retro 2D pixel platformer game with coin collect and high scores...",
          tools: "A real-time currency and portfolio valuation tool with live APIs..."
        };
        promptInput.value = catSamples[activeCategory] || "";
      }
    });
  });

  // Build / Plan mode toggle
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => {
        b.classList.remove('bg-white/15', 'text-white');
        b.classList.add('text-zinc-400');
      });
      btn.classList.add('bg-white/15', 'text-white');
      btn.classList.remove('text-zinc-400');
      activeMode = btn.getAttribute('data-mode');
    });
  });

  // Trigger generator simulation on submit
  if (startBuildBtn) {
    startBuildBtn.addEventListener('click', () => {
      const promptText = promptInput && promptInput.value.trim() !== '' 
        ? promptInput.value.trim() 
        : rotatingPrompts[promptIndex];
      openAiSimulator(promptText, activeCategory, activeMode);
    });
  }
}

function highlightBuildButton() {
  const btn = document.getElementById('startBuildHeroBtn');
  if (btn) {
    btn.classList.add('scale-105', 'glow-orange');
    setTimeout(() => {
      btn.classList.remove('scale-105', 'glow-orange');
    }, 400);
  }
}

// -------------------------------------------------------------
// 2. SHOWCASE INTERACTIVE WIDGETS
// -------------------------------------------------------------
function initShowcaseWidgets() {
  // Runner Widget (Distance & Duration)
  const timeBtns = document.querySelectorAll('.runner-time-btn');
  const runnerMiles = document.getElementById('runnerMiles');
  const runnerPace = document.getElementById('runnerPace');
  const runnerCalories = document.getElementById('runnerCalories');
  const runnerPolyline = document.getElementById('runnerSparkline');

  const runnerData = {
    '7D': { miles: '28.4 mi', pace: '7\'42"/mi', cals: '3,120 kcal', points: '10,70 40,55 70,62 100,35 130,48 160,25 190,15 220,30 250,18' },
    '30D': { miles: '114.2 mi', pace: '7\'38"/mi', cals: '12,450 kcal', points: '10,80 40,65 70,50 100,55 130,38 160,42 190,28 220,20 250,12' },
    '90D': { miles: '342.8 mi', pace: '7\'29"/mi', cals: '38,100 kcal', points: '10,85 40,75 70,60 100,45 130,30 160,35 190,20 220,15 250,8' }
  };

  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timeBtns.forEach(b => b.classList.remove('bg-zinc-700', 'text-white'));
      btn.classList.add('bg-zinc-700', 'text-white');
      const period = btn.getAttribute('data-period');
      if (runnerData[period]) {
        if (runnerMiles) runnerMiles.textContent = runnerData[period].miles;
        if (runnerPace) runnerPace.textContent = runnerData[period].pace;
        if (runnerCalories) runnerCalories.textContent = runnerData[period].cals;
        if (runnerPolyline) runnerPolyline.setAttribute('points', runnerData[period].points);
      }
    });
  });

  // Footprint Lab Carbon Calculator Widget
  const travelSlider = document.getElementById('travelSlider');
  const energySlider = document.getElementById('energySlider');
  const totalCarbonDisplay = document.getElementById('totalCarbonDisplay');
  const carbonOffsetBar = document.getElementById('carbonOffsetBar');

  function updateCarbon() {
    if (!travelSlider || !energySlider) return;
    const travel = parseFloat(travelSlider.value);
    const energy = parseFloat(energySlider.value);
    const total = ((travel * 0.18) + (energy * 0.35)).toFixed(1);
    if (totalCarbonDisplay) totalCarbonDisplay.textContent = `${total} tCO₂e`;
    if (carbonOffsetBar) {
      const pct = Math.min(100, Math.round((total / 15) * 100));
      carbonOffsetBar.style.width = `${pct}%`;
    }
  }

  if (travelSlider && energySlider) {
    travelSlider.addEventListener('input', updateCarbon);
    energySlider.addEventListener('input', updateCarbon);
  }

  // Total Repetitions Widget
  let repCount = 142;
  const repCountDisplay = document.getElementById('repCountDisplay');
  const addRepBtn = document.getElementById('addRepBtn');
  const minusRepBtn = document.getElementById('minusRepBtn');

  if (addRepBtn && repCountDisplay) {
    addRepBtn.addEventListener('click', () => {
      repCount += 5;
      repCountDisplay.textContent = repCount;
      repCountDisplay.classList.add('text-orange-400');
      setTimeout(() => repCountDisplay.classList.remove('text-orange-400'), 250);
    });
  }

  if (minusRepBtn && repCountDisplay) {
    minusRepBtn.addEventListener('click', () => {
      if (repCount > 0) {
        repCount = Math.max(0, repCount - 5);
        repCountDisplay.textContent = repCount;
      }
    });
  }
}

// -------------------------------------------------------------
// 3. SUPERAGENTS INTERACTIVE DEMO
// -------------------------------------------------------------
const superagentScenarios = {
  inbox: {
    title: "Your inbox, handled",
    command: "“Scan my inbox overnight. Flag anything urgent, draft replies to the easy ones, and send me a WhatsApp summary at 7am with what you handled and what still needs me”",
    badge: "24/7 Background Cron",
    steps: [
      { time: "02:14 AM", status: "completed", text: "Scanned 48 new incoming emails across Gmail & Outlook" },
      { time: "02:15 AM", status: "completed", text: "Classified: 3 urgent client requests, 12 invoices, 33 newsletters" },
      { time: "02:16 AM", status: "completed", text: "Drafted 7 context-aware replies using company guidelines" },
      { time: "07:00 AM", status: "active", text: "Dispatched WhatsApp summary with 1-click approval buttons" }
    ],
    resultSnippet: "WhatsApp Briefing: 3 items require your signature. 7 replies ready for approval in drafts."
  },
  leads: {
    title: "Leads that never go cold",
    command: "“When a new lead comes in, send a personalized follow-up within 10 minutes. No response in 3 days? Follow up again with a different angle”",
    badge: "Realtime Webhook Trigger",
    steps: [
      { time: "11:02 AM", status: "completed", text: "New lead 'Sarah Jenkins' (VP Engineering, Acme Corp) captured" },
      { time: "11:04 AM", status: "completed", text: "Enriched company data via LinkedIn & Explorium connector" },
      { time: "11:08 AM", status: "completed", text: "Sent custom value proposal addressing enterprise SOC2 compliance" },
      { time: "Pending", status: "scheduled", text: "Scheduled gentle follow-up sequence for Tuesday 10:00 AM" }
    ],
    resultSnippet: "Lead responded within 22 minutes: 'Let's book a demo for Thursday 2 PM'."
  },
  travel: {
    title: "Travel, end to end",
    command: "“For our planned family trip to NYC in May, alert me when flight prices from London drop, and keep an eye out for family-friendly events happening May 7-18. Send updates to WhatsApp”",
    badge: "Continuous Price Sentinel",
    steps: [
      { time: "Daily 04:00 AM", status: "completed", text: "Scraped Skyscanner & Google Flights for LHR -> JFK routes" },
      { time: "Yesterday", status: "completed", text: "Price drop detected: British Airways dropped from £620 to £415" },
      { time: "Today", status: "completed", text: "Curated 5 family events at Central Park & Broadway" },
      { time: "Now", status: "active", text: "Itinerary synced with Google Calendar and WhatsApp group" }
    ],
    resultSnippet: "Saved £410 across 2 tickets and pre-booked interactive museum passes."
  },
  business: {
    title: "Your business, on autopilot",
    command: "“Every Friday at 5pm, pull this week's sales numbers, support tickets, and marketing metrics. Summarize trends, flag anything that needs attention, and send the report to Slack”",
    badge: "Multi-tool Orchestrator",
    steps: [
      { time: "Friday 4:58 PM", status: "completed", text: "Queried Stripe revenue data (Weekly MRR: +14.2%)" },
      { time: "Friday 4:59 PM", status: "completed", text: "Pulled Zendesk resolution rates (Avg response: 18m)" },
      { time: "Friday 5:00 PM", status: "completed", text: "Calculated blended CAC & Google Ads ROAS (3.4x)" },
      { time: "Friday 5:00 PM", status: "active", text: "Formatted executive summary with charts & posted to #leadership" }
    ],
    resultSnippet: "Slack update delivered: 'Weekly revenue hit $48,200. Churn down 1.2%.'"
  },
  calendar: {
    title: "Your calendar, optimized",
    command: "“Every morning, check my calendar. If I have back-to-back meetings with no break, move something or block 30 minutes for lunch. Send me the updated plan on Gmail and WhatsApp”",
    badge: "Autonomous Schedule Guard",
    steps: [
      { time: "06:30 AM", status: "completed", text: "Identified 5 consecutive hours without intermission" },
      { time: "06:31 AM", status: "completed", text: "Proposed shifting internal 1:1 by 30 mins to colleague" },
      { time: "06:32 AM", status: "completed", text: "Reserved 12:30 PM - 1:00 PM 'Focus & Lunch' block" },
      { time: "06:33 AM", status: "active", text: "Delivered unified morning brief to calendar & WhatsApp" }
    ],
    resultSnippet: "Calendar protected: uninterrupted lunch break secured and teammate rescheduled automatically."
  }
};

function initSuperagents() {
  const tabs = document.querySelectorAll('.superagent-tab');
  const titleEl = document.getElementById('agentScenarioTitle');
  const cmdEl = document.getElementById('agentScenarioCmd');
  const badgeEl = document.getElementById('agentScenarioBadge');
  const stepsContainer = document.getElementById('agentScenarioSteps');
  const resultEl = document.getElementById('agentScenarioResult');

  function renderScenario(key) {
    const data = superagentScenarios[key];
    if (!data) return;

    if (titleEl) titleEl.textContent = data.title;
    if (cmdEl) cmdEl.textContent = data.command;
    if (badgeEl) badgeEl.textContent = data.badge;
    if (resultEl) resultEl.textContent = data.resultSnippet;

    if (stepsContainer) {
      stepsContainer.innerHTML = data.steps.map(s => `
        <div class="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
          <div class="mt-0.5 w-2.5 h-2.5 rounded-full ${s.status === 'completed' ? 'bg-emerald-400' : s.status === 'active' ? 'bg-orange-500 animate-pulse' : 'bg-zinc-600'}"></div>
          <div class="flex-1">
            <div class="flex items-center justify-between text-xs">
              <span class="text-zinc-400 font-mono">${s.time}</span>
              <span class="text-[10px] font-medium uppercase tracking-wider ${s.status === 'completed' ? 'text-emerald-400' : 'text-orange-400'}">${s.status}</span>
            </div>
            <p class="text-sm text-zinc-200 mt-1">${s.text}</p>
          </div>
        </div>
      `).join('');
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('bg-zinc-800', 'text-white', 'border-orange-500/50');
        t.classList.add('text-zinc-400', 'border-transparent');
      });
      tab.classList.add('bg-zinc-800', 'text-white', 'border-orange-500/50');
      tab.classList.remove('text-zinc-400', 'border-transparent');
      const key = tab.getAttribute('data-scenario');
      renderScenario(key);
    });
  });

  // Load default
  renderScenario('inbox');
}

// -------------------------------------------------------------
// 4. TEMPLATES MARKETPLACE
// -------------------------------------------------------------
const templatesData = [
  {
    id: "accupro",
    title: "AccuPro Accounting SaaS",
    category: "saas",
    badge: "Full-Stack SaaS",
    desc: "A premium, multi-tenant accounting platform with automated invoice generation, tax estimation, and Stripe billing.",
    stack: ["Auth", "Stripe", "Postgres", "PDF Export"],
    metrics: "1,420 clones · 4.9★",
    icon: "calculator",
    color: "from-blue-600 to-indigo-800"
  },
  {
    id: "seth",
    title: "SETH Personal AI Assistant",
    category: "ai",
    badge: "Superagent",
    desc: "Autonomous companion that hooks into Gmail, Notion, and Slack to orchestrate calendars, summarize threads, and track action items.",
    stack: ["OpenAI", "Gmail OAuth", "Vector DB", "Cron"],
    metrics: "3,890 clones · 5.0★",
    icon: "bot",
    color: "from-purple-600 to-pink-800"
  },
  {
    id: "mario",
    title: "Retro 2D Platformer Adventure",
    category: "games",
    badge: "Interactive Game",
    desc: "Complete arcade engine with physics, jumping mechanics, collectible coins, boss levels, and global leaderboards.",
    stack: ["HTML5 Canvas", "Web Audio", "High Scores", "Physics"],
    metrics: "2,150 clones · 4.8★",
    icon: "gamepad-2",
    color: "from-amber-600 to-orange-800"
  },
  {
    id: "starai",
    title: "Star AI Legal Counsel",
    category: "ai",
    badge: "Document AI",
    desc: "Enterprise legal workspace for contract redlining, risk identification, clause comparison, and automated non-disclosure agreements.",
    stack: ["Claude 3.7", "Doc OCR", "Audit Trail", "RBAC"],
    metrics: "940 clones · 4.9★",
    icon: "shield-check",
    color: "from-emerald-600 to-teal-800"
  },
  {
    id: "companyhub",
    title: "CompanyHub Employee Intranet",
    category: "portals",
    badge: "Internal Portal",
    desc: "Centralized employee directory with PTO booking, announcement board, org chart visualization, and onboarding roadmaps.",
    stack: ["SSO", "Google Workspace", "Row-Level Security"],
    metrics: "1,820 clones · 4.7★",
    icon: "users",
    color: "from-rose-600 to-red-800"
  },
  {
    id: "moda",
    title: "Moda Studio Curated E-Commerce",
    category: "ecommerce",
    badge: "Storefront",
    desc: "Minimalist fashion boutique storefront with real-time stock sync, cart checkout, discount codes, and customer reviews.",
    stack: ["Stripe Checkout", "Image CDN", "Order Tracking"],
    metrics: "2,760 clones · 4.9★",
    icon: "shopping-bag",
    color: "from-cyan-600 to-blue-800"
  }
];

function initTemplates() {
  const container = document.getElementById('templatesContainer');
  const filterBtns = document.querySelectorAll('.template-filter-btn');
  const searchInput = document.getElementById('templateSearchInput');

  let activeCat = 'all';
  let searchTerm = '';

  function renderTemplates() {
    if (!container) return;

    const filtered = templatesData.filter(t => {
      const matchCat = activeCat === 'all' || t.category === activeCat;
      const matchSearch = t.title.toLowerCase().includes(searchTerm) || 
                          t.desc.toLowerCase().includes(searchTerm) ||
                          t.stack.some(s => s.toLowerCase().includes(searchTerm));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center text-zinc-400">
          <i data-lucide="search-x" class="w-12 h-12 mx-auto mb-3 text-zinc-600"></i>
          <p class="text-lg font-medium text-zinc-300">No templates match your criteria</p>
          <p class="text-sm text-zinc-500 mt-1">Try a different search term or category filter</p>
        </div>
      `;
      initIcons();
      return;
    }

    container.innerHTML = filtered.map(t => `
      <div class="group relative rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden hover-card-lift flex flex-col">
        <!-- Top preview banner -->
        <div class="h-44 bg-gradient-to-br ${t.color} p-6 relative flex flex-col justify-between overflow-hidden">
          <div class="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
          <div class="relative z-10 flex items-center justify-between">
            <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10">
              ${t.badge}
            </span>
            <span class="text-xs text-white/80 font-medium">
              ${t.metrics}
            </span>
          </div>
          <div class="relative z-10 flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
              <i data-lucide="${t.icon}" class="w-6 h-6"></i>
            </div>
            <div>
              <h4 class="text-lg font-bold text-white tracking-tight">${t.title}</h4>
              <p class="text-xs text-white/70">Production Ready · 1-Click Fork</p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <p class="text-sm text-zinc-400 leading-relaxed">${t.desc}</p>
            <div class="flex flex-wrap gap-1.5 mt-4">
              ${t.stack.map(s => `<span class="px-2 py-0.5 text-[11px] rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60 font-mono">${s}</span>`).join('')}
            </div>
          </div>

          <div class="pt-6 mt-6 border-t border-zinc-800/80 flex items-center gap-2">
            <button onclick="openAiSimulator('Template clone: ${t.title}', 'apps', 'build')" class="flex-1 py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-orange-600"></i>
              Customize with AI
            </button>
            <button onclick="alert('Viewing live interactive demo for ${t.title}')" class="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors" title="Live Preview">
              <i data-lucide="external-link" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    initIcons();
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-white', 'text-black');
        b.classList.add('bg-zinc-800/60', 'text-zinc-400');
      });
      btn.classList.add('bg-white', 'text-black');
      btn.classList.remove('bg-zinc-800/60', 'text-zinc-400');
      activeCat = btn.getAttribute('data-category');
      renderTemplates();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      renderTemplates();
    });
  }

  renderTemplates();
}

// -------------------------------------------------------------
// 5. 100% FREE UNLIMITED ENGINE & RESOURCE CALCULATOR
// -------------------------------------------------------------
function initPricing() {
  // Free Resource Calculator slider
  const creditSlider = document.getElementById('creditUsageSlider');
  const creditDisplay = document.getElementById('creditUsageDisplay');
  const costDisplay = document.getElementById('freeCostDisplay');
  const recommendedPlan = document.getElementById('recommendedPlanBadge');

  if (creditSlider) {
    creditSlider.addEventListener('input', () => {
      const val = parseInt(creditSlider.value);
      if (creditDisplay) {
        creditDisplay.textContent = val.toLocaleString() + " operations / mo";
      }
      if (costDisplay) {
        costDisplay.textContent = "$0.00 (100% Free Forever)";
      }
      if (recommendedPlan) {
        recommendedPlan.textContent = "Status: 100% Free & Unlimited";
      }
    });
  }
}

// -------------------------------------------------------------
// 6. FAQ ACCORDION
// -------------------------------------------------------------
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (trigger && answer) {
      trigger.addEventListener('click', () => {
        const isOpen = !answer.classList.contains('hidden');
        
        // Close others
        faqItems.forEach(other => {
          const otherAns = other.querySelector('.faq-answer');
          const otherIcon = other.querySelector('.faq-icon');
          if (otherAns) otherAns.classList.add('hidden');
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        });

        if (!isOpen) {
          answer.classList.remove('hidden');
          if (icon) icon.style.transform = 'rotate(180deg)';
        }
      });
    }
  });
}

// -------------------------------------------------------------
// 7. MOBILE MENU
// -------------------------------------------------------------
function initMobileMenu() {
  const openBtn = document.getElementById('mobileMenuBtn');
  const closeBtn = document.getElementById('mobileMenuCloseBtn');
  const menu = document.getElementById('mobileMenuDrawer');

  if (openBtn && menu) {
    openBtn.addEventListener('click', () => {
      menu.classList.remove('hidden');
    });
  }

  if (closeBtn && menu) {
    closeBtn.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  }
}

// -------------------------------------------------------------
// 8. INTERACTIVE AI APP GENERATOR SIMULATOR MODAL
// -------------------------------------------------------------
let simInterval = null;

function initSimModal() {
  const modal = document.getElementById('aiSimModal');
  const closeBtn = document.getElementById('closeSimModalBtn');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      if (simInterval) clearInterval(simInterval);
    });
  }
}

function openAiSimulator(promptText, category, mode) {
  const modal = document.getElementById('aiSimModal');
  const promptDisplay = document.getElementById('simPromptText');
  const logContainer = document.getElementById('simLogStream');
  const progressBar = document.getElementById('simProgressBar');
  const stepLabel = document.getElementById('simStepLabel');
  const previewFrame = document.getElementById('simPreviewContainer');

  if (!modal) return;
  modal.classList.remove('hidden');

  if (promptDisplay) promptDisplay.textContent = `"${promptText}"`;
  if (progressBar) progressBar.style.width = '0%';
  if (logContainer) logContainer.innerHTML = '';
  if (stepLabel) stepLabel.textContent = 'Initializing AI Vibe Coding Engine...';

  if (previewFrame) {
    previewFrame.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
        <div class="w-12 h-12 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
        <p class="text-sm font-mono text-zinc-400">Synthesizing architecture & code...</p>
      </div>
    `;
  }

  const steps = [
    { pct: 15, label: "Analyzing prompt & schema", log: "Parsed requirements: multi-entity data model, auth, custom business logic." },
    { pct: 35, label: "Scaffolding Database & APIs", log: "Created PostgreSQL tables: [users, items, transactions, audit_logs] with Row-Level Security." },
    { pct: 55, label: "Synthesizing UI Components", log: "Generated responsive Tailwind layout, interactive charts, and form validation." },
    { pct: 75, label: "Injecting Built-in Connectors", log: "Wired Stripe webhook endpoint, email notification service, and auth tokens." },
    { pct: 95, label: "Compiling & Deploying to Edge CDN", log: "Production build complete (0.84s). SSL certificate provisioned automatically." },
    { pct: 100, label: "Live Application Ready!", log: "Application is live at https://app-preview.base44.io" }
  ];

  let currentStep = 0;
  if (simInterval) clearInterval(simInterval);

  simInterval = setInterval(() => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      if (progressBar) progressBar.style.width = `${step.pct}%`;
      if (stepLabel) stepLabel.textContent = step.label;
      if (logContainer) {
        const logLine = document.createElement('div');
        logLine.className = "text-xs font-mono text-zinc-300 flex items-center gap-2 py-0.5";
        logLine.innerHTML = `<span class="text-emerald-400">✓</span> <span class="text-zinc-500">[${new Date().toLocaleTimeString()}]</span> ${step.log}`;
        logContainer.appendChild(logLine);
        logContainer.scrollTop = logContainer.scrollHeight;
      }
      currentStep++;
    } else {
      clearInterval(simInterval);
      renderLiveAppPreview(promptText, previewFrame);
    }
  }, 750);
}

function renderLiveAppPreview(promptText, container) {
  if (!container) return;
  
  container.innerHTML = `
    <div class="h-full flex flex-col bg-zinc-950 text-white rounded-lg border border-zinc-800 overflow-hidden">
      <!-- Simulated App Header -->
      <div class="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-orange-500"></span>
          <span class="font-bold text-sm tracking-tight">Active Preview</span>
          <span class="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 font-mono">Live on Edge</span>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <button class="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300">Share Link</button>
          <button class="px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white font-medium">Export Code</button>
        </div>
      </div>

      <!-- App Body -->
      <div class="p-6 overflow-y-auto flex-1 space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h3 class="text-xl font-bold text-white">Generated Production App</h3>
            <p class="text-xs text-zinc-400 mt-1">Prompt: "${promptText.substring(0, 70)}..."</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 text-xs rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">Database: Connected</span>
            <span class="px-3 py-1 text-xs rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">Auth: Ready</span>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="grid grid-cols-3 gap-3">
          <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <span class="text-xs text-zinc-400">Total Active Users</span>
            <div class="text-2xl font-bold text-white mt-1">1,280</div>
            <span class="text-[10px] text-emerald-400 mt-1 inline-block">↑ 24% this week</span>
          </div>
          <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <span class="text-xs text-zinc-400">Processed Volume</span>
            <div class="text-2xl font-bold text-white mt-1">$49,200</div>
            <span class="text-[10px] text-emerald-400 mt-1 inline-block">via Stripe Connect</span>
          </div>
          <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <span class="text-xs text-zinc-400">API Response Time</span>
            <div class="text-2xl font-bold text-white mt-1">32 ms</div>
            <span class="text-[10px] text-zinc-400 mt-1 inline-block">Edge CDN Cached</span>
          </div>
        </div>

        <!-- Interactive Form Sample -->
        <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h4 class="text-sm font-semibold text-zinc-200">Interactive Entity Manager</h4>
          <div class="flex gap-2">
            <input type="text" id="demoAppInput" placeholder="Add new record to database..." class="flex-1 px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-orange-500">
            <button onclick="addDemoRecord()" class="px-4 py-2 text-xs rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium">+ Add Record</button>
          </div>
          <div id="demoRecordsList" class="space-y-1.5 pt-2">
            <div class="flex items-center justify-between text-xs p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
              <span class="text-zinc-300">⚡ Initialized database schema with sample records</span>
              <span class="text-[10px] text-emerald-400">Verified</span>
            </div>
            <div class="flex items-center justify-between text-xs p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
              <span class="text-zinc-300">🔐 Row-level security policies enforced for admin & member roles</span>
              <span class="text-[10px] text-emerald-400">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.addDemoRecord = function() {
  const input = document.getElementById('demoAppInput');
  const list = document.getElementById('demoRecordsList');
  if (input && list && input.value.trim() !== '') {
    const item = document.createElement('div');
    item.className = "flex items-center justify-between text-xs p-2 rounded bg-zinc-950/70 border border-orange-500/30 text-white animate-pulse";
    item.innerHTML = `<span>📝 ${input.value.trim()}</span><span class="text-[10px] text-orange-400">Stored in DB</span>`;
    list.prepend(item);
    input.value = '';
    setTimeout(() => item.classList.remove('animate-pulse'), 800);
  }
};

// -------------------------------------------------------------
// 9. ENTERPRISE & CONTACT MODALS
// -------------------------------------------------------------
function initContactModals() {
  const enterpriseModal = document.getElementById('enterpriseModal');
  const openEnterpriseBtns = document.querySelectorAll('.open-enterprise-modal-btn');
  const closeEnterpriseBtn = document.getElementById('closeEnterpriseModalBtn');
  const enterpriseForm = document.getElementById('enterpriseLeadForm');

  openEnterpriseBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (enterpriseModal) enterpriseModal.classList.remove('hidden');
    });
  });

  if (closeEnterpriseBtn && enterpriseModal) {
    closeEnterpriseBtn.addEventListener('click', () => {
      enterpriseModal.classList.add('hidden');
    });
  }

  if (enterpriseForm) {
    enterpriseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert("Thank you! Our enterprise solution engineering team will reach out within 24 hours.");
      enterpriseModal.classList.add('hidden');
      enterpriseForm.reset();
    });
  }
}
