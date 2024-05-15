#include "include/metrics.h"
#include "include/logging.h"

clock_t start_time; // Global variable to store start time
int total_loops = 0; // Global variable to store total loops in 10 seconds

void metrics_start() {
    start_time = clock(); // Initialize start time
    total_loops = 0; // Initialize total loops
}

void metrics_tick() {
    total_loops++; // Increment total loops
}

void metrics_report() {
    double duration = (double)(clock() - start_time) / CLOCKS_PER_SEC; // Calculate duration since start
    time_t current_time = time(NULL);

    if (duration >= INTERVAL_SECONDS && current_time - start_time >= INTERVAL_SECONDS) {
        logMessage(LOG_INFO, "Loops per second: %.2f\n", (double)total_loops / duration); // Log loops per second
        start_time = clock(); // Reset start time
        total_loops = 0; // Reset total loops
    }
}