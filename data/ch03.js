OCP.registerChapter({
  id: 3,
  slug: 'making-decisions',
  title: 'Making Decisions',
  objectiveIds: ['2'],
  intro: `This chapter covers exam objective **"Controlling Program Flow"**: \`if/else\`, the \`switch\` statement and the \`switch\` *expression*, pattern matching with \`instanceof\`, the four loop forms, labels, and \`break\`/\`continue\`. Expect 4–7 questions on the real exam from this area, almost always in the form of *"what is the output?"* or *"which lines fail to compile?"*. The compiler rules (exhaustiveness, unreachable code, definite assignment, flow scoping) are tested far more than plain logic.`,

  notes: [
    {
      id: 'if-else',
      title: 'if / else statements',
      md: `## Syntax essentials

\`\`\`java
if (booleanExpression) statement
else if (booleanExpression) statement
else statement
\`\`\`

* The condition **must be a \`boolean\`** (or \`Boolean\`, which is auto-unboxed). \`if (x = 5)\` does not compile for \`int x\`; \`if (flag = true)\` **does** compile for \`boolean flag\` (assignment yields a boolean) – a favourite trap.
* Braces are optional for a *single statement*. Without braces only the **next statement** belongs to the \`if\`; indentation is irrelevant to the compiler.
* A **declaration is not a statement** that can stand alone under a brace-less \`if\`: \`if (b) int x = 1;\` does not compile.
* An \`else\` binds to the **nearest unmatched \`if\`** (dangling else).

\`\`\`java
int hour = 11;
if (hour < 12)
  System.out.println("Good morning");
  System.out.println("Always printed");   // NOT part of the if
\`\`\`

## Ternary operator

\`condition ? expr1 : expr2\` – both branches must be *type-compatible* with the target. Only one branch is evaluated (relevant when branches have side effects such as \`i++\`). Ternaries can be nested but the exam mostly tests **evaluation order and type promotion**:

\`\`\`java
int i = 5;
Object o = i > 3 ? "big" : 7;     // OK: Object
int n   = i > 3 ? 1 : 2.0;        // DOES NOT COMPILE: 2.0 makes result double
\`\`\`

## Pattern matching for instanceof (Java 16+)

\`\`\`java
Object o = "hello";
if (o instanceof String s && s.length() > 3) {  // s in scope here
  System.out.println(s.toUpperCase());
}
\`\`\`

* The **pattern variable** (\`s\`) is only in scope where the compiler can prove the match succeeded – this is **flow scoping**.
* With \`&&\` the variable is usable in the right-hand operand; with \`||\` it is **not** (\`o instanceof String s || s.isEmpty()\` does not compile).
* Negation flips scoping: after \`if (!(o instanceof String s)) return;\` the variable \`s\` **is** in scope in the rest of the method.
* The pattern type must be a **subtype** of the expression's static type and the compiler rejects patterns that can never match or always match with the same type: \`Integer i = 5; if (i instanceof Integer x)\` does **not** compile (Java 17 – pattern type identical to the expression type is an error; it became allowed only in Java 21).
* A pattern variable is an ordinary local variable (not \`final\` unless you say so): it may be reassigned, it may shadow a **field**, but it may **not** have the same name as a local variable or parameter already in scope (compile error).
`
    },
    {
      id: 'switch-statement',
      title: 'The switch statement',
      md: `## Allowed selector types

| Allowed | Not allowed |
|---|---|
| \`int\`, \`short\`, \`byte\`, \`char\` (and wrappers \`Integer\`, \`Short\`, \`Byte\`, \`Character\`) | \`long\`, \`float\`, \`double\`, \`boolean\` (and their wrappers) |
| \`String\` | any other object type (in Java 17, no type patterns on the exam) |
| enum types | \`var\` resolves to one of the above – fine |

## Rules for case labels

1. Each \`case\` value must be a **compile-time constant** of a type *assignable* to the selector: literals, \`final\` variables initialised with a constant, enum constants, constant expressions (\`1 + 2\`, \`"a" + "b"\`). A non-final local or a method call → compile error.
2. **No duplicates**; e.g. \`case 1:\` and \`case 3 - 2:\` conflict.
3. For an \`enum\` selector, write the **unqualified** constant: \`case SPRING:\` not \`case Season.SPRING:\` (the latter is a compile error in Java 17).
4. Values must fit the selector type: \`byte b; switch (b) { case 128: }\` fails (out of range) – but \`case 'a':\` on an \`int\` selector is fine (\`char\` widens to \`int\`).
5. \`default\` is optional, may appear **anywhere**, and is entered when nothing matches (even if it is listed first).
6. \`null\` selector → \`NullPointerException\` at runtime (no \`case null\` in Java 17).

## Fall-through

Without \`break\`, execution continues **into the next case body**, including \`default\`, until a \`break\` or the end of the switch.

\`\`\`java
int day = 3;
switch (day) {
  case 1: System.out.print("Mon ");
  default: System.out.print("Other ");
  case 3: System.out.print("Wed ");
  case 4: System.out.print("Thu "); break;
  case 5: System.out.print("Fri ");
}
// prints: Wed Thu
\`\`\`

Multiple values per label (Java 14+): \`case 1, 2, 3:\`.

## Arrow form of the switch *statement*

\`case 1 -> System.out.println("one");\` A switch **statement** can also use arrows; then there is **no fall-through** and each right-hand side is a single expression, a block, or a \`throw\`. You cannot mix \`:\` and \`->\` in one switch.
`
    },
    {
      id: 'switch-expressions',
      title: 'Switch expressions (Java 14+)',
      md: `A \`switch\` *expression* **returns a value** and is usually terminated with a semicolon because it is used in an assignment or return.

\`\`\`java
var result = switch (day) {
  case 1, 7 -> "Weekend";
  case 2, 3, 4, 5, 6 -> "Weekday";
  default -> {
    System.out.println("invalid");
    yield "Unknown";          // yield is REQUIRED inside a block
  }
};   // <-- semicolon required
\`\`\`

## Rules the exam tests

| Rule | Consequence |
|---|---|
| **Every branch must yield a value** (or throw) when the result is used | A block without \`yield\` on every path → compile error |
| **Exhaustive**: for \`int\`, \`String\`, etc. a \`default\` is **mandatory**; for an \`enum\` you may cover **all constants** *or* provide \`default\` | Missing default with a non-enum selector → "the switch expression does not cover all possible input values" |
| All yielded values must be **assignable to the target type** | \`int x = switch (s) { case "a" -> 1; default -> "b"; }\` fails |
| Cannot \`return\` from inside a switch expression, and \`break\`/\`continue\` **cannot jump out of it** | Compile error |
| \`yield\` is a *restricted identifier*, not a keyword — inside a switch expression it must be a statement | \`yield;\` alone is invalid |
| Arrow \`->\` branches don't fall through; a colon-form switch expression is legal and uses \`yield\` for every case | \`case 1: yield 10;\` |

### Type of a switch expression
If used with \`var\`, the type is determined like a ternary: numeric branches are **promoted** (\`case 1 -> 1; default -> 2.0\` gives \`double\`), mixed object types resolve to the nearest common supertype.

### Statement vs expression
Exhaustiveness is enforced only when the switch is used as an **expression** (its value is consumed). \`switch (x) { case 1 -> foo(); }\` standing alone is an arrow-form *statement* and needs no \`default\`.
`
    },
    {
      id: 'loops',
      title: 'while, do/while, for and for-each',
      md: `## while and do/while

\`\`\`java
while (cond) statement;        // 0..n executions
do statement while (cond);     // 1..n executions – NOTE the trailing semicolon
\`\`\`

Variables declared inside the loop body are **out of scope** in the condition of a do/while.

## Classic for loop

\`for (initialization; booleanExpression; updateStatement) body\`

* All three parts are **optional**: \`for (;;)\` is an infinite loop.
* The initialization may declare **multiple variables of the same type**: \`for (int i = 0, j = 10; i < j; i++, j--)\`. Declaring *different* types (\`int i = 0, long j = 0\`) or mixing a declaration with an existing variable (\`int i = 0, j\` where \`j\` exists) is a compile error.
* \`var\` is allowed: \`for (var i = 0; …)\`.
* Loop variables are **scoped to the loop**; using \`i\` after the loop fails to compile.
* You **may not redeclare** a variable already in scope: \`int x = 1; for (int x = 0; …)\` fails.
* Order: init → condition → body → update → condition → …

## Enhanced for (for-each)

\`for (Type name : arrayOrIterable) body\`

* The right side must be an **array** or implement **\`java.lang.Iterable\`** (\`List\`, \`Set\`, \`Queue\`…). A \`Map\` is *not* Iterable – iterate \`map.entrySet()\`/\`keySet()\`/\`values()\`.
* Element type must be assignable: \`for (int n : List.of(1, 2))\` works via unboxing; \`for (long n : intArray)\` works via widening; \`for (Integer n : longArray)\` fails.
* Modifying the loop variable does **not** modify the array element (it's a copy of the reference/value).
* Structurally modifying a collection while iterating it → \`ConcurrentModificationException\` (except via the iterator's \`remove\`, or for concurrent collections).

## Nested loops, labels, break and continue

\`\`\`java
OUTER: for (int i = 0; i < 3; i++) {
  for (int j = 0; j < 3; j++) {
    if (j == 1) continue OUTER;   // jumps to i++
    if (i == 2) break OUTER;      // exits both loops
    System.out.print(i + "" + j + " ");
  }
}
// prints: 00 10
\`\`\`

* \`break\` exits the innermost \`switch\`/loop; \`continue\` skips to the next iteration of the innermost loop.
* A **label** can be on any statement (even a block), but \`continue LABEL\` requires the label to be on a **loop** enclosing the statement.
* \`break\` inside a \`switch\` that is inside a loop exits the **switch**, not the loop.
* A labelled \`break\` out of a block is legal: \`BLOCK: { … break BLOCK; }\`.

## Unreachable code = compile error

The compiler rejects statements it can prove are never reached:

\`\`\`java
while (true) { }
System.out.println("never");     // DOES NOT COMPILE

for (;;) { break; }
System.out.println("reached");   // fine – break makes it reachable

int f() { while (true) { } }     // legal: no return needed

boolean flag = true;
while (flag) { }
System.out.println("ok");        // fine – flag is not a constant expression
\`\`\`

Also: any statement right after \`break\`, \`continue\`, \`return\` or \`throw\` in the same block does not compile. An \`if (false) { … }\` is **allowed** (special exception for conditional compilation).
`
    },
    {
      id: 'summary-table',
      title: 'Quick-reference tables',
      md: `## Loop comparison

| Construct | Runs at least once? | Typical use |
|---|---|---|
| \`while\` | No | Unknown number of iterations |
| \`do/while\` | **Yes** | Menu loops; read-then-check |
| \`for\` | No | Known count / index needed |
| for-each | No | Every element, no index, no removal |

## break / continue targets

| Statement | Unlabelled target | Labelled target |
|---|---|---|
| \`break\` | innermost loop **or switch** | any labelled *statement* enclosing it |
| \`continue\` | innermost loop | labelled **loop** enclosing it |
| \`return\` | whole method | – |

## switch statement vs switch expression

| Feature | Statement | Expression |
|---|---|---|
| Returns a value | No | **Yes** |
| Exhaustive required | No | **Yes** (default, or all enum constants) |
| Fall-through | Colon form: yes | Colon form: yes until \`yield\`; arrow form: never |
| Exit keyword | \`break\` | \`yield\` (in blocks / colon form) |
| Trailing semicolon | No | Yes when used as an expression statement/assignment |
`
    }
  ],

  gotchas: [
    { title: 'if (x = 5) vs if (flag = true)', md: 'Assignment in a condition compiles **only** if the result type is `boolean`. `if (flag = true)` compiles and always enters the block; `if (x = 5)` is a compile error.' },
    { title: 'Indentation lies', md: 'Without braces only the **single next statement** belongs to the `if`/loop. The exam indents a second line to trick you – it always runs.' },
    { title: 'Declaration under a brace-less if', md: '`if (b) int x = 1;` **does not compile**. A local variable declaration is not a statement that can be the body of an `if`/loop without braces.' },
    { title: 'switch selector types', md: 'No `long`, `boolean`, `float`, `double` (or their wrappers) as switch selectors. `int/short/byte/char` + wrappers, `String`, and enums only.' },
    { title: 'case values must be compile-time constants', md: 'A `final int X = 5;` **initialised at declaration** is fine; a non-final variable, a method call, or a `final` variable assigned later is not.' },
    { title: 'Enum case labels are unqualified', md: '`case Season.WINTER:` does **not** compile in Java 17 – write `case WINTER:`. (Qualified names became legal only in Java 21.)' },
    { title: 'default can be anywhere and still falls through', md: '`default` placed in the middle is entered only when nothing matches, but once entered execution falls into the following cases until a `break`.' },
    { title: 'null selector', md: 'Switching on a `null` `String`/wrapper/enum throws `NullPointerException` at runtime – it compiles fine.' },
    { title: 'Switch expression exhaustiveness', md: 'A switch **expression** over `int`/`String`/wrapper **must** have `default`. Over an enum, covering every constant is enough (but adding a constant later breaks the build).' },
    { title: 'yield inside blocks', md: 'Inside a `->  { }` block of a switch expression every path must end with `yield value;` or `throw`. Forgetting one path = compile error. `return` is illegal inside a switch expression.' },
    { title: 'Mixing -> and :', md: 'You cannot mix arrow and colon labels in the same switch. Arrow labels never fall through.' },
    { title: 'Pattern variable flow scoping', md: '`o instanceof String s && s.isEmpty()` OK. `o instanceof String s || s.isEmpty()` compile error. After `if (!(o instanceof String s)) return;` **s is in scope** below.' },
    { title: 'Pattern type must be a strict subtype (Java 17)', md: '`Integer i = 1; if (i instanceof Integer x)` fails: the pattern type may not be the same as (or a supertype of) the expression type. Only became legal in Java 21.' },
    { title: 'do/while needs a semicolon', md: '`do { } while (cond);` – forgetting the `;` after the condition is a compile error the exam loves.' },
    { title: 'Multiple for-loop variables share ONE type', md: '`for (int i = 0, j = 0; …)` OK. `for (int i = 0, long j = 0; …)` compile error. `for (int i = 0; i < 3; i++, j++)` update part may touch several variables.' },
    { title: 'Loop variable scope', md: 'The variable declared in `for`/for-each is not visible after the loop. Redeclaring an existing local inside the `for` header is a compile error.' },
    { title: 'for-each over a Map', md: '`Map` is not `Iterable`. `for (var e : map)` fails; use `map.entrySet()`, `keySet()` or `values()`.' },
    { title: 'Unreachable code after while(true)', md: 'Code after `while (true) { }` with no `break` fails to compile. Code after `while (flag)` compiles even if `flag` is always true, because `flag` is not a constant expression.' },
    { title: 'break inside switch inside loop', md: '`break` exits only the switch. To leave the loop from a switch case you need a labelled break.' },
    { title: 'continue with a label that is not a loop', md: '`continue LABEL;` requires LABEL to be attached to an enclosing **loop**; a labelled block only works with `break`.' },
    { title: 'Ternary numeric promotion', md: '`int n = true ? 1 : 2.0;` fails – the whole expression is `double`. Same rule applies to the type of a `switch` expression assigned to `var`.' }
  ],

  traps: [
    {
      code: `int x = 10;
if (x > 5)
  System.out.print("A");
  System.out.print("B");
else
  System.out.print("C");`,
      prompt: 'Does it compile? If so, what prints?',
      answer: '**Does not compile.** Without braces the `if` owns only `print("A")`. `print("B")` is a standalone statement, so the following `else` has no matching `if` → *"else without if"*.'
    },
    {
      code: `String s = "b";
switch (s) {
  case "a": System.out.print("A");
  default:  System.out.print("D");
  case "c": System.out.print("C"); break;
  case "b": System.out.print("B");
}`,
      prompt: 'What prints?',
      answer: 'Prints **`B`**. `"b"` matches `case "b"`, which is the last label; nothing follows it so there is nothing to fall into. `default` is only entered when no case matches.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
String s = "b";
switch (s) {
  case "a": System.out.print("A");
  default:  System.out.print("D");
  case "c": System.out.print("C"); break;
  case "b": System.out.print("B");
} } }` }, expect: { output: 'B' } }
    },
    {
      code: `var day = 3;
var type = switch (day) {
  case 1, 7 -> "weekend";
  case 2, 3, 4, 5, 6 -> "weekday";
};
System.out.println(type);`,
      prompt: 'Does it compile?',
      answer: '**No.** A switch *expression* on an `int` must be exhaustive, which requires a `default` branch. (With an `enum` selector covering all constants would suffice.)'
    },
    {
      code: `Object o = 42;
if (!(o instanceof Integer i)) {
  System.out.println("not int");
} else {
  System.out.println(i + 1);
}`,
      prompt: 'Does it compile? Output?',
      answer: 'Compiles and prints **`43`**. Flow scoping: in the `else` branch the compiler knows the negated test was false, i.e. the match succeeded, so `i` is in scope.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
Object o = 42;
if (!(o instanceof Integer i)) {
  System.out.println("not int");
} else {
  System.out.println(i + 1);
} } }` }, expect: { output: '43' } }
    },
    {
      code: `int count = 0;
do {
  count++;
} while (count < 3)
System.out.println(count);`,
      prompt: 'Does it compile?',
      answer: '**No** – a `do/while` must end with a semicolon after the condition: `while (count < 3);`.'
    },
    {
      code: `for (int i = 0, j = 5; i < j; i++, j--)
  System.out.print(i + j + " ");`,
      prompt: 'Output?',
      answer: 'Prints **`5 5 5 `**. Both variables move toward each other; the sum stays 5 for i=0/j=5, 1/4, 2/3, then i=3,j=2 stops the loop.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
for (int i = 0, j = 5; i < j; i++, j--)
  System.out.print(i + j + " ");
} }` }, expect: { output: '5 5 5 ' } }
    },
    {
      code: `int i = 0;
