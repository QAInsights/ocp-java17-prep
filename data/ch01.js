OCP.registerChapter({
  id: 1,
  slug: 'building-blocks',
  title: 'Building Blocks',
  objectiveIds: ['1a', '3d'],
  intro: `Foundations the whole exam builds on: the structure of a class and a source file, the \`main\` method, primitives and their literals, wrapper classes, \`var\`, identifiers, variable scope and default values, text blocks, and the object life-cycle. Questions from this chapter rarely appear alone – instead they hide inside other questions ("does this compile?" traps about literals, \`var\`, or scope). Master them and you remove an entire category of wrong answers.`,

  notes: [
    {
      id: 'class-structure',
      title: 'Classes, source files and main()',
      md: `## Members of a class

A class has **fields** (state) and **methods** (behaviour); together they are *members*. Comments (\`//\`, \`/* */\`, \`/** */\` Javadoc) are not members and may appear almost anywhere – but **not inside a string literal** and not splitting an identifier.

## Rules for a source file

* At most **one top-level \`public\` class per file**, and the file name must match that class (\`Zoo.java\` ↔ \`public class Zoo\`).
* Any number of non-public (package-private) top-level classes may share a file – their names do not need to match the file.
* Order of top-level elements: \`package\` (optional, at most once) → \`import\`s (optional) → type declarations. Comments may precede \`package\`.
* Java 11+ can run a single source file directly: \`java Zoo.java\` (compiles in memory; the first class in the file must contain \`main\`; only one file, JDK classes only).

## The main() method

\`\`\`java
public static void main(String[] args)      // canonical
public static void main(String args[])      // legal
public static void main(String... args)     // legal
static public void main(final String[] a)   // legal: modifier order/final irrelevant
\`\`\`

* Must be \`public\`, \`static\`, return \`void\`, be named \`main\`, take a single \`String[]\` (or varargs). Anything else (e.g. \`int\` return, missing \`static\`) compiles but the JVM fails to launch: *"Error: Main method not found"*.
* \`args\` never contains the program name. \`java Zoo a b\` → \`args.length == 2\`. Accessing \`args[2]\` throws \`ArrayIndexOutOfBoundsException\`.
* \`main\` **may** be \`final\` and may declare \`throws\`. It may be overloaded, but only the \`String[]\` version is the entry point.

## Packages and imports

* \`import java.util.*;\` imports all **classes** in \`java.util\` – **not** sub-packages (\`java.util.concurrent\` is not included) and not the package itself.
* \`java.lang\` is imported implicitly. Importing it explicitly is redundant but legal.
* A **single-type import beats a wildcard**: with \`import java.util.Date;\` and \`import java.sql.*;\`, \`Date\` refers to \`java.util.Date\`.
* Two single-type imports of the same simple name (\`java.util.Date\` and \`java.sql.Date\`) → **compile error**. Two wildcards containing the same name compile until you actually *use* the ambiguous name.
* Using a **fully qualified name** in code (\`java.sql.Date d;\`) always works and avoids the import clash. Importing the same class twice, or importing a class that is also in the current package, is redundant but legal.
* You cannot import a *method* or a *package*: \`import java.util;\` and \`import java.util.Arrays.asList;\` fail.
* \`import static\` imports static **members**, not classes: \`import static java.util.Arrays.asList;\`. \`static import\` (wrong word order) does not compile.
* Package names are conventionally lowercase; \`java.\` and \`javax.\` prefixes are reserved.

## Compiling and running

\`\`\`
javac -d classes src/Zoo.java      // -d output directory
java -cp classes Zoo               // -cp / -classpath / --class-path
java -cp "classes:lib/*" Zoo       // ':' on Unix, ';' on Windows; lib/* = all jars
\`\`\`
`
    },
    {
      id: 'objects-and-references',
      title: 'Objects, references and the life-cycle',
      md: `## Creating objects

\`Park p = new Park();\` – \`new\` allocates, the **constructor** initialises. A constructor has the class name and **no return type**. A method named like the class *with* a return type (\`public void Park() {}\`) is a legal (but useless) method, not a constructor – a classic trap.

If you write no constructor the compiler adds a **default no-arg constructor**. If you write *any* constructor, no default one is generated.

## Order of initialisation (single class)

1. Static fields and static initialisers, in textual order – once, when the class is first used.
2. Instance fields and instance initialisers \`{ … }\`, in textual order.
3. The constructor body.

\`\`\`java
public class Egg {
  private String name = "shell";
  { System.out.print(name + " "); }
  public Egg() { name = "yolk"; System.out.print(name + " "); }
  { name = "white"; }
  public static void main(String[] a) { new Egg(); }   // shell yolk
}
\`\`\`

Note the second initialiser runs **before** the constructor even though it appears after it in the file. Fields may only be referenced by an initialiser *after* they are declared (forward reference error), except through \`this.\`.

## Reference vs primitive

* A primitive holds a value; a reference holds the *address* of an object (or \`null\`).
* Only references can be \`null\`; assigning \`null\` to a primitive fails to compile.
* Only references have methods; \`int x = 5; x.toString()\` fails.
* \`==\` on references compares identity, not content.

## Garbage collection

* An object is eligible for GC when **no live reference points to it**: all references went out of scope, or were reassigned/set to \`null\`.
* \`System.gc()\` is only a *suggestion* – the JVM may ignore it. There is no way to force GC or to know when it runs.
* Counting eligible objects: count the *objects*, not the references. Two references to the same object → one object.
* \`finalize()\` is deprecated (Java 9) and may never run; it is **not** on the 1Z0-829 exam as a reliable mechanism – expect only "you cannot rely on it".
`
    },
    {
      id: 'primitives',
      title: 'Primitive types and literals',
      md: `## The eight primitives

| Type | Size | Range / notes | Default |
|---|---|---|---|
| \`boolean\` | JVM-dependent | \`true\`/\`false\` only – **not** 0/1 | \`false\` |
| \`byte\` | 8-bit | −128 … 127 | \`0\` |
| \`short\` | 16-bit | −32 768 … 32 767 | \`0\` |
| \`char\` | 16-bit **unsigned** | 0 … 65 535 | \`'\\u0000'\` |
| \`int\` | 32-bit | ±2.1 billion | \`0\` |
| \`long\` | 64-bit | needs \`L\` suffix above int range | \`0L\` |
| \`float\` | 32-bit | needs \`f\`/\`F\` suffix **always** | \`0.0f\` |
| \`double\` | 64-bit | default for decimal literals | \`0.0\` |

Defaults apply only to **fields** and array elements; a local variable has *no* default and must be assigned before use.

## Literal rules

* A whole-number literal is an \`int\`. \`long x = 3_000_000_000;\` **fails** (out of int range) – write \`3_000_000_000L\`. \`long y = 5;\` is fine (int widens).
* A decimal literal is a \`double\`. \`float f = 2.5;\` **fails**; \`float f = 2.5f;\` or \`float f = 2;\` works.
* Other bases: octal \`017\` (leading 0 → 15), hex \`0xFF\` / \`0XFF\`, binary \`0b101\` / \`0B101\`. No hex/binary for floating point on the exam (\`0x1p3\` exists but is not tested).
* Underscores: allowed **between digits only**. Illegal: \`_1000\`, \`1000_\`, \`1_.0\`, \`1._0\`, \`0x_FF\`. Legal: \`1_000_000\`, \`1__0\`, \`0xF_F\`, \`3.14_15\`.
* Scientific: \`1e3\` is a double (1000.0). \`1e3f\` is a float.
* \`char\` literals: \`'a'\`, \`'\\u0041'\`, \`'\\n'\`; a \`char\` may be assigned an int **constant** in range: \`char c = 65;\` OK, \`char c = 70000;\` fails; \`char c = -1;\` fails.
* \`byte b = 127;\` OK, \`byte b = 128;\` fails. Compile-time **narrowing of constants** is allowed for \`byte\`, \`short\`, \`char\` when the value fits (\`final int\` variables count as constants too).

## Wrapper classes

| Primitive | Wrapper | Note |
|---|---|---|
| \`boolean\` | \`Boolean\` | |
| \`byte\`/\`short\`/\`int\`/\`long\` | \`Byte\`/\`Short\`/\`Integer\`/\`Long\` | all extend \`Number\` |
| \`float\`/\`double\` | \`Float\`/\`Double\` | extend \`Number\` |
| \`char\` | \`Character\` | **not** a \`Number\` |

* Create with \`valueOf()\` (constructors are deprecated): \`Integer.valueOf(5)\`, \`Integer.valueOf("5")\`.
* Convert: \`Integer.parseInt("5")\` → \`int\`; \`Integer.valueOf("5")\` → \`Integer\`. Bad text → \`NumberFormatException\`. \`Boolean.parseBoolean("TRUE")\` → \`true\` (case-insensitive); anything else → \`false\`.
* \`Number\` methods: \`intValue()\`, \`longValue()\`, \`doubleValue()\` … convert with truncation.
* Wrapper **caching**: \`Integer.valueOf(127) == Integer.valueOf(127)\` is \`true\` (cache −128…127); \`Integer.valueOf(128) == Integer.valueOf(128)\` is **\`false\`**. Always use \`equals()\`.
* \`equals()\` is type-strict: \`Integer.valueOf(1).equals(Long.valueOf(1))\` → \`false\`.
* Autoboxing never widens and boxes at once: \`Long l = 5;\` **fails** (int → Long). \`Long l = 5L;\` OK. \`Double d = 5;\` fails.
* Unboxing a \`null\` wrapper → \`NullPointerException\`.
* Wrappers are **immutable**; \`Integer i = 5; i++;\` creates a new object.

## Text blocks (Java 15+)

\`\`\`java
String s = """
    Hello
      World""";        // "Hello\\n  World"
\`\`\`

* Starts with \`"""\` followed by a **line terminator** – \`"""Hello"""\` on one line **does not compile**.
* **Incidental** indentation is removed: the leftmost non-blank character (including the closing \`"""\` if on its own line) sets the margin.
* Closing \`"""\` on its own line → the text ends with \`\\n\`. Closing on the same line as text → no trailing newline.
* \`\\\` at end of line joins lines (no newline); \`\\s\` is a single space that also preserves trailing whitespace. Trailing spaces on a line are otherwise **stripped**.
* Inside a text block \`"\` needs no escaping; three in a row do (\`\\"""\`).
* Result is an ordinary \`String\` – all the usual methods apply.
`
    },
    {
      id: 'variables',
      title: 'Identifiers, declaration, var and scope',
      md: `## Identifier rules

* Start with a letter, \`$\` or \`_\`; then also digits. Never start with a digit.
* A single underscore \`_\` **alone is illegal** (Java 9+). \`_a\`, \`a_\`, \`$\`, \`__\` are legal.
* Reserved words are illegal: all keywords plus the literals \`true\`, \`false\`, \`null\`. \`var\`, \`record\`, \`sealed\`, \`permits\`, \`yield\` are *contextual* – **legal identifiers** (\`int var = 1;\` compiles!) but \`var\` cannot be a **type name** (\`class var {}\` fails).
* Case-sensitive: \`Integer\` is a legal (confusing) variable name; \`int\` is not.

## Declaring multiple variables

\`\`\`java
int a, b, c = 3;          // only c initialised
int d = 1, e = 2;         // OK
int f = 1; long g = 2;    // two statements: OK
int h, long i;            // DOES NOT COMPILE: one type per statement
int j; int j;             // DOES NOT COMPILE: duplicate in same scope
\`\`\`

## Local variable type inference – var

\`var\` is allowed **only for local variables** (including \`for\` and enhanced-\`for\` variables, and try-with-resources). Rules:

* Must be initialised in the same statement: \`var x;\` and \`var x = null;\` fail (no type to infer). \`var x = 1; x = null;\` fails later because \`x\` is \`int\`.
* Cannot be a field, method parameter, return type, or constructor parameter. Lambda parameters **can** use \`var\` (Java 11): \`(var a, var b) -> a + b\`.
* Cannot declare several at once: \`var a = 1, b = 2;\` fails. Cannot be an array initializer target: \`var arr = {1, 2};\` fails (\`var arr = new int[]{1,2}\` OK).
* Cannot be initialised with a lambda or method reference (no target type): \`var r = () -> {};\` fails.
* The type is fixed at compile time: \`var s = "a"; s = 1;\` fails. \`var o = 1; o = 2.0;\` fails.
* \`var\` **is not a keyword** – \`var var = "var";\` compiles.
* Watch inferred types: \`var n = 1L;\` is \`long\`; \`var f = 1.0f;\` float; \`var c = 'a';\` char; \`var l = new ArrayList<>();\` is \`ArrayList<Object>\`.

## Scope

* **Local variables**: from declaration to the end of the enclosing block \`{}\`. A nested block **may not redeclare** an outer local. A local **may shadow a field**.
* **Method parameters**: the whole method body.
* **Instance fields**: lifetime of the object. **Static fields**: lifetime of the class (program).
* A local used before *definite assignment* is a compile error: \`int x; if (b) x = 1; System.out.println(x);\` fails even if \`b\` happens to be true.
* A variable declared in an \`if\` block, loop body, or \`for\` header is not visible after the block.

\`\`\`java
public void eat(int bites) {        // bites: whole method
  boolean hungry = true;            // hungry: whole method
  if (hungry) {
    int teeth = 32;                 // teeth: this block only
  }
  System.out.println(teeth);        // DOES NOT COMPILE
}
\`\`\`

## Local variables and final

\`final\` locals must be assigned **exactly once** (may be delayed: \`final int x; x = 5;\`). Effectively final = never reassigned after initialisation (needed for lambdas/inner classes). \`final\` on a reference prevents reassignment only – the object stays mutable.
`
    },
    {
      id: 'summary-table',
      title: 'Quick-reference: where the traps hide',
      md: `| Topic | Compiles? | Why |
|---|---|---|
| \`long x = 3000000000;\` | ✗ | int literal out of range |
| \`float f = 1.5;\` | ✗ | double literal |
| \`byte b = 127; b = 128;\` | ✗ (second) | constant does not fit |
| \`char c = 'a' + 1;\` | ✓ | compile-time constant 98 fits in char |
| \`int x = 0_1_0;\` | ✓ | octal 8, underscores between digits |
| \`int x = 1_000_;\` | ✗ | trailing underscore |
| \`Long l = 5;\` | ✗ | no widen-then-box |
| \`Object o = 5;\` | ✓ | box to Integer then widen reference |
| \`var v;\` | ✗ | no initialiser |
| \`var v = null;\` | ✗ | cannot infer from null |
| \`var v = 1, w = 2;\` | ✗ | one var per statement |
| \`int var = 1;\` | ✓ | var is not a keyword |
| \`String s = """text""";\` | ✗ | needs line break after opening \`"""\` |
| \`int _ = 1;\` | ✗ | lone underscore reserved |
| \`public void Zoo() {}\` in class Zoo | ✓ | a method, not a constructor |
| Local \`int x;\` then \`x++;\` | ✗ | not definitely assigned |
`
    }
  ],

  gotchas: [
    { title: 'Long literal without L', md: '`long big = 3_000_000_000;` **fails** – the literal is an `int` and overflows. Add `L`. A literal within int range (`long l = 100;`) is fine.' },
    { title: 'Floats need f', md: '`float f = 1.0;` does not compile; `1.0` is a `double`. `float f = 1;` compiles (int widens to float).' },
    { title: 'Underscores in numeric literals', md: 'Only **between two digits**. `1_000` ✓, `1_.0` ✗, `_1` (that\'s an identifier!), `1_` ✗, `0x_1` ✗, `1__0` ✓.' },
    { title: 'Octal by accident', md: 'A leading `0` makes an int octal: `010` is **8**, and `09` does not compile (9 is not an octal digit).' },
    { title: 'byte/short/char constant narrowing', md: '`byte b = 10;` compiles because the *constant* fits. `byte b = 128;` fails. `int i = 10; byte b = i;` fails (not a constant) – unless `i` is `final`.' },
    { title: 'char arithmetic', md: '`char c = \'a\'; c = c + 1;` **fails** (int result); `c++` and `c += 1` compile (compound assignment casts). `char c = \'a\' + 1;` compiles – constant expression.' },
    { title: 'Boolean is not 0/1', md: '`boolean b = 0;` and `if (1)` never compile in Java.' },
    { title: 'Integer cache and ==', md: '`Integer a = 127, b = 127; a == b` → `true`. With `128` → `false`. Compare wrappers with `equals()`; the exam expects you to know the −128…127 cache.' },
    { title: 'Wrapper equals across types', md: '`Integer.valueOf(5).equals(5L)` is `false` – different classes. `Integer.valueOf(5) == 5L` is `true` (unboxed and promoted to long).' },
    { title: 'No widen-and-box', md: '`Long l = 5;` and `Double d = 5;` fail; `Object o = 5;` works (box to Integer, then reference widening).' },
    { title: 'Unboxing null', md: '`Integer i = null; int x = i;` throws `NullPointerException` at runtime, compiles fine.' },
    { title: 'var needs an initialiser and a type', md: '`var x;`, `var x = null;`, `var x = {1,2};`, `var f = () -> 1;` all fail. `var` is only for locals – never fields or parameters.' },
    { title: 'var is a legal identifier', md: '`var var = 1;` and `int var = 2;` compile. But `class var {}` does not.' },
    { title: 'A single underscore', md: '`int _ = 5;` fails since Java 9. `int _x = 5;` is fine.' },
    { title: 'Method that looks like a constructor', md: '`public void Zoo() {}` inside `class Zoo` is a **method** (it has a return type). `new Zoo()` still calls the default constructor, so nothing prints from it.' },
    { title: 'Default values are for fields only', md: 'Fields default to `0`/`false`/`null`; a **local** used before assignment is a compile error – not `0`.' },
    { title: 'Text block opening line', md: '`"""` must be followed by a line terminator. `String s = """hi""";` does not compile. Trailing spaces on lines are stripped unless you end the line with `\\s`.' },
    { title: 'Text block closing delimiter position', md: 'Closing `"""` on its own line adds a trailing `\\n` and its column counts toward the indentation margin; on the same line as text there is no trailing newline.' },
    { title: 'Import subtleties', md: '`import java.util.*;` does **not** import `java.util.function.*`. Two explicit imports with the same simple name = compile error; explicit import wins over wildcard.' },
    { title: 'Order in source file', md: '`package` first, then `import`s, then classes. An `import` before `package` fails. Multiple non-public classes per file are fine; only one `public` one, matching the filename.' },
    { title: 'main signature', md: '`static public void main(String... a)` runs. `public void main(String[] a)` compiles but the launcher reports *Main method not found* (it is not static).' },
    { title: 'GC counting', md: 'Count **objects**, not references. `a = b;` makes the object *formerly* referenced by `a` eligible (if nothing else points to it). `System.gc()` is not guaranteed to do anything.' },
    { title: 'Shadowing rules', md: 'A local may shadow a **field** (use `this.x` to reach it) but a nested block may **not** redeclare an enclosing local or parameter.' },
    { title: 'Instance initialiser order', md: 'Initialisers and field assignments run **in textual order before the constructor body**, even if an initialiser is written after the constructor. Referencing a field *before* its declaration in an initialiser is a compile error.' }
  ],

  traps: [
    {
      code: `public class Bird {
  public void Bird() { System.out.print("A"); }
  public Bird(int x) { System.out.print("B"); }
  public static void main(String[] args) {
    new Bird();
  }
}`,
      prompt: 'Does it compile? What prints?',
      answer: '**Does not compile.** `public void Bird()` is a *method*, not a constructor. The only real constructor is `Bird(int)`, so no default constructor exists and `new Bird()` fails. (Remove the `int` constructor and it compiles, printing nothing.)'
    },
    {
      code: `int a = 1_000;
long b = 3_000_000_000L;
float c = 3.14;
double d = 1e2;
char e = 'A' + 1;`,
      prompt: 'Which lines do not compile?',
      answer: 'Only **`float c = 3.14;`** fails – `3.14` is a double. `1_000` is fine, `L` makes the long fit, `1e2` is a double literal (100.0), and `\'A\' + 1` is a compile-time constant (66) that fits in a char.'
    },
    {
      code: `public class Init {
  static { System.out.print("s1 "); }
  { System.out.print("i1 "); }
  public Init() { System.out.print("c "); }
  { System.out.print("i2 "); }
  static { System.out.print("s2 "); }
  public static void main(String[] args) {
    System.out.print("m ");
    new Init(); new Init();
  }
}`,
      prompt: 'What prints?',
      answer: 'Prints **`s1 s2 m i1 i2 c i1 i2 c `**. Static initialisers run once (in order) before `main`; each `new` runs both instance initialisers in textual order, then the constructor body.',
      verify: { files: { 'Init.java': `public class Init {
  static { System.out.print("s1 "); }
  { System.out.print("i1 "); }
  public Init() { System.out.print("c "); }
  { System.out.print("i2 "); }
  static { System.out.print("s2 "); }
  public static void main(String[] args) {
    System.out.print("m ");
    new Init(); new Init();
  }
}` }, expect: { output: 's1 s2 m i1 i2 c i1 i2 c ' } }
    },
    {
      code: `var a = 1;
var b = 2L;
var c = a + b;
var d = "x";
d = null;
var e = null;`,
      prompt: 'Which line fails to compile, and what is the type of c?',
      answer: 'Only **`var e = null;`** fails (nothing to infer). `c` is a **`long`** (binary numeric promotion). `d = null` is fine because `d` is a `String` reference.'
    },
    {
      code: `String block = """
      Hello
        World
      """;
System.out.print(block.length());`,
      prompt: 'What prints?',
      answer: 'Prints **`14`**. Incidental indentation (6 spaces, set by the closing `"""`) is removed, leaving `"Hello\\n  World\\n"`: `Hello` (5) + newline (1) + `  World` (7) + newline (1) = 14. The trailing newline exists because the closing delimiter is on its own line.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
String block = """
      Hello
        World
      """;
System.out.print(block.length());
} }` }, expect: { output: '14' } }
    },
    {
      code: `public class Scope {
  public static void main(String[] args) {
    int x = 1;
    {
      int y = 2;
      x++;
    }
    for (int i = 0; i < 2; i++) { }
    System.out.println(x + y + i);
  }
}`,
      prompt: 'Does it compile?',
      answer: '**No** – two errors. `y` is scoped to the inner block and `i` to the `for` statement; neither is visible at the `println`.'
    },
    {
      code: `Integer a = 127, b = 127, c = 128, d = 128;
System.out.print((a == b) + " " + (c == d) + " " + c.equals(d));`,
      prompt: 'What prints?',
      answer: 'Prints **`true false true`**. Autoboxing uses `Integer.valueOf`, which caches −128..127, so `a` and `b` are the same object while `c` and `d` are distinct. `equals` compares values.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
Integer a = 127, b = 127, c = 128, d = 128;
System.out.print((a == b) + " " + (c == d) + " " + c.equals(d));
} }` }, expect: { output: 'true false true' } }
    },
    {
      code: `public class Gc {
  public static void main(String[] args) {
    StringBuilder a = new StringBuilder("a");
    StringBuilder b = new StringBuilder("b");
    StringBuilder c = a;
    a = null;
    b = new StringBuilder("d");
    // LINE X
  }
}`,
      prompt: 'How many objects are eligible for GC at LINE X?',
      answer: '**One** – the original `"b"` builder. `"a"` is still referenced by `c`; `"d"` is referenced by `b`.'
    }
  ],

  questions: [
    {
      id: 'ch01-q01', type: 'multi', difficulty: 'easy', objectiveIds: ['1a'], tags: ['literals'],
      question: 'Which of the following declarations compile? (Choose all that apply.)',
      code: null,
      options: ['long a = 2147483648;', 'float b = 2.0;', 'double c = 2;', 'int d = 0b12;', 'short e = 32767;'],
      answer: [2, 4],
      explanation: '`2147483648` exceeds `int` and has no `L`. `2.0` is a double, not assignable to float without `f`. `0b12` is invalid – binary digits are 0/1 only. `int` → `double` widens; `32767` fits in `short` (constant narrowing).',
      optionNotes: { '0': 'Needs `L`; the literal itself is an out-of-range int.', '1': 'Needs `2.0f`.', '2': 'Widening int → double is implicit.', '3': '`2` is not a binary digit.', '4': 'Max short value; compile-time constant fits.' },
      verify: null
    },
    {
      id: 'ch01-q02', type: 'single', difficulty: 'easy', objectiveIds: ['1a'], tags: ['literals', 'underscore'],
      question: 'Which numeric literal does NOT compile?',
      code: null,
      options: ['1_000_000', '1__000', '0x7F_FF', '1_000.0_1', '1_000_'],
      answer: [4],
      explanation: 'Underscores must sit between two digits. A trailing underscore is illegal. Consecutive underscores are allowed, and underscores are fine in hex digits and on either side of a decimal point as long as they are between digits.',
      optionNotes: { '0': 'Classic separator use.', '1': 'Multiple underscores between digits are legal.', '2': 'Between hex digits – legal.', '3': 'Both underscores sit between digits.', '4': 'Trailing underscore – compile error.' },
      verify: null
    },
    {
      id: 'ch01-q03', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['octal', 'literals'],
      question: 'What is the output?',
      code: `int a = 010;
int b = 0x10;
int c = 0b10;
System.out.println(a + b + c);`,
      options: ['30', '26', '20', '12', 'The code does not compile.'],
      answer: [1],
      explanation: '`010` is octal 8, `0x10` is hex 16, `0b10` is binary 2. 8 + 16 + 2 = 26.',
      optionNotes: { '0': 'Treats `010` as decimal 10 and `0x10`/`0b10` as 10.', '1': 'Correct: 8 + 16 + 2.', '2': 'Wrong base conversions.', '3': 'Wrong base conversions.', '4': 'All three literals are valid.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
int a = 010;
int b = 0x10;
int c = 0b10;
System.out.println(a + b + c);
} }` }, expect: { output: '26' } }
    },
    {
      id: 'ch01-q04', type: 'multi', difficulty: 'medium', objectiveIds: ['1a'], tags: ['char', 'byte', 'narrowing'],
      question: 'Which lines compile? (Choose all that apply.)',
      code: `byte b1 = 127;          // line 1
byte b2 = 128;          // line 2
char c1 = 65;           // line 3
char c2 = -1;           // line 4
int i = 10;
byte b3 = i;            // line 5
final int j = 10;
byte b4 = j;            // line 6`,
      options: ['line 1', 'line 2', 'line 3', 'line 4', 'line 5', 'line 6'],
      answer: [0, 2, 5],
      explanation: 'Compile-time constants of type int may be narrowed to byte/short/char if the value fits. `128` does not fit a byte; `-1` does not fit a char (unsigned). A non-final `int` variable is not a constant so line 5 fails; a `final int` initialised with a constant *is* a constant so line 6 compiles.',
      optionNotes: { '0': '127 fits.', '1': '128 > Byte.MAX_VALUE.', '2': '65 fits in char (\'A\').', '3': 'char cannot be negative.', '4': '`i` is not a compile-time constant.', '5': '`j` is a constant variable; 10 fits.' },
      verify: null
    },
    {
      id: 'ch01-q05', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['char', 'compound-assignment'],
      question: 'What is the result of compiling and running this code?',
      code: `char c = 'a';
c++;
c += 1;
c = c + 1;
System.out.println(c);`,
      options: ['d', 'c', '100', 'The code does not compile.', 'A runtime exception is thrown.'],
      answer: [3],
      explanation: '`c++` and `c += 1` include an implicit cast back to `char`. `c = c + 1` does not: `c + 1` is an `int` and cannot be assigned to a `char` without an explicit cast.',
      optionNotes: { '0': 'Would print if the last assignment were cast: `(char)(c + 1)`.', '1': 'Ignores the compile error.', '2': 'Would need an int variable.', '3': 'Correct: `int` cannot be assigned to `char`.', '4': 'Never runs.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
char c = 'a';
c++;
c += 1;
c = c + 1;
System.out.println(c);
} }` }, expect: 'compile-error' }
    },
    {
      id: 'ch01-q06', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['wrapper', 'cache'],
      question: 'What is the output?',
      code: `Integer a = 100;
