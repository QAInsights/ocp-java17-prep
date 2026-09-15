OCP.registerChapter({
  id: 4,
  slug: 'core-apis',
  title: 'Core APIs',
  objectiveIds: ['1a', '1b', '1c', '5'],
  intro: `Objectives **1a** (Math API), **1b** (String, StringBuilder, text blocks), **1c** (Date-Time API) and the *arrays* half of **5**. This chapter is API memorisation plus a handful of behavioural rules: Strings are immutable and pooled, StringBuilder mutates and returns \`this\`, indexes are zero-based with exclusive end bounds, \`Arrays.binarySearch\` has a documented "not found" formula, and the \`java.time\` types are immutable with a clear split between \`Period\` (dates) and \`Duration\` (time). Expect several questions on method return values and off-by-one substring/indexing.`,

  notes: [
    {
      id: 'strings',
      title: 'String: immutability, pool and methods',
      md: `## Immutability and the string pool

* \`String\` is **immutable** and **final**. Every "modifying" method returns a *new* String; the original is unchanged. Forgetting to use the return value is the classic trap: \`s.toUpperCase();\` alone does nothing observable.
* **Compile-time constant** strings (literals, \`final\` String constants, and concatenations of them) live in the **string pool**; identical constants are the *same object*.
* Strings built at runtime (\`new String("a")\`, \`s1 + s2\` with non-final variables, \`"a".concat("b")\`, method results) are **not** pooled unless you call \`intern()\`.

\`\`\`java
String a = "hello";
String b = "hel" + "lo";          // constant expression → pooled
String c = new String("hello");   // new object
String d = "hel";
String e = d + "lo";              // runtime → new object
final String f = "hel";
String g = f + "lo";              // f is a constant variable → pooled
a == b   // true
a == c   // false
a == e   // false
a == g   // true
a == e.intern()   // true
a.equals(c)       // true
\`\`\`

## Concatenation rules

* \`+\` is left-associative; once one operand is a String, the rest concatenates.
* \`null\` concatenates as \`"null"\`; \`char + int\` is arithmetic; \`s += x\` works (creates a new String).
* Concatenation with \`+\` may be done at compile time only for constants.

## Key methods (all indexes zero-based; ranges are start-inclusive, end-exclusive)

| Method | Notes |
|---|---|
| \`length()\` | Method, not field (arrays use \`.length\`). |
| \`charAt(i)\` | \`StringIndexOutOfBoundsException\` if \`i >= length\`. |
| \`indexOf(ch|str)\`, \`indexOf(x, fromIndex)\` | \`-1\` if absent. Accepts \`char\` or \`String\`. |
| \`lastIndexOf(...)\` | Searches backwards. |
| \`substring(begin)\`, \`substring(begin, end)\` | \`end\` exclusive; \`begin == end\` → \`""\`; \`begin > end\` or out of range → exception. \`s.substring(s.length())\` → \`""\`. |
| \`toUpperCase()\`, \`toLowerCase()\` | Return new String. |
| \`equals()\`, \`equalsIgnoreCase()\` | Content. |
| \`startsWith\`, \`endsWith\`, \`contains\` | \`contains\` takes a \`CharSequence\`, not a char. |
| \`replace(char, char)\`, \`replace(CharSequence, CharSequence)\` | Replaces **all** occurrences (despite the name). \`replaceAll\` uses a **regex**. |
| \`trim()\` | Removes chars \`<= ' '\` (ASCII whitespace). |
| \`strip()\`, \`stripLeading()\`, \`stripTrailing()\` | Unicode-aware whitespace (Java 11). |
| \`isEmpty()\`, \`isBlank()\` | \`isBlank\` true for whitespace-only; \`" ".isEmpty()\` is false. |
| \`repeat(n)\` | \`n = 0\` → \`""\`, negative → \`IllegalArgumentException\`. |
| \`indent(n)\` | Adds/removes \`n\` spaces per line **and normalises line endings, adding a trailing \`\\n\`**. |
| \`stripIndent()\` | Removes incidental indentation like a text block does. |
| \`translateEscapes()\` | Turns \`"\\\\t"\` into a real tab. |
| \`chars()\` | \`IntStream\` of code units. |
| \`lines()\` | \`Stream<String>\`. |
| \`split(regex)\` | Regex! \`"a.b".split(".")\` → empty array; use \`"\\\\."\`. |
| \`join(delim, elems...)\` | Static. |
| \`valueOf(x)\` | Static; \`String.valueOf((Object) null)\` → \`"null"\`. |
| \`format(fmt, args)\`, \`formatted(args)\` | \`%s %d %f %n %.2f %10s %-10s %,d %b %c %e\`. \`%d\` with a \`double\` → \`IllegalFormatConversionException\`. |
| \`compareTo\` | Lexicographic by code unit; returns difference of first differing chars or length difference. Uppercase < lowercase. |
| \`matches(regex)\` | Whole-string match. |
| \`toCharArray()\`, \`getBytes()\` | |

**Method chaining** works on the returned strings: \`"AniMaL   ".trim().toLowerCase().replace('a', 'A')\` → \`"AnimAl"\`.

### \`indent\` detail
\`"a\\nb".indent(2)\` → \`"  a\\n  b\\n"\` – note the **added trailing newline**. Negative values remove up to that many leading spaces. \`indent(0)\` still normalises line endings and appends \`\\n\` if missing.

### \`compareTo\` values
\`"apple".compareTo("banana")\` → \`'a' - 'b'\` = \`-1\`. \`"app".compareTo("apple")\` → \`3 - 5\` = \`-2\`. \`"B".compareTo("a")\` → \`66 - 97\` = \`-31\`.
`
    },
    {
      id: 'textblocks',
      title: 'Text blocks',
      md: `\`\`\`java
String json = """
    {
      "name": "Java",
      "version": 17
    }
    """;
\`\`\`

Rules:

1. Opening delimiter \`"""\` must be followed by a **line terminator** (nothing else but optional whitespace). \`"""abc"""\` **does not compile**.
2. Content starts on the next line. **Incidental indentation** is the common leading whitespace of all content lines *and the closing delimiter line*. It is removed.
3. **Trailing** whitespace on each line is stripped.
4. Closing \`"""\` on its own line → the string **ends with \`\\n\`**. Closing on the same line as content → no trailing newline.
5. Escape sequences work: \`\\n\`, \`\\t\`, \`\\"\`. Two new ones: \`\\<line-terminator>\` **joins** the next line (suppresses the newline); \`\\s\` is a single space (preserved even when trailing).
6. Quotes inside need no escaping, except three in a row: \`\\"""\`.
7. \`"""\` blocks are ordinary \`String\` objects – pooled if constant, usable with \`+\`, \`formatted()\`, etc.

\`\`\`java
String s = """
    a\\
    b \\s
    c""";
// line 1 joins line 2: "a" + "b " + " "  (the space before \\s is not trailing, and \\s adds one more)
// then a newline, then "c", and no final newline
// Result: "ab  \\nc"  (length 6)
\`\`\`

Length counting is the exam's favourite: count characters per line after stripping indentation, +1 for each newline, and remember the closing-delimiter rule.
`
    },
    {
      id: 'stringbuilder',
      title: 'StringBuilder',
      md: `\`StringBuilder\` is **mutable**; most methods change the object *and* return \`this\`, so chaining and ignoring return values both work.

\`\`\`java
StringBuilder sb = new StringBuilder("abc");
sb.append(1).append('d').append(2.5);   // "abc1d2.5"
sb.insert(0, "X");                       // "Xabc1d2.5"
sb.delete(1, 3);                         // removes indexes 1,2 → "Xc1d2.5"
sb.deleteCharAt(0);                      // "c1d2.5"
sb.reverse();                            // "5.2d1c"
sb.setLength(2);                         // "5."
sb.replace(0, 1, "ZZ");                  // "ZZ."  (start inclusive, end exclusive; lengths may differ)
sb.setCharAt(0, 'q');                    // "qZ."  (returns void)
\`\`\`

* Constructors: \`new StringBuilder()\` (capacity 16), \`new StringBuilder(int capacity)\`, \`new StringBuilder(String)\`, \`new StringBuilder(CharSequence)\`. \`new StringBuilder('a')\`? Compiles – the char widens to **int** and sets **capacity 97**; the builder is empty!
* \`length()\` is content size; \`capacity()\` is buffer size (rarely tested).
* \`delete(start, end)\` tolerates \`end > length\` (clamps). \`deleteCharAt\` and \`charAt\` throw \`StringIndexOutOfBoundsException\` on bad indexes. \`insert\` at \`length()\` appends; beyond that throws.
* \`substring\`, \`indexOf\`, \`charAt\`, \`length\` behave like String and **do not modify** the builder. \`substring\` returns a **String**.
* \`equals()\` is **not overridden** – compares identity. Compare content with \`sb1.compareTo(sb2)\` (Java 11), \`sb1.toString().equals(sb2.toString())\`, or \`String.contentEquals(sb)\`.
* \`sb.toString()\` returns a new String each call. \`sb.append(null)\`? Ambiguous overload if the argument is literally \`null\`; with a typed null reference (\`String s = null; sb.append(s)\`) it appends \`"null"\`.
* Passing a \`StringBuilder\` to a method: the reference is copied, so the method **can** mutate the caller's builder via \`append\`, but reassigning the parameter does nothing to the caller.
* \`StringBuffer\` is the synchronized twin (same API) – legacy.
`
    },
    {
      id: 'math',
      title: 'Math API',
      md: `| Method | Signature notes | Example |
|---|---|---|
| \`min\`/\`max\` | overloads for int, long, float, double | \`Math.max(3, 7L)\` → \`7L\` (long) |
| \`abs\` | \`Math.abs(Integer.MIN_VALUE)\` stays **negative** (overflow) | |
| \`round\` | \`round(double)\` → **long**; \`round(float)\` → **int**. Rounds half **up**: 2.5 → 3, −2.5 → **−2** | \`int i = Math.round(2.5)\` **fails** (long) |
| \`floor\` | → double, toward −∞ | \`floor(-2.1)\` → \`-3.0\` |
| \`ceil\` | → double, toward +∞ | \`ceil(-2.9)\` → \`-2.0\` |
| \`rint\` | → double, round half to even | rarely tested |
| \`pow(a, b)\` | → double | \`Math.pow(2, 3)\` → \`8.0\` |
| \`sqrt\` | → double; negative → \`NaN\` | |
| \`random()\` | \`0.0 <= x < 1.0\` double | \`(int)(Math.random() * 10)\` → 0..9 |
| \`floorDiv\`, \`floorMod\` | floor semantics: \`floorMod(-7, 3)\` → \`2\` | vs \`-7 % 3\` → \`-1\` |
| \`addExact\`, \`subtractExact\`, \`multiplyExact\`, \`incrementExact\`, \`negateExact\`, \`toIntExact\` | throw \`ArithmeticException\` on overflow | |
| \`hypot\`, \`cbrt\`, \`signum\`, \`log\`, \`log10\`, \`exp\` | → double | |
| Constants | \`Math.PI\`, \`Math.E\` | |

Return-type traps: assigning \`Math.round(2.5)\` to an \`int\`, \`Math.floor\`/\`ceil\`/\`pow\`/\`sqrt\` to an \`int\`, or \`Math.max(int, long)\` to an \`int\` fails to compile. \`Math.min(1, 2.0)\` is a double.

Wrapper helpers often tested alongside: \`Integer.parseInt("12")\` (→ int, throws \`NumberFormatException\` on \`"12.0"\` or \`" 12"\`), \`Integer.valueOf("12")\` (→ Integer), \`Double.parseDouble("1e2")\`, \`Integer.toString(5)\`, \`Integer.toBinaryString(5)\` → \`"101"\`, \`Integer.MAX_VALUE\`, \`Character.isDigit\`/\`isLetter\`/\`toUpperCase\`, \`Boolean.parseBoolean("TRUE")\` → \`true\` (case-insensitive; anything else false).
`
    },
    {
      id: 'arrays',
      title: 'Arrays',
      md: `## Declaration and creation

\`\`\`java
int[] a = new int[3];          // {0,0,0}
int[] b = {1, 2, 3};           // initializer only allowed in a declaration
int[] c = new int[] {1, 2, 3};
int c2[] = new int[3];         // legal, discouraged
int[] d, e;                    // both arrays
int f[], g;                    // f is an array, g is an int!
int[] h = new int[3] {1,2,3};  // DOES NOT COMPILE – size and initializer together
b = {4, 5};                    // DOES NOT COMPILE – bare initializer only at declaration
b = new int[] {4, 5};          // OK
int[] z = new int[0];          // legal, length 0
int[] neg = new int[-1];       // compiles, NegativeArraySizeException at runtime
\`\`\`

* Arrays are **objects** (\`Object o = new int[2];\` is fine). \`length\` is a **final field** (no parentheses). Indexes \`0..length-1\`; \`ArrayIndexOutOfBoundsException\` otherwise – a runtime exception even for literal indexes like \`a[5]\` on a 3-element array.
* Default element values: numeric 0, \`false\`, \`'\\u0000'\`, \`null\` for references.
* \`int[]\` and \`Integer[]\` are unrelated; \`int[]\` cannot be assigned to \`Object[]\` (but \`Integer[]\` can, and \`String[]\` → \`Object[]\` is allowed – **array covariance** – which can cause an \`ArrayStoreException\` when storing an \`Integer\` into an \`Object[]\` that is really a \`String[]\`).
* Printing an array gives something like \`[I@1b6d3586\`; use \`Arrays.toString(a)\` (1-D) or \`Arrays.deepToString(a)\` (multi-dimensional).
* \`==\` on arrays is identity; \`a.equals(b)\` is identity too; use \`Arrays.equals\` / \`Arrays.deepEquals\`.

## Multi-dimensional

\`\`\`java
int[][] m = new int[3][];          // 3 null rows – legal
m[0] = new int[2];
int[][] jag = {{1}, {2, 3}, {}};   // ragged
int[][] bad = new int[][3];        // DOES NOT COMPILE – first dimension required
int[] r[] = new int[2][2];         // legal (array of arrays)
jag[1].length   // 2
\`\`\`

Iterating: nested for or for-each (\`for (int[] row : jag) for (int v : row)\`).

## \`java.util.Arrays\`

| Method | Notes |
|---|---|
| \`sort(a)\` | In place. Natural order; Strings: **uppercase before lowercase, digits before letters** (\`"10" < "9"\` lexicographically). \`sort(a, comparator)\` only for **object** arrays. |
| \`binarySearch(a, key)\` | Array **must be sorted** first (else undefined). Found → index. Not found → \`-(insertionPoint) - 1\`. |
| \`equals(a, b)\` | Same length & elements in order. |
| \`compare(a, b)\` | Lexicographic: negative/zero/positive; shorter prefix is smaller. \`null\` array is smaller than any array. |
| \`mismatch(a, b)\` | Index of first difference, or \`-1\` if identical. |
| \`fill(a, v)\` | |
| \`copyOf(a, len)\`, \`copyOfRange(a, from, to)\` | Pads with defaults if longer. |
| \`asList(a)\` | Fixed-size list **backed by the array** (set works, add/remove throw \`UnsupportedOperationException\`). With an \`int[]\` gives \`List<int[]>\` of size 1! |
| \`stream(a)\` | \`IntStream\` for \`int[]\`, \`Stream<T>\` for object arrays. |
| \`toString\`, \`deepToString\` | |

**binarySearch example**: \`int[] a = {2, 4, 6, 8}; Arrays.binarySearch(a, 6)\` → 2; \`…(a, 1)\` → \`-1\` (insert at 0 → −0−1); \`…(a, 5)\` → \`-3\`; \`…(a, 9)\` → \`-5\`.

**System.arraycopy(src, srcPos, dest, destPos, length)** – also fair game.

## Varargs and main

\`String... args\` is an array inside the method; \`main(String[] a)\` and \`main(String... a)\` are both valid entry points. See Chapter 5 for varargs rules.
`
    },
    {
      id: 'datetime',
      title: 'Date-Time API (java.time)',
      md: `All \`java.time\` classes are **immutable** and **thread-safe**; every "plus/minus/with" call returns a **new** object – ignoring the return value is the No. 1 trap. Constructors are private: use **static factories** (\`of\`, \`now\`, \`parse\`). Invalid values throw \`DateTimeException\` at **runtime** (\`LocalDate.of(2024, 2, 30)\`).

## Core types

| Type | Contains | Example |
|---|---|---|
| \`LocalDate\` | date only | \`LocalDate.of(2024, Month.MARCH, 15)\`, \`LocalDate.of(2024, 3, 15)\` |
| \`LocalTime\` | time only | \`LocalTime.of(9, 30)\`, \`LocalTime.of(9, 30, 15, 500)\` (h, m, s, nanos) |
| \`LocalDateTime\` | date + time, no zone | \`LocalDateTime.of(date, time)\`, \`LocalDateTime.of(2024, 3, 15, 9, 30)\` |
| \`ZonedDateTime\` | date + time + zone | \`ZonedDateTime.of(ldt, ZoneId.of("Europe/Paris"))\` |
| \`Instant\` | point on the UTC timeline | \`Instant.now()\`, \`zdt.toInstant()\`; **no** \`LocalDateTime.toInstant()\` without a zone |
| \`Period\` | date-based amount (Y/M/D) | \`Period.ofDays(3)\`, \`Period.of(1, 2, 3)\`, \`Period.ofWeeks(2)\` → \`P14D\` |
| \`Duration\` | time-based amount (s + ns) | \`Duration.ofHours(2)\`, \`Duration.ofMinutes(90)\` → \`PT1H30M\`, \`Duration.of(3, ChronoUnit.DAYS)\` |
| \`ZoneId\`, \`ZoneOffset\` | | \`ZoneId.systemDefault()\` |
| \`DayOfWeek\`, \`Month\`, \`Year\`, \`YearMonth\`, \`MonthDay\` | enums / partials | \`Month.JANUARY\` is 1 (**months are 1-based**), \`DayOfWeek.MONDAY\` = 1 |

Months in \`of(...)\` are **1–12** (not 0-based like the old \`Calendar\`). \`Month.of(13)\` → exception.

## Manipulation

\`\`\`java
LocalDate d = LocalDate.of(2024, 1, 31);
d.plusMonths(1);          // 2024-02-29 (clamps to end of month)
d.plusDays(1);            // 2024-02-01
d.minusYears(1);          // 2023-01-31
d.withDayOfMonth(1);      // 2024-01-01
d.getDayOfWeek();         // WEDNESDAY
d.isLeapYear();           // true
d.lengthOfMonth();        // 31
d.isBefore(other), isAfter, isEqual, compareTo
d.getMonthValue()         // 1 (int), getMonth() → Month.JANUARY
d.plus(Period.ofMonths(1))
d.plus(1, ChronoUnit.WEEKS)
d.atTime(10, 0)           // LocalDateTime
d.atStartOfDay()          // LocalDateTime 00:00
\`\`\`

* \`LocalDate.plus(Duration)\` → **\`UnsupportedTemporalTypeException\`** at runtime (dates don't support seconds). \`LocalTime.plus(Period)\` likewise fails at runtime. \`LocalDateTime\` accepts both.
* \`LocalDate.plusHours\` **does not exist** → compile error. \`LocalTime.plusDays\` does not exist either.
* Period chaining trap: \`Period.ofYears(1).ofMonths(2)\` – \`of*\` are **static**, so this is just \`Period.ofMonths(2)\`; use \`Period.of(1, 2, 0)\`.
* \`Period\` printing: \`P1Y2M3D\`; zero → \`P0D\`; \`Period.ofWeeks(1)\` → \`P7D\`. \`Duration\` printing: \`PT2H\`, \`PT1H30M\`, \`PT0.5S\`, \`PT24H\` for one day (Duration has no date units). Neither normalises months into years automatically (\`Period.ofMonths(14)\` → \`P14M\`; \`normalized()\` gives \`P1Y2M\`).
* \`Period.between(d1, d2)\`, \`Duration.between(t1, t2)\`, \`ChronoUnit.DAYS.between(d1, d2)\` (→ long, truncates), \`d1.until(d2, ChronoUnit.MONTHS)\`.
* \`Duration.between(LocalDate, LocalDate)\` → runtime exception (no time component).
* Time arithmetic wraps: \`LocalTime.of(23, 0).plusHours(2)\` → \`01:00\` (date is not tracked).
* \`truncatedTo(ChronoUnit.HOURS)\` for times.

## Zones and daylight saving

\`ZonedDateTime\` prints like \`2024-03-10T01:30-05:00[America/New_York]\`. Adding an hour across a DST gap: the local clock jumps (\`01:30\` + 1h on the US spring-forward day → \`03:30-04:00\`), while the offset changes. Wall-clock arithmetic on \`plusDays\` keeps the local time; \`plusHours\` follows the actual timeline.

* \`ZoneId.of("US/Eastern")\`, \`ZoneOffset.ofHours(-5)\`, \`ZoneOffset.UTC\`.
* \`zdt.withZoneSameInstant(otherZone)\` converts the instant; \`withZoneSameLocal\` keeps the wall clock.
* \`Instant\` ↔ zones: \`Instant.now().atZone(zone)\`; \`LocalDateTime.atZone(zone)\`; \`ldt.toInstant(ZoneOffset)\` (needs an offset argument).
* \`Instant.ofEpochSecond\`, \`Instant.plus(Duration)\` fine; \`Instant.plus(Period.ofDays(1))\` works (days are exactly 86 400 s on the timeline) but \`Instant.plus(Period.ofMonths(1))\` → runtime exception. Instant prints as \`2024-03-15T09:30:00Z\`.

## Formatting and parsing

\`\`\`java
DateTimeFormatter f = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a");
LocalDateTime.of(2024, 3, 5, 14, 7).format(f);   // "March 05, 2024 at 02:07 PM"
LocalDate.parse("2024-03-05");                     // ISO default
LocalDate.parse("03/05/2024", DateTimeFormatter.ofPattern("MM/dd/yyyy"));
f.format(temporal)  // same as temporal.format(f)
DateTimeFormatter.ISO_LOCAL_DATE, ISO_LOCAL_TIME, ISO_LOCAL_DATE_TIME
DateTimeFormatter.ofLocalizedDate(FormatStyle.SHORT|MEDIUM|LONG|FULL)
\`\`\`

Pattern letters: \`y\` year, \`M\` month (\`M\` 3, \`MM\` 03, \`MMM\` Mar, \`MMMM\` March), \`d\` day-of-month, \`D\` day-of-year, \`E\` day-of-week (\`EEEE\` Tuesday), \`h\` 1–12 hour, \`H\` 0–23, \`m\` minute, \`s\` second, \`S\` fraction, \`a\` AM/PM, \`z\` zone name, \`Z\`/\`x\` offset. Letters not in the pattern language must be **quoted** with single quotes (\`'at'\`, \`'T'\`); a literal apostrophe is \`''\`.

Formatting a **LocalDate** with a pattern containing time letters (or a **LocalTime** with date letters) → \`UnsupportedTemporalTypeException\` at **runtime**, not compile time. \`ofLocalizedDateTime(FormatStyle.LONG/FULL)\` needs a zone – throws on \`LocalDateTime\`.

\`LocalDate.toString()\` → \`2024-03-05\`; \`LocalTime.toString()\` → \`09:30\` (seconds and nanos omitted when zero – \`09:30:15\`, \`09:30:15.500\`); \`LocalDateTime.toString()\` → \`2024-03-05T09:30\`.

Legacy \`java.util.Date\`, \`Calendar\`, \`SimpleDateFormat\` are **not** on the exam.
`
    }
  ],

  gotchas: [
    { title: 'Ignored return value on String / java.time', md: '`s.toUpperCase();` and `date.plusDays(1);` change nothing. Both types are immutable; you must assign the result. StringBuilder is the exception – it mutates in place.' },
    { title: 'substring(begin, end) – end is exclusive', md: '`"hello".substring(1, 3)` → `"el"`. `substring(3, 3)` → `""`. `substring(3, 2)` → `StringIndexOutOfBoundsException`. `substring(5)` on a 5-char string → `""`, `substring(6)` → exception.' },
    { title: 'indexOf returns -1, charAt throws', md: 'Searching for something missing returns `-1`; indexing past the end throws. Off-by-one questions hinge on this asymmetry.' },
    { title: 'replace vs replaceAll', md: '`replace` replaces every occurrence of a literal char/CharSequence. `replaceAll` and `split` take a **regex** – `"a.b.c".split(".")` yields an empty array; `"1+1".replaceAll("+", "-")` throws `PatternSyntaxException`.' },
    { title: 'equals vs == on Strings', md: 'Literals and compile-time constants share pool objects (`==` true). `new String`, runtime concatenation and most method results create new objects (`==` false, `equals` true). `intern()` returns the pooled instance.' },
    { title: 'Concatenating a final String variable is a constant', md: '`final String a = "x"; String b = a + "y";` → `b == "xy"` is **true**. Remove `final` and it becomes false.' },
    { title: 'StringBuilder.equals is identity', md: '`new StringBuilder("a").equals(new StringBuilder("a"))` → false. Compare with `toString().equals` or `compareTo(...) == 0`.' },
    { title: 'new StringBuilder(\'a\') is empty', md: 'The `char` widens to `int`, so this calls the capacity constructor. `sb.length()` is 0.' },
    { title: 'StringBuilder delete/replace range', md: '`delete(1, 3)` removes indexes 1 and 2. `delete(1, 100)` clamps. `deleteCharAt(100)` throws. `replace(0, 2, "ZZZZ")` can grow the builder.' },
    { title: 'StringBuilder insert index', md: '`insert(sb.length(), x)` appends; `insert(sb.length() + 1, x)` throws `StringIndexOutOfBoundsException`.' },
    { title: 'Text block opening delimiter', md: 'Content cannot start on the same line as the opening `"""`: `String s = """hello""";` does not compile.' },
    { title: 'Text block trailing newline', md: 'Closing `"""` on its own line adds a final `\\n`; on the content line it does not. Length questions depend on this.' },
    { title: 'Text block indentation is set by the closing delimiter too', md: 'If the closing `"""` is less indented than the content, that lower indentation becomes the margin – the content keeps extra leading spaces.' },
    { title: '\\s and line-joining \\ in text blocks', md: '`\\s` is a space that survives trailing-whitespace stripping. A backslash at the end of a line joins it with the next (no newline). `\\s` is also legal in ordinary string literals; the line-continuation escape is text-block only.' },
    { title: 'String.indent adds a trailing newline', md: '`"a".indent(1)` → `" a\\n"` (length 3, not 2). `indent(-n)` removes up to n leading spaces per line.' },
    { title: 'isEmpty vs isBlank', md: '`"  ".isEmpty()` → false; `"  ".isBlank()` → true. `strip` handles Unicode whitespace, `trim` only chars ≤ U+0020.' },
    { title: 'Math.round returns long (or int for float)', md: '`int x = Math.round(3.7);` fails – `round(double)` is a `long`. `int y = Math.round(3.7f);` compiles. `round(-2.5)` → `-2`.' },
    { title: 'Math.floor / ceil / pow / sqrt return double', md: '`int f = Math.floor(2.9);` fails to compile. `Math.pow(2, 3)` prints `8.0`.' },
    { title: 'Math.max with mixed types promotes', md: '`Math.max(1, 2L)` is a `long`; `Math.min(1, 1.0)` is a `double`. Assigning to `int` needs a cast.' },
    { title: 'Math.abs(Integer.MIN_VALUE)', md: 'Returns `Integer.MIN_VALUE` (negative) because the positive value does not fit. `absExact` throws instead.' },
    { title: 'Math.random upper bound', md: '`(int)(Math.random() * 6) + 1` → 1..6. `Math.random()` never returns 1.0.' },
    { title: 'array.length vs string.length() vs list.size()', md: 'Field for arrays, method for String and StringBuilder, `size()` for collections. Mixing them is a compile error.' },
    { title: 'Array size + initializer', md: '`new int[2] {1, 2}` does not compile. `new int[] {1, 2}` or `{1, 2}` (declaration only) are fine. `int[][] m = new int[][3];` fails – the first dimension is mandatory.' },
    { title: 'int x[], y; declares one array', md: 'Brackets after the *name* apply only to that name: `y` is an `int`. `int[] x, y;` makes both arrays.' },
    { title: 'binarySearch on unsorted data is undefined', md: 'Only sorted arrays give reliable results. Not-found result: `-(insertionPoint) - 1`, e.g. inserting at index 0 → `-1`.' },
    { title: 'Sorting Strings: numbers, then uppercase, then lowercase', md: '`Arrays.sort(new String[]{"b", "B", "10", "9"})` → `[10, 9, B, b]`. Comparison is by character code, not numeric value.' },
    { title: 'Arrays.asList with primitives', md: '`Arrays.asList(new int[]{1,2})` is a `List<int[]>` of size 1. Use `Integer[]` or `Arrays.stream(arr).boxed()`. `asList` returns a fixed-size list backed by the array – `set` works, `add` throws.' },
    { title: 'Arrays.compare and mismatch', md: '`compare({1,2}, {1,2,3})` → negative (prefix is smaller). `mismatch({1,2}, {1,2})` → -1; `mismatch({1,2}, {1,3})` → 1.' },
    { title: 'Array covariance and ArrayStoreException', md: '`Object[] o = new String[1]; o[0] = 1;` compiles but throws `ArrayStoreException` at runtime.' },
    { title: 'Month and day are 1-based', md: '`LocalDate.of(2024, 1, 1)` is January 1st. `LocalDate.of(2024, 0, 1)` → `DateTimeException` at runtime (compiles!).' },
    { title: 'Period vs Duration units', md: '`Period` = years/months/days; `Duration` = hours/minutes/seconds/nanos. `LocalDate.plus(Duration)` and `LocalTime.plus(Period)` compile but throw `UnsupportedTemporalTypeException`.' },
    { title: 'Period.ofX chaining', md: '`Period.ofYears(1).ofDays(2)` is just `P2D` – static methods on an instance reference. Use `Period.of(1, 0, 2)`.' },
    { title: 'Period / Duration toString', md: '`Period.of(0, 14, 0)` → `P14M` (not normalised). `Period.ofWeeks(2)` → `P14D`. `Duration.ofDays(1)` → `PT24H`. `Duration.ofMinutes(90)` → `PT1H30M`. Zero period → `P0D`; zero duration → `PT0S`.' },
    { title: 'plusMonths clamps to end of month', md: '`LocalDate.of(2024, 1, 31).plusMonths(1)` → `2024-02-29`; then `.plusMonths(1)` → `2024-03-29` (the day is not restored).' },
    { title: 'Non-existent methods', md: '`LocalDate.plusHours`, `LocalTime.plusDays`, `LocalDate.of(...).getHour()` do not exist → compile error. `LocalDateTime` has everything.' },
    { title: 'No public constructors in java.time', md: '`new LocalDate()` does not compile. Use `LocalDate.now()` / `of()` / `parse()`.' },
    { title: 'Formatter mismatch is a runtime error', md: 'Formatting a `LocalDate` with `"hh:mm"` compiles and throws `UnsupportedTemporalTypeException`. Unquoted letters that are not pattern symbols (e.g. `at`) throw `IllegalArgumentException` when the formatter is created.' },
    { title: 'LocalTime.toString drops zero seconds', md: '`LocalTime.of(9, 30)` prints `09:30`; `LocalTime.of(9, 30, 0, 1)` prints `09:30:00.000000001`.' },
    { title: 'DST arithmetic', md: 'Across a spring-forward gap, `plusHours(1)` moves the wall clock two hours (01:30 → 03:30) and the offset changes; `plusDays(1)` keeps the wall-clock time. Non-existent local times are shifted forward.' }
  ],

  traps: [
    {
      code: `String s = "  Java 17  ";
s.trim();
s.toUpperCase();
System.out.println("[" + s + "]" + s.strip().length());`,
      prompt: 'What prints?',
      answer: 'Prints **`[  Java 17  ]7`**. Strings are immutable and the return values are discarded; `strip()` on the last line is used directly – `"Java 17"` has 7 characters.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
String s = "  Java 17  ";
s.trim();
s.toUpperCase();
System.out.println("[" + s + "]" + s.strip().length());
} }` }, expect: { output: '[  Java 17  ]7' } }
    },
    {
      code: `String a = "java";
String b = "ja" + "va";
String c = "ja";
String d = c + "va";
final String e = "ja";
String f = e + "va";
System.out.println((a == b) + " " + (a == d) + " " + (a == f) + " " + (a == d.intern()));`,
      prompt: 'What prints?',
      answer: 'Prints **`true false true true`**. `"ja" + "va"` and `e + "va"` (e is a constant variable) are compile-time constants and pooled; `c + "va"` is computed at runtime; `intern()` returns the pooled instance.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
String a = "java";
String b = "ja" + "va";
String c = "ja";
String d = c + "va";
final String e = "ja";
String f = e + "va";
System.out.println((a == b) + " " + (a == d) + " " + (a == f) + " " + (a == d.intern()));
} }` }, expect: { output: 'true false true true' } }
    },
    {
      code: `StringBuilder sb = new StringBuilder("abcdef");
sb.delete(1, 3).insert(1, "XY").reverse();
sb.setLength(4);
String t = sb.substring(1, 3);
System.out.println(sb + " " + t + " " + sb.length());`,
      prompt: 'What prints?',
      answer: 'Prints **`fedY ed 4`**. `delete(1,3)` → `adef`; `insert(1,"XY")` → `aXYdef`; `reverse` → `fedYXa`; `setLength(4)` → `fedY`; `substring(1,3)` → `ed` (does not modify the builder).',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
StringBuilder sb = new StringBuilder("abcdef");
sb.delete(1, 3).insert(1, "XY").reverse();
sb.setLength(4);
String t = sb.substring(1, 3);
System.out.println(sb + " " + t + " " + sb.length());
} }` }, expect: { output: 'fedY ed 4' } }
    },
    {
      code: `String block = """
      <p>
        Hi\\s
      </p>\\
      """;
