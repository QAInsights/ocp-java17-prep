OCP.registerChapter({
  id: 13,
  slug: 'concurrency',
  title: 'Concurrency',
  objectiveIds: ['8a', '8b', '8c'],
  intro: `Objectives **8a** (threads, Runnable, Callable, thread lifecycle, ExecutorService, scheduling), **8b** (thread-safety, atomic classes, locking mechanisms, concurrent collections, synchronization), and **8c** (processing collections concurrently and parallel streams). Concurrency questions on 1Z0-829 test the subtleties of thread coordination: Runnable vs Callable, submit() vs execute(), Future methods and exceptions, synchronized methods/blocks, ReentrantLock tryLock(), CyclicBarrier mechanics, ConcurrentHashMap null-hostility, and CopyOnWriteArrayList iterator snapshots.`,

  notes: [
    {
      id: 'threads-and-executors',
      title: 'Threads, Runnable, Callable, and ExecutorService',
      md: `## Runnable vs Callable

| Feature | \`Runnable\` | \`Callable<V>\` |
|---|---|---|
| **Package** | \`java.lang\` | \`java.util.concurrent\` |
| **Method** | \`void run()\` | \`V call() throws Exception\` |
| **Return value** | None (\`void\`) | Generic value \`V\` |
| **Checked exceptions** | Cannot throw checked exceptions | Can throw any checked \`Exception\` |

* **\`t.start()\` vs \`t.run()\`**:
  * \`t.start()\`: creates a new thread of execution in the JVM and runs the task asynchronously.
  * \`t.run()\`: merely calls the \`run()\` method synchronously on the **current thread**; no new thread is started!

## The ExecutorService framework
Instead of creating raw \`Thread\` instances, Java manages thread pools through \`ExecutorService\`.

### Creating executors (\`java.util.concurrent.Executors\`)
* \`Executors.newSingleThreadExecutor()\`
* \`Executors.newFixedThreadPool(int nThreads)\`
* \`Executors.newCachedThreadPool()\`
* \`Executors.newScheduledThreadPool(int corePoolSize)\`

### Submitting tasks
* **\`execute(Runnable)\`**: Fire-and-forget; returns \`void\`.
* **\`submit(Callable<T>)\`**: Returns \`Future<T>\`.
* **\`submit(Runnable)\`**: Returns \`Future<?>\` (calling \`future.get()\` returns \`null\` when done).
* **\`invokeAll(Collection<Callable<T>>)\`**: Synchronously executes all tasks; returns \`List<Future<T>>\` when all finish.
* **\`invokeAny(Collection<Callable<T>>)\`**: Synchronously executes tasks and returns the result of **one task that completed successfully**, cancelling all other tasks.

### Future<V> methods
* **\`get()\`**: Blocks until task completes. Throws:
  * \`InterruptedException\`: if current thread was interrupted while waiting.
  * \`ExecutionException\`: wraps any exception thrown by the \`Callable\`.
* **\`get(timeout, unit)\`**: Blocks at most the specified time; throws \`TimeoutException\` if time expires.
* **\`isDone()\`** / **\`isCancelled()\`** / **\`cancel(mayInterruptIfRunning)\`**.

### Shutting down ExecutorService
* **\`shutdown()\`**: Initiates orderly shutdown. Rejects new tasks, but allows previously submitted tasks to complete.
* **\`shutdownNow()\`**: Attempts to halt running tasks (via interruption) and returns a \`List<Runnable>\` of tasks waiting to execute.
* **\`isShutdown()\`**: \`true\` if \`shutdown\` or \`shutdownNow\` was called.
* **\`isTerminated()\`**: \`true\` ONLY after all tasks have finished execution following shutdown.`
    },
    {
      id: 'synchronization-and-locks',
      title: 'Thread-safety, atomic classes, and explicit locks',
      md: `## Concurrency hazards
1. **Race condition**: two threads access shared mutable data concurrently, producing unpredictable results depending on execution timing.
2. **Deadlock**: thread A holds Lock 1 and waits for Lock 2; thread B holds Lock 2 and waits for Lock 1. Both are stuck forever.
3. **Livelock**: threads continuously change state in response to each other without making real progress.
4. **Starvation**: a thread is perpetually denied CPU time because higher-priority threads dominate.

## Atomic classes (\`java.util.concurrent.atomic\`)
* \`AtomicInteger\`, \`AtomicLong\`, \`AtomicBoolean\`, \`AtomicReference\`.
* Provide lock-free, thread-safe atomic operations executed at CPU instruction level.
* Key methods:
  * \`get()\` / \`set()\`
  * \`incrementAndGet()\` (++x) / \`getAndIncrement()\` (x++)
  * \`addAndGet(int delta)\` / \`getAndAdd(int delta)\`
  * \`compareAndSet(expected, update)\`

## \`volatile\` vs \`synchronized\`
* **\`volatile\`**: ensures visibility across CPU caches; reads/writes go directly to main memory.
  * *Important*: \`volatile\` does **NOT** make compound operations atomic! \`volatile int x; x++;\` is NOT thread-safe because \`x++\` is 3 separate operations (read, modify, write).
* **\`synchronized\`**: guarantees both mutual exclusion (atomicity) and visibility.
  * \`public synchronized void update() { ... }\`: locks on \`this\` instance.
  * \`public static synchronized void update() { ... }\`: locks on \`ClassName.class\`.
  * Synchronized block: \`synchronized(lockObject) { ... }\`.

## Explicit Locks (\`java.util.concurrent.locks.Lock\`)
\`\`\`java
Lock lock = new ReentrantLock();
lock.lock();
try {
  // critical section
} finally {
  lock.unlock(); // always in finally!
}
\`\`\`

### \`tryLock()\`
* \`lock.tryLock()\`: attempts to acquire the lock immediately. If available, acquires it and returns \`true\`; if not, returns \`false\` without blocking!
* \`lock.tryLock(timeout, unit)\`: waits up to timeout for the lock.`
    },
    {
      id: 'concurrent-collections',
      title: 'Concurrent collections and CyclicBarrier',
      md: `## Concurrent collections

| Collection | Key Characteristics |
|---|---|
| **\`ConcurrentHashMap\`** | Thread-safe, segment/bucket-level locking; **disallows \`null\` keys and values** (throws NPE)! |
| **\`CopyOnWriteArrayList\`** | Any mutation (add/set/remove) makes a complete copy of underlying array; iterators use snapshot and **never throw \`ConcurrentModificationException\`**. |
| **\`CopyOnWriteArraySet\`** | Set backed by CopyOnWriteArrayList; thread-safe, no duplicates. |
| **\`ConcurrentSkipListMap\`** | Concurrent sorted map (thread-safe equivalent to \`TreeMap\`); keys in sorted order. |
| **\`ConcurrentSkipListSet\`** | Concurrent sorted set (thread-safe equivalent to \`TreeSet\`). |
| **\`BlockingQueue\`** | Supports blocking retrieval (\`take()\`) and insertion (\`put()\`). |

### BlockingQueue methods
* **Add**: \`offer(e, timeout, unit)\` (blocks if full until timeout); \`put(e)\` (blocks indefinitely if full).
* **Remove**: \`poll(timeout, unit)\` (blocks if empty until timeout); \`take()\` (blocks indefinitely if empty).

## CyclicBarrier
Used to synchronize a set of threads, making them all wait until every thread reaches a common barrier point.

\`\`\`java
CyclicBarrier barrier = new CyclicBarrier(3, () -> System.out.println("Wave complete!"));
\`\`\`
* Each thread calls \`barrier.await()\`, which blocks until 3 threads have called \`await()\`.
* Once all 3 arrive, the optional barrier action executes, and all waiting threads are released.
* **Reusable**: the barrier resets its counter automatically for subsequent waves.`
    }
  ],

  gotchas: [
    { title: 'ConcurrentHashMap forbids null', md: 'Unlike standard `HashMap`, `ConcurrentHashMap` throws `NullPointerException` if you attempt to store a `null` key or `null` value.' },
    { title: 'CopyOnWriteArrayList iterators are snapshots', md: 'Iterators on `CopyOnWriteArrayList` do not reflect modifications made after iterator creation and their `remove()` method throws `UnsupportedOperationException`.' },
    { title: 'Callable vs Runnable in ExecutorService', md: '`executor.submit(Callable)` returns `Future<T>`. `executor.submit(Runnable)` returns `Future<?>` whose `get()` returns `null` on completion.' },
    { title: 'Future.get() blocks the thread', md: 'Calling `future.get()` blocks the calling thread until the task finishes. Calling `get()` immediately inside a loop destroys concurrency.' },
    { title: 't.run() vs t.start()', md: '`t.run()` executes the task on the current calling thread synchronously. Only `t.start()` spawns a new thread.' },
    { title: 'volatile is not atomic for compound operations', md: '`volatile int x; x++;` is not thread-safe. Use `AtomicInteger` or `synchronized` for atomic increments.' },
    { title: 'Lock unlock in finally', md: '`lock.unlock()` must always be in a `finally` block to prevent deadlocks if an exception is thrown in the critical section.' },
    { title: 'CyclicBarrier number of parties mismatch', md: 'If a `CyclicBarrier` expects 4 parties and only 3 threads call `barrier.await()`, all 3 threads will hang indefinitely.' },
    { title: 'shutdown() vs shutdownNow()', md: '`shutdown()` allows running tasks to complete. `shutdownNow()` attempts to stop running tasks via interruption and returns waiting tasks.' },
    { title: 'ExecutorService must be shut down', md: 'If an `ExecutorService` is not explicitly shut down, the JVM may never terminate because non-daemon worker threads remain alive.' }
  ],

  traps: [
    {
      code: `import java.util.concurrent.*;
public class FutureNull {
  public static void main(String[] args) throws Exception {
    ExecutorService service = Executors.newSingleThreadExecutor();
    Future<?> f = service.submit(() -> {
      System.out.print("Run ");
    });
    service.shutdown();
    System.out.print(f.get());
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`Run null`**. When a `Runnable` is submitted, `Future.get()` returns `null` upon successful completion.',
      verify: {
        files: {
          'FutureNull.java': `import java.util.concurrent.*;
public class FutureNull {
  public static void main(String[] args) throws Exception {
    ExecutorService service = Executors.newSingleThreadExecutor();
    Future<?> f = service.submit(() -> {
      System.out.print("Run ");
    });
    service.shutdown();
    System.out.print(f.get());
  }
}`
        },
        expect: { output: 'Run null' }
      }
    },
    {
      code: `import java.util.concurrent.atomic.AtomicInteger;
public class AtomicTrap {
  public static void main(String[] args) {
    AtomicInteger num = new AtomicInteger(5);
    int a = num.getAndIncrement();
    int b = num.incrementAndGet();
    System.out.print(a + " " + b + " " + num.get());
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`5 7 7`**. `getAndIncrement()` returns the previous value 5 (value becomes 6). `incrementAndGet()` increments to 7 and returns 7. The current value in `num` is 7.',
      verify: {
        files: {
          'AtomicTrap.java': `import java.util.concurrent.atomic.AtomicInteger;
public class AtomicTrap {
  public static void main(String[] args) {
    AtomicInteger num = new AtomicInteger(5);
    int a = num.getAndIncrement();
    int b = num.incrementAndGet();
    System.out.print(a + " " + b + " " + num.get());
  }
}`
        },
        expect: { output: '5 7 7' }
      }
    },
    {
      code: `import java.util.concurrent.ConcurrentHashMap;
public class NullMapTrap {
  public static void main(String[] args) {
    ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();
    map.put("key", null);
    System.out.println(map.size());
  }
}`,
      prompt: 'What happens when running this code?',
      answer: '**Throws NullPointerException.** Unlike `HashMap`, `ConcurrentHashMap` does not allow `null` keys or `null` values.',
      verify: {
        files: {
          'NullMapTrap.java': `import java.util.concurrent.ConcurrentHashMap;
public class NullMapTrap {
  public static void main(String[] args) {
    ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();
    map.put("key", null);
    System.out.println(map.size());
  }
}`
        },
        expect: 'runtime-exception'
      }
    },
    {
      code: `import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
public class CopyOnWriteTrap {
  public static void main(String[] args) {
    List<Integer> list = new CopyOnWriteArrayList<>(List.of(1, 2, 3));
    for (Integer n : list) {
      list.add(9);
    }
    System.out.print(list.size());
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`6`**. The enhanced for-loop iterator iterates over a snapshot of the original 3 elements. Each loop iteration adds an element to `list` without causing `ConcurrentModificationException`. At the end, 3 original + 3 added = 6.',
      verify: {
        files: {
          'CopyOnWriteTrap.java': `import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
public class CopyOnWriteTrap {
  public static void main(String[] args) {
    List<Integer> list = new CopyOnWriteArrayList<>(List.of(1, 2, 3));
    for (Integer n : list) {
      list.add(9);
    }
    System.out.print(list.size());
  }
}`
        },
        expect: { output: '6' }
      }
    },
    {
      code: `public class ThreadRunVsStart {
  public static void main(String[] args) {
    Thread t = new Thread(() -> System.out.print("T "));
    t.run();
    System.out.print("M ");
  }
}`,
      prompt: 'What is the output?',
      answer: 'Prints **`T M `** deterministically. `t.run()` executes synchronously on the current (main) thread, so "T " is always printed before "M ". If `t.start()` were used, the output order would be non-deterministic.',
      verify: {
        files: {
          'ThreadRunVsStart.java': `public class ThreadRunVsStart {
  public static void main(String[] args) {
    Thread t = new Thread(() -> System.out.print("T "));
    t.run();
    System.out.print("M ");
  }
}`
        },
        expect: { output: 'T M ' }
      }
    }
  ],

  questions: [
    {
      id: 'ch13-q01', type: 'single', difficulty: 'easy', objectiveIds: ['8a'], tags: ['runnable', 'callable'],
      question: 'Which of the following can be thrown by the `call()` method of `Callable<V>`?',
      code: null,
      options: [
        'Any Exception (checked or unchecked)',
        'Only RuntimeException',
        'Only InterruptedException',
        'Only ExecutionException',
        'No checked exceptions may be thrown'
      ],
      answer: [0],
      explanation: 'The method signature of `Callable<V>` is `V call() throws Exception;`. Therefore, it can throw any checked or unchecked exception.',
      optionNotes: {
        '0': 'Correct: call() declares throws Exception.',
        '1': 'Callable is not restricted to RuntimeException.',
        '2': 'It can throw any Exception.',
        '3': 'ExecutionException is thrown by Future.get(), not call().',
        '4': 'Callable is specifically designed to allow checked exceptions.'
      },
      verify: null
    },
    {
      id: 'ch13-q02', type: 'single', difficulty: 'medium', objectiveIds: ['8a'], tags: ['executorservice', 'future'],
      question: 'What is the result of calling `get()` on a `Future<?>` returned by `ExecutorService.submit(Runnable task)` after the task completes normally?',
      code: null,
      options: [
        'Returns null',
        'Returns Boolean.TRUE',
        'Returns an empty String',
        'Throws UnsupportedOperationException',
        'Throws ExecutionException'
      ],
      answer: [0],
      explanation: 'When a `Runnable` is submitted via `submit(Runnable)`, the returned `Future<?>` has type `Void`. Upon successful completion of the task, `future.get()` returns `null`.',
      optionNotes: {
        '0': 'Correct: returns null upon successful completion of a Runnable.',
        '1': 'Does not return boolean.',
        '2': 'Does not return String.',
        '3': 'get() is fully supported on Future<?>.',
        '4': 'ExecutionException is only thrown if the task threw an exception.'
      },
      verify: null
    },
    {
      id: 'ch13-q03', type: 'single', difficulty: 'medium', objectiveIds: ['8b'], tags: ['reentrantlock', 'trylock'],
      question: 'What does `ReentrantLock.tryLock()` return when the lock is already held by another thread?',
      code: null,
      options: [
        'false immediately without blocking',
        'true after waiting for the lock',
        'Throws IllegalMonitorStateException',
        'Throws TimeoutException',
        'Blocks indefinitely'
      ],
      answer: [0],
      explanation: 'The no-arg `tryLock()` method attempts to acquire the lock only if it is free at the time of invocation. If held by another thread, it immediately returns `false` without blocking.',
      optionNotes: {
        '0': 'Correct: non-blocking, returns false.',
        '1': 'Does not wait without timeout argument.',
        '2': 'Does not throw exception.',
        '3': 'Does not throw TimeoutException.',
        '4': 'lock() blocks; tryLock() does not block.'
      },
      verify: null
    },
    {
      id: 'ch13-q04', type: 'single', difficulty: 'hard', objectiveIds: ['8b'], tags: ['cyclicbarrier', 'parties'],
      question: 'What happens if a `CyclicBarrier` is initialized with 3 parties and only 2 threads invoke `await()`?',
      code: null,
      options: [
        'Both threads block indefinitely waiting for the third party.',
        'The barrier releases the 2 threads with a warning.',
        'Throws BrokenBarrierException immediately on the second thread.',
        'The barrier action executes with partial data.',
        'Throws IllegalArgumentException'
      ],
      answer: [0],
      explanation: 'A `CyclicBarrier(3)` requires all 3 parties to invoke `await()` before releasing. If only 2 threads call `await()`, both threads remain blocked indefinitely (or until interrupted or timed out).',
      optionNotes: {
        '0': 'Correct: threads block waiting for the barrier requirement to be reached.',
        '1': 'Barrier never releases early.',
        '2': 'BrokenBarrierException is only thrown if a thread is interrupted or times out.',
        '3': 'Barrier action only executes when all parties arrive.',
        '4': 'No exception is thrown during await().'
      },
      verify: null
    },
    {
      id: 'ch13-q05', type: 'single', difficulty: 'medium', objectiveIds: ['8b'], tags: ['concurrency', 'volatile'],
      question: 'Which of the following operations is atomic on a `volatile int count` field?',
      code: null,
      options: [
        'count = 5;',
        'count++;',
        'count += 2;',
        'count = count + 1;',
        'None of them'
      ],
      answer: [0],
      explanation: 'Assigning a primitive value (`count = 5;`) is a single atomic write. Operations like `count++`, `count += 2`, and `count = count + 1` are read-modify-write compound operations and are NOT atomic, even with `volatile`.',
      optionNotes: {
        '0': 'Correct: 32-bit primitive assignment is atomic in Java.',
        '1': 'Compound operation (read, increment, write).',
        '2': 'Compound operation.',
        '3': 'Compound operation.',
        '4': 'Direct assignment is atomic.'
      },
      verify: null
    },
    {
      id: 'ch13-q06', type: 'single', difficulty: 'easy', objectiveIds: ['8a'], tags: ['thread', 'lifecycle'],
      question: 'Which method initiates an orderly shutdown of an `ExecutorService` where existing tasks run to completion but no new tasks are accepted?',
      code: null,
      options: [
        'shutdown()',
        'shutdownNow()',
        'close()',
        'stop()',
        'terminate()'
      ],
      answer: [0],
      explanation: '`shutdown()` stops accepting new tasks while allowing previously submitted tasks to complete. `shutdownNow()` actively attempts to stop running tasks.',
      optionNotes: {
        '0': 'Correct: shutdown() initiates orderly shutdown.',
        '1': 'shutdownNow() attempts to cancel and interrupt active tasks.',
        '2': 'close() is not the primary lifecycle method in ExecutorService.',
        '3': 'stop() is deprecated on Thread and not on ExecutorService.',
        '4': 'terminate() is not a method.'
      },
      verify: null
    },
    {
      id: 'ch13-q07', type: 'single', difficulty: 'medium', objectiveIds: ['8c'], tags: ['collections', 'concurrenthashmap'],
      question: 'What is the result of executing `map.put(null, "value")` on a `ConcurrentHashMap`?',
      code: null,
      options: [
        'Throws NullPointerException at runtime',
        'Stores the entry at index 0',
        'Returns false',
        'Compile error',
        'Replaces existing null mapping'
      ],
      answer: [0],
      explanation: '`ConcurrentHashMap` strictly prohibits `null` keys and `null` values. Passing `null` to `put()` immediately throws `NullPointerException`.',
      optionNotes: {
        '0': 'Correct: throws NullPointerException.',
        '1': 'HashMap allows null keys, but ConcurrentHashMap does not.',
        '2': 'put() returns the previous value or throws exception.',
        '3': 'Compiles without error.',
        '4': 'No null mapping can exist.'
      },
      verify: null
    },
    {
      id: 'ch13-q08', type: 'single', difficulty: 'hard', objectiveIds: ['8a'], tags: ['executorservice', 'exceptions'],
      question: 'When a task submitted to an `ExecutorService` throws an unhandled `NullPointerException`, when does the calling thread discover this exception?',
      code: null,
      options: [
        'When calling Future.get(), wrapped inside an ExecutionException',
        'Immediately when submitting the task',
        'When calling service.shutdown()',
        'The exception is printed to System.err and never thrown to the caller',
        'When calling Future.isDone()'
      ],
      answer: [0],
      explanation: 'Exceptions thrown during the execution of a task submitted to an `ExecutorService` are captured and rethrown as the cause of an `ExecutionException` when `Future.get()` is invoked.',
      optionNotes: {
        '0': 'Correct: Future.get() throws ExecutionException wrapping the cause.',
        '1': 'Task runs asynchronously after submit() returns.',
        '2': 'shutdown() does not throw task execution exceptions.',
        '3': 'Exceptions are not discarded.',
        '4': 'isDone() returns boolean and does not throw task exceptions.'
      },
      verify: null
    },
    {
      id: 'ch13-q09', type: 'single', difficulty: 'medium', objectiveIds: ['8b'], tags: ['copyonwritearraylist', 'iterator'],
      question: 'What happens when calling `iterator.remove()` on an iterator obtained from a `CopyOnWriteArrayList`?',
      code: null,
      options: [
        'Throws UnsupportedOperationException',
        'Removes the element from the list',
        'Throws ConcurrentModificationException',
        'Removes the element from the snapshot only',
        'Compile error'
      ],
      answer: [0],
      explanation: 'The iterator of `CopyOnWriteArrayList` provides an immutable snapshot of the list at the time the iterator was created. It does not support modification, so calling `iterator.remove()` throws `UnsupportedOperationException`.',
      optionNotes: {
        '0': 'Correct: iterator.remove() throws UnsupportedOperationException.',
        '1': 'Modification via iterator is unsupported.',
        '2': 'CopyOnWriteArrayList iterators never throw ConcurrentModificationException.',
        '3': 'Does not remove from snapshot.',
        '4': 'iterator.remove() is a standard method on Iterator.'
      },
      verify: null
    },
    {
      id: 'ch13-q10', type: 'single', difficulty: 'medium', objectiveIds: ['8c'], tags: ['parallel-stream', 'reduction'],
      question: 'Which of the following is a requirement for the combiner function used in parallel stream reductions?',
      code: null,
      options: [
        'It must be associative: (a op b) op c == a op (b op c)',
        'It must be commutative: a op b == b op a',
        'It must accept null arguments',
        'It must return a primitive boolean',
        'It must be marked synchronized'
      ],
      answer: [0],
      explanation: 'Parallel reductions divide data into segments and combine partial results in arbitrary groupings. This requires the operation to be **associative** so that the grouping order does not alter the final result.',
      optionNotes: {
        '0': 'Correct: associativity is the fundamental requirement for parallel reduction.',
        '1': 'Commutativity is not strictly required if order is preserved.',
        '2': 'Does not need to accept nulls.',
        '3': 'Combiner returns the accumulated type U.',
        '4': 'Lambdas do not need synchronized keywords.'
      },
      verify: null
    }
  ],

  checklist: [
    'I know the differences between Runnable (void run()) and Callable<V> (V call() throws Exception).',
    'I know t.start() spawns a new worker thread while t.run() executes synchronously on the current thread.',
    'I know ExecutorService.submit(Runnable) returns Future<?> where get() returns null on success.',
    'I know Future.get() blocks and throws ExecutionException wrapping any task exceptions.',
    'I know shutdown() permits running tasks to complete while shutdownNow() attempts to halt active tasks.',
    'I know volatile guarantees memory visibility across threads, but does not guarantee atomicity for compound operations like count++.',
    'I know AtomicInteger methods: incrementAndGet() vs getAndIncrement().',
    'I know ReentrantLock.tryLock() returns false immediately if the lock is held by another thread.',
    'I know ConcurrentHashMap throws NullPointerException on null keys or null values.',
    'I know CopyOnWriteArrayList iterators are snapshots that never throw ConcurrentModificationException and do not support remove().',
    'I know CyclicBarrier(parties) blocks threads calling await() until all parties arrive.',
    'I know parallel stream reductions require associative accumulator and combiner functions.'
  ]
});
