OCP.registerChapter({
  id: 10,
  slug: 'streams',
  title: 'Streams',
  objectiveIds: ['6a', '6b'],
  intro: `Objectives **6a** (object and primitive Streams, filtering, mapping, consuming, sorting) and **6b** (decomposition, concatenation, reduction, grouping and partitioning on sequential and parallel streams). Streams are one of the highest-weight topics on the 1Z0-829 exam. You must master laziness, pipeline execution order, terminal vs intermediate operations, primitive streams (\`IntStream\`, \`range\` vs \`rangeClosed\`), the 3 forms of \`reduce\`, complex \`Collectors\` (\`groupingBy\`, \`partitioningBy\`, downstream collectors, \`teeing\`), and parallel stream semantics.`,

  notes: [
    {
      id: 'pipeline-and-laziness',
      title: 'Stream anatomy, lifecycle, and laziness',
      md: `## Anatomy of a Stream pipeline

A stream pipeline consists of three parts:
1. **Source**: e.g. \`Collection.stream()\`, \`Stream.of(...)\`, \`Arrays.stream(...)\`, \`Stream.generate(...)\`, \`Stream.iterate(...)\`.
2. **Intermediate operations**: 0 or more operations that transform the stream into another stream (e.g. \`filter\`, \`map\`, \`sorted\`, \`distinct\`).
3. **Terminal operation**: exactly 1 operation that triggers execution and produces a result or side effect (e.g. \`collect\`, \`forEach\`, \`count\`, \`reduce\`).

## Key rules
* **Laziness**: intermediate operations are **never executed** until a terminal operation is called. If there is no terminal operation, nothing runs!
* **Single-use**: once a terminal operation has completed, the stream is **closed and cannot be reused**. Attempting to invoke any operation on an already operated stream throws \`IllegalStateException\`.
* **Short-circuiting**: some operations can terminate an infinite stream into a finite stream (e.g. \`limit\`, \`findFirst\`, \`anyMatch\`).

\`\`\`java
Stream<String> s = Stream.of("duck", "duck", "goose")
                         .peek(System.out::println); // Prints nothing! No terminal operation.
\`\`\``
    },
    {
      id: 'intermediate-operations',
      title: 'Intermediate operations',
      md: `| Operation | Parameter | State | Notes |
|---|---|---|---|
| **\`filter\`** | \`Predicate<T>\` | Stateless | Keeps elements matching condition |
| **\`distinct\`** | None | Stateful | Removes duplicates using \`equals()\` |
| **\`limit\`** | \`long maxSize\` | Short-circuiting | Truncates stream to at most \`maxSize\` elements |
| **\`skip\`** | \`long n\` | Stateful | Discards the first \`n\` elements |
| **\`map\`** | \`Function<T, R>\` | Stateless | Transforms each element into another object |
| **\`flatMap\`** | \`Function<T, Stream<R>>\` | Stateless | Flattens nested streams into a single flat stream |
| **\`sorted\`** | None or \`Comparator<T>\` | Stateful | Sorts elements (requires elements implement \`Comparable\` if no comparator given) |
| **\`peek\`** | \`Consumer<T>\` | Stateless | Performs action on each element without altering stream (useful for debugging) |

### flatMap vs map
* \`map(s -> s.split(""))\` produces \`Stream<String[]>\`.
* \`flatMap(s -> Arrays.stream(s.split("")))\` produces \`Stream<String>\`.
* \`flatMap\` extracts the contents of each sub-stream and flattens them into one continuous stream.`
    },
    {
      id: 'terminal-operations',
      title: 'Terminal operations and reductions',
      md: `| Operation | Return Type | Short-circuiting? | Description |
|---|---|---|---|
| **\`count()\`** | \`long\` | No | Number of elements in stream |
| **\`min(Comparator)\`** | \`Optional<T>\` | No | Smallest element |
| **\`max(Comparator)\`** | \`Optional<T>\` | No | Largest element |
| **\`findFirst()\`** | \`Optional<T>\` | Yes | First element (deterministic) |
| **\`findAny()\`** | \`Optional<T>\` | Yes | Any element (useful in parallel streams) |
| **\`anyMatch(Predicate)\`** | \`boolean\` | Yes | Returns true if at least one matches |
| **\`allMatch(Predicate)\`** | \`boolean\` | Yes | Returns true if all match (or stream empty) |
| **\`noneMatch(Predicate)\`** | \`boolean\` | Yes | Returns true if none match (or stream empty) |
| **\`forEach(Consumer)\`** | \`void\` | No | Processes each element |
| **\`collect(Collector)\`** | \`R\` | No | Mutable reduction into container |
| **\`reduce(...)\`** | \`T\` or \`Optional<T>\` | No | Immutable reduction to single value |

### Empty stream match rule (vacuous truth)
* \`Stream.empty().allMatch(p)\` → **\`true\`**
* \`Stream.empty().noneMatch(p)\` → **\`true\`**
* \`Stream.empty().anyMatch(p)\` → **\`false\`**

## The three forms of \`reduce()\`
1. **\`Optional<T> reduce(BinaryOperator<T> accumulator)\`**: no identity; returns empty Optional if stream is empty.
2. **\`T reduce(T identity, BinaryOperator<T> accumulator)\`**: returns identity if stream is empty.
3. **\`<U> U reduce(U identity, BiFunction<U, ? super T, U> accumulator, BinaryOperator<U> combiner)\`**: used when accumulator transforms types; combiner is used in parallel processing.`
    },
    {
      id: 'primitive-streams',
      title: 'Primitive streams: IntStream, LongStream, DoubleStream',
      md: `To avoid auto-boxing overhead, Java provides primitive stream specializations:
* \`IntStream\`, \`LongStream\`, \`DoubleStream\`.

## Creating primitive streams
* \`IntStream.range(1, 5)\`: 1, 2, 3, 4 (5 is **exclusive**).
* \`IntStream.rangeClosed(1, 5)\`: 1, 2, 3, 4, 5 (5 is **inclusive**).
* \`IntStream.of(1, 2, 3)\`.

## Primitive-specific terminal methods
* \`sum()\`: returns primitive \`int\`, \`long\`, or \`double\` (returns 0 if empty stream).
* \`average()\`: returns \`OptionalDouble\`.
* \`summaryStatistics()\`: returns \`IntSummaryStatistics\` (contains \`getCount()\`, \`getSum()\`, \`getMin()\`, \`getMax()\`, \`getAverage()\`).

## Converting between streams
* Object to primitive: \`mapToInt(ToIntFunction)\`, \`mapToLong\`, \`mapToDouble\`.
* Primitive to object: \`boxed()\` (returns \`Stream<Integer>\`), or \`mapToObj(IntFunction<R>)\`.`
    },
    {
      id: 'collectors',
      title: 'The Collectors utility: grouping, partitioning, and teeing',
      md: `All methods in \`java.util.stream.Collectors\`:

## 1. Basic collectors
* \`toList()\`, \`toSet()\`, \`toCollection(ArrayList::new)\`.
* Java 16+: \`stream.toList()\` returns an unmodifiable List directly without \`Collectors.toList()\`.
* \`joining(delimiter, prefix, suffix)\`: concatenates CharSequence elements.

## 2. \`groupingBy\`
Groups elements into a \`Map<K, List<T>>\` based on a classifier function:
\`\`\`java
Map<Integer, List<String>> byLength = list.stream().collect(Collectors.groupingBy(String::length));
\`\`\`
* Downstream collector variant:
\`\`\`java
Map<Integer, Long> countByLength = list.stream().collect(
    Collectors.groupingBy(String::length, Collectors.counting()));
\`\`\`

## 3. \`partitioningBy\`
Splits elements into a \`Map<Boolean, List<T>>\` based on a \`Predicate\`:
\`\`\`java
Map<Boolean, List<String>> partitioned = list.stream().collect(
    Collectors.partitioningBy(s -> s.length() > 3));
\`\`\`
* **Key guarantee**: the returned map **always contains both \`true\` and \`false\` keys**, even if one list is completely empty!

## 4. \`teeing\` (Java 12+)
Passes each stream element to two downstream collectors in a single pass and combines their results with a BiFunction:
\`\`\`java
var stats = Stream.of(1, 2, 3, 4, 5).collect(
    Collectors.teeing(
        Collectors.summingInt(Integer::intValue),
        Collectors.counting(),
        (sum, count) -> sum / (double) count // returns average!
    ));
\`\`\``
    },
    {
      id: 'parallel-streams',
      title: 'Parallel streams and reduction requirements',
      md: `## Creating parallel streams
* \`Collection.parallelStream()\`
* \`stream.parallel()\`

## Performance and correctness rules
* Parallel streams decompose work using the common ForkJoinPool.
* Reductions on parallel streams require that the accumulator and combiner functions are:
  1. **Associative**: \`(a op b) op c == a op (b op c)\`.
  2. **Non-interfering**: the stream source is not modified during pipeline execution.
  3. **Stateless**: lambda does not depend on mutable state outside itself.
* **Ordering**:
  * \`forEach\` on a parallel stream processes elements in arbitrary order.
  * \`forEachOrdered\` forces elements to be processed in encounter order (at a performance penalty).`
    }
  ],

  gotchas: [
    { title: 'Streams cannot be reused', md: 'Attempting to call a terminal operation on an already consumed stream throws `IllegalStateException: stream has already been operated upon or closed`.' },
    { title: 'Intermediate operations are lazy', md: 'Without a terminal operation, intermediate operations (like `peek`, `map`, `filter`) will never execute.' },
    { title: 'range vs rangeClosed', md: '`IntStream.range(1, 5)` excludes 5 (1, 2, 3, 4). `IntStream.rangeClosed(1, 5)` includes 5 (1, 2, 3, 4, 5).' },
    { title: 'allMatch on empty stream is true', md: '`Stream.empty().allMatch(x -> false)` evaluates to `true` (vacuous truth). `noneMatch` is also `true`, while `anyMatch` is `false`.' },
    { title: 'findAny vs findFirst', md: 'On sequential streams, `findAny()` typically returns the first element. On parallel streams, `findAny()` is free to return any element.' },
    { title: 'partitioningBy always has both keys', md: '`partitioningBy` always returns a map with both `Boolean.TRUE` and `Boolean.FALSE` keys, even if all elements match or none match.' },
    { title: 'Collectors.toMap duplicate key collision', md: '`Collectors.toMap(keyMapper, valueMapper)` throws `IllegalStateException: Duplicate key` if two items produce the same key without a merge function.' },
    { title: 'Stream.iterate infinite stream', md: '`Stream.iterate(1, x -> x + 1)` is infinite. Without `limit()`, terminal operations like `count()` or `collect()` will hang or run out of memory.' },
    { title: 'Stream.iterate 3-arg version (Java 9+)', md: '`Stream.iterate(1, x -> x <= 5, x -> x + 1)` includes a hasNext predicate and is finite.' },
    { title: 'Primitive sum() vs average()', md: '`IntStream.sum()` returns a primitive `int` (or 0 if empty). `IntStream.average()` returns an `OptionalDouble`.' },
    { title: 'Stream.toList() is unmodifiable (Java 16+)', md: '`stream.toList()` returns an unmodifiable list (similar to `List.of()`). Adding elements to it throws `UnsupportedOperationException`.' },
    { title: 'peek() should not modify state', md: '`peek()` is intended for debugging. Avoid mutating state inside `peek()` as parallel or optimized pipelines may omit or reorder calls.' }
  ],

  traps: [
    {
      code: `import java.util.stream.Stream;
public class ReuseTrap {
  public static void main(String[] args) {
    Stream<String> s = Stream.of("alpha", "beta", "gamma");
    long count = s.count();
    s.forEach(System.out::print);
  }
}`,
      prompt: 'What happens when this program runs?',
      answer: '**Throws IllegalStateException.** Streams cannot be reused after a terminal operation has been executed.',
      verify: {
        files: {
          'ReuseTrap.java': `import java.util.stream.Stream;
public class ReuseTrap {
  public static void main(String[] args) {
    Stream<String> s = Stream.of("alpha", "beta", "gamma");
    long count = s.count();
    s.forEach(System.out::print);
  }
}`
        },
        expect: 'runtime-exception'
      }
    },
    {
      code: `import java.util.stream.IntStream;
public class RangeTest {
  public static void main(String[] args) {
    int sum1 = IntStream.range(1, 4).sum();
    int sum2 = IntStream.rangeClosed(1, 4).sum();
    System.out.print(sum1 + " " + sum2);
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`6 10`**. `range(1, 4)` is 1 + 2 + 3 = 6 (4 is excluded). `rangeClosed(1, 4)` is 1 + 2 + 3 + 4 = 10 (4 is included).',
      verify: {
        files: {
          'RangeTest.java': `import java.util.stream.IntStream;
public class RangeTest {
  public static void main(String[] args) {
    int sum1 = IntStream.range(1, 4).sum();
    int sum2 = IntStream.rangeClosed(1, 4).sum();
    System.out.print(sum1 + " " + sum2);
  }
}`
        },
        expect: { output: '6 10' }
      }
    },
    {
      code: `import java.util.stream.Stream;
public class MatchEmpty {
  public static void main(String[] args) {
    boolean b1 = Stream.<String>empty().allMatch(s -> s.length() > 5);
    boolean b2 = Stream.<String>empty().anyMatch(s -> s.length() > 5);
    boolean b3 = Stream.<String>empty().noneMatch(s -> s.length() > 5);
    System.out.print(b1 + " " + b2 + " " + b3);
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`true false true`**. On an empty stream, `allMatch` and `noneMatch` are vacuously `true`, while `anyMatch` is `false`.',
      verify: {
        files: {
          'MatchEmpty.java': `import java.util.stream.Stream;
public class MatchEmpty {
  public static void main(String[] args) {
    boolean b1 = Stream.<String>empty().allMatch(s -> s.length() > 5);
    boolean b2 = Stream.<String>empty().anyMatch(s -> s.length() > 5);
    boolean b3 = Stream.<String>empty().noneMatch(s -> s.length() > 5);
    System.out.print(b1 + " " + b2 + " " + b3);
  }
}`
        },
        expect: { output: 'true false true' }
      }
    },
    {
      code: `import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
public class PartitionTest {
  public static void main(String[] args) {
    List<String> list = List.of("dog", "cat", "cow");
    Map<Boolean, List<String>> map = list.stream()
        .collect(Collectors.partitioningBy(s -> s.length() > 5));
    System.out.print(map.get(true).size() + " " + map.get(false).size());
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`0 3`**. `partitioningBy` always guarantees that both `true` and `false` keys exist in the resulting map, even when no elements match a partition.',
      verify: {
        files: {
          'PartitionTest.java': `import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
public class PartitionTest {
  public static void main(String[] args) {
    List<String> list = List.of("dog", "cat", "cow");
    Map<Boolean, List<String>> map = list.stream()
        .collect(Collectors.partitioningBy(s -> s.length() > 5));
    System.out.print(map.get(true).size() + " " + map.get(false).size());
  }
}`
        },
        expect: { output: '0 3' }
      }
    },
    {
      code: `import java.util.stream.Stream;
public class LazyPeek {
  public static void main(String[] args) {
    Stream.of("a", "b", "c")
          .filter(s -> {
            System.out.print(s);
            return s.equals("b");
          })
          .findFirst();
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`ab`**. Streams are lazily evaluated and process elements one by one vertically. "a" is evaluated (prints "a", filter returns false). "b" is evaluated (prints "b", filter returns true). Because `findFirst()` only needs one element, the stream short-circuits and "c" is never processed.',
      verify: {
        files: {
          'LazyPeek.java': `import java.util.stream.Stream;
public class LazyPeek {
  public static void main(String[] args) {
    Stream.of("a", "b", "c")
          .filter(s -> {
            System.out.print(s);
            return s.equals("b");
          })
          .findFirst();
  }
}`
        },
        expect: { output: 'ab' }
      }
    },
    {
      code: `import java.util.stream.Collectors;
import java.util.stream.Stream;
public class TeeingTest {
  public static void main(String[] args) {
    String res = Stream.of("x", "y", "z").collect(
        Collectors.teeing(
            Collectors.joining("-"),
            Collectors.counting(),
            (joined, count) -> joined + ":" + count
        ));
    System.out.print(res);
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`x-y-z:3`**. `teeing` executes both collectors on the stream and combines the results using the merger function.',
      verify: {
        files: {
          'TeeingTest.java': `import java.util.stream.Collectors;
import java.util.stream.Stream;
public class TeeingTest {
  public static void main(String[] args) {
    String res = Stream.of("x", "y", "z").collect(
        Collectors.teeing(
            Collectors.joining("-"),
            Collectors.counting(),
            (joined, count) -> joined + ":" + count
        ));
    System.out.print(res);
  }
}`
        },
        expect: { output: 'x-y-z:3' }
      }
    },
    {
      code: `import java.util.List;
import java.util.stream.Stream;
public class StreamToListTest {
  public static void main(String[] args) {
    List<String> list = Stream.of("a", "b").toList();
    list.add("c");
  }
}`,
      prompt: 'What happens when running this code?',
      answer: '**Throws UnsupportedOperationException.** `Stream.toList()` (Java 16+) returns an unmodifiable list.',
      verify: {
        files: {
          'StreamToListTest.java': `import java.util.List;
import java.util.stream.Stream;
public class StreamToListTest {
  public static void main(String[] args) {
    List<String> list = Stream.of("a", "b").toList();
    list.add("c");
  }
}`
        },
        expect: 'runtime-exception'
      }
    }
  ],

  questions: [
    {
      id: 'ch10-q01', type: 'single', difficulty: 'easy', objectiveIds: ['6a'], tags: ['intermediate', 'laziness'],
      question: 'What is the output of compiling and running this program?',
      code: `import java.util.stream.Stream;
public class TestStream {
  public static void main(String[] args) {
    Stream.of("apple", "banana", "cherry")
          .filter(s -> {
            System.out.print(s + " ");
            return s.startsWith("b");
          });
  }
}`,
      options: [
        'Prints: apple banana cherry ',
        'Prints: banana ',
        'Prints nothing',
        'Compile error: filter requires a boolean return type',
        'Throws IllegalStateException'
      ],
      answer: [2],
      explanation: 'Intermediate operations like `filter()` are lazily evaluated and only execute when a terminal operation is called on the stream pipeline. Since no terminal operation is invoked, no elements are processed and nothing is printed.',
      optionNotes: {
        '0': 'filter does not execute without a terminal operation.',
        '1': 'filter does not execute without a terminal operation.',
        '2': 'Correct: prints nothing due to stream laziness.',
        '3': 'filter predicate returns boolean (s.startsWith("b")).',
        '4': 'No exception is thrown.'
      },
      verify: {
        files: {
          'TestStream.java': `import java.util.stream.Stream;
public class TestStream {
  public static void main(String[] args) {
    Stream.of("apple", "banana", "cherry")
          .filter(s -> {
            System.out.print(s + " ");
            return s.startsWith("b");
          });
  }
}`
        },
        expect: { output: '' }
      }
    },
    {
      id: 'ch10-q02', type: 'single', difficulty: 'medium', objectiveIds: ['6a'], tags: ['reduce', 'identity'],
      question: 'What is the output?',
      code: `import java.util.List;
public class ReduceTest {
  public static void main(String[] args) {
    List<Integer> list = List.of(1, 2, 3, 4);
    int result = list.stream().reduce(10, (a, b) -> a + b);
    System.out.print(result);
  }
}`,
      options: ['20', '10', '24', '14', 'Compile error'],
      answer: [0],
      explanation: 'The 2-argument `reduce(identity, accumulator)` starts with the identity value 10 and applies addition to each element: 10 + 1 = 11; 11 + 2 = 13; 13 + 3 = 16; 16 + 4 = 20. Output is 20.',
      optionNotes: {
        '0': 'Correct: 10 + (1 + 2 + 3 + 4) = 20.',
        '1': 'Does not include elements.',
        '2': 'Multiplication would be 240.',
        '3': 'Calculation error.',
        '4': 'Completely valid reduce expression.'
      },
      verify: {
        files: {
          'ReduceTest.java': `import java.util.List;
public class ReduceTest {
  public static void main(String[] args) {
    List<Integer> list = List.of(1, 2, 3, 4);
    int result = list.stream().reduce(10, (a, b) -> a + b);
    System.out.print(result);
  }
}`
        },
        expect: { output: '20' }
      }
    },
    {
      id: 'ch10-q03', type: 'single', difficulty: 'medium', objectiveIds: ['6a'], tags: ['flatmap'],
      question: 'What is the output?',
      code: `import java.util.List;
import java.util.stream.Stream;
public class FlatMapTest {
  public static void main(String[] args) {
    List<String> list1 = List.of("A", "B");
    List<String> list2 = List.of("C", "D");
    Stream.of(list1, list2)
          .flatMap(List::stream)
          .forEach(System.out::print);
  }
}`,
      options: ['ABCD', '[A, B][C, D]', 'A B C D', 'Compile error', 'Runtime exception'],
      answer: [0],
      explanation: '`Stream.of(list1, list2)` creates `Stream<List<String>>`. `flatMap(List::stream)` maps each list to its element stream and flattens them into a single `Stream<String>`. `forEach(System::print)` prints each element directly without spaces: "ABCD".',
      optionNotes: {
        '0': 'Correct: ABCD is printed.',
        '1': 'Lists are flattened, not printed as lists.',
        '2': 'System.out::print does not add spaces.',
        '3': 'Completely valid flatMap usage.',
        '4': 'No exception is thrown.'
      },
      verify: {
        files: {
          'FlatMapTest.java': `import java.util.List;
import java.util.stream.Stream;
public class FlatMapTest {
  public static void main(String[] args) {
    List<String> list1 = List.of("A", "B");
    List<String> list2 = List.of("C", "D");
    Stream.of(list1, list2)
          .flatMap(List::stream)
          .forEach(System.out::print);
  }
}`
        },
        expect: { output: 'ABCD' }
      }
    },
    {
      id: 'ch10-q04', type: 'single', difficulty: 'hard', objectiveIds: ['6b'], tags: ['collectors', 'groupingby'],
      question: 'What is the output?',
      code: `import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
public class GroupingTest {
  public static void main(String[] args) {
    List<String> words = List.of("lions", "tigers", "bears");
    Map<Integer, Long> map = words.stream().collect(
        Collectors.groupingBy(String::length, Collectors.counting()));
    System.out.print(map.get(5) + " " + map.get(6));
  }
}`,
      options: ['2 1', '1 2', '2 null', 'lions tigers', 'Compile error'],
      answer: [0],
      explanation: '"lions" has length 5; "bears" has length 5 (count = 2). "tigers" has length 6 (count = 1). `map.get(5)` is 2 and `map.get(6)` is 1. Output is `2 1`.',
      optionNotes: {
        '0': 'Correct: 2 words of length 5, 1 word of length 6.',
        '1': 'Inverted.',
        '2': 'Length 6 exists (tigers).',
        '3': 'Downstream collector is counting(), returning Long counts.',
        '4': 'Valid collector combination.'
      },
      verify: {
        files: {
          'GroupingTest.java': `import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
public class GroupingTest {
  public static void main(String[] args) {
    List<String> words = List.of("lions", "tigers", "bears");
    Map<Integer, Long> map = words.stream().collect(
        Collectors.groupingBy(String::length, Collectors.counting()));
    System.out.print(map.get(5) + " " + map.get(6));
  }
}`
        },
        expect: { output: '2 1' }
      }
    },
    {
      id: 'ch10-q05', type: 'single', difficulty: 'medium', objectiveIds: ['6a'], tags: ['primitive-streams', 'summary-statistics'],
      question: 'What is the output?',
      code: `import java.util.IntSummaryStatistics;
import java.util.stream.IntStream;
public class StatsTest {
  public static void main(String[] args) {
    IntSummaryStatistics stats = IntStream.of(10, 20, 30).summaryStatistics();
    System.out.print(stats.getCount() + " " + stats.getMax() + " " + stats.getSum());
  }
}`,
      options: ['3 30 60', '3 30 20', '3 20 60', '30 3 60', 'Compile error'],
      answer: [0],
      explanation: '`stats.getCount()` returns 3 (count of elements). `stats.getMax()` returns 30. `stats.getSum()` returns 60 (10 + 20 + 30). Output is `3 30 60`.',
      optionNotes: {
        '0': 'Correct: count is 3, max is 30, sum is 60.',
        '1': '20 is the average, not sum.',
        '2': '30 is the max, not 20.',
        '3': 'Order of stats methods.',
        '4': 'IntSummaryStatistics methods are standard.'
      },
      verify: {
        files: {
          'StatsTest.java': `import java.util.IntSummaryStatistics;
import java.util.stream.IntStream;
public class StatsTest {
  public static void main(String[] args) {
    IntSummaryStatistics stats = IntStream.of(10, 20, 30).summaryStatistics();
    System.out.print(stats.getCount() + " " + stats.getMax() + " " + stats.getSum());
  }
}`
        },
        expect: { output: '3 30 60' }
      }
    },
    {
      id: 'ch10-q06', type: 'single', difficulty: 'hard', objectiveIds: ['6b'], tags: ['collectors', 'tomap'],
      question: 'What is the result of running this code?',
      code: `import java.util.List;
import java.util.stream.Collectors;
public class ToMapTest {
  public static void main(String[] args) {
    List<String> list = List.of("ant", "ape", "bat");
    list.stream().collect(Collectors.toMap(s -> s.charAt(0), s -> s));
  }
}`,
      options: [
        'Returns a map with 3 entries',
        'Throws IllegalStateException at runtime',
        'Returns a map where "a" maps to "ape"',
        'Compile error',
        'Throws NullPointerException at runtime'
      ],
      answer: [1],
      explanation: 'Both "ant" and "ape" have the first character \'a\'. `Collectors.toMap(keyMapper, valueMapper)` does not provide a merge function for handling collisions. When duplicate keys are encountered, it throws `IllegalStateException: Duplicate key`.',
      optionNotes: {
        '0': 'Duplicate keys are not allowed without a merge function.',
        '1': 'Correct: duplicate key \'a\' causes IllegalStateException.',
        '2': 'Does not overwrite without merge function.',
        '3': 'Compiles fine.',
        '4': 'No null values involved.'
      },
      verify: {
        files: {
          'ToMapTest.java': `import java.util.List;
import java.util.stream.Collectors;
public class ToMapTest {
  public static void main(String[] args) {
    List<String> list = List.of("ant", "ape", "bat");
    list.stream().collect(Collectors.toMap(s -> s.charAt(0), s -> s));
  }
}`
        },
        expect: 'runtime-exception'
      }
    },
    {
      id: 'ch10-q07', type: 'single', difficulty: 'easy', objectiveIds: ['6a'], tags: ['intermediate', 'skip-limit'],
      question: 'What is the output?',
      code: `import java.util.stream.Stream;
public class SkipLimitTest {
  public static void main(String[] args) {
    Stream.iterate(1, x -> x + 1)
          .skip(3)
          .limit(3)
          .forEach(System.out::print);
  }
}`,
      options: ['456', '123', '345', '45', 'Runs indefinitely'],
      answer: [0],
      explanation: '`Stream.iterate(1, x -> x + 1)` produces 1, 2, 3, 4, 5, 6, ... `skip(3)` skips 1, 2, and 3. `limit(3)` takes the next 3 elements: 4, 5, and 6. `forEach` prints "456".',
      optionNotes: {
        '0': 'Correct: elements 4, 5, 6.',
        '1': 'skip(3) skips the first 3 elements.',
        '2': 'Element 3 was skipped.',
        '3': 'limit(3) takes 3 elements, not 2.',
        '4': 'limit(3) makes the stream finite.'
      },
      verify: {
        files: {
          'SkipLimitTest.java': `import java.util.stream.Stream;
public class SkipLimitTest {
  public static void main(String[] args) {
    Stream.iterate(1, x -> x + 1)
          .skip(3)
          .limit(3)
          .forEach(System.out::print);
  }
}`
        },
        expect: { output: '456' }
      }
    },
    {
      id: 'ch10-q08', type: 'single', difficulty: 'medium', objectiveIds: ['6b'], tags: ['parallel', 'findany'],
      question: 'Which statement about `findAny()` on a parallel stream is TRUE?',
      code: null,
      options: [
        'It is guaranteed to return the first element in encounter order.',
        'It may return any element from the stream to maximize performance.',
        'It throws an UnsupportedOperationException on parallel streams.',
        'It must process all stream elements before returning.',
        'It returns an empty Optional if the stream has multiple threads.'
      ],
      answer: [1],
      explanation: 'In parallel streams, `findAny()` is explicitly designed to be non-deterministic: it returns whichever element is found first by any thread, maximizing concurrency efficiency.',
      optionNotes: {
        '0': 'That is findFirst(), not findAny().',
        '1': 'Correct: findAny() returns any matching element nondeterministically.',
        '2': 'Fully supported on parallel streams.',
        '3': 'It is a short-circuiting operation.',
        '4': 'Returns an Optional containing the found element.'
      },
      verify: null
    },
    {
      id: 'ch10-q09', type: 'single', difficulty: 'medium', objectiveIds: ['6a'], tags: ['primitive-streams', 'average'],
      question: 'What is the return type of `DoubleStream.of(1.5, 2.5).average()`?',
      code: null,
      options: ['OptionalDouble', 'double', 'Optional<Double>', 'Double', 'BigDecimal'],
      answer: [0],
      explanation: 'Primitive stream average methods (`average()`) return `OptionalDouble` because the stream might be empty and have no average.',
      optionNotes: {
        '0': 'Correct: returns OptionalDouble.',
        '1': 'Cannot return primitive double because empty streams have no average.',
        '2': 'Uses primitive wrapper OptionalDouble, not generic Optional<Double>.',
        '3': 'Does not return Double.',
        '4': 'BigDecimal is not part of stream API.'
      },
      verify: null
    },
    {
      id: 'ch10-q10', type: 'single', difficulty: 'hard', objectiveIds: ['6b'], tags: ['collectors', 'mapping'],
      question: 'What is the output?',
      code: `import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
public class DownstreamMapping {
  public static void main(String[] args) {
    List<String> list = List.of("ant", "bear", "cat");
    Map<Integer, String> map = list.stream().collect(
        Collectors.groupingBy(
            String::length,
            Collectors.mapping(s -> "" + s.charAt(0), Collectors.joining())
        ));
    System.out.print(map.get(3) + " " + map.get(4));
  }
}`,
      options: ['ac b', 'ant bear', '3 4', 'ca b', 'Compile error'],
      answer: [0],
      explanation: 'Grouped by length: length 3 ("ant", "cat") and length 4 ("bear"). Downstream collector extracts the first character (`s.charAt(0)`) and joins them: for length 3, \'a\' and \'c\' joined gives `"ac"`. For length 4, \'b\' joined gives `"b"`. Output is `ac b`.',
      optionNotes: {
        '0': 'Correct: "ant" and "cat" produce "ac"; "bear" produces "b".',
        '1': 'Characters are extracted and joined, not original strings.',
        '2': 'Prints the values, not the keys.',
        '3': 'Order of encounter is preserved.',
        '4': 'Valid downstream collector chain.'
      },
      verify: {
        files: {
          'DownstreamMapping.java': `import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
public class DownstreamMapping {
  public static void main(String[] args) {
    List<String> list = List.of("ant", "bear", "cat");
    Map<Integer, String> map = list.stream().collect(
        Collectors.groupingBy(
            String::length,
            Collectors.mapping(s -> "" + s.charAt(0), Collectors.joining())
        ));
    System.out.print(map.get(3) + " " + map.get(4));
  }
}`
        },
        expect: { output: 'ac b' }
      }
    }
  ],

  checklist: [
    'I know streams are lazy and intermediate operations do not execute without a terminal operation.',
    'I know streams cannot be reused after a terminal operation has executed.',
    'I know the difference between IntStream.range() (exclusive) and rangeClosed() (inclusive).',
    'I know allMatch and noneMatch return true on empty streams, while anyMatch returns false.',
    'I know the difference between map() and flatMap().',
    'I know the 3 forms of reduce() and their return types (Optional<T>, T, U).',
    'I know primitive stream terminal methods: sum() returns primitive, average() returns OptionalDouble.',
    'I know Collectors.groupingBy() and its downstream collectors (counting, mapping, joining, toSet).',
    'I know Collectors.partitioningBy() always returns a Map with both true and false keys.',
    'I know Collectors.toMap() throws IllegalStateException on duplicate keys without a merge function.',
    'I know Collectors.teeing() executes two collectors and merges their results.',
    'I know Stream.toList() returns an unmodifiable list in Java 16+.',
    'I know findAny() on parallel streams is non-deterministic.'
  ]
});