System.out.print(block.length() + "|" + block + "|");`,
      prompt: 'What prints?',
      answer: 'Prints **`14|<p>\\n  Hi \\n</p>|`**. The margin is 6 spaces. Line 1 `<p>` (3) + newline (1); line 2 `  Hi` plus the `\\s` space (5) + newline (1); line 3 `</p>` (4). The trailing `\\` joins the last line with the closing-delimiter line, so there is **no final newline**: 3+1+5+1+4 = 14.',
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
String block = """
      <p>
        Hi\\s
      </p>\\
      """;
System.out.print(block.length() + "|" + block + "|");
} }` }, expect: { output: '14|<p>\n  Hi \n</p>|' } }
    },
    {
      code: `int[] a = {5, 1, 4};
int[] b = {5, 1, 4};
Arrays.sort(a);
System.out.print(Arrays.binarySearch(a, 4) + " " + Arrays.binarySearch(a, 3) + " ");
System.out.print((a == b) + " " + a.equals(b) + " " + Arrays.equals(a, b));`,
      prompt: 'What prints?',
      answer: 'Prints **`1 -2 false false false`**. Sorted a = {1,4,5}: 4 is at index 1; 3 would be inserted at index 1 → −1−1 = −2. `==` and `equals` on arrays are identity. `Arrays.equals` is false because `b` was never sorted ({5,1,4} ≠ {1,4,5}).',
      verify: { files: { 'Main.java': `import java.util.*;
public class Main { public static void main(String[] x) {
int[] a = {5, 1, 4};
int[] b = {5, 1, 4};
Arrays.sort(a);
System.out.print(Arrays.binarySearch(a, 4) + " " + Arrays.binarySearch(a, 3) + " ");
System.out.print((a == b) + " " + a.equals(b) + " " + Arrays.equals(a, b));
} }` }, expect: { output: '1 -2 false false false' } }
    },
    {
      code: `String[] s = {"b", "B", "10", "9", "a"};
Arrays.sort(s);
System.out.println(Arrays.toString(s));`,
      prompt: 'What prints?',
      answer: 'Prints **`[10, 9, B, a, b]`**. Natural String order compares character codes: digits (`\'1\'` < `\'9\'`) before uppercase before lowercase.',
      verify: { files: { 'Main.java': `import java.util.*;
public class Main { public static void main(String[] x) {
String[] s = {"b", "B", "10", "9", "a"};
Arrays.sort(s);
System.out.println(Arrays.toString(s));
} }` }, expect: { output: '[10, 9, B, a, b]' } }
    },
    {
      code: `LocalDate d = LocalDate.of(2024, 1, 31);
d.plusDays(1);
LocalDate e = d.plusMonths(1).plusMonths(1);
Period p = Period.ofYears(1).ofMonths(2);
System.out.println(d + " " + e + " " + p);`,
      prompt: 'What prints?',
      answer: 'Prints **`2024-01-31 2024-03-29 P2M`**. The first `plusDays` result is discarded. Jan 31 + 1 month clamps to Feb 29 (leap year), + 1 month → Mar 29. `ofMonths` is static, so the `ofYears(1)` is thrown away.',
      verify: { files: { 'Main.java': `import java.time.*;
public class Main { public static void main(String[] a) {
LocalDate d = LocalDate.of(2024, 1, 31);
d.plusDays(1);
LocalDate e = d.plusMonths(1).plusMonths(1);
Period p = Period.ofYears(1).ofMonths(2);
System.out.println(d + " " + e + " " + p);
} }` }, expect: { output: '2024-01-31 2024-03-29 P2M' } }
    },
    {
      code: `LocalDate d = LocalDate.of(2024, 3, 15);
System.out.println(d.plus(Duration.ofDays(1)));`,
      prompt: 'What happens?',
      answer: 'Compiles, then throws **`UnsupportedTemporalTypeException`** (`Unsupported unit: Seconds`) – a `Duration` is time-based and a `LocalDate` has no time fields. Use `Period.ofDays(1)` or `plusDays(1)`.',
      verify: { files: { 'Main.java': `import java.time.*;
public class Main { public static void main(String[] a) {
LocalDate d = LocalDate.of(2024, 3, 15);
System.out.println(d.plus(Duration.ofDays(1)));
} }` }, expect: 'runtime-exception' }
    },
    {
      code: `LocalTime t = LocalTime.of(23, 30);
LocalDateTime dt = LocalDateTime.of(2024, 12, 31, 23, 30);
System.out.println(t.plusHours(2) + " " + dt.plusHours(2) + " " + Duration.ofMinutes(150) + " " + Period.ofWeeks(2));`,
      prompt: 'What prints?',
      answer: 'Prints **`01:30 2025-01-01T01:30 PT2H30M P14D`**. `LocalTime` wraps around midnight with no date; `LocalDateTime` rolls the date and year. Duration prints hours/minutes; a Period of weeks is stored as days.',
      verify: { files: { 'Main.java': `import java.time.*;
public class Main { public static void main(String[] a) {
LocalTime t = LocalTime.of(23, 30);
LocalDateTime dt = LocalDateTime.of(2024, 12, 31, 23, 30);
System.out.println(t.plusHours(2) + " " + dt.plusHours(2) + " " + Duration.ofMinutes(150) + " " + Period.ofWeeks(2));
} }` }, expect: { output: '01:30 2025-01-01T01:30 PT2H30M P14D' } }
    }
  ],

  questions: [
    {
      id: 'ch04-q01', type: 'single', difficulty: 'easy', objectiveIds: ['1b'], tags: ['string', 'immutability'],
      question: 'What is the output?',
      code: `String s = "OCP";
s.concat(" 17");
s.toLowerCase();
String t = s.replace('O', '0');
System.out.println(s + " " + t);`,
      options: ['OCP 0CP', 'ocp 17 0cp 17', 'OCP 17 0CP 17', 'OCP OCP', 'The code does not compile.'],
      answer: [0],
      explanation: 'String methods return new objects; `s` never changes. Only `t` captures a result – `replace(char, char)` swaps the letter O for the digit zero.',
      optionNotes: { '0': 'Correct.', '1': 'Return values of concat/toLowerCase were discarded.', '2': 'concat result was discarded.', '3': 'replace does produce a new string assigned to t.', '4': 'Compiles.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
String s = "OCP";
s.concat(" 17");
s.toLowerCase();
String t = s.replace('O', '0');
System.out.println(s + " " + t);
} }` }, expect: { output: 'OCP 0CP' } }
    },
    {
      id: 'ch04-q02', type: 'single', difficulty: 'medium', objectiveIds: ['1b'], tags: ['substring', 'indexOf'],
      question: 'What is the output?',
      code: `String s = "programming";
System.out.print(s.substring(3, 7) + " ");
System.out.print(s.indexOf('m') + " ");
System.out.print(s.lastIndexOf("m") + " ");
System.out.print(s.indexOf("g", 4) + " ");
System.out.print(s.substring(11).isEmpty());`,
      options: ['gram 6 7 10 true', 'gramm 6 7 10 true', 'gram 6 7 3 true', 'gram 7 8 10 false', 'A StringIndexOutOfBoundsException is thrown.'],
      answer: [0],
      explanation: '`substring(3,7)` covers indexes 3–6 (`gram`). First `m` is index 6, last is 7. Searching for `g` from index 4 finds the final `g` at 10. `substring(length)` is legal and returns an empty string.',
      optionNotes: { '0': 'Correct.', '1': 'End index is exclusive.', '2': 'The search starts at index 4, skipping the g at index 3.', '3': 'Zero-based indexes.', '4': '`substring(11)` on an 11-char string is legal.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
String s = "programming";
System.out.print(s.substring(3, 7) + " ");
System.out.print(s.indexOf('m') + " ");
System.out.print(s.lastIndexOf("m") + " ");
System.out.print(s.indexOf("g", 4) + " ");
System.out.print(s.substring(11).isEmpty());
} }` }, expect: { output: 'gram 6 7 10 true' } }
    },
    {
      id: 'ch04-q03', type: 'multi', difficulty: 'medium', objectiveIds: ['1b'], tags: ['string-pool', 'equality'],
      question: 'Which expressions evaluate to `true`? (Choose all that apply.)',
      code: `String a = "cat";
String b = new String("cat");
String c = "ca" + "t";
String d = "ca";
String e = d + "t";
String f = b.intern();`,
      options: ['a == b', 'a == c', 'a == e', 'a == f', 'a.equals(e)', 'b == f'],
      answer: [1, 3, 4],
      explanation: '`c` is a compile-time constant and shares the pooled `"cat"`. `e` is built at runtime (new object). `intern()` returns the pooled object, so `f == a` but `f != b`. `equals` compares content.',
      optionNotes: { '0': '`new String` always creates a new object.', '1': 'Constant folding → pooled.', '2': 'Runtime concatenation with a non-final variable.', '3': 'intern returns the pool reference.', '4': 'Same content.', '5': '`b` is the unpooled copy.' },
      verify: null
    },
    {
      id: 'ch04-q04', type: 'single', difficulty: 'medium', objectiveIds: ['1b'], tags: ['string-methods'],
      question: 'What is the output?',
      code: `String s = " A-b-C ";
System.out.print(s.strip().toLowerCase().replace("-", "") + "|");
System.out.print(s.isBlank() + "|" + "".isEmpty() + "|");
System.out.print("ab".repeat(2).length() + "|");
System.out.print("x".indent(2).length());`,
      options: ['abc|false|true|4|4', 'abc|false|true|4|3', 'a-b-c|false|true|4|4', 'abc|true|true|4|4', 'The code does not compile.'],
      answer: [0],
      explanation: '`strip` then lowercases, and `replace` removes every hyphen. A string with letters is not blank; the empty string is empty. `"ab".repeat(2)` is 4 chars. `indent(2)` adds two spaces **and a trailing newline** → `"  x\\n"` has length 4.',
      optionNotes: { '0': 'Correct.', '1': 'indent appends a line terminator.', '2': 'replace removes all occurrences.', '3': 'isBlank requires only whitespace.', '4': 'Compiles.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
String s = " A-b-C ";
System.out.print(s.strip().toLowerCase().replace("-", "") + "|");
System.out.print(s.isBlank() + "|" + "".isEmpty() + "|");
System.out.print("ab".repeat(2).length() + "|");
System.out.print("x".indent(2).length());
} }` }, expect: { output: 'abc|false|true|4|4' } }
    },
    {
      id: 'ch04-q05', type: 'single', difficulty: 'hard', objectiveIds: ['1b'], tags: ['text-block'],
      question: 'What is the output?',
      code: `String tb = """
        Hello \\
        World!
          Bye""";
