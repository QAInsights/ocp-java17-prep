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

Primitive specializations avoid boxing: \`IntPredicate\`, \`IntSupplier\`, \`IntFunction<R>\`, \`IntUnaryOperator\`, \`IntBinaryOperator\`, \`ToIntFunction<T>\`, \`ToIntBiFunction<T,U>\`, and \`ObjIntConsumer<T>\). Similar \`Long\` and \`Double\` forms exist. \`BooleanSupplier\` supplies a primitive boolean; there is no general \`BooleanFunction\` family.

The target type determines parameter and return compatibility. \`Supplier<Integer> s = () -> 3\` boxes the result, whereas \`IntSupplier s = () -> 3\` returns a primitive. A lambda has no target type by itself and cannot be assigned to \`Object\) without first targeting a functional interface.`,
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

* \`Predicate\`: \`and\`, \`or\), and \`negate\`. They short-circuit like \`&&\) and \`||\).
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

\`comparing\` uses a reference key and may box; \`comparingInt\), \`comparingLong\), and \`comparingDouble\` avoid boxing. \`thenComparing\) breaks ties. \`reversed()\) reverses the comparator built so far, so place it carefully when only a secondary key should reverse. \`nullsFirst(c)\) and \`nullsLast(c)\` wrap a comparator to define null ordering.

Comparator comparisons should be consistent with the intended ordering. A comparator may be passed to \`List.sort\), \`Arrays.sort\), \`Stream.sorted\), \`TreeSet\), and \`TreeMap\). A \`TreeSet\) uses comparator equality (compare returns zero) to decide duplicates, not necessarily \`equals\).`,
    },
    {
      id: 'annotations-and-targets',
      title: 'Functional-interface declarations',
      md: `\`@FunctionalInterface\` is a compiler-checking annotation. It may be placed on an interface that has exactly one abstract method, including one inherited from a parent. Methods matching public \`Object\) methods do not create an additional function descriptor. Default, static, and private methods do not count.

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
