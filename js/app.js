/**
 * SG Champion Club Pickleball Frontend Controller
 * 100% Standalone & Offline Ready (Zero external CDN/API dependencies)
 */

class App {
  constructor() {
    this.currentView = 'leaderboard';
    this.currentTournamentTab = 'results';
    this.leaderboardMode = 'teams'; // 'teams' or 'individuals'
    this.players = [];
    this.individualPlayers = [];
    this.tournaments = [];
    this.messages = [];
    this.activeTournament = null;
    this.replyTargetId = null;
  }

  init() {
    try {
      this.bindEvents();
      this.applyLanguage();
      this.loadData();
      this.renderLeaderboard();
      this.initTournamentsSelect();
      this.initH2HSelect();
      this.loadMessages();
    } catch (err) {
      console.error('App init error:', err);
    }
  }

  bindEvents() {
    // 1. Brand Logo
    const brand = document.getElementById('brand-logo');
    if (brand) {
      brand.addEventListener('click', () => this.navigate('leaderboard'));
    }

    // 2. Navigation Tabs (desktop and mobile)
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-nav');
        if (target) this.navigate(target);
      });
    });

    // 3. Language switcher
    const btnEn = document.getElementById('lang-btn-en');
    const btnCn = document.getElementById('lang-btn-cn');
    if (btnEn) btnEn.addEventListener('click', () => this.setLanguage('en'));
    if (btnCn) btnCn.addEventListener('click', () => this.setLanguage('cn'));

    // 4. Leaderboard Mode (Teams vs Individuals)
    const btnTeams = document.getElementById('lb-mode-teams');
    const btnInds = document.getElementById('lb-mode-individuals');
    if (btnTeams) btnTeams.addEventListener('click', () => this.setLeaderboardMode('teams'));
    if (btnInds) btnInds.addEventListener('click', () => this.setLeaderboardMode('individuals'));

    // 5. Leaderboard Search Filter
    const searchInput = document.getElementById('player-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterLeaderboard());
    }

    // 6. Tournament Select & Tabs
    const tourneySelect = document.getElementById('tournament-select');
    if (tourneySelect) {
      tourneySelect.addEventListener('change', () => this.changeTournament());
    }
    document.querySelectorAll('[data-ttab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-ttab');
        if (tab) this.setTournamentTab(tab);
      });
    });

    // 7. Head-to-Head Selectors
    const h2h1 = document.getElementById('h2h-player-1');
    const h2h2 = document.getElementById('h2h-player-2');
    if (h2h1) h2h1.addEventListener('change', () => this.renderH2H());
    if (h2h2) h2h2.addEventListener('change', () => this.renderH2H());

    // 8. Board Message Posting & Cancel Reply
    const btnSubmitMsg = document.getElementById('btn-submit-msg');
    if (btnSubmitMsg) {
      btnSubmitMsg.addEventListener('click', () => this.submitMessage());
    }
    const btnCancelReply = document.getElementById('btn-cancel-reply');
    if (btnCancelReply) {
      btnCancelReply.addEventListener('click', () => this.cancelReply());
    }

    // 9. Profile Modal Close & Backdrop Click
    const modalCloseBtn = document.getElementById('modal-close-btn');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => this.closePlayerModal());
    }
    const modal = document.getElementById('player-profile-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closePlayerModal();
      });
    }

    // 10. Global Event Delegation for Dynamically Rendered Elements
    document.addEventListener('click', (e) => {
      // Profile clicks
      const profileTrigger = e.target.closest('[data-profile-id]');
      if (profileTrigger) {
        e.preventDefault();
        const pid = profileTrigger.getAttribute('data-profile-id');
        if (pid) this.showPlayerProfile(pid);
        return;
      }

      // Message likes
      const likeTrigger = e.target.closest('[data-like-id]');
      if (likeTrigger) {
        e.preventDefault();
        const mid = likeTrigger.getAttribute('data-like-id');
        if (mid) this.likeMessage(mid);
        return;
      }

      // Message reply targets
      const replyTrigger = e.target.closest('[data-reply-id]');
      if (replyTrigger) {
        e.preventDefault();
        const mid = replyTrigger.getAttribute('data-reply-id');
        const author = replyTrigger.getAttribute('data-reply-author') || 'Player';
        if (mid) this.setReplyTarget(mid, author);
        return;
      }
    });
  }

  setLanguage(lang) {
    if (window.i18n) {
      window.i18n.setLanguage(lang);
    }
  }

  applyLanguage() {
    const lang = window.i18n ? window.i18n.currentLang : 'en';

    const btnEn = document.getElementById('lang-btn-en');
    const btnCn = document.getElementById('lang-btn-cn');
    if (btnEn && btnCn) {
      btnEn.classList.toggle('active', lang === 'en');
      btnCn.classList.toggle('active', lang === 'cn');
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && window.i18n) {
        el.textContent = window.i18n.t(key);
      }
    });

    const searchInput = document.getElementById('player-search');
    if (searchInput && window.i18n) {
      searchInput.placeholder = window.i18n.t('searchPlaceholder');
    }

    const nickInput = document.getElementById('msg-nickname');
    if (nickInput && window.i18n) {
      nickInput.placeholder = window.i18n.t('boardNicknamePlaceholder');
    }

    const msgContentInput = document.getElementById('msg-content');
    if (msgContentInput && window.i18n) {
      msgContentInput.placeholder = window.i18n.t('boardPlaceholder');
    }

    if (this.players && this.players.length > 0) {
      this.renderLeaderboard();
      if (this.activeTournament) {
        this.renderTournamentResults();
        this.renderGroupMatrices();
        this.renderKnockoutBracket();
      }
      this.initH2HSelect();
      this.renderH2H();
      this.renderMessages();
    }
  }

  t(key) {
    return window.i18n ? window.i18n.t(key) : key;
  }

  // --- SVG Offline Avatar Generator ---
  getInitialsAvatar(name = 'Player') {
    // Generate deterministic background color based on name string
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      ['#10b981', '#064e3b'], // Emerald
      ['#a3e635', '#365314'], // Lime
      ['#0ea5e9', '#082f49'], // Sky
      ['#8b5cf6', '#2e1065'], // Purple
      ['#f59e0b', '#451a03'], // Amber
      ['#ec4899', '#500724']  // Pink
    ];
    const pair = colors[Math.abs(hash) % colors.length];

    // Get 1-2 initials
    const words = name.replace(/[\(\)\[\]\/]/g, ' ').trim().split(/\s+/).filter(Boolean);
    let initials = 'PB';
    if (words.length >= 2) {
      initials = (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      initials = words[0].substring(0, 2).toUpperCase();
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <linearGradient id="g_${Math.abs(hash)}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${pair[0]}"/>
          <stop offset="100%" stop-color="${pair[1]}"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="32" fill="url(#g_${Math.abs(hash)})"/>
      <text x="32" y="38" font-family="-apple-system, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
    </svg>`;

    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  loadData() {
    const mock = window.embeddedMockData || { players: [], tournaments: [] };
    this.players = [...(mock.players || [])];
    this.tournaments = [...(mock.tournaments || [])];
    this.computeRatingsAndStats();
  }

  computeRatingsAndStats() {
    const BASELINE = 1500;

    // 1. Reset all teams to initial baseline rating (1500)
    const teamStats = new Map();
    this.players.forEach(p => {
      teamStats.set(p.id, {
        ...p,
        avatar_url: this.getInitialsAvatar(p.name),
        initial_rating: BASELINE,
        current_rating: BASELINE,
        peak_rating: BASELINE,
        total_matches: 0,
        total_wins: 0,
        total_losses: 0,
        points_scored: 0,
        points_conceded: 0,
        ratingHistory: [
          { date: 'Start', new_rating: BASELINE, reason: 'Tournament Start Baseline' }
        ]
      });
    });

    // 2. Map of Individuals
    const indMap = new Map();

    const normalizePlayerName = (rawName) => {
      let clean = rawName.trim();
      const lower = clean.toLowerCase();
      if (lower === 'eddy' || lower === 'eddy tham') return 'Eddy Tham';
      if (lower === 'kenneth' || lower === 'kenneth chin') return 'Kenneth Chin';
      if (lower === 'chee min ping') return 'Chee Min Ping';
      if (lower === 'kwek mean luck' || lower === 'justice kwek' || lower === 'kwek') return 'Kwek Mean Luck';
      return clean;
    };

    const getOrCreateInd = (rawName) => {
      const norm = normalizePlayerName(rawName);
      const key = norm.toLowerCase();
      if (!indMap.has(key)) {
        const id = 'ind-' + key.replace(/[^a-z0-9]/g, '-');
        indMap.set(key, {
          id,
          name: norm,
          avatar_url: this.getInitialsAvatar(norm),
          initial_rating: BASELINE,
          current_rating: BASELINE,
          peak_rating: BASELINE,
          total_matches: 0,
          total_wins: 0,
          total_losses: 0,
          points_scored: 0,
          points_conceded: 0,
          dupr_rating: 3.50,
          skill_level: 'Intermediate (3.5+)',
          teams: new Set(),
          matchRecords: [],
          ratingHistory: [
            { date: 'Start', new_rating: BASELINE, reason: 'Tournament Start Baseline' }
          ]
        });
      }
      return indMap.get(key);
    };

    // Pre-register individuals from teams
    this.players.forEach(team => {
      let names = [];
      const matchParen = team.name.match(/\(([^)]+)\)/);
      if (matchParen) {
        names = matchParen[1].split('/').map(s => s.trim());
      } else {
        names = team.name.split('/').map(s => s.trim());
      }
      names.forEach(n => {
        if (!n) return;
        const ind = getOrCreateInd(n);
        ind.teams.add(team.name);
      });
    });

    // 3. Process each tournament match in chronological order and exchange rating points
    (this.tournaments || []).forEach(tour => {
      const matches = tour.matches || [];

      matches.forEach(m => {
        const t1 = teamStats.get(m.player1_id);
        const t2 = teamStats.get(m.player2_id);
        if (!t1 || !t2) return;

        const isT1Winner = m.winner_id === t1.id;
        const winnerTeam = isT1Winner ? t1 : t2;
        const loserTeam = isT1Winner ? t2 : t1;
        const winnerScore = isT1Winner ? m.player1_score : m.player2_score;
        const loserScore = isT1Winner ? m.player2_score : m.player1_score;

        // Calculate rating delta using standard RatingCalculator
        const deltaResult = window.RatingCalculator.calculateMatchDelta(
          winnerTeam.current_rating,
          loserTeam.current_rating,
          winnerScore,
          loserScore
        );

        const delta = deltaResult.winnerGain;

        m.p1_rating_change = isT1Winner ? delta : -delta;
        m.p2_rating_change = isT1Winner ? -delta : delta;
        m.p1_rating_before = t1.current_rating;
        m.p2_rating_before = t2.current_rating;

        // Update team stats
        t1.total_matches++;
        t2.total_matches++;
        t1.points_scored += m.player1_score;
        t1.points_conceded += m.player2_score;
        t2.points_scored += m.player2_score;
        t2.points_conceded += m.player1_score;

        if (isT1Winner) {
          t1.total_wins++;
          t2.total_losses++;
          t1.current_rating += delta;
          t2.current_rating = Math.max(1000, t2.current_rating - delta);
        } else {
          t2.total_wins++;
          t1.total_losses++;
          t2.current_rating += delta;
          t1.current_rating = Math.max(1000, t1.current_rating - delta);
        }

        t1.peak_rating = Math.max(t1.peak_rating, t1.current_rating);
        t2.peak_rating = Math.max(t2.peak_rating, t2.current_rating);

        t1.ratingHistory.push({
          date: m.round_name,
          new_rating: t1.current_rating,
          change: m.p1_rating_change,
          reason: `${m.round_name} vs ${t2.name}`
        });

        t2.ratingHistory.push({
          date: m.round_name,
          new_rating: t2.current_rating,
          change: m.p2_rating_change,
          reason: `${m.round_name} vs ${t1.name}`
        });

        // 4. Update individual player ratings and match records
        const parseNames = (teamObj) => {
          const match = teamObj.name.match(/\(([^)]+)\)/);
          return (match ? match[1] : teamObj.name).split('/').map(s => normalizePlayerName(s.trim()));
        };

        const t1Names = parseNames(t1);
        const t2Names = parseNames(t2);

        // Update T1 players
        t1Names.forEach(n => {
          const ind = indMap.get(n.toLowerCase());
          if (!ind) return;
          ind.total_matches++;
          ind.points_scored += m.player1_score;
          ind.points_conceded += m.player2_score;

          if (isT1Winner) {
            ind.total_wins++;
            ind.current_rating += delta;
          } else {
            ind.total_losses++;
            ind.current_rating = Math.max(1000, ind.current_rating - delta);
          }

          ind.peak_rating = Math.max(ind.peak_rating, ind.current_rating);
          ind.matchRecords.push({
            tournament_title: tour.title,
            date: tour.tournament_date,
            round_name: m.round_name,
            set_scores: m.set_scores,
            player1_score: m.player1_score,
            player2_score: m.player2_score,
            won: isT1Winner,
            delta: isT1Winner ? delta : -delta,
            partner: t1Names.filter(x => x !== n).join(', ') || 'Partner',
            opponents: t2Names.join(' & ')
          });

          const titleParts = (tour.title || '').split('-');
          const tourShort = titleParts.length > 1 ? titleParts[1].trim() : tour.title;
          ind.ratingHistory.push({
            date: m.round_name,
            new_rating: ind.current_rating,
            change: isT1Winner ? delta : -delta,
            reason: `${tourShort} ${m.round_name}`
          });
        });

        // Update T2 players
        t2Names.forEach(n => {
          const ind = indMap.get(n.toLowerCase());
          if (!ind) return;
          ind.total_matches++;
          ind.points_scored += m.player2_score;
          ind.points_conceded += m.player1_score;

          if (!isT1Winner) {
            ind.total_wins++;
            ind.current_rating += delta;
          } else {
            ind.total_losses++;
            ind.current_rating = Math.max(1000, ind.current_rating - delta);
          }

          ind.peak_rating = Math.max(ind.peak_rating, ind.current_rating);
          ind.matchRecords.push({
            tournament_title: tour.title,
            date: tour.tournament_date,
            round_name: m.round_name,
            set_scores: m.set_scores,
            player1_score: m.player2_score,
            player2_score: m.player1_score,
            won: !isT1Winner,
            delta: !isT1Winner ? delta : -delta,
            partner: t2Names.filter(x => x !== n).join(', ') || 'Partner',
            opponents: t1Names.join(' & ')
          });

          const titleParts2 = (tour.title || '').split('-');
          const tourShort2 = titleParts2.length > 1 ? titleParts2[1].trim() : tour.title;
          ind.ratingHistory.push({
            date: m.round_name,
            new_rating: ind.current_rating,
            change: !isT1Winner ? delta : -delta,
            reason: `${tourShort2} ${m.round_name}`
          });
        });
      });

      // Update tournament participants table with calculated ratings
      (tour.participants || []).forEach(part => {
        const teamObj = teamStats.get(part.player_id);
        if (teamObj) {
          part.starting_rating = BASELINE;
          part.ending_rating = teamObj.current_rating;
          part.rating_change = teamObj.current_rating - BASELINE;
        }
      });
    });

    // 5. Finalize team list sorted by rating
    this.players = Array.from(teamStats.values()).map(p => {
      const dupr = window.RatingCalculator.ratingToDupr(p.current_rating);
      return {
        ...p,
        dupr_rating: dupr,
        skill_level: window.RatingCalculator.duprToSkillLevel(dupr)
      };
    }).sort((a, b) => b.current_rating - a.current_rating);

    // 6. Finalize individual list sorted by rating
    this.individualPlayers = Array.from(indMap.values()).map(ind => {
      const dupr = window.RatingCalculator.ratingToDupr(ind.current_rating);
      return {
        ...ind,
        dupr_rating: dupr,
        skill_level: window.RatingCalculator.duprToSkillLevel(dupr),
        teams_display: Array.from(ind.teams).join(' · ')
      };
    }).sort((a, b) => b.current_rating - a.current_rating);
  }

  navigate(viewName) {
    this.currentView = viewName;
    ['leaderboard', 'tournaments', 'h2h', 'board'].forEach(v => {
      const el = document.getElementById(`view-${v}`);
      const btn = document.getElementById(`nav-${v}`);
      const mobBtn = document.getElementById(`mob-nav-${v}`);
      if (el) el.classList.toggle('hidden', v !== viewName);
      if (btn) btn.classList.toggle('active', v === viewName);
      if (mobBtn) mobBtn.classList.toggle('active', v === viewName);
    });

    // Send Google Analytics virtual pageview / view event
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'screen_view', {
        app_name: 'SG Champion Club',
        screen_name: viewName
      });
      window.gtag('event', 'page_view', {
        page_title: `SG Champion Club - ${viewName}`,
        page_path: `#${viewName}`
      });
    }

    if (viewName === 'tournaments' && !this.activeTournament && this.tournaments.length > 0) {
      this.changeTournament();
    } else if (viewName === 'h2h') {
      this.renderH2H();
    } else if (viewName === 'board') {
      this.renderMessages();
    }
  }

  setLeaderboardMode(mode) {
    this.leaderboardMode = mode;
    const btnTeams = document.getElementById('lb-mode-teams');
    const btnInds = document.getElementById('lb-mode-individuals');

    if (btnTeams && btnInds) {
      btnTeams.classList.toggle('active', mode === 'teams');
      btnInds.classList.toggle('active', mode === 'individuals');
    }

    const input = document.getElementById('player-search');
    this.renderLeaderboard(input ? input.value : '');
  }

  // --- LEADERBOARD ---
  renderLeaderboard(filterText = '') {
    const tbody = document.getElementById('leaderboard-tbody');
    const podiumContainer = document.getElementById('top-podium-cards');
    if (!tbody) return;

    const dataset = this.leaderboardMode === 'individuals' ? this.individualPlayers : this.players;

    let filtered = dataset;
    if (filterText) {
      const q = filterText.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.teams_display && p.teams_display.toLowerCase().includes(q)) ||
        (p.paddle_model && p.paddle_model.toLowerCase().includes(q)) ||
        (p.play_style && p.play_style.toLowerCase().includes(q))
      );
    }

    // Top 3 Podium
    if (podiumContainer && !filterText) {
      const top3 = dataset.slice(0, 3);
      const podiumClasses = ['gold', 'silver', 'bronze'];
      const rankLabels = [this.t('podium1st'), this.t('podium2nd'), this.t('podium3rd')];

      podiumContainer.innerHTML = top3.map((p, idx) => `
        <div class="podium-card ${podiumClasses[idx]}" data-profile-id="${p.id}" style="cursor: pointer;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${p.avatar_url}" alt="${p.name}" class="podium-avatar">
            <div>
              <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: var(--pb-slate-text);">${rankLabels[idx]}</div>
              <div style="font-size: 15px; font-weight: 900; color: #fff;">${p.name}</div>
              <div style="font-size: 11px; color: var(--pb-lime); font-weight: 700; margin-top: 2px;">DUPR: ${p.dupr_rating} · ${p.skill_level}</div>
              ${p.teams_display ? `<div style="font-size: 10px; color: var(--pb-slate-text); margin-top: 2px;">👥 ${p.teams_display}</div>` : ''}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: 900; color: var(--pb-lime);">${p.current_rating}</div>
            <div style="font-size: 11px; color: var(--pb-slate-muted);">${this.t('colPeak')}: ${p.peak_rating}</div>
          </div>
        </div>
      `).join('');
    }

    // Table rows
    tbody.innerHTML = filtered.map((p, index) => {
      const winRate = p.total_matches > 0 ? Math.round((p.total_wins / p.total_matches) * 100) : 0;
      let rankBadge = `<span class="rank-badge rank-plain">${index + 1}</span>`;
      if (index === 0) rankBadge = `<span class="rank-badge rank-gold">1</span>`;
      if (index === 1) rankBadge = `<span class="rank-badge rank-silver">2</span>`;
      if (index === 2) rankBadge = `<span class="rank-badge rank-bronze">3</span>`;

      let tierClass = 'badge-dupr-inter';
      if (p.dupr_rating >= 4.5) tierClass = 'badge-dupr-pro';
      else if (p.dupr_rating >= 4.0) tierClass = 'badge-dupr-adv';

      const subtitle = p.teams_display 
        ? `<span style="font-size: 11px; color: var(--pb-slate-text); display: block;">🛡️ Team: ${p.teams_display}</span>`
        : `<span style="font-size: 11px; color: var(--pb-slate-text); display: block;">${p.play_style || 'All-court'}</span>`;

      return `
        <tr>
          <td style="text-align: center;">${rankBadge}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${p.avatar_url}" style="width: 36px; height: 36px; border-radius: 50%; border: 1px solid #1e293b;">
              <div>
                <a href="javascript:void(0)" data-profile-id="${p.id}" style="color: #fff; font-weight: 700;">${p.name}</a>
                ${subtitle}
              </div>
            </div>
          </td>
          <td style="text-align: center;">
            <span class="badge-dupr ${tierClass}">DUPR ${p.dupr_rating}</span>
          </td>
          <td style="text-align: center; color: var(--pb-slate-text); font-size: 12px;">${p.paddle_model || 'Standard'}</td>
          <td style="text-align: center; font-weight: 900; color: var(--pb-lime); font-size: 15px;">${p.current_rating}</td>
          <td style="text-align: center; color: var(--pb-slate-text); font-size: 12px;">${p.peak_rating}</td>
          <td style="text-align: center; font-size: 12px;">
            ${p.total_matches} <span style="color: var(--pb-lime);">(${p.total_wins}W</span> / <span style="color: var(--pb-rose);">${p.total_losses}L)</span>
          </td>
          <td style="text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 800; background: ${winRate >= 65 ? 'rgba(163, 230, 53, 0.15)' : '#1e293b'}; color: ${winRate >= 65 ? 'var(--pb-lime)' : '#cbd5e1'};">
              ${winRate}%
            </span>
          </td>
          <td style="text-align: center;">
            <button data-profile-id="${p.id}" class="btn-action">
              ${this.t('colAction')}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  filterLeaderboard() {
    const input = document.getElementById('player-search');
    this.renderLeaderboard(input ? input.value : '');
  }

  // --- TOURNAMENTS LOGIC ---
  initTournamentsSelect() {
    const sel = document.getElementById('tournament-select');
    if (!sel) return;
    sel.innerHTML = this.tournaments.map(t => `
      <option value="${t.id}">${t.title}</option>
    `).join('');
  }

  changeTournament() {
    const sel = document.getElementById('tournament-select');
    if (!sel) return;
    const tid = sel.value;
    const tournament = (this.tournaments || []).find(t => t.id === tid) || this.tournaments[0];
    const details = {
      tournament,
      participants: tournament ? tournament.participants : [],
      matches: tournament ? tournament.matches : []
    };
    this.activeTournament = details;

    const badge = document.getElementById('tournament-meta-badge');
    if (badge && details.tournament) {
      badge.innerHTML = `
        <span style="padding: 4px 10px; border-radius: 6px; background: #0b1120; border: 1px solid #1e293b; color: var(--pb-slate-text);">
          📅 ${details.tournament.tournament_date}
        </span>
        <span style="padding: 4px 10px; border-radius: 6px; background: #0b1120; border: 1px solid #1e293b; color: var(--pb-slate-text);">
          📍 ${details.tournament.location}
        </span>
        <span style="padding: 4px 10px; border-radius: 6px; background: rgba(163, 230, 53, 0.15); border: 1px solid rgba(163, 230, 53, 0.3); color: var(--pb-lime); font-weight: 700;">
          ✓ ${this.t('statusCompleted')}
        </span>
      `;
    }

    this.renderTournamentResults();
    this.renderGroupMatrices();
    this.renderKnockoutBracket();
  }

  setTournamentTab(tab) {
    this.currentTournamentTab = tab;
    ['results', 'groups', 'knockout'].forEach(t => {
      const el = document.getElementById(`subview-${t}`);
      const btn = document.getElementById(`ttab-${t}`);
      if (el) el.classList.toggle('hidden', t !== tab);
      if (btn) btn.classList.toggle('active', t === tab);
    });
  }

  renderTournamentResults() {
    const tbody = document.getElementById('tournament-results-tbody');
    if (!tbody || !this.activeTournament) return;

    const parts = [...this.activeTournament.participants].sort((a, b) => a.final_rank - b.final_rank);
    tbody.innerHTML = parts.map(p => {
      const playerObj = this.players.find(pl => pl.id === p.player_id) || { name: 'Player', avatar_url: this.getInitialsAvatar('Player') };
      const changeClass = p.rating_change >= 0 ? 'color: var(--pb-lime);' : 'color: var(--pb-rose);';
      const changeSign = p.rating_change >= 0 ? `+${p.rating_change}` : `${p.rating_change}`;

      const rankBadge = p.final_rank <= 3
        ? `<span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); font-weight: 900;">${this.t('rankPrefix')}${p.final_rank}</span>`
        : `<span style="color: var(--pb-slate-text); font-weight: 700;">${this.t('rankPrefix')}${p.final_rank}</span>`;

      return `
        <tr>
          <td style="text-align: center; font-weight: 700;">${rankBadge}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${playerObj.avatar_url}" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid #1e293b;">
              <span style="color: #fff; font-weight: 700; cursor: pointer;" data-profile-id="${p.player_id}">${playerObj.name}</span>
            </div>
          </td>
          <td style="text-align: center; color: var(--pb-slate-text);">${p.starting_rating}</td>
          <td style="text-align: center; font-weight: 700; ${changeClass}">${changeSign}</td>
          <td style="text-align: center; font-weight: 900; color: var(--pb-lime);">${p.ending_rating}</td>
        </tr>
      `;
    }).join('');
  }

  renderGroupMatrices() {
    const container = document.getElementById('group-matrices-container');
    if (!container || !this.activeTournament) return;

    const groupMatches = (this.activeTournament.matches || []).filter(m => m.stage === 'group');

    if (groupMatches.length === 0) {
      container.innerHTML = `
        <div class="court-card" style="padding: 32px; text-align: center; color: var(--pb-slate-text);">
          <div style="font-size: 32px; margin-bottom: 8px;">🏆</div>
          <p style="font-weight: 800; color: #fff; font-size: 15px;">${this.activeTournament.tournament.title}</p>
          <p style="font-size: 13px; margin-top: 4px;">${this.activeTournament.tournament.format}</p>
          <p style="font-size: 12px; color: var(--pb-lime); margin-top: 12px; font-weight: 700;">This tournament was conducted directly via Single Elimination Knockout. Check the "Championship Knockout Tree" tab to see match brackets.</p>
        </div>
      `;
      return;
    }

    const groups = this.activeTournament.tournament.groups || ['Pool Court 1', 'Pool Court 2'];

    container.innerHTML = groups.map(gName => {
      const matchesInGroup = groupMatches.filter(m => m.group_name === gName);
      const playerIds = new Set();
      matchesInGroup.forEach(m => {
        playerIds.add(m.player1_id);
        playerIds.add(m.player2_id);
      });
      const pList = Array.from(playerIds).map(id => this.players.find(p => p.id === id)).filter(Boolean);

      let headersHtml = pList.map((p, i) => `<th style="width: 90px;">${i + 1}. ${p.name.split(' ')[0]}</th>`).join('');
      let rowsHtml = pList.map((rowP, rIdx) => {
        let wins = 0;
        let losses = 0;
        let setsWon = 0;
        let setsLost = 0;

        let cellsHtml = pList.map((colP, cIdx) => {
          if (rIdx === cIdx) {
            return `<td class="diagonal"></td>`;
          }
          const match = matchesInGroup.find(m => 
            (m.player1_id === rowP.id && m.player2_id === colP.id) ||
            (m.player1_id === colP.id && m.player2_id === rowP.id)
          );

          if (!match) return `<td style="color: var(--pb-slate-muted);">-</td>`;

          const isP1 = match.player1_id === rowP.id;
          const myScore = isP1 ? match.player1_score : match.player2_score;
          const opScore = isP1 ? match.player2_score : match.player1_score;

          setsWon += myScore;
          setsLost += opScore;
          if (myScore > opScore) wins++;
          else losses++;

          const isWin = myScore > opScore;
          return `
            <td style="font-weight: 700; color: ${isWin ? 'var(--pb-lime)' : 'var(--pb-slate-text)'};">
              ${myScore} : ${opScore}
              <div style="font-size: 10px; color: var(--pb-slate-muted);">${match.set_scores || ''}</div>
            </td>
          `;
        }).join('');

        return `
          <tr>
            <td style="font-weight: 700; text-align: left; padding-left: 12px; color: #fff;">${rIdx + 1}. ${rowP.name}</td>
            ${cellsHtml}
            <td style="font-weight: 900; color: var(--pb-lime);">${wins}W / ${losses}L</td>
            <td style="font-size: 12px; color: var(--pb-slate-text);">${setsWon}-${setsLost}</td>
          </tr>
        `;
      }).join('');

      return `
        <div class="court-card" style="overflow: hidden;">
          <div style="padding: 14px 18px; background: #0b1120; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between;">
            <h4 style="font-weight: 900; color: #fff; font-size: 14px;">${gName} ${this.t('matrixTitleSuffix')}</h4>
            <span style="font-size: 12px; color: var(--pb-slate-text); font-weight: 600;">${this.t('matrixSub')}</span>
          </div>
          <div style="overflow-x: auto; padding: 14px;">
            <table class="pb-matrix-table">
              <thead>
                <tr>
                  <th style="text-align: left; width: 140px; padding-left: 12px;">${this.t('matrixHeaderPlayer')}</th>
                  ${headersHtml}
                  <th style="width: 90px;">${this.t('matrixHeaderRecord')}</th>
                  <th style="width: 80px;">${this.t('matrixHeaderDiff')}</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join('');
  }

  renderKnockoutBracket() {
    const container = document.getElementById('knockout-bracket-container');
    if (!container || !this.activeTournament) return;

    const koMatches = (this.activeTournament.matches || []).filter(m => m.stage === 'knockout');
    
    container.innerHTML = `
      <div>
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
          <h4 style="font-weight: 900; color: #fff; font-size: 15px;">
            <span>👑</span> ${this.t('koTitle')}
          </h4>
          <span style="font-size: 12px; color: var(--pb-lime); font-weight: 700;">${this.activeTournament.tournament.format || ''}</span>
        </div>

        <div class="bracket-grid">
          ${koMatches.map(m => {
            const p1 = this.players.find(p => p.id === m.player1_id) || { name: 'TBD' };
            const p2 = this.players.find(p => p.id === m.player2_id) || { name: 'TBD' };
            const p1Won = m.winner_id === m.player1_id;
            const p2Won = m.winner_id === m.player2_id;

            return `
              <div class="match-card">
                <div class="match-card-header">
                  <span style="font-weight: 800; color: var(--pb-lime);">${m.round_name}</span>
                  <span style="color: var(--pb-slate-muted); font-size: 11px;">${m.group_name || 'Knockout'}</span>
                </div>
                
                <div class="match-slot ${p1Won ? 'winner' : ''}">
                  <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 8px;">${p1.name}</span>
                  <span class="match-slot-score">${m.player1_score}</span>
                </div>

                <div class="match-slot ${p2Won ? 'winner' : ''}" style="margin-top: 6px;">
                  <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 8px;">${p2.name}</span>
                  <span class="match-slot-score">${m.player2_score}</span>
                </div>

                <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #1e293b; font-size: 11px; color: var(--pb-slate-text); display: flex; align-items: center; justify-content: space-between;">
                  <span>Score: <strong style="color: #fff;">${m.set_scores}</strong></span>
                  <span style="color: var(--pb-lime); font-weight: 800;">${p1Won ? p1.name.split(' ')[0] : p2.name.split(' ')[0]} Win</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // --- HEAD TO HEAD ---
  initH2HSelect() {
    const sel1 = document.getElementById('h2h-player-1');
    const sel2 = document.getElementById('h2h-player-2');
    if (!sel1 || !sel2) return;

    let opts = '';
    if (this.individualPlayers && this.individualPlayers.length > 0) {
      opts += `<optgroup label="Individuals (${this.individualPlayers.length})">`;
      opts += this.individualPlayers.map(p => `<option value="${p.id}">${p.name} (DUPR ${p.dupr_rating})</option>`).join('');
      opts += `</optgroup>`;
    }

    if (this.players && this.players.length > 0) {
      opts += `<optgroup label="Teams / Pairs (${this.players.length})">`;
      opts += this.players.map(p => `<option value="${p.id}">${p.name} (DUPR ${p.dupr_rating})</option>`).join('');
      opts += `</optgroup>`;
    }

    sel1.innerHTML = opts;
    sel2.innerHTML = opts;

    if (this.individualPlayers && this.individualPlayers.length >= 2) {
      sel1.selectedIndex = 0;
      sel2.selectedIndex = 1;
    } else if (this.players.length >= 2) {
      sel1.selectedIndex = 0;
      sel2.selectedIndex = 1;
    }
  }

  renderH2H() {
    const el1 = document.getElementById('h2h-player-1');
    const el2 = document.getElementById('h2h-player-2');
    const p1Id = el1 ? el1.value : '';
    const p2Id = el2 ? el2.value : '';
    const container = document.getElementById('h2h-result-container');
    if (!container || !p1Id || !p2Id) return;

    if (p1Id === p2Id) {
      container.innerHTML = `
        <div class="court-card" style="padding: 32px; text-align: center; color: var(--pb-slate-text);">
          ${this.t('h2hSelectDiff')}
        </div>
      `;
      return;
    }

    const findEntity = (id) => {
      if (id.startsWith('ind-')) {
        return this.individualPlayers.find(p => p.id === id);
      }
      return this.players.find(p => p.id === id) || this.individualPlayers.find(p => p.id === id);
    };

    const p1 = findEntity(p1Id);
    const p2 = findEntity(p2Id);
    if (!p1 || !p2) return;

    let h2h = { total: 0, p1Wins: 0, p2Wins: 0, matches: [] };

    if (p1Id.startsWith('ind-') && p2Id.startsWith('ind-')) {
      (p1.matchRecords || []).forEach(m1 => {
        if (m1.opponents.toLowerCase().includes(p2.name.toLowerCase())) {
          h2h.total++;
          if (m1.won) h2h.p1Wins++;
          else h2h.p2Wins++;
          h2h.matches.push({
            tournament_title: m1.tournament_title,
            tournament_date: m1.date,
            round_name: m1.round_name,
            set_scores: m1.set_scores,
            player1_id: p1Id,
            player2_id: p2Id,
            player1_score: m1.player1_score,
            player2_score: m1.player2_score,
            winner_id: m1.won ? p1Id : p2Id
          });
        }
      });
    } else {
      // Find matches between two teams
      let allMatches = [];
      (this.tournaments || []).forEach(t => {
        (t.matches || []).forEach(m => {
          if (
            (m.player1_id === p1Id && m.player2_id === p2Id) ||
            (m.player1_id === p2Id && m.player2_id === p1Id)
          ) {
            allMatches.push({ ...m, tournament_title: t.title, tournament_date: t.tournament_date });
          }
        });
      });
      let p1Wins = 0;
      let p2Wins = 0;
      allMatches.forEach(m => {
        if (m.winner_id === p1Id) p1Wins++;
        else if (m.winner_id === p2Id) p2Wins++;
      });
      h2h = { total: allMatches.length, p1Wins, p2Wins, matches: allMatches };
    }

    const p1WinRate = h2h.total > 0 ? Math.round((h2h.p1Wins / h2h.total) * 100) : 0;
    const p2WinRate = h2h.total > 0 ? 100 - p1WinRate : 0;

    container.innerHTML = `
      <div class="court-card h2h-clash-box">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <img src="${p1.avatar_url}" style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid var(--pb-lime);">
          <div style="font-weight: 900; color: #fff; font-size: 16px;">${p1.name}</div>
          <div style="font-size: 12px; color: var(--pb-lime); font-weight: 700;">DUPR ${p1.dupr_rating}</div>
          <div style="font-size: 11px; color: var(--pb-slate-text);">${p1.teams_display ? p1.teams_display : (p1.paddle_model || '')}</div>
        </div>

        <div>
          <div style="font-size: 42px; font-weight: 900; color: #fff; display: flex; align-items: center; justify-content: center; gap: 16px;">
            <span style="color: var(--pb-lime);">${h2h.p1Wins}</span>
            <span style="color: var(--pb-slate-muted);">:</span>
            <span style="color: var(--pb-emerald);">${h2h.p2Wins}</span>
          </div>
          <div style="font-size: 12px; color: var(--pb-slate-text); font-weight: 700; margin-top: 6px;">${h2h.total} ${this.t('h2hTotalEncounters')}</div>

          <div style="width: 100%; background: #0b1120; height: 10px; border-radius: 9999px; margin-top: 10px; overflow: hidden; display: flex; border: 1px solid #1e293b;">
            <div style="background: var(--pb-lime); height: 100%; width: ${p1WinRate}%;"></div>
            <div style="background: var(--pb-emerald); height: 100%; width: ${p2WinRate}%;"></div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <img src="${p2.avatar_url}" style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid var(--pb-emerald);">
          <div style="font-weight: 900; color: #fff; font-size: 16px;">${p2.name}</div>
          <div style="font-size: 12px; color: var(--pb-emerald); font-weight: 700;">DUPR ${p2.dupr_rating}</div>
          <div style="font-size: 11px; color: var(--pb-slate-text);">${p2.teams_display ? p2.teams_display : (p2.paddle_model || '')}</div>
        </div>
      </div>

      <div class="court-card" style="overflow: hidden;">
        <div style="padding: 14px 18px; background: #0b1120; border-bottom: 1px solid #1e293b; font-weight: 700; color: #fff; display: flex; justify-content: space-between;">
          <span>${this.t('h2hMatchesTitle')}</span>
          <span style="font-size: 12px; color: var(--pb-slate-text);">${h2h.matches.length} Matches</span>
        </div>
        <div>
          ${h2h.matches.length === 0 ? `
            <div style="padding: 32px; text-align: center; color: var(--pb-slate-text); font-size: 13px;">${this.t('h2hNoMatches')}</div>
          ` : h2h.matches.map(m => {
            const isP1Winner = m.winner_id === p1Id;
            return `
              <div style="padding: 14px 18px; border-bottom: 1px solid #1e293b; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; font-size: 13px;">
                <div>
                  <div style="font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
                    <span>${m.tournament_title || 'Pickleball Event'}</span>
                    <span style="font-size: 11px; color: var(--pb-lime); background: rgba(163, 230, 53, 0.12); padding: 2px 8px; border-radius: 4px;">${m.round_name}</span>
                  </div>
                  <div style="font-size: 11px; color: var(--pb-slate-muted); margin-top: 4px;">${m.tournament_date || ''} · ${this.t('koSetScores')}: ${m.set_scores}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; font-weight: 900;">
                  <span style="color: ${isP1Winner ? 'var(--pb-lime)' : 'var(--pb-slate-text)'};">${p1.name.split(' ')[0]} ${m.player1_id === p1Id ? m.player1_score : m.player2_score}</span>
                  <span style="color: var(--pb-slate-muted);">-</span>
                  <span style="color: ${!isP1Winner ? 'var(--pb-emerald)' : 'var(--pb-slate-text)'};">${m.player1_id === p2Id ? m.player1_score : m.player2_score} ${p2.name.split(' ')[0]}</span>
                  <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: ${isP1Winner ? 'rgba(163, 230, 53, 0.2)' : 'rgba(16, 185, 129, 0.2)'}; color: ${isP1Winner ? 'var(--pb-lime)' : 'var(--pb-emerald)'};">
                    ${isP1Winner ? `${p1.name.split(' ')[0]} ${this.t('h2hWon')}` : `${p2.name.split(' ')[0]} ${this.t('h2hWon')}`}
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // --- COURT CHAT / MESSAGES (Offline localStorage) ---
  getLocalMessages() {
    const raw = localStorage.getItem('sgcourt_local_messages');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    const defaults = [
      {
        id: "sgmsg-1",
        author_name: "DinkPro_SG",
        content: "Great championship matches! Randeep & Edwin were dominant at the kitchen line in Men's Doubles, and Henry & Claudia took Mixed Doubles with style!",
        parent_id: null,
        likes: 9,
        created_at: "2026-11-17T20:30:00Z"
      },
      {
        id: "sgmsg-2",
        author_name: "JurongKitchenCrew",
        content: "Claudia played two finals tonight (Champion in WD and Champion in XD) — crazy stamina!",
        parent_id: "sgmsg-1",
        likes: 6,
        created_at: "2026-11-17T20:45:00Z"
      }
    ];
    localStorage.setItem('sgcourt_local_messages', JSON.stringify(defaults));
    return defaults;
  }

  async loadMessages() {
    if (window.db) {
      try {
        this.messages = await window.db.getMessages();
        this.renderMessages();
        return;
      } catch (err) {
        console.warn('Failed to load messages from db, falling back to local:', err);
      }
    }
    this.messages = this.getLocalMessages();
    this.renderMessages();
  }

  saveLocalMessages(msgs) {
    this.messages = msgs;
    localStorage.setItem('sgcourt_local_messages', JSON.stringify(msgs));
  }

  renderMessages() {
    const container = document.getElementById('board-messages-container');
    if (!container) return;

    if (!this.messages || this.messages.length === 0) {
      container.innerHTML = `
        <div class="court-card" style="padding: 32px; text-align: center; color: var(--pb-slate-text); font-size: 13px;">
          ${this.t('noMessagesYet')}
        </div>
      `;
      return;
    }

    const topPosts = this.messages.filter(m => !m.parent_id);
    const replies = this.messages.filter(m => m.parent_id);

    container.innerHTML = topPosts.map(post => {
      const postReplies = replies.filter(r => r.parent_id === post.id);
      const avatarUrl = this.getInitialsAvatar(post.author_name);
      const timeStr = new Date(post.created_at).toLocaleString();

      return `
        <div class="court-card" style="padding: 18px; margin-bottom: 12px;">
          <div style="display: flex; align-items: flex-start; gap: 14px;">
            <img src="${avatarUrl}" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--pb-lime); flex-shrink: 0;">
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="font-weight: 900; color: #fff; font-size: 14px;">${this.escapeHtml(post.author_name)}</div>
                <div style="font-size: 11px; color: var(--pb-slate-muted);">${timeStr}</div>
              </div>
              <p style="color: #f1f5f9; font-size: 13px; margin-top: 6px; line-height: 1.5; white-space: pre-wrap;">${this.escapeHtml(post.content)}</p>

              <div style="display: flex; align-items: center; gap: 16px; margin-top: 10px; font-size: 12px;">
                <button data-like-id="${post.id}" style="color: var(--pb-slate-text); display: inline-flex; align-items: center; gap: 4px; font-weight: 700; background: transparent; border: none; cursor: pointer;">
                  <span>✋</span>
                  <span>${post.likes || 0}</span>
                </button>
                <button data-reply-id="${post.id}" data-reply-author="${this.escapeHtml(post.author_name)}" style="color: var(--pb-lime); display: inline-flex; align-items: center; gap: 4px; font-weight: 700; background: transparent; border: none; cursor: pointer;">
                  <span>↪</span>
                  <span>${this.t('btnReply')}</span>
                </button>
              </div>
            </div>
          </div>

          ${postReplies.length > 0 ? `
            <div style="margin-left: 44px; margin-top: 14px; padding-top: 12px; border-top: 1px solid #1e293b;">
              ${postReplies.map(r => {
                const rAvatar = this.getInitialsAvatar(r.author_name);
                const rTime = new Date(r.created_at).toLocaleString();
                return `
                  <div style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; border-radius: 10px; background: #0b1120; border: 1px solid #1e293b; margin-bottom: 8px;">
                    <img src="${rAvatar}" style="width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--pb-emerald); flex-shrink: 0;">
                    <div style="flex: 1; min-width: 0;">
                      <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="font-weight: 700; color: #fff; font-size: 12px;">${this.escapeHtml(r.author_name)}</div>
                        <div style="font-size: 10px; color: var(--pb-slate-muted);">${rTime}</div>
                      </div>
                      <p style="color: #cbd5e1; font-size: 12px; margin-top: 4px; white-space: pre-wrap;">${this.escapeHtml(r.content)}</p>
                      <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px; font-size: 11px;">
                        <button data-like-id="${r.id}" style="color: var(--pb-slate-text); display: inline-flex; align-items: center; gap: 4px; font-weight: 700; background: transparent; border: none; cursor: pointer;">
                          <span>✋</span>
                          <span>${r.likes || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  setReplyTarget(id, author) {
    this.replyTargetId = id;
    const indicator = document.getElementById('reply-target-indicator');
    const authorSpan = document.getElementById('reply-target-author');
    if (indicator && authorSpan) {
      authorSpan.textContent = author;
      indicator.classList.remove('hidden');
      indicator.classList.add('flex');
    }
    const input = document.getElementById('msg-content');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth' });
    }
  }

  cancelReply() {
    this.replyTargetId = null;
    const indicator = document.getElementById('reply-target-indicator');
    if (indicator) {
      indicator.classList.add('hidden');
      indicator.classList.remove('flex');
    }
  }

  async submitMessage() {
    const nickInput = document.getElementById('msg-nickname');
    const contentInput = document.getElementById('msg-content');
    if (!contentInput) return;

    const content = contentInput.value.trim();
    if (!content) return;

    const nickname = nickInput ? nickInput.value.trim() : '';

    if (window.db) {
      try {
        await window.db.addMessage(nickname, content, this.replyTargetId || null);
        contentInput.value = '';
        this.cancelReply();
        await this.loadMessages();
        return;
      } catch (err) {
        console.warn('Failed to add message to db, saving locally:', err);
      }
    }

    const newMsg = {
      id: 'sgmsg-' + Date.now(),
      author_name: nickname || 'Anonymous Baller',
      content,
      parent_id: this.replyTargetId || null,
      likes: 0,
      created_at: new Date().toISOString()
    };

    const msgs = this.getLocalMessages();
    msgs.unshift(newMsg);
    this.saveLocalMessages(msgs);

    contentInput.value = '';
    this.cancelReply();
    this.renderMessages();
  }

  async likeMessage(id) {
    if (window.db) {
      try {
        await window.db.likeMessage(id);
        await this.loadMessages();
        return;
      } catch (err) {
        console.warn('Failed to like message in db, updating locally:', err);
      }
    }

    const msgs = this.getLocalMessages();
    const target = msgs.find(m => m.id === id);
    if (target) {
      target.likes = (target.likes || 0) + 1;
      this.saveLocalMessages(msgs);
      this.renderMessages();
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // --- STANDALONE OFFLINE SPARKLINE CHART ---
  renderStandaloneSvgChart(chartPoints) {
    if (!chartPoints || chartPoints.length === 0) return '';
    const width = 560;
    const height = 130;
    const padX = 40;
    const padY = 24;

    const ratings = chartPoints.map(p => p.y);
    const minVal = Math.min(...ratings) - 20;
    const maxVal = Math.max(...ratings) + 20;
    const range = Math.max(1, maxVal - minVal);

    const stepX = (width - padX * 2) / Math.max(1, chartPoints.length - 1);

    const coords = chartPoints.map((pt, i) => {
      const x = padX + i * stepX;
      const y = height - padY - ((pt.y - minVal) / range) * (height - padY * 2);
      return { x, y, label: pt.x, val: pt.y };
    });

    const pointsStr = coords.map(c => `${c.x},${c.y}`).join(' ');
    const areaStr = `${coords[0].x},${height - padY} ${pointsStr} ${coords[coords.length - 1].x},${height - padY}`;

    const dotsAndLabels = coords.map(c => `
      <circle cx="${c.x}" cy="${c.y}" r="4" class="sparkline-dot"/>
      <text x="${c.x}" y="${c.y - 10}" fill="#a3e635" font-size="10" font-weight="900" text-anchor="middle">${c.val}</text>
      <text x="${c.x}" y="${height - 6}" fill="#94a3b8" font-size="9" text-anchor="middle">${c.label}</text>
    `).join('');

    return `
      <svg viewBox="0 0 ${width} ${height}" class="sparkline-svg">
        <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" stroke="#1e293b" stroke-width="1"/>
        <polygon points="${areaStr}" class="sparkline-fill"/>
        <polyline points="${pointsStr}" class="sparkline-line"/>
        ${dotsAndLabels}
      </svg>
    `;
  }

  // --- PLAYER PROFILE MODAL ---
  showPlayerProfile(playerId) {
    const modal = document.getElementById('player-profile-modal');
    const content = document.getElementById('player-modal-content');
    if (!modal || !content) return;

    const isInd = playerId.startsWith('ind-');
    const p = isInd
      ? this.individualPlayers.find(item => item.id === playerId)
      : (this.players.find(item => item.id === playerId) || this.individualPlayers.find(item => item.id === playerId));

    if (!p) return;

    let history = { matches: [], ratingHistory: [] };
    if (isInd) {
      history = {
        matches: p.matchRecords || [],
        ratingHistory: p.ratingHistory || []
      };
    } else {
      const teamMatches = [];
      (this.tournaments || []).forEach(t => {
        (t.matches || []).forEach(m => {
          if (m.player1_id === playerId || m.player2_id === playerId) {
            teamMatches.push({
              ...m,
              tournament_title: t.title,
              date: t.tournament_date
            });
          }
        });
      });
      history = {
        matches: teamMatches,
        ratingHistory: p.ratingHistory || []
      };
    }

    const winRate = p.total_matches > 0 ? Math.round((p.total_wins / p.total_matches) * 100) : 0;

    const subtitleText = p.teams_display 
      ? `Teams: <span style="color: #fff; font-weight: 700;">${p.teams_display}</span>`
      : `Paddle: <span style="color: #fff; font-weight: 700;">${p.paddle_model || 'Standard'}</span> · ${p.play_style || 'All-court'}`;

    let chartPoints = (history.ratingHistory || []).map(h => ({ x: h.date, y: h.new_rating }));
    if (chartPoints.length < 2) {
      chartPoints = [
        { x: 'Start', y: 1500 },
        { x: 'Current', y: p.current_rating }
      ];
    }

    const svgChartHtml = this.renderStandaloneSvgChart(chartPoints);

    content.innerHTML = `
      <div class="space-y-6">
        <div style="display: flex; align-items: center; gap: 16px;">
          <img src="${p.avatar_url}" style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid var(--pb-lime);">
          <div>
            <h3 style="font-size: 22px; font-weight: 900; color: #fff;">${p.name}</h3>
            <p style="font-size: 12px; color: var(--pb-lime); font-weight: 700; margin-top: 2px;">DUPR: ${p.dupr_rating} · ${p.skill_level}</p>
            <p style="font-size: 11px; color: var(--pb-slate-text); margin-top: 2px;">${subtitleText}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center;">
          <div class="court-card" style="padding: 12px;">
            <div style="font-size: 11px; color: var(--pb-slate-text); font-weight: 700;">${this.t('currentRating')}</div>
            <div style="font-size: 20px; font-weight: 900; color: var(--pb-lime);">${p.current_rating}</div>
          </div>
          <div class="court-card" style="padding: 12px;">
            <div style="font-size: 11px; color: var(--pb-slate-text); font-weight: 700;">${this.t('peakRating')}</div>
            <div style="font-size: 20px; font-weight: 900; color: var(--pb-amber);">${p.peak_rating}</div>
          </div>
          <div class="court-card" style="padding: 12px;">
            <div style="font-size: 11px; color: var(--pb-slate-text); font-weight: 700;">${this.t('totalMatches')}</div>
            <div style="font-size: 20px; font-weight: 900; color: #fff;">${p.total_matches}</div>
          </div>
          <div class="court-card" style="padding: 12px;">
            <div style="font-size: 11px; color: var(--pb-slate-text); font-weight: 700;">${this.t('winRate')}</div>
            <div style="font-size: 20px; font-weight: 900; color: var(--pb-emerald);">${winRate}%</div>
          </div>
        </div>

        <div class="court-card" style="padding: 16px;">
          <h4 style="font-size: 12px; font-weight: 800; color: var(--pb-lime); text-transform: uppercase; margin-bottom: 8px;">
            📈 ${this.t('chartTitle')} (Intranet Offline Chart)
          </h4>
          <div>
            ${svgChartHtml}
          </div>
        </div>

        <div>
          <h4 style="font-size: 12px; font-weight: 800; color: var(--pb-slate-text); text-transform: uppercase; margin-bottom: 10px;">${this.t('recentMatchesTitle')}</h4>
          <div style="max-height: 200px; overflow-y: auto;">
            ${history.matches.length === 0 ? `<div style="font-size: 12px; color: var(--pb-slate-muted); padding: 12px 0;">${this.t('noRecentMatches')}</div>` : history.matches.slice(0, 8).map(m => {
              const isWinner = m.won !== undefined ? m.won : (m.winner_id === p.id);
              const opDesc = m.opponents 
                ? `vs ${m.opponents} (w/ ${m.partner})`
                : (() => {
                    const opId = m.player1_id === p.id ? m.player2_id : m.player1_id;
                    const op = this.players.find(pl => pl.id === opId) || { name: 'Opponent' };
                    return `vs ${op.name}`;
                  })();

              const myScore = m.player1_score !== undefined ? m.player1_score : (m.player1_id === p.id ? m.player1_score : m.player2_score);
              const opScore = m.player2_score !== undefined ? m.player2_score : (m.player1_id === p.id ? m.player2_score : m.player1_score);

              return `
                <div style="padding: 10px 0; border-top: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                  <div>
                    <span style="font-weight: 700; color: #fff;">${m.tournament_title}</span>
                    <span style="color: var(--pb-slate-text); margin-left: 4px;">${opDesc} (${m.round_name})</span>
                    <div style="font-size: 10px; color: var(--pb-slate-muted);">${this.t('koSetScores')}: ${m.set_scores}</div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: 900; color: ${isWinner ? 'var(--pb-lime)' : 'var(--pb-slate-text)'};">${myScore} : ${opScore}</span>
                    <span style="padding: 2px 8px; border-radius: 4px; font-weight: 900; font-size: 10px; background: ${isWinner ? 'rgba(163, 230, 53, 0.2)' : 'rgba(244, 63, 94, 0.2)'}; color: ${isWinner ? 'var(--pb-lime)' : 'var(--pb-rose)'};">
                      ${isWinner ? 'W' : 'L'}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.style.display = 'flex';

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'view_item', {
        item_name: p.name,
        item_category: isInd ? 'Individual Player' : 'Team',
        dupr_rating: p.dupr_rating,
        current_rating: p.current_rating
      });
    }
  }

  closePlayerModal() {
    const modal = document.getElementById('player-profile-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      modal.style.display = 'none';
    }
  }
}

window.app = new App();

// Listen for Escape key to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.app.closePlayerModal();
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
  });
} else {
  window.app.init();
}
