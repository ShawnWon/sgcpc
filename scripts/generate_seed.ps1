# PowerShell script to generate SQL seed file from mockData.js
$content = [System.IO.File]::ReadAllText("$PSScriptRoot\..\js\mockData.js")
# Strip comments
$lines = $content -split "`r?`n"
$cleanLines = @()
foreach ($l in $lines) {
    $trimmed = $l.Trim()
    if ($trimmed.StartsWith('//') -or $trimmed.StartsWith('/*') -or $trimmed.StartsWith('*')) {
        continue
    }
    $cleanLines += $l
}
$cleanText = $cleanLines -join "`n"
$cleanText = [System.Text.RegularExpressions.Regex]::Replace($cleanText, '^.*?window\.embeddedMockData\s*=\s*', '')
$cleanText = [System.Text.RegularExpressions.Regex]::Replace($cleanText, ';\s*$', '')

$data = ConvertFrom-Json $cleanText

$sql = @"
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

"@

# Map of string ID to deterministic UUID
$uuidMap = @{}
function Get-DeterministicGuid([string]$key) {
    if ($uuidMap.ContainsKey($key)) { return $uuidMap[$key] }
    $md5 = [System.Security.Cryptography.MD5]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes("sgcourt-salt-" + $key)
    $hash = $md5.ComputeHash($bytes)
    $guid = [System.Guid]::new($hash).ToString()
    $uuidMap[$key] = $guid
    return $guid
}

$sql += "`n-- 2. Seed Players & Teams`n"
$sql += "INSERT INTO players (id, name, gender, dupr_rating, skill_level, paddle_model, play_style, initial_rating, current_rating, peak_rating, total_matches, total_wins, total_losses)`nVALUES`n"

$playerRows = @()
foreach ($p in $data.players) {
    $uid = Get-DeterministicGuid $p.id
    $name = $p.name.Replace("'", "''")
    $gender = $p.gender
    $dupr = $p.dupr_rating
    $skill = $p.skill_level.Replace("'", "''")
    $paddle = $p.paddle_model.Replace("'", "''")
    $style = $p.play_style.Replace("'", "''")
    $initR = $p.initial_rating
    $currR = $p.current_rating
    $peakR = $p.peak_rating
    $totM = $p.total_matches
    $totW = $p.total_wins
    $totL = $p.total_losses
    $playerRows += "  ('$uid', '$name', '$gender', $dupr, '$skill', '$paddle', '$style', $initR, $currR, $peakR, $totM, $totW, $totL)"
}
$sql += ($playerRows -join ",`n") + "`nON CONFLICT (id) DO UPDATE SET`n  current_rating = EXCLUDED.current_rating, peak_rating = EXCLUDED.peak_rating;`n"

$sql += "`n-- 3. Seed Tournaments`n"
$sql += "INSERT INTO tournaments (id, title, tournament_date, location, status, format, rules_notes)`nVALUES`n"
$tRows = @()
foreach ($t in $data.tournaments) {
    $uid = Get-DeterministicGuid $t.id
    $title = $t.title.Replace("'", "''")
    $date = $t.tournament_date
    $loc = $t.location.Replace("'", "''")
    $status = $t.status
    $fmt = $t.format.Replace("'", "''")
    $notes = ($t.groups -join ", ").Replace("'", "''")
    $tRows += "  ('$uid', '$title', '$date', '$loc', '$status', '$fmt', '$notes')"
}
$sql += ($tRows -join ",`n") + "`nON CONFLICT (id) DO NOTHING;`n"

$sql += "`n-- 4. Seed Tournament Participants`n"
$sql += "INSERT INTO tournament_participants (id, tournament_id, player_id, starting_rating, ending_rating, rating_change, final_rank)`nVALUES`n"
$partRows = @()
foreach ($t in $data.tournaments) {
    $tUid = Get-DeterministicGuid $t.id
    foreach ($part in $t.participants) {
        $pUid = Get-DeterministicGuid $part.player_id
        $partKey = "$($t.id)_$($part.player_id)"
        $partUid = Get-DeterministicGuid $partKey
        $rank = $part.final_rank
        $partRows += "  ('$partUid', '$tUid', '$pUid', 1500, 1500, 0, $rank)"
    }
}
$sql += ($partRows -join ",`n") + "`nON CONFLICT (tournament_id, player_id) DO NOTHING;`n"

$sql += "`n-- 5. Seed Tournament Matches`n"
$sql += "INSERT INTO matches (id, tournament_id, stage, group_name, round_name, player1_id, player2_id, player1_score, player2_score, set_scores, winner_id)`nVALUES`n"
$matchRows = @()
foreach ($t in $data.tournaments) {
    $tUid = Get-DeterministicGuid $t.id
    foreach ($m in $t.matches) {
        $mUid = Get-DeterministicGuid $m.id
        $stage = $m.stage
        $group = $m.group_name.Replace("'", "''")
        $round = $m.round_name.Replace("'", "''")
        $p1Uid = Get-DeterministicGuid $m.player1_id
        $p2Uid = Get-DeterministicGuid $m.player2_id
        $wUid = Get-DeterministicGuid $m.winner_id
        $s1 = $m.player1_score
        $s2 = $m.player2_score
        $scores = $m.set_scores
        $matchRows += "  ('$mUid', '$tUid', '$stage', '$group', '$round', '$p1Uid', '$p2Uid', $s1, $s2, '$scores', '$wUid')"
    }
}
$sql += ($matchRows -join ",`n") + "`nON CONFLICT (id) DO NOTHING;`n"

[System.IO.File]::WriteAllText("$PSScriptRoot\..\sql\seed.sql", $sql, [System.Text.Encoding]::UTF8)
Write-Host "Generated sql/seed.sql successfully!"
