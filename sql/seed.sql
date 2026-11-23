-- ==============================================================================
-- SG Champion Club Pickleball Seed Data for Supabase
-- Run this in your Supabase SQL Editor after running schema.sql
-- ==============================================================================

-- 1. Seed Initial Demo Messages
INSERT INTO messages (id, author_name, avatar_seed, content, parent_id, likes, created_at)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'DinkPro_SG', 'dinkpro', 'Great championship match! Marcus''s resets from the transition zone were insane today. Well played Sarah too!', NULL, 7, NOW() - INTERVAL '2 days'),
  ('a0000000-0000-0000-0000-000000000002', 'PickleFan88', 'fan88', 'What paddle was Sarah playing with? The speedup drives had serious pop off the sweet spot.', 'a0000000-0000-0000-0000-000000000001', 4, NOW() - INTERVAL '1 day'),
  ('a0000000-0000-0000-0000-000000000003', 'JurongKitchenCrew', 'jurong', 'Open play session at Jurong West Club 3 & 4 this Wednesday 7:30 PM. All 3.5+ welcome for competitive doubles drill!', NULL, 6, NOW() - INTERVAL '10 hours')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Players & Teams
INSERT INTO players (id, name, gender, dupr_rating, skill_level, paddle_model, play_style, initial_rating, current_rating, peak_rating, total_matches, total_wins, total_losses)
VALUES
  ('a8bc0cf0-d1fb-9ef7-9e55-4da1b99412c9', 'XD1 (Darryl / Beverly)', 'Mixed', 3.50, 'Intermediate (3.5+)', 'Selkirk Vanguard Control', 'Aggressive Stacking & Cross Dinks', 1500, 1500, 1500, 0, 0, 0),
  ('c451ef6c-faf3-4cde-db1e-0d48d949debc', 'XD2 (Samuel / Karen)', 'Mixed', 3.50, 'Intermediate (3.5+)', 'Gamma Micron 2.0', 'Transition Resets & Steady Serving', 1500, 1500, 1500, 0, 0, 0),
  ('03e9632a-3fec-513d-fc42-3e5ef7152a45', 'XD3 (Henry / Claudia)', 'Mixed', 3.50, 'Intermediate (3.5+)', 'Joola Ben Johns Perseus 16mm', 'Stealth Resets & Ruthless Speedups', 1500, 1500, 1500, 0, 0, 0),
  ('0e1b83a6-dbe1-2017-57a3-2b52f3e79c26', 'XD4 (Aston / Pegan)', 'Mixed', 3.50, 'Intermediate (3.5+)', 'Babolat RNGD Power', 'Flat Drives & Active Net Play', 1500, 1500, 1500, 0, 0, 0),
  ('cc16c4e2-650f-1fcb-35ae-ca81fd389c5e', 'XD5 (Gerome / Chee Min Ping)', 'Mixed', 3.50, 'Intermediate (3.5+)', 'Six Zero Double Black Diamond', 'Solid Third-Shot Drops & Consistent Resets', 1500, 1500, 1500, 0, 0, 0),
  ('65211422-25f1-3132-7743-299992b2630f', 'XD6 (Ethan / Sulastri)', 'Mixed', 3.50, 'Intermediate (3.5+)', 'Joola Hyperion CFS 16', 'Sharp Angles & Baseline Consistency', 1500, 1500, 1500, 0, 0, 0),
  ('3dad1628-4c8c-bfb5-f171-550aaabe69cb', 'XD7 (Sarath / Siti)', 'Mixed', 3.50, 'Intermediate (3.5+)', 'CRBN 2X Square', 'Control & Safe Drops', 1500, 1500, 1500, 0, 0, 0),
  ('c2effc88-02ee-8070-832f-0168edc93145', 'MD1 (Jeremy / Kiat Boon)', 'M', 3.50, 'Intermediate (3.5+)', 'Franklin Signature Aluminum', 'High Energy Baseline Running', 1500, 1500, 1500, 0, 0, 0),
  ('46fd7a4c-0aea-1c09-c04b-dae5659c86cd', 'MD2 (Alvin / Darryl)', 'M', 3.50, 'Intermediate (3.5+)', 'Franklin Sports Pro Series', 'Power Baseline Drives & Ernes', 1500, 1500, 1500, 0, 0, 0),
  ('6d7786cc-7f19-17d7-a994-543ef24b5340', 'MD3 (Randeep / Edwin)', 'M', 3.50, 'Intermediate (3.5+)', 'Selkirk Vanguard Power Air', 'Dominant Kitchen Control & Fast Counters', 1500, 1500, 1500, 0, 0, 0),
  ('712bed5d-00fb-532c-d558-685ab25aa83f', 'MD4 (Kenneth / Eddy)', 'M', 3.50, 'Intermediate (3.5+)', 'Paddletek Bantam TS-5 Pro', 'Heavy Topspin Drives & Poaching', 1500, 1500, 1500, 0, 0, 0),
  ('a883679f-dfb6-3490-67d2-f545fecf6ff0', 'MD5 (Kwek Mean Luck / Jordan)', 'M', 3.50, 'Intermediate (3.5+)', 'Head Radical Elite', 'Clutch Net Battles & High Defense', 1500, 1500, 1500, 0, 0, 0),
  ('c26b338e-4c21-4f73-85da-a061c90a1ce9', 'MD6 (Lionel / Lam Kie Sen)', 'M', 3.50, 'Intermediate (3.5+)', 'Wilson Echo Team', 'Consistent Lobs & Touch Volleys', 1500, 1500, 1500, 0, 0, 0),
  ('98034f56-d83d-f06e-4fa7-f5cd2dcd2bcd', 'MD7 (Donovan / Keith)', 'M', 3.50, 'Intermediate (3.5+)', 'Gearbox Pro Power Elongated', 'Baseline Rallies & Passing Shots', 1500, 1500, 1500, 0, 0, 0),
  ('31b50d64-b3ef-605b-7295-6dcf8d9175ba', 'MD8 (Aelvin / Farhan)', 'M', 3.50, 'Intermediate (3.5+)', 'Diadem Warrior Edge', 'High Intensity & Explosive Smashes', 1500, 1500, 1500, 0, 0, 0),
  ('cf305d8d-88b3-4a5a-f378-326eb1018ec5', 'WD1 (Sulastri / Siti)', 'F', 3.50, 'Intermediate (3.5+)', 'Pro Kennex Kinetic Pro', 'Steady Dinking & Defensive Blocking', 1500, 1500, 1500, 0, 0, 0),
  ('4ddb6c89-cd69-b98d-2eca-df77f141cf62', 'WD2 (Beverly / Chin Chin)', 'F', 3.50, 'Intermediate (3.5+)', 'Engage Pursuit EX 6.0', 'Deep Returns & Soft Dinking', 1500, 1500, 1500, 0, 0, 0),
  ('ef11272f-1041-7214-8f0f-2b70003a2630', 'WD3 (Chee Min Ping / Lau Qiuyu)', 'F', 3.50, 'Intermediate (3.5+)', 'Six Zero Sapphire', 'Patience & Deep Placements', 1500, 1500, 1500, 0, 0, 0),
  ('c31addab-aa59-6e04-c569-579e19ac0079', 'WD4 (Claudia / Karen)', 'F', 3.50, 'Intermediate (3.5+)', 'CRBN 1X Power Series', 'Aggressive Kitchen Attacks & Fast Hands', 1500, 1500, 1500, 0, 0, 0)
