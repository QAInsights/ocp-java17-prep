OCP.registerChapter({
  id: 2,
  slug: 'operators',
  title: 'Operators',
  objectiveIds: ['1a'],
  intro: `Objective **1a** – *evaluate arithmetic and boolean expressions using primitives and wrappers, parentheses, type promotion and casting*. Operator questions look easy and are where careful candidates lose points: pre/post increment inside expressions, numeric promotion (\`byte + byte\` is an \`int\`), compound assignment's hidden cast, integer division, the modulus sign, short-circuit vs non-short-circuit logic, and \`==\` on wrappers. Learn the precedence table and evaluate strictly left to right.`,

  notes: [
    {
      id: 'precedence',
      title: 'Operator categories and precedence',
      md: `## Precedence (highest first)

| Level | Operators | Notes |
|---|---|---|
| Post-unary | \`x++\` \`x--\` | |
| Pre-unary | \`++x\` \`--x\` | |
| Other unary | \`-\` \`+\` \`!\` \`~\` \`(cast)\` | right-to-left |
| Multiplicative | \`*\` \`/\` \`%\` | |
| Additive | \`+\` \`-\` | \`+\` is also String concatenation |
| Shift | \`<<\` \`>>\` \`>>>\` | |
| Relational | \`<\` \`>\` \`<=\` \`>=\` \`instanceof\` | |
| Equality | \`==\` \`!=\` | |
| Bitwise / logical AND | \`&\` | |
| XOR | \`^\` | |
| Bitwise / logical OR | \`\\|\` | |
| Short-circuit AND | \`&&\` | |
| Short-circuit OR | \`\\|\\|\` | |
| Ternary | \`? :\` | right-to-left |
| Assignment | \`=\` \`+=\` \`-=\` \`*=\` \`/=\` \`%=\` \`&=\` \`^=\` \`\\|=\` \`<<=\` \`>>=\` \`>>>=\` | right-to-left |

Operators at the same level are evaluated **left to right** (except unary, ternary, assignment). Parentheses override everything.

**Operands are always evaluated left to right**, before the operator is applied – this matters for \`x = x++ + ++x\`.

## Arity

* Unary: one operand (\`-x\`, \`!b\`, \`x++\`, \`(int) d\`).
* Binary: two operands (\`a + b\`).
* Ternary: exactly one – \`a ? b : c\`.

## Type of the result

* Arithmetic on integers smaller than \`int\` (\`byte\`, \`short\`, \`char\`) **promotes to \`int\`**.
* If either operand is \`long\`, the result is \`long\`; \`float\` → \`float\`; \`double\` → \`double\`.
* Relational, equality and logical operators produce \`boolean\`.
* \`+\` with any \`String\` operand is concatenation and yields a \`String\`.
`
    },
    {
      id: 'unary',
      title: 'Unary operators and increment/decrement',
      md: `## Logical complement and negation

* \`!\` works on \`boolean\` only: \`!5\` fails. \`-\` works on numbers only: \`-true\` fails.
* \`~\` (bitwise complement) works on integral types: \`~x == -x - 1\`, e.g. \`~5 == -6\`.
* Unary \`+\`/\`-\` on \`byte\`/\`short\`/\`char\` **promotes to int**: \`byte b = 1; b = -b;\` **fails** (needs a cast); \`byte b = -1;\` is fine (constant).

## Pre- vs post-increment

\`\`\`java
int x = 5;
int y = x++;    // y = 5, x = 6   (use old value, then increment)
int z = ++x;    // z = 7, x = 7   (increment, then use new value)
\`\`\`

Both forms **change the variable immediately**; only the *value of the expression* differs. Evaluate left to right, substituting values as you go:

\`\`\`java
int a = 3;
int b = a++ + ++a * a--;
// a++  → 3   (a=4)
// ++a  → 5   (a=5)
// a--  → 5   (a=4)
// b = 3 + 5*5 = 28, a = 4
\`\`\`

* \`x++\` can only be applied to a **variable**, not a literal or expression: \`5++\` and \`(x+1)++\` fail.
* Increment works on \`char\` (\`'a'++\` → \`'b'\`), on wrapper objects (creates a new object), and on \`byte\`/\`short\` **without a cast** (implicit narrowing built in).
* Increment on a \`final\` variable fails to compile.
`
    },
    {
      id: 'arithmetic',
      title: 'Arithmetic, promotion and casting',
      md: `## Integer division and modulus

* \`7 / 2\` → \`3\` (truncates toward zero), \`-7 / 2\` → \`-3\`.
* \`%\` result takes the **sign of the left operand**: \`-7 % 2\` → \`-1\`, \`7 % -2\` → \`1\`.
* Integer division by zero → \`ArithmeticException\`. Floating division by zero → \`Infinity\`/\`-Infinity\`/\`NaN\` (\`0.0/0.0\`). \`5 % 0\` → exception; \`5.0 % 0\` → \`NaN\`.
* \`%\` works on floating types too: \`5.5 % 2\` → \`1.5\`.

## Numeric promotion rules

1. If either operand is \`double\` → both become \`double\`; else \`float\`; else \`long\`.
2. Otherwise **both become \`int\`**, even if both are \`byte\`/\`short\`/\`char\`.
3. Result has the promoted type.

\`\`\`java
byte a = 10, b = 20;
byte c = a + b;          // DOES NOT COMPILE (int)
short s = 10;
s = s * 2;               // DOES NOT COMPILE
long l = 5 * 3_000_000_000L;   // OK: 5 promoted to long
int i = 5 / 2.0;         // DOES NOT COMPILE (double)
double d = 5 / 2;        // 2.0 – integer division happens first!
\`\`\`

## Casting

* \`(type) expr\` – highest-ish precedence, applies only to the **immediately following operand**: \`(int) 5.7 + 2.3\` → \`5 + 2.3 = 7.3\` (double).
* Narrowing casts **truncate** toward zero (\`(int) -3.9\` → \`-3\`) and **overflow wraps**: \`(byte) 128\` → \`-128\`, \`(byte) 200\` → \`-56\`, \`(int) 3_000_000_000L\` → \`-1294967296\`.
* \`(int) Double.NaN\` → \`0\`; \`(int) 1e20\` → \`Integer.MAX_VALUE\` (saturates).
* You cannot cast \`boolean\` to/from a number, or an object to an unrelated type at compile time.
* Casting a primitive to a wrapper of a *different* type fails: \`(Long) 5\` and \`(Integer) 5L\` do not compile; \`(Integer) 5\` and \`(Object) 5\` are fine.

## Overflow

\`Integer.MAX_VALUE + 1\` → \`Integer.MIN_VALUE\` silently. \`Math.addExact\` throws instead. \`int x = 2147483647 + 1;\` compiles (constant expression that overflows) and stores \`-2147483648\`.

## Compound assignment operators

\`a op= b\` is \`a = (T)(a op b)\` where \`T\` is the type of \`a\` – **the cast is implicit**:

\`\`\`java
short s = 5;
s += 2.7;      // OK: s = (short)(5 + 2.7) = 7
s = s + 2;     // DOES NOT COMPILE
int i = 10;
i /= 3.0;      // i = 3
long l = 10;
int j = 5;
j *= l;        // OK: j = (int)(5L * 10)
\`\`\`

The left side of a compound assignment is evaluated **once**: \`arr[i++] += 1\` increments \`i\` only once. A compound assignment **must have a declared variable** – \`int x += 5;\` does not compile.

## Assignment as expression

Assignment returns the assigned value: \`int a, b; a = b = 5;\` sets both. \`if (x = 5)\` fails (int), \`if (flag = true)\` compiles.

The type of an assignment expression is the type of the **variable**: \`byte b; int i = (b = 3);\` compiles, and \`(b = 3)\` is a \`byte\`.
`
    },
    {
      id: 'relational-logical',
      title: 'Relational, equality and logical operators',
      md: `## Relational

\`<\`, \`>\`, \`<=\`, \`>=\` apply to numeric primitives (and wrappers, which unbox). \`"a" < "b"\` does not compile – use \`compareTo\`.

\`instanceof\` (see Chapter 3 for patterns): left side must be a reference; \`null instanceof X\` is always \`false\`; the compiler rejects \`instanceof\` between unrelated class types (\`Integer i; i instanceof String\` fails), but allows it with interfaces on non-final classes.

## Equality

* Numeric primitives: compare values, with promotion (\`5 == 5.0\` → \`true\`, \`'a' == 97\` → \`true\`).
* \`boolean == boolean\` allowed; \`boolean == int\` **fails**.
* References: identity. \`new String("a") == new String("a")\` → \`false\`. Two **literals** \`"a" == "a"\` → \`true\` (string pool).
* Wrapper \`==\` wrapper: identity (cache trap). Wrapper \`==\` primitive: **unboxes**, compares values (\`Integer.valueOf(1000) == 1000\` → \`true\`).
* Comparing references of unrelated types (\`Integer == String\`) **fails to compile**; \`Object == String\` compiles.
* \`null == null\` → \`true\`.

## Logical operators

| Operator | Name | Evaluates right side? |
|---|---|---|
| \`&\` | AND | always |
| \`\\|\` | inclusive OR | always |
| \`^\` | XOR | always – \`true\` iff operands differ |
| \`&&\` | short-circuit AND | only if left is \`true\` |
| \`\\|\\|\` | short-circuit OR | only if left is \`false\` |

Side effects on the right side (\`x++\`, method calls, null dereferences) are **skipped** when short-circuited – the exam's favourite way to make a variable's final value surprising, or to make a potential \`NullPointerException\` disappear.

\`&\`, \`|\`, \`^\` on integral types are **bitwise** (\`6 & 3\` → \`2\`, \`6 | 3\` → \`7\`, \`6 ^ 3\` → \`5\`). There is no \`^^\`.

## Ternary

\`cond ? a : b\` – only one of \`a\`/\`b\` is evaluated. Both branches must be assignable to the target type; numeric branches are promoted (\`true ? 1 : 2.0\` is a double). Nested ternaries associate to the right: \`a ? b : c ? d : e\` = \`a ? b : (c ? d : e)\`. Ternary cannot be a statement on its own (\`c ? x++ : y++;\` **fails** – but an assignment \`z = c ? x++ : y++;\` is fine).
`
    },
    {
      id: 'bitwise-shift',
      title: 'Shift operators (light coverage)',
      md: `Shift operators appear rarely but are fair game under objective 1a.

* \`<<\` shifts left, filling with zeros: \`1 << 3\` → \`8\` (multiply by 2ⁿ).
* \`>>\` **signed** right shift, keeps the sign bit: \`-8 >> 1\` → \`-4\`.
* \`>>>\` **unsigned** right shift, fills with zeros: \`-1 >>> 28\` → \`15\`.
* Operands are promoted to \`int\` (or \`long\`); the shift distance is taken **mod 32** for int (\`1 << 33\` → \`2\`) and mod 64 for long.
* No shift for \`boolean\`, \`float\`, \`double\`.
`
    },
    {
      id: 'summary-table',
      title: 'Quick-reference: operator traps',
      md: `| Expression | Result / verdict |
|---|---|
| \`byte b = 1; b = b + 1;\` | ✗ – \`int\` result |
| \`byte b = 1; b += 1; b++;\` | ✓ – implicit cast |
| \`short s = 1; s = -s;\` | ✗ – unary minus promotes to int |
| \`int x = 5 / 2 * 2.0;\` | ✗ – \`5.0\` is a double |
| \`double d = 5 / 2;\` | \`2.0\` |
| \`-7 % 3\` | \`-1\` |
| \`7 % -3\` | \`1\` |
| \`(byte) 130\` | \`-126\` |
| \`(int) -2.9\` | \`-2\` |
| \`Integer.MAX_VALUE + 1\` | \`Integer.MIN_VALUE\` |
| \`5 == 5.0\` | \`true\` |
| \`Integer.valueOf(200) == Integer.valueOf(200)\` | \`false\` |
| \`Integer.valueOf(200) == 200\` | \`true\` |
| \`true ^ true\` | \`false\` |
| \`"1" + 2 + 3\` | \`"123"\` |
| \`1 + 2 + "3"\` | \`"33"\` |
| \`int x; x = x++;\` with x=5 | x stays 5 |
| \`c ? 1 : 2;\` as a statement | ✗ |
| \`int y += 1;\` | ✗ |
`
    }
  ],

  gotchas: [
    { title: 'x = x++ leaves x unchanged', md: 'The old value (5) is captured, `x` becomes 6, then the assignment writes the captured 5 back. Net effect: `x == 5`.' },
    { title: 'byte + byte is an int', md: 'Any arithmetic on `byte`, `short`, `char` yields at least `int`. `byte c = a + b;` fails; `byte c = (byte)(a + b);` works. Compound operators (`+=`) hide the cast for you.' },
    { title: 'Unary minus also promotes', md: '`short s = 5; s = -s;` fails – `-s` is an `int`. `s = (short) -s;` works.' },
    { title: 'Compound assignment casts silently', md: '`int i = 10; i *= 1.5;` compiles and gives 15 – `i = (int)(i * 1.5)`. `i = i * 1.5;` does not compile.' },
    { title: 'Compound assignment needs an existing variable', md: '`int x += 1;` and `var y -= 2;` fail; the variable must already be declared.' },
    { title: 'Integer division comes first', md: '`double d = 7 / 2;` is `3.0`, not `3.5`. Write `7 / 2.0` or `(double) 7 / 2`. Note `(double)(7 / 2)` is still `3.0`.' },
    { title: 'Cast binds tightly', md: '`(int) 9.9 / 2` is `9 / 2 = 4`; `(int)(9.9 / 2)` is `4` too, but `(int) 9.9 / 2.0` is `4.5`. The cast applies only to the next operand.' },
    { title: 'Modulus sign follows the dividend', md: '`-11 % 3` → `-2`; `11 % -3` → `2`.' },
    { title: 'Division by zero', md: 'Integer `/` or `%` by 0 → `ArithmeticException`. Floating point → `Infinity` or `NaN`, never an exception.' },
    { title: 'Narrowing casts wrap around', md: '`(byte) 128` → `-128`; `(byte) 255` → `-1`; `(short) 65536` → `0`; `(char) -1` → `\'\\uffff\'`. The high-order bits are simply dropped.' },
    { title: 'Constant expressions may overflow silently', md: '`int x = Integer.MAX_VALUE + 1;` compiles (result is MIN_VALUE). But `int y = 2147483648;` fails because the *literal* itself is out of range.' },
    { title: 'String concatenation is left-to-right', md: '`1 + 2 + "3"` → `"33"`; `"1" + 2 + 3` → `"123"`; `"" + 1 + 2` → `"12"`; `1 + (2 + "3")` → `"123"`. `char + int` is arithmetic: `\'a\' + 1` → `98`, `"" + \'a\' + 1` → `"a1"`.' },
    { title: '&& and || skip the right operand', md: 'If `x++` or a method call sits on the right of a short-circuited `&&`/`||`, it may never run. Track whether the left side already decided the result. `&`/`|` always evaluate both sides.' },
    { title: '^ is XOR, not power', md: '`2 ^ 3` is `1` (bitwise). For booleans, `true ^ false` is `true`, `true ^ true` is `false`. There is no `**` and no `^^` in Java.' },
    { title: '== between wrappers vs wrapper and primitive', md: 'Two wrappers compare identity (cache −128..127). Wrapper vs primitive unboxes and compares values. `Integer == String` does not compile at all.' },
    { title: '== with mixed primitive types', md: '`5 == 5.0` → `true`, `\'a\' == 97` → `true`. `true == 1` does not compile: boolean vs numeric.' },
    { title: 'Ternary type promotion', md: '`var v = b ? 1 : 2.0;` is a `double` even when `b` is true. `int i = b ? 1 : 2.0;` fails. `Object o = b ? 1 : "s";` fine.' },
    { title: 'Ternary as a statement', md: '`flag ? a++ : b++;` does not compile – a ternary is not a statement. Assign it or use `if`.' },
    { title: 'Increment on a literal or expression', md: '`5++` and `(a + b)++` fail – the operand must be a variable. `(a)++` compiles because a parenthesised variable is still a variable.' },
    { title: 'Evaluation is left to right, always', md: 'In `a[i] = i = 2;` the array index uses the *old* `i`. In `x + y * z++` the operands are evaluated left to right but precedence still applies to combine them.' },
    { title: 'Casting to an unrelated wrapper', md: '`(Long) 5` and `(Integer) 5L` do not compile (int cannot become Long via cast). `(long) 5` then autobox: `Long l = (long) 5;` works.' },
    { title: 'Shift distance is masked', md: '`1 << 32` is `1`, `1 << 33` is `2` for an int (distance mod 32). `>>>` on a negative number gives a large positive.' }
  ],

  traps: [
    {
      code: `int x = 3;
int y = x++ + ++x * x--;
System.out.println(x + " " + y);`,
      prompt: 'What prints?',
      answer: 'Prints **`4 28`**. Left to right: `x++` → 3 (x=4), `++x` → 5 (x=5), `x--` → 5 (x=4). Precedence: 3 + 5*5 = 28.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int x = 3;
int y = x++ + ++x * x--;
System.out.println(x + " " + y);
} }` }, expect: { output: '4 28' } }
    },
    {
      code: `byte b = 10;
b = b * 2;
b *= 2;
System.out.println(b);`,
      prompt: 'Does it compile?',
      answer: '**No.** `b * 2` is an `int` and cannot be assigned to a `byte` without a cast. The compound `b *= 2` alone would be fine (implicit cast).'
    },
    {
      code: `int i = 10;
i /= 4.0;
short s = 1;
s += 1.9;
System.out.println(i + " " + s);`,
      prompt: 'What prints?',
      answer: 'Prints **`2 2`**. Compound assignments cast back to the variable type: `(int)(10 / 4.0)` = 2, `(short)(1 + 1.9)` = 2 (truncation).',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int i = 10;
i /= 4.0;
short s = 1;
s += 1.9;
System.out.println(i + " " + s);
} }` }, expect: { output: '2 2' } }
    },
    {
      code: `int a = 5;
boolean r = a < 3 && a++ > 0;
boolean t = a > 3 || ++a > 0;
System.out.println(r + " " + t + " " + a);`,
      prompt: 'What prints?',
      answer: 'Prints **`false true 5`**. Both right-hand sides are short-circuited (`a < 3` is false; `a > 3` is true), so `a` is never modified.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
int a = 5;
boolean r = a < 3 && a++ > 0;
boolean t = a > 3 || ++a > 0;
System.out.println(r + " " + t + " " + a);
} }` }, expect: { output: 'false true 5' } }
    },
    {
      code: `System.out.println((byte) 200);
