@echo off

call yarn build
call yarn libBuild

xcopy /d /y /q .\main.js .\dist\