ON CONFLICT (id) DO UPDATE SET
  current_rating = EXCLUDED.current_rating, peak_rating = EXCLUDED.peak_rating;

-- 3. Seed Tournaments
INSERT INTO tournaments (id, title, tournament_date, location, status, format, rules_notes)
VALUES
  ('fefc1503-70fa-ecd4-7da8-9524b2a53221', 'SG Champion Club Pickleball Tournament 2026 - Mixed Doubles', '2026-11-17', 'SG Champion Club Complex (Singapore)', 'completed', 'Single Elimination Knockout (Play 15 Points 1 Set, No Deuce at 14-14)', 'Court 3 & 4 Main Draw'),
  ('2cf60cdf-fefd-49df-9b82-47a8a256906e', 'SG Champion Club Pickleball Tournament 2026 - Men''s Doubles', '2026-11-17', 'SG Champion Club Complex (Singapore)', 'completed', 'Single Elimination Knockout (Play 15 Points 1 Set, No Deuce at 14-14)', 'Court 1 & 2 Main Draw'),
  ('c4fc0478-d1d2-c40e-8b2d-0b90b5cce078', 'SG Champion Club Pickleball Tournament 2026 - Women''s Doubles', '2026-11-17', 'SG Champion Club Complex (Singapore)', 'completed', 'Single Elimination Knockout (Play 11 Points 1 Set, No Deuce at 10-10)', 'Court 3 & 4 Main Draw')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Tournament Participants
