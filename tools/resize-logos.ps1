# Redimensionne les logos pour l'en-tête et le pied de page (140 px de large = 2x de 70 px).
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot

foreach ($name in @('logo', 'logo-light')) {
  $src = [System.Drawing.Image]::FromFile((Join-Path $root "assets/$name.png"))
  $w = 140
  $h = [int][math]::Round($src.Height * $w / $src.Width)
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.PixelOffsetMode = 'HighQuality'
  $g.SmoothingMode = 'HighQuality'
  $g.DrawImage($src, 0, 0, $w, $h)
  $g.Dispose()
  $src.Dispose()
  $out = Join-Path $root "assets/$name-140.png"
  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "$name -> ${w}x${h} : $out"
}