while (true) {
  if (i++ > 2) break;
}
System.out.println(i);`,
      prompt: 'Does it compile? Output?',
      answer: 'Compiles (the `break` makes the following statement reachable) and prints **`4`**. Iterations compare 0,1,2,3 against 2; the check `3 > 2` is true but `i++` has already incremented to 4.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int i = 0;
while (true) {
  if (i++ > 2) break;
}
System.out.println(i);
} }` }, expect: { output: '4' } }
    },
    {
      code: `OUTER: for (int i = 0; i < 3; i++) {
  for (int j = 0; j < 3; j++) {
    if (j == 1) continue OUTER;
    if (i == 2) break OUTER;
    System.out.print(i + "" + j + " ");
  }
}`,
      prompt: 'Output?',
      answer: 'Prints **`00 10 `**. i=0: prints 00, j=1 → continue OUTER. i=1: prints 10, continue OUTER. i=2: j=0 → `break OUTER`.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
OUTER: for (int i = 0; i < 3; i++) {
  for (int j = 0; j < 3; j++) {
    if (j == 1) continue OUTER;
    if (i == 2) break OUTER;
    System.out.print(i + "" + j + " ");
  }
} } }` }, expect: { output: '00 10 ' } }
    }
  ],

  questions: [
    {
      id: 'ch03-q01', type: 'single', difficulty: 'easy', objectiveIds: ['2'], tags: ['if', 'braces'],
      question: 'What is the output of the following code?',
      code: `int score = 75;