System.out.println((int) -7.9);
System.out.println(-7 % 3);
System.out.println(7 / 2 * 2.0);`,
      prompt: 'What prints?',
      answer: 'Prints **`-56`**, **`-7`**, **`-1`**, **`6.0`**. 200 wraps (200 − 256), casts truncate toward zero, the modulus takes the dividend\'s sign, and `7 / 2` is integer 3 before being multiplied by `2.0`.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
System.out.println((byte) 200);
System.out.println((int) -7.9);
System.out.println(-7 % 3);
System.out.println(7 / 2 * 2.0);
} }` }, expect: { output: '-56\n-7\n-1\n6.0' } }
    },
    {
      code: `Integer a = 1000, b = 1000;
int c = 1000;
Long d = 1000L;
System.out.print(a == b);
System.out.print(" " + (a == c));
System.out.print(" " + a.equals(c));
System.out.print(" " + a.equals(d));`,
      prompt: 'What prints?',
      answer: 'Prints **`false true true false`**. Two `Integer` objects outside the cache differ by identity; `a == c` unboxes; `a.equals(c)` boxes `c` to Integer; `a.equals(d)` compares Integer to Long → false.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
Integer a = 1000, b = 1000;
int c = 1000;
Long d = 1000L;
System.out.print(a == b);
System.out.print(" " + (a == c));
System.out.print(" " + a.equals(c));
System.out.print(" " + a.equals(d));
} }` }, expect: { output: 'false true true false' } }
    },
    {
      code: `int x = 5;