System.out.println(tb.length() + " " + tb.lines().count());`,
      options: ['19 2', '18 2', '19 3', '20 3', 'The code does not compile.'],
      answer: [1],
      explanation: 'The margin is 8 spaces (the least-indented content lines; the closing delimiter sits on the last content line). `\\<newline>` joins `Hello ` and `World!` into `Hello World!` (12 chars – the space before the backslash survives because it is followed by the escape, so it is not trailing whitespace). Then one newline and `  Bye` (5 chars – only 8 of its 10 leading spaces are incidental). 12 + 1 + 5 = 18, two lines.',
      optionNotes: { '0': 'Counts the newline that the backslash suppressed.', '1': 'Correct.', '2': 'The joined line counts as one.', '3': 'No trailing newline: the closing delimiter is on the last content line.', '4': 'Line continuation is legal in text blocks.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
String tb = """
        Hello \\
        World!
          Bye""";
System.out.println(tb.length() + " " + tb.lines().count());
} }` }, expect: { output: '18 2' } }
    },
    {
      id: 'ch04-q06', type: 'multi', difficulty: 'medium', objectiveIds: ['1b'], tags: ['text-block', 'compile'],
      question: 'Which text block declarations compile? (Choose all that apply.)',
      code: null,
      options: [
        'String a = """Hi""";',
        'String b = """\n    Hi""";',
        'String c = """\n    "Hi"\n    """;',
        'String d = """\n    Hi \\s\n    """;',
        'String e = """\n    """"Hi"\n    """;',
        'String f = """  \n    Hi\n    """;'
      ],
      answer: [1, 2, 3, 5],
      explanation: 'The opening `"""` must be followed by a line terminator (only whitespace may follow it). Content can start on the next line and the closing delimiter may share the last content line. Single or double quotes need no escaping, but four consecutive quotes start with `"""` which prematurely closes the block – the sequence `""""Hi"` is a compile error unless written as `\\""""`. `\\s` is a valid escape.',
      optionNotes: { '0': 'Content on the opening line – error.', '1': 'Legal.', '2': 'Quotes are fine.', '3': '`\\s` is a legal escape.', '4': 'Three quotes close the block; the rest is garbage.', '5': 'Trailing spaces after the opening delimiter are allowed.' },
      verify: null
    },
    {
      id: 'ch04-q07', type: 'single', difficulty: 'medium', objectiveIds: ['1b'], tags: ['stringbuilder'],
      question: 'What is the output?',
      code: `StringBuilder sb = new StringBuilder("Hello");
sb.append(", World").insert(5, "!").deleteCharAt(0);
sb.replace(0, 4, "J");
System.out.println(sb + " " + sb.length());`,
      options: ['J!, World 9', 'Jllo!, World 12', 'J, World 8', 'Jello!, World 13', 'The code does not compile.'],
      answer: [0],
      explanation: '`append` → `Hello, World`; `insert(5, "!")` → `Hello!, World`; `deleteCharAt(0)` → `ello!, World`; `replace(0, 4, "J")` replaces indexes 0–3 (`ello`) → `J!, World` (9 chars).',
      optionNotes: { '0': 'Correct.', '1': 'replace removes four characters.', '2': 'The `!` at index 4 survives the replace (end is exclusive).', '3': 'deleteCharAt(0) removed the H.', '4': 'append, insert, deleteCharAt and replace all return StringBuilder; compiles.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
StringBuilder sb = new StringBuilder("Hello");
sb.append(", World").insert(5, "!").deleteCharAt(0);
sb.replace(0, 4, "J");
System.out.println(sb + " " + sb.length());
} }` }, expect: { output: 'J!, World 9' } }
    },
    {
      id: 'ch04-q08', type: 'single', difficulty: 'medium', objectiveIds: ['1b'], tags: ['stringbuilder', 'equality'],
      question: 'What is the output?',
      code: `StringBuilder a = new StringBuilder("x");