if (score > 90)
  System.out.print("A");
else if (score > 70)
  System.out.print("B");
  System.out.print("C");
System.out.println("!");`,
      options: ['B!', 'BC!', 'C!', 'AC!', 'The code does not compile.'],
      answer: [1],
      explanation: 'The brace-less `else if` owns only `print("B")`. `print("C")` is an independent statement and always executes, then `!` prints with a newline.',
      optionNotes: { '0': 'Ignores that `print("C")` is outside the else-if.', '1': 'Correct: B from the else-if, C unconditionally, then !.', '2': 'The condition `75 > 70` is true, so B also prints.', '3': '`75 > 90` is false.', '4': 'It compiles; there is no `else` after `print("C")` that would be orphaned.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int score = 75;
if (score > 90)
  System.out.print("A");
else if (score > 70)
  System.out.print("B");
  System.out.print("C");
System.out.println("!");
} }` }, expect: { output: 'BC!' } }
    },
    {
      id: 'ch03-q02', type: 'multi', difficulty: 'medium', objectiveIds: ['2'], tags: ['if', 'compile'],
      question: 'Which of the following statements compile? (Choose all that apply.) Assume `int x = 5; boolean b = false; Boolean w = true;` are in scope.',
      code: null,
      options: ['if (x) System.out.println("x");', 'if (b = true) System.out.println("b");', 'if (w) System.out.println("w");', 'if (x = 5) System.out.println("x");', 'if (x == 5) int y = 1;'],
      answer: [1, 2],
      explanation: 'The condition must be `boolean`/`Boolean`. `b = true` is an assignment expression of type boolean (legal, and always true). `w` is auto-unboxed. `x` and `x = 5` are `int`. A declaration cannot be the lone body of an `if`.',
      optionNotes: { '0': '`int` is not a boolean condition.', '1': 'Legal (though a bug): the assignment evaluates to `true`.', '2': '`Boolean` is unboxed to `boolean`.', '3': '`x = 5` has type `int`.', '4': 'A local variable declaration is not allowed as an un-braced `if` body.' },
      verify: null
    },
    {
      id: 'ch03-q03', type: 'single', difficulty: 'medium', objectiveIds: ['2'], tags: ['switch', 'fall-through'],
      question: 'What is the output?',
      code: `int level = 2;
switch (level) {
  case 1:
    System.out.print("one ");
  case 2:
    System.out.print("two ");
  case 3:
    System.out.print("three ");
    break;
  default:
    System.out.print("other ");
}`,
      options: ['two', 'two three', 'two three other', 'one two three', 'The code does not compile.'],
      answer: [1],
      explanation: 'Execution starts at `case 2` and falls through into `case 3`, where `break` stops it before `default`.',
      optionNotes: { '0': 'Forgot fall-through into case 3.', '1': 'Correct.', '2': 'The `break` in case 3 prevents reaching default.', '3': 'Execution starts at the matching case, not at the top.', '4': 'Everything is valid.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int level = 2;
switch (level) {
  case 1:
    System.out.print("one ");
  case 2:
    System.out.print("two ");
  case 3:
    System.out.print("three ");
    break;
  default:
    System.out.print("other ");
} } }` }, expect: { output: 'two three ' } }
    },
    {
      id: 'ch03-q04', type: 'multi', difficulty: 'medium', objectiveIds: ['2'], tags: ['switch', 'selector-types'],
      question: 'Which variable declarations can be used as the selector of a `switch` statement in Java 17? (Choose all that apply.)',
      code: null,
      options: ['long id = 1L;', 'Character c = \'x\';', 'boolean done = false;', 'String name = "a";', 'Double d = 1.0;', 'byte b = 1;'],
      answer: [1, 3, 5],
      explanation: 'Selector may be `byte/short/char/int`, their wrappers, `String`, or an enum. `long`, `boolean`, `float`, `double` and their wrappers are not allowed.',
      optionNotes: { '0': '`long` is not permitted.', '1': '`Character` wrapper is permitted.', '2': '`boolean` is never permitted.', '3': '`String` has been allowed since Java 7.', '4': '`Double` is not permitted.', '5': '`byte` is permitted.' },
      verify: null
    },
    {
      id: 'ch03-q05', type: 'single', difficulty: 'medium', objectiveIds: ['2'], tags: ['switch', 'constants'],
      question: 'How many lines of the following code fail to compile?',
      code: `final int ONE = 1;
