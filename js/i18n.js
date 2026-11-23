/**
 * Multi-language (i18n) for SG Champion Club Pickleball
 * Available globally as window.i18n
 */

window.i18n = {
  currentLang: localStorage.getItem('sgcourt_lang') || 'en',

  translations: {
    en: {
      appTitle: "SG Champion Club",
      appSubtitle: "Pickleball DUPR Community League",
      navLeaderboard: "Leaderboard",
      navTournaments: "Tournaments & Pools",
      navH2H: "Head-to-Head",
      navBoard: "Court Chat",
      dataSourceDemo: "Source: Demo Courts",
      dataSourceSupabase: "Source: Supabase Cloud",

      // Leaderboard
      badgeOfficial: "Singapore Community DUPR / Elo",
      lbTitle: "SG Champion Club Pickleball Standings",
      lbSubtitle: "Standard Pickleball Tournament Exchange · DUPR Equivalents · Singapore Competitive & Social Ladder",
      modeTeams: "Teams / Pairs",
      modeIndividuals: "Individuals",
      colPlayerOrTeam: "Player / Team",
      searchPlaceholder: "Search player / paddle / style...",
      podium1st: "Gold Champion (1st)",
      podium2nd: "Silver Finalist (2nd)",
      podium3rd: "Bronze (3rd Place)",
      colRank: "Rank",
      colPlayer: "Player",
      colDupr: "DUPR Level",
      colPaddle: "Paddle Gear",
      colRating: "Rating Pts",
      colPeak: "Peak",
      colMatches: "Matches (W/L)",
      colWinRate: "Win Rate",
      colAction: "Profile",

      // Tournaments
      selectEdition: "Select Pickleball Event",
      tabStandings: "Final Standings & DUPR Deltas",
      tabGroups: "Pool Play Matrix (Round Robin)",
      tabKnockout: "Championship Knockout Tree",
      statusCompleted: "Finalized",
      finalResultsTitle: "Tournament Results & Rating Settlement",
      finalResultsSub: "Official SG Champion Club Rules",
      colPlace: "Place",
      colInitialRating: "Pre-event Pts",
      colRatingChange: "Rating Δ",
      colNewRating: "Post-event Pts",
      rankPrefix: "#",
      matrixTitleSuffix: "Pool Match Cross-Matrix",
      matrixSub: "Top 2 advance to Medal Rounds",
      matrixHeaderPlayer: "Player \\ Pool",
      matrixHeaderRecord: "W / L",
      matrixHeaderDiff: "Game +/-",
      koTitle: "Knockout Medal Rounds",
      koBestOf: "Best of 3 (11-pt, Win by 2)",
      koSetScores: "Game Scores",

      // Head to Head
      h2hTitle: "Head-to-Head Court Clash",
      h2hSubtitle: "Compare lifetime records, game scores, and win rates between any two pickleball players.",
      h2hPlayerA: "Player 1",
      h2hPlayerB: "Player 2",
      h2hVs: "VS",
      h2hTotalEncounters: "Encounters",
      h2hSelectDiff: "Select two different players to compare head-to-head records.",
      h2hMatchesTitle: "Court Match History",
      h2hNoMatches: "No competitive matches recorded between these two players yet.",
      h2hWon: "Won",

      // Court Chat / Board
      boardTitle: "Court-side Chat & Community Board",
      boardSubtitle: "Connect with local SG pickleball players, organize open-play sessions, review paddles, or leave feedback.",
      boardPlaceholder: "Share a match recap, paddle review, or organize open play...",
      boardNicknamePlaceholder: "Your Call-sign / Name (optional)",
      btnPostMessage: "Post to Court",
      btnReply: "Reply",
      btnLike: "High Five",
      replyingTo: "Replying to",
      cancelReply: "Cancel",
      noMessagesYet: "No court chat yet. Grab your paddle and start the talk!",

      // Player Profile Modal
      currentRating: "Current Rating",
      peakRating: "Peak Rating",
      totalMatches: "Total Matches",
      winRate: "Win Rate",
      chartTitle: "DUPR / Rating Progression Track",
      recentMatchesTitle: "Recent Court Battles",
      noRecentMatches: "No recent matches recorded.",
      styleLabel: "Play Style",
      paddleLabel: "Paddle",
      genderMale: "Male",
      genderFemale: "Female"
    },

    cn: {
      appTitle: "SG Champion Club",
      appSubtitle: "新加坡匹克球 DUPR 积分联盟",
      navLeaderboard: "总排行榜",
      navTournaments: "巡回赛事 & 分组",
      navH2H: "两两交锋 H2H",
      navBoard: "球场留言板",
      dataSourceDemo: "数据源: 演示球场",
      dataSourceSupabase: "数据源: Supabase 云端",

      // Leaderboard
      badgeOfficial: "新加坡社区 DUPR / Elo 积分",
      lbTitle: "SG Champion Club 匹克球天梯积分总榜",
      lbSubtitle: "匹克球国际积分算法 · DUPR 水平认证 · 记录新加坡各球场竞技对抗水平",
      modeTeams: "双打战队",
      modeIndividuals: "个人球友",
      colPlayerOrTeam: "选手 / 战队",
      searchPlaceholder: "搜索球友姓名 / 球拍型号 / 打法...",
      podium1st: "金牌冠军 No.1",
      podium2nd: "银牌亚军 No.2",
      podium3rd: "铜牌季军 No.3",
      colRank: "名次",
      colPlayer: "选手",
      colDupr: "DUPR 等级",
      colPaddle: "球拍装备",
      colRating: "天梯积分",
      colPeak: "最高分",
      colMatches: "总场次 (胜/负)",
      colWinRate: "胜率",
      colAction: "档案",

      // Tournaments
      selectEdition: "选择匹克球赛事",
      tabStandings: "赛事最终名次与积分结算",
      tabGroups: "小组循环矩阵图 (Pool Play)",
      tabKnockout: "淘汰奖牌树状图",
      statusCompleted: "已完赛",
      finalResultsTitle: "赛事最终结算成绩单",
      finalResultsSub: "SG Champion Club 赛事规则核算完毕",
      colPlace: "排名",
      colInitialRating: "赛前积分",
      colRatingChange: "积分变动 (Δ)",
      colNewRating: "赛后新积分",
      rankPrefix: "第 ",
      matrixTitleSuffix: "小组循环交叉矩阵",
      matrixSub: "各组前两名晋级奖牌争夺赛",
      matrixHeaderPlayer: "选手 \\ 对阵",
      matrixHeaderRecord: "胜负场",
      matrixHeaderDiff: "净胜局",
      koTitle: "淘汰赛奖牌阶段比分",
      koBestOf: "3局2胜 (11分制)",
      koSetScores: "单局得分",

      // Head to Head
      h2hTitle: "选手历史交战对比 (Head-to-Head)",
      h2hSubtitle: "选择任意两位球友，查看他们在各项公开赛中的交手比分与胜负走向。",
      h2hPlayerA: "选手 1",
      h2hPlayerB: "选手 2",
      h2hVs: "VS",
      h2hTotalEncounters: "总交战",
      h2hSelectDiff: "请选择两位不同的匹克球选手进行交手战绩对比。",
      h2hMatchesTitle: "历史交锋明细",
      h2hNoMatches: "两位选手暂无正式比赛对阵记录。",
      h2hWon: "胜出",

      // Court Chat / Board
      boardTitle: "SG Champion Club 社区球友留言板",
      boardSubtitle: "欢迎交流截击技巧、讨论 Joola / Selkirk 球拍、约球训练，支持匿名发表与回复。",
      boardPlaceholder: "发表球场动态、球拍测评或发起约球讨论...",
      boardNicknamePlaceholder: "昵称 (选填，留空显示为热心球友)",
      btnPostMessage: "发布到球场",
      btnReply: "回复",
      btnLike: "碰球拍",
      replyingTo: "正在回复",
      cancelReply: "取消",
      noMessagesYet: "暂无球场留言，拿起球拍抢先开聊吧！",

      // Player Profile Modal
      currentRating: "当前天梯分",
      peakRating: "历史最高分",
      totalMatches: "参赛总场次",
      winRate: "胜率",
      chartTitle: "DUPR / 积分历史走势",
      recentMatchesTitle: "近期比赛对阵",
      noRecentMatches: "暂无近期比赛记录。",
      styleLabel: "打法风格",
      paddleLabel: "主战球拍",
      genderMale: "男",
      genderFemale: "女"
    }
  },

  t(key) {
    const lang = this.currentLang;
    if (this.translations[lang] && this.translations[lang][key] !== undefined) {
      return this.translations[lang][key];
    }
    return this.translations['en'][key] || key;
  },

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('sgcourt_lang', lang);
    if (window.app) {
      window.app.applyLanguage();
    }
  }
};