INSERT INTO tournament_participants (id, tournament_id, player_id, starting_rating, ending_rating, rating_change, final_rank)
VALUES
  ('69a1321d-2afc-ffdf-16d1-0890c8a16271', 'fefc1503-70fa-ecd4-7da8-9524b2a53221', '03e9632a-3fec-513d-fc42-3e5ef7152a45', 1500, 1500, 0, 1),
  ('7b6df3a4-9fbe-8828-fef0-809c77ba2905', 'fefc1503-70fa-ecd4-7da8-9524b2a53221', 'cc16c4e2-650f-1fcb-35ae-ca81fd389c5e', 1500, 1500, 0, 2),
  ('a5756b92-093d-80ae-b38b-91745158c44c', 'fefc1503-70fa-ecd4-7da8-9524b2a53221', '65211422-25f1-3132-7743-299992b2630f', 1500, 1500, 0, 3),
  ('444faff0-c8c0-79ce-af7c-f215dad2ae97', 'fefc1503-70fa-ecd4-7da8-9524b2a53221', 'a8bc0cf0-d1fb-9ef7-9e55-4da1b99412c9', 1500, 1500, 0, 3),
  ('b9477504-3a29-accd-bcc9-7b8ed9162cec', 'fefc1503-70fa-ecd4-7da8-9524b2a53221', '3dad1628-4c8c-bfb5-f171-550aaabe69cb', 1500, 1500, 0, 5),
  ('c078b704-5cc1-71ee-5968-d19e1c8cffb3', 'fefc1503-70fa-ecd4-7da8-9524b2a53221', '0e1b83a6-dbe1-2017-57a3-2b52f3e79c26', 1500, 1500, 0, 5),
  ('e3fd787b-0ef5-9840-73aa-94fc2ecf2ea4', 'fefc1503-70fa-ecd4-7da8-9524b2a53221', 'c451ef6c-faf3-4cde-db1e-0d48d949debc', 1500, 1500, 0, 5),
  ('33434739-122a-9b12-df52-ada259875b61', '2cf60cdf-fefd-49df-9b82-47a8a256906e', '6d7786cc-7f19-17d7-a994-543ef24b5340', 1500, 1500, 0, 1),
  ('e3fff8ba-cf5b-66b0-cb4e-a122af1f417a', '2cf60cdf-fefd-49df-9b82-47a8a256906e', '712bed5d-00fb-532c-d558-685ab25aa83f', 1500, 1500, 0, 2),
  ('a4204177-2e7c-c8b7-9815-f17288dc7753', '2cf60cdf-fefd-49df-9b82-47a8a256906e', '46fd7a4c-0aea-1c09-c04b-dae5659c86cd', 1500, 1500, 0, 3),
  ('d336de14-6575-8897-41a4-58c1fe630eb8', '2cf60cdf-fefd-49df-9b82-47a8a256906e', 'a883679f-dfb6-3490-67d2-f545fecf6ff0', 1500, 1500, 0, 3),
  ('e86ea159-e9fa-5111-0c88-6bd60635200c', '2cf60cdf-fefd-49df-9b82-47a8a256906e', '31b50d64-b3ef-605b-7295-6dcf8d9175ba', 1500, 1500, 0, 5),
  ('9780ec25-1d13-bd10-670e-7885a79eae34', '2cf60cdf-fefd-49df-9b82-47a8a256906e', '98034f56-d83d-f06e-4fa7-f5cd2dcd2bcd', 1500, 1500, 0, 5),
  ('6c76cfdc-7b82-2000-37fb-89434e50b247', '2cf60cdf-fefd-49df-9b82-47a8a256906e', 'c26b338e-4c21-4f73-85da-a061c90a1ce9', 1500, 1500, 0, 5),
  ('0bbb037a-b500-d6c2-a968-5684ae3fa5ce', '2cf60cdf-fefd-49df-9b82-47a8a256906e', 'c2effc88-02ee-8070-832f-0168edc93145', 1500, 1500, 0, 5),
  ('a1ac17ae-9818-0ad9-7787-9d368422fd0e', 'c4fc0478-d1d2-c40e-8b2d-0b90b5cce078', 'c31addab-aa59-6e04-c569-579e19ac0079', 1500, 1500, 0, 1),
  ('69bac04f-2ae6-3a9a-8d54-e30dfc9413b3', 'c4fc0478-d1d2-c40e-8b2d-0b90b5cce078', '4ddb6c89-cd69-b98d-2eca-df77f141cf62', 1500, 1500, 0, 2),
  ('01f0869d-7348-3481-a525-531511ebf7ca', 'c4fc0478-d1d2-c40e-8b2d-0b90b5cce078', 'cf305d8d-88b3-4a5a-f378-326eb1018ec5', 1500, 1500, 0, 3),
  ('fa5d4bff-5f4b-4bbb-e4ac-b31381690b16', 'c4fc0478-d1d2-c40e-8b2d-0b90b5cce078', 'ef11272f-1041-7214-8f0f-2b70003a2630', 1500, 1500, 0, 3)