x = x++;
x = x++ + x;
System.out.println(x);`,
      prompt: 'What prints?',
      answer: 'Prints **`11`**. `x = x++` leaves x at 5. Then `x++` yields 5 (x becomes 6), `+ x` uses the new 6 → 11.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int x = 5;
x = x++;
x = x++ + x;
System.out.println(x);
} }` }, expect: { output: '11' } }
    },
    {
      code: `System.out.println(1 + 2 + "3" + 4 + 5);
System.out.println('a' + 'b' + "c");
System.out.println("c" + 'a' + 'b');
System.out.println((char)('a' + 1) + "!");`,
      prompt: 'What prints?',
      answer: 'Prints **`3345`**, **`195c`**, **`cab`**, **`b!`**. Left-to-right: numbers add until a String appears; `\'a\' + \'b\'` is 97 + 98 = 195; the cast turns 98 back into `\'b\'`.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
System.out.println(1 + 2 + "3" + 4 + 5);
System.out.println('a' + 'b' + "c");
System.out.println("c" + 'a' + 'b');
System.out.println((char)('a' + 1) + "!");
} }` }, expect: { output: '3345\n195c\ncab\nb!' } }
    }
  ],

  questions: [
    {
      id: 'ch02-q01', type: 'single', difficulty: 'easy', objectiveIds: ['1a'], tags: ['increment'],
      question: 'What is the output?',
      code: `int a = 10;
