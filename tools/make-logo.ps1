param(
  [Parameter(Mandatory = $true)][string]$Src,
  [string]$OutDir = "assets",
  [ValidateSet("auto", "mark")][string]$Mode = "auto"
)

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class LogoFx
{
    const int White = 236;

    static byte[] GetBytes(Bitmap bmp, out int stride)
    {
        Rectangle rect = new Rectangle(0, 0, bmp.Width, bmp.Height);
        BitmapData data = bmp.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
        stride = data.Stride;
        byte[] buf = new byte[data.Stride * bmp.Height];
        Marshal.Copy(data.Scan0, buf, 0, buf.Length);
        bmp.UnlockBits(data);
        return buf;
    }

    static double Lum(byte[] buf, int stride, int x, int y)
    {
        int i = y * stride + x * 3;
        return 0.299 * buf[i + 2] + 0.587 * buf[i + 1] + 0.114 * buf[i];
    }

    public static int[] InkBox(Bitmap bmp)
    {
        int stride; byte[] buf = GetBytes(bmp, out stride);
        int minX = bmp.Width, minY = bmp.Height, maxX = -1, maxY = -1;
        for (int y = 0; y < bmp.Height; y++)
        {
            for (int x = 0; x < bmp.Width; x++)
            {
                if (Lum(buf, stride, x, y) < White)
                {
                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                }
            }
        }
        if (maxX < 0) return new int[] { 0, 0, 0, 0 };
        return new int[] { minX, minY, maxX - minX + 1, maxY - minY + 1 };
    }

    public static int FindGap(Bitmap bmp, int[] box)
    {
        int stride; byte[] buf = GetBytes(bmp, out stride);
        bool[] ink = new bool[bmp.Width];
        for (int x = box[0]; x < box[0] + box[2]; x++)
        {
            for (int y = box[1]; y < box[1] + box[3]; y++)
            {
                if (Lum(buf, stride, x, y) < White) { ink[x] = true; break; }
            }
        }
        int start = box[0] + (int)(box[2] * 0.25);
        int end = box[0] + (int)(box[2] * 0.75);
        int bestStart = -1, bestLen = 0, curStart = -1, curLen = 0;
        for (int x = start; x < end; x++)
        {
            if (!ink[x])
            {
                if (curLen == 0) curStart = x;
                curLen++;
                if (curLen > bestLen) { bestLen = curLen; bestStart = curStart; }
            }
            else curLen = 0;
        }
        return bestLen >= 3 ? bestStart + bestLen / 2 : -1;
    }

    public static void SaveCrop(Bitmap bmp, Rectangle crop, bool white, string path)
    {
        int stride; byte[] buf = GetBytes(bmp, out stride);
        using (Bitmap outBmp = new Bitmap(crop.Width, crop.Height, PixelFormat.Format32bppArgb))
        {
            Rectangle r = new Rectangle(0, 0, crop.Width, crop.Height);
            BitmapData od = outBmp.LockBits(r, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
            byte[] outp = new byte[od.Stride * crop.Height];
            for (int y = 0; y < crop.Height; y++)
            {
                for (int x = 0; x < crop.Width; x++)
                {
                    double l = Lum(buf, stride, crop.X + x, crop.Y + y);
                    int a = (int)Math.Round((White - l) * 255.0 / White);
                    if (a < 0) a = 0;
                    if (a > 255) a = 255;
                    int i = y * od.Stride + x * 4;
                    byte c = white ? (byte)255 : (byte)0;
                    outp[i] = c;
                    outp[i + 1] = c;
                    outp[i + 2] = c;
                    outp[i + 3] = (byte)a;
                }
            }
            Marshal.Copy(outp, 0, od.Scan0, outp.Length);
            outBmp.UnlockBits(od);
            outBmp.Save(path, ImageFormat.Png);
        }
    }

    public static void SaveTile(string srcPng, string path, int size, int bgR, int bgG, int bgB)
    {
        using (Bitmap logo = new Bitmap(srcPng))
        using (Bitmap tile = new Bitmap(size, size, PixelFormat.Format32bppArgb))
        using (Graphics g = Graphics.FromImage(tile))
        {
            g.Clear(Color.FromArgb(bgR, bgG, bgB));
            g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
            double scale = Math.Min((size * 0.62) / logo.Width, (size * 0.86) / logo.Height);
            int w = (int)Math.Round(logo.Width * scale);
            int h = (int)Math.Round(logo.Height * scale);
            g.DrawImage(logo, (size - w) / 2, (size - h) / 2, w, h);
            tile.Save(path, ImageFormat.Png);
        }
    }
}
'@

$srcPath = (Resolve-Path $Src).Path
$img = New-Object System.Drawing.Bitmap($srcPath)

$box = [LogoFx]::InkBox($img)
if ($box[2] -eq 0) { Write-Error "Aucun pixel de logo detecte"; exit 1 }

$padX = [int]([Math]::Max(2, $box[2] * 0.015))
$padY = [int]([Math]::Max(2, $box[3] * 0.015))
$ix = [Math]::Max(0, $box[0] - $padX)
$iy = [Math]::Max(0, $box[1] - $padY)
$iw = [Math]::Min($img.Width - $ix, $box[2] + 2 * $padX)
$ih = [Math]::Min($img.Height - $iy, $box[3] + 2 * $padY)
$full = New-Object System.Drawing.Rectangle($ix, $iy, $iw, $ih)

[LogoFx]::SaveCrop($img, $full, $false, (Join-Path $OutDir "logo.png"))
[LogoFx]::SaveCrop($img, $full, $true, (Join-Path $OutDir "logo-light.png"))
Write-Output ("logo.png        {0}x{1}" -f $iw, $ih)

$gap = if ($Mode -eq "auto") { [LogoFx]::FindGap($img, $box) } else { -1 }
if ($gap -gt 0) {
    $mx = $ix
    $mw = [Math]::Min($img.Width - $ix, ($gap - $box[0]) + $padX)
    $mark = New-Object System.Drawing.Rectangle($mx, $iy, $mw, $ih)
    [LogoFx]::SaveCrop($img, $mark, $false, (Join-Path $OutDir "monogramme.png"))
    [LogoFx]::SaveCrop($img, $mark, $true, (Join-Path $OutDir "monogramme-light.png"))
    Write-Output ("monogramme.png  {0}x{1}" -f $mw, $ih)
    [LogoFx]::SaveTile((Join-Path $OutDir "monogramme-light.png"), (Join-Path $OutDir "favicon.png"), 64, 10, 10, 10)
    Write-Output "favicon.png     64x64"
}
elseif ($Mode -eq "mark") {
    [LogoFx]::SaveCrop($img, $full, $false, (Join-Path $OutDir "monogramme.png"))
    [LogoFx]::SaveCrop($img, $full, $true, (Join-Path $OutDir "monogramme-light.png"))
    [LogoFx]::SaveTile((Join-Path $OutDir "monogramme-light.png"), (Join-Path $OutDir "favicon.png"), 64, 10, 10, 10)
    Write-Output "monogramme.png + favicon.png"
}
else {
    Write-Output "Pas de separation symbole/texte detectee"
}

$img.Dispose()