StringBuilder b = new StringBuilder("x");
StringBuilder c = a;
c.append("y");
System.out.println(a.equals(b) + " " + (a == c) + " " + a + " " + a.compareTo(b));`,
      options: ['false true xy 1', 'true true xy 1', 'false true xy 0', 'false false x 0', 'The code does not compile.'],
      answer: [0],
      explanation: '`StringBuilder.equals` is not overridden (identity). `c` is the same object as `a`, so appending through `c` changes `a`. `compareTo` is lexicographic: `"xy"` vs `"x"` differ in length → 1.',
      optionNotes: { '0': 'Correct.', '1': 'equals is identity-based for StringBuilder.', '2': '`xy` is longer than `x`.', '3': 'c and a are the same object.', '4': '`compareTo` exists on StringBuilder since Java 11.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
StringBuilder a = new StringBuilder("x");
StringBuilder b = new StringBuilder("x");
StringBuilder c = a;
c.append("y");
System.out.println(a.equals(b) + " " + (a == c) + " " + a + " " + a.compareTo(b));
} }` }, expect: { output: 'false true xy 1' } }
    },
    {
      id: 'ch04-q09', type: 'single', difficulty: 'medium', objectiveIds: ['1b', '3b'], tags: ['stringbuilder', 'pass-by-value'],
      question: 'What is the output?',
      code: `public class Test {
  static void change(StringBuilder sb, String s) {
    sb.append("!");
    sb = new StringBuilder("new");
    s = s + "!";
  }
  public static void main(String[] args) {
    StringBuilder sb = new StringBuilder("hi");
    String s = "hi";
    change(sb, s);
    System.out.println(sb + " " + s);
  }
}`,
      options: ['hi! hi', 'new hi!', 'hi! hi!', 'hi hi', 'new hi'],
      answer: [0],
      explanation: 'Java passes references by value. `sb.append` mutates the shared object. Reassigning the parameter `sb` or building a new String for `s` affects only the local copies.',
      optionNotes: { '0': 'Correct.', '1': 'Reassignment of the parameter is not visible to the caller.', '2': 'Strings are immutable; the caller\'s s is unchanged.', '3': 'append mutates the shared builder.', '4': 'Parameter reassignment is local.' },
      verify: { files: { 'Test.java': `public class Test {
  static void change(StringBuilder sb, String s) {
    sb.append("!");
    sb = new StringBuilder("new");
    s = s + "!";
  }
  public static void main(String[] args) {
    StringBuilder sb = new StringBuilder("hi");
    String s = "hi";
    change(sb, s);
    System.out.println(sb + " " + s);
  }
}` }, expect: { output: 'hi! hi' } }
    },
    {
      id: 'ch04-q10', type: 'single', difficulty: 'medium', objectiveIds: ['1a'], tags: ['math'],
      question: 'Which line does NOT compile?',
      code: `int a = Math.round(2.4f);          // line 1
long b = Math.round(2.4);          // line 2
int c = (int) Math.floor(2.4);     // line 3
double d = Math.pow(2, 10);        // line 4
int e = Math.max(3, 4L);           // line 5
int f = Math.abs(-3);              // line 6`,
      options: ['line 1', 'line 2', 'line 3', 'line 5', 'line 6'],
      answer: [3],
      explanation: '`Math.max(int, long)` resolves to the `long` overload and returns `long`, which cannot be assigned to `int` without a cast. `round(float)` returns int and `round(double)` returns long, so lines 1 and 2 are fine.',
      optionNotes: { '0': '`round(float)` → int.', '1': '`round(double)` → long.', '2': 'Explicit cast.', '3': 'Correct – result is long.', '4': '`abs(int)` → int.' },
      verify: null
    },
    {
      id: 'ch04-q11', type: 'single', difficulty: 'easy', objectiveIds: ['1a'], tags: ['math'],
      question: 'What is the output?',
      code: `System.out.println(Math.round(-1.5) + " " + Math.ceil(-1.5) + " " + Math.floor(1.5) + " " + Math.abs(-0.0) + " " + Math.floorMod(-7, 3) + " " + (-7 % 3));`,
      options: ['-1 -1.0 1.0 0.0 2 -1', '-2 -1.0 1.0 0.0 2 -1', '-1 -2.0 1.0 0.0 -1 -1', '-1 -1.0 1 0 2 -1', '-2 -2.0 2.0 0.0 2 2'],
      answer: [0],
      explanation: '`round` rounds half up (toward positive infinity): −1.5 → −1. `ceil(-1.5)` → −1.0, `floor(1.5)` → 1.0 (doubles). `abs(-0.0)` → 0.0. `floorMod` gives a non-negative result for a positive modulus, unlike `%`.',
      optionNotes: { '0': 'Correct.', '1': 'round(-1.5) is -1.', '2': 'ceil goes toward +∞.', '3': 'floor/ceil/abs(double) return doubles.', '4': 'Multiple errors.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
System.out.println(Math.round(-1.5) + " " + Math.ceil(-1.5) + " " + Math.floor(1.5) + " " + Math.abs(-0.0) + " " + Math.floorMod(-7, 3) + " " + (-7 % 3));
} }` }, expect: { output: '-1 -1.0 1.0 0.0 2 -1' } }
    },
    {
      id: 'ch04-q12', type: 'multi', difficulty: 'easy', objectiveIds: ['5'], tags: ['array', 'declaration'],
      question: 'Which declarations compile? (Choose all that apply.)',
      code: null,
      options: ['int[] a = new int[3] {1, 2, 3};', 'int[] b = new int[] {1, 2, 3};', 'int c[] = {1, 2, 3};', 'int[][] d = new int[][3];', 'int[] e = new int[0];', 'int[] f; f = {1, 2};'],
      answer: [1, 2, 4],
      explanation: 'You cannot give both a size and an initializer. The first dimension of a multi-dimensional array is mandatory. A bare `{...}` initializer is only allowed in a declaration statement. Zero-length arrays are legal.',
      optionNotes: { '0': 'Size and initializer together.', '1': 'Anonymous array.', '2': 'Legal (brackets after name).', '3': 'First dimension missing.', '4': 'Legal.', '5': 'Bare initializer outside declaration.' },
      verify: null
    },
    {
      id: 'ch04-q13', type: 'single', difficulty: 'medium', objectiveIds: ['5'], tags: ['array', 'declaration'],
      question: 'What is the output?',
      code: `int a[], b;
