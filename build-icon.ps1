Add-Type -AssemblyName System.Drawing
$size = 256
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::Transparent)

# Base shadow
$baseBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 204, 102, 0))
$g.FillEllipse($baseBrush, 30, 215, 196, 26)

# Main Cone (Orange)
$orangeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 136, 0))
$pts = @(
    (New-Object System.Drawing.PointF 128, 20),
    (New-Object System.Drawing.PointF 38, 226),
    (New-Object System.Drawing.PointF 218, 226)
)
$g.FillPolygon($orangeBrush, $pts)

# Top White Stripe
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$topStripe = @(
    (New-Object System.Drawing.PointF 108, 70),
    (New-Object System.Drawing.PointF 82, 125),
    (New-Object System.Drawing.PointF 174, 125),
    (New-Object System.Drawing.PointF 148, 70)
)
$g.FillPolygon($whiteBrush, $topStripe)

# Bottom White Stripe
$bottomStripe = @(
    (New-Object System.Drawing.PointF 72, 150),
    (New-Object System.Drawing.PointF 52, 195),
    (New-Object System.Drawing.PointF 204, 195),
    (New-Object System.Drawing.PointF 184, 150)
)
$g.FillPolygon($whiteBrush, $bottomStripe)

$g.Dispose()

$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream ("vlc.ico", [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$bmp.Dispose()
Write-Host "vlc.ico generated successfully." -ForegroundColor Green
