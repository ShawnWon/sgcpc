Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# 1. Background Gradient
$bgRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$cDarkNavy = [System.Drawing.Color]::FromArgb(255, 8, 12, 20)
$cDeepNavy = [System.Drawing.Color]::FromArgb(255, 15, 23, 42)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($bgRect, $cDarkNavy, $cDeepNavy, 45.0)
$g.FillRectangle($bgBrush, $bgRect)

# 2. Glowing Ambient Orbs
$limeGlowColor = [System.Drawing.Color]::FromArgb(40, 163, 230, 53)
$limeBrush = New-Object System.Drawing.SolidBrush($limeGlowColor)
$g.FillEllipse($limeBrush, -100, -100, 600, 600)

$emeraldGlowColor = [System.Drawing.Color]::FromArgb(35, 16, 185, 129)
$emeraldBrush = New-Object System.Drawing.SolidBrush($emeraldGlowColor)
$g.FillEllipse($emeraldBrush, 700, 200, 700, 700)

# 3. Subtle Court Outline
$courtPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(20, 255, 255, 255), 2)
$g.DrawRectangle($courtPen, 60, 50, 1080, 530)
$g.DrawLine($courtPen, 600, 50, 600, 580)
$g.DrawLine($courtPen, 360, 50, 360, 580)
$g.DrawLine($courtPen, 840, 50, 840, 580)

# Colors
$white = [System.Drawing.Color]::FromArgb(255, 248, 250, 252)
$lime = [System.Drawing.Color]::FromArgb(255, 163, 230, 53)
$slate = [System.Drawing.Color]::FromArgb(255, 148, 163, 184)
$muted = [System.Drawing.Color]::FromArgb(255, 100, 116, 139)
$cardBg = [System.Drawing.Color]::FromArgb(240, 11, 17, 32)
$cardBorder = [System.Drawing.Color]::FromArgb(100, 163, 230, 53)
$gold = [System.Drawing.Color]::FromArgb(255, 251, 191, 36)
$sky = [System.Drawing.Color]::FromArgb(255, 56, 189, 248)

# Fonts
$fontBadge = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 42, [System.Drawing.FontStyle]::Bold)
$fontSubtitle = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
$fontDesc = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Regular)
$fontCardTitle = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$fontPlayerName = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
$fontSubInfo = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Regular)
$fontScore = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
$fontRank = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)

# Left Side: Header & Info
# Pill badge
$badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, 163, 230, 53))
$badgePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(80, 163, 230, 53), 1)
$g.FillRectangle($badgeBrush, 80, 80, 270, 34)
$g.DrawRectangle($badgePen, 80, 80, 270, 34)
$g.FillEllipse((New-Object System.Drawing.SolidBrush($lime)), 95, 93, 8, 8)
$g.DrawString("SINGAPORE DUPR LEAGUE", $fontBadge, (New-Object System.Drawing.SolidBrush($lime)), 110, 88)

# Brand Title
$g.DrawString("SG CHAMPION CLUB", $fontTitle, (New-Object System.Drawing.SolidBrush($white)), 75, 130)

# Subtitle
$g.DrawString("Pickleball Standings & Tournaments", $fontSubtitle, (New-Object System.Drawing.SolidBrush($lime)), 80, 205)

# Descriptions
$g.DrawString("Equal 1500 Baseline · Official DUPR Ratings · Head-to-Head Clash", $fontDesc, (New-Object System.Drawing.SolidBrush($slate)), 80, 245)

# Stats boxes
function Draw-StatBox($x, $y, $w, $h, $label, $val, $valColor) {
    $boxBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 15, 23, 42))
    $boxPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 148, 163, 184), 1)
    $g.FillRectangle($boxBrush, $x, $y, $w, $h)
    $g.DrawRectangle($boxPen, $x, $y, $w, $h)
    $g.DrawString($label, (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush($slate)), ($x + 14), ($y + 12))
    $g.DrawString($val, (New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush($valColor)), ($x + 14), ($y + 32))
}

Draw-StatBox 80 300 150 72 "BASELINE" "1500 PTS" $lime
Draw-StatBox 245 300 150 72 "DUPR LEVEL" "3.50 - 4.5+" $sky
Draw-StatBox 410 300 150 72 "DIVISIONS" "MD / WD / XD" $gold

