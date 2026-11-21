# Sépare l'encre du logo (très sombre) du filaire (gris) dans la capture 1440
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'docs\captures\hero-1440.png'))

$x0 = 916; $y0 = 224; $x1 = 1351; $y1 = 768

$grayCount = 0; $darkCount = 0
$gx0 = 99999; $gy0 = 99999; $gx1 = -1; $gy1 = -1
$dx0 = 99999; $dy0 = 99999; $dx1 = -1; $dy1 = -1
$gsum = 0; $gmin = 255

for ($y = $y0; $y -lt $y1; $y++) {
  for ($x = $x0; $x -lt $x1; $x++) {
    $c = $bmp.GetPixel($x, $y)
    $lum = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
    if ($lum -lt 80) {
      $darkCount++
      if ($x -lt $dx0) { $dx0 = $x }; if ($x -gt $dx1) { $dx1 = $x }
      if ($y -lt $dy0) { $dy0 = $y }; if ($y -gt $dy1) { $dy1 = $y }
    } elseif ($lum -lt 240) {
      $grayCount++
      $gsum += $lum
      if ($lum -lt $gmin) { $gmin = $lum }
      if ($x -lt $gx0) { $gx0 = $x }; if ($x -gt $gx1) { $gx1 = $x }
      if ($y -lt $gy0) { $gy0 = $y }; if ($y -gt $gy1) { $gy1 = $y }
    }
  }
}

$bmp.Dispose()

$sphereCx = ($gx0 + $gx1) / 2
$sphereCy = ($gy0 + $gy1) / 2
$logoCx = ($dx0 + $dx1) / 2
$logoCy = ($dy0 + $dy1) / 2

"Filaire (gris 80-239) : $grayCount px, boite $gx0,$gy0 -> $gx1,$gy1 ($($gx1-$gx0)x$($gy1-$gy0)), centre $sphereCx,$sphereCy, lumiere min $([math]::Round($gmin,1)) moy $([math]::Round($gsum/$grayCount,1))"
"Logo (encre <80)     : $darkCount px, boite $dx0,$dy0 -> $dx1,$dy1 ($($dx1-$dx0)x$($dy1-$dy0)), centre $logoCx,$logoCy"
"Ecart centre filaire / centre encre : dx $([math]::Round($logoCx-$sphereCx,1)) px, dy $([math]::Round($logoCy-$sphereCy,1)) px"
"Centre du cadre canvas : 1133.5, 496"