int[] c, d;
a = new int[2];
c = new int[]{1};
d = c;
b = a.length + c.length + d[0];
System.out.println(b);`,
      options: ['4', '3', '5', 'The code does not compile because b is not an array.', 'The code does not compile because d is not initialised.'],
      answer: [0],
      explanation: '`int a[], b;` declares `a` as an array and `b` as a plain `int` – which is exactly how `b` is used. `a.length` = 2, `c.length` = 1, `d[0]` = 1 → 4.',
      optionNotes: { '0': 'Correct.', '1': 'd[0] is 1.', '2': 'a.length is 2.', '3': '`b` being an int is what makes this compile.', '4': '`d = c` initialises d.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
int a[], b;
int[] c, d;
a = new int[2];
c = new int[]{1};
d = c;
b = a.length + c.length + d[0];
System.out.println(b);
} }` }, expect: { output: '4' } }
    },
    {
      id: 'ch04-q14', type: 'single', difficulty: 'medium', objectiveIds: ['5'], tags: ['array', 'multi-dimensional'],
      question: 'What is the output?',
      code: `int[][] m = new int[3][];
m[0] = new int[]{1, 2};
m[2] = new int[1];
int sum = 0;
for (int[] row : m) {
  if (row == null) continue;
  for (int v : row) sum += v;
  sum += row.length;
}
System.out.println(sum + " " + m.length + " " + m[1]);`,
      options: ['6 3 null', '3 3 null', '6 3 0', 'A NullPointerException is thrown.', 'The code does not compile.'],
      answer: [0],
      explanation: '`new int[3][]` creates three null rows. Row 0 contributes 1+2 and length 2; row 1 is skipped; row 2 contributes 0 and length 1. Total 6. `m[1]` is still null.',
      optionNotes: { '0': 'Correct.', '1': 'Row lengths are also added.', '2': 'm[1] was never assigned.', '3': 'The null check prevents the NPE.', '4': 'Ragged arrays are legal.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] x) {
int[][] m = new int[3][];
m[0] = new int[]{1, 2};
m[2] = new int[1];
int sum = 0;
for (int[] row : m) {
  if (row == null) continue;
  for (int v : row) sum += v;
  sum += row.length;
}
System.out.println(sum + " " + m.length + " " + m[1]);
} }` }, expect: { output: '6 3 null' } }
    },
    {
      id: 'ch04-q15', type: 'single', difficulty: 'medium', objectiveIds: ['5'], tags: ['arrays-api', 'binarySearch'],
      question: 'What is the output?',
      code: `int[] n = {9, 3, 7, 1};
