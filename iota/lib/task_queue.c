#include "include/task_queue.h"
#include "include/logging.h"

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

// Initialize the task queue
void init_task_queue(TaskQueue* queue, int capacity) {
    queue->tasks = (Task**)malloc(sizeof(Task*) * capacity);
    queue->front = 0;
    queue->rear = -1;
    queue->capacity = capacity;
    queue->size = 0;
    queue->status = THREAD_ALIVE;
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
    while (queue->size == 0 && queue->status != THREAD_SHUTDOWN) {
        logMessageThreadSafe(LOG_DEBUG, "Checking for new queue data");
        pthread_cond_wait(&queue->cond, &queue->mutex); // Wait for a task to be available
    }

    if (queue->size == 0 && queue->status == THREAD_SHUTDOWN) {
        logMessageThreadSafe(LOG_DEBUG, "Task queue empty, ready to shutdown thread");
        pthread_mutex_unlock(&queue->mutex);
        return NULL;
    }

    Task* task = queue->tasks[queue->front];
    queue->front = (queue->front + 1) % queue->capacity;
    queue->size--;
    pthread_mutex_unlock(&queue->mutex);
    return task;
}

// Set the shutdown flag and signal all threads to recheck their condition
void shutdown_task_queue(TaskQueue* queue) {
    queue->status = THREAD_SHUTDOWN;
    pthread_cond_broadcast(&queue->cond);
}

void release_task_queue(TaskQueue* queue) {
    pthread_cond_destroy(&queue->cond);
    pthread_mutex_destroy(&queue->mutex);

    free(queue->tasks);
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

    pthread_exit(NULL);
}

void _tq_sample_task_func(void* args) {
    printf("%d: Starting sample task\n", pthread_self());
    sleep(1);
    printf("%d: Sample task ended\n", pthread_self());
}

Task* get_sample_task() {
    Task* task = (Task*)malloc(sizeof(Task));

    task->execute = &_tq_sample_task_func;
    task->data = NULL;

    return task;
}