int two = 2;
final int three;
three = 3;
int n = 1;
switch (n) {
  case ONE:            // line A
  case two:            // line B
  case three:          // line C
  case 2 * 2:          // line D
  case Integer.valueOf(5): // line E
    break;
}`,
      options: ['0', '1', '2', '3', '4'],
      answer: [3],
      explanation: 'Case labels need compile-time constants. `ONE` (final, initialised at declaration) and `2 * 2` qualify. `two` is not final, `three` is final but not a constant variable (assigned later), and a method call is never a constant. Lines B, C, E fail.',
      optionNotes: { '3': 'Lines B, C and E fail.' },
      verify: null
    },
    {
      id: 'ch03-q06', type: 'single', difficulty: 'medium', objectiveIds: ['2'], tags: ['switch', 'enum'],
      question: 'Given the enum `enum Size { S, M, L }`, what is the result of compiling and running the following?',
      code: `Size size = Size.M;
switch (size) {
  case Size.S -> System.out.println("small");
  case M -> System.out.println("medium");
  default -> System.out.println("large");
}`,
      options: ['small', 'medium', 'large', 'Compilation fails because of the arrow labels in a switch statement.', 'Compilation fails because of the case label `Size.S`.'],
      answer: [4],
      explanation: 'In Java 17 enum case labels must be unqualified (`case S`). Qualified enum constants in case labels were only permitted from Java 21. Arrow labels in a switch statement are fine.',
      optionNotes: { '3': 'A switch statement may use `->`.', '4': 'Correct: `Size.S` is illegal as a case label in Java 17.' },
      verify: { files: { 'Main.java': `enum Size { S, M, L }
