OCP.registerChapter({
  id: 11,
  slug: 'exceptions-and-localization',
  title: 'Exceptions & Localization',
  objectiveIds: ['4', '11', '12a'],
  intro: `Objectives **4** (try/catch/finally, try-with-resources, multi-catch, custom exceptions), **11** (localization, ResourceBundle, formatting and parsing numbers/dates/currency/messages), and **12a** (the Java Logging API). On the 1Z0-829 exam, questions from this chapter test exact execution order in try-with-resources (close runs in reverse declaration order before catch/finally), suppressed exceptions, multi-catch disjoint rules, ResourceBundle fallback lookup order, NumberFormat/DateTimeFormatter localization, and logging level hierarchies.`,

  notes: [
    {
      id: 'exceptions-hierarchy',
      title: 'Exception types and handling mechanics',
      md: `## Throwable hierarchy

\`\`\`
java.lang.Throwable
  ├── java.lang.Error             (Unchecked: fatal JVM conditions, do not catch)
  │     ├── StackOverflowError
  │     ├── OutOfMemoryError
  │     └── ExceptionInInitializerError
  └── java.lang.Exception
        ├── java.lang.RuntimeException   (Unchecked: programming/logic bugs)
        │     ├── NullPointerException
        │     ├── ArrayIndexOutOfBoundsException
        │     ├── ClassCastException
        │     ├── IllegalArgumentException / NumberFormatException
        │     └── IllegalStateException
        └── (Checked Exceptions)          (Checked: must handle or declare)
              ├── java.io.IOException / FileNotFoundException
              ├── java.sql.SQLException
              └── java.text.ParseException
\`\`\`

## try-catch-finally execution rules
* **\`try\`** must be followed by at least one **\`catch\`** OR a **\`finally\`** block (or be a try-with-resources statement).
* **\`finally\` always executes**, even when:
  * An unhandled exception occurs in \`try\` or \`catch\`.
  * A \`return\` statement executes in \`try\` or \`catch\`.
* **Exceptions to \`finally\`**:
  * \`System.exit(status)\` halts the JVM immediately without running \`finally\`.
  * Infinite loops, JVM crash / power failure.
* **Return in \`finally\` trap**: if \`finally\` executes a \`return\` or throws an exception, it **discards and overrides** any return value or thrown exception from the \`try\` or \`catch\` block!

## Multi-catch rules
\`\`\`java
try {
  // code
} catch (IOException | SQLException e) {
  // handling
}
\`\`\`
* The exception types listed in a multi-catch must be **disjoint** (neither can be a subclass of another).
  * \`catch (FileNotFoundException | IOException e)\` **DOES NOT COMPILE**!
* The multi-catch parameter \`e\` is implicitly **\`final\`** and cannot be reassigned.`
    },
    {
      id: 'try-with-resources',
      title: 'Try-with-resources and AutoCloseable',
      md: `## Anatomy of try-with-resources

\`\`\`java
try (BufferedReader r = Files.newBufferedReader(path);
     BufferedWriter w = Files.newBufferedWriter(outPath)) {
  // work
}
\`\`\`

* Any resource managed in the try header must implement **\`java.lang.AutoCloseable\`** (or its subinterface \`java.io.Closeable\`).
  * \`AutoCloseable.close()\` throws \`Exception\`.
  * \`Closeable.close()\` throws \`IOException\`.
* **Closing order**: resources are closed in **reverse order of their declaration**!
* **Timing**: \`close()\` is called **immediately upon exiting the try block, BEFORE any explicit \`catch\` or \`finally\` blocks run**!
* In Java 9+, effectively final existing variables can be passed directly:
  \`\`\`java
  var in = new FileInputStream("data.txt");
  try (in) { ... } // in must be final or effectively final
  \`\`\`

## Suppressed exceptions
* If the \`try\` block throws an exception $E_1$, and subsequent \`close()\` calls throw exceptions $E_2, E_3$:
  * $E_1$ is thrown as the primary exception.
  * $E_2$ and $E_3$ are attached as **suppressed exceptions** to $E_1$.
  * Retrieve suppressed exceptions using: \`e.getSuppressed()\` (returns \`Throwable[]\`).
* If the \`finally\` block throws an exception $E_{fin}$, $E_{fin}$ supplants $E_1$ entirely and $E_1$ is lost!`
    },
    {
      id: 'localization-and-locales',
      title: 'Locales and ResourceBundle lookup hierarchy',
      md: `## java.util.Locale
Represents a geographic, political, or cultural region.
* Creation: \`new Locale("en", "US")\`, \`new Locale.Builder().setLanguage("en").setRegion("US").build()\`, or factory constants like \`Locale.US\`, \`Locale.GERMANY\`.
* Language is lowercase (e.g. \`en\`, \`fr\`); country is uppercase (e.g. \`US\`, \`FR\`).

## ResourceBundle lookup hierarchy
When calling \`ResourceBundle.getBundle("Zoo", new Locale("fr", "CA"))\` with default locale \`en_US\`, Java searches candidate bundles in this exact order:

1. \`Zoo_fr_CA.properties\` (Requested language + country)
2. \`Zoo_fr.properties\` (Requested language only)
3. \`Zoo_en_US.properties\` (Default locale language + country)
4. \`Zoo_en.properties\` (Default locale language only)
5. \`Zoo.properties\` (Base bundle / default)
6. If no bundle found: throws **\`MissingResourceException\`**.

* Once a matching bundle is found, individual keys are searched hierarchically. If a key is not found in \`Zoo_fr_CA\`, it falls back to \`Zoo_fr\`, then \`Zoo\`.`
    },
    {
      id: 'formatting-and-parsing',
      title: 'Formatting and parsing numbers, currencies, and dates',
      md: `## NumberFormat (java.text)
* Factory methods:
  * \`NumberFormat.getInstance(locale)\` / \`getNumberInstance(locale)\`
  * \`NumberFormat.getCurrencyInstance(locale)\`
  * \`NumberFormat.getPercentInstance(locale)\`
  * \`NumberFormat.getCompactNumberInstance(locale, Style.SHORT)\` (Java 12+: formats 1000 as "1K")
* **\`format(double/long)\`**: converts number to localized string.
* **\`parse(String)\`**: converts localized string to \`Number\`.
  * Throws **checked \`ParseException\`**!
  * Stops parsing at the first invalid character: \`nf.parse("123abc456")\` parses as \`123\`.

## DecimalFormat
\`\`\`java
DecimalFormat df = new DecimalFormat("###,###.00");
\`\`\`
* \`#\`: optional digit (omitted if zero).
* \`0\`: mandatory digit (padded with 0 if absent).

## DateTimeFormatter localization
* \`DateTimeFormatter.ofLocalizedDate(FormatStyle.SHORT)\`
* \`DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM)\`
* Localize with: \`formatter.withLocale(locale)\`.`
    },
    {
      id: 'logging-api',
      title: 'Java Logging API (java.util.logging)',
      md: `## Logging Levels (from highest severity to lowest)

1. **\`OFF\`** (\`Integer.MAX_VALUE\`) – turns off logging.
2. **\`SEVERE\`** (1000) – serious failure.
3. **\`WARNING\`** (900) – potential problem.
4. **\`INFO\`** (800) – informational messages (**default level**).
5. **\`CONFIG\`** (700) – configuration info.
6. **\`FINE\`** (500) – tracing / debugging.
7. **\`FINER\`** (400) – detailed tracing.
8. **\`FINEST\`** (300) – highly detailed tracing.
9. **\`ALL\`** (\`Integer.MIN_VALUE\`) – logs everything.

## Logging rules
* A logger logs a message if \`message.level >= logger.level\`.
* Loggers are organized in a dot-separated hierarchical namespace:
  \`Logger logger = Logger.getLogger("com.ocp.app");\`
  * Parent is \`"com.ocp"\`, whose parent is \`"com"\`, whose parent is root \`""\`.
* A logger inherits its level from its nearest parent with an explicitly configured level if not set.`
    }
  ],

  gotchas: [
    { title: 'Multi-catch cannot catch related types', md: '`catch (FileNotFoundException | IOException e)` is a compile error because `FileNotFoundException` is a subclass of `IOException`. They must be disjoint.' },
    { title: 'Multi-catch variable is final', md: 'In `catch (IOException | SQLException e)`, assigning `e = null;` or `e = new IOException();` is a compile error.' },
    { title: 'Close order in try-with-resources', md: 'Resources are closed in **reverse order of declaration**. The last opened resource is closed first.' },
    { title: 'close() runs before catch and finally', md: 'Implicit `close()` calls in try-with-resources happen **before** any explicit `catch` or `finally` block executes.' },
    { title: 'finally return overrides try/catch', md: 'A `return` or thrown exception in a `finally` block suppresses and discards any exception or return value from the `try` block.' },
    { title: 'System.exit prevents finally', md: '`System.exit(0)` terminates JVM execution immediately; `finally` blocks do not run.' },
    { title: 'AutoCloseable vs Closeable', md: '`AutoCloseable.close()` declares `throws Exception`. `Closeable.close()` declares `throws IOException`.' },
    { title: 'ResourceBundle default locale fallback', md: 'If requested locale files are missing, Java falls back to the **current default locale** files before falling back to the base bundle.' },
    { title: 'parse() throws checked ParseException', md: '`NumberFormat.parse()` throws checked `java.text.ParseException` and must be caught or declared.' },
    { title: 'NumberFormat.parse stops at invalid characters', md: '`NumberFormat.getInstance().parse("45x67")` parses up to \'x\' and returns `45`, without throwing an exception.' },
    { title: 'Default logging level is INFO', md: 'By default, messages logged below `INFO` (`CONFIG`, `FINE`, `FINER`, `FINEST`) are discarded.' }
  ],

  traps: [
    {
      code: `public class FinallyReturn {
  public static int test() {
    try {
      return 1;
    } finally {
      return 2;
    }
  }
  public static void main(String[] args) {
    System.out.print(test());
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`2`**. The `finally` block executes before the method exits, and its `return 2;` overrides the `return 1;` from the `try` block.',
      verify: {
        files: {
          'FinallyReturn.java': `public class FinallyReturn {
  public static int test() {
    try {
      return 1;
    } finally {
      return 2;
    }
  }
  public static void main(String[] args) {
    System.out.print(test());
  }
}`
        },
        expect: { output: '2' }
      }
    },
    {
      code: `class Door implements AutoCloseable {
  String name;
  Door(String name) { this.name = name; }
  public void close() { System.out.print(name + " "); }
}
public class CloseOrder {
  public static void main(String[] args) {
    try (Door d1 = new Door("D1");
         Door d2 = new Door("D2")) {
      System.out.print("Work ");
    } finally {
      System.out.print("Finally ");
    }
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`Work D2 D1 Finally `**. In try-with-resources, resources are closed in reverse order of declaration (`D2` then `D1`) **before** the `finally` block runs.',
      verify: {
        files: {
          'Door.java': `public class Door implements AutoCloseable {
  String name;
  public Door(String name) { this.name = name; }
  public void close() { System.out.print(name + " "); }
}`,
          'CloseOrder.java': `public class CloseOrder {
  public static void main(String[] args) {
    try (Door d1 = new Door("D1");
         Door d2 = new Door("D2")) {
      System.out.print("Work ");
    } finally {
      System.out.print("Finally ");
    }
  }
}`
        },
        expect: { output: 'Work D2 D1 Finally ' }
      }
    },
    {
      code: `class BadResource implements AutoCloseable {
  public void close() throws Exception {
    throw new IllegalStateException("Close");
  }
}
public class SuppressedTest {
  public static void main(String[] args) {
    try (BadResource r = new BadResource()) {
      throw new RuntimeException("Work");
    } catch (Exception e) {
      System.out.print(e.getMessage() + " " + e.getSuppressed()[0].getMessage());
    }
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`Work Close`**. The primary exception from the try block is `"Work"`. The exception from `close()` is caught and added as a suppressed exception (`"Close"`).',
      verify: {
        files: {
          'BadResource.java': `public class BadResource implements AutoCloseable {
  public void close() throws Exception {
    throw new IllegalStateException("Close");
  }
}`,
          'SuppressedTest.java': `public class SuppressedTest {
  public static void main(String[] args) {
    try (BadResource r = new BadResource()) {
      throw new RuntimeException("Work");
    } catch (Exception e) {
      System.out.print(e.getMessage() + " " + e.getSuppressed()[0].getMessage());
    }
  }
}`
        },
        expect: { output: 'Work Close' }
      }
    },
    {
      code: `import java.text.NumberFormat;
import java.util.Locale;
public class ParsePrefix {
  public static void main(String[] args) throws Exception {
    NumberFormat nf = NumberFormat.getInstance(Locale.US);
    Number n = nf.parse("123.45xyz");
    System.out.print(n);
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`123.45`**. `NumberFormat.parse()` parses starting from the beginning of the string until it encounters an unparseable character (`x`), successfully returning the parsed prefix.',
      verify: {
        files: {
          'ParsePrefix.java': `import java.text.NumberFormat;
import java.util.Locale;
public class ParsePrefix {
  public static void main(String[] args) throws Exception {
    NumberFormat nf = NumberFormat.getInstance(Locale.US);
    Number n = nf.parse("123.45xyz");
    System.out.print(n);
  }
}`
        },
        expect: { output: '123.45' }
      }
    },
    {
      code: `public class MultiCatchSubclass {
  public static void main(String[] args) {
    try {
      throw new java.io.FileNotFoundException();
    } catch (java.io.FileNotFoundException | java.io.IOException e) {
      System.out.println("Handled");
    }
  }
}`,
      prompt: 'Does this code compile?',
      answer: '**Does not compile.** In a multi-catch block, alternative types cannot be in a subclass relationship (`FileNotFoundException` is a subclass of `IOException`).',
      verify: {
        files: {
          'MultiCatchSubclass.java': `public class MultiCatchSubclass {
  public static void main(String[] args) {
    try {
      throw new java.io.FileNotFoundException();
    } catch (java.io.FileNotFoundException | java.io.IOException e) {
      System.out.println("Handled");
    }
  }
}`
        },
        expect: 'compile-error'
      }
    },
    {
      code: `import java.text.DecimalFormat;
public class DecimalFormatTest {
  public static void main(String[] args) {
    DecimalFormat df = new DecimalFormat("00.##");
    System.out.print(df.format(7.1));
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`07.1`**. Pattern `00` forces two digits before the decimal point (padding 7 to `07`). Pattern `##` allows up to two digits after the decimal point without trailing zero padding.',
      verify: {
        files: {
          'DecimalFormatTest.java': `import java.text.DecimalFormat;
public class DecimalFormatTest {
  public static void main(String[] args) {
    DecimalFormat df = new DecimalFormat("00.##");
    System.out.print(df.format(7.1));
  }
}`
        },
        expect: { output: '07.1' }
      }
    }
  ],

  questions: [
    {
      id: 'ch11-q01', type: 'single', difficulty: 'easy', objectiveIds: ['4'], tags: ['exceptions', 'finally'],
      question: 'In which scenario will a `finally` block NOT execute?',
      code: null,
      options: [
        'An uncaught RuntimeException occurs in the try block.',
        'A return statement executes in the try block.',
        'System.exit(0) is called in the try block.',
        'A return statement executes in a catch block.',
        'A checked exception is caught in a catch block.'
      ],
      answer: [2],
      explanation: '`System.exit()` immediately shuts down the Java Virtual Machine. When `System.exit()` is executed, `finally` blocks do not run. In all other scenarios, `finally` is guaranteed to execute.',
      optionNotes: {
        '0': 'finally executes before propagating uncaught exception.',
        '1': 'finally executes before return completes.',
        '2': 'Correct: System.exit terminates JVM without executing finally.',
        '3': 'finally executes before catch return completes.',
        '4': 'finally executes after catch block.'
      },
      verify: null
    },
    {
      id: 'ch11-q02', type: 'single', difficulty: 'medium', objectiveIds: ['4'], tags: ['try-with-resources', 'order'],
      question: 'What is the output of running this code?',
      code: `class Res implements AutoCloseable {
  int id;
  Res(int id) { this.id = id; }
  public void close() { System.out.print(id + " "); }
}
public class ResOrder {
  public static void main(String[] args) {
    try (Res r1 = new Res(1); Res r2 = new Res(2)) {
      System.out.print("T ");
    } catch (Exception e) {
      System.out.print("C ");
    } finally {
      System.out.print("F ");
    }
  }
}`,
      options: [
        'T 2 1 F ',
        'T 1 2 F ',
        'T F 2 1 ',
        'T 2 1 C F ',
        'Compile error'
      ],
      answer: [0],
      explanation: 'First, the body of the try block executes, printing "T ". Then automatic closing runs in reverse declaration order: r2 (printing "2 ") then r1 (printing "1 "). No exception was thrown, so catch is skipped. Finally, the explicit `finally` block runs, printing "F ". Output is `T 2 1 F `.',
      optionNotes: {
        '0': 'Correct: T, then close r2 (2), then close r1 (1), then finally (F).',
        '1': 'Close order is reverse of declaration, not declaration order.',
        '2': 'Close happens before explicit finally.',
        '3': 'No exception occurred.',
        '4': 'Completely valid try-with-resources.'
      },
      verify: {
        files: {
          'Res.java': `public class Res implements AutoCloseable {
  int id;
  public Res(int id) { this.id = id; }
  public void close() { System.out.print(id + " "); }
}`,
          'ResOrder.java': `public class ResOrder {
  public static void main(String[] args) {
    try (Res r1 = new Res(1); Res r2 = new Res(2)) {
      System.out.print("T ");
    } catch (Exception e) {
      System.out.print("C ");
    } finally {
      System.out.print("F ");
    }
  }
}`
        },
        expect: { output: 'T 2 1 F ' }
      }
    },
    {
      id: 'ch11-q03', type: 'single', difficulty: 'medium', objectiveIds: ['4'], tags: ['multi-catch'],
      question: 'Which of the following multi-catch blocks compiles successfully?',
      code: null,
      options: [
        'catch (IllegalArgumentException | NumberFormatException e)',
        'catch (java.io.IOException | java.sql.SQLException e)',
        'catch (Exception | RuntimeException e)',
        'catch (NullPointerException | RuntimeException e)',
        'catch (java.io.FileNotFoundException | java.io.IOException e)'
      ],
      answer: [1],
      explanation: 'In a multi-catch block, types must be disjoint. `NumberFormatException` extends `IllegalArgumentException` (option 0 fails). `RuntimeException` extends `Exception` (option 2 fails). `NullPointerException` extends `RuntimeException` (option 3 fails). `FileNotFoundException` extends `IOException` (option 4 fails). `IOException` and `SQLException` are unrelated sibling exceptions, so option 1 compiles.',
      optionNotes: {
        '0': 'NumberFormatException is a subclass of IllegalArgumentException.',
        '1': 'Correct: IOException and SQLException are disjoint.',
        '2': 'RuntimeException is a subclass of Exception.',
        '3': 'NullPointerException is a subclass of RuntimeException.',
        '4': 'FileNotFoundException is a subclass of IOException.'
      },
      verify: null
    },
    {
      id: 'ch11-q04', type: 'single', difficulty: 'hard', objectiveIds: ['11'], tags: ['resourcebundle', 'fallback'],
      question: 'A program runs with default locale `en_US` and requests resource bundle `Messages` with locale `de_DE`. Which file is searched FIRST in the lookup chain?',
      code: null,
      options: [
        'Messages_de_DE.properties',
        'Messages_de.properties',
        'Messages_en_US.properties',
        'Messages.properties',
        'Messages_en.properties'
      ],
      answer: [0],
      explanation: 'The lookup chain begins with the exact requested language and country: `Messages_de_DE.properties`, followed by `Messages_de.properties`, then default locale `Messages_en_US.properties`, `Messages_en.properties`, and finally `Messages.properties`.',
      optionNotes: {
        '0': 'Correct: exact requested locale is searched first.',
        '1': 'Searched second (language only).',
        '2': 'Searched third (default locale).',
        '3': 'Searched last (base bundle).',
        '4': 'Searched fourth.'
      },
      verify: null
    },
    {
      id: 'ch11-q05', type: 'single', difficulty: 'medium', objectiveIds: ['12a'], tags: ['logging', 'levels'],
      question: 'A logger is configured with level `Level.WARNING`. Which of the following messages will be logged?',
      code: null,
      options: [
        'logger.info("Message");',
        'logger.config("Message");',
        'logger.severe("Message");',
        'logger.fine("Message");',
        'logger.finest("Message");'
      ],
      answer: [2],
      explanation: 'A logger only emits messages with a level equal to or higher than its configured level. The hierarchy is: SEVERE (1000) > WARNING (900) > INFO (800) > CONFIG (700) > FINE (500) > FINER (400) > FINEST (300). When configured at WARNING, only WARNING and SEVERE messages are logged.',
      optionNotes: {
        '0': 'INFO (800) is below WARNING (900).',
        '1': 'CONFIG (700) is below WARNING.',
        '2': 'Correct: SEVERE (1000) is higher than WARNING (900).',
        '3': 'FINE (500) is below WARNING.',
        '4': 'FINEST (300) is below WARNING.'
      },
      verify: null
    },
    {
      id: 'ch11-q06', type: 'single', difficulty: 'medium', objectiveIds: ['4'], tags: ['autocloseable', 'interface'],
      question: 'What exception is declared in the `close()` method of `java.lang.AutoCloseable`?',
      code: null,
      options: [
        'java.io.IOException',
        'java.lang.Exception',
        'java.lang.Throwable',
        'java.lang.RuntimeException',
        'No exception is declared'
      ],
      answer: [1],
      explanation: '`AutoCloseable.close()` declares `void close() throws Exception;`. In contrast, `java.io.Closeable.close()` declares `void close() throws IOException;`.',
      optionNotes: {
        '0': 'Closeable declares IOException, not AutoCloseable.',
        '1': 'Correct: AutoCloseable declares Exception.',
        '2': 'Throwable is not used in close().',
        '3': 'RuntimeException is unchecked.',
        '4': 'close() declares throws Exception.'
      },
      verify: null
    },
    {
      id: 'ch11-q07', type: 'single', difficulty: 'easy', objectiveIds: ['4'], tags: ['exceptions', 'custom'],
      question: 'Which is the minimum requirement to create a custom checked exception in Java?',
      code: null,
      options: [
        'public class MyException extends Exception {}',
        'public class MyException extends RuntimeException {}',
        'public class MyException extends Throwable implements AutoCloseable {}',
        'public class MyException implements Serializable {}',
        'public class MyException extends Error {}'
      ],
      answer: [0],
      explanation: 'Extending `java.lang.Exception` (and not `RuntimeException`) creates a custom checked exception. Extending `RuntimeException` creates an unchecked exception.',
      optionNotes: {
        '0': 'Correct: subclass of Exception creates a checked exception.',
        '1': 'Subclass of RuntimeException is unchecked.',
        '2': 'Unnecessary and unusual to implement AutoCloseable.',
        '3': 'Does not inherit Throwable.',
        '4': 'Subclass of Error is an error, not an exception.'
      },
      verify: null
    },
    {
      id: 'ch11-q08', type: 'single', difficulty: 'medium', objectiveIds: ['11'], tags: ['numberformat', 'currency'],
      question: 'What is the output?',
      code: `import java.text.NumberFormat;
import java.util.Locale;
public class CurrencyFormat {
  public static void main(String[] args) {
    NumberFormat nf = NumberFormat.getCurrencyInstance(Locale.US);
    System.out.print(nf.format(12.5));
  }
}`,
      options: ['$12.50', '12.50', '$12.5', '12.5 $', 'Compile error'],
      answer: [0],
      explanation: '`NumberFormat.getCurrencyInstance(Locale.US)` formats numbers with the US dollar symbol `$` and two decimal digits: `$12.50`.',
      optionNotes: {
        '0': 'Correct: US currency format includes $ and two decimal places.',
        '1': 'Missing currency symbol.',
        '2': 'Currency formats include two decimal places for cents.',
        '3': 'US symbol precedes the amount.',
        '4': 'Completely valid NumberFormat code.'
      },
      verify: {
        files: {
          'CurrencyFormat.java': `import java.text.NumberFormat;
import java.util.Locale;
public class CurrencyFormat {
  public static void main(String[] args) {
    NumberFormat nf = NumberFormat.getCurrencyInstance(Locale.US);
    System.out.print(nf.format(12.5));
  }
}`
        },
        expect: { output: '$12.50' }
      }
    },
    {
      id: 'ch11-q09', type: 'single', difficulty: 'hard', objectiveIds: ['4'], tags: ['suppressed-exceptions'],
      question: 'What is the output?',
      code: `class Broken implements AutoCloseable {
  public void close() { throw new RuntimeException("C"); }
}
public class TestEx {
  public static void main(String[] args) {
    try {
      try (Broken b = new Broken()) {
        throw new RuntimeException("T");
      }
    } catch (Exception e) {
      System.out.print(e.getMessage() + ":" + e.getSuppressed().length);
    }
  }
}`,
      options: ['T:1', 'C:1', 'T:0', 'C:0', 'Compile error'],
      answer: [0],
      explanation: 'The try block throws `RuntimeException("T")`. When closing `Broken`, `RuntimeException("C")` is thrown. The primary exception is `"T"`, and `"C"` is added to `"T"` as a suppressed exception. `e.getMessage()` is `"T"` and `e.getSuppressed().length` is 1. Output is `T:1`.',
      optionNotes: {
        '0': 'Correct: primary exception T with 1 suppressed exception.',
        '1': 'T is the primary exception, not C.',
        '2': 'Suppressed exception exists.',
        '3': 'C is not primary.',
        '4': 'Completely valid try-with-resources code.'
      },
      verify: {
        files: {
          'Broken.java': `public class Broken implements AutoCloseable {
  public void close() { throw new RuntimeException("C"); }
}`,
          'TestEx.java': `public class TestEx {
  public static void main(String[] args) {
    try {
      try (Broken b = new Broken()) {
        throw new RuntimeException("T");
      }
    } catch (Exception e) {
      System.out.print(e.getMessage() + ":" + e.getSuppressed().length);
    }
  }
}`
        },
        expect: { output: 'T:1' }
      }
    },
    {
      id: 'ch11-q10', type: 'single', difficulty: 'medium', objectiveIds: ['4'], tags: ['try-with-resources', 'effective-final'],
      question: 'Which of the following is legal in a try-with-resources header in Java 17?',
      code: null,
      options: [
        'An existing variable that is modified after the try block',
        'An existing variable that is effectively final and implements AutoCloseable',
        'A variable that does not implement AutoCloseable if marked final',
        'Multiple resources separated by commas without semicolons',
        'A resource of type Object'
      ],
      answer: [1],
      explanation: 'In Java 9+, existing variables may be used in a try-with-resources statement provided they implement `AutoCloseable` and are `final` or effectively final. Multiple resources in the header must be separated by semicolons `;`.',
      optionNotes: {
        '0': 'Variable must remain effectively final; modifying it after the try block causes a compile error.',
        '1': 'Correct: effectively final AutoCloseable variables can be passed directly.',
        '2': 'Must implement AutoCloseable.',
        '3': 'Resources must be separated by semicolons, not commas.',
        '4': 'Object does not implement AutoCloseable.'
      },
      verify: null
    }
  ],

  checklist: [
    'I know the Throwable hierarchy: Error (unchecked), RuntimeException (unchecked), and checked Exceptions.',
    'I know finally always executes unless System.exit() is called, and return in finally overrides try/catch returns.',
    'I know multi-catch exception types must be disjoint, and the multi-catch parameter is final.',
    'I know try-with-resources closes resources in reverse order of declaration before catch/finally blocks run.',
    'I know AutoCloseable.close() throws Exception, while Closeable.close() throws IOException.',
    'I know primary exceptions in try-with-resources suppress exceptions thrown by close() (e.getSuppressed()).',
    'I know ResourceBundle fallback lookup order (language_country -> language -> default_language_country -> default_language -> base).',
    'I know NumberFormat.parse() throws checked ParseException and stops at invalid characters without throwing.',
    'I know the logging level hierarchy: SEVERE > WARNING > INFO (default) > CONFIG > FINE > FINER > FINEST.',
    'I know how to create custom checked vs unchecked exceptions.'
  ]
});