# Bottom features
$fontFeature = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Regular)
$g.DrawString("⚡ Live Bracket · Round Robin Pool Matrix · Community Chat", $fontFeature, (New-Object System.Drawing.SolidBrush($muted)), 80, 520)

# Right Side: Featured Leaderboard Card
$cardX = 660
$cardY = 80
$cardW = 460
$cardH = 470
$g.FillRectangle((New-Object System.Drawing.SolidBrush($cardBg)), $cardX, $cardY, $cardW, $cardH)
$g.DrawRectangle((New-Object System.Drawing.Pen($cardBorder, 2)), $cardX, $cardY, $cardW, $cardH)

# Card Header
$g.DrawString("🏆 TOP TOURNAMENT STANDINGS", $fontCardTitle, (New-Object System.Drawing.SolidBrush($white)), ($cardX + 28), ($cardY + 26))
$g.DrawString("Verified Match Results & Rating Exchanges", $fontSubInfo, (New-Object System.Drawing.SolidBrush($lime)), ($cardX + 28), ($cardY + 48))

function Draw-PlayerCardRow($y, $rank, $name, $paddle, $dupr, $pts, $delta, $rankColor) {
    $rowRect = New-Object System.Drawing.Rectangle(($cardX + 24), $y, 412, 90)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 15, 23, 42))), $rowRect)
    $g.DrawRectangle((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 255, 255, 255), 1)), $rowRect)

    # Rank Circle
    $g.FillEllipse((New-Object System.Drawing.SolidBrush($rankColor)), ($cardX + 42), ($y + 26), 36, 36)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $textBrush = if ($rankColor.R -gt 200) { New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black) } else { New-Object System.Drawing.SolidBrush($white) }
    $g.DrawString($rank.ToString(), $fontRank, $textBrush, ($cardX + 60), ($y + 44), $sf)

    # Name and Paddle
    $g.DrawString($name, $fontPlayerName, (New-Object System.Drawing.SolidBrush($white)), ($cardX + 90), ($y + 24))
    $g.DrawString("DUPR $dupr · $paddle", $fontSubInfo, (New-Object System.Drawing.SolidBrush($slate)), ($cardX + 90), ($y + 48))

    # Pts
    $g.DrawString($pts.ToString(), $fontScore, (New-Object System.Drawing.SolidBrush($lime)), ($cardX + 330), ($y + 22))
    $g.DrawString("+$delta Pts", $fontSubInfo, (New-Object System.Drawing.SolidBrush($slate)), ($cardX + 338), ($y + 48))
}

$cSilver = [System.Drawing.Color]::FromArgb(255, 148, 163, 184)
$cBronze = [System.Drawing.Color]::FromArgb(255, 205, 127, 50)

Draw-PlayerCardRow ($cardY + 90)  1 "MD3 (Randeep / Edwin)" "Selkirk Power Air" "4.25" 1578 78 $gold
Draw-PlayerCardRow ($cardY + 195) 2 "XD3 (Henry / Claudia)" "Joola Perseus 16mm" "4.10" 1566 66 $cSilver
Draw-PlayerCardRow ($cardY + 300) 3 "WD4 (Claudia / Karen)" "CRBN 1X Power" "3.95" 1548 48 $cBronze

# Micro trendline at card bottom
$trendPen = New-Object System.Drawing.Pen($lime, 2)
$g.DrawLine($trendPen, ($cardX + 28), ($cardY + 430), ($cardX + 100), ($cardY + 425))
$g.DrawLine($trendPen, ($cardX + 100), ($cardY + 425), ($cardX + 200), ($cardY + 415))
$g.DrawLine($trendPen, ($cardX + 200), ($cardY + 415), ($cardX + 300), ($cardY + 420))
$g.DrawLine($trendPen, ($cardX + 300), ($cardY + 420), ($cardX + 430), ($cardY + 400))
$g.FillEllipse((New-Object System.Drawing.SolidBrush($lime)), ($cardX + 426), ($cardY + 396), 8, 8)

# Output PNG
$outPath = "$PSScriptRoot\..\assets\og-image.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Host "Successfully generated $outPath"
