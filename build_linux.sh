#!/bin/bash

set -e  # Exit on any error

echo "================================"
echo "Building catyas for Linux"
echo "================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if conan is installed
if ! command_exists conan; then
    echo "Error: Conan is not installed or not in PATH"
    echo "Please install Conan 2.0: pip install conan"
    exit 1
fi

# Check if cmake is installed
if ! command_exists cmake; then
    echo "Error: CMake is not installed or not in PATH"
    echo "Please install CMake 3.16 or higher"
    echo "Ubuntu/Debian: sudo apt install cmake"
    echo "CentOS/RHEL: sudo yum install cmake"
    echo "Arch: sudo pacman -S cmake"
    exit 1
fi

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Create build directory if it doesn't exist
if [ ! -d "build" ]; then
    echo "Creating build directory..."
    mkdir build
fi

cd build

echo ""
echo "Step 1/3: Installing dependencies with Conan..."
echo "================================================"
conan install .. --build=missing

echo ""
echo "Step 2/3: Configuring with CMake..."
echo "===================================="
cmake ..

echo ""
echo "Step 3/3: Building the project..."
echo "=================================="
# Use all available CPU cores for faster build
NPROC=$(nproc 2>/dev/null || echo 4)
cmake --build . --config Release -j $NPROC

echo ""
echo "================================"
echo "Build completed successfully!"
echo "================================"

# Check if executable exists and show its location
if [ -f "catyas" ]; then
    echo "Executable location: build/catyas"
    echo "Build artifact found: catyas"
elif [ -f "Release/catyas" ]; then
    echo "Executable location: build/Release/catyas"
    echo "Build artifact found: Release/catyas"
else
    echo "Warning: Could not find the executable file"
    echo "Looking for possible executables:"
    find . -name "catyas*" -type f -executable 2>/dev/null || true
fi

echo ""
echo "To run the application:"
if [ -f "catyas" ]; then
    echo "  ./build/catyas"
elif [ -f "Release/catyas" ]; then
    echo "  ./build/Release/catyas"
else
    echo "  Check the build directory for the executable"
fi

echo ""
echo "Build script completed."