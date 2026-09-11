OCP.registerChapter({
  id: 10,
  slug: 'streams',
  title: 'Streams',
  objectiveIds: ['6a', '6b'],
  intro: `Streams describe a pipeline over data rather than a container holding data. The exam tests when a pipeline runs, which operations short-circuit, how Optional represents absence, and which collector overload you selected. Keep reference streams separate from primitive streams, and remember that a stream is consumable only once.`,

  notes: [
    {
      id: 'creation-laziness',
      title: 'Creating streams and pipeline evaluation',
      md: `Common stream sources include \`Stream.of(a, b)\), \`Arrays.stream(array)\), \`IntStream.range(start, end)\), and \`IntStream.rangeClosed(start, end)\). The first range excludes its upper bound; the second includes it. \`Stream.iterate(seed, unaryOperator)\) is potentially infinite, while Java 9 added the bounded form \`iterate(seed, hasNext, next)\). \`Stream.generate(supplier)\) is also potentially infinite. \`Files.lines(path)\` creates a lazily read stream and should be used in a try-with-resources statement.

\`\`\`java
Stream.iterate(1, n -> n <= 5, n -> n + 1)
  .map(n -> n * n)
  .forEach(System.out::println);
\`\`\`

Intermediate operations such as \`map\), \`filter\), \`flatMap\), \`distinct\), \`sorted\), \`peek\), \`limit\), \`skip\), \`takeWhile\), and \`dropWhile\) build a new lazy pipeline. Terminal operations such as \`forEach\), \`count\), \`reduce\), \`collect\), and \`findFirst\) trigger traversal. A stream cannot be reused after a terminal operation; attempting to do so throws \`IllegalStateException\).`,
    },
    {
      id: 'optional',
      title: 'Optional and primitive Optional types',
      md: `\`Optional<T>\) models a possible reference value. Use \`Optional.of(value)\) when value must be non-null, \`ofNullable(value)\) when null means empty, and \`empty()\) for an empty instance.

| Operation | Result |
|---|---|
| \`isPresent\`, \`isEmpty\) | test presence |
| \`ifPresent(action)\) | conditionally consume |
| \`orElse(value)\) | fallback, evaluated before the call |
| \`orElseGet(supplier)\) | lazy fallback |
| \`orElseThrow()\) | value or NoSuchElementException |
| \`map(fn)\) | transforms present value; null result becomes empty |
| \`filter(predicate)\) | keeps value only when predicate is true |
| \`flatMap(fn)\) | transforms without nesting Optional |
| \`get()\) | value or NoSuchElementException |

\`OptionalInt\), \`OptionalLong\), and \`OptionalDouble\) avoid boxing primitive results. They use \`getAsInt/getAsLong/getAsDouble\), and their \`orElse\) methods take the corresponding primitive. Do not confuse \`OptionalInt\) with \`Optional<Integer>\); their APIs are similar but not interchangeable.`,
    },
    {
      id: 'mapping-reductions',
      title: 'Mapping, decomposition, and reductions',
      md: `\`map\) changes one element into one result; \`flatMap\) changes one element into zero or more results and flattens the nested streams. This makes it the standard decomposition operation:

\`\`\`java
Stream<String> words = Stream.of("a,b", "c");
long count = words.flatMap(s -> Arrays.stream(s.split(","))).count();
\`\`\`

\`filter\) keeps matching elements, \`distinct\) uses equality, \`sorted\) uses natural or supplied order, and \`peek\) is mainly for diagnostics. \`limit\), \`findFirst\), \`findAny\), and the match operations can short-circuit. \`takeWhile\) consumes the longest prefix satisfying its predicate; \`dropWhile\) discards that prefix and emits the rest. On an ordered stream, these are prefix operations.

Reductions include \`count\), \`min\), \`max\), \`findFirst\), \`findAny\), \`allMatch\), \`anyMatch\), and \`noneMatch\). The three \`reduce\) shapes are identity-only, identity plus accumulator, and identity plus accumulator plus combiner. The identity must be a true identity, and parallel accumulation requires associative operations. Without an identity, reduce returns an \`Optional\).`,
    },
    {
      id: 'primitive-streams',
      title: 'Primitive streams and statistics',
      md: `Reference streams can specialize with \`mapToInt\), \`mapToLong\), or \`mapToDouble\). Primitive streams provide arithmetic methods without boxing:

| Operation | Typical result |
|---|---|
| \`IntStream.sum()\) | int |
| \`IntStream.average()\) | OptionalDouble |
| \`IntStream.summaryStatistics()\) | IntSummaryStatistics |
| \`IntStream.boxed()\) | Stream<Integer> |

\`map\) on an \`IntStream\) remains primitive; \`mapToObj\) returns a reference stream. To return to a reference stream use \`boxed()\). \`average()\) can be absent for an empty stream, so it returns \`OptionalDouble\). Use \`orElse\) or \`ifPresent\) rather than assuming a value.

Numeric overflow rules still apply to primitive reductions. An \`IntStream\) sum is an int sum, while \`mapToLong\) can move the calculation to long. A summary object reports count, sum, min, max, and average.`,
    },
    {
      id: 'collectors',
      title: 'Collectors and collector overloads',
      md: `Collectors turn a stream into a result. \`toList()\) and \`toSet()\) collect elements; their exact mutability and implementation type should not be assumed. \`joining(delimiter)\) concatenates CharSequences. \`counting\), \`averagingInt\), and \`summingInt\) produce aggregate results.

\`toMap(keyMapper, valueMapper)\) throws \`IllegalStateException\) for duplicate keys unless a merge function is supplied. A fourth map-supplier argument chooses the map implementation:

\`\`\`java
Collectors.toMap(
  Person::id,
  Person::name,
  (first, second) -> first,
  LinkedHashMap::new)
\`\`\`

\`groupingBy(classifier)\) groups into a map of lists. Its two-argument form supplies a downstream collector, and its three-argument form supplies a map factory plus downstream collector. \`partitioningBy(predicate)\) always creates Boolean keys and has two overloads, with an optional downstream collector. \`mapping(mapper, downstream)\) adapts values before another collector. \`minBy\) and \`maxBy\) are downstream collectors. \`teeing(left, right, merger)\) runs two collectors over the same input and combines their results.`,
    },
    {
      id: 'parallel-streams',
      title: 'Parallel streams and ordering',
      md: `A stream can become parallel with \`parallel()\), \`parallelStream()\), or by changing its source. \`isParallel()\) reports the mode. Parallel pipelines may process elements concurrently, so a side-effecting \`forEach\) has no encounter-order guarantee. \`forEachOrdered\) preserves encounter order, though it can reduce parallel performance.

Reduction accumulators and combiners must be associative and compatible with the identity. String concatenation with a valid empty identity is associative; subtraction is not. A mutable result should normally be created through \`collect\), whose supplier, accumulator, and combiner describe independent result containers. \`unordered()\) tells the pipeline that encounter order is not required and can enable optimizations.

Short-circuiting is important with infinite sources: \`limit\), \`findFirst\), \`findAny\), and match operations can finish. A stateful operation such as \`sorted()\) must see all elements before producing sorted output, so sorting an infinite stream does not terminate. \`peek\` does not force evaluation by itself.`,
    },
  ],

  gotchas: [
    { title: 'Range upper bound', md: 'IntStream.range excludes the end; rangeClosed includes it.' },
    { title: 'Iterate can be infinite', md: 'The two-argument iterate has no built-in stopping predicate.' },
    { title: 'Generate can be infinite', md: 'Stream.generate requires a short-circuiting operation or it keeps producing values.' },
    { title: 'Files.lines resource', md: 'A Files.lines stream should be closed, normally with try-with-resources.' },
    { title: 'Intermediate laziness', md: 'map and filter do nothing until a terminal operation runs.' },
    { title: 'One-use streams', md: 'After a terminal operation, reusing the stream throws IllegalStateException.' },
    { title: 'Peek is not terminal', md: 'peek runs only when a later terminal operation requests elements.' },
    { title: 'Optional.of null', md: 'Optional.of(null) throws NullPointerException; use ofNullable for nullable input.' },
    { title: 'orElse eager', md: 'The expression passed to orElse is evaluated even when the Optional is present.' },
    { title: 'orElseGet lazy', md: 'orElseGet invokes its supplier only when the Optional is empty.' },
    { title: 'Optional get', md: 'get on an empty Optional throws NoSuchElementException.' },
    { title: 'Primitive Optional', md: 'average returns OptionalDouble, not Optional<Double>.' },
    { title: 'Map versus flatMap', md: 'map can create Optional<Optional<T>>; flatMap avoids that nesting.' },
    { title: 'FlatMap decomposition', md: 'flatMap is the usual way to turn each source element into multiple stream elements.' },
    { title: 'TakeWhile prefix', md: 'takeWhile stops at the first failed predicate on an ordered stream.' },
    { title: 'DropWhile prefix', md: 'dropWhile skips the initial matching prefix, then emits the remainder.' },
    { title: 'Sorted statefulness', md: 'sorted must buffer elements before producing ordered output.' },
    { title: 'Reduce identity', md: 'The identity must not change the result when combined with any element.' },
    { title: 'Reduce associativity', md: 'Parallel reduction requires an associative accumulator/combiner relationship.' },
    { title: 'Reduce without identity', md: 'The no-identity overload returns Optional because the stream may be empty.' },
    { title: 'findFirst versus findAny', md: 'findFirst honors encounter order; findAny may choose any element, especially in parallel.' },
    { title: 'Match empty stream', md: 'allMatch and noneMatch return true for an empty stream; anyMatch returns false.' },
    { title: 'ToMap duplicate keys', md: 'Collectors.toMap without a merge function throws IllegalStateException for duplicates.' },
    { title: 'Grouping downstream', md: 'The two-argument groupingBy form changes the value collector, not the classifier.' },
    { title: 'Partition keys', md: 'partitioningBy always supplies both Boolean keys in its result model.' },
    { title: 'Primitive boxed', md: 'boxed changes IntStream to Stream<Integer> and introduces boxing.' },
    { title: 'Primitive sum type', md: 'IntStream.sum returns int; use a long specialization when needed.' },
    { title: 'Parallel forEach', md: 'Parallel forEach does not promise encounter order.' },
    { title: 'ForEachOrdered', md: 'forEachOrdered preserves encounter order even on a parallel ordered stream.' },
    { title: 'Unordered hint', md: 'unordered removes an ordering requirement; it does not sort or randomly shuffle by itself.' },
  ],

  traps: [
    {
      code: `import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    Stream.of(1, 2, 3).peek(n -> System.out.print("p" + n))
      .filter(n -> n > 1)
      .count();
  }
}`,
      prompt: 'Which peek actions run, and why?',
      answer: 'The terminal count triggers the pipeline, so peek runs for every source element and prints `p1p2p3`.',
      verify: { files: { 'Demo.java': `import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    Stream.of(1, 2, 3).peek(n -> System.out.print("p" + n))
      .filter(n -> n > 1)
      .count();
  }
}` }, expect: { output: 'p1p2p3' } },
    },
    {
      code: `import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    Stream<Integer> values = Stream.of(1, 2);
    System.out.print(values.count() + " ");
    System.out.print(values.count());
  }
}`,
      prompt: 'What happens when this stream is used twice?',
      answer: 'The first count prints `2 `; the second terminal operation throws IllegalStateException because streams are single-use.',
      verify: { files: { 'Demo.java': `import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    Stream<Integer> values = Stream.of(1, 2);
    System.out.print(values.count() + " ");
    System.out.print(values.count());
  }
}` }, expect: 'runtime-exception' },
    },
    {
      code: `import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    Stream.iterate(1, n -> n <= 4, n -> n + 1)
      .forEach(n -> System.out.print(n));
  }
}`,
      prompt: 'What does the bounded iterate call print?',
      answer: 'It emits 1, 2, 3, and 4, then stops because the next value 5 fails the predicate.',
      verify: { files: { 'Demo.java': `import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    Stream.iterate(1, n -> n <= 4, n -> n + 1)
      .forEach(n -> System.out.print(n));
  }
}` }, expect: { output: '1234' } },
    },
    {
      code: `import java.util.*;
class Demo {
  static String fallback() {
    System.out.print("F");
    return "fallback";
  }
  public static void main(String[] args) {
    System.out.print(Optional.of("value").orElse(fallback()));
    System.out.print("|");
    System.out.print(Optional.of("value").orElseGet(Demo::fallback));
  }
}`,
      prompt: 'What does this comparison of orElse and orElseGet print?',
      answer: 'orElse evaluates fallback eagerly, while orElseGet does not invoke it for a present value, so it prints `Fvalue|value`.',
      verify: { files: { 'Demo.java': `import java.util.*;
class Demo {
  static String fallback() {
    System.out.print("F");
    return "fallback";
  }
  public static void main(String[] args) {
    System.out.print(Optional.of("value").orElse(fallback()));
    System.out.print("|");
    System.out.print(Optional.of("value").orElseGet(Demo::fallback));
  }
}` }, expect: { output: 'Fvalue|value' } },
    },
    {
      code: `import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    IntStream values = IntStream.of(2, 4, 6);
    System.out.print(values.sum() + " ");
    System.out.print(IntStream.of(2, 4, 6).average().orElse(-1));
  }
}`,
      prompt: 'What are the primitive reduction result types and output?',
      answer: 'sum returns int 12, while average returns OptionalDouble containing 4.0, so it prints `12 4.0`.',
      verify: { files: { 'Demo.java': `import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    IntStream values = IntStream.of(2, 4, 6);
    System.out.print(values.sum() + " ");
    System.out.print(IntStream.of(2, 4, 6).average().orElse(-1));
  }
}` }, expect: { output: '12 4.0' } },
    },
    {
      code: `import java.util.*;
import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    Stream.of("a", "a").collect(Collectors.toMap(x -> x, x -> x.length()));
  }
}`,
      prompt: 'What happens when toMap receives duplicate keys without a merge function?',
      answer: 'Both values map to key a, so the collector throws IllegalStateException rather than choosing one value.',
      verify: { files: { 'Demo.java': `import java.util.*;
import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    Stream.of("a", "a").collect(Collectors.toMap(x -> x, x -> x.length()));
  }
}` }, expect: 'runtime-exception' },
    },
    {
      code: `import java.util.*;
import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    Map<Boolean, List<Integer>> result = IntStream.rangeClosed(1, 4)
      .boxed()
      .collect(Collectors.partitioningBy(n -> n % 2 == 0));
    System.out.print(result.get(true) + " " + result.get(false));
  }
}`,
      prompt: 'What lists result from this partitioningBy collector?',
      answer: 'The predicate is true for even numbers, so the output is `[2, 4] [1, 3]`.',
      verify: { files: { 'Demo.java': `import java.util.*;
import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    Map<Boolean, List<Integer>> result = IntStream.rangeClosed(1, 4)
      .boxed()
      .collect(Collectors.partitioningBy(n -> n % 2 == 0));
    System.out.print(result.get(true) + " " + result.get(false));
  }
}` }, expect: { output: '[2, 4] [1, 3]' } },
    },
    {
      code: `import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    IntStream.rangeClosed(1, 3).parallel().forEachOrdered(n -> System.out.print(n));
  }
}`,
      prompt: 'What ordering does forEachOrdered preserve here?',
      answer: 'Although the stream is parallel, forEachOrdered preserves the ordered source encounter sequence and prints `123`.',
      verify: { files: { 'Demo.java': `import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    IntStream.rangeClosed(1, 3).parallel().forEachOrdered(n -> System.out.print(n));
  }
}` }, expect: { output: '123' } },
    },
  ],

  questions: [
    {
      id: 'ch10-q01',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['6a'],
      tags: ['creation'],
      question: 'Which operation is terminal?',
      code: null,
      options: ['map', 'filter', 'peek', 'count', 'sorted'],
      answer: [3],
      explanation: 'count consumes the pipeline and produces a result; the others are intermediate operations.',
      optionNotes: { '0': 'Intermediate.', '1': 'Intermediate.', '2': 'Intermediate.', '3': 'Correct.', '4': 'Intermediate and stateful.' },
      verify: null,
    },
    {
      id: 'ch10-q02',
      type: 'multi',
      difficulty: 'easy',
      objectiveIds: ['6a'],
      tags: ['creation'],
      question: 'Which stream sources are potentially infinite?',
      code: null,
      options: ['Stream.generate(supplier)', 'Stream.iterate(seed, next)', 'IntStream.range(1, 4)', 'Stream.of(1, 2)', 'Arrays.stream(array)'],
      answer: [0, 1],
      explanation: 'generate and the two-argument iterate have no natural end. The listed range, of, and array sources are finite.',
      optionNotes: { '0': 'Potentially infinite.', '1': 'Potentially infinite.', '2': 'Finite range.', '3': 'Finite values.', '4': 'Finite array.' },
      verify: null,
    },
    {
      id: 'ch10-q03',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['6a'],
      tags: ['creation'],
      question: 'What is the difference between IntStream.range(1, 4) and rangeClosed(1, 4)?',
      code: null,
      options: ['range includes neither endpoint', 'range excludes 4; rangeClosed includes 4', 'range includes 4; rangeClosed excludes 4', 'They are identical', 'rangeClosed is always infinite'],
      answer: [1],
      explanation: 'range uses an exclusive upper bound; rangeClosed uses an inclusive upper bound.',
      optionNotes: { '0': 'The start is included.', '1': 'Correct.', '2': 'Reversed.', '3': 'Their upper-bound behavior differs.', '4': 'It is finite here.' },
      verify: null,
    },
    {
      id: 'ch10-q04',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['laziness'],
      question: 'Which statements about intermediate stream operations are true?',
      code: null,
      options: ['They are lazy', 'They return another stream in common pipelines', 'They require a terminal operation to run', 'peek is terminal', 'sorted is stateless'],
      answer: [0, 1, 2],
      explanation: 'Intermediate operations are lazy stream-building operations. peek is intermediate, and sorted is stateful because it must order elements.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'peek is intermediate.', '4': 'sorted is stateful.' },
      verify: null,
    },
    {
      id: 'ch10-q05',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['6a'],
      tags: ['optional'],
      question: 'Which factory safely converts a possibly null reference into an Optional?',
      code: null,
      options: ['Optional.of', 'Optional.ofNullable', 'Optional.get', 'Optional.present', 'Optional.fromNull'],
      answer: [1],
      explanation: 'ofNullable creates empty for null and present for non-null; of rejects null.',
      optionNotes: { '0': 'Throws for null.', '1': 'Correct.', '2': 'Retrieves rather than creates.', '3': 'No such factory.', '4': 'No such factory.' },
      verify: null,
    },
    {
      id: 'ch10-q06',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['optional'],
      question: 'Which Optional operations can transform a present value?',
      code: null,
      options: ['map', 'flatMap', 'filter', 'count', 'joining'],
      answer: [0, 1, 2],
      explanation: 'map, flatMap, and filter are Optional transformations. count and joining are collector/stream concepts.',
      optionNotes: { '0': 'Transforms the contained value.', '1': 'Transforms without nested Optional.', '2': 'Keeps or empties the value.', '3': 'Not an Optional operation.', '4': 'Collector operation.' },
      verify: null,
    },
    {
      id: 'ch10-q07',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['optional'],
      question: 'Which fallback is evaluated lazily?',
      code: null,
      options: ['orElse(value)', 'orElseGet(supplier)', 'get()', 'of(value)', 'ifPresent(action)'],
      answer: [1],
      explanation: 'orElseGet invokes its supplier only when the Optional is empty; orElse evaluates its argument first.',
      optionNotes: { '0': 'Its expression is eager.', '1': 'Correct.', '2': 'No fallback.', '3': 'Creation operation.', '4': 'Conditional consumer.' },
      verify: null,
    },
    {
      id: 'ch10-q08',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['mapping'],
      question: 'Which operations can short-circuit a stream pipeline?',
      code: null,
      options: ['limit', 'findFirst', 'findAny', 'anyMatch', 'sorted'],
      answer: [0, 1, 2, 3],
      explanation: 'limit, findFirst, findAny, and anyMatch can stop before consuming all input. sorted must process all input before output.',
      optionNotes: { '0': 'Short-circuiting stateful operation.', '1': 'Short-circuiting terminal.', '2': 'Short-circuiting terminal.', '3': 'Short-circuiting match.', '4': 'Stateful but not short-circuiting.' },
      verify: null,
    },
    {
      id: 'ch10-q09',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['6b'],
      tags: ['flat-map'],
      question: 'Which operation is best for decomposing each source element into multiple output elements?',
      code: null,
      options: ['map', 'flatMap', 'peek', 'distinct', 'skip'],
      answer: [1],
      explanation: 'flatMap maps each element to a stream and flattens those streams into one pipeline.',
      optionNotes: { '0': 'One input produces one mapped result.', '1': 'Correct.', '2': 'Diagnostic intermediate operation.', '3': 'Removes duplicates.', '4': 'Discards a prefix.' },
      verify: null,
    },
    {
      id: 'ch10-q10',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['6b'],
      tags: ['reduce'],
      question: 'Which are valid conceptual forms of Stream.reduce?',
      code: null,
      options: ['identity plus BinaryOperator', 'identity plus accumulator BiFunction', 'identity plus accumulator plus combiner', 'predicate plus supplier', 'collector plus comparator'],
      answer: [0, 1, 2],
      explanation: 'Stream has three reduce overload shapes: identity/operator, identity/accumulator, and identity/accumulator/combiner.',
      optionNotes: { '0': 'Valid two-argument form.', '1': 'Valid two-argument form.', '2': 'Valid three-argument form.', '3': 'Not reduce syntax.', '4': 'Not reduce syntax.' },
      verify: null,
    },
    {
      id: 'ch10-q11',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['6a'],
      tags: ['primitive'],
      question: 'What does IntStream.average() return?',
      code: null,
      options: ['double', 'OptionalDouble', 'OptionalInt', 'DoubleStream', 'Stream<Double>'],
      answer: [1],
      explanation: 'Average may be absent for an empty primitive stream, so it returns OptionalDouble.',
      optionNotes: { '0': 'The primitive payload is double, but the API wraps absence.', '1': 'Correct.', '2': 'Used by some int-valued terminal operations, not average.', '3': 'A stream type, not average result.', '4': 'Not the primitive API result.' },
      verify: null,
    },
    {
      id: 'ch10-q12',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['primitive'],
      question: 'Which statements about primitive streams are true?',
      code: null,
      options: ['mapToInt can avoid boxing for int calculations', 'boxed converts IntStream to Stream<Integer>', 'sum on IntStream returns int', 'average on IntStream returns OptionalInt', 'summaryStatistics reports count and sum'],
      answer: [0, 1, 2, 4],
      explanation: 'Primitive APIs avoid boxing, boxed returns Stream<Integer>, sum returns int, and summaryStatistics reports aggregate values. average returns OptionalDouble.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'average returns OptionalDouble.', '4': 'True.' },
      verify: null,
    },
    {
      id: 'ch10-q13',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['6b'],
      tags: ['collector'],
      question: 'What happens when Collectors.toMap encounters duplicate keys without a merge function?',
      code: null,
      options: ['It keeps the first value', 'It keeps the last value', 'It throws IllegalStateException', 'It silently groups values in a list', 'It returns an empty map'],
      answer: [2],
      explanation: 'The two-mapper toMap overload requires unique keys and throws IllegalStateException for duplicates.',
      optionNotes: { '0': 'No default first-value policy.', '1': 'No default last-value policy.', '2': 'Correct.', '3': 'Use groupingBy for lists.', '4': 'It fails instead.' },
      verify: null,
    },
    {
      id: 'ch10-q14',
      type: 'multi',
      difficulty: 'hard',
      objectiveIds: ['6b'],
      tags: ['collector'],
      question: 'Which collector statements are true?',
      code: null,
      options: ['groupingBy can accept a downstream collector', 'partitioningBy uses Boolean keys', 'mapping can adapt values before a downstream collector', 'teeing combines two collector results', 'joining requires numeric stream elements directly'],
      answer: [0, 1, 2, 3],
      explanation: 'The first four describe collector composition. joining works with CharSequence elements, so numeric values need mapping first.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'True.', '4': 'Numbers must be mapped to text first.' },
      verify: null,
    },
    {
      id: 'ch10-q15',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['6b'],
      tags: ['collector'],
      question: 'Which groupingBy overload selects a specific map implementation?',
      code: null,
      options: ['groupingBy(classifier)', 'groupingBy(classifier, downstream)', 'groupingBy(classifier, mapFactory, downstream)', 'partitioningBy(predicate)', 'toList(mapFactory)'],
      answer: [2],
      explanation: 'The three-argument groupingBy overload accepts classifier, map factory, and downstream collector.',
      optionNotes: { '0': 'Uses default map.', '1': 'Selects downstream, not map factory.', '2': 'Correct.', '3': 'Partitioning overload.', '4': 'No such form.' },
      verify: null,
    },
    {
      id: 'ch10-q16',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['6b'],
      tags: ['parallel'],
      question: 'Which statements about parallel streams are true?',
      code: null,
      options: ['parallel() can change a stream to parallel mode', 'forEachOrdered preserves encounter order', 'forEach guarantees encounter order', 'unordered can remove an order requirement', 'subtraction is generally safe as a parallel reduction accumulator'],
      answer: [0, 1, 3],
      explanation: 'parallel changes mode, forEachOrdered preserves order, and unordered removes an unnecessary order constraint. forEach has no order guarantee, and subtraction is not associative.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'Parallel forEach does not guarantee order.', '3': 'True.', '4': 'Non-associative subtraction is unsafe.' },
      verify: null,
    },
    {
      id: 'ch10-q17',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['6a'],
      tags: ['match'],
      question: 'What does allMatch return for an empty stream?',
      code: null,
      options: ['true', 'false', 'null', 'Optional.empty()', 'It throws'],
      answer: [0],
      explanation: 'allMatch is vacuously true for an empty stream; noneMatch is also true, while anyMatch is false.',
      optionNotes: { '0': 'Correct.', '1': 'That is anyMatch for empty input.', '2': 'The result is primitive boolean.', '3': 'Match methods do not return Optional.', '4': 'No exception.' },
      verify: null,
    },
    {
      id: 'ch10-q18',
      type: 'multi',
      difficulty: 'hard',
      objectiveIds: ['6a'],
      tags: ['optional'],
      question: 'Which statements about Optional are true?',
      code: null,
      options: ['get on empty throws NoSuchElementException', 'orElseGet can avoid creating an unused fallback', 'ofNullable(null) is empty', 'Optional is intended to replace every field type', 'OptionalInt is the same type as Optional<Integer>'],
      answer: [0, 1, 2],
      explanation: 'Empty get throws, orElseGet is lazy, and ofNullable(null) creates empty. Optional is not a universal field replacement, and primitive Optional types differ from generic Optional.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'It is primarily a return-value model.', '4': 'They have different APIs and types.' },
      verify: null,
    },
    {
      id: 'ch10-q19',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['infinite'],
      question: 'Which operation can make taking values from an infinite generated stream terminate?',
      code: null,
      options: ['sorted', 'limit', 'distinct always', 'peek alone', 'toList without a bound'],
      answer: [1],
      explanation: 'limit is short-circuiting and bounds consumption. sorted, an unbounded collect, and peek alone do not terminate the infinite source.',
      optionNotes: { '0': 'Needs all values and cannot finish.', '1': 'Correct.', '2': 'May never see a duplicate.', '3': 'Does not trigger evaluation.', '4': 'Unbounded collection cannot finish.' },
      verify: null,
    },
    {
      id: 'ch10-q20',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['intermediate'],
      question: 'Which are intermediate operations on a Stream?',
      code: null,
      options: ['map', 'flatMap', 'filter', 'distinct', 'collect'],
      answer: [0, 1, 2, 3],
      explanation: 'map, flatMap, filter, and distinct return streams and are lazy. collect is terminal.',
      optionNotes: { '0': 'Intermediate.', '1': 'Intermediate.', '2': 'Intermediate.', '3': 'Intermediate and stateful.', '4': 'Terminal collector operation.' },
      verify: null,
    },
    {
      id: 'ch10-q21',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['take-drop'],
      question: 'For an ordered stream 1, 1, 2, 0, 3, what does `dropWhile(n -> n < 2)` emit?',
      code: null,
      options: ['1, 1', '2, 0, 3', '0, 3', '2, 3', 'Nothing'],
      answer: [1],
      explanation: 'dropWhile removes the initial prefix satisfying n < 2, leaving 2, 0, and 3; it does not continue filtering later values.',
      optionNotes: { '0': 'That is the dropped prefix.', '1': 'Correct.', '2': 'It would incorrectly drop 2.', '3': 'It would incorrectly remove 0.', '4': 'The suffix is emitted.' },
      verify: null,
    },
    {
      id: 'ch10-q22',
      type: 'multi',
      difficulty: 'hard',
      objectiveIds: ['6b'],
      tags: ['reduce'],
      question: 'Which properties matter for a parallel reduction?',
      code: null,
      options: ['A valid identity', 'Associative combination', 'Compatible accumulator and combiner', 'Dependence on encounter order', 'Mutating one shared accumulator without coordination'],
      answer: [0, 1, 2],
      explanation: 'Parallel reduction needs identity and associative, compatible combination. Dependence on order and unsafe shared mutation break correctness.',
      optionNotes: { '0': 'Required for identity-based reduction.', '1': 'Required for regrouping.', '2': 'Required when combining partial results.', '3': 'Parallel execution may regroup elements.', '4': 'Unsafe shared state.' },
      verify: null,
    },
    {
      id: 'ch10-q23',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['6b'],
      tags: ['collector'],
      question: 'Which collector is appropriate for concatenating strings with a delimiter?',
      code: null,
      options: ['Collectors.counting()', 'Collectors.joining(delimiter)', 'Collectors.summingInt()', 'Collectors.partitioningBy()', 'Collectors.minBy()'],
      answer: [1],
      explanation: 'joining combines CharSequence elements with an optional delimiter, prefix, and suffix.',
      optionNotes: { '0': 'Counts values.', '1': 'Correct.', '2': 'Sums mapped numbers.', '3': 'Partitions by Boolean predicate.', '4': 'Selects a minimum.' },
      verify: null,
    },
    {
      id: 'ch10-q24',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['optional'],
      question: 'Which operations can produce an Optional result from a reference Stream?',
      code: null,
      options: ['min', 'max', 'findFirst', 'findAny', 'count'],
      answer: [0, 1, 2, 3],
      explanation: 'min, max, findFirst, and findAny return Optional for reference streams. count returns a long.',
      optionNotes: { '0': 'Returns Optional<T>.', '1': 'Returns Optional<T>.', '2': 'Returns Optional<T>.', '3': 'Returns Optional<T>.', '4': 'Returns long.' },
      verify: null,
    },
    {
      id: 'ch10-q25',
      type: 'single',
      difficulty: 'hard',
      objectiveIds: ['6b'],
      tags: ['flat-map'],
      question: 'Which result type does `Stream<String>.flatMap(s -> Stream.of(s.length()))` have?',
      code: null,
      options: ['Stream<String>', 'Stream<Integer>', 'IntStream', 'Optional<Integer>', 'Stream<Stream<Integer>>'],
      answer: [1],
      explanation: 'The mapper returns Stream<Integer>, and flatMap flattens those streams into Stream<Integer>. It does not automatically specialize to IntStream.',
      optionNotes: { '0': 'The mapped element type changes.', '1': 'Correct.', '2': 'Use mapToInt for IntStream.', '3': 'No Optional is produced.', '4': 'flatMap removes the nesting.' },
      verify: null,
    },
    {
      id: 'ch10-q26',
      type: 'multi',
      difficulty: 'hard',
      objectiveIds: ['6b'],
      tags: ['collector'],
      question: 'Which collector overload choices are valid descriptions?',
      code: null,
      options: ['toMap with a merge function handles duplicate keys', 'toMap with a map supplier chooses the result map type', 'groupingBy can use mapping downstream', 'partitioningBy can use counting downstream', 'toSet requires a key mapper'],
      answer: [0, 1, 2, 3],
      explanation: 'The first four describe collector overloads and composition. toSet simply collects elements and has no key mapper.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'True.', '4': 'No key mapper is needed.' },
      verify: null,
    },
  ],

  checklist: [
    'I can create streams from values, arrays, ranges, iterate, generate, and Files.lines.',
    'I know which stream operations are intermediate, terminal, lazy, stateful, or short-circuiting.',
    'I understand that a stream is single-use and that peek needs a terminal operation.',
    'I can use Optional of, ofNullable, empty, isPresent, ifPresent, and get safely.',
    'I can distinguish eager orElse from lazy orElseGet and use orElseThrow.',
    'I know how Optional map, filter, and flatMap transform absence and presence.',
    'I can distinguish map from flatMap when decomposing nested data.',
    'I know the three reduce overload shapes and the identity/associativity rules.',
    'I can use takeWhile and dropWhile as ordered-prefix operations.',
    'I can move between reference and primitive streams with mapToInt and boxed.',
    'I know the result types of sum, average, and summaryStatistics.',
    'I can collect into lists, sets, maps, grouped maps, and partitions.',
    'I know toMap duplicate-key behavior and how merge resolves duplicates.',
    'I can select groupingBy downstream and map-supplier overloads.',
    'I understand parallel forEach ordering, forEachOrdered, and unordered.',
    'I know why sorted on an infinite stream does not terminate.',
  ],
});
