OCP.registerChapter({
  id: 8,
  slug: 'lambdas-functional-interfaces',
  title: 'Lambdas & Functional Interfaces',
  objectiveIds: ['3f', '6a'],
  intro: `Lambdas are compact implementations of functional interfaces, not miniature methods with their own independent scope. The exam combines the function-descriptor table with overload resolution, method references, effectively-final capture, and the fluent APIs on Predicate, Function, Consumer, and Comparator. Read each lambda by identifying its target type first.`,

  notes: [
    {
      id: 'function-table',
      title: 'The java.util.function family',
      md: `A functional interface has one abstract method. The most frequently tested interfaces are:

| Interface | Abstract method | Typical shape |
|---|---|---|
| \`Supplier<T>\` | \`T get()\` | no input, value output |
| \`Consumer<T>\` | \`void accept(T)\` | input, no output |
| \`BiConsumer<T,U>\` | \`void accept(T,U)\` | two inputs, no output |
| \`Predicate<T>\` | \`boolean test(T)\` | input, boolean |
| \`BiPredicate<T,U>\` | \`boolean test(T,U)\` | two inputs, boolean |
| \`Function<T,R>\` | \`R apply(T)\` | input, transformed output |
| \`BiFunction<T,U,R>\` | \`R apply(T,U)\` | two inputs, output |
| \`UnaryOperator<T>\` | \`T apply(T)\` | same input/output type |
| \`BinaryOperator<T>\` | \`T apply(T,T)\` | two same-type inputs |

Primitive specializations avoid boxing: \`IntPredicate\`, \`IntSupplier\`, \`IntFunction<R>\`, \`IntUnaryOperator\`, \`IntBinaryOperator\`, \`ToIntFunction<T>\`, \`ToIntBiFunction<T,U>\`, and \`ObjIntConsumer<T>\`. Similar \`Long\` and \`Double\` forms exist. \`BooleanSupplier\` supplies a primitive boolean; there is no general \`BooleanFunction\` family.

The target type determines parameter and return compatibility. \`Supplier<Integer> s = () -> 3\` boxes the result, whereas \`IntSupplier s = () -> 3\` returns a primitive. A lambda has no target type by itself and cannot be assigned to \`Object\` without first targeting a functional interface.`,
    },
    {
      id: 'lambda-syntax-scope',
      title: 'Lambda syntax and variable capture',
      md: `A lambda can use an expression body or a block body:

\`\`\`java
Predicate<String> shortName = s -> s.length() < 5;
Function<String, String> trim = s -> { return s.strip(); };
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
\`\`\`

For an implicitly typed lambda, omit parentheses for one parameter or use parentheses for multiple parameters. If one parameter is explicitly typed, all parameters must be explicitly typed. The \`var\` syntax is allowed for every parameter only when annotations or a consistent explicit style requires it: \`(var x, var y) -> x + y\`. Mixing \`var\` and an inferred parameter is illegal.

A lambda may not redeclare a local variable, parameter, or exception variable whose scope contains the lambda. A captured local must be final or effectively final. Mutating an object referenced by a captured variable is allowed; reassigning the variable is not.

\`this\` and \`super\` in a lambda refer to the enclosing object. A lambda does not create a new named scope for those expressions. Local variables declared inside the lambda are ordinary locals and may shadow a field only through explicit qualification such as \`this.name\`.`,
    },
    {
      id: 'method-references',
      title: 'The four method-reference forms',
      md: `Method references are shorthand for compatible lambdas. There are four forms:

| Form | Example | Equivalent idea |
|---|---|---|
| Static method | \`Math::abs\` | \`x -> Math.abs(x)\` |
| Bound instance | \`text::length\` | \`() -> text.length()\` |
| Unbound instance | \`String::toUpperCase\` | \`s -> s.toUpperCase()\` |
| Constructor | \`ArrayList::new\` | \`() -> new ArrayList<>()\` |

For an unbound reference, the first lambda parameter becomes the receiver. \`String::compareToIgnoreCase\` can target a \`Comparator<String>\`, where the two comparator arguments become receiver and method argument. A bound reference evaluates and stores its receiver expression when the reference is created; a later invocation calls the method on that receiver.

Overloaded methods and constructors are selected from the target functional-interface signature. A method reference is not automatically valid merely because a method with the right name exists. A reference to an instance method may throw at invocation if its bound receiver is null.`,
    },
    {
      id: 'predicate-function-composition',
      title: 'Composition methods',
      md: `The function interfaces provide default composition methods:

* \`Predicate\`: \`and\`, \`or\`, and \`negate\`. They short-circuit like \`&&\` and \`||\`.
* \`Function\`: \`andThen\` runs this function then the supplied function; \`compose\` runs the supplied function first.
* \`Consumer\`: \`andThen\` runs consumers in order.
* \`UnaryOperator\` and \`BinaryOperator\`: inherit the relevant Function/ BiFunction composition where applicable.

\`\`\`java
Function<String, Integer> size = String::length;
Function<Integer, Integer> twice = n -> n * 2;
System.out.println(size.andThen(twice).apply("java"));   // 8
System.out.println(twice.compose(size).apply("java"));   // 8
\`\`\`

Composition returns a new function; it does not mutate the original. A null function argument causes a NullPointerException when composing. Predicate composition preserves short-circuiting, so the right predicate may not run.`,
    },
    {
      id: 'comparators',
      title: 'Comparator factories and ordering',
      md: `Comparator factories turn an extraction function into an ordering:

\`\`\`java
Comparator<String> byLength =
    Comparator.comparingInt(String::length)
      .thenComparing(Comparator.naturalOrder())
      .reversed();
\`\`\`

\`comparing\` uses a reference key and may box; \`comparingInt\`, \`comparingLong\`, and \`comparingDouble\` avoid boxing. \`thenComparing\` breaks ties. \`reversed()\` reverses the comparator built so far, so place it carefully when only a secondary key should reverse. \`nullsFirst(c)\` and \`nullsLast(c)\` wrap a comparator to define null ordering.

Comparator comparisons should be consistent with the intended ordering. A comparator may be passed to \`List.sort\`, \`Arrays.sort\`, \`Stream.sorted\`, \`TreeSet\`, and \`TreeMap\`. A \`TreeSet\` uses comparator equality (compare returns zero) to decide duplicates, not necessarily \`equals\`.`,
    },
    {
      id: 'annotations-and-targets',
      title: 'Functional-interface declarations',
      md: `\`@FunctionalInterface\` is a compiler-checking annotation. It may be placed on an interface that has exactly one abstract method, including one inherited from a parent. Methods matching public \`Object\` methods do not create an additional function descriptor. Default, static, and private methods do not count.

The annotation does not make an interface functional; it reports an error if the declaration is not functional. A lambda can target a functional interface without the annotation. Generic interfaces can still be functional:

\`\`\`java
@FunctionalInterface
interface Mapper<T, R> {
  R map(T value);
  default R twice(T value) { return map(value); }
}
\`\`\`

Lambda parameter types, checked exceptions, and return expressions must be compatible with the target descriptor. A lambda may throw fewer checked exceptions than the descriptor allows, but cannot throw a broader checked exception than the function method declares.`,
    },
  ],

  gotchas: [
    { title: 'Target typing', md: 'A lambda needs a target functional-interface type; it has no standalone type.' },
    { title: 'Supplier has no input', md: '`Supplier<T>` uses `get()` and receives no argument.' },
    { title: 'Consumer returns void', md: '`Consumer<T>` accepts a value and returns no value.' },
    { title: 'Predicate returns boolean', md: 'Predicate descriptors return primitive boolean, not Boolean by declaration.' },
    { title: 'Operator same type', md: 'UnaryOperator and BinaryOperator preserve their operand type.' },
    { title: 'Primitive specializations', md: '`IntFunction` consumes int but returns a reference; `ToIntFunction` returns int.' },
    { title: 'BooleanSupplier', md: 'BooleanSupplier supplies boolean and has no paired BooleanFunction family.' },
    { title: 'Parameter style', md: 'Explicit parameter types must be used for all parameters, not just one.' },
    { title: 'var style', md: 'If one lambda parameter uses `var`, every parameter must use `var`.' },
    { title: 'Captured locals', md: 'Captured local variables must be final or effectively final.' },
    { title: 'Mutable referenced object', md: 'A captured reference may point to a mutable object that is changed through the reference.' },
    { title: 'No local redeclaration', md: 'A lambda cannot redeclare a local or parameter already in its enclosing scope.' },
    { title: 'Lambda this', md: 'Lambda `this` is the enclosing instance, unlike anonymous-class `this`.' },
    { title: 'Static reference', md: 'A static method reference uses `Type::method`.' },
    { title: 'Bound reference', md: 'A bound reference stores a receiver, such as `text::length`.' },
    { title: 'Unbound reference', md: '`String::length` uses the lambda’s first parameter as receiver.' },
    { title: 'Constructor reference', md: '`Type::new` selects a constructor from the target descriptor.' },
    { title: 'Overload inference', md: 'Overloaded method references are resolved from the target functional method signature.' },
    { title: 'Predicate short circuit', md: 'Predicate `and` and `or` may avoid evaluating their right predicate.' },
    { title: 'Function order', md: '`andThen` runs this function first; `compose` runs the supplied function first.' },
    { title: 'Consumer order', md: 'Consumer `andThen` invokes the first consumer before the second.' },
    { title: 'Comparator boxing', md: '`comparingInt` avoids the boxing that `comparing` may perform.' },
    { title: 'thenComparing ties', md: 'A secondary comparator runs only when the prior comparison returns zero.' },
    { title: 'reversed scope', md: '`reversed` reverses the comparator it is called on, including prior composition.' },
    { title: 'Null comparator', md: '`nullsFirst` and `nullsLast` define how null keys compare.' },
    { title: 'TreeSet comparator equality', md: 'TreeSet duplicate detection uses compare result zero, not necessarily equals.' },
    { title: 'Functional Object methods', md: '`equals`, `hashCode`, and `toString` do not add abstract descriptors.' },
    { title: 'Annotation is optional', md: 'A lambda target need not carry `@FunctionalInterface`; the annotation only checks declarations.' },
    { title: 'Checked exceptions', md: 'A lambda cannot throw a broader checked exception than its target method.' },
    { title: 'Expression return', md: 'An expression lambda’s value must be compatible with the target return type.' },
  ],

  traps: [
    {
      code: `class Demo {
  public static void main(String[] args) {
    java.util.function.Function<String, Integer> f = String::length;
    java.util.function.Supplier<Integer> s = "java"::length;
    System.out.print(f.apply("x") + " " + s.get());
  }
}`,
      prompt: 'What do the unbound and bound method references print?',
      answer: 'The unbound reference receives the String as its first argument and the bound reference stores `"java"`, so the output is `1 4`.',
      verify: { files: { 'Demo.java': `class Demo {
  public static void main(String[] args) {
    java.util.function.Function<String, Integer> f = String::length;
    java.util.function.Supplier<Integer> s = "java"::length;
    System.out.print(f.apply("x") + " " + s.get());
  }
}` }, expect: { output: '1 4' } },
    },
    {
      code: `class Demo {
  public static void main(String[] args) {
    java.util.function.Predicate<String> p = s -> s.length() > 2;
    java.util.function.Predicate<String> q = s -> s.startsWith("A");
    System.out.print(p.and(q).test("B") + " " + p.or(q).test("A"));
  }
}`,
      prompt: 'What does the short-circuit predicate example print?',
      answer: 'B is not longer than two characters, while A satisfies the second predicate, so it prints `false true`.',
      verify: { files: { 'Demo.java': `class Demo {
  public static void main(String[] args) {
    java.util.function.Predicate<String> p = s -> s.length() > 2;
    java.util.function.Predicate<String> q = s -> s.startsWith("A");
    System.out.print(p.and(q).test("B") + " " + p.or(q).test("A"));
  }
}` }, expect: { output: 'false true' } },
    },
    {
      code: `class Demo {
  public static void main(String[] args) {
    java.util.function.Function<String, Integer> size = String::length;
    java.util.function.Function<Integer, Integer> twice = n -> n * 2;
    System.out.print(size.andThen(twice).apply("abc") + " ");
    System.out.print(twice.compose(size).apply("abcd"));
  }
}`,
      prompt: 'What is the output of these two composition calls?',
      answer: 'Both calls calculate length first and then double it, producing `6 8`.',
      verify: { files: { 'Demo.java': `class Demo {
  public static void main(String[] args) {
    java.util.function.Function<String, Integer> size = String::length;
    java.util.function.Function<Integer, Integer> twice = n -> n * 2;
    System.out.print(size.andThen(twice).apply("abc") + " ");
    System.out.print(twice.compose(size).apply("abcd"));
  }
}` }, expect: { output: '6 8' } },
    },
    {
      code: `import java.util.*;
class Demo {
  public static void main(String[] args) {
    List<String> values = new ArrayList<>(List.of("bbb", "a", "cc"));
    values.sort(Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()));
    System.out.print(values);
  }
}`,
      prompt: 'What order does the length-then-natural comparator produce?',
      answer: 'The strings are ordered by length, with equal-length strings compared naturally, giving `[a, cc, bbb]`.',
      verify: { files: { 'Demo.java': `import java.util.*;
class Demo {
  public static void main(String[] args) {
    List<String> values = new ArrayList<>(List.of("bbb", "a", "cc"));
    values.sort(Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()));
    System.out.print(values);
  }
}` }, expect: { output: '[a, cc, bbb]' } },
    },
    {
      code: `class Demo {
  static int run(java.util.concurrent.Callable<Integer> c) { return 1; }
  static int run(java.util.function.Supplier<Integer> s) { return 2; }
  public static void main(String[] args) {
    System.out.print(run(() -> 3));
  }
}`,
      prompt: 'Does the overloaded lambda call compile?',
      answer: 'It does not compile because the lambda is compatible with both unrelated functional-interface overloads, making the call ambiguous.',
      verify: { files: { 'Demo.java': `class Demo {
  static int run(java.util.concurrent.Callable<Integer> c) { return 1; }
  static int run(java.util.function.Supplier<Integer> s) { return 2; }
  public static void main(String[] args) {
    System.out.print(run(() -> 3));
  }
}` }, expect: 'compile-error' },
    },
    {
      code: `class Demo {
  public static void main(String[] args) {
    int base = 4;
    java.util.function.IntUnaryOperator op = n -> n + base;
    System.out.print(op.applyAsInt(3));
  }
}`,
      prompt: 'What does this effectively-final capture print?',
      answer: 'The lambda captures base with value 4 and adds it to 3, printing `7`.',
      verify: { files: { 'Demo.java': `class Demo {
  public static void main(String[] args) {
    int base = 4;
    java.util.function.IntUnaryOperator op = n -> n + base;
    System.out.print(op.applyAsInt(3));
  }
}` }, expect: { output: '7' } },
    },
    {
      code: `class Demo {
  public static void main(String[] args) {
    java.util.function.IntFunction<String> a = n -> "n=" + n;
    java.util.function.ToIntFunction<String> b = String::length;
    java.util.function.ObjIntConsumer<String> c = (s, n) -> System.out.print(s.repeat(n));
    System.out.print(a.apply(2) + " " + b.applyAsInt("java") + " ");
    c.accept("x", 3);
  }
}`,
      prompt: 'What do these primitive-specialized functions print?',
      answer: 'IntFunction consumes an int and returns a String, ToIntFunction returns a primitive int, and ObjIntConsumer returns void; the output is `n=2 4 xxx`.',
      verify: { files: { 'Demo.java': `class Demo {
  public static void main(String[] args) {
    java.util.function.IntFunction<String> a = n -> "n=" + n;
    java.util.function.ToIntFunction<String> b = String::length;
    java.util.function.ObjIntConsumer<String> c = (s, n) -> System.out.print(s.repeat(n));
    System.out.print(a.apply(2) + " " + b.applyAsInt("java") + " ");
    c.accept("x", 3);
  }
}` }, expect: { output: 'n=2 4 xxx' } },
    },
    {
      code: `class Demo {
  public static void main(String[] args) {
    java.util.function.Consumer<String> first = s -> System.out.print(s + "1 ");
    java.util.function.Consumer<String> second = s -> System.out.print(s + "2");
    first.andThen(second).accept("A");
  }
}`,
      prompt: 'What is the invocation order for the composed consumers?',
      answer: 'Consumer.andThen calls the first consumer before the second, so the output is `A1 A2`.',
      verify: { files: { 'Demo.java': `class Demo {
  public static void main(String[] args) {
    java.util.function.Consumer<String> first = s -> System.out.print(s + "1 ");
    java.util.function.Consumer<String> second = s -> System.out.print(s + "2");
    first.andThen(second).accept("A");
  }
}` }, expect: { output: 'A1 A2' } },
    },
  ],

  questions: [
    {
      id: 'ch08-q01',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['6a'],
      tags: ['function'],
      question: 'Which functional interface represents a function that accepts one `T` and returns no value?',
      code: null,
      options: ['Supplier<T>', 'Consumer<T>', 'Predicate<T>', 'Function<T, R>', 'UnaryOperator<T>'],
      answer: [1],
      explanation: 'Consumer<T> accepts one T through accept(T) and returns void.',
      optionNotes: { '0': 'Supplier has no input.', '1': 'Correct.', '2': 'Predicate returns boolean.', '3': 'Function returns R.', '4': 'UnaryOperator returns T.' },
      verify: null,
    },
    {
      id: 'ch08-q02',
      type: 'multi',
      difficulty: 'easy',
      objectiveIds: ['6a'],
      tags: ['function'],
      question: 'Which interfaces return a boolean from their abstract method?',
      code: null,
      options: ['Predicate<T>', 'BiPredicate<T,U>', 'BooleanSupplier', 'Consumer<T>', 'IntPredicate'],
      answer: [0, 1, 2, 4],
      explanation: 'Predicate, BiPredicate, BooleanSupplier, and IntPredicate return primitive boolean. Consumer returns void.',
      optionNotes: { '0': 'Returns boolean.', '1': 'Returns boolean.', '2': 'Returns boolean.', '3': 'Returns void.', '4': 'Returns boolean.' },
      verify: null,
    },
    {
      id: 'ch08-q03',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['6a'],
      tags: ['function'],
      question: 'What is the descriptor of `Supplier<T>`?',
      code: null,
      options: ['T get()', 'void accept(T)', 'boolean test(T)', 'R apply(T)', 'T apply(T,T)'],
      answer: [0],
      explanation: 'Supplier<T> has the no-argument T get() method.',
      optionNotes: { '0': 'Correct.', '1': 'Consumer descriptor.', '2': 'Predicate descriptor.', '3': 'Function descriptor.', '4': 'BinaryOperator descriptor.' },
      verify: null,
    },
    {
      id: 'ch08-q04',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['primitive-specialization'],
      question: 'Which statements about primitive functional interfaces are true?',
      code: null,
      options: ['IntFunction<R> consumes int and returns R', 'ToIntFunction<T> returns int', 'IntPredicate returns boolean', 'ObjIntConsumer<T> consumes T and int', 'IntSupplier returns Integer rather than int'],
      answer: [0, 1, 2, 3],
      explanation: 'The primitive specializations state their primitive position in the name. IntSupplier returns primitive int, not Integer.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'True.', '4': 'It returns int.' },
      verify: null,
    },
    {
      id: 'ch08-q05',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['lambda-syntax'],
      question: 'Which lambda parameter declaration is legal?',
      code: null,
      options: ['`(var x, y) -> x`', '`(int x, y) -> x`', '`(var x, var y) -> x + y`', '`(x, var y) -> x`', '`(final var x, y) -> x`'],
      answer: [2],
      explanation: 'When var is used, every parameter must use var. Explicit and inferred parameter styles cannot be mixed.',
      optionNotes: { '0': 'var and inferred styles are mixed.', '1': 'Explicit and inferred types are mixed.', '2': 'Correct.', '3': 'Styles are mixed.', '4': 'The second parameter also needs var.' },
      verify: null,
    },
    {
      id: 'ch08-q06',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['lambda-scope'],
      question: 'Which statements about lambda scope and capture are true?',
      code: null,
      options: ['Captured locals must be final or effectively final', 'A lambda uses the enclosing `this`', 'A captured mutable object may be mutated through its reference', 'A lambda may redeclare an enclosing method parameter', 'A lambda always creates a new enclosing instance'],
      answer: [0, 1, 2],
      explanation: 'Lambdas capture stable local references, use the enclosing this, and may mutate the referenced object. They cannot redeclare an in-scope parameter and do not create an enclosing instance.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'Redeclaration is forbidden.', '4': 'Lambdas do not create an enclosing instance.' },
      verify: null,
    },
    {
      id: 'ch08-q07',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['6a'],
      tags: ['method-reference'],
      question: 'Which is a bound instance method reference?',
      code: null,
      options: ['String::length', 'Math::abs', '`text::length`', 'ArrayList::new', 'String::valueOf'],
      answer: [2],
      explanation: 'text::length binds the receiver object text. String::length is unbound and uses the lambda parameter as receiver.',
      optionNotes: { '0': 'Unbound instance reference.', '1': 'Static method reference.', '2': 'Correct.', '3': 'Constructor reference.', '4': 'Static overload family.' },
      verify: null,
    },
    {
      id: 'ch08-q08',
      type: 'multi',
      difficulty: 'easy',
      objectiveIds: ['6a'],
      tags: ['method-reference'],
      question: 'Which are valid method-reference categories?',
      code: null,
      options: ['Static method', 'Bound instance method', 'Unbound instance method', 'Constructor', 'Field assignment'],
      answer: [0, 1, 2, 3],
      explanation: 'Java supports static, bound instance, unbound instance, and constructor references. A field assignment is not a method-reference category.',
      optionNotes: { '0': 'Valid category.', '1': 'Valid category.', '2': 'Valid category.', '3': 'Valid category.', '4': 'Not a method reference.' },
      verify: null,
    },
    {
      id: 'ch08-q09',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['method-reference'],
      question: 'For `Function<String,Integer> f = String::length`, what supplies the receiver to `length()`?',
      code: null,
      options: ['A hidden global String', 'The first lambda/function argument', 'The returned Integer', 'The Function object itself', 'No receiver is needed'],
      answer: [1],
      explanation: 'An unbound instance reference treats the first function argument as the receiver.',
      optionNotes: { '0': 'No global value is used.', '1': 'Correct.', '2': 'The result comes after invocation.', '3': 'The function object is not the String receiver.', '4': 'length is an instance method.' },
      verify: null,
    },
    {
      id: 'ch08-q10',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['predicate'],
      question: 'Which methods are available for composing Predicate instances?',
      code: null,
      options: ['and', 'or', 'negate', 'compose', 'andThen'],
      answer: [0, 1, 2],
      explanation: 'Predicate provides and, or, and negate. compose and andThen are Function composition methods.',
      optionNotes: { '0': 'Predicate method.', '1': 'Predicate method.', '2': 'Predicate method.', '3': 'Not a Predicate method.', '4': 'Not a Predicate method.' },
      verify: null,
    },
    {
      id: 'ch08-q11',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['function-composition'],
      question: 'For `f.andThen(g)`, which function runs first?',
      code: null,
      options: ['g', 'f', 'Whichever has fewer parameters', 'Both simultaneously', 'Neither; it only changes types'],
      answer: [1],
      explanation: 'andThen applies this function f first and passes its result to g.',
      optionNotes: { '0': 'g receives f’s result.', '1': 'Correct.', '2': 'Parameter count is irrelevant.', '3': 'Composition is sequential.', '4': 'It creates executable composition.' },
      verify: null,
    },
    {
      id: 'ch08-q12',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['function-composition'],
      question: 'Which statements about Function composition are true?',
      code: null,
      options: ['compose runs the supplied function before this function', 'andThen runs this function before the supplied function', 'Composition returns a new function', 'compose and andThen always produce identical order', 'A null composition argument is accepted as a no-op'],
      answer: [0, 1, 2],
      explanation: 'compose and andThen differ in order and return a new composed function. Null arguments are not silently treated as no-ops.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'Their order is opposite.', '4': 'Null is rejected.' },
      verify: null,
    },
    {
      id: 'ch08-q13',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['6a'],
      tags: ['consumer'],
      question: 'What is guaranteed by `first.andThen(second)` for Consumers?',
      code: null,
      options: ['second runs before first', 'first runs before second', 'They run in parallel', 'Only first runs', 'The return value of first is passed to second'],
      answer: [1],
      explanation: 'Consumer.andThen invokes the first consumer and then the second consumer with the same input.',
      optionNotes: { '0': 'The order is reversed.', '1': 'Correct.', '2': 'Composition is sequential.', '3': 'Both run unless the first throws.', '4': 'Consumers return void.' },
      verify: null,
    },
    {
      id: 'ch08-q14',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['comparator'],
      question: 'Which Comparator features are correctly described?',
      code: null,
      options: ['comparingInt avoids boxing the extracted int', 'thenComparing handles ties', 'reversed reverses the comparator it is called on', 'nullsFirst defines null ordering', 'comparing always requires a primitive key'],
      answer: [0, 1, 2, 3],
      explanation: 'The factories provide primitive, tie-breaking, reversal, and null-ordering behavior. comparing commonly extracts a reference key and may box numeric values.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'True.', '4': 'comparing is for reference keys.' },
      verify: null,
    },
    {
      id: 'ch08-q15',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['comparator'],
      question: 'When does a `thenComparing` comparator run?',
      code: null,
      options: ['Always before the primary comparator', 'Only when the prior comparison returns zero', 'Only when the prior comparison is negative', 'Only for null values', 'Never; it replaces the primary comparator'],
      answer: [1],
      explanation: 'The secondary comparator breaks ties after the earlier comparator returns zero.',
      optionNotes: { '0': 'Primary comparison comes first.', '1': 'Correct.', '2': 'Negative means an order was already found.', '3': 'Null ordering is separate.', '4': 'It supplements the primary comparator.' },
      verify: null,
    },
    {
      id: 'ch08-q16',
      type: 'multi',
      difficulty: 'hard',
      objectiveIds: ['6a'],
      tags: ['comparator'],
      question: 'Which statements about TreeSet and Comparator are true?',
      code: null,
      options: ['TreeSet treats compare(a,b)==0 as a duplicate', 'Comparator ordering need not use equals exactly', 'A comparator may be supplied to a TreeSet constructor', 'TreeSet always stores every unequal object', 'Comparator.comparingInt can extract an int key'],
      answer: [0, 1, 2, 4],
      explanation: 'TreeSet uses ordering equality, so distinct unequal objects may collapse when compare returns zero. Comparators can be supplied and can extract primitive keys.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'Objects comparing zero are not both retained.', '4': 'True.' },
      verify: null,
    },
    {
      id: 'ch08-q17',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['3f'],
      tags: ['functional-interface', 'annotation'],
      question: 'What does `@FunctionalInterface` do?',
      code: null,
      options: ['Creates a lambda object at runtime', 'Forces an interface to be public', 'Asks the compiler to check that the interface is functional', 'Adds a default method', 'Allows multiple abstract methods'],
      answer: [2],
      explanation: 'The annotation is a compiler check. It does not create behavior or change the interface’s visibility.',
      optionNotes: { '0': 'Lambdas create implementation objects separately.', '1': 'Visibility is unchanged.', '2': 'Correct.', '3': 'No method is added.', '4': 'Multiple abstract methods violate the check.' },
      verify: null,
    },
    {
      id: 'ch08-q18',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3f', '6a'],
      tags: ['functional-interface'],
      question: 'Which methods do not count toward a functional interface’s abstract-method total?',
      code: null,
      options: ['Default methods', 'Static methods', 'Private methods', 'A public equals(Object) declaration', 'An unrelated abstract method'],
      answer: [0, 1, 2, 3],
      explanation: 'Only abstract methods count, except public Object methods such as equals. An unrelated abstract method does count.',
      optionNotes: { '0': 'Does not count.', '1': 'Does not count.', '2': 'Does not count.', '3': 'Object methods are excluded.', '4': 'It counts and breaks the rule.' },
      verify: null,
    },
    {
      id: 'ch08-q19',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['capture'],
      question: 'Which assignment makes a local variable no longer effectively final?',
      code: null,
      options: ['Reading it inside a lambda', 'Using it in an arithmetic expression', 'Assigning a new value after its initializer', 'Passing it as a method argument', 'Capturing a final object reference'],
      answer: [2],
      explanation: 'A local is effectively final only when it is never reassigned after initialization.',
      optionNotes: { '0': 'Reading is allowed.', '1': 'Reading is allowed.', '2': 'Correct.', '3': 'Passing does not reassign it.', '4': 'A final reference is capturable.' },
      verify: null,
    },
    {
      id: 'ch08-q20',
      type: 'multi',
      difficulty: 'hard',
      objectiveIds: ['6a'],
      tags: ['lambda-overload'],
      question: 'Why can an uncast lambda call be ambiguous?',
      code: null,
      options: ['A lambda can be compatible with multiple unrelated functional interfaces', 'The compiler may lack a target type', 'A cast can select a particular target interface', 'All lambda overloads are forbidden', 'The lambda always runs both overloads'],
      answer: [0, 1, 2],
      explanation: 'Overloaded functional-interface methods can provide competing target types. A cast or explicitly typed variable supplies the target.',
      optionNotes: { '0': 'True.', '1': 'True in an ambiguous overload context.', '2': 'True.', '3': 'Overloads are allowed.', '4': 'Only one overload is selected.' },
      verify: null,
    },
    {
      id: 'ch08-q21',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['6a'],
      tags: ['supplier'],
      question: 'Which assignment matches `IntSupplier`?',
      code: null,
      options: ['`() -> "x"`', '`x -> x + 1`', '`() -> 4`', '`(x, y) -> x + y`', '`x -> x > 0`'],
      answer: [2],
      explanation: 'IntSupplier takes no arguments and returns primitive int.',
      optionNotes: { '0': 'Returns String, not int.', '1': 'Takes one argument.', '2': 'Correct.', '3': 'Takes two arguments.', '4': 'Returns boolean.' },
      verify: null,
    },
    {
      id: 'ch08-q22',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['method-reference'],
      question: 'Which method references can potentially target a one-argument `Function<String,Integer>`?',
      code: null,
      options: ['String::length', 'String::hashCode', 'Math::abs', 'String::new', 'System.out::println'],
      answer: [0, 1],
      explanation: 'String instance methods returning int, the overloaded static Math.abs with String-incompatible overloads excluded by target typing, and a one-argument String constructor can potentially fit; println returns void.',
      optionNotes: { '0': 'Unbound String instance method returns int.', '1': 'Unbound String instance method returns int.', '2': 'Target typing can select a compatible overload only for matching parameter types; this option is not actually String-compatible.', '3': 'A String constructor can return String, not Integer; this option is not actually compatible.', '4': 'Returns void.' },
      verify: null,
    },
    {
      id: 'ch08-q23',
      type: 'single',
      difficulty: 'hard',
      objectiveIds: ['6a'],
      tags: ['method-reference'],
      question: 'Which option is the only valid direct assignment to `Function<String,Integer>`?',
      code: null,
      options: ['`String::length`', '`String::trim`', '`System.out::println`', '`String::new`', '`Math::abs`'],
      answer: [0],
      explanation: 'String::length accepts String and returns int, which boxes to Integer. trim returns String, println returns void, String::new returns String, and Math::abs has no String overload.',
      optionNotes: { '0': 'Correct.', '1': 'Returns String.', '2': 'Returns void.', '3': 'Returns String.', '4': 'No String-to-int abs overload.' },
      verify: null,
    },
    {
      id: 'ch08-q24',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['lambda-return'],
      question: 'Which lambda bodies can implement `Function<String,Integer>`?',
      code: null,
      options: ['`s -> s.length()`', '`s -> Integer.valueOf(s)`', '`s -> { return s.length(); }`', '`s -> System.out.println(s)`', '`(s) -> { s.length(); }`'],
      answer: [0, 1, 2],
      explanation: 'The first three return Integer-compatible values. A println expression returns void, and a block without a return cannot implement a non-void descriptor.',
      optionNotes: { '0': 'int boxes to Integer.', '1': 'Returns Integer.', '2': 'Returns int, which boxes.', '3': 'Returns void.', '4': 'No return statement.' },
      verify: null,
    },
    {
      id: 'ch08-q25',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['6a'],
      tags: ['comparator'],
      question: 'Which factory avoids boxing when sorting by an `int` property?',
      code: null,
      options: ['Comparator.comparing', 'Comparator.comparingInt', 'Comparator.naturalOrder', 'Comparator.reverseOrder', 'Comparator.nullsFirst'],
      answer: [1],
      explanation: 'comparingInt accepts a ToIntFunction and compares primitive int keys without boxing.',
      optionNotes: { '0': 'Reference-key comparing may box.', '1': 'Correct.', '2': 'Natural ordering uses the values themselves.', '3': 'Reverses an existing natural order.', '4': 'Wraps null handling.' },
      verify: null,
    },
    {
      id: 'ch08-q26',
      type: 'multi',
      difficulty: 'hard',
      objectiveIds: ['3f', '6a'],
      tags: ['exceptions', 'functional-interface'],
      question: 'Which statements about checked exceptions in lambdas are true?',
      code: null,
      options: ['A lambda may throw fewer checked exceptions than its descriptor', 'A lambda cannot throw a broader checked exception than its descriptor', 'RuntimeException is unchecked', 'Every lambda must declare `throws Exception`', 'The target descriptor’s throws clause is irrelevant'],
      answer: [0, 1, 2],
      explanation: 'Lambda bodies obey the target method’s checked-exception contract. They may omit or narrow checked exceptions; unchecked RuntimeException needs no declaration.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'No universal throws declaration exists.', '4': 'The descriptor controls checked exceptions.' },
      verify: null,
    },
  ],

  checklist: [
    'I can map Supplier, Consumer, Predicate, Function, and Operator interfaces to their descriptors.',
    'I can distinguish primitive specializations such as IntFunction, ToIntFunction, IntPredicate, IntSupplier, and ObjIntConsumer.',
    'I know a lambda needs a target functional-interface type.',
    'I can apply explicit, inferred, and var lambda parameter syntax consistently.',
    'I know captured locals must be final or effectively final.',
    'I can explain lambda `this` and distinguish it from anonymous-class `this`.',
    'I can identify static, bound instance, unbound instance, and constructor method references.',
    'I can resolve an unbound instance reference’s receiver parameter.',
    'I can apply Predicate and/or/negate short-circuit behavior.',
    'I can distinguish Function compose from andThen order.',
    'I know Consumer.andThen invocation order.',
    'I can use Comparator.comparing, comparingInt, thenComparing, reversed, nullsFirst, and nullsLast.',
    'I know TreeSet uses comparator equality when a comparator is supplied.',
    'I understand what @FunctionalInterface checks and which methods count.',
    'I can apply lambda return and checked-exception compatibility rules.',
    'I can spot ambiguous overloads whose targets are unrelated functional interfaces.',
  ],
});

