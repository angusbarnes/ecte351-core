#include <stdio.h>
#include <stdarg.h>

// Define log levels
typedef enum {
    LOG_DEBUG,
    LOG_INFO,
    LOG_WARNING,
    LOG_ERROR
} LogLevel;

void setLogLevel(LogLevel level);
void logMessage(LogLevel level, const char *format, ...);