int b = a++ + a;
int c = ++a + a--;
System.out.println(a + " " + b + " " + c);`,
      options: ['11 21 24', '11 20 24', '12 21 24', '11 21 23', '10 21 22'],
      answer: [0],
      explanation: '`a++` → 10 (a=11), `+ a` → 11 → b = 21. `++a` → 12 (a=12), `a--` → 12 (a=11) → c = 24. Final a = 11.',
      optionNotes: { '0': 'Correct.', '1': 'Post-increment already updated `a` before the second operand was read.', '2': '`a--` reduces a back to 11.', '3': '`a--` yields the value before decrementing (12).', '4': 'Increments do change `a`.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
int a = 10;
int b = a++ + a;
int c = ++a + a--;
System.out.println(a + " " + b + " " + c);
} }` }, expect: { output: '11 21 24' } }
    },
    {
      id: 'ch02-q02', type: 'multi', difficulty: 'medium', objectiveIds: ['1a'], tags: ['promotion', 'compile'],
      question: 'Which lines compile? (Choose all that apply.)',
      code: `byte b = 5;                 // line 1
b = b + 1;                  // line 2
b += 1;                     // line 3
b++;                        // line 4
short s = b * 2;            // line 5
char c = 'a';
c = c + 1;                  // line 7
int i = c + 1;              // line 8
long l = i * 2;             // line 9
float f = l / 2;            // line 10`,
      options: ['line 2', 'line 3', 'line 4', 'line 5', 'line 7', 'line 8', 'line 9', 'line 10'],
      answer: [1, 2, 5, 6, 7],
      explanation: 'Arithmetic on byte/short/char produces an `int`, so plain assignments back to those types (lines 2, 5, 7) fail. Compound assignment and `++` include implicit casts. Assigning an `int` to `int`, `long`, or `float` widens.',
      optionNotes: { '0': '`b + 1` is int.', '1': 'Implicit cast.', '2': 'Implicit cast.', '3': '`b * 2` is int, not short.', '4': '`c + 1` is int.', '5': 'int to int.', '6': 'int widens to long.', '7': 'long widens to float (allowed, with possible precision loss).' },
      verify: null
    },
    {
      id: 'ch02-q03', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['compound-assignment'],
      question: 'What is the output?',
      code: `int x = 7;
x += 2.5;
x -= 0.5;
x *= 1.5;
System.out.println(x);`,
      options: ['13', '13.5', '12', '14', 'The code does not compile.'],
      answer: [2],
      explanation: 'Each compound assignment casts back to int, truncating: 7 + 2.5 = 9.5 → 9; 9 − 0.5 = 8.5 → 8; 8 × 1.5 = 12.0 → 12.',
      optionNotes: { '0': 'Forgets the truncation after each step.', '1': '`x` is an int.', '2': 'Correct: 9 → 8 → 12.', '3': 'Forgets the truncation after each step.', '4': 'Compound assignment permits the implicit cast.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int x = 7;
x += 2.5;
x -= 0.5;
x *= 1.5;
System.out.println(x);
} }` }, expect: { output: '12' } }
    },
    {
      id: 'ch02-q04', type: 'single', difficulty: 'easy', objectiveIds: ['1a'], tags: ['division', 'modulus'],
      question: 'What is the output?',
      code: `System.out.print(-13 / 4);
