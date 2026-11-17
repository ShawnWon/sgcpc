/**
 * Supabase Client & Data Layer for SGCourt Pickleball
 * Available globally as window.db and window.SupabaseConfig
 */

window.SupabaseConfig = {
  url: localStorage.getItem('sgcourt_sb_url') || '',
  anonKey: localStorage.getItem('sgcourt_sb_key') || ''
};

class DataService {
  constructor() {
    this.client = null;
    this.isSupabaseConfigured = false;
    this.mockData = window.embeddedMockData || null;
    this.localMessagesKey = 'sgcourt_local_messages';
    this.init();
  }

  async init() {
    if (window.SupabaseConfig.url && window.SupabaseConfig.anonKey && window.supabase) {
      try {
        this.client = window.supabase.createClient(window.SupabaseConfig.url, window.SupabaseConfig.anonKey);
        this.isSupabaseConfigured = true;
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
      }
    }
  }

  async loadMockData() {
    if (this.mockData) return this.mockData;
    if (window.embeddedMockData) {
      this.mockData = window.embeddedMockData;
      return this.mockData;
    }
    return null;
  }

  // --- Players ---
  async getPlayers() {
    if (this.isSupabaseConfigured) {
      try {
        const { data, error } = await this.client
          .from('players')
          .select('*')
          .order('current_rating', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase query error:', err);
      }
    }
    const mock = await this.loadMockData();
    return [...mock.players].sort((a, b) => b.current_rating - a.current_rating);
  }

  async getPlayerById(id) {
    if (this.isSupabaseConfigured) {
      try {
        const { data, error } = await this.client
          .from('players')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase query error:', err);
      }
    }
    const mock = await this.loadMockData();
    return mock.players.find(p => p.id === id) || null;
  }

  // --- Tournaments ---
  async getTournaments() {
    if (this.isSupabaseConfigured) {
      try {
        const { data, error } = await this.client
          .from('tournaments')
          .select('*')
          .order('tournament_date', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase tournament error:', err);
      }
    }
    const mock = await this.loadMockData();
    return mock.tournaments;
  }

  async getTournamentDetails(tournamentId) {
    if (this.isSupabaseConfigured) {
      try {
        const [tRes, pRes, mRes] = await Promise.all([
          this.client.from('tournaments').select('*').eq('id', tournamentId).single(),
          this.client.from('tournament_participants').select('*, player:players(*)').eq('tournament_id', tournamentId),
          this.client.from('matches').select('*, p1:player1_id(*), p2:player2_id(*), winner:winner_id(*)').eq('tournament_id', tournamentId)
        ]);
        if (!tRes.error && tRes.data) {
          return {
            tournament: tRes.data,
            participants: pRes.data || [],
            matches: mRes.data || []
          };
        }
      } catch (err) {
        console.warn('Supabase query error:', err);
      }
    }

    const mock = await this.loadMockData();
    const tournament = mock.tournaments.find(t => t.id === tournamentId) || mock.tournaments[0];
    return {
      tournament,
      participants: tournament.participants,
      matches: tournament.matches
    };
  }

  // --- Head to Head ---
  async getHeadToHead(player1Id, player2Id) {
    const mock = await this.loadMockData();
    let allMatches = [];

    if (this.isSupabaseConfigured) {
      try {
        const { data, error } = await this.client
          .from('matches')
          .select('*')
          .or(`and(player1_id.eq.${player1Id},player2_id.eq.${player2Id}),and(player1_id.eq.${player2Id},player2_id.eq.${player1Id})`);
        if (!error && data && data.length > 0) {
          allMatches = data;
        }
      } catch (err) {
        console.warn('Supabase H2H error:', err);
      }
    }

    if (allMatches.length === 0) {
      mock.tournaments.forEach(t => {
        t.matches.forEach(m => {
          if (
            (m.player1_id === player1Id && m.player2_id === player2Id) ||
            (m.player1_id === player2Id && m.player2_id === player1Id)
          ) {
            allMatches.push({ ...m, tournament_title: t.title, tournament_date: t.tournament_date });
          }
        });
      });
    }

    let p1Wins = 0;
    let p2Wins = 0;
    allMatches.forEach(m => {
      if (m.winner_id === player1Id) p1Wins++;
      else if (m.winner_id === player2Id) p2Wins++;
    });

    return {
      total: allMatches.length,
      p1Wins,
      p2Wins,
      matches: allMatches
    };
  }

  // --- Player Match & Rating History ---
  async getPlayerHistory(playerId) {
    const mock = await this.loadMockData();
    const matches = [];

    mock.tournaments.forEach(t => {
      t.matches.forEach(m => {
        if (m.player1_id === playerId || m.player2_id === playerId) {
          matches.push({
            ...m,
            tournament_title: t.title,
            date: t.tournament_date
          });
        }
      });
    });

    const ratingPoints = (mock.rating_history || []).filter(h => h.player_id === playerId);

    return {
      matches,
      ratingHistory: ratingPoints
    };
  }

  // --- Court Messages Board ---
  async getMessages() {
    if (this.isSupabaseConfigured) {
      try {
        const { data, error } = await this.client
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase messages error:', err);
      }
    }

    const local = localStorage.getItem(this.localMessagesKey);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }

    const initialMsgs = [
      {
        id: "sgmsg-1",
        author_name: "DinkPro_SG",
        avatar_seed: "dinkpro",
        content: "Great championship match! Marcus's resets from the transition zone were insane today. Well played Sarah too!",
        parent_id: null,
        likes: 7,
        created_at: "2026-11-16T18:20:00Z"
      },
      {
        id: "sgmsg-2",
        author_name: "PickleFan88",
        avatar_seed: "fan88",
        content: "What paddle was Sarah playing with? The speedup drives had serious pop off the sweet spot.",
        parent_id: "sgmsg-1",
        likes: 4,
        created_at: "2026-11-16T19:00:00Z"
      },
      {
        id: "sgmsg-3",
        author_name: "JurongKitchenCrew",
        avatar_seed: "jurong",
        content: "Open play session at Jurong West Court 3 & 4 this Wednesday 7:30 PM. All 3.5+ welcome for competitive doubles drill!",
        parent_id: null,
        likes: 6,
        created_at: "2026-11-17T09:10:00Z"
      }
    ];

    localStorage.setItem(this.localMessagesKey, JSON.stringify(initialMsgs));
    return initialMsgs;
  }

  async addMessage(authorName, content, parentId = null) {
    const author = authorName ? authorName.trim() : 'Anonymous Baller';
    const seed = Math.random().toString(36).substring(2, 8);
    const newMsg = {
      id: 'sgmsg-' + Date.now(),
      author_name: author,
      avatar_seed: seed,
      content: content.trim(),
      parent_id: parentId,
      likes: 0,
      created_at: new Date().toISOString()
    };

    if (this.isSupabaseConfigured) {
      try {
        const { data, error } = await this.client
          .from('messages')
          .insert([{
            author_name: newMsg.author_name,
            avatar_seed: newMsg.avatar_seed,
            content: newMsg.content,
            parent_id: newMsg.parent_id,
            likes: 0
          }])
          .select();
        if (!error && data && data.length > 0) return data[0];
      } catch (err) {}
    }

    const current = await this.getMessages();
    current.unshift(newMsg);
    localStorage.setItem(this.localMessagesKey, JSON.stringify(current));
    return newMsg;
  }

  async likeMessage(messageId) {
    const current = await this.getMessages();
    const msg = current.find(m => m.id === messageId);
    if (msg) {
      msg.likes = (msg.likes || 0) + 1;
      localStorage.setItem(this.localMessagesKey, JSON.stringify(current));
      return msg.likes;
    }
    return 0;
  }
}

window.db = new DataService();
