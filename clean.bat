@echo off
echo Cleaning build directories...
if exist dist rmdir /s /q dist
if exist dist-electron rmdir /s /q dist-electron
if exist release rmdir /s /q release
echo Clean complete!
