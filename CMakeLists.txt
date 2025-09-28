cmake_minimum_required(VERSION 3.16)

project(catyas VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Conan 2.0 integration - dependencies already installed via conan install

# Find Qt6 components (with Qt5 fallback)
find_package(Qt6 COMPONENTS Core Widgets Sql Network)
if(NOT Qt6_FOUND)
    find_package(Qt5 REQUIRED COMPONENTS Core Widgets Sql Network)
    set(QT_VERSION_MAJOR 5)
else()
    set(QT_VERSION_MAJOR 6)
endif()

# Find other dependencies (optional for now)
find_package(Boost)
# find_package(nlohmann_json REQUIRED)

# Set Qt specific settings
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

# Include directories
include_directories(
    ${CMAKE_SOURCE_DIR}/include
    ${CMAKE_SOURCE_DIR}/include/ui
    ${CMAKE_SOURCE_DIR}/include/database
    ${CMAKE_SOURCE_DIR}/include/core
    ${CMAKE_SOURCE_DIR}/include/utils
)

# Source files
file(GLOB_RECURSE SOURCES
    "src/*.cpp"
    "src/*.h"
)

file(GLOB_RECURSE HEADERS
    "include/*.h"
    "include/*.hpp"
)

# UI files
file(GLOB_RECURSE UI_FILES
    "src/ui/*.ui"
)

# Resource files
file(GLOB_RECURSE QRC_FILES
    "resources/*.qrc"
)

# Create executable
add_executable(${PROJECT_NAME} ${SOURCES} ${HEADERS} ${UI_FILES} ${QRC_FILES})

# Link libraries
target_link_libraries(${PROJECT_NAME}
    Qt${QT_VERSION_MAJOR}::Core
    Qt${QT_VERSION_MAJOR}::Widgets
    Qt${QT_VERSION_MAJOR}::Sql
    Qt${QT_VERSION_MAJOR}::Network
)

# Link optional libraries if found
if(Boost_FOUND)
    target_link_libraries(${PROJECT_NAME} Boost::boost)
endif()

# Set target properties
set_target_properties(${PROJECT_NAME} PROPERTIES
    WIN32_EXECUTABLE TRUE
    MACOSX_BUNDLE TRUE
)

# Find Qt deployment tool
if(WIN32)
    if(QT_VERSION_MAJOR EQUAL 6)
        find_program(DEPLOYQT_EXECUTABLE_DEBUG NAMES windeployqt
            HINTS ${Qt6_DIR}/../../../bin ${Qt6Core_DIR}/../../../bin
            PATHS ${CMAKE_PREFIX_PATH}/bin
            NO_CMAKE_PATH)
        find_program(DEPLOYQT_EXECUTABLE_RELEASE NAMES windeployqt
            HINTS ${Qt6_DIR}/../../../bin ${Qt6Core_DIR}/../../../bin
            PATHS ${CMAKE_PREFIX_PATH}/bin
            NO_CMAKE_PATH)
    else()
        find_program(DEPLOYQT_EXECUTABLE_DEBUG NAMES windeployqt
            HINTS ${Qt5_DIR}/../../../bin ${Qt5Core_DIR}/../../../bin
            PATHS ${CMAKE_PREFIX_PATH}/bin
            NO_CMAKE_PATH)
        find_program(DEPLOYQT_EXECUTABLE_RELEASE NAMES windeployqt
            HINTS ${Qt5_DIR}/../../../bin ${Qt5Core_DIR}/../../../bin
            PATHS ${CMAKE_PREFIX_PATH}/bin
            NO_CMAKE_PATH)
    endif()

    # Try to find windeployqt in Conan package paths as well
    if(NOT DEPLOYQT_EXECUTABLE_RELEASE)
        file(GLOB_RECURSE WINDEPLOYQT_PATHS "${CMAKE_BINARY_DIR}/../**/windeployqt.exe")
        if(WINDEPLOYQT_PATHS)
            list(GET WINDEPLOYQT_PATHS 0 DEPLOYQT_EXECUTABLE_RELEASE)
            set(DEPLOYQT_EXECUTABLE_DEBUG ${DEPLOYQT_EXECUTABLE_RELEASE})
        endif()
    endif()
elseif(APPLE)
    if(QT_VERSION_MAJOR EQUAL 6)
        find_program(DEPLOYQT_EXECUTABLE_DEBUG NAMES macdeployqt
            HINTS ${Qt6_DIR}/../../../bin ${Qt6Core_DIR}/../../../bin
            NO_CMAKE_PATH)
        find_program(DEPLOYQT_EXECUTABLE_RELEASE NAMES macdeployqt
            HINTS ${Qt6_DIR}/../../../bin ${Qt6Core_DIR}/../../../bin
            NO_CMAKE_PATH)
    else()
        find_program(DEPLOYQT_EXECUTABLE_DEBUG NAMES macdeployqt
            HINTS ${Qt5_DIR}/../../../bin ${Qt5Core_DIR}/../../../bin
            NO_CMAKE_PATH)
        find_program(DEPLOYQT_EXECUTABLE_RELEASE NAMES macdeployqt
            HINTS ${Qt5_DIR}/../../../bin ${Qt5Core_DIR}/../../../bin
            NO_CMAKE_PATH)
    endif()
endif()

# Add post-build step to deploy Qt dependencies
if(WIN32 AND (DEPLOYQT_EXECUTABLE_DEBUG OR DEPLOYQT_EXECUTABLE_RELEASE))
    add_custom_command(TARGET ${PROJECT_NAME}
        POST_BUILD
        COMMAND
        $<$<CONFIG:Debug>:${DEPLOYQT_EXECUTABLE_DEBUG}>$<$<CONFIG:Release>:${DEPLOYQT_EXECUTABLE_RELEASE}>
        $<TARGET_FILE:${PROJECT_NAME}>
        $<$<CONFIG:Debug>:--debug>$<$<CONFIG:Release>:--release>
        --no-translations
        COMMENT "Deploying Qt dependencies"
    )
elseif(APPLE AND (DEPLOYQT_EXECUTABLE_DEBUG OR DEPLOYQT_EXECUTABLE_RELEASE))
    add_custom_command(TARGET ${PROJECT_NAME}
        POST_BUILD
        COMMAND
        $<$<CONFIG:Debug>:${DEPLOYQT_EXECUTABLE_DEBUG}>$<$<CONFIG:Release>:${DEPLOYQT_EXECUTABLE_RELEASE}>
        $<TARGET_FILE:${PROJECT_NAME}>
        COMMENT "Deploying Qt dependencies"
    )
endif()

# Install rules
install(TARGETS ${PROJECT_NAME}
    BUNDLE DESTINATION .
    RUNTIME DESTINATION bin
)

# Enable testing (commented out temporarily due to missing test files)
# enable_testing()
# add_subdirectory(tests)