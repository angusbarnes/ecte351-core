#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>
#include <stdbool.h>

#define NUM_THREADS 4
#define TASK_QUEUE_SIZE 10

// We need thread safe db access for writes
// We need thread safe queue structures for data batching
// Thread safe queue for task allocation


// THIS IS CURRENTLY A WHOLE ASS MESS.
// WE NEED TO COMBINE THE TWO GENERATED ANSWERS SUCH THAT WE RESPECT SERVER
// SHUTDOWN AND AWAIT_JOIN(thread_pool). WE SHOULD USE A CENTRAL TASK QUEUE FOR EACH POOL
// THE Queue And Dequeue functions should handle the mutex's for each pool
// the threads run an endless loop until shutdown is signalled.
// use the mutexed dequeue function to get a task or NULL,
// if not null, complete the task. The tasks themselves should have a void pointer
// to a function which takes a void pointer and casts it as an argument
// the task object should also have a void pointer to the required structure which is this arguement.
// cond_wait might be used to hold dequeue and the mutex until there is a function available? Could reduce
// idle CPU???


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
    tp_thread_status* status;
} TaskQueue;

// Use this to create a new task so we dont lose it when the scope ends
Task* create_task(void (*task_fp)(void*), void* data) {
    Task* task = (Task*)malloc(sizeof(Task));
    task->execute = task_fp;
    task->data = data;
    return task;
}

// Call this once a task is done
void release_task(Task* task) {
    free(task->data);
    free(task);
}

typedef enum { THREAD_ALIVE, THREAD_SHUTDOWN } tp_thread_status;

typedef struct {
    pthread_t* threads;
    int size;
    tp_thread_status status;
} ThreadPool; 

void initialize_thread_pool(ThreadPool* pool, int thread_count, void (*thread_routine)(void*), void* args) {
    pool->size = thread_count;
    pool->threads = (pthread_t*)malloc(sizeof(pthread_t) * thread_count);
    pool->status = THREAD_ALIVE;

    for (int i = 0; i < thread_count; i++) {
        pthread_create(pool->threads[i], NULL, thread_routine, args);
    }
}

#define AWAIT_JOIN_THREAD_POOL(pool) {          \
    for(int i = 0; i < pool.size; i++) {        \
        pthread_join(pool.threads[i], NULL);    \
    }                                           \
} 

void release_thread_pool(ThreadPool* pool) {
    free(pool->threads);
}

// Initialize the task queue
void init_task_queue(TaskQueue* queue, int capacity, tp_thread_status* status) {
    queue->tasks = (Task*)malloc(sizeof(Task) * capacity);
    queue->front = 0;
    queue->rear = -1;
    queue->capacity = capacity;
    queue->size = 0;
    queue->status = status;
    pthread_mutex_init(&queue->mutex, NULL);
    pthread_cond_init(&queue->cond, NULL);
}

// Enqueue a task into the task queue
// TODO: THIS DOES NOT HANDLE THE CASE WHERE WE DO NOT
// SUCCESSFULLY INSERT INTO THE QUEUE.
void enqueueTask(TaskQueue* queue, Task* task) {
    pthread_mutex_lock(&queue->mutex);
    if (queue->size < queue->capacity) {
        queue->rear = (queue->rear + 1) % queue->capacity;
        queue->tasks[queue->rear] = task;
        queue->size++;
        pthread_cond_signal(&queue->cond); // Signal that a task is available
    }
    pthread_mutex_unlock(&queue->mutex);
}

// Dequeue a task from the task queue
// This will perform a conditional wait on the queue.
// ie. it will block your thread until a task becomes available to prevent 100% CPU
Task* dequeueTask(TaskQueue* queue) {
    pthread_mutex_lock(&queue->mutex);
    while (queue->size == 0 && *queue->status != THREAD_SHUTDOWN) {
        pthread_cond_wait(&queue->cond, &queue->mutex); // Wait for a task to be available
    }

    if (queue->size == 0 && queue->status == THREAD_SHUTDOWN) {
        return NULL;
    }

    Task* task = queue->tasks[queue->front];
    queue->front = (queue->front + 1) % queue->capacity;
    queue->size--;
    pthread_mutex_unlock(&queue->mutex);
    return task;
}

void release_task_queue(TaskQueue* queue) {
    pthread_cond_destroy(&queue->cond);
    pthread_mutex_destroy(&queue->mutex);

    free(&queue->tasks);
}

void* startWorkerThread(void* arg) {
    TaskQueue* queue = (TaskQueue*)arg;

    while(1) {
        Task* task = dequeueTask(queue); // This will hold

        // This case should only occur once the pool is shutdown and empty
        if (task == NULL) {
            break;
        }

        task->execute(task->data); // Call the task code with the task data
        release_task(task); // Destroy task and data now we have finished it
    }
}

// Sample task implementation
void sampleTask(void* data) {
    int* number = (int*)data;
    printf("Executing task with number: %d\n", *number);
}

