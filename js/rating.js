/**
 * Pickleball DUPR / Elo Rating Calculator
 * Available globally as window.RatingCalculator
 */
window.RatingCalculator = {
  BASELINE_RATING: 1500,

  /**
   * Calculate point exchanges based on rating difference and match score margin.
   * Standard Pickleball tournament games (11 or 15 pts).
   *
   * @param {number} rWinner - Rating of winning team/player before match
   * @param {number} rLoser  - Rating of losing team/player before match
   * @param {number} winnerScore - Score achieved by winner (e.g. 15 or 11)
   * @param {number} loserScore - Score achieved by loser (e.g. 5 or 9)
   */
  calculateMatchDelta(rWinner, rLoser, winnerScore = 15, loserScore = 0) {
    // Expected probability using standard logistic Elo formula
    const expectedWinner = 1 / (1 + Math.pow(10, (rLoser - rWinner) / 400));

    // Base K-factor for competitive tournament match
    const baseK = 28;
    const baseDelta = baseK * (1 - expectedWinner);

    // Margin-of-victory multiplier based on score spread
    const pointSpread = Math.max(1, winnerScore - loserScore);
    const spreadBonus = Math.round(pointSpread * 1.5);

    let delta = Math.round(baseDelta + spreadBonus);
    if (delta < 5) delta = 5;

    return {
      winnerGain: delta,
      loserLoss: -delta
    };
  },

  /**
   * Convert Elo rating points to standard DUPR equivalent (2.50 to 5.50 scale)
   * Benchmark: 1500 rating = 3.50 DUPR
   * Every 100 Elo points = ~0.35 DUPR
   */
  ratingToDupr(rating) {
    const dupr = 3.50 + ((rating - this.BASELINE_RATING) / 100) * 0.35;
    return Math.max(2.0, Math.min(6.0, parseFloat(dupr.toFixed(2))));
  },

  /**
   * Derive skill level category from DUPR
   */
  duprToSkillLevel(dupr) {
    if (dupr >= 4.5) return 'Advanced (4.5+)';
    if (dupr >= 4.0) return 'Intermediate (4.0+)';
    if (dupr >= 3.5) return 'Intermediate (3.5+)';
    return 'Club Player (3.0+)';
  }
};
