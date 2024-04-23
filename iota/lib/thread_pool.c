#include <stdio.h>
#include <stdlib.h>
#include "include/thread_pool.h"


#define NUM_THREADS 4
#define TASK_QUEUE_SIZE 10

// We need thread safe db access for writes
// We need thread safe queue structures for data batching
// Thread safe queue for task allocation

void initialize_thread_pool(ThreadPool* pool, int thread_count, void* (*thread_routine)(void*), void* args) {
    pool->size = thread_count;
    pool->threads = (pthread_t*)malloc(sizeof(pthread_t) * thread_count);

    for (int i = 0; i < thread_count; i++) {
        pthread_create(&(pool->threads[i]), NULL, thread_routine, args);
    }
}

void release_thread_pool(ThreadPool* pool) {
    free(pool->threads);
}
