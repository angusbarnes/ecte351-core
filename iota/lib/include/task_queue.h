#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include "pthread.h"

typedef enum { THREAD_ALIVE, THREAD_SHUTDOWN } tp_queue_status;

// Abstract task interface
typedef struct {
    void (*execute)(void*); // Function pointer for task execution
    void* data; // Task-specific data or parameters
} Task;

// Task queue implementation
typedef struct {
    Task* (*tasks);
    int front;
    int rear;
    int capacity;
    int size;
    pthread_mutex_t mutex;
    pthread_cond_t cond;
    tp_queue_status status;
} TaskQueue;

Task* create_task(void (*task_fp)(void*), void* data);
void release_task(Task* task);
void init_task_queue(TaskQueue* queue, int capacity);
void enqueueTask(TaskQueue* queue, Task* task);
Task* dequeueTask(TaskQueue* queue);
void release_task_queue(TaskQueue* queue);
void* startWorkerThread(void* arg);
void shutdown_task_queue(TaskQueue* queue);

void _tq_sample_task_func(void* args);
Task* get_sample_task();