Integer b = 100;
Integer c = 1000;
Integer d = 1000;
System.out.println((a == b) + " " + (c == d) + " " + c.equals(d));`,
      options: ['true true true', 'true false true', 'false false true', 'true false false', 'The code does not compile.'],
      answer: [1],
      explanation: 'Autoboxing calls `Integer.valueOf`, which returns cached instances for −128…127. 100 is cached (same object), 1000 is not (two objects). `equals` compares values.',
      optionNotes: { '0': '1000 is outside the cache.', '1': 'Correct.', '2': '100 is inside the cache range.', '3': '`equals` compares numeric value.', '4': 'Compiles fine.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
Integer a = 100;
Integer b = 100;
Integer c = 1000;
Integer d = 1000;
System.out.println((a == b) + " " + (c == d) + " " + c.equals(d));
} }` }, expect: { output: 'true false true' } }
    },
    {
      id: 'ch01-q07', type: 'multi', difficulty: 'medium', objectiveIds: ['1a'], tags: ['wrapper', 'boxing'],
      question: 'Which statements compile? (Choose all that apply.)',
      code: null,
      options: ['Long a = 10;', 'Long b = 10L;', 'Double c = 10.0f;', 'Object d = 10;', 'Integer e = (int) 10L;', 'Character f = 65;'],
      answer: [1, 3, 4, 5],
      explanation: 'Boxing does not combine with widening: `int` → `Long` and `float` → `Double` fail. `Object d = 10` boxes to `Integer` then widens the reference. Casting `10L` to `int` yields an int that boxes to `Integer`. `65` is an int constant that fits a `char`, so it narrows to `char` and boxes to `Character`.',
      optionNotes: { '0': 'int cannot box to Long.', '1': 'long boxes to Long.', '2': 'float cannot box to Double.', '3': 'Integer is an Object.', '4': 'Cast gives int; int boxes to Integer.', '5': 'Constant narrowing to char, then boxing – legal.' },
      verify: null
    },
    {
      id: 'ch01-q08', type: 'single', difficulty: 'easy', objectiveIds: ['1a'], tags: ['wrapper', 'parse'],
      question: 'What is the output?',
      code: `int a = Integer.parseInt("12");
Integer b = Integer.valueOf("12");
boolean c = Boolean.parseBoolean("TRUE");
boolean d = Boolean.parseBoolean("yes");
System.out.println(a + b + " " + c + " " + d);`,
      options: ['1212 true false', '24 true false', '24 true true', '1212 true true', 'The code does not compile.'],
      answer: [1],
      explanation: '`a + b` is int + Integer = 24 (unboxing) evaluated before the String concatenation. `parseBoolean` is case-insensitive and returns `true` only for "true"; "yes" → `false`.',
      optionNotes: { '0': 'Addition happens before concatenation (left to right).', '1': 'Correct.', '2': '"yes" is not "true".', '3': 'Both wrong.', '4': 'Compiles.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
int a = Integer.parseInt("12");
Integer b = Integer.valueOf("12");
boolean c = Boolean.parseBoolean("TRUE");
boolean d = Boolean.parseBoolean("yes");
System.out.println(a + b + " " + c + " " + d);
} }` }, expect: { output: '24 true false' } }
    },
    {
      id: 'ch01-q09', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['wrapper', 'npe'],
      question: 'What is the result?',
      code: `Integer count = null;