System.out.print(" ");
System.out.print(-13 % 4);
System.out.print(" ");
System.out.print(13 % -4);
System.out.print(" ");
System.out.print(13.0 / 4);`,
      options: ['-4 -1 1 3.25', '-3 -1 1 3.25', '-3 1 -1 3.25', '-3 -1 1 3', '-3 3 -3 3.25'],
      answer: [1],
      explanation: 'Integer division truncates toward zero (−3.25 → −3). The remainder carries the sign of the left operand. `13.0 / 4` is floating-point division.',
      optionNotes: { '0': 'Truncation is toward zero, not floor.', '1': 'Correct.', '2': 'Signs reversed.', '3': '`13.0 / 4` is a double.', '4': 'Remainders are 1 in magnitude.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
System.out.print(-13 / 4);
System.out.print(" ");
System.out.print(-13 % 4);
System.out.print(" ");
System.out.print(13 % -4);
System.out.print(" ");
System.out.print(13.0 / 4);
} }` }, expect: { output: '-3 -1 1 3.25' } }
    },
    {
      id: 'ch02-q05', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['cast', 'precedence'],
      question: 'What is the output?',
      code: `double d = 9.99;
int a = (int) d / 2;
int b = (int) (d / 2);
double c = (int) d / 2.0;
System.out.println(a + " " + b + " " + c);`,
      options: ['4 4 4.5', '4 4 4.995', '4 5 4.5', '4.5 4 4.5', 'The code does not compile.'],
      answer: [0],
      explanation: 'A cast applies to the immediately following operand. `(int) d` is 9, so `9 / 2` = 4 and `9 / 2.0` = 4.5. `(int)(9.99 / 2)` = `(int) 4.995` = 4.',
      optionNotes: { '0': 'Correct.', '1': '`c` uses the casted 9, not 9.99.', '2': '4.995 truncates to 4.', '3': '`a` is an int.', '4': 'Compiles.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
double d = 9.99;
int a = (int) d / 2;
int b = (int) (d / 2);
double c = (int) d / 2.0;
System.out.println(a + " " + b + " " + c);
} }` }, expect: { output: '4 4 4.5' } }
    },
    {
      id: 'ch02-q06', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['cast', 'overflow'],
      question: 'What is the output?',
      code: `int big = 300;
byte b = (byte) big;
short s = (short) 70000;
char c = (char) 65601;
System.out.println(b + " " + s + " " + c);`,
      options: ['44 4464 A', '300 70000 A', '44 4464 65601', '-44 4464 A', 'The code does not compile.'],
      answer: [0],
      explanation: 'Narrowing keeps the low-order bits: 300 − 256 = 44; 70000 − 65536 = 4464; 65601 − 65536 = 65 = \'A\'.',
      optionNotes: { '0': 'Correct.', '1': 'Values are truncated, not preserved.', '2': 'A char prints as a character.', '3': '44 is within byte range; no sign flip.', '4': 'Explicit casts are legal.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int big = 300;
byte b = (byte) big;
short s = (short) 70000;
char c = (char) 65601;
System.out.println(b + " " + s + " " + c);
} }` }, expect: { output: '44 4464 A' } }
    },
    {
      id: 'ch02-q07', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['short-circuit'],
      question: 'What is the output?',
      code: `int x = 0;
boolean a = false & (x++ > 0);
boolean b = false && (x++ > 0);
boolean c = true | (x++ > 0);
boolean d = true || (x++ > 0);
System.out.println(x + " " + a + b + c + d);`,
      options: ['2 falsefalsetruetrue', '4 falsefalsetruetrue', '0 falsefalsetruetrue', '2 falsetruetruetrue', 'The code does not compile.'],
      answer: [0],
      explanation: '`&` and `|` always evaluate both operands (two increments). `&&` with a false left side and `||` with a true left side skip the right operand.',
      optionNotes: { '0': 'Correct.', '1': 'Short-circuit forms skip the increment.', '2': 'Non-short-circuit forms do evaluate the right side.', '3': '`b` is false.', '4': 'Compiles.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] z) {
int x = 0;
boolean a = false & (x++ > 0);
boolean b = false && (x++ > 0);
boolean c = true | (x++ > 0);
boolean d = true || (x++ > 0);
System.out.println(x + " " + a + b + c + d);
} }` }, expect: { output: '2 falsefalsetruetrue' } }
    },
    {
      id: 'ch02-q08', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['short-circuit', 'npe'],
      question: 'What is the result?',
      code: `String s = null;
int len = 0;
if (s != null & s.length() > 0) len = s.length();
System.out.println(len);`,
      options: ['0', 'The code does not compile.', 'A NullPointerException is thrown.', 'An ArithmeticException is thrown.', 'null'],
      answer: [2],
      explanation: 'The non-short-circuit `&` evaluates `s.length()` even though the left side is false → `NullPointerException`. With `&&` the output would be 0.',
      optionNotes: { '0': 'Only with `&&`.', '1': '`&` on booleans is legal.', '2': 'Correct.', '3': 'No arithmetic.', '4': 'An int cannot print null.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
String s = null;
int len = 0;
if (s != null & s.length() > 0) len = s.length();
System.out.println(len);
} }` }, expect: 'runtime-exception' }
    },
    {
      id: 'ch02-q09', type: 'single', difficulty: 'easy', objectiveIds: ['1a'], tags: ['xor', 'bitwise'],
      question: 'What is the output?',
      code: `boolean a = true ^ true;
boolean b = true ^ false;
int c = 6 ^ 3;
int d = 6 & 3;
int e = 6 | 3;
System.out.println(a + " " + b + " " + c + d + e);`,
      options: ['false true 527', 'false true 5 2 7', 'true false 527', 'false true 1', 'The code does not compile.'],
      answer: [0],
      explanation: 'XOR is true when operands differ. 6 = 110, 3 = 011: XOR 101 = 5, AND 010 = 2, OR 111 = 7. The ints are concatenated as strings after `" "`.',
      optionNotes: { '0': 'Correct.', '1': 'No spaces between c, d, e.', '2': 'XOR of equal values is false.', '3': '`^` is not exponentiation.', '4': 'Compiles.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
boolean a = true ^ true;
boolean b = true ^ false;
int c = 6 ^ 3;
int d = 6 & 3;
int e = 6 | 3;
System.out.println(a + " " + b + " " + c + d + e);
} }` }, expect: { output: 'false true 527' } }
    },
    {
      id: 'ch02-q10', type: 'multi', difficulty: 'medium', objectiveIds: ['1a'], tags: ['equality', 'compile'],
      question: 'Which expressions compile? (Choose all that apply.) Assume `int i = 1; Integer w = 1; long l = 1; boolean b = true; String s = "1"; Object o = s;`',
      code: null,
      options: ['i == l', 'i == b', 'w == i', 'w == s', 'o == s', 'i == 1.0'],
      answer: [0, 2, 4, 5],
      explanation: 'Numeric primitives compare with promotion, wrappers unbox against primitives, and references compare when one type is assignable to the other. `boolean` vs `int` and `Integer` vs `String` are incomparable types.',
      optionNotes: { '0': 'int promoted to long.', '1': 'boolean cannot be compared to a number.', '2': 'Integer unboxes.', '3': 'Incomparable reference types.', '4': 'String is an Object.', '5': 'int promoted to double.' },
      verify: null
    },
    {
      id: 'ch02-q11', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['equality', 'wrapper'],
      question: 'What is the output?',
      code: `Integer a = 127;