public class Main { public static void main(String[] a) {
Size size = Size.M;
switch (size) {
  case Size.S -> System.out.println("small");
  case M -> System.out.println("medium");
  default -> System.out.println("large");
} } }` }, expect: 'compile-error' }
    },
    {
      id: 'ch03-q07', type: 'single', difficulty: 'medium', objectiveIds: ['2'], tags: ['switch', 'default', 'fall-through'],
      question: 'What is the output?',
      code: `String s = "z";
switch (s) {
  default:
    System.out.print("D");
  case "a":
    System.out.print("A");
    break;
  case "b":
    System.out.print("B");
}
System.out.print("!");`,
      options: ['D!', 'DA!', 'DAB!', '!', 'The code does not compile because default must be last.'],
      answer: [1],
      explanation: '`"z"` matches no case, so `default` is entered (regardless of position), then falls through into `case "a"` until the `break`.',
      optionNotes: { '1': 'Correct.', '4': '`default` may appear anywhere.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
String s = "z";
switch (s) {
  default:
    System.out.print("D");
  case "a":
    System.out.print("A");
    break;
  case "b":
    System.out.print("B");
}
System.out.print("!");
} }` }, expect: { output: 'DA!' } }
    },
    {
      id: 'ch03-q08', type: 'single', difficulty: 'easy', objectiveIds: ['2'], tags: ['switch', 'null'],
      question: 'What happens when this code is compiled and run?',
      code: `String cmd = null;
switch (cmd) {
  case "go" -> System.out.println("going");
  default   -> System.out.println("idle");
}`,
      options: ['idle', 'going', 'Nothing is printed.', 'A NullPointerException is thrown at runtime.', 'Compilation fails.'],
      answer: [3],
      explanation: 'Switching on a `null` reference throws `NullPointerException`; `default` does not catch null in Java 17 (there is no `case null` yet).',
      optionNotes: { '0': '`default` does not handle null.', '3': 'Correct.', '4': 'It compiles.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
String cmd = null;
switch (cmd) {
  case "go" -> System.out.println("going");
  default   -> System.out.println("idle");
} } }` }, expect: 'runtime-exception' }
    },
    {
      id: 'ch03-q09', type: 'single', difficulty: 'medium', objectiveIds: ['2'], tags: ['switch-expression', 'exhaustive'],
      question: 'Which statement about the following code is correct?',
      code: `int code = 2;
String msg = switch (code) {
  case 1 -> "one";
  case 2 -> "two";
  case 3 -> "three";
};
System.out.println(msg);`,
      options: ['It prints `two`.', 'It does not compile because a switch expression cannot be assigned to a String.', 'It does not compile because the switch expression is not exhaustive.', 'It does not compile because arrow cases require braces.', 'It throws an exception at runtime.'],
      answer: [2],
      explanation: 'A switch expression over an `int` must handle every possible value, which requires a `default` branch. Only enum (and, later, sealed) selectors can be exhaustive without `default`.',
      optionNotes: { '2': 'Correct.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int code = 2;
String msg = switch (code) {
  case 1 -> "one";
  case 2 -> "two";
  case 3 -> "three";
};
System.out.println(msg);
} }` }, expect: 'compile-error' }
    },
    {
      id: 'ch03-q10', type: 'single', difficulty: 'medium', objectiveIds: ['2'], tags: ['switch-expression', 'yield'],
      question: 'What is the output?',
      code: `int q = 3;
int r = switch (q) {
  case 1, 2 -> 10;
  case 3 -> {
    int t = q * 2;
    yield t + 1;
  }
  default -> 0;
};
System.out.println(r);`,
      options: ['6', '7', '10', '0', 'The code does not compile.'],
      answer: [1],
      explanation: 'A block branch must `yield` its value. `q * 2 = 6`, `yield 6 + 1` gives 7.',
      optionNotes: { '1': 'Correct.', '4': 'Every branch yields an `int`; the code is valid.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int q = 3;
int r = switch (q) {
  case 1, 2 -> 10;
  case 3 -> {
    int t = q * 2;
    yield t + 1;
  }
  default -> 0;
};
System.out.println(r);
} }` }, expect: { output: '7' } }
    },
    {
      id: 'ch03-q11', type: 'multi', difficulty: 'hard', objectiveIds: ['2'], tags: ['switch-expression', 'compile'],
      question: 'Which of the following switch expressions compile? (Choose all that apply.) Assume `int n` and `enum Color { RED, GREEN }` with `Color c` are in scope.',
      code: `// I
String a = switch (n) { case 1 -> "a"; default -> "b"; };
// II
String b = switch (c) { case RED -> "r"; case GREEN -> "g"; };
// III
int d = switch (n) { case 1 -> 1; default -> { System.out.println("x"); } };
// IV
var e = switch (n) { case 1: yield 1; default: yield 2; };
// V
int f = switch (n) { case 1 -> 1; default -> return 2; };`,
      options: ['I', 'II', 'III', 'IV', 'V'],
      answer: [0, 1, 3],
      explanation: 'I is a standard exhaustive switch. II covers every enum constant, so no default is needed. III has a block without `yield` → error. IV is the colon form using `yield` – legal. V uses `return` inside a switch expression – illegal.',
      optionNotes: { '2': 'The default block does not yield a value.', '3': 'Colon-form switch expressions with `yield` are legal.', '4': '`return` is not allowed inside a switch expression.' },
      verify: null
    },
    {
      id: 'ch03-q12', type: 'single', difficulty: 'hard', objectiveIds: ['2'], tags: ['switch-expression', 'type-promotion'],
      question: 'What is the output?',
      code: `int k = 1;
