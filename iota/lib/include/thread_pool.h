#include <pthread.h>
#include <stdlib.h>
#include <unistd.h>

typedef struct {
    pthread_t* threads;
    int size;
} ThreadPool; 

void initialize_thread_pool(ThreadPool* pool, int thread_count, void* (*thread_routine)(void*), void* args);

#define AWAIT_JOIN_THREAD_POOL(pool) {          \
    for(int i = 0; i < pool.size; i++) {        \
        pthread_join(pool.threads[i], NULL);    \
    }                                           \
} 

void release_thread_pool(ThreadPool* pool);