Integer b = 127;
Long c = 127L;
System.out.print(a == b);
System.out.print(" " + a.equals(b));
System.out.print(" " + a.equals(c));
System.out.print(" " + (a == 127L));`,
      options: ['true true false true', 'true true true true', 'false true false true', 'true true false false', 'The code does not compile.'],
      answer: [0],
      explanation: '127 is cached, so `a == b` is true. `equals` is type-strict: Integer vs Long → false. `a == 127L` unboxes `a` and promotes to long → true.',
      optionNotes: { '0': 'Correct.', '1': '`Integer.equals(Long)` is false.', '2': '127 is inside the cache.', '3': 'Wrapper vs primitive compares values.', '4': 'Compiles.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
Integer a = 127;
Integer b = 127;
Long c = 127L;
System.out.print(a == b);
System.out.print(" " + a.equals(b));
System.out.print(" " + a.equals(c));
System.out.print(" " + (a == 127L));
} }` }, expect: { output: 'true true false true' } }
    },
    {
      id: 'ch02-q12', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['ternary'],
      question: 'What is the output?',
      code: `int x = 5;
var r = x > 3 ? 1 : 2.0;
Object o = x > 3 ? "big" : 7;
System.out.println(r + " " + o);`,
      options: ['1 big', '1.0 big', '1.0 7', 'The code does not compile because var cannot hold a ternary.', 'The code does not compile because the branches have different types.'],
      answer: [1],
      explanation: 'When both branches are numeric they undergo binary numeric promotion: the expression is a `double`, so `r` is `1.0`. Mixed reference branches are fine when the target (`Object`) accepts both.',
      optionNotes: { '0': '`r` is a double.', '1': 'Correct.', '2': 'The condition is true.', '3': '`var` infers the type of any expression except null/lambda.', '4': 'Both compile.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int x = 5;
var r = x > 3 ? 1 : 2.0;
Object o = x > 3 ? "big" : 7;
System.out.println(r + " " + o);
} }` }, expect: { output: '1.0 big' } }
    },
    {
      id: 'ch02-q13', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['ternary', 'side-effect'],
      question: 'What is the output?',
      code: `int a = 1, b = 1;
int c = a > 0 ? a++ : b++;
int d = a > 5 ? a++ : b++;
System.out.println(a + " " + b + " " + c + " " + d);`,
      options: ['2 2 1 1', '2 2 2 2', '2 1 1 1', '3 1 1 2', 'The code does not compile.'],
      answer: [0],
      explanation: 'Only the chosen branch is evaluated. First ternary: `a++` → c = 1, a = 2. Second: `a > 5` false → `b++` → d = 1, b = 2.',
      optionNotes: { '0': 'Correct.', '1': 'Post-increment yields the old value.', '2': 'The second ternary evaluates `b++`.', '3': 'Only one branch runs each time.', '4': 'Compiles.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
int a = 1, b = 1;
int c = a > 0 ? a++ : b++;
int d = a > 5 ? a++ : b++;
System.out.println(a + " " + b + " " + c + " " + d);
} }` }, expect: { output: '2 2 1 1' } }
    },
    {
      id: 'ch02-q14', type: 'multi', difficulty: 'hard', objectiveIds: ['1a'], tags: ['compile', 'unary'],
      question: 'Which statements do NOT compile? (Choose all that apply.) Assume `int i = 1; boolean b = true; short s = 1; final int f = 1;`',
      code: null,
      options: ['int j = -(-i);', 'boolean c = !i;', 's = -s;', 'f++;', 'int k = ~i;', 'i = i++ + ++i;', 'b = b ? true : false;'],
      answer: [1, 2, 3],
      explanation: '`!` requires a boolean. Unary minus promotes `short` to `int`, so `s = -s` needs a cast. A `final` variable cannot be incremented. Double negation, bitwise complement, self-referential increments and boolean ternaries are all legal.',
      optionNotes: { '0': 'Legal: 1.', '1': '`!` on an int – error.', '2': '`-s` is an int.', '3': 'Cannot assign to a final variable.', '4': '~1 is -2; legal.', '5': 'Legal (i becomes 4).', '6': 'Legal, if silly.' },
      verify: null
    },
    {
      id: 'ch02-q15', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['increment', 'assignment'],
      question: 'What is the output?',
      code: `int i = 5;
i = i++;
i = i++ + i++;
System.out.println(i);`,
      options: ['11', '12', '13', '7', '5'],
      answer: [0],
      explanation: '`i = i++` leaves i at 5 (the increment is overwritten). Then `i++` → 5 (i=6), `i++` → 6 (i=7), sum = 11 assigned to i, discarding the 7.',
      optionNotes: { '0': 'Correct.', '1': 'The pending increment is overwritten by the assignment.', '2': 'Overwritten by assignment.', '3': 'The sum, not the incremented value, is stored.', '4': 'The second statement changes i.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int i = 5;
i = i++;
i = i++ + i++;
System.out.println(i);
} }` }, expect: { output: '11' } }
    },
    {
      id: 'ch02-q16', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['overflow'],
      question: 'What is the output?',
      code: `int max = Integer.MAX_VALUE;
