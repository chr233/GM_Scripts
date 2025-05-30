$basePath = "C:\Users\ASUS\source\repos"
$configTarget = Join-Path $basePath "asf_config"
$logTarget = Join-Path $basePath "asf_logs"

function New-Link {
    param (
        [string]$linkPath,
        [string]$targetPath,
        [string]$desc
    )
    if (Test-Path $linkPath) {
        Remove-Item $linkPath -Recurse -Force
    }
    New-Item -ItemType Junction -Path $linkPath -Target $targetPath
    Write-Host "已为 $desc 创建目录联接：$linkPath -> $targetPath"
}

# 遍历所有一级文件夹
Get-ChildItem -Path $basePath -Directory | ForEach-Object {
    $asfPath = Join-Path $_.FullName "ArchiSteamFarm" "ArchiSteamFarm"
    
    if (!(Test-Path $asfPath)) {
        $asfPath = Join-Path $_.FullName "ArchiSteamFarm"
    }

    if (Test-Path $asfPath) {
        # $net8Path = Join-Path $asfPath "bin\Debug\net8.0"
        # Remove-Item $net8Path -Recurse -Force
        # $net8Path = Join-Path $asfPath "bin\Release\net8.0"
        # Remove-Item $net8Path -Recurse -Force

        $configLink = Join-Path $asfPath "bin\Debug\net9.0\config"
        New-Link -linkPath $configLink -targetPath $configTarget -desc $asfPath
        
        $configLink = Join-Path $asfPath "bin\Release\net9.0\config"
        New-Link -linkPath $configLink -targetPath $configTarget -desc $asfPath

        $logLink = Join-Path $asfPath "bin\Debug\net9.0\logs"
        New-Link -linkPath $logLink -targetPath $logTarget -desc $asfPath

        $logLink = Join-Path $asfPath "bin\Release\net9.0\logs"
        New-Link -linkPath $logLink -targetPath $logTarget -desc $asfPath
    }
}

