# PowerShell Native Built-in HTTP Server (Zero-Dependency)
param(
    [int]$Port = 8080
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

try {
    $listener.Start()
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "  Fortis MediKiosk Server running at:" -ForegroundColor Cyan
    Write-Host "  👉 http://localhost:$Port/" -ForegroundColor Yellow
    Write-Host "========================================================" -ForegroundColor Green
} catch {
    Write-Host "Failed to start listener on port $Port : $_" -ForegroundColor Red
    exit 1
}

$folder = $PSScriptRoot
if (-not $folder) { $folder = (Get-Location).Path }

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/" -or $path -eq "") { $path = "/index.html" }
        $localFile = Join-Path $folder $path.TrimStart('/')

        if (Test-Path $localFile -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($localFile)
            $ext = [System.IO.Path]::GetExtension($localFile).ToLower()
            $contentType = "text/plain"
            switch ($ext) {
                ".html" { $contentType = "text/html; charset=utf-8" }
                ".htm"  { $contentType = "text/html; charset=utf-8" }
                ".js"   { $contentType = "application/javascript; charset=utf-8" }
                ".css"  { $contentType = "text/css; charset=utf-8" }
                ".json" { $contentType = "application/json; charset=utf-8" }
                ".png"  { $contentType = "image/png" }
                ".jpg"  { $contentType = "image/jpeg" }
                ".svg"  { $contentType = "image/svg+xml" }
                ".ico"  { $contentType = "image/x-icon" }
            }
            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $buf = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $buf.Length
            $response.OutputStream.Write($buf, 0, $buf.Length)
        }
        $response.Close()
    } catch {
        # continue handling requests
    }
}