var v = switch (k) {
  case 1 -> 5;
  default -> 2.5;
};
System.out.println(v);`,
      options: ['5', '5.0', '2.5', 'The code does not compile because branches have different types.', 'The code does not compile because var cannot be used with switch expressions.'],
      answer: [1],
      explanation: 'Like a ternary, the type of the switch expression is the promoted type of its branches: `int` and `double` → `double`. So `v` is `5.0`.',
      optionNotes: { '0': 'Numeric promotion makes the result a double.', '1': 'Correct.', '3': 'Numeric branches are promoted, just like `?:`.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int k = 1;
var v = switch (k) {
  case 1 -> 5;
  default -> 2.5;
};
System.out.println(v);
} }` }, expect: { output: '5.0' } }
    },
    {
      id: 'ch03-q13', type: 'single', difficulty: 'medium', objectiveIds: ['2'], tags: ['pattern-matching', 'flow-scoping'],
      question: 'What is the result of compiling and running this code?',
      code: `Object o = "exam";
if (o instanceof String s || s.length() > 2) {
  System.out.println("yes");
}`,
      options: ['yes', 'Nothing is printed.', 'Compilation fails on the `if` line.', 'A NullPointerException is thrown.', 'A ClassCastException is thrown.'],
      answer: [2],
      explanation: 'With `||` the right operand is evaluated only when the `instanceof` was **false**, so `s` is not definitely matched there and is not in scope → compile error.',
      optionNotes: { '2': 'Correct: `s` is out of scope on the right side of `||`.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
Object o = "exam";
if (o instanceof String s || s.length() > 2) {
  System.out.println("yes");
} } }` }, expect: 'compile-error' }
    },
    {
      id: 'ch03-q14', type: 'single', difficulty: 'hard', objectiveIds: ['2'], tags: ['pattern-matching', 'flow-scoping'],
      question: 'What is the output?',
      code: `static String check(Object o) {
  if (!(o instanceof Integer i)) {
    return "not an int";
  }
  return i > 10 ? "big" : "small";
}
public static void main(String[] args) {
  System.out.println(check(42) + " " + check("42"));
}`,
      options: ['big not an int', 'big small', 'not an int not an int', 'The code does not compile because `i` is out of scope on the return line.', 'The code does not compile because a pattern variable cannot be used with a negated instanceof.'],
      answer: [0],
      explanation: 'When the negated test is true the method returns, so on the following line the compiler knows the match succeeded and `i` is in scope (flow scoping). `check(42)` → big; `check("42")` → not an int.',
      optionNotes: { '0': 'Correct.', '3': 'Flow scoping introduces `i` after the early return.' },
      verify: { files: { 'Main.java': `public class Main {
static String check(Object o) {
  if (!(o instanceof Integer i)) {
    return "not an int";
  }
  return i > 10 ? "big" : "small";
}
public static void main(String[] args) {
  System.out.println(check(42) + " " + check("42"));
} }` }, expect: { output: 'big not an int' } }
    },
    {
      id: 'ch03-q15', type: 'single', difficulty: 'medium', objectiveIds: ['2'], tags: ['pattern-matching', 'compile'],
      question: 'Which line, if any, fails to compile?',
      code: `Number n = 5;                              // line 1
if (n instanceof Integer i) { }           // line 2
Integer j = 6;                             // line 3
if (j instanceof Integer k) { }           // line 4
if (n instanceof String t) { }            // line 5`,
      options: ['Only line 2', 'Only line 4', 'Only line 5', 'Lines 4 and 5', 'All lines compile.'],
      answer: [3],
      explanation: 'Line 4: in Java 17 the pattern type must be a strict subtype of the expression type – `Integer instanceof Integer` pattern is rejected. Line 5: `Number` and `String` are unrelated, so the instanceof itself is a compile error. Line 2 is fine.',
      optionNotes: { '3': 'Correct: both 4 and 5 fail.' },
      verify: null
    },
    {
      id: 'ch03-q16', type: 'single', difficulty: 'easy', objectiveIds: ['2'], tags: ['do-while'],
      question: 'What is the output?',
      code: `int i = 10;
do {
  System.out.print(i + " ");
  i++;
} while (i < 10);
System.out.println("done");`,
      options: ['done', '10 done', '10 11 done', 'The code loops forever.', 'The code does not compile.'],
      answer: [1],
      explanation: 'A `do/while` executes its body once before testing the condition. `10` prints, then `11 < 10` is false.',
      optionNotes: { '0': 'do/while always runs at least once.', '1': 'Correct.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int i = 10;
do {
  System.out.print(i + " ");
  i++;
} while (i < 10);
System.out.println("done");
} }` }, expect: { output: '10 done' } }
    },
    {
      id: 'ch03-q17', type: 'multi', difficulty: 'medium', objectiveIds: ['2'], tags: ['for', 'compile'],
      question: 'Which `for` statements compile? (Choose all that apply.) Assume `int k = 0;` is declared before each loop and `int[] arr = {1, 2};`.',
      code: null,
      options: ['for (int i = 0, j = 10; i < j; i++, j--) { }', 'for (int i = 0, long j = 0; i < 2; i++) { }', 'for (int k = 0; k < 2; k++) { }', 'for (;;) { break; }', 'for (var i = 0; i < arr.length; i++) { }', 'for (int i = 0; i < 2; i++); { System.out.print(i); }'],
      answer: [0, 3, 4],
      explanation: 'Option 2 mixes types in one declaration. Option 3 redeclares `k`, which is already in scope. Option 6: the loop body is the empty statement `;`, and the block afterwards references `i`, which is out of scope.',
      optionNotes: { '0': 'Multiple variables of the same type are fine.', '1': 'Cannot declare two different types in the init section.', '2': '`k` is already defined in the enclosing scope.', '3': 'Infinite loop with a break – valid.', '4': '`var` is allowed in a for header.', '5': '`i` is not in scope in the block following the loop.' },
      verify: null
    },
    {
      id: 'ch03-q18', type: 'single', difficulty: 'medium', objectiveIds: ['2'], tags: ['for-each', 'compile'],
      question: 'Which option, inserted independently at the marked position, compiles?',
      code: `import java.util.*;