max++;
long big = Integer.MAX_VALUE + 1;
long ok = Integer.MAX_VALUE + 1L;
System.out.println(max + " " + big + " " + ok);`,
      options: ['-2147483648 -2147483648 2147483648', '2147483648 2147483648 2147483648', '-2147483648 2147483648 2147483648', 'The code does not compile.', 'An ArithmeticException is thrown.'],
      answer: [0],
      explanation: 'Integer arithmetic wraps silently. `Integer.MAX_VALUE + 1` is computed in `int` (wrapping) *before* being widened to long. Adding `1L` promotes to long first, avoiding overflow.',
      optionNotes: { '0': 'Correct.', '1': 'int overflow wraps.', '2': 'The int addition happens before widening.', '3': 'Compiles.', '4': 'Only `Math.addExact` throws.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
int max = Integer.MAX_VALUE;
max++;
long big = Integer.MAX_VALUE + 1;
long ok = Integer.MAX_VALUE + 1L;
System.out.println(max + " " + big + " " + ok);
} }` }, expect: { output: '-2147483648 -2147483648 2147483648' } }
    },
    {
      id: 'ch02-q17', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['division-by-zero'],
      question: 'What is the output?',
      code: `double a = 5 / 0.0;
double b = -5 / 0.0;
double c = 0.0 / 0.0;
System.out.print(a + " " + b + " " + c + " ");
System.out.print(5 % 0);`,
      options: ['Infinity -Infinity NaN followed by an ArithmeticException', 'Infinity -Infinity NaN 0', 'The code does not compile.', 'An ArithmeticException is thrown before anything prints.', 'NaN NaN NaN 0'],
      answer: [0],
      explanation: 'Floating-point division by zero yields ±Infinity or NaN and never throws. Integer `%` (or `/`) by zero throws `ArithmeticException` – after the first `print` has already executed.',
      optionNotes: { '0': 'Correct.', '1': 'Integer modulus by zero throws.', '2': 'Compiles (the compiler does not check for division by zero).', '3': 'The first line prints before the exception.', '4': 'Only 0.0/0.0 is NaN.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
double a = 5 / 0.0;
double b = -5 / 0.0;
double c = 0.0 / 0.0;
System.out.print(a + " " + b + " " + c + " ");
System.out.print(5 % 0);
} }` }, expect: 'runtime-exception' }
    },
    {
      id: 'ch02-q18', type: 'single', difficulty: 'easy', objectiveIds: ['1a', '1b'], tags: ['concatenation'],
      question: 'What is the output?',
      code: `System.out.println(1 + 2 + "3" + 4 * 2);
System.out.println("" + 'a' + 'b');
System.out.println('a' + 'b' + "");`,
      options: ['338 ab 195', '3342 ab 195', '338 ab ab', '1238 195 195', '338 ab ab'],
      answer: [0],
      explanation: '`1 + 2` = 3, then String concatenation with "3" gives "33", then `4 * 2` (higher precedence) = 8 → "338". `"" + \'a\'` starts concatenation immediately → "ab". `\'a\' + \'b\'` is char arithmetic (195) before the String.',
      optionNotes: { '0': 'Correct.', '1': '`*` binds tighter than `+`.', '2': 'Char + char is numeric.', '3': 'Numeric addition happens before the first String.', '4': 'Char + char is numeric.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
System.out.println(1 + 2 + "3" + 4 * 2);
System.out.println("" + 'a' + 'b');
System.out.println('a' + 'b' + "");
} }` }, expect: { output: '338\nab\n195' } }
    },
    {
      id: 'ch02-q19', type: 'single', difficulty: 'hard', objectiveIds: ['1a'], tags: ['evaluation-order', 'array'],
      question: 'What is the output?',
      code: `int[] arr = {10, 20, 30};
int i = 0;
arr[i] = i = 2;
arr[i++] += 5;
System.out.println(arr[0] + " " + arr[1] + " " + arr[2] + " " + i);`,
      options: ['2 20 35 3', '10 20 2 3', '2 20 30 3', '2 25 30 3', '10 25 35 3'],
      answer: [0],
      explanation: 'The left-hand array index is evaluated first (i = 0), then the right side `i = 2` runs, so `arr[0] = 2`. In `arr[i++] += 5`, the index (2) is evaluated once and `i` becomes 3; `arr[2]` becomes 35.',
      optionNotes: { '0': 'Correct.', '1': 'The index uses the old `i` (0).', '2': 'The compound assignment adds 5 to arr[2].', '3': 'i was 2 at the second statement.', '4': 'The first statement writes to arr[0].' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
int[] arr = {10, 20, 30};
int i = 0;
arr[i] = i = 2;
arr[i++] += 5;
System.out.println(arr[0] + " " + arr[1] + " " + arr[2] + " " + i);
} }` }, expect: { output: '2 20 35 3' } }
    },
    {
      id: 'ch02-q20', type: 'multi', difficulty: 'medium', objectiveIds: ['1a'], tags: ['cast', 'compile'],
      question: 'Which compile? (Choose all that apply.)',
      code: null,
      options: ['Long a = (Long) 5;', 'Long b = (long) 5;', 'Integer c = (Integer) 5;', 'int d = (int) true;', 'Object e = (Object) 5;', 'Double f = (Double) 5.0f;'],
      answer: [1, 2, 4],
      explanation: 'A primitive can be cast to its *own* wrapper (boxing) or to another primitive. `int` → `Long` and `float` → `Double` are not permitted casts. Booleans cannot be cast to numbers. Boxing then widening to `Object` is fine.',
      optionNotes: { '0': 'int cannot be cast to Long.', '1': 'Cast to long, then box.', '2': 'Boxing cast.', '3': 'boolean is not numeric.', '4': 'Box to Integer, widen to Object.', '5': 'float cannot be cast to Double.' },
      verify: null
    },
    {
      id: 'ch02-q21', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['promotion', 'float'],
      question: 'What is the output?',
      code: `long l = 10;
float f = l / 4;
double d = l / 4.0;
int i = (int) (l / 4f);
System.out.println(f + " " + d + " " + i);`,
      options: ['2.0 2.5 2', '2.5 2.5 2', '2.0 2.5 2.5', '2 2.5 2', 'The code does not compile.'],
      answer: [0],
      explanation: '`l / 4` is long division = 2, widened to float 2.0. `l / 4.0` promotes to double 2.5. `l / 4f` is 2.5f, cast to int 2. long → float widening is allowed.',
      optionNotes: { '0': 'Correct.', '1': 'Integer division first.', '2': '`i` is an int.', '3': 'A float prints with a decimal.', '4': 'long → float is a widening conversion.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
long l = 10;
float f = l / 4;
double d = l / 4.0;
int i = (int) (l / 4f);
System.out.println(f + " " + d + " " + i);
} }` }, expect: { output: '2.0 2.5 2' } }
    },
    {
      id: 'ch02-q22', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['shift'],
      question: 'What is the output?',
      code: `System.out.println((1 << 3) + " " + (-16 >> 2) + " " + (-1 >>> 30) + " " + (1 << 33));`,
      options: ['8 -4 3 2', '8 -4 1073741823 0', '8 4 3 2', '8 -4 3 8589934592', '3 -4 3 2'],
      answer: [0],
      explanation: '`1 << 3` = 8. `>>` keeps the sign: −16 / 4 = −4. `>>>` fills with zeros: the top two bits of all-ones → 3. For an int the shift distance is taken mod 32, so `1 << 33` is `1 << 1` = 2.',
      optionNotes: { '0': 'Correct.', '1': '`-1 >>> 30` leaves two 1-bits: 3.', '2': '`>>` is signed.', '3': 'int shifts wrap mod 32.', '4': '`<<` multiplies by powers of two.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
System.out.println((1 << 3) + " " + (-16 >> 2) + " " + (-1 >>> 30) + " " + (1 << 33));
} }` }, expect: { output: '8 -4 3 2' } }
    },
    {
      id: 'ch02-q23', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['assignment-expression'],
      question: 'What is the output?',
      code: `int a, b, c;
a = b = c = 5;
a += b -= c *= 2;
System.out.println(a + " " + b + " " + c);`,
      options: ['0 -5 10', '5 -5 10', '10 0 10', '15 10 10', 'The code does not compile.'],
      answer: [0],
      explanation: 'Assignment is right-associative. `c *= 2` → c = 10 (value 10). `b -= 10` → b = −5 (value −5). `a += -5` → a = 0.',
      optionNotes: { '0': 'Correct.', '1': '`a` also changes.', '2': 'Evaluate right to left.', '3': 'Evaluate right to left.', '4': 'Chained compound assignments are legal.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
int a, b, c;
a = b = c = 5;
a += b -= c *= 2;
System.out.println(a + " " + b + " " + c);
} }` }, expect: { output: '0 -5 10' } }
    },
    {
      id: 'ch02-q24', type: 'single', difficulty: 'easy', objectiveIds: ['1a'], tags: ['ternary', 'compile'],
      question: 'Which statement about the following code is true?',
      code: `int score = 80;
