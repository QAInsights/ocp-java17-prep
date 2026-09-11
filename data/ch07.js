OCP.registerChapter({
  id: 7,
  slug: 'beyond-classes',
  title: 'Beyond Classes',
  objectiveIds: ['3a', '3e', '3f', '3g'],
  intro: `Objectives **3a** (nested classes), **3e** (sealed classes and interfaces), **3f** (interfaces, default/static/private methods), and **3g** (enums). Chapter 7 covers Java's advanced type system: interfaces with their modern method types, sealed classes and records (two of the most heavily tested modern Java 17 additions to 1Z0-829), rich enums with constructors and abstract methods, and the four varieties of nested classes (inner, static nested, local, and anonymous).`,

  notes: [
    {
      id: 'interfaces',
      title: 'Interfaces and modern interface methods',
      md: `## Interface fundamentals

* Declared with \`interface\`. Cannot be instantiated directly.
* Can extend any number of other interfaces using \`extends\` (never \`implements\`).
* All interface fields are implicitly **\`public static final\`** (constants). Omitting modifiers still makes them constant. They must be initialized upon declaration.

## Four types of interface methods

| Method type | Implicit modifiers | Has body? | Inherited by class? | Overridable? |
|---|---|---|---|---|
| **Abstract** | \`public abstract\` | No (\`;\`) | Yes | Yes (must implement) |
| **Default** | \`public\` | Yes (\`{}\`) | Yes | Yes (optional) |
| **Static** | \`public\` | Yes (\`{}\`) | **NO** | No |
| **Private** | \`private\` | Yes (\`{}\`) | No | No |
| **Private static** | \`private static\` | Yes (\`{}\`) | No | No |

### Default methods
* Marked with keyword \`default\`. Can only appear in interfaces.
* Provide a default implementation for implementing classes.
* Cannot be marked \`abstract\`, \`final\`, or \`static\`.

### Static interface methods
* **Not inherited** by implementing classes or subinterfaces!
* Must be invoked using the interface name: \`MyInterface.myStaticMethod()\`.
* Calling via implementing class or instance reference (\`MyClass.myStaticMethod()\` or \`instance.myStaticMethod()\`) is a **compile-time error**.

### Private interface methods (Java 9+)
* Used as helper methods to avoid code duplication across default or static methods.
* Non-static \`private\` methods can be called by default methods and other private methods.
* \`private static\` methods can be called by static, default, and private methods.

### Multiple inheritance and diamond conflicts
* If a class implements two interfaces that declare default methods with the **same signature**, the code will **not compile** unless the class explicitly overrides the method.
* Within the override, the class can select a specific default implementation using:
  \`InterfaceA.super.methodName();\`.`
    },
    {
      id: 'enums',
      title: 'Enums with fields, methods, and constructors',
      md: `## Enum basics

* Declared with \`enum\`. Implicitly extends \`java.lang.Enum\`.
* Cannot extend another class (\`extends Class\` is illegal), but can \`implements\` interfaces.
* Cannot be directly instantiated with \`new\` – doing so is a compile error.
* Enum values are fixed, immutable instances initialized once when the enum class is loaded.

## Enum members and syntax rules
* Semicolon \`;\` after constants is **optional** only if the enum contains nothing else. If any field, constructor, or method is declared, the constant list **must end with a semicolon**.
* Enum constants **must appear first**, before any fields or methods.
* **Constructors**:
  * Always implicitly \`private\`.
  * Can be explicitly marked \`private\` (or package-private).
  * Marking an enum constructor \`public\` or \`protected\` is a **compile-time error**!
  * Constructor runs once for each enum constant when the enum is loaded.

## Built-in enum methods
* \`values()\`: returns an array of constants in declared order.
* \`valueOf(String name)\`: returns the constant matching the exact string name; throws \`IllegalArgumentException\` if not found.
* \`name()\`: returns the exact constant name as a \`String\`.
* \`ordinal()\`: returns the 0-based integer index of declaration order.

## Enums with abstract methods
An enum can declare an \`abstract\` method. Every enum constant **must implement** the abstract method in a constant-specific class body:

\`\`\`java
public enum Operation {
  PLUS {
    public int apply(int a, int b) { return a + b; }
  },
  MINUS {
    public int apply(int a, int b) { return a - b; }
  };
  public abstract int apply(int a, int b);
}
\`\`\`

## Enums in switch
* When switching on an enum, the case labels must be the **unqualified** name:
  \`case PLUS:\` ✓
  \`case Operation.PLUS:\` ✗ (Compile-time error!)`
    },
    {
      id: 'sealed-types',
      title: 'Sealed classes and interfaces',
      md: `## Why sealed classes?
Introduced in Java 17 to restrict which other classes or interfaces may extend or implement them.

## Syntax
\`\`\`java
public sealed class Shape permits Circle, Square, Triangle {}
\`\`\`

* The \`permits\` clause lists all allowed direct subclasses.
* If the sealed class and its subclasses are in the **same source file**, the \`permits\` clause is **optional** (the compiler infers it).
* Subclasses permitted by a sealed class must use **one and only one** of three modifiers:
  1. \`final\`: cannot be subclassed further.
  2. \`sealed\`: further restricts its own hierarchy with a new \`permits\` clause.
  3. \`non-sealed\`: opens the hierarchy back up for unrestricted subclassing.

## Rules for permitted subclasses
1. Permitted classes must **directly extend** the sealed class (or implement the sealed interface).
2. Permitted classes must reside in the **same package** (or the same named module).
3. Every permitted subclass must exist and compile.

## Sealed interfaces
* An interface can be \`sealed\`: \`public sealed interface Driveable permits Car, Truck {}\`.
* A permitted subtype can be a class or another interface.
* An interface extending a sealed interface can be \`sealed\` or \`non-sealed\`.
* **Important**: An interface can **never be \`final\`**! Marking an interface \`final\` is an immediate compile error.`
    },
    {
      id: 'records',
      title: 'Records: compact, canonical, and custom constructors',
      md: `## What is a record?
A \`record\` is an immutable data carrier introduced in Java 16/17:

\`\`\`java
public record User(String name, int age) {}
\`\`\`

The compiler automatically provides:
* \`private final\` fields for each component.
* Public accessor methods matching component names: \`name()\` and \`age()\` (**no \`get\` prefix**!).
* Canonical constructor assigning all components.
* \`equals()\`, \`hashCode()\`, and \`toString()\`.

## Record restrictions
* Records are **implicitly \`final\`** – they cannot be extended.
* Records **cannot extend any class** (they implicitly extend \`java.lang.Record\`).
* Records **can implement interfaces**.
* Records **cannot declare instance fields**:
  \`\`\`java
  public record Point(int x, int y) {
    int z; // DOES NOT COMPILE
    static int count; // COMPILES (static fields allowed)
  }
  \`\`\`

## Constructors in records

### 1. Compact constructor
Has **no parameter list** and no parentheses. Runs before component assignments. You can validate or normalize parameters by modifying the parameter variables directly:

\`\`\`java
public record Range(int low, int high) {
  public Range { // compact: no (int low, int high)
    if (low > high) throw new IllegalArgumentException();
    // Do NOT assign this.low = low; it is done implicitly!
  }
}
\`\`\`

### 2. Canonical constructor
Explicitly lists all components. Must assign every component field:
\`\`\`java
public record Range(int low, int high) {
  public Range(int low, int high) {
    if (low > high) throw new IllegalArgumentException();
    this.low = low;
    this.high = high;
  }
}
\`\`\`

### 3. Custom (overloaded) constructors
Must delegate to the canonical constructor via \`this(...)\`:
\`\`\`java
public record Point(int x, int y) {
  public Point() {
    this(0, 0); // must call canonical constructor
  }
}
\`\`\``
    },
    {
      id: 'nested-classes',
      title: 'The four varieties of nested classes',
      md: `## 1. Inner class (member inner class)
* Non-static member of an enclosing class.
* Has access to all members of enclosing class, including \`private\` members.
* Must be instantiated with an enclosing instance:
  \`\`\`java
  Outer outer = new Outer();
  Outer.Inner inner = outer.new Inner();
  \`\`\`
* Referring to outer instance: \`Outer.this.field\`.

## 2. Static nested class
* Declared \`static\` inside another class.
* Can be instantiated without an instance of the outer class:
  \`Outer.Nested n = new Outer.Nested();\`
* Can only directly access \`static\` members of the outer class. Access to instance members requires an explicit reference.

## 3. Local class
* Defined inside a method body or block.
* Scope is limited to the declaring block.
* Can access method local variables **only if they are \`final\` or effectively final**.

## 4. Anonymous class
* A local class without a name, declared and instantiated in a single expression:
  \`\`\`java
  Runnable r = new Runnable() {
    public void run() { System.out.println("Running"); }
  };
  \`\`\`
* Can extend one class OR implement one interface (never both).
* Cannot have an explicit constructor (it has no name).
* Can access enclosing variables if effectively final.`
    }
  ],

  gotchas: [
    { title: 'Interface fields are constants', md: 'Every variable in an interface is implicitly `public static final`. You cannot declare a private, protected, or non-final field in an interface.' },
    { title: 'Static interface methods are not inherited', md: 'Static methods on an interface can only be called using the interface name: `Flyable.fly()`. Calling `Bird.fly()` or `birdInstance.fly()` does not compile.' },
    { title: 'Conflicting default methods', md: 'If two interfaces have default methods with identical signatures, implementing both without overriding produces a compile-time error.' },
    { title: 'Default method calling super interface', md: 'To call an overridden default method from an interface: `InterfaceName.super.methodName()`. Just writing `super.methodName()` looks in the superclass, not the interface!' },
    { title: 'Enum constructor visibility', md: 'Enum constructors are `private`. Declaring an enum constructor `public` or `protected` is an immediate compile error.' },
    { title: 'Enum in switch labels', md: 'Switch case labels for enums MUST be unqualified: `case SPRING:` compiles, while `case Season.SPRING:` fails to compile.' },
    { title: 'Enum values() vs valueOf()', md: '`values()` returns an array. `valueOf("NAME")` takes the exact case-sensitive string name and throws `IllegalArgumentException` if not found.' },
    { title: 'Sealed classes must specify permits', md: 'A sealed class must have permitted subclasses. Subclasses must be `final`, `sealed`, or `non-sealed`.' },
    { title: 'Interfaces cannot be final', md: 'A permitted subinterface of a sealed interface can be `sealed` or `non-sealed`, but **never `final`**.' },
    { title: 'Records cannot declare instance fields', md: 'Records can only have static fields. Declaring an instance field inside a record body is a compile error.' },
    { title: 'Record accessor names', md: 'Record accessors match component names directly: `point.x()`, NOT `point.getX()`.' },
    { title: 'Compact constructor does not use parentheses', md: 'A compact constructor is `public MyRecord { ... }` with NO parameter list. Assigning `this.x = x;` inside a compact constructor is a compile error.' },
    { title: 'Local class accessing local variables', md: 'Local and anonymous classes can only access local variables from the enclosing method if they are `final` or effectively final (never modified after assignment).' },
    { title: 'Outer instance syntax for inner class', md: 'To instantiate an inner class outside the outer class: `outerInstance.new InnerClass()`. Writing `new Outer.Inner()` works only for `static` nested classes.' },
    { title: 'Outer this reference', md: 'To refer to the outer instance from inside an inner class: `Outer.this`, not `this.Outer`.' },
    { title: 'Anonymous class constructors', md: 'Anonymous classes cannot define constructors because they have no name; they can only use instance initializers.' },
    { title: 'Sealed class permitted subclass location', md: 'Permitted subclasses must reside in the same package (or same named module) as the sealed class.' },
    { title: 'Record cannot extend classes', md: 'A record cannot extend any class because it already implicitly extends `java.lang.Record`. It can, however, implement interfaces.' }
  ],

  traps: [
    {
      code: `interface A {
  default void show() { System.out.print("A "); }
}
interface B {
  default void show() { System.out.print("B "); }
}
class C implements A, B {
  public void show() {
    A.super.show();
    System.out.print("C ");
  }
  public static void main(String[] args) {
    new C().show();
  }
}`,
      prompt: 'What does this code print?',
      answer: 'Prints **`A C `**. Because both `A` and `B` have default `show()` methods, `C` must override `show()`. `A.super.show()` invokes `A`\'s default implementation.',
      verify: {
        files: {
          'C.java': `interface A {
  default void show() { System.out.print("A "); }
}
interface B {
  default void show() { System.out.print("B "); }
}
public class C implements A, B {
  public void show() {
    A.super.show();
    System.out.print("C ");
  }
  public static void main(String[] args) {
    new C().show();
  }
}`
        },
        expect: { output: 'A C ' }
      }
    },
    {
      code: `interface Walk {
  static void run() { System.out.print("Walk "); }
}
class Dog implements Walk {}
public class Main {
  public static void main(String[] args) {
    Dog.run();
  }
}`,
      prompt: 'Does this code compile?',
      answer: '**Does not compile.** Static interface methods are NOT inherited by implementing classes. It must be invoked as `Walk.run()`.',
      verify: {
        files: {
          'Main.java': `interface Walk { static void run() {} }
class Dog implements Walk {}
public class Main {
  public static void main(String[] args) {
    Dog.run();
  }
}`
        },
        expect: 'compile-error'
      }
    },
    {
      code: `public record Point(int x, int y) {
  public Point {
    if (x < 0) x = 0;
    if (y < 0) y = 0;
  }
  public static void main(String[] args) {
    Point p = new Point(-5, 10);
    System.out.print(p.x() + " " + p.y());
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`0 10`**. In a compact constructor, the parameters `x` and `y` are modified before the compiler\'s implicit component assignment takes place.',
      verify: {
        files: {
          'Point.java': `public record Point(int x, int y) {
  public Point {
    if (x < 0) x = 0;
    if (y < 0) y = 0;
  }
  public static void main(String[] args) {
    Point p = new Point(-5, 10);
    System.out.print(p.x() + " " + p.y());
  }
}`
        },
        expect: { output: '0 10' }
      }
    },
    {
      code: `enum Season {
  WINTER, SPRING;
}
public class SwitchTest {
  public static void main(String[] args) {
    Season s = Season.WINTER;
    switch (s) {
      case Season.WINTER -> System.out.print("Cold");
      default -> System.out.print("Other");
    }
  }
}`,
      prompt: 'Does this code compile?',
      answer: '**Does not compile.** In a switch statement or expression, enum case labels must be **unqualified** (`case WINTER ->`, not `case Season.WINTER ->`).',
      verify: {
        files: {
          'SwitchTest.java': `enum Season { WINTER, SPRING; }
public class SwitchTest {
  public static void main(String[] args) {
    Season s = Season.WINTER;
    switch (s) {
      case Season.WINTER -> System.out.print("Cold");
      default -> System.out.print("Other");
    }
  }
}`
        },
        expect: 'compile-error'
      }
    },
    {
      code: `public class Outer {
  private int x = 10;
  class Inner {
    private int x = 20;
    void print() {
      int x = 30;
      System.out.print(x + " " + this.x + " " + Outer.this.x);
    }
  }
  public static void main(String[] args) {
    new Outer().new Inner().print();
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`30 20 10`**. `x` is the local variable (30), `this.x` is the inner class instance variable (20), and `Outer.this.x` is the outer class instance variable (10).',
      verify: {
        files: {
          'Outer.java': `public class Outer {
  private int x = 10;
  class Inner {
    private int x = 20;
    void print() {
      int x = 30;
      System.out.print(x + " " + this.x + " " + Outer.this.x);
    }
  }
  public static void main(String[] args) {
    new Outer().new Inner().print();
  }
}`
        },
        expect: { output: '30 20 10' }
      }
    },
    {
      code: `sealed interface Flyable permits Bird {}
final class Bird implements Flyable {}`,
      prompt: 'Is this declaration legal in the same source file?',
      answer: '**Yes, it compiles.** A sealed interface can permit a class, and that class must implement the interface with one of the allowed modifiers (`final`, `sealed`, or `non-sealed`).'
    },
    {
      code: `public record Car(String vin, String model) {
  int wheels = 4;
}`,
      prompt: 'Does this record definition compile?',
      answer: '**Does not compile.** Records cannot declare instance fields (`int wheels = 4;`). Only static fields are permitted.',
      verify: {
        files: {
          'Car.java': `public record Car(String vin, String model) {
  int wheels = 4;
}`
        },
        expect: 'compile-error'
      }
    }
  ],

  questions: [
    {
      id: 'ch07-q01', type: 'single', difficulty: 'easy', objectiveIds: ['3f'], tags: ['interface', 'modifiers'],
      question: 'Which of the following field declarations inside an interface is NOT equivalent to `public static final int MAX = 100;`?',
      code: null,
      options: [
        'int MAX = 100;',
        'public int MAX = 100;',
        'static final int MAX = 100;',
        'final int MAX = 100;',
        'private static final int MAX = 100;'
      ],
      answer: [4],
      explanation: 'All fields in an interface are implicitly `public static final`. Declaring a field `private` in an interface produces a compile error. The first four options are all equivalent because omitted modifiers default to public static final.',
      optionNotes: {
        '0': 'Equivalent: implicitly public static final.',
        '1': 'Equivalent: static and final are implicit.',
        '2': 'Equivalent: public is implicit.',
        '3': 'Equivalent: public and static are implicit.',
        '4': 'Not equivalent and does not compile: interface fields cannot be private.'
      },
      verify: null
    },
    {
      id: 'ch07-q02', type: 'single', difficulty: 'medium', objectiveIds: ['3f'], tags: ['interface', 'static-methods'],
      question: 'What is the output?',
      code: `interface Device {
  static void reset() { System.out.print("DeviceReset "); }
  default void start() {
    reset();
    System.out.print("DeviceStart ");
  }
}
class Phone implements Device {
  public static void reset() { System.out.print("PhoneReset "); }
}
public class Runner {
  public static void main(String[] args) {
    Phone p = new Phone();
    p.start();
    Phone.reset();
  }
}`,
      options: [
        'DeviceReset DeviceStart PhoneReset ',
        'PhoneReset DeviceStart PhoneReset ',
        'DeviceStart PhoneReset ',
        'Compile error: reset() is ambiguous in start()',
        'Compile error: static interface methods cannot be called from default methods'
      ],
      answer: [0],
      explanation: 'Inside `Device.start()`, `reset()` calls `Device.reset()` directly. When `Phone.reset()` is called, it calls `Phone`\'s own static method. Interface static methods are never inherited by implementing classes. Output is `DeviceReset DeviceStart PhoneReset `.',
      optionNotes: {
        '0': 'Correct: default method calls Device.reset(); Phone.reset() calls Phone\'s own static method.',
        '1': 'Phone.reset does not override Device.reset.',
        '2': 'reset() in start() executes and prints DeviceReset.',
        '3': 'No ambiguity: in Device, reset() refers to Device.reset().',
        '4': 'Default methods can invoke static methods declared in the same interface.'
      },
      verify: {
        files: {
          'Device.java': `public interface Device {
  static void reset() { System.out.print("DeviceReset "); }
  default void start() {
    reset();
    System.out.print("DeviceStart ");
  }
}`,
          'Phone.java': `public class Phone implements Device {
  public static void reset() { System.out.print("PhoneReset "); }
}`,
          'Runner.java': `public class Runner {
  public static void main(String[] args) {
    Phone p = new Phone();
    p.start();
    Phone.reset();
  }
}`
        },
        expect: { output: 'DeviceReset DeviceStart PhoneReset ' }
      }
    },
    {
      id: 'ch07-q03', type: 'single', difficulty: 'medium', objectiveIds: ['3g'], tags: ['enum', 'constructor'],
      question: 'What happens when compiling and executing the following enum definition?',
      code: `public enum Color {
  RED("Warm"), BLUE("Cool");
  private final String type;
  Color(String type) {
    this.type = type;
  }
  public String getType() { return type; }
  public static void main(String[] args) {
    System.out.print(Color.RED.ordinal() + " " + Color.BLUE.getType());
  }
}`,
      options: [
        'Prints: 0 Cool',
        'Prints: 1 Cool',
        'Prints: RED Cool',
        'Compile error: enum constructors must be public',
        'Compile error: enums cannot have a main method'
      ],
      answer: [0],
      explanation: 'Enum constructors are implicitly private. `ordinal()` returns the 0-based index of the constant in declaration order (`RED` is at index 0). `BLUE.getType()` returns `"Cool"`. Enums can declare methods, fields, constructors, and `main()`.',
      optionNotes: {
        '0': 'Correct: RED is at ordinal 0, BLUE type is Cool.',
        '1': 'Ordinal is 0-indexed, not 1-indexed.',
        '2': 'name() returns RED; ordinal() returns 0.',
        '3': 'Enum constructors cannot be public (must be private or package-private).',
        '4': 'Enums can contain a main method.'
      },
      verify: {
        files: {
          'Color.java': `public enum Color {
  RED("Warm"), BLUE("Cool");
  private final String type;
  Color(String type) {
    this.type = type;
  }
  public String getType() { return type; }
  public static void main(String[] args) {
    System.out.print(Color.RED.ordinal() + " " + Color.BLUE.getType());
  }
}`
        },
        expect: { output: '0 Cool' }
      }
    },
    {
      id: 'ch07-q04', type: 'multi', difficulty: 'medium', objectiveIds: ['3e'], tags: ['sealed-classes', 'rules'],
      question: 'Which modifiers are allowed on a direct subclass of a sealed class? (Choose all that apply.)',
      code: null,
      options: ['final', 'sealed', 'non-sealed', 'abstract', 'open'],
      answer: [0, 1, 2],
      explanation: 'Every direct subclass of a sealed class must declare exactly one of three modifiers: `final`, `sealed`, or `non-sealed`. While an abstract class may also be `sealed` or `non-sealed`, `abstract` alone without one of the three is illegal. `open` is a module directive, not a class modifier.',
      optionNotes: {
        '0': 'Allowed: ends extension hierarchy.',
        '1': 'Allowed: continues restricted hierarchy.',
        '2': 'Allowed: re-opens class to arbitrary subclassing.',
        '3': 'An abstract subclass must still specify sealed or non-sealed.',
        '4': 'open is not a class modifier.'
      },
      verify: null
    },
    {
      id: 'ch07-q05', type: 'single', difficulty: 'medium', objectiveIds: ['3e'], tags: ['sealed-interfaces'],
      question: 'What is wrong with the following sealed interface hierarchy?',
      code: `sealed interface Media permits Audio, Video {}
final interface Audio extends Media {}
non-sealed interface Video extends Media {}`,
      options: [
        'Nothing is wrong; it compiles.',
        'Compile error: Audio cannot be final because interfaces cannot be final.',
        'Compile error: Video cannot be non-sealed.',
        'Compile error: Media must be a class, not an interface.',
        'Compile error: Audio must implement Media, not extend it.'
      ],
      answer: [1],
      explanation: 'In Java, an interface can NEVER be declared `final`. A subinterface extending a sealed interface can only be `sealed` or `non-sealed`.',
      optionNotes: {
        '0': 'Fails to compile because Audio is marked final.',
        '1': 'Correct: interfaces can never be declared final.',
        '2': 'Video being non-sealed is completely legal.',
        '3': 'Interfaces can be sealed.',
        '4': 'Interfaces extend other interfaces using extends.'
      },
      verify: {
        files: {
          'Test.java': `sealed interface Media permits Audio, Video {}
final interface Audio extends Media {}
non-sealed interface Video extends Media {}`
        },
        expect: 'compile-error'
      }
    },
    {
      id: 'ch07-q06', type: 'single', difficulty: 'hard', objectiveIds: ['3b'], tags: ['records', 'constructors'],
      question: 'Consider the record below. Which line causes a compile error?',
      code: `public record Transaction(String id, double amount) {
  public Transaction {                           // line 1
    if (amount < 0) amount = 0.0;                // line 2
    this.id = id;                                // line 3
  }
}`,
      options: ['line 1', 'line 2', 'line 3', 'line 2 and line 3', 'None; it compiles'],
      answer: [2],
      explanation: 'Line 3 causes a compile error. In a compact constructor, the compiler automatically assigns the component parameters to the instance fields after the constructor block finishes. Explicitly assigning to `this.id` or `this.amount` inside a compact constructor is illegal.',
      optionNotes: {
        '0': 'Line 1 is valid compact constructor syntax.',
        '1': 'Line 2 modifies the constructor parameter before implicit assignment.',
        '2': 'Correct: explicit field assignment (this.id = id) is forbidden in compact constructors.',
        '3': 'Line 2 is valid.',
        '4': 'Line 3 causes a compilation error.'
      },
      verify: {
        files: {
          'Transaction.java': `public record Transaction(String id, double amount) {
  public Transaction {
    if (amount < 0) amount = 0.0;
    this.id = id;
  }
}`
        },
        expect: 'compile-error'
      }
    },
    {
      id: 'ch07-q07', type: 'single', difficulty: 'medium', objectiveIds: ['3b'], tags: ['records', 'accessors'],
      question: 'Given the record `public record Student(String name, int grade) {}`, how do you access the student\'s name from an instance `s`?',
      code: null,
      options: [
        's.name()',
        's.getName()',
        's.name',
        's.get("name")',
        'Student.name(s)'
      ],
      answer: [0],
      explanation: 'Record component accessors match the component name directly with empty parentheses: `s.name()`. There is no `getName()` method generated unless explicitly written.',
      optionNotes: {
        '0': 'Correct: accessor method name matches the record component.',
        '1': 'No get prefix is generated by default.',
        '2': 'Direct field access is not allowed from outside the record (fields are private).',
        '3': 'Not a map method.',
        '4': 'Accessors are instance methods, not static.'
      },
      verify: null
    },
    {
      id: 'ch07-q08', type: 'single', difficulty: 'hard', objectiveIds: ['3a'], tags: ['nested-classes', 'inner-class'],
      question: 'What is the output?',
      code: `public class Outer {
  private int val = 5;
  class Inner {
    void print() {
      System.out.print(val + " ");
    }
  }
  public static void main(String[] args) {
    Outer o = new Outer();
    Inner i = o.new Inner();
    o.val = 15;
    i.print();
  }
}`,
      options: ['5 ', '15 ', '0 ', 'Compile error at line: Inner i = o.new Inner();', 'Runtime exception'],
      answer: [1],
      explanation: 'The inner class instance maintains a hidden reference to the enclosing `Outer` instance. Modifying `o.val = 15` affects the same object that `i` accesses. Output is `15 `.',
      optionNotes: {
        '0': 'Inner class holds a live reference to the outer instance, not a snapshot copy.',
        '1': 'Correct: val was mutated to 15.',
        '2': 'val is 15.',
        '3': 'Syntax o.new Inner() is the standard way to instantiate an inner class.',
        '4': 'Executes without error.'
      },
      verify: {
        files: {
          'Outer.java': `public class Outer {
  private int val = 5;
  class Inner {
    void print() {
      System.out.print(val + " ");
    }
  }
  public static void main(String[] args) {
    Outer o = new Outer();
    Inner i = o.new Inner();
    o.val = 15;
    i.print();
  }
}`
        },
        expect: { output: '15 ' }
      }
    },
    {
      id: 'ch07-q09', type: 'single', difficulty: 'medium', objectiveIds: ['3a'], tags: ['nested-classes', 'static-nested'],
      question: 'How do you instantiate a public static nested class `Nested` inside class `Outer` from outside the class?',
      code: null,
      options: [
        'Outer.Nested n = new Outer.Nested();',
        'Outer.Nested n = new Outer().new Nested();',
        'Outer.Nested n = Outer.new Nested();',
        'Nested n = Outer.createNested();',
        'Outer.Nested n = new Nested();'
      ],
      answer: [0],
      explanation: 'A static nested class does not require an enclosing outer instance. It is instantiated like any top-level class qualified by its outer class name: `new Outer.Nested()`.',
      optionNotes: {
        '0': 'Correct: standard static nested class instantiation.',
        '1': 'This is the syntax for non-static inner classes, not static nested classes.',
        '2': 'Invalid Java syntax.',
        '3': 'Only if a custom factory method exists.',
        '4': 'Requires an import; without import, Outer.Nested is required.'
      },
      verify: null
    },
    {
      id: 'ch07-q10', type: 'single', difficulty: 'medium', objectiveIds: ['3a'], tags: ['local-classes', 'effectively-final'],
      question: 'Which line in the method below causes a compile error?',
      code: `public void compute(int factor) {
  int offset = 10;                     // line 1
  offset = 20;                         // line 2
  class LocalCalc {
    int calc() {
      return factor * offset;          // line 3
    }
  }
  System.out.println(new LocalCalc().calc());
}`,
      options: ['line 1', 'line 2', 'line 3', 'line 2 and line 3', 'None; it compiles'],
      answer: [2],
      explanation: 'Local classes can only access local variables from the enclosing method if they are `final` or effectively final. Because `offset` is reassigned on line 2, it is not effectively final. Attempting to use `offset` on line 3 causes a compile error: "local variables referenced from an inner class must be final or effectively final".',
      optionNotes: {
        '0': 'Declaration is fine.',
        '1': 'Reassignment is legal in standard method code.',
        '2': 'Correct: using a non-effectively final variable inside a local class fails to compile.',
        '3': 'Line 2 itself is valid Java; the error occurs where the variable is referenced inside the local class.',
        '4': 'Fails to compile at line 3.'
      },
      verify: {
        files: {
          'Test.java': `public class Test {
  public void compute(int factor) {
    int offset = 10;
    offset = 20;
    class LocalCalc {
      int calc() {
        return factor * offset;
      }
    }
    System.out.println(new LocalCalc().calc());
  }
}`
        },
        expect: 'compile-error'
      }
    },
    {
      id: 'ch07-q11', type: 'single', difficulty: 'easy', objectiveIds: ['3g'], tags: ['enum', 'values'],
      question: 'What is the output?',
      code: `enum Direction {
  NORTH, SOUTH, EAST, WEST;
}
public class Compass {
  public static void main(String[] args) {
    System.out.print(Direction.valueOf("SOUTH").ordinal());
  }
}`,
      options: ['1', '2', 'SOUTH', '0', 'Throws IllegalArgumentException'],
      answer: [0],
      explanation: '`Direction.valueOf("SOUTH")` returns `Direction.SOUTH`. Its ordinal position in declaration order is 1 (NORTH is 0, SOUTH is 1).',
      optionNotes: {
        '0': 'Correct: SOUTH is at index 1.',
        '1': 'EAST is at index 2.',
        '2': 'name() returns SOUTH; ordinal() returns the integer index.',
        '3': 'NORTH is 0.',
        '4': 'String matches exact constant name, so no exception is thrown.'
      },
      verify: {
        files: {
          'Compass.java': `enum Direction { NORTH, SOUTH, EAST, WEST; }
public class Compass {
  public static void main(String[] args) {
    System.out.print(Direction.valueOf("SOUTH").ordinal());
  }
}`
        },
        expect: { output: '1' }
      }
    },
    {
      id: 'ch07-q12', type: 'single', difficulty: 'medium', objectiveIds: ['3f'], tags: ['interface', 'private-methods'],
      question: 'Which statement about private interface methods is FALSE?',
      code: null,
      options: [
        'A private interface method can be static.',
        'A private interface method can be called from default methods in the same interface.',
        'A private interface method is inherited by implementing classes.',
        'A private interface method must have a body.',
        'A private static interface method can be called from static methods in the same interface.'
      ],
      answer: [2],
      explanation: 'Private interface methods are internal helpers within the interface and are NEVER inherited by implementing classes or subinterfaces.',
      optionNotes: {
        '0': 'True: private static interface methods are allowed.',
        '1': 'True: private instance methods can be called by default methods.',
        '2': 'False (this is the correct answer): private methods are never inherited.',
        '3': 'True: private methods cannot be abstract and must have a body.',
        '4': 'True: private static methods can be called by static and default methods.'
      },
      verify: null
    },
    {
      id: 'ch07-q13', type: 'single', difficulty: 'hard', objectiveIds: ['3g'], tags: ['enum', 'abstract-method'],
      question: 'What is the output?',
      code: `enum Grade {
  PASS {
    public String message() { return "Well done"; }
  },
  FAIL {
    public String message() { return "Try again"; }
  };
  public abstract String message();
}
public class School {
  public static void main(String[] args) {
    for (Grade g : Grade.values()) {
      System.out.print(g + ":" + g.message() + " ");
    }
  }
}`,
      options: [
        'PASS:Well done FAIL:Try again ',
        'PASS FAIL ',
        'Well done Try again ',
        'Compile error: enums cannot have abstract methods',
        'Compile error: Grade must be declared abstract'
      ],
      answer: [0],
      explanation: 'Enums can declare abstract methods as long as each constant implements it in its own constant-specific body. The enum itself is not explicitly marked `abstract` (doing so is illegal). Output is `PASS:Well done FAIL:Try again `.',
      optionNotes: {
        '0': 'Correct: iterates constants and invokes the overridden message() method.',
        '1': 'message() is also printed.',
        '2': 'g prints the constant name.',
        '3': 'Enums can declare abstract methods.',
        '4': 'Enums cannot be explicitly marked abstract.'
      },
      verify: {
        files: {
          'School.java': `enum Grade {
  PASS {
    public String message() { return "Well done"; }
  },
  FAIL {
    public String message() { return "Try again"; }
  };
  public abstract String message();
}
public class School {
  public static void main(String[] args) {
    for (Grade g : Grade.values()) {
      System.out.print(g + ":" + g.message() + " ");
    }
  }
}`
        },
        expect: { output: 'PASS:Well done FAIL:Try again ' }
      }
    },
    {
      id: 'ch07-q14', type: 'multi', difficulty: 'medium', objectiveIds: ['3b'], tags: ['records', 'rules'],
      question: 'Which of the following are valid inside a record declaration? (Choose all that apply.)',
      code: null,
      options: [
        'static int counter = 0;',
        'public static void show() {}',
        'private final int extra = 1;',
        'public void printDetails() {}',
        'abstract void doWork();'
      ],
      answer: [0, 1, 3],
      explanation: 'Records can have static fields (option 0), static methods (option 1), and custom instance methods (option 3). Records CANNOT have instance fields (option 2), and cannot declare abstract methods because records are final (option 4).',
      optionNotes: {
        '0': 'Valid: static fields are allowed.',
        '1': 'Valid: static methods are allowed.',
        '2': 'Invalid: records cannot declare instance fields.',
        '3': 'Valid: custom instance methods are allowed.',
        '4': 'Invalid: records are final and cannot contain abstract methods.'
      },
      verify: null
    },
    {
      id: 'ch07-q15', type: 'single', difficulty: 'hard', objectiveIds: ['3a'], tags: ['anonymous-class', 'scope'],
      question: 'What is the output?',
      code: `interface Greeting {
  void greet();
}
public class Party {
  private String message = "Hello";
  public void celebrate() {
    String punctuation = "!";
    Greeting g = new Greeting() {
      public void greet() {
        System.out.print(message + punctuation + " ");
      }
    };
    message = "Hi";
    g.greet();
  }
  public static void main(String[] args) {
    new Party().celebrate();
  }
}`,
      options: [
        'Hi! ',
        'Hello! ',
        'Compile error: message is not effectively final',
        'Compile error: punctuation is not effectively final',
        'Compile error: anonymous classes cannot access private instance fields'
      ],
      answer: [0],
      explanation: 'The requirement to be effectively final applies ONLY to local variables (like `punctuation`). Instance fields (like `message`) do NOT need to be effectively final. When `g.greet()` is called, `message` has been reassigned to `"Hi"`, so it prints `Hi! `.',
      optionNotes: {
        '0': 'Correct: message is an instance field, so it does not need to be effectively final; it evaluates to "Hi".',
        '1': 'message was changed to "Hi" before g.greet() was invoked.',
        '2': 'Only local variables must be effectively final; fields are not subject to this rule.',
        '3': 'punctuation is never modified, so it is effectively final.',
        '4': 'Anonymous classes have full access to enclosing class instance members, including private ones.'
      },
      verify: {
        files: {
          'Party.java': `interface Greeting { void greet(); }
public class Party {
  private String message = "Hello";
  public void celebrate() {
    String punctuation = "!";
    Greeting g = new Greeting() {
      public void greet() {
        System.out.print(message + punctuation + " ");
      }
    };
    message = "Hi";
    g.greet();
  }
  public static void main(String[] args) {
    new Party().celebrate();
  }
}`
        },
        expect: { output: 'Hi! ' }
      }
    },
    {
      id: 'ch07-q16', type: 'single', difficulty: 'medium', objectiveIds: ['3e'], tags: ['sealed-classes', 'package'],
      question: 'Where must direct permitted subclasses of a sealed class reside if they are not in a named module?',
      code: null,
      options: [
        'In the exact same package as the sealed class',
        'In any subpackage of the sealed class',
        'Anywhere in the same classpath',
        'In the same directory or default package',
        'In any package as long as they import the sealed class'
      ],
      answer: [0],
      explanation: 'If code is in the unnamed module (standard classpath), all permitted direct subclasses of a sealed class MUST be declared in the exact same package. If using named modules, they must be in the same module.',
      optionNotes: {
        '0': 'Correct: same package requirement.',
        '1': 'Subpackages do not satisfy the same-package rule.',
        '2': 'Arbitrary classpath locations are not allowed.',
        '3': 'Must match package declaration.',
        '4': 'Importing does not bypass package restriction.'
      },
      verify: null
    },
    {
      id: 'ch07-q17', type: 'single', difficulty: 'hard', objectiveIds: ['3f'], tags: ['interface', 'multiple-inheritance'],
      question: 'What is the result of compiling this code?',
      code: `interface X {
  default int action() { return 1; }
}
interface Y {
  default String action() { return "2"; }
}
class Z implements X, Y {}`,
      options: [
        'Compiles without error',
        'Compile error: Z inherits unrelated defaults for action() and return types are incompatible',
        'Compiles if Z implements action() returning Object',
        'Compiles if Z marks action() as default',
        'Runtime error when Z is loaded'
      ],
      answer: [1],
      explanation: '`X.action()` returns `int` and `Y.action()` returns `String`. Because the two methods have the identical signature `action()` but incompatible return types (`int` and `String`), it is impossible for class `Z` to override `action()` in a way that satisfies both interfaces. Thus `class Z` produces an unfixable compile error.',
      optionNotes: {
        '0': 'Cannot implement two interfaces with same method name and incompatible return types.',
        '1': 'Correct: incompatible return types make implementation impossible.',
        '2': 'Overriding with Object cannot satisfy int.',
        '3': 'default keyword is illegal in classes.',
        '4': 'Caught at compile time.'
      },
      verify: {
        files: {
          'Test.java': `interface X { default int action() { return 1; } }
interface Y { default String action() { return "2"; } }
class Z implements X, Y {}`
        },
        expect: 'compile-error'
      }
    },
    {
      id: 'ch07-q18', type: 'single', difficulty: 'medium', objectiveIds: ['3b'], tags: ['records', 'canonical-constructor'],
      question: 'Given the record below, what happens when compiling?',
      code: `public record Box(int length, int width) {
  public Box(int length) {
    this.length = length;
    this.width = 10;
  }
}`,
      options: [
        'Compiles without error',
        'Compile error: non-canonical constructor must invoke another constructor via this(...)',
        'Compile error: length is final and cannot be assigned in constructor',
        'Compile error: width is not initialized',
        'Compiles only if marked compact'
      ],
      answer: [1],
      explanation: 'Any non-canonical constructor in a record MUST delegate to the canonical constructor (or another constructor) using `this(...)`. It cannot assign record component fields directly.',
      optionNotes: {
        '0': 'Does not compile.',
        '1': 'Correct: custom constructor must delegate to this(length, 10).',
        '2': 'Fields can be assigned in canonical constructors, but custom constructors must delegate.',
        '3': 'The error is the missing this() delegation call.',
        '4': 'A compact constructor has no parameter list.'
      },
      verify: {
        files: {
          'Box.java': `public record Box(int length, int width) {
  public Box(int length) {
    this.length = length;
    this.width = 10;
  }
}`
        },
        expect: 'compile-error'
      }
    },
    {
      id: 'ch07-q19', type: 'single', difficulty: 'easy', objectiveIds: ['3g'], tags: ['enum', 'switch'],
      question: 'What is the output?',
      code: `enum Level { LOW, MEDIUM, HIGH }
public class Gauge {
  public static void main(String[] args) {
    Level lvl = Level.MEDIUM;
    String res = switch (lvl) {
      case LOW -> "L";
      case MEDIUM -> "M";
      case HIGH -> "H";
    };
    System.out.print(res);
  }
}`,
      options: ['M', 'L', 'H', 'Compile error: missing default branch', 'Compile error: case labels must use Level.LOW'],
      answer: [0],
      explanation: 'When a switch expression covers all constants of an enum, no `default` branch is required (the compiler verifies exhaustiveness). `lvl` is `MEDIUM`, so `"M"` is returned and printed.',
      optionNotes: {
        '0': 'Correct: prints M.',
        '1': 'lvl is MEDIUM.',
        '2': 'lvl is MEDIUM.',
        '3': 'No default is needed when all enum cases are covered.',
        '4': 'Prefixing with enum name is an error; unqualified names are required.'
      },
      verify: {
        files: {
          'Gauge.java': `enum Level { LOW, MEDIUM, HIGH }
public class Gauge {
  public static void main(String[] args) {
    Level lvl = Level.MEDIUM;
    String res = switch (lvl) {
      case LOW -> "L";
      case MEDIUM -> "M";
      case HIGH -> "H";
    };
    System.out.print(res);
  }
}`
        },
        expect: { output: 'M' }
      }
    },
    {
      id: 'ch07-q20', type: 'single', difficulty: 'medium', objectiveIds: ['3a'], tags: ['nested-classes', 'inner-this'],
      question: 'What does this program print?',
      code: `public class TestA {
  String name = "Outer";
  class TestB {
    String name = "Inner";
    void print() {
      System.out.print(TestA.this.name + " " + this.name);
    }
  }
  public static void main(String[] args) {
    new TestA().new TestB().print();
  }
}`,
      options: [
        'Outer Inner',
        'Inner Outer',
        'Outer Outer',
        'Inner Inner',
        'Compile error at TestA.this'
      ],
      answer: [0],
      explanation: '`TestA.this.name` explicitly references the enclosing `Outer` instance variable (`"Outer"`), while `this.name` references the inner class instance variable (`"Inner"`). Prints `Outer Inner`.',
      optionNotes: {
        '0': 'Correct: TestA.this reaches outer; this reaches inner.',
        '1': 'Inverted.',
        '2': 'this.name evaluates to Inner.',
        '3': 'TestA.this.name evaluates to Outer.',
        '4': 'TestA.this is valid syntax.'
      },
      verify: {
        files: {
          'TestA.java': `public class TestA {
  String name = "Outer";
  class TestB {
    String name = "Inner";
    void print() {
      System.out.print(TestA.this.name + " " + this.name);
    }
  }
  public static void main(String[] args) {
    new TestA().new TestB().print();
  }
}`
        },
        expect: { output: 'Outer Inner' }
      }
    }
  ],

  checklist: [
    'I know all interface fields are implicitly public static final and must be initialized.',
    'I know the 4 interface method types: abstract, default, static, and private (including private static).',
    'I know static interface methods are NOT inherited and cannot be called on implementing classes or instances.',
    'I know how to resolve diamond default method collisions and use InterfaceName.super.method().',
    'I know enum constructors are private and declaring them public or protected is a compile error.',
    'I know how to use values(), valueOf(), ordinal(), and name() on enums.',
    'I know enums in switch case labels must be unqualified constant names.',
    'I know sealed classes require permits and direct subclasses must be final, sealed, or non-sealed.',
    'I know interfaces cannot be final, so subinterfaces of a sealed interface must be sealed or non-sealed.',
    'I know records are implicitly final, extend java.lang.Record, and cannot have instance fields.',
    'I know the difference between compact, canonical, and custom constructors in records.',
    'I know how to instantiate inner classes (outer.new Inner()) vs static nested classes (new Outer.Nested()).',
    'I know local and anonymous classes can only access local variables that are final or effectively final.'
  ]
});