public class Loop {
  public static void main(String[] args) {
    List<Integer> nums = List.of(1, 2, 3);
    Map<String, Integer> map = Map.of("a", 1);
    int[] arr = {4, 5};
    // INSERT HERE
  }
}`,
      options: ['for (long v : arr) { }', 'for (Long v : nums) { }', 'for (var e : map) { }', 'for (String s : nums) { }', 'for (Long v : arr) { }'],
      answer: [0],
      explanation: 'The loop variable must be assignment-compatible with the element type. `int` → `long` is a widening conversion (OK). `Integer` → `Long` is not allowed (no unbox-widen-box chain). `Map` is not `Iterable`. `Integer` is not a `String`. `int` → `Long` would need widening *and* boxing, which is not permitted (a single boxing step, `Integer v : arr`, would be fine).',
      optionNotes: { '0': 'int → long widening is allowed.', '1': 'Integer → Long is not a legal conversion.', '2': 'Map does not implement Iterable.', '3': 'Integer elements cannot be assigned to a String.', '4': 'int → Long would require widening then boxing – not allowed.' },
      verify: { files: { 'Loop.java': `import java.util.*;
public class Loop {
  public static void main(String[] args) {
    List<Integer> nums = List.of(1, 2, 3);
    Map<String, Integer> map = Map.of("a", 1);
    int[] arr = {4, 5};
    for (long v : arr) { System.out.print(v); }
  }
}` }, expect: { output: '45' } }
    },
    {
      id: 'ch03-q19', type: 'single', difficulty: 'medium', objectiveIds: ['2'], tags: ['for-each', 'reference'],
      question: 'What is the output?',
      code: `int[] data = {1, 2, 3};
for (int d : data) {
  d *= 2;
}
StringBuilder[] sbs = { new StringBuilder("a"), new StringBuilder("b") };
for (StringBuilder sb : sbs) {
  sb.append("!");
}
System.out.println(data[0] + " " + sbs[0]);`,
      options: ['1 a', '2 a', '1 a!', '2 a!', 'The code does not compile.'],
      answer: [2],
      explanation: 'The for-each variable is a copy. Doubling the primitive copy does not affect the array. For objects the copy is a reference to the **same** StringBuilder, so `append` mutates the shared object.',
      optionNotes: { '2': 'Correct.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int[] data = {1, 2, 3};
for (int d : data) {
  d *= 2;
}
StringBuilder[] sbs = { new StringBuilder("a"), new StringBuilder("b") };
for (StringBuilder sb : sbs) {
  sb.append("!");
}
System.out.println(data[0] + " " + sbs[0]);
} }` }, expect: { output: '1 a!' } }
    },
    {
      id: 'ch03-q20', type: 'single', difficulty: 'medium', objectiveIds: ['2'], tags: ['labels', 'break', 'continue'],
      question: 'What is the output?',
      code: `int count = 0;
ROW: for (int r = 0; r < 4; r++) {
  for (int c = 0; c < 4; c++) {
    if (c == 2) continue ROW;
    if (r == 3) break ROW;
    count++;
  }
}
System.out.println(count);`,
      options: ['4', '6', '8', '12', '16'],
      answer: [1],
      explanation: 'Rows 0,1,2 each count c=0 and c=1 (2 each = 6), then `continue ROW` at c=2. In row 3 the first iteration hits `break ROW` before incrementing.',
      optionNotes: { '1': 'Correct: 3 rows × 2 = 6.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int count = 0;
ROW: for (int r = 0; r < 4; r++) {
  for (int c = 0; c < 4; c++) {
    if (c == 2) continue ROW;
    if (r == 3) break ROW;
    count++;
  }
}
System.out.println(count);
} }` }, expect: { output: '6' } }
    },
    {
      id: 'ch03-q21', type: 'single', difficulty: 'medium', objectiveIds: ['2'], tags: ['switch', 'break', 'loop'],
      question: 'What is the output?',
      code: `for (int i = 0; i < 4; i++) {
  switch (i) {
    case 1:
      break;
    case 2:
      continue;
    default:
      System.out.print(i);
  }
  System.out.print("-");
}`,
      options: ['0-1-2-3-', '0--3-', '0-3-', '0--2-3-', 'The code does not compile because continue is not allowed in a switch.'],
      answer: [1],
      explanation: 'i=0: default prints 0 then "-". i=1: `break` leaves the switch only, then "-" prints. i=2: `continue` skips the rest of the loop body (no "-"). i=3: prints 3 then "-".',
      optionNotes: { '1': 'Correct.', '4': '`continue` is legal inside a switch nested in a loop; it applies to the loop.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
for (int i = 0; i < 4; i++) {
  switch (i) {
    case 1:
      break;
    case 2:
      continue;
    default:
      System.out.print(i);
  }
  System.out.print("-");
} } }` }, expect: { output: '0--3-' } }
    },
    {
      id: 'ch03-q22', type: 'multi', difficulty: 'hard', objectiveIds: ['2'], tags: ['unreachable', 'compile'],
      question: 'Which of the following method bodies compile? (Choose all that apply.)',
      code: `// I
void a() { while (true) { } System.out.println("x"); }
// II
int b() { while (true) { } }
// III
void c() { boolean f = true; while (f) { } System.out.println("x"); }
// IV
void d() { for (;;) { break; } System.out.println("x"); }
// V
void e() { return; System.out.println("x"); }
// VI
void g() { if (false) { System.out.println("x"); } }`,
      options: ['I', 'II', 'III', 'IV', 'V', 'VI'],
      answer: [1, 2, 3, 5],
      explanation: 'I: statement after an infinite loop without break is unreachable. II: legal – the method never completes normally so no return is needed. III: `f` is not a constant expression, so the compiler does not treat the loop as infinite. IV: the `break` makes the following statement reachable. V: statement after `return` is unreachable. VI: `if (false)` is specifically permitted.',
      optionNotes: { '0': 'Unreachable statement.', '1': 'No return needed after an infinite loop.', '2': 'Non-constant condition → reachable.', '3': 'break makes code after the loop reachable.', '4': 'Unreachable statement after return.', '5': '`if (false)` is allowed for conditional compilation.' },
      verify: null
    },
    {
      id: 'ch03-q23', type: 'single', difficulty: 'medium', objectiveIds: ['2'], tags: ['ternary', 'evaluation'],
      question: 'What is the output?',
      code: `int a = 5, b = 10;
int max = a > b ? a++ : b--;
System.out.println(max + " " + a + " " + b);`,
      options: ['10 5 9', '10 6 9', '9 5 9', '10 5 10', '5 6 10'],
      answer: [0],
      explanation: 'Only the selected branch is evaluated. `a > b` is false so `b--` runs: it yields 10 (post-decrement) and then b becomes 9; `a` is untouched.',
      optionNotes: { '0': 'Correct.', '1': 'The `a++` branch is never evaluated.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
int a = 5, b = 10;
int max = a > b ? a++ : b--;
System.out.println(max + " " + a + " " + b);
} }` }, expect: { output: '10 5 9' } }
    },
    {
      id: 'ch03-q24', type: 'single', difficulty: 'hard', objectiveIds: ['2'], tags: ['switch-expression', 'enum', 'exhaustive'],
      question: 'Given `enum Light { RED, AMBER, GREEN }`, what is the output?',
      code: `Light l = Light.AMBER;
