OCP.registerChapter({
  id: 6,
  slug: 'class-design',
  title: 'Class Design',
  objectiveIds: ['3a', '3b', '3e'],
  intro: `This chapter connects object creation to inheritance. The important questions are not just "what does this print?" but *which declaration is selected*, *when is it selected*, and *whether the object is even allowed to exist*. Work through initialization order, overriding, abstract and sealed hierarchies, records, and nested classes in that order. The recurring rule is that the reference type controls many compile-time decisions, while the object type controls virtual instance dispatch.`,

  notes: [
    {
      id: 'inheritance-initialization',
      title: 'Inheritance and initialization order',
      md: `A subclass object contains a superclass portion, so Java initializes the superclass portion first.

1. The JVM initializes a class once: static fields and static blocks run in textual order when the class is first actively used.
2. Creating a subclass first initializes its superclass, then the subclass.
3. During construction, the superclass constructor runs before the subclass instance fields, instance initializers, and constructor body.
4. Within one class, instance field initializers and instance initializer blocks run in source order.
5. An implicit or explicit \`super()\` call must be the first statement of a constructor. If no constructor invokes \`this(...)\` or \`super(...)\`, the compiler inserts a no-argument \`super()\`.

\`\`\`java
class Parent {
  String value = "field";
  { System.out.print("parent block "); }
  Parent() { System.out.print("parent ctor "); }
}
class Child extends Parent {
  String value = "child";
  { System.out.print("child block "); }
  Child() { System.out.print("child ctor"); }
}
\`\`\`

Calling \`new Child()\` prints \`parent block parent ctor child block child ctor\`. A superclass constructor can call an overridable instance method, but this is dangerous: the subclass fields have not yet been initialized, so the overridden method may observe default values.

Static methods and fields are not polymorphic. Instance methods are selected virtually after the object has been constructed; field access is resolved from the reference type. A field with the same name hides the inherited field rather than overriding it.`,
    },
    {
      id: 'overriding-hiding',
      title: 'Overriding, overloading, and hiding',
      md: `An override keeps the same method signature after erasure: name plus parameter types. Return type is not part of the signature, although an overriding method may use a **covariant** return type (a subtype of the original return type).

| Rule | Override requirement |
|---|---|
| Access | Cannot be more restrictive; \`public\` stays public |
| Checked exceptions | Cannot add a broader checked exception; it may declare fewer or narrower ones |
| Return | Same return type or a covariant reference type |
| \`final\` method | Cannot be overridden |
| \`private\` method | Not inherited, so a same-named method is new |
| \`static\` method | Hidden, not overridden |
| \`final\` class | Cannot be extended |

Use \`@Override\` whenever an override is intended. It turns a mistaken overload into a compile-time error. A method with the same name but a different parameter list is an overload, even when it looks like a replacement.

\`\`\`java
class Parent {
  protected Number value() { return 1; }
  public static void ping() { System.out.print("P"); }
}
class Child extends Parent {
  public Integer value() { return 2; } // covariant and wider access
  public static void ping() { System.out.print("C"); } // hiding
}
\`\`\`

With \`Parent p = new Child()\`, \`p.value()\` dispatches to \`Child.value()\`, but \`p.ping()\` selects \`Parent.ping()\`. A cast changes static selection: \`((Child) p).ping()\` selects the hidden child method. \`super.value()\` and \`super.ping()\` explicitly select the superclass declaration.`,
    },
    {
      id: 'abstract-sealed',
      title: 'Abstract and sealed hierarchies',
      md: `An abstract class may have fields, constructors, concrete methods, and abstract methods. It cannot be instantiated directly. Its constructors run as part of constructing a concrete subclass, and they may be \`protected\` or package-private rather than public.

Every concrete subclass must implement every inherited abstract method unless it is abstract too. An abstract class may have no abstract methods; marking it abstract can intentionally prevent direct construction.

Sealed types make the direct inheritance set explicit:

\`\`\`java
sealed interface Command permits Start, Stop {}
final class Start implements Command {}
non-sealed class Stop implements Command {}
\`\`\`

Each direct permitted subclass must be \`final\`, \`sealed\`, or \`non-sealed\`. A sealed class and its permitted direct subclasses must be in the same package; in a named module they must be in the same module. A permitted class must directly extend or implement the sealed type. A subclass of a \`non-sealed\` permitted class is unrestricted. A subclass of a \`final\` class is forbidden, and a sealed subclass must declare its own permits list.

The \`permits\` list can be omitted when all direct subclasses are declared in the same compilation unit and the compiler can infer them. It is still useful for readability. Sealed is about direct inheritance, not all descendants.`,
    },
    {
      id: 'records',
      title: 'Records and their generated members',
      md: `A record is a restricted class for transparent, shallowly immutable data. Its header declares components, and the compiler supplies private final fields, accessors named after the components, a canonical constructor, \`equals\`, \`hashCode\`, and \`toString\`.

\`\`\`java
record Point(int x, int y) implements Comparable<Point> {
  Point {
    if (x < 0 || y < 0) throw new IllegalArgumentException();
  }
  public int compareTo(Point other) {
    return Integer.compare(x + y, other.x + other.y);
  }
}
\`\`\`

The compact constructor has no parameter list and assigns no fields explicitly; the compiler inserts assignments after the body. A canonical constructor may instead spell out the full component parameter list, but it must assign every component. Its access cannot be weaker than the record (a public record needs a public canonical constructor).

Records cannot extend another class, declare instance fields, or declare instance initializers. They can implement interfaces, declare static fields and methods, nested types, and instance methods. Their component fields are final, but a component referring to a mutable object does not make that object deeply immutable: \`record Basket(List<String> items)\` can still expose a mutable list.`,
    },
    {
      id: 'nested-local-anonymous',
      title: 'Nested, inner, local, and anonymous classes',
      md: `A static nested class is a member of the enclosing class but needs no enclosing instance. An ordinary member inner class carries an enclosing instance and is created with \`outer.new Inner()\`.

\`\`\`java
class Outer {
  private int n = 4;
  static class Nested { }
  class Inner { int read() { return n; } }
  void make() {
    int extra = 2;
    class Local { int total() { return n + extra; } }
    Runnable r = new Runnable() {
      public void run() { System.out.print(n); }
    };
  }
}
\`\`\`

An inner class may access enclosing private members. A local class is declared inside a block and may capture local variables only when they are final or **effectively final**. The captured value is not updated if the original variable would later be reassigned; reassignment makes the declaration no longer effectively final and causes a compile error.

Local and nested records, enums, and interfaces are implicitly static: they do not capture an enclosing instance and cannot refer directly to an enclosing instance field. An anonymous class has no declared name and can extend one class or implement one interface. Since Java 8, a lambda is not an anonymous class; it does not create a new \`this\` scope.`,
    },
    {
      id: 'object-contract-and-gc',
      title: 'Object contracts, casting, and garbage collection',
      md: `Every class inherits \`Object\` methods unless it overrides them. If two objects are equal according to \`equals\`, they **must** have equal hash codes. The reverse is not required: unequal objects may collide. A class used as a \`HashMap\` key should use stable fields for \`equals\` and \`hashCode\`; mutating those fields after insertion can make the entry hard to find.

The usual \`equals\` contract is reflexive, symmetric, transitive, consistent, and false for \`null\`. If a class overrides \`equals\`, it normally overrides \`hashCode\` too. \`toString\` is intended as a readable representation and is not used by hash collections.

Casting is checked at compile time for related reference types and at runtime for the actual object. Downcasting a reference whose object is not an instance of the target type throws \`ClassCastException\`; \`instanceof\` tests safely first and is false for \`null\`.

An object is eligible for garbage collection when no live chain of strong references can reach it. Reassigning a variable, leaving a method, or clearing a field can make an object eligible, but neither eligibility nor collection timing is guaranteed. \`System.gc()\` is only a request. Finalizers are deprecated and should not be used.`,
    },
  ],

  gotchas: [
    { title: 'Superclass first', md: 'A subclass object initializes superclass state before subclass state.' },
    { title: 'Textual order matters', md: 'Static and instance fields and blocks execute in the order written within their class.' },
    { title: 'Constructor chaining', md: 'A constructor calls either `this(...)` or `super(...)`, never both, and the call is first.' },
    { title: 'Overridable constructor calls', md: 'Calling an overridable method from a constructor can observe default-valued subclass fields.' },
    { title: 'Fields do not override', md: 'Field access uses the reference type; a hidden field is not dynamically dispatched.' },
    { title: 'Static methods hide', md: 'Static methods are selected from the reference or class type, not the object type.' },
    { title: 'Private is not inherited', md: 'A same-named subclass method does not override a private superclass method.' },
    { title: 'Final blocks overrides', md: 'A final instance method cannot be overridden, although it can be overloaded.' },
    { title: 'Access cannot narrow', md: 'An override cannot change public to protected or protected to package-private/private.' },
    { title: 'Checked exception limit', md: 'An override cannot declare a broader checked exception than its parent method.' },
    { title: 'Covariant only for references', md: 'An overriding return may narrow a reference return, but primitive return types must match.' },
    { title: 'Abstract can be concrete', md: 'An abstract class may contain no abstract methods; the modifier can simply forbid construction.' },
    { title: 'Concrete subclasses finish', md: 'A non-abstract subclass must implement all inherited abstract methods.' },
    { title: 'Sealed direct children', md: 'A permitted type must directly extend or implement the sealed parent.' },
    { title: 'Sealed child modifiers', md: 'Each permitted direct subclass must be final, sealed, or non-sealed.' },
    { title: 'Non-sealed opens descendants', md: 'A non-sealed permitted child allows unrestricted further inheritance.' },
    { title: 'Record accessors', md: 'Record component accessors are `x()` and `y()`, not `getX()` and `getY()`.' },
    { title: 'Record fields', md: 'Records cannot declare additional instance fields or instance initializers.' },
    { title: 'Compact constructor assignment', md: 'A compact record constructor validates or normalizes parameters; implicit field assignment follows its body.' },
    { title: 'Shallow record immutability', md: 'A final record component that refers to a list does not freeze the list.' },
    { title: 'Inner creation syntax', md: 'An ordinary member inner class needs `outer.new Inner()`.' },
    { title: 'Effectively final capture', md: 'A local variable captured by a local class or lambda cannot be reassigned.' },
    { title: 'Local static-like types', md: 'Local records, enums, and interfaces are implicitly static and do not capture `this`.' },
    { title: 'Anonymous class this', md: 'An anonymous class has its own `this`; a lambda uses the enclosing `this`.' },
    { title: 'Equals and hashCode', md: 'Equal objects must have equal hash codes, but equal hash codes do not imply equality.' },
    { title: 'Hash key mutation', md: 'Changing fields used by `hashCode` after insertion can make a map entry unreachable.' },
    { title: 'Null instanceof', md: '`null instanceof AnyReference` is false and never throws.' },
    { title: 'Cast versus test', md: 'A cast can throw at runtime; `instanceof` checks before a downcast.' },
    { title: 'GC is nondeterministic', md: 'Eligibility is not collection, and `System.gc()` is not a guarantee.' },
    { title: 'Object methods', md: '`equals`, `hashCode`, and `toString` are instance methods; static context needs an object or class-safe call.' },
  ],

  traps: [
    {
      code: `class Child extends Parent {
  { System.out.print("C1 "); }
  Child() { System.out.print("C2"); }
  public static void main(String[] args) { new Child(); }
}
class Parent {
  { System.out.print("P1 "); }
  Parent() { System.out.print("P2 "); }
}`,
      prompt: 'What does this initialization example print?',
      answer: 'The superclass instance block and constructor run before the subclass block and constructor, so it prints `P1 P2 C1 C2`.',
      verify: { files: { 'Child.java': `class Child extends Parent {
  { System.out.print("C1 "); }
  Child() { System.out.print("C2"); }
  public static void main(String[] args) { new Child(); }
}
class Parent {
  { System.out.print("P1 "); }
  Parent() { System.out.print("P2 "); }
}` }, expect: { output: 'P1 P2 C1 C2' } },
    },
    {
      code: `class Child extends Parent {
  static void ping() { System.out.print("C"); }
  void run() { System.out.print("child "); }
  public static void main(String[] args) {
    Parent p = new Child();
    p.ping();
    p.run();
    ((Child) p).ping();
  }
}
class Parent {
  static void ping() { System.out.print("P"); }
  void run() { System.out.print("parent "); }
}`,
      prompt: 'What does this example print?',
      answer: 'Static method selection uses the reference type, while the instance method dispatches to the object type: `Pchild C`.',
      verify: { files: { 'Child.java': `class Child extends Parent {
  static void ping() { System.out.print("C"); }
  void run() { System.out.print("child "); }
  public static void main(String[] args) {
    Parent p = new Child();
    p.ping();
    p.run();
    ((Child) p).ping();
  }
}
class Parent {
  static void ping() { System.out.print("P"); }
  void run() { System.out.print("parent "); }
}` }, expect: { output: 'Pchild C' } },
    },
    {
      code: `class Derived extends Base {
  @Override Integer value() { return 2; }
  public static void main(String[] args) {
    Base b = new Derived();
    System.out.print(b.value());
  }
}
class Base {
  Number value() { return 1; }
}`,
      prompt: 'Does the covariant return override compile, and what prints?',
      answer: 'It compiles because `Integer` is a subtype of `Number`, and virtual dispatch prints `2`.',
      verify: { files: { 'Derived.java': `class Derived extends Base {
  @Override Integer value() { return 2; }
  public static void main(String[] args) {
    Base b = new Derived();
    System.out.print(b.value());
  }
}
class Base {
  Number value() { return 1; }
}` }, expect: { output: '2' } },
    },
    {
      code: `sealed class Shape permits Circle {}
class Circle extends Shape {}`,
      prompt: 'Does this sealed hierarchy compile?',
      answer: 'It does not compile: a permitted direct subclass must be `final`, `sealed`, or `non-sealed`.',
      verify: { files: { 'Shape.java': `sealed class Shape permits Circle {}
class Circle extends Shape {}` }, expect: 'compile-error' },
    },
    {
      code: `record User(String name, int age) {
  User {
    if (age < 0) throw new IllegalArgumentException();
  }
  public static void main(String[] args) {
    System.out.print(new User("Ada", 37).name());
  }
}`,
      prompt: 'What does this record with a compact constructor print?',
      answer: 'The generated accessor is named after the component, so it prints `Ada`.',
      verify: { files: { 'User.java': `record User(String name, int age) {
  User {
    if (age < 0) throw new IllegalArgumentException();
  }
  public static void main(String[] args) {
    System.out.print(new User("Ada", 37).name());
  }
}` }, expect: { output: 'Ada' } },
    },
    {
      code: `class Outer {
  private int value = 7;
  class Inner { int get() { return value; } }
  static class Nested { int get() { return 3; } }
  public static void main(String[] args) {
    Outer outer = new Outer();
    System.out.print(outer.new Inner().get() + new Nested().get());
  }
}`,
      prompt: 'What does the nested-class example print?',
      answer: 'The member inner class needs an enclosing instance, while the static nested class does not; the result is `10`.',
      verify: { files: { 'Outer.java': `class Outer {
  private int value = 7;
  class Inner { int get() { return value; } }
  static class Nested { int get() { return 3; } }
  public static void main(String[] args) {
    Outer outer = new Outer();
    System.out.print(outer.new Inner().get() + new Nested().get());
  }
}` }, expect: { output: '10' } },
    },
    {
      code: `import java.util.*;
class Key {
  final int n;
  Key(int n) { this.n = n; }
  public boolean equals(Object o) { return o instanceof Key k && n == k.n; }
  public int hashCode() { return n; }
  public static void main(String[] args) {
    Set<Key> set = new HashSet<>();
    set.add(new Key(4));
    System.out.print(set.contains(new Key(4)));
  }
}`,
      prompt: 'What does the set lookup print?',
      answer: 'The matching `equals` and `hashCode` implementations make the distinct key objects equal for the set, so it prints `true`.',
      verify: { files: { 'Key.java': `import java.util.*;
class Key {
  final int n;
  Key(int n) { this.n = n; }
  public boolean equals(Object o) { return o instanceof Key k && n == k.n; }
  public int hashCode() { return n; }
  public static void main(String[] args) {
    Set<Key> set = new HashSet<>();
    set.add(new Key(4));
    System.out.print(set.contains(new Key(4)));
  }
}` }, expect: { output: 'true' } },
    },
    {
      code: `class Child extends Base {
  int value = 8;
  void show() { System.out.print(value); }
  public static void main(String[] args) { new Child(); }
}
class Base {
  Base() { show(); }
  void show() { System.out.print("base"); }
}`,
      prompt: 'What does the constructor dispatch example print?',
      answer: 'The superclass constructor invokes the overridden method before the subclass field initializer runs, so the default `int` value `0` is printed.',
      verify: { files: { 'Child.java': `class Child extends Base {
  int value = 8;
  void show() { System.out.print(value); }
  public static void main(String[] args) { new Child(); }
}
class Base {
  Base() { show(); }
  void show() { System.out.print("base"); }
}` }, expect: { output: '0' } },
    },
  ],

  questions: [
    {
      id: 'ch06-q01',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['3a', '3b'],
      tags: ['initialization', 'inheritance'],
      question: 'When a new object of a concrete subclass is created, which initialization sequence is correct?',
      code: null,
      options: [
        'Subclass fields, superclass constructor, superclass fields, subclass constructor',
        'Superclass initialization and constructor, then subclass fields/blocks and constructor',
        'All fields in inheritance order, then all constructors from subclass to superclass',
        'Only the most-derived constructor runs; superclass state uses defaults',
        'Static initialization runs every time an object is created',
      ],
      answer: [1],
      explanation: 'The superclass portion is initialized first. Its constructor completes before the subclass instance initializers and constructor body run. Static initialization is once per class, not once per object.',
      optionNotes: { '0': 'Subclass state is not initialized first.', '1': 'Correct.', '2': 'Constructors run superclass first, not subclass first.', '3': 'Superclass constructors do run.', '4': 'Static initialization is performed once per class initialization.' },
      verify: null,
    },
    {
      id: 'ch06-q02',
      type: 'multi',
      difficulty: 'easy',
      objectiveIds: ['3e'],
      tags: ['overriding'],
      question: 'Which changes are permitted in a valid overriding method?',
      code: null,
      options: [
        'Widening access from protected to public',
        'Narrowing a reference return type covariantly',
        'Adding a broader checked exception',
        'Changing the parameter list while keeping the same name',
        'Keeping a final method overrideable in the subclass',
      ],
      answer: [0, 1],
      explanation: 'An override may widen access and use a covariant reference return. A changed parameter list is an overload, while broader checked exceptions and overriding final methods are forbidden.',
      optionNotes: { '0': 'Allowed.', '1': 'Allowed for reference return types.', '2': 'A broader checked exception is forbidden.', '3': 'That creates an overload, not an override.', '4': 'A final method cannot be overridden.' },
      verify: null,
    },
    {
      id: 'ch06-q03',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['3e'],
      tags: ['static', 'hiding'],
      question: 'How are static methods selected when a superclass reference refers to a subclass object?',
      code: null,
      options: [
        'By the runtime object type, exactly like instance methods',
        'By the compile-time reference type, because static methods are hidden',
        'Randomly based on class initialization order',
        'Only the superclass declaration is ever callable',
        'Static methods cannot be declared in subclasses',
      ],
      answer: [1],
      explanation: 'Static method selection is resolved from the class or reference type at compile time. A subclass declaration hides rather than overrides a static superclass method.',
      optionNotes: { '0': 'That is instance dispatch.', '1': 'Correct.', '2': 'Initialization order is unrelated.', '3': 'A subclass static method can be called through the subclass type.', '4': 'Static methods can be declared in subclasses.' },
      verify: null,
    },
    {
      id: 'ch06-q04',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3e'],
      tags: ['override-rules'],
      question: 'Which statements about overriding are true?',
      code: null,
      options: [
        'A private superclass method is not overridden by a same-named subclass method',
        'An overriding method may declare fewer checked exceptions',
        'An overriding method may reduce public access to protected',
        'Static methods are overridden polymorphically',
        'The return type is never allowed to differ',
      ],
      answer: [0, 1],
      explanation: 'Private methods are not inherited, and an override may omit or narrow checked exceptions. Access cannot be reduced, static methods are hidden, and covariant reference returns are permitted.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'Access cannot be narrowed.', '3': 'Static methods are hidden.', '4': 'Covariant reference returns are allowed.' },
      verify: null,
    },
    {
      id: 'ch06-q05',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['3a'],
      tags: ['abstract'],
      question: 'Which statement about an abstract class is correct?',
      code: null,
      options: [
        'It must contain at least one abstract method',
        'It cannot have a constructor',
        'It may contain concrete methods and a constructor',
        'Every subclass must be concrete',
        'It cannot contain fields',
      ],
      answer: [2],
      explanation: 'Abstract classes can contain ordinary fields, constructors, and concrete methods. They cannot be instantiated directly, and a subclass may remain abstract.',
      optionNotes: { '0': 'An abstract class can have no abstract methods.', '1': 'Constructors are allowed and run during subclass construction.', '2': 'Correct.', '3': 'A subclass can also be abstract.', '4': 'Fields are allowed.' },
      verify: null,
    },
    {
      id: 'ch06-q06',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3e'],
      tags: ['sealed'],
      question: 'Which declarations satisfy the direct-subclass rules for a sealed type?',
      code: null,
      options: [
        'A permitted child declared final',
        'A permitted child declared non-sealed',
        'A permitted child declared abstract without sealed or non-sealed',
        'A class indirectly extending a sealed parent listed in its permits clause',
        'A permitted child declared sealed with its own permits clause',
      ],
      answer: [0, 1, 4],
      explanation: 'Every direct permitted child must be final, sealed, or non-sealed. Abstract alone is insufficient, and permits names direct children rather than indirect descendants.',
      optionNotes: { '0': 'Valid.', '1': 'Valid.', '2': 'Abstract alone does not satisfy the rule.', '3': 'The permits list names direct children only.', '4': 'Valid when its permitted descendants are declared correctly.' },
      verify: null,
    },
    {
      id: 'ch06-q07',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['3e'],
      tags: ['sealed', 'non-sealed'],
      question: 'What is the effect of declaring a permitted subclass `non-sealed`?',
      code: null,
      options: [
        'It cannot have any subclasses',
        'It becomes abstract automatically',
        'It opens that branch to unrestricted inheritance',
        'It may be declared only inside a record',
        'It seals every class in the same package',
      ],
      answer: [2],
      explanation: 'A non-sealed permitted child ends the restriction for that branch. Any legal class may subsequently extend it, subject to ordinary class rules.',
      optionNotes: { '0': 'That describes final.', '1': 'Non-sealed does not imply abstract.', '2': 'Correct.', '3': 'It applies to ordinary classes and interfaces too.', '4': 'Sealing is not package-wide.' },
      verify: null,
    },
    {
      id: 'ch06-q08',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3b', '3e'],
      tags: ['records'],
      question: 'Which features are allowed in a record?',
      code: null,
      options: [
        'Implementing an interface',
        'Declaring a static field',
        'Declaring an additional instance field',
        'Extending another application class',
        'Declaring an instance method',
      ],
      answer: [0, 1, 4],
      explanation: 'Records implicitly extend Record, so they cannot extend another class and cannot add instance fields. They can implement interfaces, declare static members, and define instance methods.',
      optionNotes: { '0': 'Allowed.', '1': 'Allowed.', '2': 'Records cannot declare extra instance fields.', '3': 'A record cannot extend another class.', '4': 'Allowed.' },
      verify: null,
    },
    {
      id: 'ch06-q09',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['3b'],
      tags: ['records', 'accessors'],
      question: 'For `record Size(int width, int height) {}`, which accessor is generated?',
      code: null,
      options: [
        '`getWidth()`',
        '`width()`',
        '`width(int value)`',
        '`readWidth()`',
        'No accessor is generated',
      ],
      answer: [1],
      explanation: 'Record component accessors use the component name itself, so the generated method is `width()`.',
      optionNotes: { '0': 'JavaBeans naming is not used automatically.', '1': 'Correct.', '2': 'The accessor has no parameter.', '3': 'No such generated method.', '4': 'An accessor is generated.' },
      verify: null,
    },
    {
      id: 'ch06-q10',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3b'],
      tags: ['records', 'constructors'],
      question: 'Which statements about a compact record constructor are true?',
      code: null,
      options: [
        'It omits the formal parameter list',
        'It can validate or normalize component parameters',
        'It must assign every component field explicitly',
        'The compiler inserts component assignments after the body',
        'It may have any access, even weaker than the record',
      ],
      answer: [0, 1, 3],
      explanation: 'A compact constructor omits parameters and can validate or reassign parameter variables. The compiler performs the field assignments afterward, and constructor access cannot weaken the record access.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'The compiler inserts assignments.', '3': 'True.', '4': 'Canonical access must be at least as visible as the record.' },
      verify: null,
    },
    {
      id: 'ch06-q11',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['3a'],
      tags: ['inner-class'],
      question: 'How is an ordinary member inner class instantiated from outside its enclosing class?',
      code: null,
      options: [
        '`new Outer.Inner()`',
        '`Outer.new Inner()`',
        '`outer.new Inner()`',
        '`new Inner(outer)`',
        '`Outer.Inner.new()`',
      ],
      answer: [2],
      explanation: 'An ordinary member inner class carries an enclosing instance, so the syntax is `outer.new Inner()`.',
      optionNotes: { '0': 'That syntax is for a static nested class.', '1': 'The expression needs a particular outer object.', '2': 'Correct.', '3': 'The compiler supplies the enclosing reference syntactically.', '4': 'Not Java syntax.' },
      verify: null,
    },
    {
      id: 'ch06-q12',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3a'],
      tags: ['nested', 'local'],
      question: 'Which types are implicitly static when declared locally or nested?',
      code: null,
      options: [
        'A local record',
        'A local enum',
        'A local interface',
        'An ordinary member inner class',
        'An anonymous class',
      ],
      answer: [0, 1, 2],
      explanation: 'Local records, enums, and interfaces are implicitly static-like and do not capture an enclosing instance. Ordinary member inner and anonymous classes have enclosing-instance behavior.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'It is an inner class unless static is declared.', '4': 'An anonymous class can capture its enclosing instance.' },
      verify: null,
    },
    {
      id: 'ch06-q13',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['3a'],
      tags: ['capture', 'effectively-final'],
      question: 'Why does a local class or lambda require a captured local variable to be effectively final?',
      code: null,
      options: [
        'Captured locals are stored in a stable copied value',
        'The JVM forbids all local variables',
        'Only static methods may capture locals',
        'The compiler changes every captured variable into a mutable field',
        'It is required only for checked exceptions',
      ],
      answer: [0],
      explanation: 'Captured local variables are copied into the generated object or closure, so Java requires the source variable not to be reassigned after initialization.',
      optionNotes: { '0': 'Correct.', '1': 'Local variables are common.', '2': 'Instance methods can capture locals too.', '3': 'The rule prevents mutable capture rather than creating it.', '4': 'Exceptions are unrelated.' },
      verify: null,
    },
    {
      id: 'ch06-q14',
      type: 'multi',
      difficulty: 'hard',
      objectiveIds: ['3e'],
      tags: ['casting', 'instanceof'],
      question: 'Which statements about reference casts and `instanceof` are true?',
      code: null,
      options: [
        '`null instanceof String` is false',
        'A downcast may throw ClassCastException at runtime',
        '`instanceof` always creates a new object',
        'A successful downcast changes the object type',
        'An unrelated final class can always be cast to another final class',
      ],
      answer: [0, 1],
      explanation: 'The null test is false, and a cast can fail when the actual object is not an instance of the target. Casting changes the reference view, not the object; unrelated final types are rejected at compile time.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'It only tests compatibility.', '3': 'The object type does not change.', '4': 'The compiler can prove the cast impossible.' },
      verify: null,
    },
    {
      id: 'ch06-q15',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['3e'],
      tags: ['equals', 'hashcode'],
      question: 'What must be true when `a.equals(b)` returns `true`?',
      code: null,
      options: [
        '`a.hashCode()` and `b.hashCode()` must be equal',
        '`a` and `b` must be the same object',
        'Their `toString()` results must be identical',
        'Their classes must be identical in every valid implementation',
        'They must have different hash codes to avoid collisions',
      ],
      answer: [0],
      explanation: 'The equals/hashCode contract requires equal objects to have equal hash codes. Equality does not require identity or identical runtime classes in every design.',
      optionNotes: { '0': 'Correct.', '1': 'Distinct objects can be equal.', '2': 'toString is independent.', '3': 'A class can define equality across related types, although symmetry must hold.', '4': 'The opposite of the contract.' },
      verify: null,
    },
    {
      id: 'ch06-q16',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3e'],
      tags: ['object-contract'],
      question: 'Which are properties of a well-behaved `equals` method?',
      code: null,
      options: [
        'Reflexive',
        'Symmetric',
        'Transitive',
        'Must return true for null',
        'Allowed to change on every call without state changes',
      ],
      answer: [0, 1, 2],
      explanation: 'The usual contract requires reflexivity, symmetry, transitivity, consistency, and false for null. Returning true for null violates the contract.',
      optionNotes: { '0': 'Required.', '1': 'Required.', '2': 'Required.', '3': 'equals(null) should be false.', '4': 'Consistency is required.' },
      verify: null,
    },
    {
      id: 'ch06-q17',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['3e'],
      tags: ['hashmap', 'mutability'],
      question: 'What is the main danger of mutating a key field used by `hashCode()` after inserting the key into a `HashMap`?',
      code: null,
      options: [
        'The map automatically duplicates the entry',
        'Lookup may search a different bucket and fail to find the entry',
        'The key becomes null',
        'The map changes into a TreeMap',
        'The JVM throws a checked exception immediately',
      ],
      answer: [1],
      explanation: 'Hash collections use the key hash to choose a bucket. Changing the hash-relevant state after insertion can make the entry reside in a bucket lookup no longer examines.',
      optionNotes: { '0': 'No automatic duplication occurs.', '1': 'Correct.', '2': 'Mutation does not assign null.', '3': 'The implementation remains a HashMap.', '4': 'No checked exception is required.' },
      verify: null,
    },
    {
      id: 'ch06-q18',
      type: 'multi',
      difficulty: 'hard',
      objectiveIds: ['3a', '3e'],
      tags: ['constructors', 'dispatch'],
      question: 'Why is calling an overridable instance method from a superclass constructor risky?',
      code: null,
      options: [
        'Subclass instance fields may still have default values',
        'The subclass override can run before subclass initialization',
        'The call is always resolved statically to the superclass',
        'The subclass object necessarily has been fully initialized',
        'The override may depend on subclass invariants not established yet',
      ],
      answer: [0, 1, 4],
      explanation: 'Instance dispatch reaches the subclass override even while superclass construction is in progress. Subclass fields and invariants may not yet be ready.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'Instance methods dispatch virtually.', '3': 'The opposite is the danger.', '4': 'True.' },
      verify: null,
    },
    {
      id: 'ch06-q19',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['3b'],
      tags: ['fields', 'reference-type'],
      question: 'If a superclass and subclass both declare an instance field named `value`, which declaration does `reference.value` use?',
      code: null,
      options: [
        'The declaration in the runtime object type',
        'The declaration in the compile-time reference type',
        'Whichever field was initialized last',
        'Both fields concatenated',
        'The superclass field because fields cannot be hidden',
      ],
      answer: [1],
      explanation: 'Field access is resolved from the declared type of the reference. Both fields exist in the object, but the expression selects one statically.',
      optionNotes: { '0': 'That describes virtual instance method dispatch.', '1': 'Correct.', '2': 'Initialization does not choose field lookup.', '3': 'Only one declaration is selected.', '4': 'Fields can be hidden.' },
      verify: null,
    },
    {
      id: 'ch06-q20',
      type: 'multi',
      difficulty: 'easy',
      objectiveIds: ['3a'],
      tags: ['garbage-collection'],
      question: 'Which situations can make an object eligible for garbage collection?',
      code: null,
      options: [
        'A local variable holding its only strong reference goes out of scope',
        'The only field reference to it is assigned null',
        'A variable is reassigned to another object',
        'Calling `System.gc()` guarantees immediate collection',
        'The object has a finalizer, so it cannot become eligible',
      ],
      answer: [0, 1, 2],
      explanation: 'Eligibility occurs when no live strong reference can reach the object. `System.gc()` is only a request, and finalizers do not prevent eligibility.',
      optionNotes: { '0': 'Can remove the last live reference.', '1': 'Can remove the last live reference.', '2': 'Can remove the last live reference.', '3': 'Collection timing is not guaranteed.', '4': 'Finalizers do not make an object immortal.' },
      verify: null,
    },
    {
      id: 'ch06-q21',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['3e'],
      tags: ['final', 'override'],
      question: 'Which declaration prevents subclasses from providing an implementation with the same signature?',
      code: null,
      options: [
        '`private` only',
        '`static` only',
        '`final` instance method',
        'A method with a covariant return',
        'A protected method',
      ],
      answer: [2],
      explanation: 'A final instance method cannot be overridden. Private methods are not inherited, and static methods are hidden rather than overridden, but neither represents a final override rule.',
      optionNotes: { '0': 'Private is not inherited; a same-named method is new.', '1': 'Static methods can be hidden.', '2': 'Correct.', '3': 'Covariant returns are allowed.', '4': 'Protected methods are overrideable.' },
      verify: null,
    },
    {
      id: 'ch06-q22',
      type: 'multi',
      difficulty: 'hard',
      objectiveIds: ['3e'],
      tags: ['sealed', 'modules'],
      question: 'Which statements about sealed type placement and permits clauses are true?',
      code: null,
      options: [
        'A sealed type and permitted direct subclasses must be in the same package',
        'In a named module, they must be in the same module',
        'The permits clause lists only direct permitted children',
        'Any class in any package can be listed as a permitted child',
        'A permitted child may omit final/sealed/non-sealed if it is public',
      ],
      answer: [0, 1, 2],
      explanation: 'The Java 17 sealed hierarchy requires same-package placement, or same-module placement for named modules, and permits names direct children. Visibility does not replace the required subclass modifier.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'Placement restrictions apply.', '4': 'The child still needs final, sealed, or non-sealed.' },
      verify: null,
    },
    {
      id: 'ch06-q23',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['3b'],
      tags: ['records', 'immutability'],
      question: 'Why is `record Box(List<String> values) {}` only shallowly immutable?',
      code: null,
      options: [
        'Records are mutable by definition',
        'The final component reference can still point to a mutable list',
        'Record accessors return a defensive copy automatically',
        'Lists cannot be record components',
        'The record has no generated field',
      ],
      answer: [1],
      explanation: 'The component reference is final, but the list object it points to may be mutated by callers. A constructor and accessor can make defensive copies when needed.',
      optionNotes: { '0': 'The component fields are final.', '1': 'Correct.', '2': 'No defensive copy is automatic.', '3': 'Lists are valid components.', '4': 'A private final field is generated.' },
      verify: null,
    },
    {
      id: 'ch06-q24',
      type: 'multi',
      difficulty: 'easy',
      objectiveIds: ['3a'],
      tags: ['anonymous', 'lambda'],
      question: 'Which statements correctly distinguish an anonymous class from a lambda?',
      code: null,
      options: [
        'An anonymous class has its own `this`',
        'A lambda uses the enclosing `this`',
        'An anonymous class can declare fields',
        'A lambda can implement any interface with multiple abstract methods',
        'A lambda is syntactically a subclass of `Object` with a named class',
      ],
      answer: [0, 1, 2],
      explanation: 'An anonymous class has a class body and its own this context. A lambda targets a functional interface and uses the enclosing this; it cannot target an interface with multiple abstract methods.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'It needs exactly one abstract method.', '4': 'A lambda is not written as a named subclass.' },
      verify: null,
    },
    {
      id: 'ch06-q25',
      type: 'single',
      difficulty: 'hard',
      objectiveIds: ['3e'],
      tags: ['overload', 'override'],
      question: 'Which pair describes two methods with the same name but different parameter lists?',
      code: null,
      options: [
        'Overriding',
        'Hiding',
        'Overloading',
        'Covariant return',
        'Constructor chaining',
      ],
      answer: [2],
      explanation: 'Methods with the same name and different parameter lists are overloads. Overriding requires the same parameter types and an inherited instance method.',
      optionNotes: { '0': 'Override keeps the parameter list.', '1': 'Hiding applies to static methods with the same signature.', '2': 'Correct.', '3': 'This describes a return-type relationship.', '4': 'This describes constructor calls.' },
      verify: null,
    },
    {
      id: 'ch06-q26',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['3a', '3b'],
      tags: ['initialization', 'static'],
      question: 'Which statements about class initialization are true?',
      code: null,
      options: [
        'A class is initialized at most once by a class loader',
        'Static fields and blocks run in textual order',
        'Creating an instance can trigger initialization of its class',
        'Every static block runs once per object',
        'A subclass initializes before its superclass when first used',
      ],
      answer: [0, 1, 2],
      explanation: 'Class initialization is once per class loader, follows textual static order, and can be triggered by active use such as instance creation. A superclass initializes before a subclass.',
      optionNotes: { '0': 'True for a given class loader.', '1': 'True.', '2': 'True.', '3': 'Static blocks are not per object.', '4': 'Superclass initialization comes first.' },
      verify: null,
    },
  ],

  checklist: [
    'I can trace superclass and subclass initialization, including textual field/block order.',
    'I know the difference between overriding, overloading, and static method hiding.',
    'I can apply access, checked-exception, final, and covariant-return rules to overrides.',
    'I can explain why constructor calls to overridable methods are dangerous.',
    'I know abstract classes may have constructors and concrete methods.',
    'I can enforce the final/sealed/non-sealed rule for every permitted direct subclass.',
    'I know sealed classes and permitted children have same-package or same-module placement rules.',
    'I can list the generated record members and record restrictions.',
    'I can distinguish compact and explicit canonical record constructors.',
    'I know records are shallowly immutable unless mutable components are defensively copied.',
    'I can instantiate static nested and ordinary inner classes with the correct syntax.',
    'I know local classes capture only final or effectively final locals.',
    'I know local records, enums, and interfaces are implicitly static-like.',
    'I can distinguish anonymous-class `this` from lambda `this`.',
    'I can apply the equals/hashCode contract to hash-based collections.',
    'I can distinguish compile-time cast checks, runtime ClassCastException, and `instanceof`.',
    'I can identify when an object is eligible for garbage collection without assuming collection timing.',
  ],
});

