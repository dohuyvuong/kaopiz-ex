@echo off
rem Deploy one-click tren Windows: chay deploy.sh bang Git Bash (Git for Windows).
rem Khong dung bash.exe cua WSL vi docker trong WSL co the khac docker tren Windows.
setlocal
chcp 65001 >nul

set "BASH_EXE="
if exist "%ProgramFiles%\Git\bin\bash.exe" set "BASH_EXE=%ProgramFiles%\Git\bin\bash.exe"
if not defined BASH_EXE (
  for /f "delims=" %%G in ('where git 2^>nul') do (
    if not defined BASH_EXE if exist "%%~dpG..\bin\bash.exe" set "BASH_EXE=%%~dpG..\bin\bash.exe"
  )
)
if not defined BASH_EXE (
  echo Khong tim thay Git Bash. Cai Git for Windows: https://git-scm.com/download/win
  pause
  exit /b 1
)

"%BASH_EXE%" "%~dp0deploy.sh" %*
set "RC=%ERRORLEVEL%"

rem Mo bang double-click thi giu cua so de doc ket qua
echo %cmdcmdline% | find /i "/c" >nul && pause
exit /b %RC%
