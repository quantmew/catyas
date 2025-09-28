# Test configuration
find_package(Qt6 REQUIRED COMPONENTS Test)

# Enable Qt test framework
set(CMAKE_AUTOMOC ON)

# Test sources
set(TEST_SOURCES
    test_main.cpp
    test_DatabaseConnection.cpp
)

# Create test executable
add_executable(catyas_tests ${TEST_SOURCES})

# Link test libraries
target_link_libraries(catyas_tests
    Qt6::Test
    Qt6::Core
    Qt6::Sql
)

# Include directories for tests
target_include_directories(catyas_tests PRIVATE
    ${CMAKE_SOURCE_DIR}/include
)

# Add test
add_test(NAME catyas_tests COMMAND catyas_tests)