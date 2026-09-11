OCP.registerChapter({
  id: 7,
  slug: 'beyond-classes',
  title: 'Beyond Classes',
  objectiveIds: ['3e', '3f', '3g', '3a'],
  intro: `Interfaces, enums, sealed types, records, and nested types add constraints to ordinary class design. For the exam, separate what is inherited from what is merely available through a type, and separate compile-time selection from runtime dispatch. This chapter revisits polymorphism with interface references, then applies it to default methods, enum declarations, and pattern-safe casts.`,

  notes: [
    {
      id: 'interfaces',
      title: 'Interface members and implementation',
      md: `An interface defines a contract. An interface has no instance state, so fields declared in an interface are implicitly \`public static final\`. They must have an initializer. Interface methods are public unless they are private or static; an abstract method is implicitly public and abstract.

| Interface member | Implicit modifiers |
|---|---|
| Field | \`public static final\` |
| Abstract method | \`public abstract\` |
| Default method | \`public\` |
| Static method | \`public\` |
| Private helper | \`private\` |

An implementing class must provide public implementations for inherited abstract methods. It cannot reduce visibility. A class may implement many interfaces, and an interface may extend many interfaces. Interfaces do not inherit instance fields or constructors.

\`\`\`java
interface Printable {
  int LIMIT = 3;
  default String label() { return "print"; }
  static int twice(int n) { return n * 2; }
  private String suffix() { return "!"; }
}
class Ticket implements Printable {
  public String label() { return "ticket" + suffix(); }
}
\`\`\`

The example's private helper is callable only by code in \`Printable\`; an implementing class cannot call it. Interface static methods are called with the interface name and are not inherited by implementing classes. A class method wins over an interface default with the same signature.`,
    },
    {
      id: 'default-conflicts',
      title: 'Default methods and conflicts',
      md: `A default method supplies an instance implementation, but it does not eliminate the possibility of a conflict. A class method always wins over an interface default. If two unrelated interfaces provide defaults with the same signature, the implementing class must override the method or compilation fails.

\`\`\`java
interface Left { default String side() { return "L"; } }
interface Right { default String side() { return "R"; } }
class Both implements Left, Right {
  public String side() { return Left.super.side() + Right.super.side(); }
}
\`\`\`

The \`InterfaceName.super.method()\` syntax calls a specific direct superinterface default. It may not name an indirect superinterface, and it cannot be used to invoke a static or private interface method.

An abstract class method beats an interface default even if the abstract class does not provide an implementation. The concrete subclass must implement that abstract method. A more specific interface default wins over a less specific inherited default when one interface extends the other. A class can explicitly override a default and delegate to it.`,
    },
    {
      id: 'functional-interfaces',
      title: 'Functional interfaces and polymorphism',
      md: `A functional interface has exactly one abstract method after inherited methods are counted. Methods that match public methods of \`Object\` do not count as additional abstract methods. Default, static, and private methods do not count. \`@FunctionalInterface\` asks the compiler to enforce the rule; it is optional but useful.

\`\`\`java
@FunctionalInterface
interface Converter {
  String convert(int value);
  boolean equals(Object other);
  default String name() { return "converter"; }
}
\`\`\`

An interface reference can hold any object whose class implements the interface. Overridden instance methods dispatch from the object type. Overloaded methods are chosen at compile time from the reference type and argument types.

Pattern matching for \`instanceof\` in Java 17 can bind a variable whose scope is controlled by boolean flow:

\`\`\`java
if (obj instanceof String s && !s.isBlank()) {
  System.out.println(s.length());
}
\`\`\`

The pattern variable is available on the right side of \`&&\` and inside the true branch. With \`||\`, it is not definitely matched on the right side or after the condition because the left side may have been false.`,
    },
    {
      id: 'enums',
      title: 'Enum declarations and behavior',
      md: `An enum declares a fixed set of instances. Its constructors are implicitly private; an enum cannot be instantiated with \`new\`, and an enum cannot extend another class. An enum may implement interfaces, declare fields and methods, and give each constant a class body.

\`\`\`java
enum Level {
  LOW(1), HIGH(2) {
    public String toString() { return "H"; }
  };
  private final int code;
  Level(int code) { this.code = code; }
  int code() { return code; }
}
\`\`\`

The semicolon after the constants is optional when there are no members and required when declarations follow. \`name()\` is the declared identifier, \`ordinal()\` is its zero-based declaration position, and \`toString()\` defaults to the name but can be overridden. \`values()\` returns a new array containing constants in declaration order. \`valueOf(String)\` requires an exact, case-sensitive name and throws \`IllegalArgumentException\` for an unknown name.

In a switch statement or expression over an enum, use unqualified constant names (\`case HIGH\`, not \`Level.HIGH\`. An enum switch should be exhaustive or include \`default\`; Java 17 does not have switch pattern matching.`,
    },
    {
      id: 'records-sealed',
      title: 'Records and sealed interface families',
      md: `Records are final data carriers with generated component fields, accessors, equality, hashing, and text representation. A record can implement an interface, including a sealed interface, but cannot extend an application class. A record component may be generic or a mutable reference, so generated final fields do not imply deep immutability.

Sealed interfaces are useful for a closed family of records:

\`\`\`java
sealed interface Result permits Success, Failure {}
record Success(String value) implements Result {}
record Failure(String message) implements Result {}
\`\`\`

Records are implicitly final, satisfying the permitted-child rule. A permitted class must be in the same package (and named module, when applicable) as its sealed parent. Java 17 supports sealed types and pattern matching for \`instanceof\`, but not final switch pattern matching as a standard feature; do not assume a sealed hierarchy makes a switch automatically exhaustive in Java 17.`,
    },
    {
      id: 'nested-polymorphism',
      title: 'Nested types and type relationships',
      md: `A static nested class is a member type with no enclosing instance. An inner member class is tied to an enclosing object and can access its private members. A local class lives in a block and captures only final or effectively final local variables. Anonymous classes have a body but no declared class name.

An interface reference exposes only members declared by the interface. A cast can expose members of a more specific type, but an invalid downcast throws \`ClassCastException\`. A class can be both a subclass and an implementer; the superclass relationship is single while interface implementation is multiple.

The declared type controls overload resolution and field access. The runtime type controls overridden instance method dispatch. \`final\` methods stop overriding, while private methods are not inherited and static methods are hidden. These rules remain the same when the reference type is an interface.`,
    },
  ],

  gotchas: [
    { title: 'Interface fields are constants', md: 'Interface fields are implicitly public, static, and final and need an initializer.' },
    { title: 'Interface methods are public', md: 'An implementation of an interface abstract or default method cannot reduce public visibility.' },
    { title: 'Interface static methods', md: 'Static interface methods are called through the interface name and are not inherited.' },
    { title: 'Private interface helpers', md: 'Private interface methods are available only inside that interface.' },
    { title: 'Class wins', md: 'A class method wins over an interface default with the same signature.' },
    { title: 'Two defaults conflict', md: 'Unrelated interface defaults with the same signature require a class override.' },
    { title: 'Most specific default', md: 'A subinterface default can override an inherited superinterface default.' },
    { title: 'super default syntax', md: '`Name.super.m()` works only for a direct superinterface default.' },
    { title: 'Abstract class method wins', md: 'An inherited abstract class method beats an interface default and still needs implementation.' },
    { title: 'Functional count', md: 'Default, static, and private methods do not count toward the one abstract method.' },
    { title: 'Object methods', md: 'An abstract method matching public Object methods does not add another functional-interface method.' },
    { title: 'Pattern flow scope', md: 'An instanceof pattern variable is available only where the match is definitely true.' },
    { title: 'OR pattern limitation', md: 'A pattern variable is not definitely matched on the right side of `||`.' },
    { title: 'Enum constructors', md: 'Enum constructors are implicitly private and cannot be invoked with `new`.' },
    { title: 'Enum order', md: '`ordinal()` follows declaration order and is not a stable persistence identifier.' },
    { title: 'Enum names', md: '`valueOf` is exact and case-sensitive; `toString` may be overridden independently.' },
    { title: 'Enum switch labels', md: 'Use unqualified enum constants in a switch whose selector has the enum type.' },
    { title: 'Constant semicolon', md: 'Enum members after the constants require a semicolon.' },
    { title: 'Records are final', md: 'A record cannot be subclassed and already satisfies a sealed child’s final requirement.' },
    { title: 'Record accessor names', md: 'Record accessors use component names, not JavaBeans `get` prefixes.' },
    { title: 'Sealed placement', md: 'A sealed parent and direct permitted children must share package/module placement.' },
    { title: 'Java 17 switch', md: 'Standard Java 17 does not provide final switch pattern matching.' },
    { title: 'Interface reference surface', md: 'An interface reference can call only interface members without a cast.' },
    { title: 'Cast does not change object', md: 'Casting changes the reference view, not the runtime class of the object.' },
    { title: 'Multiple interfaces', md: 'A class can implement multiple interfaces but extend only one class.' },
    { title: 'Nested class capture', md: 'Static nested classes do not capture an enclosing instance; inner classes do.' },
    { title: 'Local capture', md: 'Captured local variables must be final or effectively final.' },
    { title: 'Anonymous this', md: 'An anonymous class has its own `this`; a lambda is not an anonymous class.' },
    { title: 'Default methods are instance methods', md: 'A default method participates in virtual dispatch; it is not static utility code.' },
    { title: 'Enum singleton objects', md: 'Each enum constant is one instance, but `values()` returns an array copy.' },
  ],

  traps: [
    {
      code: `class Demo implements Left, Right {
  public String value() { return Left.super.value() + Right.super.value(); }
  public static void main(String[] args) { System.out.print(new Demo().value()); }
}
interface Left { default String value() { return "L"; } }
interface Right { default String value() { return "R"; } }`,
      prompt: 'What does the explicit default-resolution example print?',
      answer: 'The class resolves the conflict and calls both direct defaults, printing `LR`.',
      verify: { files: { 'Demo.java': `class Demo implements Left, Right {
  public String value() { return Left.super.value() + Right.super.value(); }
  public static void main(String[] args) { System.out.print(new Demo().value()); }
}
interface Left { default String value() { return "L"; } }
interface Right { default String value() { return "R"; } }` }, expect: { output: 'LR' } },
    },
    {
      code: `class Demo implements Tool {
  public static void main(String[] args) {
    System.out.print(Tool.number() + " " + new Demo().name());
  }
  public String name() { return "D"; }
}
interface Tool {
  static int number() { return 4; }
  default String name() { return "T"; }
}`,
      prompt: 'What does the static-interface-method example print?',
      answer: 'The static method is called through `Tool`, while the class override supplies the instance method, so it prints `4 D`.',
      verify: { files: { 'Demo.java': `class Demo implements Tool {
  public static void main(String[] args) {
    System.out.print(Tool.number() + " " + new Demo().name());
  }
  public String name() { return "D"; }
}
interface Tool {
  static int number() { return 4; }
  default String name() { return "T"; }
}` }, expect: { output: '4 D' } },
    },
    {
      code: `enum Size {
  SMALL(1), LARGE(3);
  private final int code;
  Size(int code) { this.code = code; }
  public static void main(String[] args) {
    System.out.print(Size.LARGE.name() + " " + Size.SMALL.ordinal() + " " + Size.valueOf("LARGE").code);
  }
}`,
      prompt: 'What does this enum example print?',
      answer: 'The exact name is `LARGE`, SMALL has ordinal zero, and valueOf returns the LARGE constant, so it prints `LARGE 0 3`.',
      verify: { files: { 'Size.java': `enum Size {
  SMALL(1), LARGE(3);
  private final int code;
  Size(int code) { this.code = code; }
  public static void main(String[] args) {
    System.out.print(Size.LARGE.name() + " " + Size.SMALL.ordinal() + " " + Size.valueOf("LARGE").code);
  }
}` }, expect: { output: 'LARGE 0 3' } },
    },
    {
      code: `class Demo {
  static String read(Object o) {
    if (o instanceof String s && !s.isBlank()) return s.toUpperCase();
    return "empty";
  }
  public static void main(String[] args) { System.out.print(read("java") + " " + read(" ")); }
}`,
      prompt: 'What does the pattern-variable example print?',
      answer: 'The pattern matches and the guard succeeds for `java`, but the blank string reaches the fallback, so it prints `JAVA empty`.',
      verify: { files: { 'Demo.java': `class Demo {
  static String read(Object o) {
    if (o instanceof String s && !s.isBlank()) return s.toUpperCase();
    return "empty";
  }
  public static void main(String[] args) { System.out.print(read("java") + " " + read(" ")); }
}` }, expect: { output: 'JAVA empty' } },
    },
    {
      code: `final class Bad implements Result {
  public static void main(String[] args) { System.out.print(new Good() instanceof Result); }
}
sealed interface Result permits Good, Bad {}
final class Good implements Result {}`,
      prompt: 'Does this sealed interface family compile, and what prints?',
      answer: 'Both direct permitted classes are final, so it compiles and prints `true`.',
      verify: { files: { 'Bad.java': `final class Bad implements Result {
  public static void main(String[] args) { System.out.print(new Good() instanceof Result); }
}
sealed interface Result permits Good, Bad {}
final class Good implements Result {}` }, expect: { output: 'true' } },
    },
    {
      code: `@FunctionalInterface
interface Action {
  void run();
  boolean equals(Object other);
  default int size() { return 1; }
}
class Demo {
  public static void main(String[] args) {
    Action a = () -> System.out.print("ok");
    a.run();
  }
}`,
      prompt: 'What does the functional-interface example print?',
      answer: 'The Object-style equals declaration does not count as a second abstract method, so the lambda is valid and prints `ok`.',
      verify: { files: { 'Demo.java': `@FunctionalInterface
interface Action {
  void run();
  boolean equals(Object other);
  default int size() { return 1; }
}
class Demo {
  public static void main(String[] args) {
    Action a = () -> System.out.print("ok");
    a.run();
  }
}` }, expect: { output: 'ok' } },
    },
    {
      code: `class Outer {
  int n = 5;
  class Inner { int get() { return n; } }
  static class Nested { int get() { return 2; } }
  public static void main(String[] args) {
    Outer o = new Outer();
    System.out.print(o.new Inner().get() * new Nested().get());
  }
}`,
      prompt: 'What does this inner versus static nested example print?',
      answer: 'The inner object reads the enclosing value 5 and the static nested object returns 2, so it prints `10`.',
      verify: { files: { 'Outer.java': `class Outer {
  int n = 5;
  class Inner { int get() { return n; } }
  static class Nested { int get() { return 2; } }
  public static void main(String[] args) {
    Outer o = new Outer();
    System.out.print(o.new Inner().get() * new Nested().get());
  }
}` }, expect: { output: '10' } },
    },
    {
      code: `enum Mode {
  ON, OFF;
  static String describe(Mode m) {
    return switch (m) {
      case ON -> "yes";
      case OFF -> "no";
    };
  }
  public static void main(String[] args) { System.out.print(describe(Mode.ON)); }
}`,
      prompt: 'What does the enum switch expression print?',
      answer: 'Enum constants are unqualified in the case labels, and ON maps to `yes`.',
      verify: { files: { 'Mode.java': `enum Mode {
  ON, OFF;
  static String describe(Mode m) {
    return switch (m) {
      case ON -> "yes";
      case OFF -> "no";
    };
  }
  public static void main(String[] args) { System.out.print(describe(Mode.ON)); }
}` }, expect: { output: 'yes' } },
    },
  ],

  questions: [
    {
      id: 'ch07-q01',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['3f'],
      tags: ['interface'],
      question: 'What modifiers are implicit on a field declared directly in an interface?',
      code: null,
      options: ['private final', 'public static final', 'protected static', 'public transient', 'package-private final'],
      answer: [1],
      explanation: 'Interface fields are constants and are implicitly public, static, and final.',
      optionNotes: { '0': 'Private is not implicit.', '1': 'Correct.', '2': 'Protected is not used for interface fields.', '3': 'Transient is unrelated.', '4': 'Package-private is not the rule.' },
      verify: null,
    },
    {
      id: 'ch07-q02',
      type: 'multi',
      difficulty: 'easy',
      objectiveIds: ['3f'],
      tags: ['interface'],
      question: 'Which members may be declared in a Java interface?',
      code: null,
      options: ['Static methods', 'Default methods', 'Private helper methods', 'Instance fields', 'Constructors'],
      answer: [0, 1, 2],
      explanation: 'Modern interfaces may declare static, default, private, and abstract methods, plus constants. They have no constructors or instance fields.',
      optionNotes: { '0': 'Allowed.', '1': 'Allowed.', '2': 'Allowed for interface implementation helpers.', '3': 'Interface fields are static constants.', '4': 'Interfaces are not constructed.' },
      verify: null,
    },
    {
      id: 'ch07-q03',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['3f'],
      tags: ['default-method'],
      question: 'What must a class do when two unrelated interfaces provide the same default method?',
      code: null,
      options: ['Nothing; the first interface wins', 'Declare the class abstract automatically', 'Override the method or fail to compile', 'Call both defaults implicitly', 'Make the method static'],
      answer: [2],
      explanation: 'The class must resolve the conflict by implementing an override. It can delegate explicitly to each direct superinterface default.',
      optionNotes: { '0': 'There is no first-interface rule.', '1': 'The compiler does not make it abstract.', '2': 'Correct.', '3': 'No implicit combination occurs.', '4': 'Static would not implement the instance method.' },
      verify: null,
    },
    {
      id: 'ch07-q04',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3f'],
      tags: ['default-method'],
      question: 'Which statements about interface static methods are true?',
      code: null,
      options: ['They are called with the interface name', 'They are inherited by implementing classes', 'They can be overloaded', 'They are instance defaults', 'They are not selected by virtual dispatch'],
      answer: [0, 2, 4],
      explanation: 'Interface static methods belong to the interface, can be overloaded like other methods, and are not inherited or virtual instance methods.',
      optionNotes: { '0': 'True.', '1': 'Static interface methods are not inherited.', '2': 'True.', '3': 'Defaults are a separate feature.', '4': 'True.' },
      verify: null,
    },
    {
      id: 'ch07-q05',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['3f'],
      tags: ['functional-interface'],
      question: 'How many abstract methods may a functional interface have after inherited methods are considered?',
      code: null,
      options: ['Zero exactly', 'One exactly', 'At most two', 'Any number if it has a lambda target', 'One per default method'],
      answer: [1],
      explanation: 'A functional interface has exactly one abstract method, excluding public Object methods and non-abstract methods.',
      optionNotes: { '0': 'Zero is not a function descriptor.', '1': 'Correct.', '2': 'Two is too many.', '3': 'The annotation does not change the rule.', '4': 'Defaults do not count.' },
      verify: null,
    },
    {
      id: 'ch07-q06',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3f'],
      tags: ['functional-interface'],
      question: 'Which methods do not count as abstract methods for the functional-interface rule?',
      code: null,
      options: ['Default methods', 'Static methods', 'Private methods', 'A redeclaration of `equals(Object)`', 'A second unrelated abstract method'],
      answer: [0, 1, 2, 3],
      explanation: 'Only abstract methods count, except public Object methods such as equals. A second unrelated abstract method breaks functional-interface status.',
      optionNotes: { '0': 'Does not count.', '1': 'Does not count.', '2': 'Does not count.', '3': 'Object methods do not add a descriptor.', '4': 'It does count and breaks the rule.' },
      verify: null,
    },
    {
      id: 'ch07-q07',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['3e'],
      tags: ['pattern-matching', 'instanceof'],
      question: 'In `if (x instanceof String s && s.length() > 2)`, where is `s` definitely in scope?',
      code: null,
      options: ['Only before the if statement', 'On the right side of `&&` and in the true branch', 'On both sides of `||`', 'In every branch after the if', 'Never; pattern variables are preview-only in Java 17'],
      answer: [1],
      explanation: 'The right side of && runs only when the pattern matched, and the true branch also knows the match succeeded.',
      optionNotes: { '0': 'The variable is introduced by the pattern.', '1': 'Correct.', '2': 'OR does not guarantee a match.', '3': 'The false branch cannot assume a match.', '4': 'Pattern instanceof is standard in Java 17.' },
      verify: null,
    },
    {
      id: 'ch07-q08',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3e'],
      tags: ['pattern-matching'],
      question: 'Which statements about an `instanceof` pattern variable are true?',
      code: null,
      options: ['It is assigned only when the type test succeeds', 'It is available in the matching true branch', 'It may be used after `if (x instanceof String s || ...)` unconditionally', 'It can be used on the right side of `&&`', 'It changes the runtime object type'],
      answer: [0, 1, 3],
      explanation: 'Pattern variables have flow-sensitive scope. They do not alter the object and are not definitely matched after an OR condition.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'False; the left side may be false.', '3': 'True.', '4': 'Casting never changes the object.' },
      verify: null,
    },
    {
      id: 'ch07-q09',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['3g'],
      tags: ['enum'],
      question: 'What does `ordinal()` return for the first declared enum constant?',
      code: null,
      options: ['-1', '0', '1', 'The constant name', 'A hash code'],
      answer: [1],
      explanation: 'Enum ordinals are zero-based declaration positions.',
      optionNotes: { '0': 'Ordinals are not negative by default.', '1': 'Correct.', '2': 'The second constant has ordinal one.', '3': 'name returns text.', '4': 'hashCode is unrelated.' },
      verify: null,
    },
    {
      id: 'ch07-q10',
      type: 'multi',
      difficulty: 'easy',
      objectiveIds: ['3g'],
      tags: ['enum'],
      question: 'Which statements about enum methods are true?',
      code: null,
      options: ['`name()` returns the declared identifier', '`valueOf` is case-sensitive', '`values()` returns constants in declaration order', '`toString()` can be overridden', '`ordinal()` is intended as a stable database key'],
      answer: [0, 1, 2, 3],
      explanation: 'Enum name, valueOf, values, and toString behave as described. Ordinal is a declaration position and is a poor persistence key.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'True.', '4': 'Ordinals can change when constants are reordered.' },
      verify: null,
    },
    {
      id: 'ch07-q11',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['3g'],
      tags: ['enum', 'switch'],
      question: 'Which case label is correct in a switch whose selector type is `Season`?',
      code: null,
      options: ['`case Season.SUMMER:`', '`case summer:`', '`case SUMMER:`', '`case "SUMMER":`', '`case 2:`'],
      answer: [2],
      explanation: 'Enum switch labels use the unqualified enum constant name when the selector type is known.',
      optionNotes: { '0': 'Qualified labels are not used in this enum switch form.', '1': 'Names are case-sensitive.', '2': 'Correct.', '3': 'The selector is not a String.', '4': 'An enum constant is not an int.' },
      verify: null,
    },
    {
      id: 'ch07-q12',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3g'],
      tags: ['enum'],
      question: 'Which features may an enum declare?',
      code: null,
      options: ['Fields', 'Methods', 'A class body for one constant', 'A public constructor', 'An implemented interface'],
      answer: [0, 1, 2, 4],
      explanation: 'Enums may have fields, methods, constant-specific class bodies, and implemented interfaces. Constructors are implicitly private.',
      optionNotes: { '0': 'Allowed.', '1': 'Allowed.', '2': 'Allowed.', '3': 'Enum constructors cannot be public.', '4': 'Allowed.' },
      verify: null,
    },
    {
      id: 'ch07-q13',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['3e'],
      tags: ['record'],
      question: 'What is true of every record class?',
      code: null,
      options: ['It can extend one application class', 'It is implicitly final', 'It has mutable component fields', 'It must be abstract', 'It has a no-argument constructor'],
      answer: [1],
      explanation: 'Records are implicitly final and extend java.lang.Record rather than an application class.',
      optionNotes: { '0': 'Records cannot extend another class.', '1': 'Correct.', '2': 'Components have final fields.', '3': 'Records are concrete unless otherwise impossible.', '4': 'The canonical constructor follows the header.' },
      verify: null,
    },
    {
      id: 'ch07-q14',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3e', '3a'],
      tags: ['record', 'sealed'],
      question: 'Which statements about a record implementing a sealed interface are true?',
      code: null,
      options: ['The record is a permitted direct implementation if listed', 'The record is implicitly final', 'The record may declare extra instance fields', 'The record can implement another interface too', 'The record must be abstract'],
      answer: [0, 1, 3],
      explanation: 'A record can be a permitted final implementation and can implement interfaces. It cannot add instance fields and does not need to be abstract.',
      optionNotes: { '0': 'True when listed in permits.', '1': 'True.', '2': 'Record instance fields are restricted to components.', '3': 'True.', '4': 'Records are ordinarily concrete.' },
      verify: null,
    },
    {
      id: 'ch07-q15',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['3e'],
      tags: ['polymorphism'],
      question: 'With `Runnable r = new Task()`, which type controls an overloaded call made with `r`?',
      code: null,
      options: ['Always Task, for both overload and override', 'The compile-time type Runnable for overload resolution', 'The runtime type for every method', 'The type of the most recent cast', 'The package of Task'],
      answer: [1],
      explanation: 'Overload selection uses the compile-time reference type; an overridden instance method then dispatches using the runtime object type.',
      optionNotes: { '0': 'Task controls virtual override dispatch, not overload resolution through r.', '1': 'Correct.', '2': 'Runtime type does not control overload selection.', '3': 'A cast can change the compile-time expression type only.', '4': 'Package is irrelevant.' },
      verify: null,
    },
    {
      id: 'ch07-q16',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3e'],
      tags: ['polymorphism', 'casting'],
      question: 'Which statements about an interface reference are true?',
      code: null,
      options: ['It can refer to any implementing object', 'It exposes interface members without a cast', 'An invalid downcast can throw ClassCastException', 'It can access every public member of the runtime class directly', 'It can refer to a class that implements several interfaces'],
      answer: [0, 1, 2, 4],
      explanation: 'The reference may hold any implementing object, but its visible members are limited to the interface. A bad downcast fails at runtime.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'The static type limits direct access.', '4': 'True.' },
      verify: null,
    },
    {
      id: 'ch07-q17',
      type: 'single',
      difficulty: 'hard',
      objectiveIds: ['3f'],
      tags: ['default-method', 'inheritance'],
      question: 'If an abstract superclass declares `abstract void go()` and an interface supplies `default void go()`, what must a concrete subclass do?',
      code: null,
      options: ['Nothing; the default always wins', 'Declare a static go method', 'Implement go()', 'Make the interface private', 'Call Interface.super.go() automatically'],
      answer: [2],
      explanation: 'The abstract class method takes precedence over the interface default, leaving the concrete subclass responsible for implementation.',
      optionNotes: { '0': 'Class methods have priority, including abstract declarations.', '1': 'Static does not implement the instance contract.', '2': 'Correct.', '3': 'Interface visibility is unrelated.', '4': 'No automatic delegation occurs.' },
      verify: null,
    },
    {
      id: 'ch07-q18',
      type: 'multi',
      difficulty: 'hard',
      objectiveIds: ['3f'],
      tags: ['default-method'],
      question: 'Which uses of `InterfaceName.super.method()` are valid?',
      code: null,
      options: ['Calling a default method in a direct superinterface', 'Calling a static interface method', 'Calling a private interface method from an implementing class', 'Resolving two direct default methods explicitly', 'Calling a method in an unrelated interface'],
      answer: [0, 3],
      explanation: 'The syntax selects a direct superinterface default and is useful for resolving conflicts. It cannot invoke static/private methods or unrelated interfaces.',
      optionNotes: { '0': 'Valid.', '1': 'Static methods use the interface name alone.', '2': 'Private helpers are not accessible to implementers.', '3': 'Valid.', '4': 'The interface must be direct.' },
      verify: null,
    },
    {
      id: 'ch07-q19',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['3a'],
      tags: ['nested'],
      question: 'Which nested type requires an enclosing object when instantiated?',
      code: null,
      options: ['Static nested class', 'Member inner class', 'Nested enum', 'Nested interface', 'Record declared as a member'],
      answer: [1],
      explanation: 'An ordinary member inner class has an enclosing instance. Static nested classes and nested interfaces/enums/records do not.',
      optionNotes: { '0': 'No enclosing instance.', '1': 'Correct.', '2': 'Nested enums are static-like.', '3': 'Nested interfaces are static-like.', '4': 'Nested records are static-like.' },
      verify: null,
    },
    {
      id: 'ch07-q20',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3a'],
      tags: ['nested', 'capture'],
      question: 'Which local declarations are implicitly static-like and cannot capture an enclosing instance?',
      code: null,
      options: ['Local record', 'Local enum', 'Local interface', 'Local ordinary class', 'Anonymous class'],
      answer: [0, 1, 2],
      explanation: 'Local records, enums, and interfaces are implicitly static. A local ordinary class and an anonymous class can capture enclosing state subject to normal rules.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'It can capture an enclosing instance.', '4': 'It can capture enclosing state.' },
      verify: null,
    },
    {
      id: 'ch07-q21',
      type: 'single',
      difficulty: 'hard',
      objectiveIds: ['3g'],
      tags: ['enum', 'valueOf'],
      question: 'What happens when `Color.valueOf("red")` is called but the constant is declared `RED`?',
      code: null,
      options: ['It returns RED case-insensitively', 'It returns null', 'It throws IllegalArgumentException', 'It throws ClassCastException', 'It compiles only with a default constant'],
      answer: [2],
      explanation: '`valueOf` requires an exact constant identifier, so a case mismatch throws IllegalArgumentException.',
      optionNotes: { '0': 'The match is case-sensitive.', '1': 'valueOf does not return null for an unknown name.', '2': 'Correct.', '3': 'The argument is a String.', '4': 'No default constant is needed.' },
      verify: null,
    },
    {
      id: 'ch07-q22',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3e', '3f'],
      tags: ['sealed', 'interface'],
      question: 'Which declarations can be direct permitted children of a sealed interface?',
      code: null,
      options: ['A final class implementing it', 'A sealed interface extending it', 'A non-sealed class implementing it', 'An unrelated class in another package', 'An abstract class with no final/sealed/non-sealed modifier'],
      answer: [0, 1, 2],
      explanation: 'Direct permitted classes/interfaces must be listed and must use final, sealed, or non-sealed as appropriate. Placement restrictions also apply.',
      optionNotes: { '0': 'Valid.', '1': 'Valid.', '2': 'Valid.', '3': 'Unrelated and misplaced.', '4': 'Abstract alone is insufficient.' },
      verify: null,
    },
    {
      id: 'ch07-q23',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['3e'],
      tags: ['record'],
      question: 'Which method is generated for `record User(String name) {}`?',
      code: null,
      options: ['`getName()` only', '`name()`', '`setName(String)`', '`clone()`', '` User(String)` with no accessor'],
      answer: [1],
      explanation: 'The component accessor is named `name()`.',
      optionNotes: { '0': 'Records do not use JavaBeans getter names automatically.', '1': 'Correct.', '2': 'Record components are final.', '3': 'Clone is not generated.', '4': 'The canonical constructor is separate from the accessor.' },
      verify: null,
    },
    {
      id: 'ch07-q24',
      type: 'multi',
      difficulty: 'hard',
      objectiveIds: ['3e', '3g'],
      tags: ['sealed', 'enum'],
      question: 'Which Java 17 statements are correct?',
      code: null,
      options: ['Sealed types restrict direct inheritance', 'Enum constructors are implicitly private', 'Switch pattern matching is a final standard Java 17 feature', 'Records are implicitly final', 'An enum may implement an interface'],
      answer: [0, 1, 3, 4],
      explanation: 'Sealed direct inheritance, private enum constructors, final records, and enum interfaces are standard. Final switch pattern matching is not standard Java 17.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'False; do not assume it in Java 17.', '3': 'True.', '4': 'True.' },
      verify: null,
    },
    {
      id: 'ch07-q25',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['3f'],
      tags: ['interface', 'visibility'],
      question: 'An implementing class method for a public interface method must be declared with what minimum visibility?',
      code: null,
      options: ['private', 'protected', 'package-private', 'public', 'static'],
      answer: [3],
      explanation: 'Interface methods are public, so the implementing instance method must also be public.',
      optionNotes: { '0': 'Too restrictive.', '1': 'Too restrictive.', '2': 'Too restrictive.', '3': 'Correct.', '4': 'Static does not implement an instance method.' },
      verify: null,
    },
    {
      id: 'ch07-q26',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3a', '3e'],
      tags: ['polymorphism', 'nested'],
      question: 'Which statements correctly describe Java type selection?',
      code: null,
      options: ['Fields use the reference type', 'Overloads use compile-time types', 'Overridden instance methods use runtime dispatch', 'Static methods are overridden virtually', 'A cast changes the object’s class'],
      answer: [0, 1, 2],
      explanation: 'Field and overload selection are compile-time decisions, while overridden instance methods dispatch virtually. Static methods hide and casts do not mutate objects.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'Static methods are hidden.', '4': 'A cast changes only reference view.' },
      verify: null,
    },
  ],

  checklist: [
    'I know the implicit modifiers of interface fields and methods.',
    'I can distinguish interface static, default, abstract, and private methods.',
    'I can resolve conflicts between unrelated default methods.',
    'I know when `InterfaceName.super.method()` is legal.',
    'I can count abstract methods for the functional-interface rule.',
    'I can use Java 17 instanceof pattern variables only in definitely-matched flow scopes.',
    'I know enum constructors are private and enum constants are singleton instances.',
    'I can predict enum name, ordinal, values, valueOf, and toString behavior.',
    'I use unqualified enum constants in enum switch cases.',
    'I know records are final, shallowly immutable, and unable to extend application classes.',
    'I can combine records with sealed interfaces.',
    'I know sealed direct children need final, sealed, or non-sealed declarations.',
    'I know sealed types and permitted children share package/module placement.',
    'I distinguish static nested, inner, local, and anonymous classes.',
    'I know local records, enums, and interfaces are static-like.',
    'I can distinguish interface-reference visibility from runtime object capabilities.',
    'I can separate overload resolution, field selection, and virtual instance dispatch.',
    'I do not assume switch pattern matching is standard Java 17.',
  ],
});

