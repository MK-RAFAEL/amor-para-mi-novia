$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $root "dist"

New-Item -ItemType Directory -Force -Path $dist | Out-Null

function Get-DataUri {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  $bytes = [System.IO.File]::ReadAllBytes($Path)
  $extension = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()

  $mimeMap = @{
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
    ".svg"  = "image/svg+xml"
  }

  if (-not $mimeMap.ContainsKey($extension)) {
    throw "Formato no soportado para convertir a data URI: $Path"
  }

  $base64 = [System.Convert]::ToBase64String($bytes)
  return "data:{0};base64,{1}" -f $mimeMap[$extension], $base64
}

$indexPath = Join-Path $root "index.html"
$stylesPath = Join-Path $root "styles.css"
$scriptPath = Join-Path $root "script.js"

$html = Get-Content $indexPath -Raw
$styles = Get-Content $stylesPath -Raw
$script = Get-Content $scriptPath -Raw

$heroImage = Get-DataUri (Join-Path $root "assets\images\hero-couple.png")
$miniImage = Get-DataUri (Join-Path $root "assets\images\mini-couple.png")
$sunsetImage = Get-DataUri (Join-Path $root "assets\images\sunset-couple.jpg")

$html = $html.Replace('<link rel="stylesheet" href="styles.css">', "<style>`n$styles`n</style>")
$html = $html.Replace('<script src="script.js"></script>', "<script>`n$script`n</script>")
$html = $html.Replace('src="assets/images/hero-couple.png"', "src=""$heroImage""")
$html = $html.Replace('src="assets/images/mini-couple.png"', "src=""$miniImage""")
$html = $html.Replace('src="assets/images/sunset-couple.jpg"', "src=""$sunsetImage""")

$outputPath = Join-Path $dist "amor-share.html"
[System.IO.File]::WriteAllText($outputPath, $html, [System.Text.Encoding]::UTF8)

Write-Output $outputPath