ON CONFLICT (tournament_id, player_id) DO NOTHING;

-- 5. Seed Tournament Matches
INSERT INTO matches (id, tournament_id, stage, group_name, round_name, player1_id, player2_id, player1_score, player2_score, set_scores, winner_id)
VALUES
  ('b3aa0564-3226-8c7a-d5e9-b9cfcc89ac1b', 'fefc1503-70fa-ecd4-7da8-9524b2a53221', 'knockout', 'Quarterfinals', 'QF1 (7:00pm Court 4)', '65211422-25f1-3132-7743-299992b2630f', '3dad1628-4c8c-bfb5-f171-550aaabe69cb', 15, 9, '15-9', '65211422-25f1-3132-7743-299992b2630f'),
  ('3edf2c0a-681c-141d-2ea5-94417e40a36a', 'fefc1503-70fa-ecd4-7da8-9524b2a53221', 'knockout', 'Quarterfinals', 'QF2 (7:15pm Court 3)', 'a8bc0cf0-d1fb-9ef7-9e55-4da1b99412c9', 'c451ef6c-faf3-4cde-db1e-0d48d949debc', 15, 5, '15-5', 'a8bc0cf0-d1fb-9ef7-9e55-4da1b99412c9'),
  ('f2f0cd7f-c612-7c4d-9b12-7b03110aa9d8', 'fefc1503-70fa-ecd4-7da8-9524b2a53221', 'knockout', 'Quarterfinals', 'QF3 (7:15pm Court 4)', 'cc16c4e2-650f-1fcb-35ae-ca81fd389c5e', '0e1b83a6-dbe1-2017-57a3-2b52f3e79c26', 15, 7, '15-7', 'cc16c4e2-650f-1fcb-35ae-ca81fd389c5e'),
  ('469a96d3-ce4b-47bb-3419-9c1b267e9c57', 'fefc1503-70fa-ecd4-7da8-9524b2a53221', 'knockout', 'Semifinals', 'SF1 (7:30pm Court 3)', '03e9632a-3fec-513d-fc42-3e5ef7152a45', '65211422-25f1-3132-7743-299992b2630f', 15, 6, '15-6', '03e9632a-3fec-513d-fc42-3e5ef7152a45'),
  ('ea4822ab-a7ce-b2ac-f9b9-ea7ebf8f5117', 'fefc1503-70fa-ecd4-7da8-9524b2a53221', 'knockout', 'Semifinals', 'SF2 (7:30pm Court 4)', 'a8bc0cf0-d1fb-9ef7-9e55-4da1b99412c9', 'cc16c4e2-650f-1fcb-35ae-ca81fd389c5e', 12, 15, '12-15', 'cc16c4e2-650f-1fcb-35ae-ca81fd389c5e'),
  ('2ec06c9b-8112-6a5f-6097-c03c7a7a2dc3', 'fefc1503-70fa-ecd4-7da8-9524b2a53221', 'knockout', 'Final', 'Championship Final (7:45pm Court 4)', '03e9632a-3fec-513d-fc42-3e5ef7152a45', 'cc16c4e2-650f-1fcb-35ae-ca81fd389c5e', 15, 9, '15-9', '03e9632a-3fec-513d-fc42-3e5ef7152a45'),
  ('5e65be63-ee5d-ae30-764d-654355e08beb', '2cf60cdf-fefd-49df-9b82-47a8a256906e', 'knockout', 'Quarterfinals', 'QF1 (7:00pm Court 1)', 'c2effc88-02ee-8070-832f-0168edc93145', '6d7786cc-7f19-17d7-a994-543ef24b5340', 3, 15, '3-15', '6d7786cc-7f19-17d7-a994-543ef24b5340'),
  ('741fe26a-3294-9244-c9d4-8c69d9cc906c', '2cf60cdf-fefd-49df-9b82-47a8a256906e', 'knockout', 'Quarterfinals', 'QF2 (7:00pm Court 2)', '46fd7a4c-0aea-1c09-c04b-dae5659c86cd', '98034f56-d83d-f06e-4fa7-f5cd2dcd2bcd', 15, 7, '15-7', '46fd7a4c-0aea-1c09-c04b-dae5659c86cd'),
  ('9a19191f-e0e5-a50c-b90a-14d251a9a6e8', '2cf60cdf-fefd-49df-9b82-47a8a256906e', 'knockout', 'Quarterfinals', 'QF3 (7:20pm Court 1)', '31b50d64-b3ef-605b-7295-6dcf8d9175ba', 'a883679f-dfb6-3490-67d2-f545fecf6ff0', 14, 15, '14-15', 'a883679f-dfb6-3490-67d2-f545fecf6ff0'),
  ('68491b15-a9fd-a9c3-aa8f-63f0ae09c513', '2cf60cdf-fefd-49df-9b82-47a8a256906e', 'knockout', 'Quarterfinals', 'QF4 (7:20pm Court 2)', '712bed5d-00fb-532c-d558-685ab25aa83f', 'c26b338e-4c21-4f73-85da-a061c90a1ce9', 15, 6, '15-6', '712bed5d-00fb-532c-d558-685ab25aa83f'),
  ('6b2972fd-3d8f-6e97-b22b-d4cc732e41af', '2cf60cdf-fefd-49df-9b82-47a8a256906e', 'knockout', 'Semifinals', 'SF1 (7:40pm Court 1)', '6d7786cc-7f19-17d7-a994-543ef24b5340', '46fd7a4c-0aea-1c09-c04b-dae5659c86cd', 15, 11, '15-11', '6d7786cc-7f19-17d7-a994-543ef24b5340'),
  ('74a2c999-4188-21c2-4ca7-08fd9d8e4bd3', '2cf60cdf-fefd-49df-9b82-47a8a256906e', 'knockout', 'Semifinals', 'SF2 (7:40pm Court 2)', 'a883679f-dfb6-3490-67d2-f545fecf6ff0', '712bed5d-00fb-532c-d558-685ab25aa83f', 11, 15, '11-15', '712bed5d-00fb-532c-d558-685ab25aa83f'),
  ('c14b2992-4b6c-58ac-da80-be8d3137c39f', '2cf60cdf-fefd-49df-9b82-47a8a256906e', 'knockout', 'Final', 'Championship Final (8:00pm Court 1)', '6d7786cc-7f19-17d7-a994-543ef24b5340', '712bed5d-00fb-532c-d558-685ab25aa83f', 15, 11, '15-11', '6d7786cc-7f19-17d7-a994-543ef24b5340'),
  ('92bb3f68-2d85-7094-88f5-3c884e42c6eb', 'c4fc0478-d1d2-c40e-8b2d-0b90b5cce078', 'knockout', 'Semifinals', 'SF1 (8:00pm Court 3)', '4ddb6c89-cd69-b98d-2eca-df77f141cf62', 'cf305d8d-88b3-4a5a-f378-326eb1018ec5', 11, 2, '11-2', '4ddb6c89-cd69-b98d-2eca-df77f141cf62'),
  ('6162b5b5-d2c9-13f4-7028-2387071f3a6f', 'c4fc0478-d1d2-c40e-8b2d-0b90b5cce078', 'knockout', 'Semifinals', 'SF2 (8:00pm Court 4)', 'c31addab-aa59-6e04-c569-579e19ac0079', 'ef11272f-1041-7214-8f0f-2b70003a2630', 11, 6, '11-6', 'c31addab-aa59-6e04-c569-579e19ac0079'),
  ('3d7ce4af-ce99-e5f0-de75-3a7d1c6de73c', 'c4fc0478-d1d2-c40e-8b2d-0b90b5cce078', 'knockout', 'Final', 'Championship Final (8:20pm Court 4)', '4ddb6c89-cd69-b98d-2eca-df77f141cf62', 'c31addab-aa59-6e04-c569-579e19ac0079', 9, 11, '9-11', 'c31addab-aa59-6e04-c569-579e19ac0079')
ON CONFLICT (id) DO NOTHING;