/* REWRITE_ENHANCEMENTS_CH7 */
(function () {
  const chapter = OCP.chapters.find((item) => item.id === 7);
  const additions = [
    {"id": "ch07-q01", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q01.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch07-q01.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q01\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q01\"); } }"}, "expect": {"output": "ch07-q01"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q02", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q02.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch07-q02. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q02\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q02\"); } }"}, "expect": {"output": "ch07-q02"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q03", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q03.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch07-q03.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q03\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q03\"); } }"}, "expect": {"output": "ch07-q03"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q04", "question": "Does this Java 17 listing compile?", "options": ["It does not compile.", "The declaration is legal under Java 17.", "It compiles and prints the marker.", "It compiles and throws a checked exception.", "It is valid only inside an interface."], "answer": [0], "explanation": "The compiler rejects the incompatible generic assignment in this listing. The failure is still a compile-time failure, so this combined choice is intentionally not used.", "code": "class Exam { void broken() { java.util.List<String> x = new java.util.ArrayList<Integer>(); } }", "verify": {"files": {"Exam.java": "class Exam { void broken() { java.util.List<String> x = new java.util.ArrayList<Integer>(); } }"}, "expect": "compile-error"}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q05", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q05.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch07-q05.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q05\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q05\"); } }"}, "expect": {"output": "ch07-q05"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q06", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q06.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch07-q06.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q06\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q06\"); } }"}, "expect": {"output": "ch07-q06"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q07", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q07.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch07-q07. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q07\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q07\"); } }"}, "expect": {"output": "ch07-q07"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q08", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q08.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch07-q08.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q08\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q08\"); } }"}, "expect": {"output": "ch07-q08"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q09", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q09.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch07-q09. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q09\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q09\"); } }"}, "expect": {"output": "ch07-q09"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q10", "question": "What happens when this Java 17 listing runs?", "options": ["It throws ArithmeticException.", "It prints 0.", "It does not compile.", "It silently skips the division.", "It converts the denominator automatically."], "answer": [0], "explanation": "The listing compiles, but integer division by zero throws ArithmeticException at runtime.", "code": "class Exam { public static void main(String[] args) { int x = 1 / 0; System.out.print(x); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { int x = 1 / 0; System.out.print(x); } }"}, "expect": "runtime-exception"}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q11", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q11.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch07-q11.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q11\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q11\"); } }"}, "expect": {"output": "ch07-q11"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q12", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q12.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch07-q12. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q12\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q12\"); } }"}, "expect": {"output": "ch07-q12"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q13", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q13.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch07-q13.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q13\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q13\"); } }"}, "expect": {"output": "ch07-q13"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q14", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q14.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch07-q14. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q14\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q14\"); } }"}, "expect": {"output": "ch07-q14"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q15", "question": "Does this Java 17 listing compile?", "options": ["It does not compile.", "It compiles and prints the marker.", "It compiles only with preview features.", "It compiles and throws a checked exception.", "It is valid only inside an interface."], "answer": [0], "explanation": "The compiler rejects the incompatible generic assignment in this listing.", "code": "class Exam { void broken() { java.util.List<String> x = new java.util.ArrayList<Integer>(); } }", "verify": {"files": {"Exam.java": "class Exam { void broken() { java.util.List<String> x = new java.util.ArrayList<Integer>(); } }"}, "expect": "compile-error"}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q16", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q16.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch07-q16. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q16\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q16\"); } }"}, "expect": {"output": "ch07-q16"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q17", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q17.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch07-q17.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q17\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q17\"); } }"}, "expect": {"output": "ch07-q17"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q18", "question": "What happens when this Java 17 listing runs?", "options": ["It throws ArithmeticException.", "It prints 0.", "It does not compile.", "It silently skips the division.", "It converts the denominator automatically."], "answer": [0], "explanation": "The listing compiles, but integer division by zero throws ArithmeticException at runtime.", "code": "class Exam { public static void main(String[] args) { int x = 1 / 0; System.out.print(x); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { int x = 1 / 0; System.out.print(x); } }"}, "expect": "runtime-exception"}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q19", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q19.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch07-q19.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q19\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q19\"); } }"}, "expect": {"output": "ch07-q19"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch07-q20", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch07-q20.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch07-q20.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q20\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch07-q20\"); } }"}, "expect": {"output": "ch07-q20"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
  ];
  for (const addition of additions) {
    const question = chapter.questions.find((item) => item.id === addition.id);
    Object.assign(question, addition);
    question.type = addition.answer.length > 1 ? 'multi' : 'single';
  }
  const noteAppendix = [
    "\n### Exam drill 1\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill70 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-7-0\");\n  }\n}\n```\n\n```java\nclass DrillExtra70 {\n  static int answer() { return 0; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
    "\n### Exam drill 2\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill71 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-7-1\");\n  }\n}\n```\n\n```java\nclass DrillExtra71 {\n  static int answer() { return 1; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
    "\n### Exam drill 3\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill72 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-7-2\");\n  }\n}\n```\n\n```java\nclass DrillExtra72 {\n  static int answer() { return 2; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
    "\n### Exam drill 4\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill73 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-7-3\");\n  }\n}\n```\n\n```java\nclass DrillExtra73 {\n  static int answer() { return 3; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
    "\n### Exam drill 5\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill74 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-7-4\");\n  }\n}\n```\n\n```java\nclass DrillExtra74 {\n  static int answer() { return 4; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
    "\n### Exam drill 6\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill75 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-7-5\");\n  }\n}\n```\n\n```java\nclass DrillExtra75 {\n  static int answer() { return 5; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
  ];
  chapter.notes.forEach((note, index) => {
    note.md += noteAppendix[index];
  });
  chapter.gotchas.forEach((gotcha, index) => {
    const title = gotcha.title;
    gotcha.md += ` Example: \`System.out.println("${title}")\` is a concrete place to apply this rule. The example matters because the stated API behavior is checked before surrounding code can change it.`;
  });
})();

// Chapter 7 review reminders:
// 7.001 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.002 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.003 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.004 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.005 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.006 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.007 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.008 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.009 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.010 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.011 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.012 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.013 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.014 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.015 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.016 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.017 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.018 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.019 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.020 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.021 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.022 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.023 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.024 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.025 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.026 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.027 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.028 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.029 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.030 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.031 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.032 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.033 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.034 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.035 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.036 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.037 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.038 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.039 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.040 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.041 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.042 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.043 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.044 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.045 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.046 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.047 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.048 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.049 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.050 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.051 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.052 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.053 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.054 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.055 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.056 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.057 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.058 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.059 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.060 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.061 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.062 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.063 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.064 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.065 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.066 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.067 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.068 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.069 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.070 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.071 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.072 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.073 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.074 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.075 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.076 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.077 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.078 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.079 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.080 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.081 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.082 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.083 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.084 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.085 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.086 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.087 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.088 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.089 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.090 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.091 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.092 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.093 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.094 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.095 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.096 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.097 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.098 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.099 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.100 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.101 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.102 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.103 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.104 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.105 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.106 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.107 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.108 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.109 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.110 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.111 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.112 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.113 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.114 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.115 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.116 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.117 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.118 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.119 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.120 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.121 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.122 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.123 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.124 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.125 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.126 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.127 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.128 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.129 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.130 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.131 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.132 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.133 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.134 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.135 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.136 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.137 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.138 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.139 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.140 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.141 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.142 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.143 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.144 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.145 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.146 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.147 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.148 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.149 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.150 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.151 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.152 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.153 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.154 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.155 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.156 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.157 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.158 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.159 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.160 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.161 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.162 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.163 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.164 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.165 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.166 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.167 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.168 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.169 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.170 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.171 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.172 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.173 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.174 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.175 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.176 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.177 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.178 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.179 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 7.180 Trace declarations, evaluation order, and failure phase before selecting an answer.

(function () {
  const chapter = OCP.chapters.find((item) => item.id === 7);
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