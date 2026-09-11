OCP.cheatsheet = [
  {
    title: 'Exam Rhythm & Mindset',
    md: 'Always ask in order: **1. Does it compile?** (check syntax, types, scopes, access modifiers, checked exceptions). **2. Does it throw a runtime exception?** (NPE, ClassCastException, IndexOutOfBounds, etc.). **3. What is the output?** Never assume code compiles.'
  },
  {
    title: 'Primitives & Literals (Ch 1)',
    md: 'Numeric literals without suffixes are `int` or `double`. Add `L` for long, `f` for float. Underscores are allowed **only between digits** (`1_000` ✓, `_1` ✗, `1_` ✗). Leading `0` means octal (`010` is 8!). `char c = 65;` compiles (constant narrowing); `c = c + 1;` fails (promotes to int).'
  },
  {
    title: 'var & Local Scope (Ch 1)',
    md: '`var` is ONLY for local variables with immediate initializers. Cannot be used for fields, parameters, return types, or initialized to `null`. `var` is a contextual identifier, not a keyword (`int var = 1;` compiles). Lone underscore `_` is illegal as an identifier.'
  },
  {
    title: 'Text Blocks (Ch 1)',
    md: 'Must start with `"""` followed by a **line terminator**. Incidental whitespace matching the leftmost non-blank character is stripped. Closing `"""` on its own line leaves a trailing `\\n`. `\\` joins lines; `\\s` preserves whitespace.'
  },
  {
    title: 'Operators & Promotion (Ch 2)',
    md: 'Unary increments (`++x` returns new; `x++` returns old). In arithmetic, `byte`, `short`, and `char` are always promoted to `int`. Compound assignments (`x += y`) include an implicit cast. `null instanceof Anything` always returns `false`.'
  },
  {
    title: 'Making Decisions & Switch (Ch 3)',
    md: 'Switch expressions with `->` require no `break` and do not fall through. A block arm in a switch expression returns a value with `yield`. When switching on enums, case labels must be **unqualified** (`case SPRING:` ✓, `case Season.SPRING:` ✗).'
  },
  {
    title: 'Strings, StringBuilder & Date-Time (Ch 4)',
    md: '`String` and `java.time` classes are **immutable**. `Period` measures date units (years, months, days); `Duration` measures time units (hours, minutes, seconds). `Instant` is UTC epoch. `Math.round(double)` returns `long`; `Math.round(float)` returns `int`.'
  },
  {
    title: 'Method Overloading & Static Context (Ch 5)',
    md: 'Overloading resolution order: **1. Exact match → 2. Widening primitive → 3. Autoboxing → 4. Varargs**. Widening never combines with boxing (`Long l = 5;` fails). Static methods called on a `null` reference execute without throwing NPE because resolution is based on the declared reference type.'
  },
  {
    title: 'Class Design & Inheritance (Ch 6)',
    md: '`super()` or `this()` must be statement 1 in constructors. Initialization order: **Parent static → Child static → Parent instance & constructor → Child instance & constructor**. Overriding requires: identical signature, covariant return, broader/equal access, narrower/fewer checked exceptions. Fields and static methods hide, never override.'
  },
  {
    title: 'Pattern Matching for instanceof (Ch 6)',
    md: 'Flow scoping: `if (o instanceof String s && s.length() > 0)` compiles; `if (o instanceof String s || s.length() > 0)` fails. Pattern match is redundant and fails to compile if the expression type is already a subtype of the pattern type.'
  },
  {
    title: 'Interfaces, Enums & Records (Ch 7)',
    md: 'Interface fields are `public static final`. Static interface methods are **not inherited**. Enum constructors are `private`. Sealed classes specify `permits`; subclasses must be `final`, `sealed`, or `non-sealed`. Records are final, extend `Record`, and cannot declare instance fields; compact constructors have no parameter list.'
  },
  {
    title: 'Lambdas & Functional Interfaces (Ch 8)',
    md: 'Functional interfaces have exactly 1 abstract method (SAM); `Object` methods do not count. Parentheses required for 0, 2+, explicit types, or `var`. Parameters and local variables captured by lambdas must be `final` or effectively final. Primitive suppliers: `IntSupplier.getAsInt()`, `BooleanSupplier.getAsBoolean()`.'
  },
  {
    title: 'Collections & Generics (Ch 9)',
    md: '`List.of()`, `Set.of()`, `Map.of()` are unmodifiable and disallow `null`. `Set.of()` and `Map.of()` throw `IllegalArgumentException` on duplicate elements/keys (`List.of()` permits duplicates). `Arrays.asList()` is fixed-size and backed by the array. Deque `push()` adds to head; `pop()` removes from head. Modern Map: `merge` and `computeIfPresent` remove the key if the remapping function returns `null`. Generics are invariant; PECS: Producer Extends, Consumer Super.'
  },
  {
    title: 'Streams (Ch 10)',
    md: 'Streams are lazy and single-use (closed after terminal operation). `IntStream.range(1, 5)` excludes 5; `rangeClosed(1, 5)` includes 5. `allMatch` on empty stream is `true`. `Collectors.groupingBy()` groups into lists; `partitioningBy()` always returns both `true` and `false` keys. `teeing()` feeds stream elements to two collectors in a single pass and merges results.'
  },
  {
    title: 'Exceptions & Localization (Ch 11)',
    md: '`finally` always runs (unless `System.exit()` occurs). Return in `finally` overrides try/catch returns. Multi-catch types must be disjoint. Try-with-resources closes in reverse declaration order before `catch`/`finally`. ResourceBundle fallback: language_country → language → default_locale → base. Logging default is `INFO`.'
  },
  {
    title: 'Modules (Ch 12)',
    md: '`exports <package>;` vs `requires <module>;`. `requires transitive` grants implied readability. `opens` allows runtime reflection. Services: `provides <Service> with <Impl>;` and `uses <Service>;`. Named modules cannot require the unnamed module. `jlink` cannot package automatic modules.'
  },
  {
    title: 'Concurrency (Ch 13)',
    md: '`Callable<V>.call()` returns `V` and throws `Exception`; `Runnable.run()` returns `void`. `t.start()` spawns thread; `t.run()` runs synchronously. `Future.get()` blocks. `volatile` provides visibility, not compound atomicity (use `AtomicInteger`). `ConcurrentHashMap` disallows `null` keys/values. `CopyOnWriteArrayList` iterators are snapshots.'
  },
  {
    title: 'I/O & NIO.2 (Ch 14)',
    md: '`Console.readPassword()` returns `char[]`. During deserialization, only the no-arg constructor of the first non-serializable superclass runs. `Path.resolve(abs)` returns `abs`. `Path.relativize()` throws if mixing relative and absolute. `getNameCount()` excludes root. `Files.lines()` must be closed in try-with-resources.'
  },
  {
    title: 'JDBC (Ch 15)',
    md: 'URLs start with `jdbc:`. Parameter bind placeholders (`?`) and `ResultSet` column indices are **1-based** (index 0 throws `SQLException`). `ResultSet` cursor starts before first row (call `rs.next()`). Reading SQL `NULL` for primitives returns `0`/`false` (check `rs.wasNull()`). Default `autoCommit` is `true`.'
  }
];
