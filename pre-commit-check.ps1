# Pre-commit Security Check Script (PowerShell)
# Run this before committing to ensure no secrets are exposed

Write-Host "🔍 Running pre-commit security checks..." -ForegroundColor Cyan
Write-Host ""

$ErrorsFound = 0
$WarningsFound = 0

# Check for .env files
Write-Host "1. Checking for .env files..." -ForegroundColor White
$envFiles = git diff --cached --name-only | Select-String -Pattern "\.env$|\.env\.local$|\.env\.production$"
if ($envFiles) {
    Write-Host "❌ ERROR: .env file detected in commit!" -ForegroundColor Red
    Write-Host "   Remove .env files from commit" -ForegroundColor Red
    $ErrorsFound++
} else {
    Write-Host "✅ No .env files in commit" -ForegroundColor Green
}
Write-Host ""

# Check for common secret patterns
Write-Host "2. Checking for exposed secrets..." -ForegroundColor White
$diff = git diff --cached

# Check for API keys
if ($diff | Select-String -Pattern "api[_-]?key.*=.*['\`"][a-zA-Z0-9]{20,}" -CaseSensitive:$false) {
    Write-Host "❌ Possible API key found!" -ForegroundColor Red
    $ErrorsFound++
}

# Check for passwords
if ($diff | Select-String -Pattern "password.*=.*['\`"][^'\`"]{8,}" -CaseSensitive:$false) {
    Write-Host "❌ Possible password found!" -ForegroundColor Red
    $ErrorsFound++
}

# Check for tokens
if ($diff | Select-String -Pattern "token.*=.*['\`"][a-zA-Z0-9]{20,}" -CaseSensitive:$false) {
    Write-Host "❌ Possible token found!" -ForegroundColor Red
    $ErrorsFound++
}

# Check for Supabase keys
if ($diff | Select-String -Pattern "supabase.*key.*=.*['\`"][a-zA-Z0-9]{20,}" -CaseSensitive:$false) {
    Write-Host "❌ Possible Supabase key found!" -ForegroundColor Red
    $ErrorsFound++
}

# Check for database credentials
if ($diff | Select-String -Pattern "DB_PASSWORD|DATABASE_URL|CONNECTION_STRING" -CaseSensitive:$false) {
    Write-Host "⚠️  Possible database credentials found!" -ForegroundColor Yellow
    $WarningsFound++
}

if ($ErrorsFound -eq 0) {
    Write-Host "✅ No obvious secrets detected" -ForegroundColor Green
}
Write-Host ""

# Check for large files
Write-Host "3. Checking for large files..." -ForegroundColor White
$stagedFiles = git diff --cached --name-only
$largeFiles = @()
foreach ($file in $stagedFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length / 1MB
        if ($size -gt 1) {
            $largeFiles += "$file ($([math]::Round($size, 2)) MB)"
        }
    }
}

if ($largeFiles.Count -gt 0) {
    Write-Host "⚠️  Large files detected (>1MB):" -ForegroundColor Yellow
    $largeFiles | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
    Write-Host "   Consider using Git LFS for large files" -ForegroundColor Yellow
    $WarningsFound++
} else {
    Write-Host "✅ No large files detected" -ForegroundColor Green
}
Write-Host ""

# Check for node_modules
Write-Host "4. Checking for node_modules..." -ForegroundColor White
$nodeModules = git diff --cached --name-only | Select-String -Pattern "node_modules"
if ($nodeModules) {
    Write-Host "❌ node_modules detected in commit!" -ForegroundColor Red
    Write-Host "   Add node_modules to .gitignore" -ForegroundColor Red
    $ErrorsFound++
} else {
    Write-Host "✅ No node_modules in commit" -ForegroundColor Green
}
Write-Host ""

# Check for .next build folder
Write-Host "5. Checking for .next build folder..." -ForegroundColor White
$nextBuild = git diff --cached --name-only | Select-String -Pattern "\.next/"
if ($nextBuild) {
    Write-Host "❌ .next build folder detected in commit!" -ForegroundColor Red
    Write-Host "   Add .next to .gitignore" -ForegroundColor Red
    $ErrorsFound++
} else {
    Write-Host "✅ No .next folder in commit" -ForegroundColor Green
}
Write-Host ""

# Run npm audit (optional - can be slow)
Write-Host "6. Running npm audit..." -ForegroundColor White
try {
    $auditResult = npm audit --audit-level=high 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ No high/critical vulnerabilities" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Vulnerabilities found. Run 'npm audit' for details" -ForegroundColor Yellow
        $WarningsFound++
    }
} catch {
    Write-Host "⚠️  Could not run npm audit" -ForegroundColor Yellow
}
Write-Host ""

# Check TypeScript/ESLint
Write-Host "7. Checking TypeScript/ESLint..." -ForegroundColor White
try {
    $lintResult = npm run lint 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ No linting errors" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Linting errors found. Run 'npm run lint' for details" -ForegroundColor Yellow
        $WarningsFound++
    }
} catch {
    Write-Host "⚠️  Could not run linter" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
if ($ErrorsFound -eq 0 -and $WarningsFound -eq 0) {
    Write-Host "✨ All pre-commit checks passed!" -ForegroundColor Green
    Write-Host "   You can proceed with commit." -ForegroundColor Green
    exit 0
} elseif ($ErrorsFound -gt 0) {
    Write-Host "❌ $ErrorsFound error(s) found!" -ForegroundColor Red
    Write-Host "   Fix errors before committing." -ForegroundColor Red
    exit 1
} else {
    Write-Host "⚠️  $WarningsFound warning(s) found." -ForegroundColor Yellow
    Write-Host "   Review warnings before committing." -ForegroundColor Yellow
    Write-Host "   You can still proceed if warnings are acceptable." -ForegroundColor Yellow
    exit 0
}
