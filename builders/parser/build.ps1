# Usage: .\build.ps1 debug  OR  .\build.ps1 release
param (
    [Parameter(Position = 0)]
    [ValidateSet("debug", "release")]
    [string]$Mode = "debug"
)

# --- Configuration ---

# --- User-configurable variables ---
$Compiler = "g++"
$Std      = "-std=c++26"
$RootDir  = Resolve-Path "$PSScriptRoot/../.." | ForEach-Object { $_.Path }
$StdToolsetDir = "$RootDir/StdToolset"
$SrcDir   = "$RootDir/src"
$Source   = "$PSScriptRoot/bundler.cpp"
$OutDir   = "$RootDir/build"
$Includes = @("-I$StdToolsetDir", "-I$SrcDir")


# Ensure the build directory exists
if (!(Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }


# --- Mode Logic ---
if ($Mode -eq "debug") {
    Write-Host "Building in [DEBUG] mode..."
    $Flags   = "-g -D_DEBUG"
    $Output  = "$OutDir/parser_debug.exe"
} else {
    Write-Host "Building in [RELEASE] mode..."
    $Flags   = "-O3 -DNDEBUG" # -O3 for max optimization
    $Output  = "$OutDir/parser.exe"
}
$FullCommand = "$Compiler $Std `"$Source`" $($Includes -join ' ') $Flags -o `"$Output`""


# --- Build Command ---
Write-Host "Running: $FullCommand"
Invoke-Expression $FullCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build Successful: $Output"
} else {
    Write-Host "Build Failed with exit code $LASTEXITCODE"
}