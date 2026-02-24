# DOM Size Optimization Script - Extract JavaScript to app.js

Write-Host "Starting DOM optimization..." -ForegroundColor Cyan

# Create backup
Copy-Item "index.html" "index.html.backup" -Force
Write-Host "Backup created: index.html.backup" -ForegroundColor Green

# Read file
$html = Get-Content "index.html" -Raw

# Find where main JavaScript starts and ends  
# Lines 1229-3963 approximately
$startMarker = "    <script>"
$endMarker = "    <!-- Security Script -->"

$startIndex = $html.IndexOf($startMarker)
$endIndex = $html.IndexOf($endMarker, $startIndex)

if ($startIndex -gt 0 -and $endIndex -gt $startIndex) {
    # Extract the script section
    $scriptSection = $html.Substring($startIndex, $endIndex - $startIndex)
    
    # Remove <script> and </script> tags to get pure JavaScript
    $js = $scriptSection -replace '<script>', '' -replace '</script>', ''
    $js = $js.Trim()
    
    # Save to app.js
    Set-Content "app.js" $js -NoNewline
    
    # Create replacement text
    $replacement = "    <!-- Main Application JavaScript -->`r`n    <script src=`"app.js`" defer></script>`r`n`r`n    "
    
    # Replace in HTML
    $newHtml = $html.Substring(0, $startIndex) + $replacement + $html.Substring($endIndex)
    
    # Save updated HTML  
    Set-Content "index.html" $newHtml -NoNewline
    
    $oldSize = (Get-Item "index.html.backup").Length / 1KB
    $newSize = (Get-Item "index.html").Length / 1KB
    $reduction = (($oldSize - $newSize) / $oldSize * 100)
    
    Write-Host "`nOPTIMIZATION COMPLETE!" -ForegroundColor Green
    Write-Host "HTML: $($oldSize.ToString('F0')) KB -> $($newSize.ToString('F0')) KB" -ForegroundColor White
    Write-Host "Reduction: $($reduction.ToString('F0'))%" -ForegroundColor Yellow
    Write-Host "`nTest at: http://localhost:8000" -ForegroundColor Cyan
}
else {
    Write-Host "ERROR: Could not find script markers" -ForegroundColor Red
}
