OCP.registerChapter({
  id: 5,
  slug: 'methods',
  title: 'Methods',
  objectiveIds: ['3b', '3c', '3d', '12b'],
  intro: `Objectives **3b** (instance/static fields and methods, constructors, initializers), **3c** (overloading including varargs), **3d** (scope, \`var\`, encapsulation, immutability) and **12b** (the annotations \`@Override\`, \`@FunctionalInterface\`, \`@Deprecated\`, \`@SuppressWarnings\`, \`@SafeVarargs\`). The exam tests the *grammar* of a method declaration (modifier order, return types, varargs position), the difference between static and instance context, pass-by-value semantics, and the exact algorithm the compiler uses to pick an overload. Constructors and initialization order are covered here and extended in Chapter 6.`,

  notes: [
    {
      id: 'declaration',
      title: 'Method declaration anatomy',
      md: `\`\`\`java
public static final synchronized <T> List<T> name(final int a, String... rest) throws IOException { ... }
//  access  optional specifiers    return   name   parameters                exceptions   body
\`\`\`

* **Access modifier** (\`public\`, \`protected\`, package/default, \`private\`) and **optional specifiers** (\`static\`, \`abstract\`, \`final\`, \`synchronized\`, \`native\`, \`strictfp\`, \`default\` in interfaces) may appear in **any order**, but all must come **before the return type**. \`public void static m()\` **does not compile**.
* **Return type** is mandatory (\`void\` counts). A non-void method must return on **every** path; a \`void\` method may use bare \`return;\`. A method whose last statement is \`throw\` or an infinite loop needs no return.
* **Name** follows identifier rules (Chapter 1). Method names can be the same as the class name (legal, confusing).
* **Parameter list** – type and name for each; \`var\` is **not allowed** for parameters. Parameters may be \`final\`. The varargs parameter must be **last** and there can be **only one**.
* **Exception list** – \`throws\` (not \`throw\`), comma-separated.
* **Body** – required, unless the method is \`abstract\` or \`native\` (then a semicolon). A concrete method with only \`;\` fails; an abstract method with braces fails.

### Access modifiers, most to least restrictive

| Modifier | Same class | Same package | Subclass (other package) | Anywhere |
|---|---|---|---|---|
| \`private\` | ✓ | | | |
| (package-private) | ✓ | ✓ | | |
| \`protected\` | ✓ | ✓ | ✓ (via subclass reference) | |
| \`public\` | ✓ | ✓ | ✓ | ✓ |

\`protected\` subtlety: from a subclass in another package, you may access the member on \`this\` / a reference of the **subclass type** – **not** on a reference of the superclass type. Package-mates of the declaring class get access regardless of inheritance.

Top-level classes can only be \`public\` or package-private. There is no \`default\` keyword for access (it means something else in interfaces and switch).

### Return rules

* Returning a value from \`void\` → error; \`return;\` in a non-void method → error.
* The returned expression must be assignable to the return type: \`int m() { return 5L; }\` fails, \`long m() { return 5; }\` is fine, \`Integer m() { return 5; }\` autoboxes, \`Long m() { return 5; }\` **fails** (int cannot box to Long).
* Code after a \`return\` in the same block is unreachable → compile error.
`
    },
    {
      id: 'static',
      title: 'Static vs instance members',
      md: `* **Static** members belong to the class: one copy, exists without any object, accessed through the class name (\`Counter.count\`) or – legally but poorly – through an instance reference, **even a null one**: \`Counter c = null; c.count++;\` works because the compiler rewrites it using the reference's *declared type*.
* **Instance** members require an object. A static method (including \`main\`) **cannot** refer to instance fields/methods or \`this\` without an object → *"non-static variable cannot be referenced from a static context"*.
* Instance methods **can** access static members directly.
* Static methods are **not** polymorphic – they are resolved by the reference type (hiding, not overriding – Chapter 6).
* **Static final constants** must be assigned exactly once: at declaration or in a **static initializer**. Instance \`final\` fields: at declaration, in an instance initializer, or in **every** constructor.
* \`static\` cannot be applied to local variables or top-level classes; it can be applied to fields, methods, nested classes, and initializer blocks.
* Static imports (\`import static java.lang.Math.*;\`) bring static *members* into scope. A locally declared method with the same name shadows the import; two static imports of the same name from different classes conflict only when used.

\`\`\`java
public class Counter {
  private static int count;          // shared
  private int id;                    // per object
  public Counter() { id = ++count; } // instance ctor may touch static
  public static int getCount() { return count; }     // OK
  public static int getId() { return id; }           // DOES NOT COMPILE
}
\`\`\`

## Initialization order (single class)

1. Static field initializers and \`static {}\` blocks – in textual order – **once**, when the class is first used.
2. Instance field initializers and \`{}\` blocks – in textual order – each time an object is created.
3. Constructor body.

Static blocks cannot forward-reference a static field *by simple name* for reading (\`static { System.out.println(x); } static int x = 1;\` fails; \`static { x = 5; }\` before the declaration is allowed as an assignment). Same rule for instance initializers.
`
    },
    {
      id: 'passing',
      title: 'Passing data: pass-by-value and return values',
      md: `Java is **always pass-by-value**. For primitives the value is copied; for objects the **reference** is copied.

Consequences inside a method:

| Action on the parameter | Visible to caller? |
|---|---|
| Reassign a primitive parameter | No |
| Reassign an object parameter (\`sb = new StringBuilder()\`) | No |
| Mutate the object through the parameter (\`sb.append("x")\`, \`list.add(1)\`, \`arr[0] = 9\`) | **Yes** |
| Call a method that returns a new object (\`s = s.concat("x")\`) | No – the caller's reference is unchanged |

Wrapper objects and Strings are immutable, so they behave like primitives from the caller's point of view.

Autoboxing when calling: \`void m(Integer i)\` accepts \`m(5)\`; \`void m(long l)\` accepts \`m(5)\` (widening); \`void m(Long l)\` **rejects** \`m(5)\` (no widen-then-box). \`void m(int i)\` accepts \`m(Integer.valueOf(5))\` (unboxing). A \`null\` argument can go to any reference parameter but not to a primitive.
`
    },
    {
      id: 'overloading',
      title: 'Overloading and varargs',
      md: `**Overloading** = same name, **different parameter lists** (type, number, or order). Return type, access modifier, \`static\`, exceptions and parameter *names* do **not** distinguish overloads – two methods differing only in those fail with *"method already defined"*.

\`\`\`java
void m(int a, String b) {}
void m(String b, int a) {}   // OK – different order
int  m(int a, String b) { return 0; }   // DOES NOT COMPILE – same signature
void m(int... a) {}          // OK
void m(int[] a) {}           // DOES NOT COMPILE – same as int... (both are int[])
void m(List<String> l) {}
void m(List<Integer> l) {}   // DOES NOT COMPILE – erasure makes both m(List)
\`\`\`

## Resolution order (the compiler picks the most specific, in phases)

1. **Exact match** by type.
2. **Widening** of primitives (\`int\` → \`long\` → \`float\` → \`double\`; never to \`char\`/\`byte\`/\`short\` from int) and reference **upcasting** (\`String\` → \`Object\`, \`Integer\` → \`Number\`).
3. **Autoboxing / unboxing** (\`int\` → \`Integer\`, and then \`Integer\` → \`Object\` upcast is allowed after boxing).
4. **Varargs**.

Rules of thumb:

* Only **one** conversion *kind* per phase: widening **then** boxing (\`int\` → \`Long\`) is illegal; boxing **then** widening (\`int\` → \`Integer\` → \`Object\`) is fine.
* Given \`m(long)\` and \`m(Integer)\`, calling \`m(5)\` picks **\`long\`** (widening beats boxing).
* Given \`m(Object)\` and \`m(int...)\`, \`m(5)\` picks **\`Object\`** (boxing beats varargs).
* \`m(null)\` picks the **most specific** reference type; if two are unrelated (\`String\` vs \`StringBuilder\`) → *"reference to m is ambiguous"*. \`m(Object)\` vs \`m(String)\` with \`null\` → \`String\`.
* \`m(byte)\` vs \`m(short)\` with \`m(5)\`: neither – an \`int\` literal doesn't narrow. If \`m(long)\` exists it is chosen; else \`m(Integer)\`; else \`m(Object)\`; else \`m(int...)\`.
* \`m(char)\` with argument \`'a'\` is exact; with \`m(int)\` only, \`'a'\` widens to int (97).
* \`m(double, int)\` vs \`m(int, double)\` called with \`m(1, 2)\` → **ambiguous**.
* Overloads with the same primitive after promotion: \`m(float)\` and \`m(double)\` with \`m(5)\` → \`float\` (closest widening).

## Varargs

\`\`\`java
static int sum(String label, int... nums) {   // must be last, only one
  return nums.length;
}
sum("a");             // nums.length == 0 (empty array, not null)
sum("a", 1, 2, 3);    // 3
sum("a", new int[]{1, 2});   // 2 – an array can be passed directly
sum("a", null);       // compiles; nums is null → NPE on nums.length
\`\`\`

* Declared as \`type... name\`; inside the method it **is** an array.
* \`void m(int... a, String s)\` and \`void m(int... a, int... b)\` **do not compile**.
* \`m(int[] a)\` and \`m(int... a)\` are the same signature (cannot coexist), but only the varargs form allows the comma-separated call syntax.
* Passing \`null\` alone to a single varargs parameter assigns \`null\` to the array (with a warning), not an array containing null. \`m((Object) null)\` creates a one-element array.
* \`main(String... args)\` is a valid entry point.
`
    },
    {
      id: 'scope-var-encapsulation',
      title: 'Scope, var, encapsulation and immutability',
      md: `## Scope

* **Local variables**: from declaration to the end of the enclosing block \`{}\`. Loop variables belong to the loop. A local **cannot** be redeclared in a nested block while it is in scope (\`int x; { int x; }\` fails) – but a local **can shadow** an instance/static field of the same name (use \`this.x\` to reach the field).
* **Parameters**: the whole method body; cannot be redeclared as a local.
* **Instance variables**: while the object lives. **Class variables**: while the program runs.
* Locals **must be definitely assigned** before being read; fields get defaults.
* A local declared inside an \`if\` without braces is a compile error (\`if (b) int x = 1;\`).

## Local variable type inference – \`var\`

Legal only for **local variables** (including \`for\`/\`for-each\`/try-with-resources variables and lambda parameters in Java 11+) **with an initializer**.

| Statement | Verdict |
|---|---|
| \`var x = 10;\` | ✓ int |
| \`var x;\` | ✗ no initializer |
| \`var x = null;\` | ✗ |
| \`var x = 1, y = 2;\` | ✗ one variable per \`var\` |
| \`var x = {1, 2};\` | ✗ array initializer needs a type |
| \`var x = new int[]{1, 2};\` | ✓ |
| \`var x = () -> 1;\` | ✗ lambda needs a target type |
| \`var x = "a"; x = 1;\` | ✗ type is String forever |
| \`var x = 1; x = 2L;\` | ✗ |
| \`var x = 5; x = 5.0;\` | ✗ |
| \`var var = 1;\` | ✓ – \`var\` is a reserved *type name*, not a keyword |
| \`class var {}\` | ✗ cannot name a type \`var\` |
| \`var\` field, parameter, return type | ✗ |
| \`for (var s : list)\` | ✓ |
| \`var list = new ArrayList<>();\` | ✓ – inferred as \`ArrayList<Object>\` |

\`var\` infers the **exact** compile-time type of the initializer: \`var x = 1;\` is \`int\` (not Integer), \`var n = List.of(1)\` is \`List<Integer>\`, and \`var o = new Object[]{}\`.

## Encapsulation

Fields \`private\`; behaviour exposed through methods (getters/setters). JavaBeans naming: \`getX()\`, \`isX()\` for **boolean primitives** only (\`Boolean\` uses \`get\`), \`setX(...)\`. Encapsulation is about controlling access – a class with public fields is *not* encapsulated even if it has getters.

## Immutable objects – the recipe

1. Mark the class \`final\` (or make all constructors private with static factories) so no subclass can add mutable state.
2. All fields \`private final\`.
3. No setters / no methods that change state.
4. **Defensive copies** of mutable inputs in the constructor and of mutable fields in getters (return \`new ArrayList<>(list)\` or \`List.copyOf(list)\`; never expose the internal array/list).
5. Don't let \`this\` escape during construction.

A \`final\` reference field only fixes the *reference*; \`final List<String> names\` can still be mutated through \`names.add(...)\` – that is why copies are needed. Strings, wrappers, \`java.time\` types and records (Chapter 6) are immutable.
`
    },
    {
      id: 'annotations',
      title: 'Built-in annotations on the exam',
      md: `| Annotation | Target | Compile-time effect |
|---|---|---|
| \`@Override\` | method | **Error** if the method does not override/implement a supertype method (wrong name, parameter types, static, or private). Optional but recommended. |
| \`@FunctionalInterface\` | interface | **Error** unless the interface has exactly **one** abstract method (Object's public methods and default/static/private methods don't count). Optional – an interface with one abstract method is functional without it. |
| \`@Deprecated\` | any declaration | Compiler warns at *use sites*. Elements: \`since\` (String) and \`forRemoval\` (boolean, default false). Should be paired with a \`@deprecated\` Javadoc tag. |
| \`@SuppressWarnings("...")\` | declaration or local variable | Silences warnings; common values \`"unchecked"\`, \`"deprecation"\`, \`"rawtypes"\`, \`"removal"\`; array form \`{"unchecked", "deprecation"}\`. Unknown strings are ignored (no error). |
| \`@SafeVarargs\` | **static, final or private** method or **constructor** with a varargs parameter | Suppresses heap-pollution warnings. Error if the method is not one of those kinds, or has no varargs parameter. |

Annotations sit before the declaration (after or among other modifiers – order is free). \`@Override\` on an interface's method implementing an \`Object\` method (e.g. \`toString\`) is fine. \`@Override\` on a method that merely *overloads* a superclass method → **compile error** – the single most common annotation question.

Marker vs value: \`@Deprecated\` alone or \`@Deprecated(since = "17", forRemoval = true)\`; \`@SuppressWarnings\` **requires** a value (\`@SuppressWarnings\` alone fails).
`
    }
  ],

  gotchas: [
    { title: 'Modifier order: specifiers before the return type', md: '`public static void m()` and `static public void m()` both compile; `public void static m()` does not. Access modifier and `static/final/abstract` can be in any order relative to each other.' },
    { title: 'Return type is not part of the signature', md: 'Two methods that differ only in return type (or only in `static`, access modifier, or exception list) are duplicates → compile error.' },
    { title: 'Parameter names do not distinguish overloads', md: '`m(int a)` and `m(int b)` are the same method.' },
    { title: 'int[] and int... are the same signature', md: 'They cannot coexist in one class. An overriding method may switch between them (with a warning), but the exam usually shows them as a duplicate-method error.' },
    { title: 'Varargs must be last and alone', md: '`m(String... s, int i)` and `m(int... a, int... b)` fail. `m(int i, String... s)` is fine.' },
    { title: 'Calling a varargs method with no arguments gives an empty array', md: '`m()` → `args.length == 0`, not null. But `m(null)` passes a null array → NPE when dereferenced.' },
    { title: 'Widening beats boxing beats varargs', md: 'Given `m(long)`, `m(Integer)`, `m(int...)`, the call `m(1)` picks `long`. Remove it and `Integer` wins; remove that and varargs wins.' },
    { title: 'No widening-then-boxing', md: '`Long l = 5;` and calling `m(Long)` with an `int` fail. Boxing-then-widening is fine: `m(Object)` accepts `5`.' },
    { title: 'Ambiguous null', md: '`m(String)` vs `m(StringBuilder)` with `m(null)` → compile error (ambiguous). `m(String)` vs `m(Object)` → String (more specific).' },
    { title: 'Ambiguous mixed promotion', md: '`m(int, long)` and `m(long, int)` called with `m(1, 1)` are ambiguous. So are `m(Integer, int)` vs `m(int, Integer)` with two ints.' },
    { title: 'Literal int does not narrow to byte/short in a call', md: 'With only `m(byte)` declared, `m(5)` does not compile even though `byte b = 5;` does. Constant narrowing applies to assignment, not method invocation.' },
    { title: 'char argument, int parameter', md: '`m(\'a\')` with only `m(int)` prints 97. With `m(int)` and `m(char)` both present, `char` is chosen (exact).' },
    { title: 'Static context cannot see instance members', md: 'Inside `main` or any static method, `name` (an instance field) or `this` is a compile error. Create an object: `new Foo().name`.' },
    { title: 'Static member via a null reference works', md: '`Foo f = null; f.staticMethod();` runs fine – the compiler uses the declared type. Only instance access through null throws NPE.' },
    { title: 'Static method calls are not polymorphic', md: 'The method invoked is chosen by the *reference type* at compile time. Related: a static method cannot override an instance method and vice versa (compile error).' },
    { title: 'Pass-by-value: reassigning a parameter is invisible', md: '`void m(int[] a) { a = new int[]{9}; }` leaves the caller\'s array alone; `a[0] = 9` would change it.' },
    { title: 'Return statements and reachability', md: 'A statement directly after `return` in the same block is unreachable → compile error. A non-void method whose last statement is a `while(true)` loop without a break needs no return.' },
    { title: 'Missing return in an if/else chain', md: 'If any path (including "no else") can fall off the end without returning, the method does not compile – even if you "know" the condition is always true.' },
    { title: 'Local variable redeclaration', md: 'A nested block cannot redeclare a local or parameter still in scope. Sibling blocks (two separate `for` loops) can reuse the same name.' },
    { title: 'var restrictions', md: 'No `var` for fields, parameters, return types, without an initializer, with `null`, with a compound declaration, with an array initializer `{}` or with a lambda/method reference.' },
    { title: 'var is not a keyword', md: '`var var = 1;` and `int var = 2;` compile. But you cannot name a class, interface, or enum `var`.' },
    { title: 'var infers primitive, not wrapper', md: '`var x = 1;` is `int` (so `x = null` fails). `var y = Integer.valueOf(1);` is `Integer`.' },
    { title: 'final field ≠ immutable object', md: '`private final List<String> l` can still be modified via `l.add()`. Immutability requires defensive copies and no mutators.' },
    { title: 'Getter that leaks a mutable field', md: 'Returning the internal `List`/array/`StringBuilder`/`Date` breaks immutability; return a copy or an unmodifiable view.' },
    { title: 'is-getter only for primitive boolean', md: 'JavaBeans: `boolean isActive()` is valid; for a `Boolean` field the getter must be `getActive()`.' },
    { title: '@Override on an overload', md: 'If parameter types differ from the parent\'s (e.g. `equals(Dog d)` vs `equals(Object o)`), `@Override` makes it a compile error instead of a silent overload.' },
    { title: '@FunctionalInterface with two abstract methods', md: 'Compile error. Default/static/private methods and `Object` methods (`equals`, `hashCode`, `toString`) don\'t count toward the one.' },
    { title: '@SafeVarargs placement', md: 'Only on static, final, or private methods and constructors *with* a varargs parameter. On an overridable instance method → compile error.' },
    { title: '@SuppressWarnings needs a value', md: '`@SuppressWarnings` alone does not compile; `@SuppressWarnings("unchecked")` or `@SuppressWarnings({"unchecked","deprecation"})` do. Unknown strings are silently ignored.' },
    { title: '@Deprecated elements', md: '`since` is a String (`since = "17"`, not `since = 17`); `forRemoval` is a boolean. Using a deprecated API compiles with a warning, not an error.' }
  ],

  traps: [
    {
      code: `public class Calc {
  public void static add(int a, int b) { }
  static public int sub(int a, int b) { return a - b; }
  final static private int mul(int a, int b) { return a * b; }
}`,
      prompt: 'Which methods compile?',
      answer: '`sub` and `mul` compile – modifiers may appear in any order before the return type. `add` fails: `static` appears **after** the return type `void`.'
    },
    {
      code: `public class Over {
  static void go(long x) { System.out.print("long "); }
  static void go(Integer x) { System.out.print("Integer "); }
  static void go(Object x) { System.out.print("Object "); }
  static void go(int... x) { System.out.print("varargs "); }
  public static void main(String[] args) {
    go(1);
    go(1L);
    go(Integer.valueOf(1));
    go((short) 1);
    go(1, 2);
    go("s");
  }
}`,
      prompt: 'What prints?',
      answer: 'Prints **`long long Integer long varargs Object `**. `int` → widening to long beats boxing. `long` exact. `Integer` exact. `short` widens to long. Two ints → only varargs fits. String → Object.',
      verify: { files: { 'Over.java': `public class Over {
  static void go(long x) { System.out.print("long "); }
  static void go(Integer x) { System.out.print("Integer "); }
  static void go(Object x) { System.out.print("Object "); }
  static void go(int... x) { System.out.print("varargs "); }
  public static void main(String[] args) {
    go(1);
    go(1L);
    go(Integer.valueOf(1));
    go((short) 1);
    go(1, 2);
    go("s");
  }
}` }, expect: { output: 'long long Integer long varargs Object ' } }
    },
    {
      code: `public class Amb {
  static void m(String s) { }
  static void m(StringBuilder s) { }
  static void n(String s) { }
  static void n(Object o) { }
  public static void main(String[] args) {
    m(null);
    n(null);
  }
}`,
      prompt: 'Does it compile?',
      answer: '**No** – `m(null)` is ambiguous because `String` and `StringBuilder` are unrelated. `n(null)` alone would compile and pick `String` (more specific than `Object`).'
    },
    {
      code: `public class Vs {
  static int count(int... nums) { return nums.length; }
  public static void main(String[] args) {
    System.out.print(count() + " ");
    System.out.print(count(1, 2, 3) + " ");
    System.out.print(count(new int[5]) + " ");
    System.out.print(count(null));
  }
}`,
      prompt: 'What happens?',
      answer: 'Prints **`0 3 5 `** then throws **`NullPointerException`**. No arguments → empty array; an array may be passed directly; `null` is passed as the array reference itself, so `nums.length` dereferences null.',
      verify: { files: { 'Vs.java': `public class Vs {
  static int count(int... nums) { return nums.length; }
  public static void main(String[] args) {
    System.out.print(count() + " ");
    System.out.print(count(1, 2, 3) + " ");
    System.out.print(count(new int[5]) + " ");
    System.out.print(count(null));
  }
}` }, expect: 'runtime-exception' }
    },
    {
      code: `public class Pass {
  static void change(int n, int[] arr, StringBuilder sb, String s) {
    n = 99;
    arr[0] = 99;
    arr = new int[]{7};
    sb.append("!");
    s += "!";
  }
  public static void main(String[] args) {
    int n = 1; int[] arr = {1}; StringBuilder sb = new StringBuilder("sb"); String s = "s";
    change(n, arr, sb, s);
    System.out.println(n + " " + arr[0] + " " + sb + " " + s);
  }
}`,
      prompt: 'What prints?',
      answer: 'Prints **`1 99 sb! s`**. Primitives and reassigned references are local copies; mutations through the copied reference (`arr[0] = 99`, `sb.append`) are visible. `s += "!"` creates a new String assigned only to the local `s`.',
      verify: { files: { 'Pass.java': `public class Pass {
  static void change(int n, int[] arr, StringBuilder sb, String s) {
    n = 99;
    arr[0] = 99;
    arr = new int[]{7};
    sb.append("!");
    s += "!";
  }
  public static void main(String[] args) {
    int n = 1; int[] arr = {1}; StringBuilder sb = new StringBuilder("sb"); String s = "s";
    change(n, arr, sb, s);
    System.out.println(n + " " + arr[0] + " " + sb + " " + s);
  }
}` }, expect: { output: '1 99 sb! s' } }
    },
    {
      code: `public class Stat {
  private int value = 5;
  private static int total;
  public static void main(String[] args) {
    Stat s = null;
    s.total = 10;
    System.out.print(Stat.total + " ");
    System.out.print(value);
  }
}`,
      prompt: 'Does it compile?',
      answer: '**No.** `s.total = 10` compiles and runs (static access through a null reference is fine), but `System.out.print(value)` refers to an *instance* field from a static context → compile error. Remove that line and it prints `10 `.'
    },
    {
      code: `public class Vars {
  public static void main(String[] args) {
    var a = 1;
    var b = "x";
    var c = new java.util.ArrayList<>();
    var d = null;
    var e = 1, f = 2;
    var g;
    var h = {1, 2};
    var var = 3;
  }
}`,
      prompt: 'Which declarations do not compile?',
      answer: '`d` (null), `e, f` (multiple declarators), `g` (no initializer), `h` (array initializer). `a`, `b`, `c` (inferred `ArrayList<Object>`) and `var var` all compile.'
    },
    {
      code: `public class Immut {
  private final java.util.List<String> items;
  public Immut(java.util.List<String> items) { this.items = items; }
  public java.util.List<String> getItems() { return items; }
}`,
      prompt: 'Is Immut immutable?',
      answer: '**No.** Three holes: the class is not `final` (a subclass can add mutable state), the constructor stores the caller\'s list directly (caller can mutate it later), and the getter returns the internal list. Fix with `final class`, `new ArrayList<>(items)` / `List.copyOf(items)` in the constructor, and return `Collections.unmodifiableList(items)` or a copy.'
    },
    {
      code: `interface Speaker { void speak(); default void hi() {} }
class Dog {
  @Override public boolean equals(Dog d) { return true; }
}
@FunctionalInterface interface Two { void a(); void b(); }
class Util {
  @SafeVarargs public void log(String... s) {}
  @SuppressWarnings void quiet() {}
}`,
      prompt: 'How many compile errors?',
      answer: '**Four.** (1) `equals(Dog)` overloads rather than overrides `equals(Object)`, so `@Override` fails. (2) `Two` has two abstract methods. (3) `@SafeVarargs` is only allowed on static, final, or private methods (or constructors); `log` is an overridable instance method. (4) `@SuppressWarnings` requires a value. `Speaker` is fine (one abstract method + default).'
    }
  ],

  questions: [
    {
      id: 'ch05-q01', type: 'multi', difficulty: 'easy', objectiveIds: ['3b'], tags: ['declaration', 'compile'],
      question: 'Which method declarations compile when placed inside a class? (Choose all that apply.)',
      code: null,
      options: [
        'public static void m1() {}',
        'static public final void m2() {}',
        'public void static m3() {}',
        'void m4(var x) {}',
        'int m5() { }',
        'void m6(int... a, int b) {}',
        'protected abstract void m7();'
      ],
      answer: [0, 1],
      explanation: 'Modifiers can be in any order but must precede the return type. `var` is not permitted for parameters. A non-void method must return a value. A varargs parameter must be last. An abstract method needs an abstract class (assume a concrete class here) – and even then it is fine only in an abstract class.',
      optionNotes: { '0': 'Standard form.', '1': 'Modifier order is free.', '2': '`static` after the return type.', '3': 'No `var` parameters.', '4': 'Missing return statement.', '5': 'Varargs must be the last parameter.', '6': 'Only legal inside an abstract class; a concrete class cannot contain abstract methods.' },
      verify: null
    },
    {
      id: 'ch05-q02', type: 'single', difficulty: 'easy', objectiveIds: ['3b'], tags: ['return'],
      question: 'Which method does NOT compile?',
      code: `long a() { return 5; }
Integer b() { return 5; }
Long c() { return 5; }
int d() { return 'x'; }
Object e() { return 5; }`,
      options: ['a', 'b', 'c', 'd', 'e'],
      answer: [2],
      explanation: 'An `int` cannot be boxed to `Long`; there is no widen-then-box. `int` → `long` widens, `int` → `Integer` boxes, `char` → `int` widens, `int` → `Integer` → `Object` boxes then widens.',
      optionNotes: { '0': 'Widening.', '1': 'Boxing.', '2': 'Correct – needs `5L`.', '3': 'char widens to int.', '4': 'Boxing then upcast.' },
      verify: null
    },
    {
      id: 'ch05-q03', type: 'single', difficulty: 'medium', objectiveIds: ['3c'], tags: ['overloading'],
      question: 'What is the output?',
      code: `public class Pick {
  static void p(int x) { System.out.print("int "); }
  static void p(long x) { System.out.print("long "); }
  static void p(double x) { System.out.print("double "); }
  static void p(Integer x) { System.out.print("Integer "); }
  static void p(Object x) { System.out.print("Object "); }
  public static void main(String[] args) {
    byte b = 1; char c = 'c'; float f = 1f;
    p(b); p(c); p(f); p(1L); p("s"); p(1.0f * 2);
  }
}`,
      options: ['int int double long Object double', 'int int float long Object float', 'Integer int double long Object double', 'int int double long String double', 'The code does not compile.'],
      answer: [0],
      explanation: '`byte` and `char` widen to the closest available primitive, `int`. `float` widens to `double` (no `float` overload). `1L` is exact. String is only assignable to Object. `1.0f * 2` is a float → double.',
      optionNotes: { '0': 'Correct.', '1': 'There is no p(float).', '2': 'Widening to int beats boxing to Integer.', '3': 'There is no p(String).', '4': 'Compiles.' },
      verify: { files: { 'Pick.java': `public class Pick {
  static void p(int x) { System.out.print("int "); }
  static void p(long x) { System.out.print("long "); }
  static void p(double x) { System.out.print("double "); }
  static void p(Integer x) { System.out.print("Integer "); }
  static void p(Object x) { System.out.print("Object "); }
  public static void main(String[] args) {
    byte b = 1; char c = 'c'; float f = 1f;
    p(b); p(c); p(f); p(1L); p("s"); p(1.0f * 2);
  }
}` }, expect: { output: 'int int double long Object double ' } }
    },
    {
      id: 'ch05-q04', type: 'single', difficulty: 'medium', objectiveIds: ['3c'], tags: ['overloading', 'boxing'],
      question: 'What is the output?',
      code: `public class Box {
  static void m(Object o) { System.out.print("Object "); }
  static void m(int... i) { System.out.print("varargs "); }
  static void m(Long l) { System.out.print("Long "); }
  public static void main(String[] args) {
    m(5);
    m(5L);
    m(5, 6);
    m();
  }
}`,
      options: ['Object Long varargs varargs', 'varargs Long varargs varargs', 'Object Object varargs varargs', 'Object Long varargs Object', 'The code does not compile.'],
      answer: [0],
      explanation: '`m(5)`: no int/long overload; boxing to Integer then widening to Object beats varargs. `m(5L)`: boxing to `Long` is exact. Two ints and zero args only match varargs.',
      optionNotes: { '0': 'Correct.', '1': 'Boxing (phase 2) is tried before varargs (phase 3).', '2': '`Long` is more specific than `Object` for a boxed long.', '3': 'No-arg call can only match varargs.', '4': 'Compiles.' },
      verify: { files: { 'Box.java': `public class Box {
  static void m(Object o) { System.out.print("Object "); }
  static void m(int... i) { System.out.print("varargs "); }
  static void m(Long l) { System.out.print("Long "); }
  public static void main(String[] args) {
    m(5);
    m(5L);
    m(5, 6);
    m();
  }
}` }, expect: { output: 'Object Long varargs varargs ' } }
    },
    {
      id: 'ch05-q05', type: 'single', difficulty: 'medium', objectiveIds: ['3c'], tags: ['overloading', 'ambiguous'],
      question: 'Which call does NOT compile?',
      code: `static void a(int x, long y) {}
static void a(long x, int y) {}
static void b(String s) {}
static void b(Object o) {}
static void c(Integer i) {}
static void c(Number n) {}`,
      options: ['a(1, 1L);', 'a(1, 1);', 'b(null);', 'c(null);', 'b("x");'],
      answer: [1],
      explanation: '`a(1, 1)` could widen either argument, so both overloads apply and neither is more specific → ambiguous. `a(1, 1L)` is exact. With `null`, the most specific reference type wins when one is a subtype of the other: `b(null)` → String, `c(null)` → Integer.',
      optionNotes: { '0': 'Exact match.', '1': 'Ambiguous.', '2': 'String is more specific than Object.', '3': 'Integer is more specific than Number.', '4': 'Exact match.' },
      verify: null
    },
    {
      id: 'ch05-q06', type: 'single', difficulty: 'medium', objectiveIds: ['3c'], tags: ['varargs'],
      question: 'What is the output?',
      code: `public class V {
  static String join(String sep, String... parts) {
    return parts.length + sep + String.join(sep, parts);
  }
  public static void main(String[] args) {
    System.out.print(join("-") + " ");
    System.out.print(join("-", "a") + " ");
    System.out.print(join("-", new String[]{"a", "b"}) + " ");
    System.out.print(join("-", "a", "b", "c"));
  }
}`,
      options: ['0- 1-a 2-a-b 3-a-b-c', '0 1-a 2-a-b 3-a-b-c', '1- 2-a 3-a-b 4-a-b-c', 'The code does not compile.', 'A NullPointerException is thrown.'],
      answer: [0],
      explanation: 'With no varargs arguments the array is empty (length 0) and `String.join` of nothing is `""`, giving `0-`. An explicit array is passed as-is.',
      optionNotes: { '0': 'Correct.', '1': 'The separator is still printed after the count.', '2': 'The separator is not part of the varargs.', '3': 'Compiles.', '4': 'An empty array, not null, is created.' },
      verify: { files: { 'V.java': `public class V {
  static String join(String sep, String... parts) {
    return parts.length + sep + String.join(sep, parts);
  }
  public static void main(String[] args) {
    System.out.print(join("-") + " ");
    System.out.print(join("-", "a") + " ");
    System.out.print(join("-", new String[]{"a", "b"}) + " ");
    System.out.print(join("-", "a", "b", "c"));
  }
}` }, expect: { output: '0- 1-a 2-a-b 3-a-b-c' } }
    },
    {
      id: 'ch05-q07', type: 'multi', difficulty: 'medium', objectiveIds: ['3c'], tags: ['overloading', 'compile'],
      question: 'Which pairs of methods can legally coexist in the same class? (Choose all that apply.)',
      code: null,
      options: [
        'void m(int a) {}  and  void m(long a) {}',
        'void m(int a) {}  and  int m(int b) { return b; }',
        'void m(int[] a) {}  and  void m(int... a) {}',
        'void m(List<String> l) {}  and  void m(List<Integer> l) {}',
        'void m(String a, int b) {}  and  void m(int b, String a) {}',
        'static void m() {}  and  void m() {}'
      ],
      answer: [0, 4],
      explanation: 'Overloads must differ in parameter types or order. Return type, `static`, and parameter names are irrelevant. `int[]` and `int...` are identical. Generics erase to `List`, so the two `List` methods clash.',
      optionNotes: { '0': 'Different types.', '1': 'Same signature, different return type.', '2': 'Same erasure/type.', '3': 'Same erasure.', '4': 'Different order.', '5': 'Same signature.' },
      verify: null
    },
    {
      id: 'ch05-q08', type: 'single', difficulty: 'medium', objectiveIds: ['3b'], tags: ['static', 'compile'],
      question: 'What is the output?',
      code: `public class Tally {
  private static int shared = 0;
  private int own = 0;
  void bump() { shared++; own++; }
  public static void main(String[] args) {
    Tally a = new Tally();
    Tally b = new Tally();
    a.bump(); a.bump(); b.bump();
    Tally c = null;
    System.out.println(a.own + " " + b.own + " " + c.shared);
  }
}`,
      options: ['2 1 3', '2 1 0', 'A NullPointerException is thrown.', 'The code does not compile.', '3 3 3'],
      answer: [0],
      explanation: '`shared` is one variable for all instances; `own` is per object. Accessing a static field via a null reference is allowed – the compiler uses the declared type `Tally`.',
      optionNotes: { '0': 'Correct.', '1': 'shared was incremented three times.', '2': 'Static access through null does not dereference the reference.', '3': 'Compiles (with a lint warning at most).', '4': 'own is per instance.' },
      verify: { files: { 'Tally.java': `public class Tally {
  private static int shared = 0;
  private int own = 0;
  void bump() { shared++; own++; }
  public static void main(String[] args) {
    Tally a = new Tally();
    Tally b = new Tally();
    a.bump(); a.bump(); b.bump();
    Tally c = null;
    System.out.println(a.own + " " + b.own + " " + c.shared);
  }
}` }, expect: { output: '2 1 3' } }
    },
    {
      id: 'ch05-q09', type: 'single', difficulty: 'easy', objectiveIds: ['3b'], tags: ['static-context'],
      question: 'Which line causes a compile error?',
      code: `public class Ctx {
  int size = 3;                       // line 2
  static int count = 1;               // line 3
  void grow() { size++; count++; }    // line 4
  static void reset() { count = 0; size = 0; }   // line 5
  public static void main(String[] args) {
    new Ctx().grow();                 // line 7
    reset();                          // line 8
  }
}`,
      options: ['line 4', 'line 5', 'line 7', 'line 8', 'It compiles.'],
      answer: [1],
      explanation: 'A static method cannot reference the instance field `size` without an object. Instance methods can freely use static members (line 4).',
      optionNotes: { '0': 'Instance methods may use statics.', '1': 'Correct: `size` is an instance field.', '2': 'Legal object creation and call.', '3': 'Calling a static method from main is fine.', '4': 'Line 5 fails.' },
      verify: null
    },
    {
      id: 'ch05-q10', type: 'single', difficulty: 'medium', objectiveIds: ['3b'], tags: ['initialization-order'],
      question: 'What is the output?',
      code: `public class Init {
  static { System.out.print("S1 "); }
  { System.out.print("I1 "); }
  static int x = log("SF ");
  int y = log("IF ");
  Init() { System.out.print("C "); }
  static { System.out.print("S2 "); }
  { System.out.print("I2 "); }
  static int log(String s) { System.out.print(s); return 0; }
  public static void main(String[] args) {
    new Init();
    new Init();
  }
}`,
      options: ['S1 SF S2 I1 IF I2 C I1 IF I2 C', 'S1 SF S2 I1 IF I2 C', 'S1 S2 SF I1 I2 IF C I1 I2 IF C', 'I1 IF I2 S1 SF S2 C I1 IF I2 C', 'S1 SF S2 I1 IF I2 C S1 SF S2 I1 IF I2 C'],
      answer: [0],
      explanation: 'Static initializers and static field initializers run once, in textual order. Then for each object: instance initializers/field initializers in textual order, then the constructor body.',
      optionNotes: { '0': 'Correct.', '1': 'Two objects are created.', '2': 'Textual order interleaves fields and blocks.', '3': 'Statics run first.', '4': 'Static initialization happens once.' },
      verify: { files: { 'Init.java': `public class Init {
  static { System.out.print("S1 "); }
  { System.out.print("I1 "); }
  static int x = log("SF ");
  int y = log("IF ");
  Init() { System.out.print("C "); }
  static { System.out.print("S2 "); }
  { System.out.print("I2 "); }
  static int log(String s) { System.out.print(s); return 0; }
  public static void main(String[] args) {
    new Init();
    new Init();
  }
}` }, expect: { output: 'S1 SF S2 I1 IF I2 C I1 IF I2 C ' } }
    },
    {
      id: 'ch05-q11', type: 'single', difficulty: 'medium', objectiveIds: ['3b'], tags: ['final', 'initialization'],
      question: 'Which statement is true about this class?',
      code: `public class Cfg {
  private final int a;
  private final int b = 2;
  private static final int C;
  static { C = 3; }
  public Cfg() { a = 1; }
  public Cfg(int x) { }
}`,
      options: ['It compiles.', 'It does not compile because C is not initialised at declaration.', 'It does not compile because the second constructor does not assign a.', 'It does not compile because b cannot be assigned at declaration.', 'It does not compile because a static block cannot assign a final field.'],
      answer: [2],
      explanation: 'Every constructor must leave every `final` instance field assigned exactly once. `Cfg(int)` never assigns `a`. Static finals may be set in a static initializer; instance finals may be set at declaration.',
      optionNotes: { '0': 'The second constructor is the problem.', '1': 'The static block assigns C – legal.', '2': 'Correct.', '3': 'Declaration-time assignment is fine.', '4': 'Static blocks may assign static finals once.' },
      verify: null
    },
    {
      id: 'ch05-q12', type: 'single', difficulty: 'medium', objectiveIds: ['3b'], tags: ['pass-by-value'],
      question: 'What is the output?',
      code: `public class Ref {
  static void update(Integer i, int[] a, String s, StringBuilder sb) {
    i++;
    a[0]++;
    s = s.toUpperCase();
    sb.append(s);
    sb = null;
  }
  public static void main(String[] args) {
    Integer i = 1; int[] a = {1}; String s = "x"; StringBuilder sb = new StringBuilder("y");
    update(i, a, s, sb);
    System.out.println(i + " " + a[0] + " " + s + " " + sb);
  }
}`,
      options: ['1 2 x yX', '2 2 X yX', '1 2 x null', '2 2 x yX', '1 1 x yX'],
      answer: [0],
      explanation: '`i++` unboxes, increments, and re-boxes into a *new* Integer assigned to the local parameter only. The array element mutation and `append` are visible. Strings are immutable; setting the parameter to null does not affect the caller.',
      optionNotes: { '0': 'Correct.', '1': 'Integer is immutable; s is reassigned locally.', '2': 'Nulling the parameter is local.', '3': 'Integer++ creates a new object for the local copy.', '4': 'The array element change is shared.' },
      verify: { files: { 'Ref.java': `public class Ref {
  static void update(Integer i, int[] a, String s, StringBuilder sb) {
    i++;
    a[0]++;
    s = s.toUpperCase();
    sb.append(s);
    sb = null;
  }
  public static void main(String[] args) {
    Integer i = 1; int[] a = {1}; String s = "x"; StringBuilder sb = new StringBuilder("y");
    update(i, a, s, sb);
    System.out.println(i + " " + a[0] + " " + s + " " + sb);
  }
}` }, expect: { output: '1 2 x yX' } }
    },
    {
      id: 'ch05-q13', type: 'multi', difficulty: 'medium', objectiveIds: ['3d'], tags: ['var', 'compile'],
      question: 'Which statements compile inside a method? (Choose all that apply.)',
      code: null,
      options: [
        'var a = 1; a = 2L;',
        'var b = 1L; b = 2;',
        'var c = "s"; c = null;',
        'var d = new ArrayList<>(); d.add("x"); d.add(1);',
        'var e = (Runnable) () -> {};',
        'var f = 1; f += 1.5;',
        'var g = null;'
      ],
      answer: [1, 2, 3, 4, 5],
      explanation: '`var` fixes the type from the initializer: an `int` cannot take a `long`, but a `long` accepts an `int`. Reference types accept null. The diamond with `var` infers `ArrayList<Object>`. A cast gives the lambda a target type. Compound assignment includes an implicit cast.',
      optionNotes: { '0': 'a is int; 2L does not fit.', '1': 'int widens to long.', '2': 'String reference may be null.', '3': 'ArrayList<Object> accepts anything.', '4': 'The cast provides the type.', '5': '`f += 1.5` compiles via implicit cast (f becomes 2).', '6': 'null has no type to infer.' },
      verify: null
    },
    {
      id: 'ch05-q14', type: 'single', difficulty: 'easy', objectiveIds: ['3d'], tags: ['var'],
      question: 'Which is true of `var`?',
      code: null,
      options: [
        'It can be used for instance fields as long as they are initialised.',
        'It can be used as a method return type when the method has a single return statement.',
        'A variable named var can be declared, e.g. `int var = 5;`.',
        'It causes the variable to be dynamically typed at runtime.',
        '`var x = 5;` declares x as Integer.'
      ],
      answer: [2],
      explanation: '`var` is a reserved *type name*, not a keyword, so identifiers named `var` are legal. It is restricted to local variables with initializers, is resolved statically at compile time, and infers the exact initializer type – `int` here.',
      optionNotes: { '0': 'Local variables only.', '1': 'Not allowed for return types.', '2': 'Correct.', '3': 'Java remains statically typed.', '4': 'Primitive int.' },
      verify: null
    },
    {
      id: 'ch05-q15', type: 'single', difficulty: 'medium', objectiveIds: ['3d'], tags: ['scope'],
      question: 'Which line does NOT compile?',
      code: `public class Sc {
  int x = 10;
  void run(int p) {
    int x = 1;                    // line 4
    for (int i = 0; i < 2; i++) { int y = i; }   // line 5
    for (int i = 0; i < 2; i++) { }              // line 6
    { int p = 2; }                // line 7
    System.out.println(x + this.x);              // line 8
  }
}`,
      options: ['line 4', 'line 5', 'line 6', 'line 7', 'line 8'],
      answer: [3],
      explanation: 'A local variable may shadow a field (line 4) and sibling loops may reuse `i` (lines 5–6). But a nested block cannot redeclare the parameter `p`, which is still in scope.',
      optionNotes: { '0': 'Shadowing a field is legal.', '1': 'Loop-scoped variables.', '2': '`i` from line 5 is out of scope.', '3': 'Correct – duplicate variable p.', '4': '`x` is the local (1), `this.x` the field (10).' },
      verify: null
    },
    {
      id: 'ch05-q16', type: 'single', difficulty: 'medium', objectiveIds: ['3d'], tags: ['immutability'],
      question: 'Which change is required to make this class immutable?',
      code: `public final class Team {
  private final String name;
  private final List<String> members;
  public Team(String name, List<String> members) {
    this.name = name;
    this.members = new ArrayList<>(members);
  }
  public String getName() { return name; }
  public List<String> getMembers() { return members; }
}`,
      options: [
        'Make the fields public so they cannot be reassigned.',
        'Return a copy or unmodifiable view from getMembers().',
        'Remove the final modifier from the class so it can be extended safely.',
        'Store the members parameter directly instead of copying it.',
        'No change is needed; it is already immutable.'
      ],
      answer: [1],
      explanation: 'The constructor already copies the input, but `getMembers()` leaks the internal list so callers can `add`/`remove`. Return `List.copyOf(members)` / `Collections.unmodifiableList(members)`.',
      optionNotes: { '0': 'Breaks encapsulation.', '1': 'Correct.', '2': 'Subclasses could add mutable state.', '3': 'Would let the caller mutate internal state.', '4': 'The getter leaks the mutable list.' },
      verify: null
    },
    {
      id: 'ch05-q17', type: 'single', difficulty: 'medium', objectiveIds: ['3d'], tags: ['encapsulation'],
      question: 'Which class is correctly encapsulated following JavaBeans conventions?',
      code: null,
      options: [
        'public class A { public int age; public int getAge() { return age; } }',
        'public class B { private boolean active; public boolean getActive() { return active; } }',
        'public class C { private Boolean active; public Boolean isActive() { return active; } }',
        'public class D { private boolean active; public boolean isActive() { return active; } public void setActive(boolean a) { active = a; } }',
        'public class E { private int age; int age() { return age; } }'
      ],
      answer: [3],
      explanation: 'Encapsulation needs private fields with accessor methods named `getX`/`isX`/`setX`. `is` prefix is only for primitive `boolean`; a `Boolean` wrapper uses `get`. `getActive` for a primitive boolean is legal Java but not the conventional form the exam expects.',
      optionNotes: { '0': 'Public field.', '1': 'Convention for primitive boolean is `isActive`.', '2': '`is` is not used for the Boolean wrapper.', '3': 'Correct.', '4': 'Not a JavaBeans getter name.' },
      verify: null
    },
    {
      id: 'ch05-q18', type: 'single', difficulty: 'medium', objectiveIds: ['12b'], tags: ['annotations', 'override'],
      question: 'What is the result of compiling this code?',
      code: `class Animal {
  public void speak(String s) {}
  public static void info() {}
}
class Dog extends Animal {
  @Override public void speak(String s, int n) {}   // line A
  @Override public static void info() {}            // line B
  @Override public String toString() { return "Dog"; }  // line C
}`,
      options: ['It compiles.', 'Only line A fails.', 'Only line B fails.', 'Lines A and B fail.', 'Lines A, B and C fail.'],
      answer: [3],
      explanation: 'Line A has a different parameter list – it overloads, so `@Override` is an error. Line B hides a static method; static methods are not overridden, so `@Override` is an error. Line C correctly overrides `Object.toString()`.',
      optionNotes: { '0': 'Two errors.', '1': 'B also fails.', '2': 'A also fails.', '3': 'Correct.', '4': 'toString from Object is a genuine override.' },
      verify: null
    },
    {
      id: 'ch05-q19', type: 'multi', difficulty: 'medium', objectiveIds: ['12b', '3f'], tags: ['annotations', 'functional-interface'],
      question: 'Which interfaces compile with the `@FunctionalInterface` annotation? (Choose all that apply.)',
      code: null,
      options: [
        '@FunctionalInterface interface A { void run(); }',
        '@FunctionalInterface interface B { void run(); void stop(); }',
        '@FunctionalInterface interface C { void run(); default void stop() {} static void go() {} }',
        '@FunctionalInterface interface D { }',
        '@FunctionalInterface interface E { void run(); boolean equals(Object o); }',
        '@FunctionalInterface interface F extends A { }'
      ],
      answer: [0, 2, 4, 5],
      explanation: 'A functional interface has exactly one abstract method. Default and static methods do not count, nor do abstract redeclarations of `Object`\'s public methods. An interface inheriting a single abstract method also qualifies. Zero or two abstract methods fail.',
      optionNotes: { '0': 'One abstract method.', '1': 'Two.', '2': 'Only run() is abstract.', '3': 'Zero abstract methods.', '4': 'equals(Object) does not count.', '5': 'Inherits exactly one.' },
      verify: null
    },
    {
      id: 'ch05-q20', type: 'single', difficulty: 'medium', objectiveIds: ['12b'], tags: ['annotations', 'safevarargs'],
      question: 'Which method declaration compiles?',
      code: null,
      options: [
        '@SafeVarargs public void a(List<String>... lists) {}',
        '@SafeVarargs public static void b(List<String>... lists) {}',
        '@SafeVarargs public final void c(List<String> list) {}',
        '@SafeVarargs protected void d(List<String>... lists) {}',
        '@SafeVarargs public abstract void e(List<String>... lists);'
      ],
      answer: [1],
      explanation: '`@SafeVarargs` is permitted only on constructors and on `static`, `final`, or `private` methods that actually declare a varargs parameter. Overridable instance methods and abstract methods are rejected; so is a method without varargs.',
      optionNotes: { '0': 'Overridable instance method.', '1': 'Correct.', '2': 'No varargs parameter.', '3': 'Overridable.', '4': 'Abstract methods cannot be annotated with @SafeVarargs.' },
      verify: null
    },
    {
      id: 'ch05-q21', type: 'single', difficulty: 'easy', objectiveIds: ['12b'], tags: ['annotations', 'deprecated'],
      question: 'Which usage of `@Deprecated` and `@SuppressWarnings` compiles?',
      code: null,
      options: [
        '@Deprecated(since = 17) void a() {}',
        '@Deprecated(forRemoval = "true") void b() {}',
        '@SuppressWarnings void c() {}',
        '@Deprecated(since = "17", forRemoval = true) @SuppressWarnings({"unchecked", "deprecation"}) void d() {}',
        '@Deprecated("old") void e() {}'
      ],
      answer: [3],
      explanation: '`since` is a String and `forRemoval` a boolean. `@SuppressWarnings` requires a String or String[] value. `@Deprecated` has no default `value` element, so `@Deprecated("old")` is invalid.',
      optionNotes: { '0': 'since must be a String.', '1': 'forRemoval must be a boolean.', '2': 'Value required.', '3': 'Correct.', '4': 'No value element.' },
      verify: null
    },
    {
      id: 'ch05-q22', type: 'single', difficulty: 'medium', objectiveIds: ['3b'], tags: ['access-modifiers'],
      question: 'Given classes in different packages, which line in `Kid` does NOT compile?',
      code: `package a;
public class Parent {
  protected int p = 1;
  protected void hello() {}
}

package b;
import a.Parent;
public class Kid extends Parent {
  void test(Parent other, Kid kid) {
    System.out.println(p);          // line 1
    hello();                        // line 2
    System.out.println(kid.p);      // line 3
    other.hello();                  // line 4
  }
}`,
      options: ['line 1', 'line 2', 'line 3', 'line 4', 'All lines compile.'],
      answer: [3],
      explanation: 'Outside the package, a `protected` member is accessible only through a reference whose type is the subclass (or `this`). `other` is typed `Parent`, so `other.hello()` fails.',
      optionNotes: { '0': 'Inherited access.', '1': 'Inherited access.', '2': 'Reference of type Kid.', '3': 'Correct – reference of type Parent from another package.', '4': 'Line 4 fails.' },
      verify: null
    },
    {
      id: 'ch05-q23', type: 'single', difficulty: 'medium', objectiveIds: ['3b'], tags: ['return', 'reachability'],
      question: 'Which method does NOT compile?',
      code: `int a(int x) { if (x > 0) return 1; else return 2; }
int b(int x) { if (x > 0) return 1; }
int c(int x) { while (true) { if (x++ > 5) return x; } }
int d(int x) { throw new RuntimeException(); }
void e(int x) { return; }`,
      options: ['a', 'b', 'c', 'd', 'e'],
      answer: [1],
      explanation: 'Method `b` can complete normally when `x <= 0` without returning a value. An infinite `while (true)` with no `break`, or an unconditional `throw`, means the method cannot complete normally, so no return is needed.',
      optionNotes: { '0': 'Both paths return.', '1': 'Correct – missing return.', '2': 'Infinite loop – cannot complete normally.', '3': 'Always throws.', '4': 'Bare return in void is fine.' },
      verify: null
    },
    {
      id: 'ch05-q24', type: 'single', difficulty: 'hard', objectiveIds: ['3c'], tags: ['overloading', 'char'],
      question: 'What is the output?',
      code: `public class Ch {
  static void m(int i) { System.out.print("int "); }
  static void m(Character c) { System.out.print("Character "); }
  static void m(Object o) { System.out.print("Object "); }
  static void n(short s) { System.out.print("short "); }
  static void n(Object o) { System.out.print("Object "); }
  public static void main(String[] args) {
    m('a');
    m((Object) 'a');
    n(1);
    n((short) 1);
  }
}`,
      options: ['int Object Object short', 'Character Object Object short', 'int Object short short', 'int Character short short', 'The code does not compile.'],
      answer: [0],
      explanation: '`char` → `int` is a widening conversion (phase 1) and beats boxing to `Character`. The explicit `(Object)` cast selects the Object overload. The `int` literal `1` cannot narrow to `short` in a method call, so it boxes to Integer → Object. The explicit `(short)` cast is exact.',
      optionNotes: { '0': 'Correct.', '1': 'Widening beats boxing.', '2': 'An int argument is not narrowed to short.', '3': 'Casting to Object hides the runtime type from overload resolution.', '4': 'Compiles.' },
      verify: { files: { 'Ch.java': `public class Ch {
  static void m(int i) { System.out.print("int "); }
  static void m(Character c) { System.out.print("Character "); }
  static void m(Object o) { System.out.print("Object "); }
  static void n(short s) { System.out.print("short "); }
  static void n(Object o) { System.out.print("Object "); }
  public static void main(String[] args) {
    m('a');
    m((Object) 'a');
    n(1);
    n((short) 1);
  }
}` }, expect: { output: 'int Object Object short ' } }
    },
    {
      id: 'ch05-q25', type: 'single', difficulty: 'medium', objectiveIds: ['3b'], tags: ['static-import'],
      question: 'Which import statements allow `max(1, 2)` and `PI` to be used unqualified? (Assume `java.lang.Math`.)',
      code: null,
      options: [
        'import static java.lang.Math.*;',
        'import java.lang.Math.*;',
        'static import java.lang.Math.*;',
        'import static java.lang.Math;',
        'import java.lang.*;'
      ],
      answer: [0],
      explanation: '`import static` (in that order) imports static members. `import java.lang.Math.*` would import nested types only. `static import` is the wrong keyword order. `import static java.lang.Math;` is not a member.',
      optionNotes: { '0': 'Correct.', '1': 'Imports nested classes, not members.', '2': 'Wrong keyword order – compile error.', '3': 'Must name a member or use *.', '4': 'Imports classes, still requires Math.max.' },
      verify: null
    },
    {
      id: 'ch05-q26', type: 'single', difficulty: 'medium', objectiveIds: ['3c', '3b'], tags: ['overloading', 'constructor'],
      question: 'What is the output?',
      code: `public class Pt {
  private int x, y;
  Pt() { this(1); System.out.print("A"); }
  Pt(int x) { this(x, 2); System.out.print("B"); }
  Pt(int x, int y) { this.x = x; this.y = y; System.out.print("C"); }
  Pt(long x) { System.out.print("L"); }
  public static void main(String[] args) {
    new Pt();
    System.out.print(" ");
    new Pt(5L);
    System.out.print(" ");
    new Pt(5);
  }
}`,
      options: ['CBA L CB', 'ABC L BC', 'CBA CB CB', 'CBA L L', 'The code does not compile.'],
      answer: [0],
      explanation: 'Constructor overloading follows the same rules as methods. `Pt()` chains to `Pt(int)`, which chains to `Pt(int,int)`; the innermost body prints first. `5L` is an exact match for `Pt(long)`; `5` picks `Pt(int)` (exact) over `Pt(long)`.',
      optionNotes: { '0': 'Correct.', '1': 'The chained constructor body runs first.', '2': '5L is a long → Pt(long).', '3': '5 is an int → exact match Pt(int).', '4': 'Compiles.' },
      verify: { files: { 'Pt.java': `public class Pt {
  private int x, y;
  Pt() { this(1); System.out.print("A"); }
  Pt(int x) { this(x, 2); System.out.print("B"); }
  Pt(int x, int y) { this.x = x; this.y = y; System.out.print("C"); }
  Pt(long x) { System.out.print("L"); }
  public static void main(String[] args) {
    new Pt();
    System.out.print(" ");
    new Pt(5L);
    System.out.print(" ");
    new Pt(5);
  }
}` }, expect: { output: 'CBA L CB' } }
    }
  ],

  checklist: [
    'I can spot illegal method declarations: modifier after return type, missing return type, var parameter, misplaced varargs, missing body.',
    'I know what makes two methods a valid overload (parameter types/order) versus a duplicate (return type, static, names, int[] vs int..., generic erasure).',
    'I can apply overload resolution: exact → widening → boxing → varargs, no widen-then-box, and recognise ambiguous calls.',
    'I know varargs call forms: zero args gives an empty array, an array may be passed directly, null is the array itself.',
    'I know Java is pass-by-value and can predict which parameter changes are visible to the caller.',
    'I know static vs instance access rules, including static access through a null reference and the static-context error.',
    'I know the initialization order: static fields/blocks once in text order, then instance fields/blocks, then constructor.',
    'I know final field assignment rules for static and instance fields across constructors.',
    'I know the four access levels and the protected-from-another-package rule.',
    'I know every var restriction and that var infers the exact initializer type.',
    'I know scope rules for locals, parameters, shadowing of fields, and sibling versus nested blocks.',
    'I know the immutable-class recipe: final class, private final fields, no setters, defensive copies in and out.',
    'I know the compile-time rules for @Override, @FunctionalInterface, @Deprecated, @SuppressWarnings and @SafeVarargs.'
  ]
});
