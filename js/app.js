/**
 * SGCourt Pickleball Frontend Controller
 * Available globally as window.app
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
    this.ratingChart = null;
    this.replyTargetId = null;
  }

  async init() {
    this.applyLanguage();
    this.updateBackendBadge();
    await this.loadData();
    this.renderLeaderboard();
    this.initTournamentsSelect();
    this.initH2HSelect();
    await this.loadMessages();
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
      if (lang === 'en') {
        btnEn.className = 'px-2.5 py-1 rounded-md transition-all text-lime-400 bg-lime-500/20 font-bold';
        btnCn.className = 'px-2.5 py-1 rounded-md transition-all text-slate-400 hover:text-white';
      } else {
        btnCn.className = 'px-2.5 py-1 rounded-md transition-all text-lime-400 bg-lime-500/20 font-bold';
        btnEn.className = 'px-2.5 py-1 rounded-md transition-all text-slate-400 hover:text-white';
      }
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

    this.updateBackendBadge();
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

  updateBackendBadge() {
    const badge = document.getElementById('backend-status-badge');
    if (badge) {
      if (window.SupabaseConfig && window.SupabaseConfig.url && window.SupabaseConfig.anonKey) {
        badge.textContent = this.t('dataSourceSupabase');
        badge.className = 'text-lime-400 font-bold hidden sm:inline';
      } else {
        badge.textContent = this.t('dataSourceDemo');
        badge.className = 'text-slate-300 hidden sm:inline';
      }
    }
  }

  async loadData() {
    this.players = await window.db.getPlayers();
    this.tournaments = await window.db.getTournaments();
    this.computeRatingsAndStats();
  }

  computeRatingsAndStats() {
    const BASELINE = 1500;

    // 1. Reset all teams to initial baseline rating (1500)
    const teamStats = new Map();
    this.players.forEach(p => {
      teamStats.set(p.id, {
        ...p,
        initial_rating: BASELINE,
        current_rating: BASELINE,
        peak_rating: BASELINE,
        total_matches: 0,
        total_wins: 0,
        total_losses: 0,
        points_scored: 0,
        points_conceded: 0,
        ratingHistory: [
          { date: '2026-11-17 07:00', new_rating: BASELINE, reason: 'Tournament Start Baseline' }
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
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(norm)}`,
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
            { date: '2026-11-17 07:00', new_rating: BASELINE, reason: 'Tournament Start Baseline' }
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

        // Record on match object for bracket UI
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

          ind.ratingHistory.push({
            date: m.round_name,
            new_rating: ind.current_rating,
            change: isT1Winner ? delta : -delta,
            reason: `${tour.title.split('-')[1]?.trim() || ''} ${m.round_name}`
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

          ind.ratingHistory.push({
            date: m.round_name,
            new_rating: ind.current_rating,
            change: !isT1Winner ? delta : -delta,
            reason: `${tour.title.split('-')[1]?.trim() || ''} ${m.round_name}`
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
      if (el) el.classList.toggle('hidden', v !== viewName);
      if (btn) {
        if (v === viewName) {
          btn.className = 'nav-btn px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 text-lime-400 bg-lime-500/10 border border-lime-500/30';
        } else {
          btn.className = 'nav-btn px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800';
        }
      }
    });

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
      if (mode === 'teams') {
        btnTeams.className = 'px-3.5 py-1.5 rounded-lg transition-all text-lime-400 bg-lime-500/20 font-bold flex items-center gap-1.5';
        btnInds.className = 'px-3.5 py-1.5 rounded-lg transition-all text-slate-400 hover:text-white flex items-center gap-1.5';
      } else {
        btnInds.className = 'px-3.5 py-1.5 rounded-lg transition-all text-lime-400 bg-lime-500/20 font-bold flex items-center gap-1.5';
        btnTeams.className = 'px-3.5 py-1.5 rounded-lg transition-all text-slate-400 hover:text-white flex items-center gap-1.5';
      }
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
      const badges = [
        'bg-amber-400/10 text-amber-300 border-amber-400/40', 
        'bg-slate-300/10 text-slate-200 border-slate-400/30', 
        'bg-amber-700/10 text-amber-500 border-amber-600/30'
      ];
      const rankLabels = [this.t('podium1st'), this.t('podium2nd'), this.t('podium3rd')];

      podiumContainer.innerHTML = top3.map((p, idx) => `
        <div class="court-card rounded-2xl p-5 border ${badges[idx]} flex items-center justify-between cursor-pointer hover:border-lime-400 transition" onclick="app.showPlayerProfile('${p.id}')">
          <div class="flex items-center space-x-3.5">
            <img src="${p.avatar_url}" alt="${p.name}" class="w-13 h-13 rounded-full bg-slate-900 border border-slate-700 p-0.5">
            <div>
              <div class="text-[11px] font-black uppercase tracking-wider text-slate-400">${rankLabels[idx]}</div>
              <div class="text-base font-black text-white hover:text-lime-400">${p.name}</div>
              <div class="text-xs text-lime-400 font-semibold mt-0.5">DUPR: ${p.dupr_rating} · ${p.skill_level}</div>
              ${p.teams_display ? `<div class="text-[10px] text-slate-400 mt-0.5 truncate max-w-[170px]"><i class="fa-solid fa-users text-slate-500 mr-1"></i>${p.teams_display}</div>` : ''}
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-black text-lime-400">${p.current_rating}</div>
            <div class="text-[11px] text-slate-500">${this.t('colPeak')}: ${p.peak_rating}</div>
          </div>
        </div>
      `).join('');
    }

    // Table rows
    tbody.innerHTML = filtered.map((p, index) => {
      const winRate = p.total_matches > 0 ? Math.round((p.total_wins / p.total_matches) * 100) : 0;
      let rankBadge = `<span class="inline-block w-6 text-center text-slate-400 font-bold">${index + 1}</span>`;
      if (index === 0) rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">1</span>`;
      if (index === 1) rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-950 font-black text-xs shadow-md">2</span>`;
      if (index === 2) rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs shadow-md">3</span>`;

      // Skill tier badge class
      let tierClass = 'badge-dupr-inter';
      if (p.dupr_rating >= 4.5) tierClass = 'badge-dupr-pro';
      else if (p.dupr_rating >= 4.0) tierClass = 'badge-dupr-adv';

      const subtitle = p.teams_display 
        ? `<span class="text-[11px] text-slate-400 block"><i class="fa-solid fa-shield-halved text-lime-400/80 mr-1"></i>Team: ${p.teams_display}</span>`
        : `<span class="text-[11px] text-slate-400 block">${p.play_style || 'All-court'}</span>`;

      return `
        <tr class="hover:bg-slate-900/40 transition">
          <td class="px-5 py-4 text-center">${rankBadge}</td>
          <td class="px-5 py-4">
            <div class="flex items-center space-x-3">
              <img src="${p.avatar_url}" class="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 p-0.5">
              <div>
                <a href="javascript:void(0)" onclick="app.showPlayerProfile('${p.id}')" class="text-white font-bold hover:text-lime-400 transition">${p.name}</a>
                ${subtitle}
              </div>
            </div>
          </td>
          <td class="px-5 py-4 text-center">
            <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${tierClass}">
              DUPR ${p.dupr_rating}
            </span>
          </td>
          <td class="px-5 py-4 text-center text-xs text-slate-300 hidden md:table-cell font-medium">${p.paddle_model || 'Standard'}</td>
          <td class="px-5 py-4 text-center font-black text-lime-400 text-base">${p.current_rating}</td>
          <td class="px-5 py-4 text-center text-xs text-slate-400 font-semibold">${p.peak_rating}</td>
          <td class="px-5 py-4 text-center text-xs text-slate-300">
            ${p.total_matches} <span class="text-lime-400">(${p.total_wins}W</span> / <span class="text-rose-400">${p.total_losses}L)</span>
          </td>
          <td class="px-5 py-4 text-center">
            <div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${winRate >= 65 ? 'bg-lime-500/10 text-lime-400 border border-lime-500/30' : 'bg-slate-800 text-slate-300'}">
              ${winRate}%
            </div>
          </td>
          <td class="px-5 py-4 text-center">
            <button onclick="app.showPlayerProfile('${p.id}')" class="text-xs text-lime-400 hover:text-lime-300 font-bold px-2.5 py-1 rounded bg-lime-500/10 hover:bg-lime-500/20 border border-lime-500/30 transition">
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

  async changeTournament() {
    const sel = document.getElementById('tournament-select');
    if (!sel) return;
    const tid = sel.value;
    const details = await window.db.getTournamentDetails(tid);
    this.activeTournament = details;

    const badge = document.getElementById('tournament-meta-badge');
    if (badge && details.tournament) {
      badge.innerHTML = `
        <span class="px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-700 font-medium">
          <i class="fa-regular fa-calendar mr-1"></i> ${details.tournament.tournament_date}
        </span>
        <span class="px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-700 font-medium">
          <i class="fa-solid fa-location-dot mr-1 text-lime-400"></i> ${details.tournament.location}
        </span>
        <span class="px-2.5 py-1 rounded bg-lime-500/10 text-lime-400 border border-lime-500/30 font-bold">
          <i class="fa-solid fa-check-double mr-1"></i> ${this.t('statusCompleted')}
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
      if (btn) {
        if (t === tab) {
          btn.className = 'pb-3 border-b-2 border-lime-400 text-lime-400 flex items-center gap-2 font-bold';
        } else {
          btn.className = 'pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2';
        }
      }
    });
  }

  renderTournamentResults() {
    const tbody = document.getElementById('tournament-results-tbody');
    if (!tbody || !this.activeTournament) return;

    const parts = [...this.activeTournament.participants].sort((a, b) => a.final_rank - b.final_rank);
    tbody.innerHTML = parts.map(p => {
      const playerObj = this.players.find(pl => pl.id === p.player_id) || { name: 'Player', avatar_url: '' };
      const changeClass = p.rating_change >= 0 ? 'text-lime-400 font-bold' : 'text-rose-400 font-bold';
      const changeSign = p.rating_change >= 0 ? `+${p.rating_change}` : `${p.rating_change}`;

      const rankBadge = p.final_rank <= 3
        ? `<span class="inline-block px-2.5 py-0.5 rounded text-xs bg-amber-400/20 text-amber-300 border border-amber-400/40 font-black">${this.t('rankPrefix')}${p.final_rank}</span>`
        : `<span class="text-slate-400 font-bold">${this.t('rankPrefix')}${p.final_rank}</span>`;

      return `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="px-5 py-3.5 text-center font-bold">${rankBadge}</td>
          <td class="px-5 py-3.5 flex items-center space-x-3">
            <img src="${playerObj.avatar_url}" class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700">
            <span class="text-white font-bold cursor-pointer hover:text-lime-400" onclick="app.showPlayerProfile('${p.player_id}')">${playerObj.name}</span>
          </td>
          <td class="px-5 py-3.5 text-center text-slate-400">${p.starting_rating}</td>
          <td class="px-5 py-3.5 text-center ${changeClass}">${changeSign}</td>
          <td class="px-5 py-3.5 text-center font-black text-lime-400">${p.ending_rating}</td>
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
        <div class="court-card rounded-2xl p-8 text-center text-slate-400 border border-slate-800">
          <i class="fa-solid fa-trophy text-amber-400 text-3xl mb-3 block"></i>
          <p class="font-bold text-white text-base">${this.activeTournament.tournament.title}</p>
          <p class="text-sm text-slate-400 mt-1">${this.activeTournament.tournament.format}</p>
          <p class="text-xs text-lime-400 mt-3 font-semibold">This event was conducted directly via Single Elimination Knockout. Check the "Championship Knockout Tree" tab to see match details.</p>
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

      let headersHtml = pList.map((p, i) => `<th class="w-24">${i + 1}. ${p.name.split(' ')[0]}</th>`).join('');
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

          if (!match) return `<td class="text-slate-600">-</td>`;

          const isP1 = match.player1_id === rowP.id;
          const myScore = isP1 ? match.player1_score : match.player2_score;
          const opScore = isP1 ? match.player2_score : match.player1_score;

          setsWon += myScore;
          setsLost += opScore;
          if (myScore > opScore) wins++;
          else losses++;

          const isWin = myScore > opScore;
          return `
            <td class="text-center font-bold ${isWin ? 'text-lime-400 bg-lime-500/5' : 'text-slate-400'}">
              ${myScore} : ${opScore}
              <div class="text-[10px] text-slate-500 font-normal">${match.set_scores || ''}</div>
            </td>
          `;
        }).join('');

        return `
          <tr>
            <td class="font-bold text-slate-200 text-left px-3">${rIdx + 1}. ${rowP.name}</td>
            ${cellsHtml}
            <td class="font-black text-lime-400">${wins}W / ${losses}L</td>
            <td class="text-xs text-slate-400">${setsWon}-${setsLost}</td>
          </tr>
        `;
      }).join('');

      return `
        <div class="court-card rounded-2xl overflow-hidden border border-slate-800">
          <div class="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <h4 class="font-black text-white text-base flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-lime-400"></span> ${gName} ${this.t('matrixTitleSuffix')}
            </h4>
            <span class="text-xs text-slate-400 font-semibold">${this.t('matrixSub')}</span>
          </div>
          <div class="overflow-x-auto p-4">
            <table class="pb-matrix-table text-sm">
              <thead>
                <tr>
                  <th class="text-left w-36 px-3">${this.t('matrixHeaderPlayer')}</th>
                  ${headersHtml}
                  <th class="w-24">${this.t('matrixHeaderRecord')}</th>
                  <th class="w-20">${this.t('matrixHeaderDiff')}</th>
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
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <h4 class="font-black text-white text-base flex items-center gap-2">
            <i class="fa-solid fa-crown text-amber-400"></i> ${this.t('koTitle')}
          </h4>
          <span class="text-xs text-lime-400 font-semibold">${this.activeTournament.tournament.format || ''}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${koMatches.map(m => {
            const p1 = this.players.find(p => p.id === m.player1_id) || { name: 'TBD' };
            const p2 = this.players.find(p => p.id === m.player2_id) || { name: 'TBD' };
            const p1Won = m.winner_id === m.player1_id;
            const p2Won = m.winner_id === m.player2_id;

            return `
              <div class="court-card p-4 rounded-xl border border-slate-700 hover:border-lime-400/50 transition">
                <div class="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 mb-3">
                  <span class="font-bold text-lime-400">${m.round_name}</span>
                  <span class="text-slate-400 text-[11px]">${m.group_name || 'Knockout'}</span>
                </div>
                
                <div class="flex items-center justify-between p-2 rounded ${p1Won ? 'bg-lime-500/10 font-black text-white border border-lime-500/30' : 'text-slate-400'}">
                  <span class="truncate pr-2">${p1.name}</span>
                  <span class="text-base ${p1Won ? 'text-lime-400 font-black' : 'text-slate-500'}">${m.player1_score}</span>
                </div>

                <div class="flex items-center justify-between p-2 rounded mt-1.5 ${p2Won ? 'bg-lime-500/10 font-black text-white border border-lime-500/30' : 'text-slate-400'}">
                  <span class="truncate pr-2">${p2.name}</span>
                  <span class="text-base ${p2Won ? 'text-lime-400 font-black' : 'text-slate-500'}">${m.player2_score}</span>
                </div>

                <div class="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Score: <strong class="text-slate-200">${m.set_scores}</strong></span>
                  <span class="text-lime-400 font-bold">${p1Won ? p1.name.split(' ')[0] : p2.name.split(' ')[0]} Win</span>
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

  async renderH2H() {
    const p1Id = document.getElementById('h2h-player-1')?.value;
    const p2Id = document.getElementById('h2h-player-2')?.value;
    const container = document.getElementById('h2h-result-container');
    if (!container || !p1Id || !p2Id) return;

    if (p1Id === p2Id) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-500 court-card rounded-2xl">
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

    // Check if comparing two individuals
    if (p1Id.startsWith('ind-') && p2Id.startsWith('ind-')) {
      (p1.matchRecords || []).forEach(m1 => {
        // Did p1 play against p2?
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
      h2h = await window.db.getHeadToHead(p1Id, p2Id);
    }

    const p1WinRate = h2h.total > 0 ? Math.round((h2h.p1Wins / h2h.total) * 100) : 0;
    const p2WinRate = h2h.total > 0 ? 100 - p1WinRate : 0;

    container.innerHTML = `
      <div class="court-card rounded-2xl p-6 border border-slate-800">
        <div class="grid grid-cols-3 items-center text-center">
          <div class="space-y-2">
            <img src="${p1.avatar_url}" class="w-16 h-16 rounded-full mx-auto bg-slate-800 border-2 border-lime-400">
            <div class="font-black text-white text-lg">${p1.name}</div>
            <div class="text-xs text-lime-400 font-bold">DUPR ${p1.dupr_rating}</div>
            <div class="text-xs text-slate-400">${p1.teams_display ? p1.teams_display : (p1.paddle_model || '')}</div>
          </div>

          <div>
            <div class="text-4xl sm:text-5xl font-black text-white tracking-wider flex items-center justify-center gap-4">
              <span class="text-lime-400">${h2h.p1Wins}</span>
              <span class="text-slate-600">:</span>
              <span class="text-emerald-400">${h2h.p2Wins}</span>
            </div>
            <div class="text-xs text-slate-400 mt-2 font-bold">${h2h.total} ${this.t('h2hTotalEncounters')}</div>

            <div class="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden flex">
              <div class="bg-lime-500 h-full transition-all" style="width: ${p1WinRate}%"></div>
              <div class="bg-emerald-500 h-full transition-all" style="width: ${p2WinRate}%"></div>
            </div>
          </div>

          <div class="space-y-2">
            <img src="${p2.avatar_url}" class="w-16 h-16 rounded-full mx-auto bg-slate-800 border-2 border-emerald-400">
            <div class="font-black text-white text-lg">${p2.name}</div>
            <div class="text-xs text-emerald-400 font-bold">DUPR ${p2.dupr_rating}</div>
            <div class="text-xs text-slate-400">${p2.teams_display ? p2.teams_display : (p2.paddle_model || '')}</div>
          </div>
        </div>
      </div>

      <div class="court-card rounded-2xl overflow-hidden border border-slate-800">
        <div class="p-4 bg-slate-900 border-b border-slate-800 font-bold text-white flex items-center justify-between">
          <span>${this.t('h2hMatchesTitle')}</span>
          <span class="text-xs text-slate-400">${h2h.matches.length} Matches</span>
        </div>
        <div class="divide-y divide-slate-800">
          ${h2h.matches.length === 0 ? `
            <div class="p-8 text-center text-slate-500 text-sm">${this.t('h2hNoMatches')}</div>
          ` : h2h.matches.map(m => {
            const isP1Winner = m.winner_id === p1Id;
            return `
              <div class="p-4 hover:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div>
                  <div class="font-bold text-white flex items-center gap-2">
                    <span>${m.tournament_title || 'Pickleball Event'}</span>
                    <span class="text-xs text-lime-400 px-2 py-0.5 rounded bg-lime-500/10">${m.round_name}</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">${m.tournament_date || ''} · ${this.t('koSetScores')}: ${m.set_scores}</div>
                </div>
                <div class="flex items-center gap-3 font-black">
                  <span class="text-base ${isP1Winner ? 'text-lime-400' : 'text-slate-400'}">${p1.name.split(' ')[0]} ${m.player1_id === p1Id ? m.player1_score : m.player2_score}</span>
                  <span class="text-slate-600">-</span>
                  <span class="text-base ${!isP1Winner ? 'text-emerald-400' : 'text-slate-400'}">${m.player1_id === p2Id ? m.player1_score : m.player2_score} ${p2.name.split(' ')[0]}</span>
                  <span class="text-xs px-2 py-0.5 rounded font-black ${isP1Winner ? 'bg-lime-500/20 text-lime-300' : 'bg-emerald-500/20 text-emerald-300'}">
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

  // --- COURT CHAT / MESSAGES ---
  async loadMessages() {
    this.messages = await window.db.getMessages();
  }

  renderMessages() {
    const container = document.getElementById('board-messages-container');
    if (!container) return;

    if (!this.messages || this.messages.length === 0) {
      container.innerHTML = `
        <div class="court-card rounded-2xl p-8 text-center text-slate-500 text-sm">
          ${this.t('noMessagesYet')}
        </div>
      `;
      return;
    }

    const topPosts = this.messages.filter(m => !m.parent_id);
    const replies = this.messages.filter(m => m.parent_id);

    container.innerHTML = topPosts.map(post => {
      const postReplies = replies.filter(r => r.parent_id === post.id);
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${post.avatar_seed || post.author_name}`;
      const timeStr = new Date(post.created_at).toLocaleString();

      return `
        <div class="court-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div class="flex items-start space-x-3.5">
            <img src="${avatarUrl}" class="w-10 h-10 rounded-full bg-slate-900 border border-lime-500/40 p-0.5 shrink-0">
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div class="font-black text-white text-sm">${this.escapeHtml(post.author_name)}</div>
                <div class="text-[11px] text-slate-500 font-medium">${timeStr}</div>
              </div>
              <p class="text-slate-200 text-sm mt-1 whitespace-pre-wrap leading-relaxed">${this.escapeHtml(post.content)}</p>

              <div class="flex items-center gap-4 mt-3 text-xs">
                <button onclick="app.likeMessage('${post.id}')" class="text-slate-400 hover:text-lime-400 transition flex items-center gap-1.5 font-bold">
                  <span>✋</span>
                  <span>${post.likes || 0}</span>
                </button>
                <button onclick="app.setReplyTarget('${post.id}', '${this.escapeHtml(post.author_name)}')" class="text-lime-400 hover:text-lime-300 transition flex items-center gap-1 font-bold">
                  <i class="fa-solid fa-reply"></i>
                  <span>${this.t('btnReply')}</span>
                </button>
              </div>
            </div>
          </div>

          ${postReplies.length > 0 ? `
            <div class="ml-10 pt-3 border-t border-slate-800 space-y-3">
              ${postReplies.map(r => {
                const rAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${r.avatar_seed || r.author_name}`;
                const rTime = new Date(r.created_at).toLocaleString();
                return `
                  <div class="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <img src="${rAvatar}" class="w-7 h-7 rounded-full bg-slate-800 border border-emerald-500/40 p-0.5 shrink-0">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <div class="font-bold text-white text-xs">${this.escapeHtml(r.author_name)}</div>
                        <div class="text-[10px] text-slate-500">${rTime}</div>
                      </div>
                      <p class="text-slate-300 text-xs mt-1 whitespace-pre-wrap">${this.escapeHtml(r.content)}</p>
                      <div class="flex items-center gap-3 mt-2 text-[11px]">
                        <button onclick="app.likeMessage('${r.id}')" class="text-slate-400 hover:text-lime-400 transition flex items-center gap-1 font-bold">
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
    await window.db.addMessage(nickname, content, this.replyTargetId);

    contentInput.value = '';
    this.cancelReply();
    await this.loadMessages();
    this.renderMessages();
  }

  async likeMessage(id) {
    await window.db.likeMessage(id);
    await this.loadMessages();
    this.renderMessages();
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // --- PLAYER PROFILE MODAL ---
  async showPlayerProfile(playerId) {
    const modal = document.getElementById('player-profile-modal');
    const content = document.getElementById('player-modal-content');
    if (!modal || !content) return;

    // Support both individuals and teams
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
      history = await window.db.getPlayerHistory(playerId);
    }

    const winRate = p.total_matches > 0 ? Math.round((p.total_wins / p.total_matches) * 100) : 0;

    const subtitleText = p.teams_display 
      ? `Teams: <span class="text-slate-200 font-semibold">${p.teams_display}</span>`
      : `Paddle: <span class="text-slate-200 font-semibold">${p.paddle_model || 'Standard'}</span> · ${p.play_style || 'All-court'}`;

    content.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center space-x-4">
          <img src="${p.avatar_url}" class="w-16 h-16 rounded-full bg-slate-900 border-2 border-lime-400">
          <div>
            <h3 class="text-2xl font-black text-white">${p.name}</h3>
            <p class="text-xs text-lime-400 font-bold mt-0.5">DUPR: ${p.dupr_rating} · ${p.skill_level}</p>
            <p class="text-xs text-slate-400 mt-0.5">${subtitleText}</p>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-3 text-center">
          <div class="court-card p-3 rounded-xl border border-slate-800">
            <div class="text-[11px] text-slate-400 font-bold">${this.t('currentRating')}</div>
            <div class="text-xl font-black text-lime-400">${p.current_rating}</div>
          </div>
          <div class="court-card p-3 rounded-xl border border-slate-800">
            <div class="text-[11px] text-slate-400 font-bold">${this.t('peakRating')}</div>
            <div class="text-xl font-black text-amber-400">${p.peak_rating}</div>
          </div>
          <div class="court-card p-3 rounded-xl border border-slate-800">
            <div class="text-[11px] text-slate-400 font-bold">${this.t('totalMatches')}</div>
            <div class="text-xl font-black text-white">${p.total_matches}</div>
          </div>
          <div class="court-card p-3 rounded-xl border border-slate-800">
            <div class="text-[11px] text-slate-400 font-bold">${this.t('winRate')}</div>
            <div class="text-xl font-black text-emerald-400">${winRate}%</div>
          </div>
        </div>

        <div class="court-card p-4 rounded-xl border border-slate-800">
          <h4 class="text-xs font-bold text-lime-400 uppercase mb-3 flex items-center gap-1.5">
            <i class="fa-solid fa-chart-line"></i> ${this.t('chartTitle')}
          </h4>
          <div class="h-48 w-full">
            <canvas id="player-rating-chart"></canvas>
          </div>
        </div>

        <div>
          <h4 class="text-xs font-bold text-slate-400 uppercase mb-3">${this.t('recentMatchesTitle')}</h4>
          <div class="divide-y divide-slate-800 max-h-48 overflow-y-auto">
            ${history.matches.length === 0 ? `<div class="text-xs text-slate-500 py-3">${this.t('noRecentMatches')}</div>` : history.matches.slice(0, 8).map(m => {
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
                <div class="py-2.5 flex items-center justify-between text-xs font-medium">
                  <div>
                    <span class="font-bold text-white">${m.tournament_title}</span>
                    <span class="text-slate-400 ml-1">${opDesc} (${m.round_name})</span>
                    <div class="text-[10px] text-slate-500">${this.t('koSetScores')}: ${m.set_scores}</div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-black ${isWinner ? 'text-lime-400' : 'text-slate-400'}">${myScore} : ${opScore}</span>
                    <span class="px-2 py-0.5 rounded font-black ${isWinner ? 'bg-lime-500/20 text-lime-400' : 'bg-rose-500/20 text-rose-400'}">
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

    setTimeout(() => {
      const canvas = document.getElementById('player-rating-chart');
      if (!canvas) return;

      if (this.ratingChart) {
        this.ratingChart.destroy();
      }

      let chartPoints = (history.ratingHistory || []).map(h => ({ x: h.date, y: h.new_rating }));
      if (chartPoints.length < 2) {
        chartPoints = [
          { x: 'Start', y: 1500 },
          { x: 'Current', y: p.current_rating }
        ];
      }

      this.ratingChart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: chartPoints.map(pt => pt.x),
          datasets: [{
            label: this.t('colRating'),
            data: chartPoints.map(pt => pt.y),
            borderColor: '#a3e635',
            backgroundColor: 'rgba(163, 230, 53, 0.1)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#a3e635',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#94a3b8', font: { size: 10 } }
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#94a3b8', font: { size: 10 } }
            }
          }
        }
      });
    }, 50);
  }

  closePlayerModal() {
    const modal = document.getElementById('player-profile-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  // --- SETTINGS ---
  openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const uInput = document.getElementById('cfg-sb-url');
    const kInput = document.getElementById('cfg-sb-key');
    if (uInput) uInput.value = localStorage.getItem('sgcourt_sb_url') || '';
    if (kInput) kInput.value = localStorage.getItem('sgcourt_sb_key') || '';
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  saveSupabaseConfig() {
    const url = document.getElementById('cfg-sb-url')?.value.trim();
    const key = document.getElementById('cfg-sb-key')?.value.trim();
    if (url && key) {
      localStorage.setItem('sgcourt_sb_url', url);
      localStorage.setItem('sgcourt_sb_key', key);
    }
    this.closeSettingsModal();
    window.location.reload();
  }

  clearSupabaseConfig() {
    localStorage.removeItem('sgcourt_sb_url');
    localStorage.removeItem('sgcourt_sb_key');
    this.closeSettingsModal();
    window.location.reload();
  }
}

window.app = new App();
window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