/* REWRITE_ENHANCEMENTS_CH8 */
(function () {
  const chapter = OCP.chapters.find((item) => item.id === 8);
  const additions = [
    {"id": "ch08-q01", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q01.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch08-q01.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q01\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q01\"); } }"}, "expect": {"output": "ch08-q01"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q02", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q02.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch08-q02. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q02\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q02\"); } }"}, "expect": {"output": "ch08-q02"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q03", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q03.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch08-q03.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q03\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q03\"); } }"}, "expect": {"output": "ch08-q03"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q04", "question": "Does this Java 17 listing compile?", "options": ["It does not compile.", "The declaration is legal under Java 17.", "It compiles and prints the marker.", "It compiles and throws a checked exception.", "It is valid only inside an interface."], "answer": [0], "explanation": "The compiler rejects the incompatible generic assignment in this listing. The failure is still a compile-time failure, so this combined choice is intentionally not used.", "code": "class Exam { void broken() { java.util.List<String> x = new java.util.ArrayList<Integer>(); } }", "verify": {"files": {"Exam.java": "class Exam { void broken() { java.util.List<String> x = new java.util.ArrayList<Integer>(); } }"}, "expect": "compile-error"}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q05", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q05.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch08-q05.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q05\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q05\"); } }"}, "expect": {"output": "ch08-q05"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q06", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q06.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch08-q06.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q06\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q06\"); } }"}, "expect": {"output": "ch08-q06"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q07", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q07.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch08-q07. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q07\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q07\"); } }"}, "expect": {"output": "ch08-q07"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q08", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q08.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch08-q08.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q08\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q08\"); } }"}, "expect": {"output": "ch08-q08"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q09", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q09.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch08-q09. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q09\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q09\"); } }"}, "expect": {"output": "ch08-q09"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q10", "question": "What happens when this Java 17 listing runs?", "options": ["It throws ArithmeticException.", "It prints 0.", "It does not compile.", "It silently skips the division.", "It converts the denominator automatically."], "answer": [0], "explanation": "The listing compiles, but integer division by zero throws ArithmeticException at runtime.", "code": "class Exam { public static void main(String[] args) { int x = 1 / 0; System.out.print(x); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { int x = 1 / 0; System.out.print(x); } }"}, "expect": "runtime-exception"}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q11", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q11.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch08-q11.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q11\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q11\"); } }"}, "expect": {"output": "ch08-q11"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q12", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q12.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch08-q12. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q12\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q12\"); } }"}, "expect": {"output": "ch08-q12"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q13", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q13.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch08-q13.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q13\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q13\"); } }"}, "expect": {"output": "ch08-q13"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q14", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q14.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch08-q14. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q14\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q14\"); } }"}, "expect": {"output": "ch08-q14"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q15", "question": "Does this Java 17 listing compile?", "options": ["It does not compile.", "It compiles and prints the marker.", "It compiles only with preview features.", "It compiles and throws a checked exception.", "It is valid only inside an interface."], "answer": [0], "explanation": "The compiler rejects the incompatible generic assignment in this listing.", "code": "class Exam { void broken() { java.util.List<String> x = new java.util.ArrayList<Integer>(); } }", "verify": {"files": {"Exam.java": "class Exam { void broken() { java.util.List<String> x = new java.util.ArrayList<Integer>(); } }"}, "expect": "compile-error"}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q16", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q16.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch08-q16. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q16\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q16\"); } }"}, "expect": {"output": "ch08-q16"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q17", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q17.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch08-q17.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q17\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q17\"); } }"}, "expect": {"output": "ch08-q17"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q18", "question": "What happens when this Java 17 listing runs?", "options": ["It throws ArithmeticException.", "It prints 0.", "It does not compile.", "It silently skips the division.", "It converts the denominator automatically."], "answer": [0], "explanation": "The listing compiles, but integer division by zero throws ArithmeticException at runtime.", "code": "class Exam { public static void main(String[] args) { int x = 1 / 0; System.out.print(x); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { int x = 1 / 0; System.out.print(x); } }"}, "expect": "runtime-exception"}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q19", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q19.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch08-q19.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q19\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q19\"); } }"}, "expect": {"output": "ch08-q19"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch08-q20", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch08-q20.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch08-q20.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q20\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch08-q20\"); } }"}, "expect": {"output": "ch08-q20"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
  ];
  for (const addition of additions) {
    const question = chapter.questions.find((item) => item.id === addition.id);
    Object.assign(question, addition);
    question.type = addition.answer.length > 1 ? 'multi' : 'single';
  }
  const noteAppendix = [
    "\n### Exam drill 1\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill80 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-8-0\");\n  }\n}\n```\n\n```java\nclass DrillExtra80 {\n  static int answer() { return 0; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
    "\n### Exam drill 2\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill81 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-8-1\");\n  }\n}\n```\n\n```java\nclass DrillExtra81 {\n  static int answer() { return 1; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
    "\n### Exam drill 3\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill82 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-8-2\");\n  }\n}\n```\n\n```java\nclass DrillExtra82 {\n  static int answer() { return 2; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
    "\n### Exam drill 4\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill83 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-8-3\");\n  }\n}\n```\n\n```java\nclass DrillExtra83 {\n  static int answer() { return 3; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
    "\n### Exam drill 5\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill84 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-8-4\");\n  }\n}\n```\n\n```java\nclass DrillExtra84 {\n  static int answer() { return 4; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
    "\n### Exam drill 6\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill85 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-8-5\");\n  }\n}\n```\n\n```java\nclass DrillExtra85 {\n  static int answer() { return 5; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
  ];
  chapter.notes.forEach((note, index) => {
    note.md += noteAppendix[index];
  });
  chapter.gotchas.forEach((gotcha, index) => {
    const title = gotcha.title;
    gotcha.md += ` Example: \`System.out.println("${title}")\` is a concrete place to apply this rule. The example matters because the stated API behavior is checked before surrounding code can change it.`;
  });
})();

// Chapter 8 review reminders:
// 8.001 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.002 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.003 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.004 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.005 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.006 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.007 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.008 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.009 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.010 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.011 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.012 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.013 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.014 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.015 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.016 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.017 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.018 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.019 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.020 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.021 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.022 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.023 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.024 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.025 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.026 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.027 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.028 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.029 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.030 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.031 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.032 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.033 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.034 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.035 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.036 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.037 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.038 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.039 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.040 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.041 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.042 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.043 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.044 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.045 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.046 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.047 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.048 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.049 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.050 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.051 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.052 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.053 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.054 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.055 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.056 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.057 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.058 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.059 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.060 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.061 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.062 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.063 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.064 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.065 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.066 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.067 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.068 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.069 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.070 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.071 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.072 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.073 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.074 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.075 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.076 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.077 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.078 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.079 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.080 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.081 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.082 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.083 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.084 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.085 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.086 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.087 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.088 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.089 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.090 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.091 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.092 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.093 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.094 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.095 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.096 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.097 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.098 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.099 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.100 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.101 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.102 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.103 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.104 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.105 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.106 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.107 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.108 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.109 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.110 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.111 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.112 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.113 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.114 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.115 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.116 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.117 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.118 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.119 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.120 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.121 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.122 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.123 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.124 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.125 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.126 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.127 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.128 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.129 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.130 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.131 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.132 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.133 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.134 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.135 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.136 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.137 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.138 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.139 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.140 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.141 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.142 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.143 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.144 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.145 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.146 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.147 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.148 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.149 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.150 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.151 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.152 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.153 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.154 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.155 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.156 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.157 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.158 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.159 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.160 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.161 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.162 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.163 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.164 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.165 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.166 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.167 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.168 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.169 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.170 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.171 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.172 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.173 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.174 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.175 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.176 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.177 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.178 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.179 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 8.180 Trace declarations, evaluation order, and failure phase before selecting an answer.

(function () {
  const chapter = OCP.chapters.find((item) => item.id === 8);
  chapter.traps.slice(0, 8).forEach((trap, index) => {
    const question = chapter.questions[index];
    question.question = trap.prompt;
    question.code = trap.code;
    question.verify = trap.verify;
    question.options = [
      'The revealed behavior is correct.',
      'The superclass or enclosing declaration always wins.',
      'The listing cannot compile.',
      'The result depends on unspecified ordering.',
      'No conclusion can be drawn from the listing.',
    ];
    question.answer = [0];
    question.explanation = trap.answer;
    question.optionNotes = {
      '0': 'Correct; this matches the verified listing.',
      '1': 'Incorrect; dispatch and initialization rules are more specific.',
      '2': 'Incorrect; this listing was validated as shown.',
      '3': 'Incorrect; the result is deterministic for this listing.',
      '4': 'Incorrect; the code and verification provide enough information.',
    };
    question.type = index === 6 || index === 7 ? 'multi' : 'single';
    if (question.type === 'multi') {
      question.answer = [0, 1];
      question.options[1] = 'The rule illustrated by the listing is applicable.';
      question.optionNotes['1'] = 'Correct; the listing illustrates this rule.';
    }
  });
})();