OCP.registerChapter({
  id: 8,
  slug: 'lambdas',
  title: 'Lambdas & Functional Interfaces',
  objectiveIds: ['3f', '6a'],
  intro: `Objectives **3f** (functional interfaces, SAM rule) and **6a** (lambda expressions implementing functional interfaces, primitive and generic functional interfaces, method references). Lambdas are everywhere on the OCP 17 exam: syntax edge cases with \`var\` and parameter parentheses, effectively final variable capture rules, the built-in interfaces in \`java.util.function\`, primitive functional interfaces with their exact method names, and method reference resolution rules.`,

  notes: [
    {
      id: 'sam-rule',
      title: 'Functional interfaces and the SAM rule',
      md: `## The Single Abstract Method (SAM) rule

A **functional interface** is an interface that specifies **exactly one abstract method**.
* It can define any number of \`default\`, \`static\`, or \`private\` methods.
* Abstract methods declared in \`java.lang.Object\` (such as \`equals(Object)\`, \`toString()\`, \`hashCode()\`) **do not count** toward the single abstract method count!
  * Example: \`java.util.Comparator<T>\` declares abstract \`compare(T, T)\` and abstract \`equals(Object)\`. It is still a valid functional interface because \`equals\` is an \`Object\` method.
* **\`@FunctionalInterface\` annotation**:
  * Optional. Tells the compiler to verify that the interface meets the SAM requirement.
  * If an interface with \`@FunctionalInterface\` has 0 abstract methods or >1 abstract methods, the compiler raises an error.
  * An interface without the annotation is still a functional interface if it meets the SAM rule.`
    },
    {
      id: 'lambda-syntax',
      title: 'Lambda syntax and rules',
      md: `## General grammar

\`\`\`java
(parameters) -> { statements; return value; }
// or concise expression form:
(parameters) -> expression
\`\`\`

### Parameter list rules
1. **Parentheses \`()\`**:
   * **Optional ONLY IF**: exactly one parameter whose type is **inferred**:
     \`s -> s.length()\` ✓
   * **Required IF**:
     * 0 parameters: \`() -> 42\`
     * 2 or more parameters: \`(a, b) -> a + b\`
     * Explicit type is specified: \`(String s) -> s.length()\` (\`String s -> ...\` **fails**)
     * \`var\` is used: \`(var s) -> s.length()\` (\`var s -> ...\` **fails**)
2. **Type consistency**:
   * You cannot mix inferred types, explicit types, and \`var\`:
     * \`(var a, int b) -> ...\` ✗ (DOES NOT COMPILE)
     * \`(var a, b) -> ...\` ✗ (DOES NOT COMPILE)
     * \`(a, int b) -> ...\` ✗ (DOES NOT COMPILE)
     * \`(var a, var b) -> ...\` ✓
     * \`(int a, int b) -> ...\` ✓
     * \`(a, b) -> ...\` ✓
3. **Modifiers and annotations**:
   * Modifiers (e.g. \`final\`) and annotations (e.g. \`@NonNull\`) can **only** be added when explicit types or \`var\` are present:
     * \`(@NonNull var x) -> x.trim()\` ✓
     * \`(final String s) -> s.trim()\` ✓
     * \`(@NonNull x) -> x.trim()\` ✗ (Compile error: cannot annotate inferred type)

### Body rules
* **Expression body**: no braces, no semicolon, no \`return\` keyword:
  \`s -> s.length()\`
* **Block body**: enclosed in braces \`{}\`. Every statement requires a semicolon \`;\`. If the interface method returns a non-void value, **\`return\` is mandatory**:
  \`s -> { return s.length(); }\`
* Syntax traps:
  * \`s -> { s.length(); }\` ✗ (returns value in interface, but missing \`return\`)
  * \`s -> return s.length();\` ✗ (using \`return\` requires braces \`{}\`)
  * \`s -> { return s.length() }\` ✗ (missing semicolon after statement)`
    },
    {
      id: 'scope-and-capture',
      title: 'Variable scope, shadowing, and capture',
      md: `## Variable capture rules

Lambdas can reference variables from their enclosing scope:
1. **Static variables**: full read and write access.
2. **Instance variables (\`this.field\`)**: full read and write access.
3. **Method parameters and local variables**: can be accessed **only if \`final\` or effectively final**!
   * *Effectively final*: a variable whose value is never changed after it is initialized.
   * If a local variable is reassigned anywhere in the method (even after the lambda), it is not effectively final and cannot be used inside the lambda.
   * A lambda **cannot modify** a local variable from its enclosing scope (e.g. \`count++\` fails).

## Shadowing
* A lambda **does not create a new scope for local variable names**.
* Declaring a lambda parameter with the same name as an existing local variable in the method is a **compile-time error**:
  \`\`\`java
  int x = 10;
  Predicate<Integer> p = x -> x > 5; // DOES NOT COMPILE: variable x already defined
  \`\`\`
* A lambda parameter **can** have the same name as an instance or static field (it shadows the field).`
    },
    {
      id: 'builtin-interfaces',
      title: 'Core functional interfaces in java.util.function',
      md: `## The six primary functional interfaces

| Interface | Method Signature | Return | Arity | Common use |
|---|---|---|---|---|
| **\`Supplier<T>\`** | \`T get()\` | \`T\` | 0 | Factory, generate values |
| **\`Consumer<T>\`** | \`void accept(T t)\` | \`void\` | 1 | Print, mutate, consume |
| **\`BiConsumer<T, U>\`** | \`void accept(T t, U u)\` | \`void\` | 2 | Map entries, (key, value) |
| **\`Predicate<T>\`** | \`boolean test(T t)\` | \`boolean\` | 1 | Filtering, conditions |
| **\`BiPredicate<T, U>\`** | \`boolean test(T t, U u)\` | \`boolean\` | 2 | Matching two items |
| **\`Function<T, R>\`** | \`R apply(T t)\` | \`R\` | 1 | Transform, extract property |
| **\`BiFunction<T, U, R>\`** | \`R apply(T t, U u)\` | \`R\` | 2 | Combine two into a third |
| **\`UnaryOperator<T>\`** | \`T apply(T t)\` | \`T\` | 1 | Transform to same type |
| **\`BinaryOperator<T>\`** | \`T apply(T t1, T t2)\` | \`T\` | 2 | Reduce, aggregate same type |

* Notice: \`UnaryOperator<T>\` extends \`Function<T, T>\`.
* Notice: \`BinaryOperator<T>\` extends \`BiFunction<T, T, T>\`.

### Default methods on functional interfaces
* **\`Predicate<T>\`**: \`and(Predicate)\`, \`or(Predicate)\`, \`negate()\`, static \`isEqual(Object)\`.
* **\`Consumer<T>\`**: \`andThen(Consumer)\`.
* **\`Function<T, R>\`**: \`andThen(Function)\`, \`compose(Function)\`, static \`identity()\`.
  * Note: \`f.andThen(g)\` executes \`f\` first, then \`g\`.
  * Note: \`f.compose(g)\` executes \`g\` first, then \`f\`.`
    },
    {
      id: 'primitive-functional-interfaces',
      title: 'Primitive functional interfaces',
      md: `Java provides specialized functional interfaces for \`int\`, \`long\`, and \`double\` (and \`boolean\` for Supplier) to avoid boxing overhead.

## 1. Suppliers
* \`IntSupplier\`: \`int getAsInt()\`
* \`LongSupplier\`: \`long getAsLong()\`
* \`DoubleSupplier\`: \`double getAsDouble()\`
* \`BooleanSupplier\`: \`boolean getAsBoolean()\`
*(Notice: \`getAs...\`, NOT \`get()\`!)*

## 2. Consumers & Predicates
* \`IntConsumer\`: \`void accept(int)\`
* \`ObjIntConsumer<T>\`: \`void accept(T t, int i)\`
* \`IntPredicate\`: \`boolean test(int)\`

## 3. Functions
* **From primitive to generic**:
  * \`IntFunction<R>\`: \`R apply(int value)\`
* **From generic to primitive**:
  * \`ToIntFunction<T>\`: \`int applyAsInt(T value)\`
* **From primitive to primitive**:
  * \`IntToLongFunction\`: \`long applyAsLong(int value)\`
  * \`IntToDoubleFunction\`: \`double applyAsDouble(int value)\`
* **Operators**:
  * \`IntUnaryOperator\`: \`int applyAsInt(int operand)\`
  * \`IntBinaryOperator\`: \`int applyAsInt(int left, int right)\``
    },
    {
      id: 'method-references',
      title: 'The four kinds of method references',
      md: `A method reference (\`::\`) is a compact shorthand for a lambda that simply delegates to an existing method.

| Kind | Syntax | Lambda equivalent | Example |
|---|---|---|---|
| **Static method** | \`Class::staticMethod\` | \`(args) -> Class.staticMethod(args)\` | \`Math::round\` |
| **Bound instance method** | \`instanceRef::method\` | \`(args) -> instanceRef.method(args)\` | \`System.out::println\` |
| **Unbound instance method** | \`Class::instanceMethod\` | \`(inst, args) -> inst.method(args)\` | \`String::length\` |
| **Constructor reference** | \`Class::new\` | \`(args) -> new Class(args)\` | \`ArrayList::new\` |

### Unbound instance method reference trap
When using \`String::isEmpty\`:
* Matches \`Predicate<String>\`: \`s -> s.isEmpty()\`.
* The **first argument** passed to the lambda becomes the **calling object** on which the method is invoked!
* Example with two parameters: \`String::concat\`
  * Matches \`BiFunction<String, String, String>\`: \`(s1, s2) -> s1.concat(s2)\`.
* Example with array constructor:
  * \`int[]::new\` matches \`IntFunction<int[]>\`: \`size -> new int[size]\`.`
    }
  ],

  gotchas: [
    { title: 'Parentheses with explicit type or var', md: '`s -> s.length()` compiles, but `String s -> s.length()` and `var s -> s.length()` **do not compile**! Explicit types or `var` always require parentheses: `(String s) -> ...` or `(var s) -> ...`.' },
    { title: 'Mixing var with inferred or explicit types', md: '`(var a, int b) -> ...` and `(var a, b) -> ...` are compile errors. You must use `var` for all parameters, explicit types for all, or inferred types for all.' },
    { title: 'Block lambda return keyword', md: '`s -> { s.length(); }` does NOT compile if the interface expects a return value. A block `{}` MUST use the `return` keyword: `s -> { return s.length(); }`.' },
    { title: 'return keyword outside braces', md: '`s -> return s.length()` is a compile error. The `return` keyword is only permitted inside `{}` braces.' },
    { title: 'Effectively final variable mutation', md: 'A local variable accessed inside a lambda must be effectively final. Modifying it before, inside, or after the lambda definition causes a compile-time error.' },
    { title: 'Instance variables inside lambdas', md: 'Instance and static fields do NOT need to be effectively final. A lambda can read and mutate `this.count++` freely.' },
    { title: 'Lambda parameter name collision', md: '`int x = 0; Consumer<Integer> c = x -> ...;` fails to compile because `x` is already declared in the enclosing method scope.' },
    { title: 'Object methods in SAM', md: 'Methods like `equals(Object)`, `toString()`, and `hashCode()` that override public methods of `java.lang.Object` do not count as abstract methods for the SAM rule.' },
    { title: 'Primitive Supplier method names', md: '`IntSupplier` has `getAsInt()`, `BooleanSupplier` has `getAsBoolean()`, `DoubleSupplier` has `getAsDouble()`. There is NO `get()` method on primitive suppliers!' },
    { title: 'Primitive Function applyAsInt', md: '`ToIntFunction<T>` has `applyAsInt(T t)`, while `IntFunction<R>` has `R apply(int i)`. Watch the prefix (`To...` vs `Int...`)!' },
    { title: 'compose vs andThen order', md: '`f.andThen(g)` executes `f` then `g`. `f.compose(g)` executes `g` then `f`.' },
    { title: 'UnaryOperator vs Function', md: '`UnaryOperator<T>` is a subtype of `Function<T, T>`. Its parameter and return type must be identical.' },
    { title: 'BinaryOperator vs BiFunction', md: '`BinaryOperator<T>` is a subtype of `BiFunction<T, T, T>`. All three type parameters (two inputs and result) are identical.' },
    { title: 'Bound vs unbound method references', md: 'In `str::startsWith` (bound), `str` is the instance. In `String::isEmpty` (unbound), the first parameter passed to the functional interface is the instance on which `isEmpty()` is called.' },
    { title: 'Array constructor reference', md: '`String[]::new` takes an `int` size and returns `String[]`, matching `IntFunction<String[]>`.' }
  ],

  traps: [
    {
      code: `import java.util.function.Predicate;
public class ScopeTest {
  public static void main(String[] args) {
    int total = 0;
    Predicate<Integer> p = x -> {
      total += x;
      return total > 10;
    };
    System.out.println(p.test(5));
  }
}`,
      prompt: 'Does this code compile?',
      answer: '**Does not compile.** Local variable `total` is mutated inside the lambda body (`total += x`). Local variables accessed in a lambda must be `final` or effectively final.',
      verify: {
        files: {
          'ScopeTest.java': `import java.util.function.Predicate;
public class ScopeTest {
  public static void main(String[] args) {
    int total = 0;
    Predicate<Integer> p = x -> {
      total += x;
      return total > 10;
    };
    System.out.println(p.test(5));
  }
}`
        },
        expect: 'compile-error'
      }
    },
    {
      code: `import java.util.function.Function;
public class ComposeTest {
  public static void main(String[] args) {
    Function<Integer, Integer> doubleIt = x -> x * 2;
    Function<Integer, Integer> plusThree = x -> x + 3;
    System.out.print(doubleIt.andThen(plusThree).apply(5) + " ");
    System.out.print(doubleIt.compose(plusThree).apply(5));
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`13 16`**. For `andThen`, `doubleIt` runs first (5 * 2 = 10), then `plusThree` (10 + 3 = 13). For `compose`, `plusThree` runs first (5 + 3 = 8), then `doubleIt` (8 * 2 = 16).',
      verify: {
        files: {
          'ComposeTest.java': `import java.util.function.Function;
public class ComposeTest {
  public static void main(String[] args) {
    Function<Integer, Integer> doubleIt = x -> x * 2;
    Function<Integer, Integer> plusThree = x -> x + 3;
    System.out.print(doubleIt.andThen(plusThree).apply(5) + " ");
    System.out.print(doubleIt.compose(plusThree).apply(5));
  }
}`
        },
        expect: { output: '13 16' }
      }
    },
    {
      code: `import java.util.function.BiPredicate;
public class MethodRefTest {
  public static void main(String[] args) {
    BiPredicate<String, String> bp = String::startsWith;
    System.out.print(bp.test("Java 17", "Java"));
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`true`**. `String::startsWith` is an unbound instance method reference. The first parameter `"Java 17"` is the target object, and the second parameter `"Java"` is passed to `startsWith`.',
      verify: {
        files: {
          'MethodRefTest.java': `import java.util.function.BiPredicate;
public class MethodRefTest {
  public static void main(String[] args) {
    BiPredicate<String, String> bp = String::startsWith;
    System.out.print(bp.test("Java 17", "Java"));
  }
}`
        },
        expect: { output: 'true' }
      }
    },
    {
      code: `import java.util.function.IntSupplier;
public class PrimitiveTrap {
  public static void main(String[] args) {
    IntSupplier s = () -> 42;
    System.out.print(s.getAsInt());
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`42`**. The abstract method of `IntSupplier` is `getAsInt()`, NOT `get()`.',
      verify: {
        files: {
          'PrimitiveTrap.java': `import java.util.function.IntSupplier;
public class PrimitiveTrap {
  public static void main(String[] args) {
    IntSupplier s = () -> 42;
    System.out.print(s.getAsInt());
  }
}`
        },
        expect: { output: '42' }
      }
    },
    {
      code: `public class VarLambda {
  public static void main(String[] args) {
    java.util.function.BiFunction<Integer, Integer, Integer> f = (var a, Integer b) -> a + b;
    System.out.println(f.apply(2, 3));
  }
}`,
      prompt: 'Does this code compile?',
      answer: '**Does not compile.** You cannot mix `var` with explicit types (`Integer b`) in a lambda parameter list.',
      verify: {
        files: {
          'VarLambda.java': `public class VarLambda {
  public static void main(String[] args) {
    java.util.function.BiFunction<Integer, Integer, Integer> f = (var a, Integer b) -> a + b;
    System.out.println(f.apply(2, 3));
  }
}`
        },
        expect: 'compile-error'
      }
    },
    {
      code: `import java.util.function.Consumer;
public class FieldCapture {
  int count = 10;
  public void run() {
    Consumer<Integer> c = x -> count += x;
    c.accept(5);
    System.out.print(count);
  }
  public static void main(String[] args) {
    new FieldCapture().run();
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`15`**. The effectively final rule applies ONLY to local variables and parameters. Instance fields (such as `count`) can be read and mutated freely inside lambdas.',
      verify: {
        files: {
          'FieldCapture.java': `import java.util.function.Consumer;
public class FieldCapture {
  int count = 10;
  public void run() {
    Consumer<Integer> c = x -> count += x;
    c.accept(5);
    System.out.print(count);
  }
  public static void main(String[] args) {
    new FieldCapture().run();
  }
}`
        },
        expect: { output: '15' }
      }
    },
    {
      code: `import java.util.function.IntFunction;
public class ArrayRef {
  public static void main(String[] args) {
    IntFunction<String[]> f = String[]::new;
    String[] arr = f.apply(3);
    System.out.print(arr.length);
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`3`**. `String[]::new` is an array constructor reference matching `IntFunction<String[]>`. Calling `apply(3)` creates a `new String[3]`.',
      verify: {
        files: {
          'ArrayRef.java': `import java.util.function.IntFunction;
public class ArrayRef {
  public static void main(String[] args) {
    IntFunction<String[]> f = String[]::new;
    String[] arr = f.apply(3);
    System.out.print(arr.length);
  }
}`
        },
        expect: { output: '3' }
      }
    }
  ],

  questions: [
    {
      id: 'ch08-q01', type: 'single', difficulty: 'easy', objectiveIds: ['3f'], tags: ['sam', 'functional-interface'],
      question: 'Which of the following interfaces is a valid functional interface?',
      code: null,
      options: [
        'interface A { void run(); void walk(); }',
        'interface B { default void run() {} }',
        'interface C { void run(); boolean equals(Object obj); }',
        'interface D { static void run() {} }',
        'interface E { int x = 10; }'
      ],
      answer: [2],
      explanation: 'A functional interface must have exactly one abstract method. Abstract methods matching public methods of `java.lang.Object` (such as `equals(Object)`) do not count. Therefore, interface C has exactly one qualifying abstract method (`run()`). Interface A has two abstract methods. Interfaces B, D, and E have zero abstract methods.',
      optionNotes: {
        '0': 'Invalid: has two abstract methods.',
        '1': 'Invalid: has zero abstract methods (run is default).',
        '2': 'Correct: equals(Object) does not count, leaving exactly one abstract method.',
        '3': 'Invalid: static methods do not count as abstract methods.',
        '4': 'Invalid: has zero abstract methods.'
      },
      verify: null
    },
    {
      id: 'ch08-q02', type: 'multi', difficulty: 'medium', objectiveIds: ['6a'], tags: ['lambda-syntax', 'var'],
      question: 'Which of the following lambda expressions compile? (Choose all that apply.)',
      code: null,
      options: [
        '(var a, var b) -> a + b',
        '(var a, b) -> a + b',
        '(int a, var b) -> a + b',
        'a -> a * 2',
        '(var a) -> { return a * 2; }'
      ],
      answer: [0, 3, 4],
      explanation: 'Options 0, 3, and 4 compile. In option 0, both parameters use `var`. In option 3, single inferred parameter without parentheses is valid. In option 4, `var` with parentheses and a complete block with `return` is valid. Option 1 mixes `var` with an inferred parameter. Option 2 mixes explicit type with `var`.',
      optionNotes: {
        '0': 'Compiles: consistent use of var for all parameters.',
        '1': 'Does not compile: cannot mix var with inferred parameter.',
        '2': 'Does not compile: cannot mix explicit type with var.',
        '3': 'Compiles: single inferred parameter without parentheses.',
        '4': 'Compiles: valid block lambda with var and return.'
      },
      verify: null
    },
    {
      id: 'ch08-q03', type: 'single', difficulty: 'easy', objectiveIds: ['6a'], tags: ['builtin-interfaces', 'supplier'],
      question: 'Which functional interface from `java.util.function` takes no parameters and returns a value?',
      code: null,
      options: [
        'Consumer<T>',
        'Supplier<T>',
        'Predicate<T>',
        'Function<T, R>',
        'UnaryOperator<T>'
      ],
      answer: [1],
      explanation: '`Supplier<T>` has the single abstract method `T get()`, which accepts no parameters and returns a value of type `T`.',
      optionNotes: {
        '0': 'Consumer takes 1 parameter and returns void.',
        '1': 'Correct: Supplier takes 0 parameters and returns T.',
        '2': 'Predicate takes 1 parameter and returns boolean.',
        '3': 'Function takes 1 parameter and returns R.',
        '4': 'UnaryOperator takes 1 parameter and returns T.'
      },
      verify: null
    },
    {
      id: 'ch08-q04', type: 'single', difficulty: 'medium', objectiveIds: ['6a'], tags: ['builtin-interfaces', 'predicate'],
      question: 'What is the output?',
      code: `import java.util.function.Predicate;
public class PredicateChain {
  public static void main(String[] args) {
    Predicate<String> p1 = s -> s.length() > 3;
    Predicate<String> p2 = s -> s.startsWith("J");
    Predicate<String> combined = p1.and(p2.negate());
    System.out.print(combined.test("Java") + " ");
    System.out.print(combined.test("JavaScript") + " ");
    System.out.print(combined.test("Ruby"));
  }
}`,
      options: [
        'false false true',
        'true false true',
        'false true false',
        'true true false',
        'Compile error'
      ],
      answer: [0],
      explanation: '`combined` requires: length > 3 AND does NOT start with "J". For "Java": length 4 > 3 (true), but starts with "J" (negated is false) -> false. For "JavaScript": starts with "J" (negated is false) -> false. For "Ruby": length 4 > 3 (true) and does not start with "J" (true) -> true. Output is `false false true`.',
      optionNotes: {
        '0': 'Correct: only "Ruby" satisfies length > 3 AND !startsWith("J").',
        '1': '"Java" starts with J, so p2.negate() is false.',
        '2': 'Inverted.',
        '3': '"Java" fails the negate condition.',
        '4': 'Completely valid Predicate composition.'
      },
      verify: {
        files: {
          'PredicateChain.java': `import java.util.function.Predicate;
public class PredicateChain {
  public static void main(String[] args) {
    Predicate<String> p1 = s -> s.length() > 3;
    Predicate<String> p2 = s -> s.startsWith("J");
    Predicate<String> combined = p1.and(p2.negate());
    System.out.print(combined.test("Java") + " ");
    System.out.print(combined.test("JavaScript") + " ");
    System.out.print(combined.test("Ruby"));
  }
}`
        },
        expect: { output: 'false false true' }
      }
    },
    {
      id: 'ch08-q05', type: 'single', difficulty: 'medium', objectiveIds: ['6a'], tags: ['primitive-interfaces', 'method-names'],
      question: 'Which method is declared by `DoublePredicate`?',
      code: null,
      options: [
        'boolean test(double value)',
        'boolean test(Double value)',
        'boolean getAsBoolean(double value)',
        'double test(double value)',
        'boolean apply(double value)'
      ],
      answer: [0],
      explanation: '`DoublePredicate` takes a primitive `double` and returns a primitive `boolean`: `boolean test(double value)`.',
      optionNotes: {
        '0': 'Correct: test(double) is the abstract method.',
        '1': 'Uses boxed Double; primitive functional interfaces take primitives.',
        '2': 'getAsBoolean() is on BooleanSupplier.',
        '3': 'Predicate always returns boolean, not double.',
        '4': 'apply is for Function, not Predicate.'
      },
      verify: null
    },
    {
      id: 'ch08-q06', type: 'single', difficulty: 'hard', objectiveIds: ['6a'], tags: ['method-references', 'unbound'],
      question: 'Given `BiFunction<String, Integer, String> bf = String::substring;`, what is the lambda equivalent?',
      code: null,
      options: [
        '(str, i) -> str.substring(i)',
        '(str, i) -> String.substring(str, i)',
        '(i, str) -> str.substring(i)',
        '(str) -> str.substring()',
        'Does not compile: substring is overloaded'
      ],
      answer: [0],
      explanation: '`String::substring` here is an unbound instance method reference. The first parameter of the `BiFunction` (`String`) represents the instance on which `substring` is called, and the second parameter (`Integer`, unboxed to `int`) is passed as the argument: `(str, i) -> str.substring(i)`.',
      optionNotes: {
        '0': 'Correct: unbound method reference maps first argument to target instance.',
        '1': 'substring is an instance method, not a static method.',
        '2': 'Parameter order does not match BiFunction declaration.',
        '3': 'BiFunction takes two parameters.',
        '4': 'The compiler resolves the overload substring(int) based on BiFunction signature.'
      },
      verify: null
    },
    {
      id: 'ch08-q07', type: 'single', difficulty: 'medium', objectiveIds: ['6a'], tags: ['effectively-final', 'scope'],
      question: 'Which line in the code below prevents successful compilation?',
      code: `import java.util.function.Supplier;
public class TestScope {
  public static void main(String[] args) {
    int factor = 2;                     // line 1
    Supplier<Integer> s = () -> factor * 10; // line 2
    factor = 3;                         // line 3
    System.out.println(s.get());        // line 4
  }
}`,
      options: ['line 1', 'line 2', 'line 3', 'line 4', 'Compiles and prints 30'],
      answer: [1],
      explanation: 'Line 2 causes a compile error: "local variables referenced from a lambda expression must be final or effectively final". Even though `factor` is reassigned on line 3 (after the lambda definition), its reassignment makes `factor` not effectively final throughout the method.',
      optionNotes: {
        '0': 'Declaration of local variable is fine.',
        '1': 'Correct: compiler identifies the error at line 2 where non-effectively-final factor is captured.',
        '2': 'Reassigning factor makes it non-effectively final, causing the capture at line 2 to fail.',
        '3': 'Line 4 is not the error source.',
        '4': 'Does not compile.'
      },
      verify: {
        files: {
          'TestScope.java': `import java.util.function.Supplier;
public class TestScope {
  public static void main(String[] args) {
    int factor = 2;
    Supplier<Integer> s = () -> factor * 10;
    factor = 3;
    System.out.println(s.get());
  }
}`
        },
        expect: 'compile-error'
      }
    },
    {
      id: 'ch08-q08', type: 'single', difficulty: 'easy', objectiveIds: ['6a'], tags: ['builtin-interfaces', 'consumer'],
      question: 'What is the output?',
      code: `import java.util.function.Consumer;
public class ConsumerTest {
  public static void main(String[] args) {
    Consumer<String> c1 = s -> System.out.print(s.toLowerCase() + " ");
    Consumer<String> c2 = s -> System.out.print(s.toUpperCase() + " ");
    c1.andThen(c2).accept("Java");
  }
}`,
      options: [
        'java JAVA ',
        'JAVA java ',
        'java ',
        'JAVA ',
        'Compile error'
      ],
      answer: [0],
      explanation: '`c1.andThen(c2)` executes `c1` first (printing `"java "`), then executes `c2` with the same input `"Java"` (printing `"JAVA "`). Output is `java JAVA `.',
      optionNotes: {
        '0': 'Correct: c1 executes before c2.',
        '1': 'c1 runs first in andThen sequence.',
        '2': 'Both consumers execute.',
        '3': 'Both consumers execute.',
        '4': 'Consumer.andThen is valid Java.'
      },
      verify: {
        files: {
          'ConsumerTest.java': `import java.util.function.Consumer;
public class ConsumerTest {
  public static void main(String[] args) {
    Consumer<String> c1 = s -> System.out.print(s.toLowerCase() + " ");
    Consumer<String> c2 = s -> System.out.print(s.toUpperCase() + " ");
    c1.andThen(c2).accept("Java");
  }
}`
        },
        expect: { output: 'java JAVA ' }
      }
    },
    {
      id: 'ch08-q09', type: 'single', difficulty: 'hard', objectiveIds: ['6a'], tags: ['primitive-interfaces', 'function'],
      question: 'Which interface matches the lambda `s -> s.length()`?',
      code: null,
      options: [
        'ToIntFunction<String>',
        'IntFunction<String>',
        'Function<Integer, String>',
        'IntUnaryOperator',
        'ToLongFunction<String>'
      ],
      answer: [0],
      explanation: '`ToIntFunction<T>` takes a generic object `T` (here `String`) and returns a primitive `int`: `int applyAsInt(T value)`. In contrast, `IntFunction<String>` takes a primitive `int` and returns a `String`.',
      optionNotes: {
        '0': 'Correct: ToIntFunction<String> maps String to primitive int.',
        '1': 'IntFunction takes int and returns String.',
        '2': 'Function<Integer, String> takes Integer and returns String.',
        '3': 'IntUnaryOperator takes int and returns int.',
        '4': 'ToLongFunction returns long, not int.'
      },
      verify: null
    },
    {
      id: 'ch08-q10', type: 'single', difficulty: 'medium', objectiveIds: ['6a'], tags: ['unary-operator'],
      question: 'What is the output?',
      code: `import java.util.function.UnaryOperator;
public class UnaryTest {
  public static void main(String[] args) {
    UnaryOperator<String> op = s -> s.concat("!");
    System.out.print(op.apply("Hello"));
  }
}`,
      options: ['Hello!', 'Hello', '!Hello', 'null', 'Compile error: UnaryOperator requires two type arguments'],
      answer: [0],
      explanation: '`UnaryOperator<T>` takes a single generic type parameter because input and output types are identical (`T apply(T t)`). `op.apply("Hello")` concatenates `"!"` to `"Hello"`, printing `"Hello!"`.',
      optionNotes: {
        '0': 'Correct: prints Hello!.',
        '1': 'Concatenation took place.',
        '2': 'Appends to end.',
        '3': 'String is not null.',
        '4': 'UnaryOperator<T> takes exactly one type argument.'
      },
      verify: {
        files: {
          'UnaryTest.java': `import java.util.function.UnaryOperator;
public class UnaryTest {
  public static void main(String[] args) {
    UnaryOperator<String> op = s -> s.concat("!");
    System.out.print(op.apply("Hello"));
  }
}`
        },
        expect: { output: 'Hello!' }
      }
    },
    {
      id: 'ch08-q11', type: 'single', difficulty: 'medium', objectiveIds: ['6a'], tags: ['lambda-syntax', 'shadowing'],
      question: 'What happens when compiling this code?',
      code: `import java.util.function.Consumer;
public class ShadowTest {
  public static void main(String[] args) {
    int val = 100;
    Consumer<Integer> c = val -> System.out.println(val);
    c.accept(200);
  }
}`,
      options: [
        'Prints 200',
        'Prints 100',
        'Compile error: variable val is already defined in method main(String[])',
        'Compile error: lambda cannot access local variables',
        'Runtime exception'
      ],
      answer: [2],
      explanation: 'A lambda parameter cannot shadow an existing local variable in the enclosing scope. Because `val` is already declared in `main`, naming the lambda parameter `val` causes a compile error.',
      optionNotes: {
        '0': 'Does not compile.',
        '1': 'Does not compile.',
        '2': 'Correct: parameter name conflicts with enclosing local variable.',
        '3': 'Lambdas can access local variables, but cannot redeclare existing names.',
        '4': 'Error is caught at compile time.'
      },
      verify: {
        files: {
          'ShadowTest.java': `import java.util.function.Consumer;
public class ShadowTest {
  public static void main(String[] args) {
    int val = 100;
    Consumer<Integer> c = val -> System.out.println(val);
    c.accept(200);
  }
}`
        },
        expect: 'compile-error'
      }
    },
    {
      id: 'ch08-q12', type: 'single', difficulty: 'hard', objectiveIds: ['6a'], tags: ['method-references', 'constructor'],
      question: 'What is the output?',
      code: `import java.util.function.Function;
public class BuilderRef {
  public static void main(String[] args) {
    Function<String, StringBuilder> f = StringBuilder::new;
    StringBuilder sb = f.apply("OCP");
    sb.append(" 17");
    System.out.print(sb);
  }
}`,
      options: ['OCP 17', 'OCP', '17', 'Compile error: StringBuilder does not have matching constructor', 'Runtime exception'],
      answer: [0],
      explanation: '`Function<String, StringBuilder>` takes a `String` and returns a `StringBuilder`. `StringBuilder::new` matches the constructor `new StringBuilder(String)`. `f.apply("OCP")` creates a StringBuilder containing "OCP". Appending " 17" results in "OCP 17".',
      optionNotes: {
        '0': 'Correct: invokes new StringBuilder("OCP") then appends " 17".',
        '1': 'sb was mutated with append.',
        '2': 'Initial string is preserved.',
        '3': 'StringBuilder has a public StringBuilder(String) constructor.',
        '4': 'No exception is thrown.'
      },
      verify: {
        files: {
          'BuilderRef.java': `import java.util.function.Function;
public class BuilderRef {
  public static void main(String[] args) {
    Function<String, StringBuilder> f = StringBuilder::new;
    StringBuilder sb = f.apply("OCP");
    sb.append(" 17");
    System.out.print(sb);
  }
}`
        },
        expect: { output: 'OCP 17' }
      }
    },
    {
      id: 'ch08-q13', type: 'single', difficulty: 'medium', objectiveIds: ['6a'], tags: ['binary-operator'],
      question: 'What is the output?',
      code: `import java.util.function.BinaryOperator;
import java.util.Comparator;
public class MinMaxTest {
  public static void main(String[] args) {
    BinaryOperator<Integer> minOp = BinaryOperator.minBy(Comparator.naturalOrder());
    System.out.print(minOp.apply(15, 8) + " ");
    BinaryOperator<String> maxOp = BinaryOperator.maxBy(Comparator.naturalOrder());
    System.out.print(maxOp.apply("apple", "banana"));
  }
}`,
      options: ['8 banana', '15 apple', '8 apple', '15 banana', 'Compile error'],
      answer: [0],
      explanation: '`BinaryOperator.minBy` returns the smaller of two elements according to the comparator (min(15, 8) is 8). `BinaryOperator.maxBy` returns the larger element according to natural alphabetical order ("banana" > "apple"). Prints `8 banana`.',
      optionNotes: {
        '0': 'Correct: min of numbers is 8; max of strings is banana.',
        '1': 'Inverted.',
        '2': 'maxBy("apple", "banana") is banana.',
        '3': 'minBy(15, 8) is 8.',
        '4': 'BinaryOperator.minBy and maxBy are valid static methods.'
      },
      verify: {
        files: {
          'MinMaxTest.java': `import java.util.function.BinaryOperator;
import java.util.Comparator;
public class MinMaxTest {
  public static void main(String[] args) {
    BinaryOperator<Integer> minOp = BinaryOperator.minBy(Comparator.naturalOrder());
    System.out.print(minOp.apply(15, 8) + " ");
    BinaryOperator<String> maxOp = BinaryOperator.maxBy(Comparator.naturalOrder());
    System.out.print(maxOp.apply("apple", "banana"));
  }
}`
        },
        expect: { output: '8 banana' }
      }
    },
    {
      id: 'ch08-q14', type: 'single', difficulty: 'hard', objectiveIds: ['6a'], tags: ['primitive-interfaces', 'binary-operator'],
      question: 'What is the return type of `IntBinaryOperator.applyAsInt(int, int)`?',
      code: null,
      options: ['int', 'Integer', 'void', 'boolean', 'long'],
      answer: [0],
      explanation: '`IntBinaryOperator` operates entirely on primitives: its method signature is `int applyAsInt(int left, int right)`. It returns a primitive `int`.',
      optionNotes: {
        '0': 'Correct: returns primitive int.',
        '1': 'Does not return wrapper Integer.',
        '2': 'Does not return void.',
        '3': 'IntPredicate returns boolean.',
        '4': 'LongBinaryOperator returns long.'
      },
      verify: null
    },
    {
      id: 'ch08-q15', type: 'multi', difficulty: 'medium', objectiveIds: ['6a'], tags: ['method-references', 'kinds'],
      question: 'Which of the following method references represent static method references? (Choose all that apply.)',
      code: null,
      options: [
        'Math::max',
        'String::valueOf',
        'String::toLowerCase',
        'System.out::println',
        'Integer::parseInt'
      ],
      answer: [0, 1, 4],
      explanation: '`Math.max`, `String.valueOf`, and `Integer.parseInt` are static methods on their respective classes. `String.toLowerCase` is an instance method (unbound reference), and `System.out::println` is an instance method on a specific object (`System.out`).',
      optionNotes: {
        '0': 'Static method reference (Math.max).',
        '1': 'Static method reference (String.valueOf).',
        '2': 'Unbound instance method reference.',
        '3': 'Bound instance method reference on System.out.',
        '4': 'Static method reference (Integer.parseInt).'
      },
      verify: null
    }
  ],

  checklist: [
    'I know a functional interface has exactly one abstract method (SAM), and Object methods do not count.',
    'I know when lambda parentheses are required (0 or 2+ params, explicit types, var) and when optional (single inferred param).',
    'I know var parameters cannot be mixed with inferred or explicit types in the same lambda.',
    'I know lambda block bodies {} require semicolons and explicit return for non-void returns.',
    'I know local variables captured by lambdas must be final or effectively final, while fields do not.',
    'I know lambda parameter names cannot shadow local variables in the enclosing scope.',
    'I know the 6 core functional interfaces: Supplier, Consumer, BiConsumer, Predicate, BiPredicate, Function, BiFunction, UnaryOperator, BinaryOperator.',
    'I know the primitive suppliers: IntSupplier (getAsInt), LongSupplier (getAsLong), DoubleSupplier (getAsDouble), BooleanSupplier (getAsBoolean).',
    'I know the primitive functions: IntFunction<R> (apply) vs ToIntFunction<T> (applyAsInt).',
    'I know the 4 kinds of method references: static, bound instance, unbound instance, and constructor.',
    'I understand how unbound instance method references map the first argument to the calling object.',
    'I know the difference between Function.andThen() and Function.compose().'
  ]
});
