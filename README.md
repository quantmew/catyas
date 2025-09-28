# catyas

A database connection and management tool similar to Navicat, built with Qt6 and C++.

## Features

- Multi-database support (MySQL, PostgreSQL, SQLite, Oracle, SQL Server)
- Modern Qt6-based user interface
- Connection management
- Query editor with syntax highlighting
- Result table viewing
- Cross-platform support

## Requirements

- C++20 compatible compiler
- CMake 3.20 or higher
- Conan 2.0 package manager
- Qt6 (automatically installed via Conan)

## Dependencies

All C++ dependencies are managed through Conan2:
- Qt6 (Core, Widgets, Sql, Network)
- Boost
- nlohmann_json

## Building

1. Install Conan 2.0:
```bash
pip install conan
```

2. Create build directory:
```bash
mkdir build && cd build
```

3. Install dependencies and build:
```bash
conan install .. --build=missing
cmake ..
cmake --build .
```

## Project Structure

```
├── src/                 # Source files
│   ├── ui/             # User interface components
│   ├── database/       # Database connection and management
│   ├── core/           # Core application logic
│   └── utils/          # Utility functions
├── include/            # Header files
│   ├── ui/
│   ├── database/
│   ├── core/
│   └── utils/
├── resources/          # Resources (icons, stylesheets, etc.)
├── tests/              # Unit tests
├── docs/               # Documentation
├── CMakeLists.txt      # CMake configuration
├── conanfile.txt       # Conan dependencies
└── README.md           # This file
```

## License

[Add your license here]