int total = 5;
if (count != null || total > 0) {
  total += count;
}
System.out.println(total);`,
      options: ['5', '0', 'The code does not compile.', 'A NullPointerException is thrown.', 'A ClassCastException is thrown.'],
      answer: [3],
      explanation: 'The condition is `false || true` → the block runs. `total += count` unboxes `null` → `NullPointerException`.',
      optionNotes: { '0': 'The block does execute.', '1': 'Never reached.', '2': 'Compiles: `int += Integer` is legal.', '3': 'Correct: unboxing null.', '4': 'No cast involved.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
Integer count = null;
int total = 5;
if (count != null || total > 0) {
  total += count;
}
System.out.println(total);
} }` }, expect: 'runtime-exception' }
    },
    {
      id: 'ch01-q10', type: 'multi', difficulty: 'medium', objectiveIds: ['3d'], tags: ['var'],
      question: 'Which of the following compile? (Choose all that apply.)',
      code: null,
      options: ['var a = 1, b = 2;', 'var c = null;', 'var d = new int[]{1, 2};', 'var e = {1, 2};', 'var f = "hi"; f = null;', 'var g = 1; g = 1.5;'],
      answer: [2, 4],
      explanation: '`var` allows one variable per statement, needs a non-null initialiser of an inferable type, and cannot use an array initializer shorthand. Once inferred, the type is fixed: `f` is `String` (null is fine), `g` is `int` (1.5 is a double – fails).',
      optionNotes: { '0': 'One `var` per statement.', '1': 'Cannot infer from `null`.', '2': 'Type inferred as `int[]`.', '3': 'Array initializer requires an explicit type.', '4': 'Reference type may be reassigned null.', '5': 'double cannot be assigned to int.' },
      verify: null
    },
    {
      id: 'ch01-q11', type: 'single', difficulty: 'hard', objectiveIds: ['3d'], tags: ['var', 'identifier'],
      question: 'What is the output?',
      code: `public class Var {
  public static void main(String[] args) {
    var var = "var";
    int x = var.length();
    var y = x * 2L;
    System.out.println(var + x + y);
  }
}`,
      options: ['var36', 'var 3 6', 'var9', 'The code does not compile because var cannot be an identifier.', 'The code does not compile for another reason.'],
      answer: [0],
      explanation: '`var` is a reserved *type name*, not a keyword, so `var var` is legal. `x` is 3, `y` is a `long` 6. String concatenation left to right gives `var36`.',
      optionNotes: { '0': 'Correct.', '1': 'No spaces are concatenated.', '2': 'Concatenation, not addition.', '3': 'Only `class var` is illegal.', '4': 'Everything else is fine.' },
      verify: { files: { 'Var.java': `public class Var {
  public static void main(String[] args) {
    var var = "var";
    int x = var.length();
    var y = x * 2L;
    System.out.println(var + x + y);
  }
}` }, expect: { output: 'var36' } }
    },
    {
      id: 'ch01-q12', type: 'multi', difficulty: 'easy', objectiveIds: ['3d'], tags: ['var', 'placement'],
      question: 'In which places may `var` legally be used? (Choose all that apply.)',
      code: null,
      options: ['An instance field', 'A local variable inside a method', 'A method parameter', 'The loop variable of an enhanced for statement', 'A method return type', 'A lambda parameter'],
      answer: [1, 3, 5],
      explanation: '`var` is only for local variable declarations: ordinary locals, `for`/enhanced-`for` variables, try-with-resources, and (since Java 11) lambda parameters. Fields, method parameters and return types must use explicit types.',
      optionNotes: { '0': 'Fields need explicit types.', '1': 'The primary use case.', '2': 'Not allowed.', '3': '`for (var s : list)` is fine.', '4': 'Not allowed.', '5': '`(var a, var b) -> a + b` is legal (all-or-none).' },
      verify: null
    },
    {
      id: 'ch01-q13', type: 'multi', difficulty: 'easy', objectiveIds: ['3d'], tags: ['identifier'],
      question: 'Which are legal identifiers? (Choose all that apply.)',
      code: null,
      options: ['_', '$total', '2ndPlace', 'record', 'true', 'Integer', 'my-var'],
      answer: [1, 3, 5],
      explanation: 'Identifiers may start with a letter, `$` or `_` and cannot be a keyword or literal. A lone `_` is reserved (Java 9+). `record` is a contextual keyword and a legal identifier. `Integer` is a class name but not reserved. Hyphens are illegal.',
      optionNotes: { '0': 'Reserved since Java 9.', '1': '`$` may start an identifier.', '2': 'Cannot start with a digit.', '3': 'Contextual keyword – legal name.', '4': 'Literal – reserved.', '5': 'Legal, if confusing.', '6': 'Hyphen is an operator.' },
      verify: null
    },
    {
      id: 'ch01-q14', type: 'single', difficulty: 'medium', objectiveIds: ['3d'], tags: ['scope', 'definite-assignment'],
      question: 'What is the result?',
      code: `public class Scope {
  public static void main(String[] args) {
    int total;
    boolean ok = args.length == 0;
    if (ok) total = 10;
    else if (!ok) total = 20;
    System.out.println(total);
  }
}`,
      options: ['10', '20', '0', 'The code does not compile.', 'It depends on the arguments passed.'],
      answer: [3],
      explanation: 'The compiler does not reason that `ok` and `!ok` cover every case; without an `else` branch `total` is not *definitely assigned* on all paths, so the `println` fails to compile.',
      optionNotes: { '0': 'Would be right with an `else` branch.', '1': 'See above.', '2': 'Locals have no default value.', '3': 'Correct: definite assignment analysis fails.', '4': 'Never compiles.' },
      verify: { files: { 'Scope.java': `public class Scope {
  public static void main(String[] args) {
    int total;
    boolean ok = args.length == 0;
    if (ok) total = 10;
    else if (!ok) total = 20;
    System.out.println(total);
  }
}` }, expect: 'compile-error' }
    },
    {
      id: 'ch01-q15', type: 'single', difficulty: 'medium', objectiveIds: ['3d'], tags: ['scope', 'shadowing'],
      question: 'Which line fails to compile?',
      code: `public class Shadow {
  int x = 1;                          // line 2
  void run(int y) {
    int x = 2;                        // line 4
    for (int i = 0; i < 1; i++) {
      int y = 3;                      // line 6
      int z = x + y + this.x;         // line 7
    }
    int i = 5;                        // line 9
  }
}`,
      options: ['line 4', 'line 6', 'line 7', 'line 9', 'None – it compiles.'],
      answer: [1],
      explanation: 'A local variable may shadow a field (line 4 is fine), but a nested scope may not redeclare a parameter or local that is still in scope – `y` is the method parameter, so line 6 fails. Line 9 is fine because the `for` variable `i` is out of scope.',
      optionNotes: { '0': 'Shadowing a field is allowed.', '1': 'Correct: duplicate variable `y`.', '2': 'Would be fine otherwise.', '3': 'Loop `i` is out of scope here.', '4': 'Line 6 is an error.' },
      verify: null
    },
    {
      id: 'ch01-q16', type: 'single', difficulty: 'medium', objectiveIds: ['3a', '3b'], tags: ['initializer', 'order'],
      question: 'What is the output?',
      code: `public class Chick {
  private String name = "egg";
  { System.out.print(name + "-"); }
  private Chick() { name = "chick"; System.out.print(name + "-"); }
  { name = "hatching"; }
  public static void main(String[] args) {
    new Chick();
    System.out.print("done");
  }
}`,
      options: ['egg-chick-done', 'egg-hatching-chick-done', 'hatching-chick-done', 'chick-done', 'The code does not compile.'],
      answer: [0],
      explanation: 'Field initialisers and instance initialisers run in textual order before the constructor body: `name = "egg"`, print `egg-`, `name = "hatching"` (silently), then the constructor sets `chick` and prints `chick-`. A private constructor is callable from within the class.',
      optionNotes: { '0': 'Correct.', '1': 'The second initialiser does not print.', '2': 'The print happens before `hatching` is assigned.', '3': 'The first initialiser prints `egg-`.', '4': 'Compiles – private constructor is fine inside its class.' },
      verify: { files: { 'Chick.java': `public class Chick {
  private String name = "egg";
  { System.out.print(name + "-"); }
  private Chick() { name = "chick"; System.out.print(name + "-"); }
  { name = "hatching"; }
  public static void main(String[] args) {
    new Chick();
    System.out.print("done");
  }
}` }, expect: { output: 'egg-chick-done' } }
    },
    {
      id: 'ch01-q17', type: 'single', difficulty: 'medium', objectiveIds: ['3a'], tags: ['constructor', 'trap'],
      question: 'What is the output?',
      code: `public class Rabbit {
  public void Rabbit() { System.out.print("hop "); }
  public static void main(String[] args) {
    Rabbit r = new Rabbit();
    r.Rabbit();
    System.out.print("end");
  }
}`,
      options: ['hop hop end', 'hop end', 'end', 'The code does not compile.', 'A runtime exception is thrown.'],
      answer: [1],
      explanation: '`public void Rabbit()` has a return type, so it is a method, not a constructor. `new Rabbit()` uses the compiler-generated default constructor and prints nothing. The explicit call `r.Rabbit()` prints `hop `.',
      optionNotes: { '0': 'The default constructor prints nothing.', '1': 'Correct.', '2': 'The method call does print.', '3': 'Compiles; a method may share the class name.', '4': 'Nothing throws.' },
      verify: { files: { 'Rabbit.java': `public class Rabbit {
  public void Rabbit() { System.out.print("hop "); }
  public static void main(String[] args) {
    Rabbit r = new Rabbit();
    r.Rabbit();
    System.out.print("end");
  }
}` }, expect: { output: 'hop end' } }
    },
    {
      id: 'ch01-q18', type: 'single', difficulty: 'medium', objectiveIds: ['3a'], tags: ['gc'],
      question: 'How many objects are eligible for garbage collection immediately after line 7?',
      code: `public class Zoo {
  public static void main(String[] args) {
    String a = new String("lion");      // line 3
    String b = new String("tiger");     // line 4
    String c = a;                       // line 5
    a = new String("bear");             // line 6
    b = null;                           // line 7
    System.out.println(a + c);
  }
}`,
      options: ['0', '1', '2', '3', 'It cannot be determined.'],
      answer: [1],
      explanation: '"lion" is still referenced by `c`. "bear" is referenced by `a`. Only "tiger" lost its last reference when `b` was set to null.',
      optionNotes: { '0': '"tiger" is unreachable.', '1': 'Correct.', '2': '"lion" is still reachable through `c`.', '3': 'Only one object is unreachable.', '4': 'Eligibility is determinable from the code; when GC *runs* is not.' },
      verify: null
    },
    {
      id: 'ch01-q19', type: 'multi', difficulty: 'easy', objectiveIds: ['3a'], tags: ['gc'],
      question: 'Which statements about garbage collection in Java are true? (Choose all that apply.)',
      code: null,
      options: ['Calling System.gc() guarantees that eligible objects are collected before it returns.', 'An object becomes eligible when there are no reachable references to it.', 'Setting the only reference to an object to null makes the object eligible.', 'A program can determine exactly when an object is collected.', 'An object referenced only by another unreachable object is eligible.'],
      answer: [1, 2, 4],
      explanation: '`System.gc()` is a hint only. Eligibility is about reachability from live references; an island of objects referencing each other but unreachable from the program is eligible as a whole.',
      optionNotes: { '0': 'The JVM may ignore the request.', '1': 'The definition of eligibility.', '2': 'If it was the only reference.', '3': 'No API guarantees timing.', '4': 'Reachability is transitive from roots, so an island is collectable.' },
      verify: null
    },
    {
      id: 'ch01-q20', type: 'single', difficulty: 'medium', objectiveIds: ['1b'], tags: ['text-block'],
      question: 'What is the output?',
      code: `String s = """
    <a>
      text
    </a>""";
System.out.print(s.length());`,
      options: ['15', '16', '19', '31', 'The code does not compile.'],
      answer: [0],
      explanation: 'The margin is set by the least-indented lines (4 spaces) and stripped. Result: `"<a>\\n  text\\n</a>"` = 3 + 1 + 6 + 1 + 4 = 15. Because the closing `"""` is on the same line as `</a>`, there is no trailing newline.',
      optionNotes: { '0': 'Correct.', '1': 'Would be right if the closing delimiter were on its own line (trailing newline).', '2': 'Counts the relative indentation of `text` as 6 extra spaces.', '3': 'Keeps all incidental indentation.', '4': 'The text block is valid.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
String s = """
    <a>
      text
    </a>""";
System.out.print(s.length());
} }` }, expect: { output: '15' } }
    },
    {
      id: 'ch01-q21', type: 'multi', difficulty: 'medium', objectiveIds: ['1b'], tags: ['text-block'],
      question: 'Which statements about text blocks are true? (Choose all that apply.)',
      code: null,
      options: ['The opening """ must be followed by a line terminator.', 'A text block always ends with a newline character.', 'Trailing whitespace on each line is preserved.', 'A double quote inside a text block does not need to be escaped.', 'The position of the closing """ can affect how much indentation is stripped.', 'A text block is of type String.'],
      answer: [0, 3, 4, 5],
      explanation: 'Text blocks strip incidental indentation (the closing delimiter counts if on its own line) and trailing whitespace (unless `\\s` is used). The trailing newline exists only if the closing `"""` is on its own line. Single `"` characters need no escape.',
      optionNotes: { '0': 'Otherwise a compile error.', '1': 'Only when the closing delimiter is on its own line.', '2': 'Trailing whitespace is stripped.', '3': 'True; only `"""` needs escaping.', '4': 'The closing delimiter contributes to the margin.', '5': 'It is just a String literal in different syntax.' },
      verify: null
    },
    {
      id: 'ch01-q22', type: 'single', difficulty: 'medium', objectiveIds: ['1b'], tags: ['text-block', 'escape'],
      question: 'What is the output?',
      code: `String s = """
    one \\
    two\\s
    three
    """;
