@echo off
setlocal EnableDelayedExpansion

set CMAKE_POLICY_VERSION_MINIMUM=3.5

echo ================================
echo Building catyas for Windows
echo ================================

:: Check if conan is installed
where conan >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Conan is not installed or not in PATH
    echo Please install Conan 2.0: pip install conan
    pause
    exit /b 1
)

:: Check if cmake is installed
where cmake >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: CMake is not installed or not in PATH
    echo Please install CMake 3.16 or higher
    pause
    exit /b 1
)

:: Get the script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

:: Create build directory if it doesn't exist, or navigate to it
if exist build (
    cd build
) else (
    mkdir build && cd build
)

echo.
echo Step 1/3: Installing dependencies with Conan...
echo ================================================
:: Install dependencies for both Debug and Release configurations
echo Installing Debug configuration...
conan install .. --output-folder=. --build=missing -s arch=x86_64 -s build_type=Debug
if %errorlevel% neq 0 goto ExitLabelFailure

echo Installing Release configuration...
conan install .. --output-folder=. --build=missing -s arch=x86_64 -s build_type=Release
if %errorlevel% neq 0 goto ExitLabelFailure

echo.
echo Step 2/3: Configuring with CMake...
echo ====================================
:: Configure CMake with the toolchain file
cmake .. -G "Visual Studio 17 2022" -DCMAKE_TOOLCHAIN_FILE=conan_toolchain.cmake
if %errorlevel% neq 0 goto ExitLabelFailure

echo.
echo Step 3/3: Building the project...
echo ==================================
:: Build both configurations
echo Building Debug configuration...
cmake --build . --config Debug
if %errorlevel% neq 0 goto ExitLabelFailure

echo Building Release configuration...
cmake --build . --config Release
if %errorlevel% neq 0 goto ExitLabelFailure

goto ExitLabelSuccess

:ExitLabelSuccess
cd ..
echo.
echo ================================
echo Build completed successfully!
echo ================================
echo Debug executable: build\Debug\catyas.exe
echo Release executable: build\Release\catyas.exe
echo.

:: Check if executables exist
if exist "build\Debug\catyas.exe" (
    echo Debug build artifact found: build\Debug\catyas.exe
)
if exist "build\Release\catyas.exe" (
    echo Release build artifact found: build\Release\catyas.exe
)

echo Success Compilation
goto EndLabel

:ExitLabelFailure
cd ..
echo.
echo ================================
echo Build failed!
echo ================================
echo Error Compilation
goto EndLabel

:EndLabel
pause