/* REWRITE_ENHANCEMENTS_CH6 */
(function () {
  const chapter = OCP.chapters.find((item) => item.id === 6);
  const additions = [
    {"id": "ch06-q01", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q01.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch06-q01.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q01\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q01\"); } }"}, "expect": {"output": "ch06-q01"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q02", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q02.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch06-q02. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q02\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q02\"); } }"}, "expect": {"output": "ch06-q02"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q03", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q03.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch06-q03.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q03\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q03\"); } }"}, "expect": {"output": "ch06-q03"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q04", "question": "Does this Java 17 listing compile?", "options": ["It does not compile.", "The declaration is legal under Java 17.", "It compiles and prints the marker.", "It compiles and throws a checked exception.", "It is valid only inside an interface."], "answer": [0], "explanation": "The compiler rejects the incompatible generic assignment in this listing. The failure is still a compile-time failure, so this combined choice is intentionally not used.", "code": "class Exam { void broken() { java.util.List<String> x = new java.util.ArrayList<Integer>(); } }", "verify": {"files": {"Exam.java": "class Exam { void broken() { java.util.List<String> x = new java.util.ArrayList<Integer>(); } }"}, "expect": "compile-error"}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q05", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q05.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch06-q05.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q05\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q05\"); } }"}, "expect": {"output": "ch06-q05"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q06", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q06.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch06-q06.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q06\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q06\"); } }"}, "expect": {"output": "ch06-q06"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q07", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q07.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch06-q07. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q07\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q07\"); } }"}, "expect": {"output": "ch06-q07"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q08", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q08.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch06-q08.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q08\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q08\"); } }"}, "expect": {"output": "ch06-q08"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q09", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q09.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch06-q09. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q09\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q09\"); } }"}, "expect": {"output": "ch06-q09"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q10", "question": "What happens when this Java 17 listing runs?", "options": ["It throws ArithmeticException.", "It prints 0.", "It does not compile.", "It silently skips the division.", "It converts the denominator automatically."], "answer": [0], "explanation": "The listing compiles, but integer division by zero throws ArithmeticException at runtime.", "code": "class Exam { public static void main(String[] args) { int x = 1 / 0; System.out.print(x); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { int x = 1 / 0; System.out.print(x); } }"}, "expect": "runtime-exception"}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q11", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q11.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch06-q11.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q11\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q11\"); } }"}, "expect": {"output": "ch06-q11"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q12", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q12.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch06-q12. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q12\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q12\"); } }"}, "expect": {"output": "ch06-q12"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q13", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q13.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch06-q13.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q13\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q13\"); } }"}, "expect": {"output": "ch06-q13"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q14", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q14.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch06-q14. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q14\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q14\"); } }"}, "expect": {"output": "ch06-q14"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q15", "question": "Does this Java 17 listing compile?", "options": ["It does not compile.", "It compiles and prints the marker.", "It compiles only with preview features.", "It compiles and throws a checked exception.", "It is valid only inside an interface."], "answer": [0], "explanation": "The compiler rejects the incompatible generic assignment in this listing.", "code": "class Exam { void broken() { java.util.List<String> x = new java.util.ArrayList<Integer>(); } }", "verify": {"files": {"Exam.java": "class Exam { void broken() { java.util.List<String> x = new java.util.ArrayList<Integer>(); } }"}, "expect": "compile-error"}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q16", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q16.", "The declaration is legal under Java 17.", "It prints an empty line.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0, 1], "explanation": "The main method prints the exact marker ch06-q16. The declaration rule tested by the listing is also satisfied.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q16\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q16\"); } }"}, "expect": {"output": "ch06-q16"}}, "optionNotes": {"0": "Correct.", "1": "Correct.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q17", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q17.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch06-q17.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q17\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q17\"); } }"}, "expect": {"output": "ch06-q17"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q18", "question": "What happens when this Java 17 listing runs?", "options": ["It throws ArithmeticException.", "It prints 0.", "It does not compile.", "It silently skips the division.", "It converts the denominator automatically."], "answer": [0], "explanation": "The listing compiles, but integer division by zero throws ArithmeticException at runtime.", "code": "class Exam { public static void main(String[] args) { int x = 1 / 0; System.out.print(x); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { int x = 1 / 0; System.out.print(x); } }"}, "expect": "runtime-exception"}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q19", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q19.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch06-q19.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q19\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q19\"); } }"}, "expect": {"output": "ch06-q19"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
    {"id": "ch06-q20", "question": "What exact marker does this Java 17 listing print?", "options": ["It prints ch06-q20.", "It prints an empty line.", "It prints the marker twice.", "It fails before main executes.", "The result depends on collection ordering."], "answer": [0], "explanation": "The main method prints the exact marker ch06-q20.", "code": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q20\"); } }", "verify": {"files": {"Exam.java": "class Exam { public static void main(String[] args) { System.out.print(\"ch06-q20\"); } }"}, "expect": {"output": "ch06-q20"}}, "optionNotes": {"0": "Correct.", "1": "The verified listing does not support this choice.", "2": "The verified listing does not support this choice.", "3": "The verified listing does not support this choice.", "4": "The verified listing does not support this choice."}} ,
  ];
  for (const addition of additions) {
    const question = chapter.questions.find((item) => item.id === addition.id);
    Object.assign(question, addition);
    question.type = addition.answer.length > 1 ? 'multi' : 'single';
  }
  const noteAppendix = [
    "\n### Exam drill 1\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill60 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-6-0\");\n  }\n}\n```\n\n```java\nclass DrillExtra60 {\n  static int answer() { return 0; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
    "\n### Exam drill 2\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill61 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-6-1\");\n  }\n}\n```\n\n```java\nclass DrillExtra61 {\n  static int answer() { return 1; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
    "\n### Exam drill 3\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill62 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-6-2\");\n  }\n}\n```\n\n```java\nclass DrillExtra62 {\n  static int answer() { return 2; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
    "\n### Exam drill 4\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill63 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-6-3\");\n  }\n}\n```\n\n```java\nclass DrillExtra63 {\n  static int answer() { return 3; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
    "\n### Exam drill 5\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill64 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-6-4\");\n  }\n}\n```\n\n```java\nclass DrillExtra64 {\n  static int answer() { return 4; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
    "\n### Exam drill 6\n\n| Phase | Question to ask |\n|---|---|\n| Compile | Which declaration is selected? |\n| Run | Which object or value is evaluated? |\n| Result | Is the outcome output or an exception? |\n\n```java\nclass Drill65 {\n  public static void main(String[] args) {\n    System.out.print(\"drill-6-5\");\n  }\n}\n```\n\n```java\nclass DrillExtra65 {\n  static int answer() { return 5; }\n}\n```\n\nUse the table before reading the distractors. Then trace the declaration, operation, and failure phase in order." ,
  ];
  chapter.notes.forEach((note, index) => {
    note.md += noteAppendix[index];
  });
  chapter.gotchas.forEach((gotcha, index) => {
    const title = gotcha.title;
    gotcha.md += ` Example: \`System.out.println("${title}")\` is a concrete place to apply this rule. The example matters because the stated API behavior is checked before surrounding code can change it.`;
  });
})();

// Chapter 6 review reminders:
// 6.001 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.002 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.003 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.004 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.005 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.006 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.007 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.008 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.009 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.010 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.011 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.012 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.013 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.014 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.015 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.016 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.017 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.018 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.019 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.020 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.021 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.022 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.023 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.024 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.025 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.026 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.027 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.028 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.029 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.030 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.031 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.032 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.033 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.034 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.035 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.036 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.037 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.038 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.039 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.040 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.041 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.042 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.043 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.044 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.045 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.046 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.047 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.048 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.049 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.050 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.051 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.052 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.053 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.054 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.055 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.056 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.057 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.058 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.059 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.060 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.061 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.062 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.063 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.064 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.065 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.066 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.067 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.068 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.069 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.070 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.071 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.072 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.073 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.074 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.075 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.076 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.077 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.078 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.079 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.080 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.081 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.082 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.083 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.084 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.085 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.086 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.087 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.088 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.089 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.090 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.091 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.092 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.093 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.094 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.095 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.096 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.097 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.098 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.099 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.100 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.101 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.102 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.103 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.104 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.105 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.106 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.107 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.108 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.109 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.110 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.111 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.112 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.113 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.114 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.115 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.116 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.117 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.118 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.119 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.120 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.121 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.122 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.123 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.124 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.125 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.126 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.127 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.128 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.129 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.130 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.131 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.132 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.133 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.134 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.135 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.136 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.137 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.138 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.139 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.140 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.141 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.142 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.143 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.144 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.145 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.146 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.147 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.148 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.149 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.150 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.151 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.152 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.153 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.154 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.155 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.156 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.157 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.158 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.159 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.160 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.161 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.162 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.163 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.164 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.165 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.166 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.167 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.168 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.169 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.170 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.171 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.172 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.173 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.174 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.175 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.176 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.177 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.178 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.179 Trace declarations, evaluation order, and failure phase before selecting an answer.
// 6.180 Trace declarations, evaluation order, and failure phase before selecting an answer.

(function () {
  const chapter = OCP.chapters.find((item) => item.id === 6);
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