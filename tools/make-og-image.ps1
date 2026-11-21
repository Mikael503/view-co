# Génère assets/og-image.png (1200x630) : logo VIEW.co sur fond papier.
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$w = 1200
$h = 630

$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'HighQuality'
$g.InterpolationMode = 'HighQualityBicubic'
$g.PixelOffsetMode = 'HighQuality'

$paper = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#f3f2ee'))
$g.FillRectangle($paper, 0, 0, $w, $h)

$logo = [System.Drawing.Image]::FromFile((Join-Path $root 'assets/logo.png'))
$logoW = 560
$logoH = [int][math]::Round($logo.Height * $logoW / $logo.Width)
$g.DrawImage($logo, [int](($w - $logoW) / 2), [int](($h - $logoH) / 2), $logoW, $logoH)

# Filet de signature en bas de l'image.
$line = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#0a0a0a'), 1)
$g.DrawLine($line, 80, $h - 80, $w - 80, $h - 80)

$g.Dispose()
$logo.Dispose()
$bmp.Save((Join-Path $root 'assets/og-image.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output 'assets/og-image.png'