Arrays.sort(n);
System.out.print(Arrays.binarySearch(n, 7) + " ");
System.out.print(Arrays.binarySearch(n, 8) + " ");
System.out.print(Arrays.binarySearch(n, 0) + " ");
System.out.print(Arrays.binarySearch(n, 10));`,
      options: ['2 -4 -1 -5', '2 -3 -1 -4', '2 -4 0 -5', '3 -4 -1 -5', 'The result is undefined.'],
      answer: [0],
      explanation: 'Sorted: {1, 3, 7, 9}. 7 is at index 2. 8 would be inserted at index 3 → −3−1 = −4. 0 at index 0 → −1. 10 at index 4 → −5.',
      optionNotes: { '0': 'Correct.', '1': 'Formula is −(insertion point) − 1.', '2': 'Not-found is never 0 (0 means found at index 0).', '3': '7 is at index 2 after sorting.', '4': 'The array was sorted first, so results are well defined.' },
      verify: { files: { 'Main.java': `import java.util.*;
public class Main { public static void main(String[] a) {
int[] n = {9, 3, 7, 1};
Arrays.sort(n);
System.out.print(Arrays.binarySearch(n, 7) + " ");
System.out.print(Arrays.binarySearch(n, 8) + " ");
System.out.print(Arrays.binarySearch(n, 0) + " ");
System.out.print(Arrays.binarySearch(n, 10));
} }` }, expect: { output: '2 -4 -1 -5' } }
    },
    {
      id: 'ch04-q16', type: 'single', difficulty: 'medium', objectiveIds: ['5'], tags: ['arrays-api', 'compare'],
      question: 'What is the output?',
      code: `int[] a = {1, 2, 3};
int[] b = {1, 2, 3, 4};
int[] c = {1, 5};
System.out.println(Arrays.compare(a, b) + " " + Arrays.mismatch(a, b) + " " + Arrays.mismatch(a, c) + " " + Arrays.equals(a, Arrays.copyOf(b, 3)) + " " + (Arrays.compare(c, a) > 0));`,
      options: ['-1 3 1 true true', '1 3 1 true false', '-1 -1 1 true true', '-1 3 1 false true', '0 3 1 true true'],
      answer: [0],
      explanation: '`a` is a prefix of `b`, so it is smaller (−1) and the first mismatch is at index 3 (a\'s length). `a` and `c` differ at index 1. `copyOf(b, 3)` equals `a`. `c` is greater than `a` because 5 > 2 at index 1.',
      optionNotes: { '0': 'Correct.', '1': 'Shorter prefix is smaller.', '2': 'mismatch returns the shorter length when one is a prefix.', '3': 'copyOf truncates to {1,2,3}.', '4': 'Different lengths are never equal (0).' },
      verify: { files: { 'Main.java': `import java.util.*;
public class Main { public static void main(String[] x) {
int[] a = {1, 2, 3};
int[] b = {1, 2, 3, 4};
int[] c = {1, 5};
System.out.println(Arrays.compare(a, b) + " " + Arrays.mismatch(a, b) + " " + Arrays.mismatch(a, c) + " " + Arrays.equals(a, Arrays.copyOf(b, 3)) + " " + (Arrays.compare(c, a) > 0));
} }` }, expect: { output: '-1 3 1 true true' } }
    },
    {
      id: 'ch04-q17', type: 'single', difficulty: 'medium', objectiveIds: ['5'], tags: ['array', 'covariance'],
      question: 'What is the result?',
      code: `Object[] objs = new String[2];
