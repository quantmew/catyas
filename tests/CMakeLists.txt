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
add_executable(db_navigator_tests ${TEST_SOURCES})

# Link test libraries
target_link_libraries(db_navigator_tests
    Qt6::Test
    Qt6::Core
    Qt6::Sql
)

# Include directories for tests
target_include_directories(db_navigator_tests PRIVATE
    ${CMAKE_SOURCE_DIR}/include
)

# Add test
add_test(NAME db_navigator_tests COMMAND db_navigator_tests)