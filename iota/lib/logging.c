#include "include/logging.h"

// Global log level
LogLevel g_logLevel = LOG_INFO;

// Function to set the log level
void setLogLevel(LogLevel level) {
    g_logLevel = level;
}

// Function to log messages
void logMessage(LogLevel level, const char *format, ...) {
    if (level < g_logLevel) return;

    va_list args;
    va_start(args, format);

    // Color codes for different log levels
    const char *colorCode = "";
    switch (level) {
        case LOG_DEBUG:
            colorCode = "\x1B[36mDEBUG: ";  // Cyan
            break;
        case LOG_INFO:
            colorCode = "\x1B[32mINFO: ";  // Green
            break;
        case LOG_WARNING:
            colorCode = "\x1B[33mWARN: ";  // Yellow
            break;
        case LOG_ERROR:
            colorCode = "\x1B[31mERROR: ";  // Red
            break;
    }

    // Print the log message with color
    printf("%s", colorCode);
    vprintf(format, args);
    printf("\x1B[0m\n");  // Reset color

    va_end(args);
}