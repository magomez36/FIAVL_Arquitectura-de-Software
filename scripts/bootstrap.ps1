#requires -Version 5.1
param([ValidateSet('dev','setup','check','shell')][string]$Mode = 'dev')
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$root = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $root

function Run($exe, [string[]]$arguments) {
    & $exe @arguments
    if ($LASTEXITCODE -ne 0) { throw "$exe $arguments (codigo $LASTEXITCODE)" }
}
function Has-Version($file, $version) {
    if (!$file -or !(Test-Path -LiteralPath $file -PathType Leaf)) { return $false }
    $actual = & $file --version
    return ($LASTEXITCODE -eq 0 -and "$actual" -eq $version)
}
function Assert-Ports {
    foreach ($port in 3001,5173) {
        $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $port)
        try {
            $listener.Server.ExclusiveAddressUse = $true
            $listener.Start()
        } catch { throw "Puerto $port ocupado o inaccesible en 127.0.0.1. Revise netstat -ano y libere el puerto antes de reintentar." }
        finally { $listener.Stop() }
    }
}

function Install-Node($stage, $destination) {
    $name = Split-Path $destination -Leaf
    $base = "https://nodejs.org/dist/v$nodeVersion"
    $archive = Join-Path $stage "$name.zip"
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Write-Host "Descargando $name de nodejs.org..."
    $checks = (Invoke-WebRequest "$base/SHASUMS256.txt" -UseBasicParsing -TimeoutSec 90).Content
    if ($checks -is [byte[]]) { $checks = [Text.Encoding]::ASCII.GetString($checks) }
    $pattern = '(?m)^([0-9a-fA-F]{64})\s+\*?' + [regex]::Escape("$name.zip") + '\r?$'
    if ($checks -notmatch $pattern) { throw "Checksum oficial ausente para $name.zip" }
    $expected = $Matches[1]
    Invoke-WebRequest "$base/$name.zip" -UseBasicParsing -OutFile $archive -TimeoutSec 300
    if ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash -ne $expected) { throw 'SHA-256 incorrecto. Descarga rechazada.' }
    Run "$env:SystemRoot\System32\tar.exe" @('-xf',$archive,'-C',$stage)
    $extracted = Join-Path $stage $name
    if (!(Has-Version (Join-Path $extracted 'node.exe') "v$nodeVersion")) { throw 'Node extraido incompatible.' }
    [IO.Directory]::Move($extracted,$destination)
}