objs[0] = "text";
objs[1] = Integer.valueOf(1);
System.out.println(objs.length);`,
      options: ['2', 'The code does not compile at line 1.', 'The code does not compile at line 3.', 'An ArrayStoreException is thrown at runtime.', 'A ClassCastException is thrown at runtime.'],
      answer: [3],
      explanation: 'Arrays are covariant, so a `String[]` can be referenced as `Object[]`. The compiler allows storing any Object, but the runtime array type is `String[]`, so storing an Integer throws `ArrayStoreException`.',
      optionNotes: { '0': 'Never reaches the print.', '1': 'Array covariance is legal.', '2': 'Compiles – Integer is an Object.', '3': 'Correct.', '4': 'No cast is involved.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
Object[] objs = new String[2];
objs[0] = "text";
objs[1] = Integer.valueOf(1);
System.out.println(objs.length);
} }` }, expect: 'runtime-exception' }
    },
    {
      id: 'ch04-q18', type: 'single', difficulty: 'medium', objectiveIds: ['5'], tags: ['asList'],
      question: 'What is the result?',
      code: `String[] arr = {"a", "b", "c"};
List<String> list = Arrays.asList(arr);
list.set(0, "z");
arr[1] = "y";
System.out.print(Arrays.toString(arr) + list);
list.add("d");`,
      options: ['[z, y, c][z, y, c] followed by an UnsupportedOperationException', '[a, y, c][z, b, c] followed by an UnsupportedOperationException', '[z, y, c][z, y, c, d]', '[z, y, c][z, y, c] and then nothing happens', 'The code does not compile.'],
      answer: [0],
      explanation: '`Arrays.asList` returns a fixed-size list **backed by the array**: writes through `set` and through the array are visible on both sides; structural changes (`add`, `remove`) throw `UnsupportedOperationException`.',
      optionNotes: { '0': 'Correct.', '1': 'The list is a view, not a copy.', '2': 'add is not supported.', '3': 'add throws.', '4': 'Compiles.' },
      verify: { files: { 'Main.java': `import java.util.*;
public class Main { public static void main(String[] x) {
String[] arr = {"a", "b", "c"};
List<String> list = Arrays.asList(arr);
list.set(0, "z");
arr[1] = "y";
System.out.print(Arrays.toString(arr) + list);
list.add("d");
} }` }, expect: 'runtime-exception' }
    },
    {
      id: 'ch04-q19', type: 'single', difficulty: 'easy', objectiveIds: ['1c'], tags: ['localdate'],
      question: 'What is the output?',
      code: `LocalDate d = LocalDate.of(2024, Month.FEBRUARY, 28);
d = d.plusDays(1).plusYears(1);
System.out.println(d + " " + d.getDayOfWeek() + " " + d.getMonthValue());`,
      options: ['2025-02-28 FRIDAY 2', '2025-03-01 SATURDAY 3', '2025-02-29 SATURDAY 2', '2025-02-28 FRIDAY FEBRUARY', 'A DateTimeException is thrown.'],
      answer: [0],
      explanation: '2024 is a leap year: Feb 28 + 1 day = 2024-02-29. Adding a year to Feb 29 clamps to 2025-02-28 (a Friday). `getMonthValue()` is an int (2); `getMonth()` would be `FEBRUARY`.',
      optionNotes: { '0': 'Correct.', '1': 'The +1 day happens in 2024, a leap year.', '2': '2025 is not a leap year – clamped.', '3': 'getMonthValue returns an int.', '4': 'plus methods adjust invalid dates instead of throwing.' },
      verify: { files: { 'Main.java': `import java.time.*;
public class Main { public static void main(String[] a) {
LocalDate d = LocalDate.of(2024, Month.FEBRUARY, 28);
d = d.plusDays(1).plusYears(1);
System.out.println(d + " " + d.getDayOfWeek() + " " + d.getMonthValue());
} }` }, expect: { output: '2025-02-28 FRIDAY 2' } }
    },
    {
      id: 'ch04-q20', type: 'multi', difficulty: 'medium', objectiveIds: ['1c'], tags: ['datetime', 'compile'],
      question: 'Which statements compile? (Choose all that apply.)',
      code: null,
      options: [
        'LocalDate d = new LocalDate(2024, 1, 1);',
        'LocalDate d = LocalDate.of(2024, 1, 1).plusHours(1);',
        'LocalTime t = LocalTime.of(10, 0).plusSeconds(1);',
        'LocalDateTime dt = LocalDateTime.of(2024, 1, 1, 10, 0);',
        'LocalDateTime dt = LocalDate.of(2024, 1, 1).atTime(10, 0);',
        'Instant i = LocalDateTime.now().toInstant();'
      ],
      answer: [2, 3, 4],
      explanation: '`java.time` types have no public constructors. `LocalDate` has no hour methods; `LocalTime` has second methods. `LocalDateTime.of(y, M, d, h, m)` and `LocalDate.atTime` are valid. `LocalDateTime.toInstant()` requires a `ZoneOffset` argument.',
      optionNotes: { '0': 'No public constructor.', '1': '`plusHours` does not exist on LocalDate.', '2': 'Legal.', '3': 'Legal 5-argument factory.', '4': 'Legal.', '5': 'Needs `toInstant(ZoneOffset)`.' },
      verify: null
    },
    {
      id: 'ch04-q21', type: 'single', difficulty: 'medium', objectiveIds: ['1c'], tags: ['period', 'duration'],
      question: 'What is the output?',
      code: `Period p = Period.of(1, 14, 40);
Duration d = Duration.ofMinutes(125);
System.out.println(p + " " + p.normalized() + " " + d + " " + Duration.ofDays(2) + " " + Period.ofWeeks(3));`,
      options: ['P1Y14M40D P2Y2M40D PT2H5M PT48H P21D', 'P2Y2M40D P2Y2M40D PT2H5M P2D P3W', 'P1Y14M40D P2Y3M10D PT125M PT48H P21D', 'P1Y14M40D P2Y2M40D PT2H5M P2D P21D', 'The code does not compile.'],
      answer: [0],
      explanation: 'Period does not normalise months into years unless asked; days are never normalised into months. Duration prints in hours/minutes/seconds (`PT2H5M`, and two days is `PT48H`). Weeks are stored as days.',
      optionNotes: { '0': 'Correct.', '1': 'Period.toString does not normalise; Duration has no day unit in toString.', '2': 'normalized() never touches days; 125 minutes prints as 2H5M.', '3': 'Duration.ofDays(2) prints PT48H.', '4': 'Compiles.' },
      verify: { files: { 'Main.java': `import java.time.*;
public class Main { public static void main(String[] a) {
Period p = Period.of(1, 14, 40);
Duration d = Duration.ofMinutes(125);
System.out.println(p + " " + p.normalized() + " " + d + " " + Duration.ofDays(2) + " " + Period.ofWeeks(3));
} }` }, expect: { output: 'P1Y14M40D P2Y2M40D PT2H5M PT48H P21D' } }
    },
    {
      id: 'ch04-q22', type: 'single', difficulty: 'medium', objectiveIds: ['1c'], tags: ['period', 'runtime'],
      question: 'What is the result?',
      code: `LocalTime t = LocalTime.of(8, 0);
LocalDate d = LocalDate.of(2024, 5, 1);
System.out.print(t.plus(Duration.ofHours(3)) + " ");
System.out.print(d.plus(Period.ofDays(3)) + " ");
System.out.print(t.plus(Period.ofDays(1)));`,
      options: ['11:00 2024-05-04 followed by an UnsupportedTemporalTypeException', '11:00 2024-05-04 08:00', '11:00 2024-05-04 09:00', 'The code does not compile.', 'An UnsupportedTemporalTypeException is thrown before anything prints.'],
      answer: [0],
      explanation: 'Time + Duration and Date + Period are fine. `LocalTime.plus(Period)` compiles (both are `TemporalAmount`s) but throws at runtime because a time has no day field – after the first two values have printed.',
      optionNotes: { '0': 'Correct.', '1': 'A Period cannot be added to a LocalTime.', '2': 'Same.', '3': 'Compiles – the parameter type is TemporalAmount.', '4': 'The exception occurs on the third statement.' },
      verify: { files: { 'Main.java': `import java.time.*;
public class Main { public static void main(String[] a) {
LocalTime t = LocalTime.of(8, 0);
LocalDate d = LocalDate.of(2024, 5, 1);
System.out.print(t.plus(Duration.ofHours(3)) + " ");
System.out.print(d.plus(Period.ofDays(3)) + " ");
System.out.print(t.plus(Period.ofDays(1)));
} }` }, expect: 'runtime-exception' }
    },
    {
      id: 'ch04-q23', type: 'single', difficulty: 'hard', objectiveIds: ['1c'], tags: ['zoneddatetime', 'dst'],
      question: 'In `America/New_York`, clocks jump from 02:00 to 03:00 on 2024-03-10. What is the output?',
      code: `LocalDateTime ldt = LocalDateTime.of(2024, 3, 10, 1, 30);
ZonedDateTime z = ZonedDateTime.of(ldt, ZoneId.of("America/New_York"));
ZonedDateTime later = z.plusHours(1);
System.out.println(z.getOffset() + " " + later.toLocalTime() + " " + later.getOffset() + " " + Duration.between(z, later).toMinutes());`,
      options: ['-05:00 03:30 -04:00 60', '-05:00 02:30 -05:00 60', '-05:00 03:30 -04:00 120', '-04:00 02:30 -04:00 60', 'A DateTimeException is thrown.'],
      answer: [0],
      explanation: 'Before the change the offset is −05:00. Adding one real hour crosses the gap, so the wall clock shows 03:30 with the new offset −04:00. Only 60 minutes elapsed on the timeline.',
      optionNotes: { '0': 'Correct.', '1': '02:30 does not exist on that day.', '2': 'Elapsed time is one hour; only the clock reading jumps two.', '3': 'At 01:30 standard time is still in effect.', '4': 'No exception – java.time handles the gap.' },
      verify: { files: { 'Main.java': `import java.time.*;
public class Main { public static void main(String[] a) {
LocalDateTime ldt = LocalDateTime.of(2024, 3, 10, 1, 30);
ZonedDateTime z = ZonedDateTime.of(ldt, ZoneId.of("America/New_York"));
ZonedDateTime later = z.plusHours(1);
System.out.println(z.getOffset() + " " + later.toLocalTime() + " " + later.getOffset() + " " + Duration.between(z, later).toMinutes());
} }` }, expect: { output: '-05:00 03:30 -04:00 60' } }
    },
    {
      id: 'ch04-q24', type: 'single', difficulty: 'medium', objectiveIds: ['1c', '11'], tags: ['formatter'],
      question: 'What is the output?',
      code: `LocalDateTime dt = LocalDateTime.of(2024, 7, 4, 15, 5, 9);
DateTimeFormatter f = DateTimeFormatter.ofPattern("dd/MM/yy hh:mm a 'on' EEEE", Locale.US);
System.out.println(dt.format(f) + " | " + LocalTime.of(9, 0) + " | " + dt.toLocalDate().plusDays(1));`,
      options: ['04/07/24 03:05 PM on Thursday | 09:00 | 2024-07-05', '04/07/24 15:05 PM on Thursday | 09:00:00 | 2024-07-05', '07/04/24 03:05 PM on Thursday | 09:00 | 2024-07-05', '04/07/24 03:05 PM on Thu | 09:00 | 2024-07-05', 'An UnsupportedTemporalTypeException is thrown.'],
      answer: [0],
      explanation: '`dd/MM/yy` → 04/07/24; `hh` is the 12-hour clock with `a` giving PM; `EEEE` is the full day name; quoted text is literal. `LocalTime.toString()` omits zero seconds. July 4, 2024 was a Thursday.',
      optionNotes: { '0': 'Correct.', '1': '`hh` is 12-hour; toString drops :00 seconds.', '2': 'dd comes before MM in the pattern.', '3': 'EEEE is the full name; EEE would give Thu.', '4': 'All pattern letters are supported by LocalDateTime.' },
      verify: { files: { 'Main.java': `import java.time.*; import java.time.format.*; import java.util.*;
public class Main { public static void main(String[] a) {
LocalDateTime dt = LocalDateTime.of(2024, 7, 4, 15, 5, 9);
DateTimeFormatter f = DateTimeFormatter.ofPattern("dd/MM/yy hh:mm a 'on' EEEE", Locale.US);
System.out.println(dt.format(f) + " | " + LocalTime.of(9, 0) + " | " + dt.toLocalDate().plusDays(1));
} }` }, expect: { output: '04/07/24 03:05 PM on Thursday | 09:00 | 2024-07-05' } }
    },
    {
      id: 'ch04-q25', type: 'single', difficulty: 'medium', objectiveIds: ['1c'], tags: ['formatter', 'runtime'],
      question: 'What is the result?',
      code: `LocalDate d = LocalDate.of(2024, 1, 15);
DateTimeFormatter f = DateTimeFormatter.ofPattern("MMM d, yyyy HH:mm");
System.out.println(d.format(f));`,
      options: ['Jan 15, 2024 00:00', 'Jan 15, 2024', 'The code does not compile.', 'An UnsupportedTemporalTypeException is thrown at runtime.', 'A DateTimeParseException is thrown at runtime.'],
      answer: [3],
      explanation: 'The pattern is valid and the code compiles, but formatting a `LocalDate` with hour/minute fields fails at runtime because the date has no time component.',
      optionNotes: { '0': 'A LocalDate has no time to print.', '1': 'The formatter does not silently skip fields.', '2': 'Compiles – type checking cannot see pattern contents.', '3': 'Correct.', '4': 'Parse exceptions come from parse, not format.' },
      verify: { files: { 'Main.java': `import java.time.*; import java.time.format.*;
public class Main { public static void main(String[] a) {
LocalDate d = LocalDate.of(2024, 1, 15);
DateTimeFormatter f = DateTimeFormatter.ofPattern("MMM d, yyyy HH:mm");
System.out.println(d.format(f));
} }` }, expect: 'runtime-exception' }
    },
    {
      id: 'ch04-q26', type: 'single', difficulty: 'medium', objectiveIds: ['1c'], tags: ['instant', 'between'],
      question: 'What is the output?',
      code: `LocalDate a = LocalDate.of(2024, 1, 1);
LocalDate b = LocalDate.of(2024, 3, 15);
System.out.println(Period.between(a, b) + " " + ChronoUnit.DAYS.between(a, b) + " " + a.until(b, ChronoUnit.MONTHS) + " " + a.isBefore(b));`,
      options: ['P2M14D 74 2 true', 'P2M14D 74 2.5 true', 'P74D 74 2 true', 'P2M15D 75 2 true', 'The code does not compile.'],
      answer: [0],
      explanation: 'Jan 1 → Mar 15 is 2 months and 14 days. Days: 31 (Jan) + 29 (Feb 2024) + 14 = 74. `until` in months truncates to 2. `isBefore` is true.',
      optionNotes: { '0': 'Correct.', '1': '`until` returns a long.', '2': 'Period.between reports months and days, not total days.', '3': 'Mar 1 → Mar 15 is 14 days.', '4': 'Compiles (ChronoUnit is imported).' },
      verify: { files: { 'Main.java': `import java.time.*; import java.time.temporal.*;
public class Main { public static void main(String[] x) {
LocalDate a = LocalDate.of(2024, 1, 1);
LocalDate b = LocalDate.of(2024, 3, 15);
System.out.println(Period.between(a, b) + " " + ChronoUnit.DAYS.between(a, b) + " " + a.until(b, ChronoUnit.MONTHS) + " " + a.isBefore(b));
} }` }, expect: { output: 'P2M14D 74 2 true' } }
    },
    {
      id: 'ch04-q27', type: 'single', difficulty: 'medium', objectiveIds: ['1b'], tags: ['string', 'compareTo', 'split'],
      question: 'What is the output?',
      code: `System.out.print("apple".compareTo("apply") + " ");
System.out.print("Zoo".compareTo("apple") + " ");
System.out.print("a.b.c".split(".").length + " ");
System.out.print("a.b.c".split("\\\\.").length + " ");
System.out.print(String.join("-", "x", "y", "z"));`,
      options: ['-20 -7 0 3 x-y-z', '-1 -1 0 3 x-y-z', '-20 -7 3 3 x-y-z', '-20 25 1 3 x-y-z', 'A PatternSyntaxException is thrown.'],
      answer: [0],
      explanation: '`compareTo` returns the difference of the first mismatching chars: `\'e\' - \'y\'` = −20; `\'Z\'(90) - \'a\'(97)` = −7. `split(".")` treats `.` as a regex matching every char, producing only empty trailing strings, which are removed → length 0. Escaped, it splits into 3.',
      optionNotes: { '0': 'Correct.', '1': 'compareTo returns the char difference, not ±1.', '2': 'Unescaped dot matches everything.', '3': 'Uppercase Z (90) is less than lowercase a (97).', '4': '"." is a valid regex.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
System.out.print("apple".compareTo("apply") + " ");
System.out.print("Zoo".compareTo("apple") + " ");
System.out.print("a.b.c".split(".").length + " ");
System.out.print("a.b.c".split("\\\\.").length + " ");
System.out.print(String.join("-", "x", "y", "z"));
} }` }, expect: { output: '-20 -7 0 3 x-y-z' } }
    },
    {
      id: 'ch04-q28', type: 'single', difficulty: 'easy', objectiveIds: ['1b'], tags: ['format'],
      question: 'What is the output?',
      code: `String s = String.format("%s|%d|%.1f|%5s|%-5s|%,d", "a", 7, 2.36, "b", "c", 1234567);