System.out.print(s);`,
      options: ['one two three\\n', 'one two \\nthree\\n', 'one \\ntwo \\nthree\\n', 'one \\\\\\ntwo\\\\s\\nthree\\n', 'The code does not compile.'],
      answer: [1],
      explanation: '`\\` at the end of a line suppresses the newline, so `one ` joins with `two`. `\\s` is an escaped space that also protects the trailing space from stripping, giving `two ` followed by a newline. The closing delimiter on its own line adds a final newline.',
      optionNotes: { '0': 'There is still a newline after `two `.', '1': 'Correct: "one two \\nthree\\n".', '2': 'The backslash suppresses the first newline.', '3': 'These are escape sequences, not literal characters.', '4': 'Both escapes are valid in text blocks.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
String s = """
    one \\
    two\\s
    three
    """;
System.out.print(s.replace("\\n", "|"));
} }` }, expect: { output: 'one two |three|' } }
    },
    {
      id: 'ch01-q23', type: 'multi', difficulty: 'medium', objectiveIds: ['3a'], tags: ['main', 'launch'],
      question: 'Which of these method declarations can serve as the entry point of a Java application? (Choose all that apply.)',
      code: null,
      options: ['public static void main(String[] args)', 'static public void main(String... args)', 'public static int main(String[] args)', 'public void main(String[] args)', 'public static final void main(final String args[])', 'public static void main()'],
      answer: [0, 1, 4],
      explanation: 'The entry point must be `public static void main` with a single `String[]` (or varargs) parameter. Modifier order is irrelevant and `final` is allowed on the method and the parameter. Return type `int`, a missing `static`, or a missing parameter disqualify the method.',
      optionNotes: { '0': 'Canonical.', '1': 'Varargs and reordered modifiers are fine.', '2': 'Must return void.', '3': 'Must be static.', '4': '`final` is allowed.', '5': 'Missing String[] parameter.' },
      verify: null
    },
    {
      id: 'ch01-q24', type: 'single', difficulty: 'medium', objectiveIds: ['3a'], tags: ['imports'],
      question: 'Given the imports below, which statement is true?',
      code: `import java.util.*;
import java.sql.*;
public class Db {
  public static void main(String[] args) {
    Date d = null;
    System.out.println(d);
  }
}`,
      options: ['It compiles and prints null.', 'It does not compile because Date is ambiguous.', 'It does not compile because java.sql.* cannot be imported with java.util.*.', 'It compiles because java.util.Date takes precedence.', 'It throws a runtime exception.'],
      answer: [1],
      explanation: 'Both packages contain a class named `Date`. Two wildcard imports are legal until the ambiguous simple name is used; using `Date` makes the reference ambiguous → compile error. An explicit `import java.util.Date;` would resolve it.',
      optionNotes: { '0': 'Ambiguity is a compile error.', '1': 'Correct.', '2': 'Importing both packages is legal.', '3': 'No precedence between two wildcards.', '4': 'Never compiles.' },
      verify: null
    },
    {
      id: 'ch01-q25', type: 'multi', difficulty: 'easy', objectiveIds: ['3a'], tags: ['source-file'],
      question: 'Which statements about Java source files are true? (Choose all that apply.)',
      code: null,
      options: ['A file may contain more than one top-level class.', 'A file may contain more than one public top-level class.', 'A package statement, if present, must come before any import statements.', 'import java.util.*; also imports classes in java.util.function.', 'Comments may appear before the package statement.'],
      answer: [0, 2, 4],
      explanation: 'Only one public top-level class per file (named after the file), but any number of package-private ones. The order is package → imports → types, and comments can go anywhere outside tokens. Wildcards do not descend into sub-packages.',
      optionNotes: { '0': 'True, as long as at most one is public.', '1': 'At most one.', '2': 'True.', '3': 'Sub-packages are separate.', '4': 'True.' },
      verify: null
    },
    {
      id: 'ch01-q26', type: 'single', difficulty: 'hard', objectiveIds: ['1a', '3b'], tags: ['static', 'default-values'],
      question: 'What is the output?',
      code: `public class Counter {
  static int count;
  int id;
  double ratio;
  boolean flag;
  String name;
  public static void main(String[] args) {
    Counter c = new Counter();
    count++;
    System.out.println(count + " " + c.id + " " + c.ratio + " " + c.flag + " " + c.name);
  }
}`,
      options: ['1 0 0.0 false null', '1 0 0 false null', '0 0 0.0 false null', 'The code does not compile because fields are not initialised.', '1 0 0.0 false '],
      answer: [0],
      explanation: 'Fields receive default values: `int` 0, `double` 0.0 (printed with the decimal point), `boolean` false, references `null`. `count` is static and incremented once.',
      optionNotes: { '0': 'Correct.', '1': 'A double prints as `0.0`.', '2': '`count++` happened.', '3': 'Fields are auto-initialised; only locals are not.', '4': 'Concatenating null prints "null".' },
      verify: { files: { 'Counter.java': `public class Counter {
  static int count;
  int id;
  double ratio;
  boolean flag;
  String name;
  public static void main(String[] args) {
    Counter c = new Counter();
    count++;
    System.out.println(count + " " + c.id + " " + c.ratio + " " + c.flag + " " + c.name);
  }
}` }, expect: { output: '1 0 0.0 false null' } }
    }
  ],

  checklist: [
    'I can identify the eight primitives, their sizes, default values and which literals need L or f suffixes.',
    'I know the underscore, octal, hex and binary literal rules.',
    'I know when constant narrowing to byte/short/char is allowed and why `c = c + 1` fails for a char.',
    'I know the Integer cache range and why == on wrappers is unreliable; I compare wrappers with equals().',
    'I know boxing never combines with widening (Long l = 5 fails) and that unboxing null throws NPE.',
    'I can list every place var is allowed and every var declaration that fails to compile.',
    'I know var, record, sealed, permits and yield are legal identifiers and a lone _ is not.',
    'I can apply definite assignment and local scope rules, including shadowing a field vs redeclaring a local.',
    'I can trace field initialisers, instance initialisers and constructor order.',
    'I can spot a method disguised as a constructor.',
    'I can count objects eligible for GC and know System.gc() is only a hint.',
    'I know the text block rules: opening line break, incidental indentation, closing delimiter position, \\ and \\s escapes.',
    'I know the valid main() signatures and the rules for package/import order and wildcard imports.'
  ]
});