try {
    $manifest = Get-Content package.json -Raw | ConvertFrom-Json
    $nodeVersion = $manifest.engines.node
    $npmVersion = $manifest.engines.npm
    if ($nodeVersion -notmatch '^\d+\.\d+\.\d+$' -or $npmVersion -notmatch '^\d+\.\d+\.\d+$' -or
        (Get-Content .nvmrc -Raw).Trim() -ne $nodeVersion -or $manifest.packageManager -ne "npm@$npmVersion" -or
        !(Select-String -Path .npmrc -Pattern '^engine-strict=true$' -Quiet)) { throw 'Revise engines, packageManager, .nvmrc y .npmrc.' }

    if ($Mode -in 'dev','check') { Assert-Ports }
    $cache = Join-Path $env:LOCALAPPDATA 'FIAVL\runtime'
    [void][IO.Directory]::CreateDirectory($cache)
    try { $guard = [IO.File]::Open((Join-Path $cache 'prepare.lock'),'OpenOrCreate','ReadWrite','None') }
    catch { throw "Preparacion en curso o cache inaccesible: $cache" }
    try {
        $arch = switch ($env:PROCESSOR_ARCHITECTURE) { 'ARM64' {'arm64'} 'AMD64' {'x64'} default {throw 'Use Windows x64 o ARM64 con PowerShell nativo.'} }
        $portable = Join-Path $cache "node-v$nodeVersion-win-$arch"
        $stage = Join-Path $cache ([guid]::NewGuid().ToString())
        [void][IO.Directory]::CreateDirectory($stage)
        $systemNode = Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        $systemNpm = (Get-Command npm.cmd -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1).Source
        $node = $systemNode.Source
        if (!(Has-Version $node "v$nodeVersion") -and $env:FIAVL_NODE_HOME) {
            $candidate = Join-Path $env:FIAVL_NODE_HOME 'node.exe'
            if (Has-Version $candidate "v$nodeVersion") { $node = (Resolve-Path -LiteralPath $candidate).Path }
        }
        if (!(Has-Version $node "v$nodeVersion")) {
            $node = Join-Path $portable 'node.exe'
            if (!(Has-Version $node "v$nodeVersion")) {
                if (Test-Path -LiteralPath $portable) { throw "Runtime incompleto. Revise la carpeta $portable." }
                Install-Node $stage $portable
            }
        }
        $nodeDir = Split-Path $node -Parent
        $env:Path = "$nodeDir;$env:Path"
        $privateNpm = Join-Path $cache "npm-$npmVersion"
        $npm = if ($systemNpm -and $node -eq $systemNode.Source) { $systemNpm } else {
            (Get-Command npm.cmd -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1).Source
        }
        # A wrapper beside another node.exe may silently select that runtime.
        $sibling = if ($npm) { Join-Path (Split-Path $npm) 'node.exe' }
        if (($sibling -and (Test-Path $sibling) -and $sibling -ne $node) -or !(Has-Version $npm $npmVersion)) {
            $npm = Join-Path $privateNpm 'npm.cmd'
            if (!(Has-Version $npm $npmVersion)) {
                $installer = Join-Path $nodeDir 'node_modules\npm\bin\npm-cli.js'
                if (!(Test-Path $installer)) {
                    if (!(Test-Path $portable)) { Install-Node $stage $portable }
                    $installer = Join-Path $portable 'node_modules\npm\bin\npm-cli.js'
                }
                $prefix = Join-Path $stage 'npm-prefix'
                Run $node @($installer,'install','--global','--prefix',$prefix,'--ignore-scripts','--no-audit','--no-fund','--registry=https://registry.npmjs.org',"npm@$npmVersion")
                [IO.Directory]::Move($prefix,$privateNpm)
            }
        }
        $env:Path = "$(Split-Path $npm);$nodeDir;$env:Path"
        if ((Get-Command node.exe).Source -ne $node -or (Get-Command npm.cmd).Source -ne $npm -or
            !(Has-Version $npm $npmVersion)) { throw 'Los ejecutables seleccionados no coinciden con el manifiesto.' }
        Write-Host "Node $nodeVersion [$node] | npm $npmVersion [$npm]"
        Run $node @('scripts/verify-runtime.mjs')
        $inputs = @('package-lock.json','package.json','.npmrc') + @(Get-ChildItem apps/*/package.json,packages/*/package.json | Sort-Object FullName | ForEach-Object FullName)
        $signature = (@($nodeVersion,$npmVersion,$arch) + @($inputs | ForEach-Object { (Get-FileHash -LiteralPath $_).Hash })) -join ':'
        $stamp = Join-Path $root 'node_modules/.fiavl-install'
        if (!(Test-Path $stamp) -or [IO.File]::ReadAllText($stamp) -ne $signature -or
            !(Test-Path node_modules/.package-lock.json) -or !(Test-Path node_modules/.bin/vite.cmd)) {
            Run $npm @('ci','--include=dev')
            [IO.File]::WriteAllText($stamp,$signature)
        } else { Write-Host 'Dependencias vigentes.' }
        Run $npm @('run','db:seed','--','--if-empty')
    } finally {
        try {
            if ($stage -and (Test-Path -LiteralPath $stage)) {
                $resolved = (Resolve-Path -LiteralPath $stage).Path
                if ((Split-Path $resolved -Parent) -eq (Resolve-Path $cache).Path -and (Split-Path $resolved -Leaf) -match '^[0-9a-f-]{36}$') {
                    Remove-Item -LiteralPath $resolved -Force -Recurse
                }
            }
        } finally { $guard.Dispose() }
    }
    switch ($Mode) {
        'dev' { Run $npm @('run','dev') }
        'shell' { Write-Host 'Shell FIAVL. Escriba exit para salir.'; & $env:ComSpec /D; exit $LASTEXITCODE }
        'check' {
            Run $npm @('run','lint')
            Run $npm @('run','typecheck')
            Run $npm @('test')
            Run $npm @('run','build')
            Run $node @('node_modules/playwright/cli.js','install','chromium')
            Run $npm @('run','test:e2e')
        }
    }
    exit 0
} catch { [Console]::Error.WriteLine("FIAVL: " + $_.Exception.Message); exit 1 }