score > 50 ? System.out.println("pass") : System.out.println("fail");`,
      options: ['It prints pass.', 'It prints fail.', 'It does not compile because a ternary cannot be used as a statement.', 'It does not compile because println returns void.', 'It throws an exception.'],
      answer: [2],
      explanation: 'A ternary expression is not a valid statement on its own (only assignments, increments, method calls, and object creation are). It would not compile even with non-void branches such as `score > 50 ? 1 : 2;`.',
      optionNotes: { '0': 'Never compiles.', '1': 'Never compiles.', '2': 'Correct – a conditional expression is not a statement.', '3': '`void` operands are also illegal, but the statement rule is the fundamental problem.', '4': 'Never runs.' },
      verify: null
    },
    {
      id: 'ch02-q25', type: 'multi', difficulty: 'hard', objectiveIds: ['1a'], tags: ['promotion', 'char'],
      question: 'Which of the following print `b`? (Choose all that apply.)',
      code: null,
      options: ['System.out.println(\'a\' + 1);', 'System.out.println((char) (\'a\' + 1));', 'char c = \'a\'; c++; System.out.println(c);', 'char c = \'a\'; System.out.println(c + 1);', 'char c = \'a\' + 1; System.out.println(c);', 'char c = \'a\'; c += 1; System.out.println(c);'],
      answer: [1, 2, 4, 5],
      explanation: '`\'a\' + 1` is an int expression (98) and prints 98. It prints as `b` only when the result is a `char`: via an explicit cast, via `++`/`+=` (implicit cast), or via constant narrowing in a `char` initialiser.',
      optionNotes: { '0': 'Prints 98.', '1': 'Cast back to char.', '2': '`++` keeps the char type.', '3': 'Prints 98.', '4': 'Compile-time constant fits in char.', '5': 'Compound assignment casts.' },
      verify: null
    },
    {
      id: 'ch02-q26', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['math-api'],
      question: 'What is the output?',
      code: `System.out.println(Math.round(2.5) + " " + Math.round(-2.5) + " " + Math.floor(-2.5) + " " + Math.ceil(-2.5) + " " + (int) 2.99);`,
      options: ['3 -2 -3.0 -2.0 2', '3 -3 -3.0 -2.0 2', '2 -2 -3.0 -2.0 2', '3 -2 -3 -2 2', '3 -2 -2.0 -3.0 3'],
      answer: [0],
      explanation: '`Math.round` adds 0.5 and floors: 2.5 → 3, −2.5 → −2. `floor` goes toward −∞, `ceil` toward +∞, both returning doubles. A cast truncates toward zero.',
      optionNotes: { '0': 'Correct.', '1': '`round(-2.5)` is −2 (floor of −2.0).', '2': '`round(2.5)` rounds half up to 3.', '3': '`floor`/`ceil` return double.', '4': 'floor/ceil reversed; cast truncates.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
System.out.println(Math.round(2.5) + " " + Math.round(-2.5) + " " + Math.floor(-2.5) + " " + Math.ceil(-2.5) + " " + (int) 2.99);
} }` }, expect: { output: '3 -2 -3.0 -2.0 2' } }
    }
  ],

  checklist: [
    'I can recite operator precedence and know that operands are evaluated left to right.',
    'I can trace pre/post increment inside a larger expression, including x = x++.',
    'I know arithmetic on byte/short/char yields int and that unary minus promotes too.',
    'I know compound assignment operators include an implicit cast and need an existing variable.',
    'I can compute integer division, modulus sign, and floating-point division by zero.',
    'I can compute narrowing-cast wrap-around values and know casts bind to the next operand only.',
    'I know int overflow wraps silently and that Integer.MAX_VALUE + 1 is computed as int before widening.',
    'I know when == compiles (numeric promotion, unboxing, assignable references) and when it does not.',
    'I know & | ^ always evaluate both sides and && || short-circuit, and can track side effects accordingly.',
    'I know ternary type promotion, that only one branch runs, and that a ternary is not a statement.',
    'I can evaluate simple shift expressions and know the distance is masked mod 32/64.',
    'I know Math.round/floor/ceil semantics and return types.'
  ]
});
