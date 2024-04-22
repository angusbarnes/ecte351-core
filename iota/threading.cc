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
typedef struct {
    int task_id;
    // Other task parameters if needed
} Task;

Task task_queue[TASK_QUEUE_SIZE];
int queue_front = 0, queue_rear = -1, queue_count = 0;
bool shutdown_requested = false; // Flag to indicate shutdown

pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t cond = PTHREAD_COND_INITIALIZER;

void enqueue(Task task) {
    pthread_mutex_lock(&mutex);
    if (queue_count < TASK_QUEUE_SIZE) {
        queue_rear = (queue_rear + 1) % TASK_QUEUE_SIZE;
        task_queue[queue_rear] = task;
        queue_count++;
        pthread_cond_signal(&cond);
    }
    pthread_mutex_unlock(&mutex);
}

Task dequeue() {
    Task task;
    pthread_mutex_lock(&mutex);
    if (queue_count > 0) {
        task = task_queue[queue_front];
        queue_front = (queue_front + 1) % TASK_QUEUE_SIZE;
        queue_count--;
    }
    pthread_mutex_unlock(&mutex);
    return task;
}

void* threadFunction(void* arg) {
    while (!shutdown_requested) {
        Task task = dequeue();
        if (task.task_id != -1) {
            printf("Thread %ld executing task %d\n", (long)pthread_self(), task.task_id);
            // Execute the task (e.g., perform some computation or I/O operation)
            sleep(2); // Simulate task execution
        }
    }
    return NULL;
}


// Abstract task interface
typedef struct {
    void (*execute)(void*); // Function pointer for task execution
    void* data; // Task-specific data or parameters
} Task;

// Task queue implementation
typedef struct {
    Task* tasks;
    int front;
    int rear;
    int capacity;
    int size;
    pthread_mutex_t mutex;
    pthread_cond_t cond;
} TaskQueue;

// Initialize the task queue
void initializeTaskQueue(TaskQueue* queue, int capacity) {
    queue->tasks = (Task*)malloc(sizeof(Task) * capacity);
    queue->front = 0;
    queue->rear = -1;
    queue->capacity = capacity;
    queue->size = 0;
    pthread_mutex_init(&queue->mutex, NULL);
    pthread_cond_init(&queue->cond, NULL);
}

// Enqueue a task into the task queue
void enqueueTask(TaskQueue* queue, Task task) {
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
Task dequeueTask(TaskQueue* queue) {
    pthread_mutex_lock(&queue->mutex);
    while (queue->size == 0) {
        pthread_cond_wait(&queue->cond, &queue->mutex); // Wait for a task to be available
    }
    Task task = queue->tasks[queue->front];
    queue->front = (queue->front + 1) % queue->capacity;
    queue->size--;
    pthread_mutex_unlock(&queue->mutex);
    return task;
}

// Sample task implementation
void sampleTask(void* data) {
    int* number = (int*)data;
    printf("Executing task with number: %d\n", *number);
}

int main() {
    TaskQueue taskQueue;
    initializeTaskQueue(&taskQueue, 10);

    // Example usage: Enqueue tasks
    int task1_data = 10;
    Task task1 = { .execute = sampleTask, .data = &task1_data };
    enqueueTask(&taskQueue, task1);

    int task2_data = 20;
    Task task2 = { .execute = sampleTask, .data = &task2_data };
    enqueueTask(&taskQueue, task2);

    // Example usage: Dequeue and execute tasks
    Task executedTask1 = dequeueTask(&taskQueue);
    executedTask1.execute(executedTask1.data);

    Task executedTask2 = dequeueTask(&taskQueue);
    executedTask2.execute(executedTask2.data);

    return 0;
}