String action = switch (l) {
  case RED -> "stop";
  case GREEN -> "go";
  case AMBER -> {
    String s = "slow";
    yield s.toUpperCase();
  }
};
System.out.println(action.length());`,
      options: ['4', 'SLOW', 'slow', 'The code does not compile because there is no default branch.', 'The code does not compile because a block must be the last case.'],
      answer: [0],
      explanation: 'All three enum constants are covered, so the expression is exhaustive without `default`. The AMBER block yields "SLOW", whose length is 4.',
      optionNotes: { '0': 'Correct.', '3': 'Covering every enum constant satisfies exhaustiveness.' },
      verify: { files: { 'Main.java': `enum Light { RED, AMBER, GREEN }
public class Main { public static void main(String[] a) {
Light l = Light.AMBER;
String action = switch (l) {
  case RED -> "stop";
  case GREEN -> "go";
  case AMBER -> {
    String s = "slow";
    yield s.toUpperCase();
  }
};
System.out.println(action.length());
} }` }, expect: { output: '4' } }
    },
    {
      id: 'ch03-q25', type: 'single', difficulty: 'medium', objectiveIds: ['2'], tags: ['while', 'scope'],
      question: 'What is the result of compiling and running this code?',
      code: `int total = 0;
int n = 3;
while (n > 0) {
  int step = n * 2;
  total += step;
  n--;
}
System.out.println(total + " " + step);`,
      options: ['12 2', '12 6', '12 0', 'The code does not compile.', 'The code loops forever.'],
      answer: [3],
      explanation: '`step` is declared inside the loop block and is out of scope after it. The final `println` references it → compile error.',
      optionNotes: { '3': 'Correct: `step` is not in scope.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int total = 0;
int n = 3;
while (n > 0) {
  int step = n * 2;
  total += step;
  n--;
}
System.out.println(total + " " + step);
} }` }, expect: 'compile-error' }
    },
    {
      id: 'ch03-q26', type: 'single', difficulty: 'medium', objectiveIds: ['2'], tags: ['switch', 'char', 'int'],
      question: 'What is the output?',
      code: `int c = 'b';
switch (c) {
  case 'a' -> System.out.print("A");
  case 98  -> System.out.print("B");
  case 'c' -> System.out.print("C");
  default  -> System.out.print("?");
}`,
      options: ['A', 'B', 'C', '?', 'The code does not compile because a char label cannot be used with an int selector.'],
      answer: [1],
      explanation: '`char` literals are compile-time constants assignable to `int`; `\'b\'` is 98, so `case 98` matches.',
      optionNotes: { '1': 'Correct.', '4': 'char constants widen to int and are allowed as labels.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int c = 'b';
switch (c) {
  case 'a' -> System.out.print("A");
  case 98  -> System.out.print("B");
  case 'c' -> System.out.print("C");
  default  -> System.out.print("?");
} } }` }, expect: { output: 'B' } }
    },
    {
      id: 'ch03-q27', type: 'single', difficulty: 'hard', objectiveIds: ['2'], tags: ['switch', 'duplicate'],
      question: 'Which statement is true about this code?',
      code: `final int A = 1;
int v = 2;
switch (v) {
  case A:      System.out.print("a");
  case 1 + 0:  System.out.print("b");
  case 2:      System.out.print("c");
}`,
      options: ['It prints `c`.', 'It prints `abc`.', 'It does not compile because two case labels have the same value.', 'It does not compile because a switch requires a default.', 'It does not compile because `A` is not a constant.'],
      answer: [2],
      explanation: '`A` is a constant variable equal to 1 and `1 + 0` is a constant expression equal to 1 – duplicate case labels are a compile error. A switch statement never requires `default`.',
      optionNotes: { '2': 'Correct.', '4': 'A `final` local initialised with a literal is a constant.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
final int A = 1;
int v = 2;
switch (v) {
  case A:      System.out.print("a");
  case 1 + 0:  System.out.print("b");
  case 2:      System.out.print("c");
} } }` }, expect: 'compile-error' }
    }
  ],

  checklist: [
    'I know the condition of if/while/do/for must be boolean or Boolean, and why `if (flag = true)` compiles.',
    'I can identify which statements belong to a brace-less if/else/loop regardless of indentation.',
    'I know the allowed switch selector types and can spot long/boolean/double selectors.',
    'I can decide whether a case label is a compile-time constant and spot duplicates.',
    'I can trace fall-through, including a default in the middle.',
    'I know a switch expression needs default unless all enum constants are covered, and that blocks must yield.',
    'I know return/break/continue cannot exit a switch expression and that -> and : cannot be mixed.',
    'I can apply flow scoping for pattern variables with &&, ||, ! and early return.',
    'I know the Java 17 rule that the pattern type must be a strict subtype of the expression type.',
    'I know the for-loop init section allows multiple variables of one type only, and loop variable scope rules.',
    'I know for-each needs an array or Iterable (not Map) and how the loop variable copies values/references.',
    'I can evaluate labelled break/continue and break inside switch inside a loop.',
    'I can spot unreachable code: after while(true), return, break, continue, throw — and the if(false) exception.'
  ]
});
