@echo off
setlocal
rem Let Windows PowerShell rebuild its own module paths when called from pwsh.
set "PSModulePath="
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\bootstrap.ps1" %*
exit /b %errorlevel%