System.out.println(s + " " + s.length());`,
      options: ['a|7|2.4|    b|c    |1,234,567 29', 'a|7|2.3|    b|c    |1,234,567 29', 'a|7|2.4|b    |    c|1,234,567 29', 'a|7|2.4|    b|c    |1234567 27', 'An IllegalFormatException is thrown.'],
      answer: [0],
      explanation: '`%.1f` rounds 2.36 to 2.4; `%5s` right-aligns in 5 columns and `%-5s` left-aligns; `%,d` adds grouping separators. The resulting string is 29 characters long.',
      optionNotes: { '0': 'Correct.', '1': '2.36 rounds up to 2.4.', '2': 'Positive width pads on the left; `-` pads on the right.', '3': 'The comma flag inserts separators.', '4': 'All conversions match their argument types.' },
      verify: { files: { 'Main.java': `public class Main { public static void main(String[] a) {
String s = String.format("%s|%d|%.1f|%5s|%-5s|%,d", "a", 7, 2.36, "b", "c", 1234567);
System.out.println(s + " " + s.length());
} }` }, expect: { output: 'a|7|2.4|    b|c    |1,234,567 29' } }
    }
  ],

  checklist: [
    'I know Strings are immutable and always use the return value of String and java.time methods.',
    'I can predict == results for literals, constant expressions, final-variable concatenation, new String, and intern().',
    'I can apply substring/indexOf/charAt/replace/strip/isBlank/repeat/indent/compareTo/split/format correctly, including exclusive end indexes.',
    'I can count text block characters: indentation rules, trailing newline rule, \\s and line continuation.',
    'I know StringBuilder mutates, returns this, has identity equals, and how delete/insert/replace/setLength/reverse behave.',
    'I know the return types of Math.round/floor/ceil/pow/max and the behaviour of floorMod, abs(MIN_VALUE), random.',
    'I can declare arrays correctly (size vs initializer, brackets-after-name, multi-dimensional first dimension).',
    'I know Arrays.sort ordering for Strings, the binarySearch not-found formula, compare/mismatch/equals/asList semantics.',
    'I know arrays are covariant and can raise ArrayStoreException.',
    'I know which java.time factory methods exist, that months are 1-based, and that invalid values fail at runtime.',
    'I know Period vs Duration units, which combinations throw UnsupportedTemporalTypeException, and how each prints.',
    'I can evaluate plusMonths clamping, LocalTime wrap-around, and DST gap arithmetic on ZonedDateTime.',
    'I know DateTimeFormatter pattern letters, quoting, and that field mismatches fail at runtime.'
  ]
});
