OCP.registerChapter({
  id: 6,
  slug: 'class-design',
  title: 'Class Design',
  objectiveIds: ['3a', '3b', '3e'],
  intro: `Objectives **3a** (object life-cycle, instantiation), **3b** (classes, fields, constructors, initializers), and **3e** (inheritance, abstract classes, overriding methods, Object methods, polymorphism, type casting, instanceof and pattern matching). Class design is the absolute backbone of the OCP exam: method overriding rules, super constructor chaining, initialization order across hierarchies, reference type vs object type, method and field hiding, and Java 16+ pattern matching for instanceof appear in dozens of questions.`,

  notes: [
    {
      id: 'inheritance-basics',
      title: 'Inheritance and super constructor chaining',
      md: `## Inheritance rules

* Java uses **single inheritance for classes**: a class can \`extends\` at most one parent class. If no superclass is declared, it implicitly extends \`java.lang.Object\`.
* Classes cannot extend \`final\` classes (e.g. \`String\`, \`System\`, \`Integer\`).
* A subclass inherits all \`public\` and \`protected\` members, and package-private members if declared in the same package. It does **not** inherit \`private\` members or constructors.

## Constructor chaining

Every constructor begins with an explicit or implicit call to another constructor:
1. An explicit call to another constructor in the same class: \`this(...);\`.
2. An explicit call to a superclass constructor: \`super(...);\`.
3. If neither is written, the compiler **automatically inserts \`super();\`** as the first statement.

\`\`\`java
public class Animal {
  public Animal(String name) {}
}
public class Dog extends Animal {
  // DOES NOT COMPILE if written as:
  // public Dog() {}
  // because the compiler inserts super(); but Animal has no no-arg constructor!
  public Dog() {
    super("Fido"); // explicit super call required
  }
}
\`\`\`

### Key constructor rules
* \`this()\` or \`super()\` must be the **very first statement** in a constructor body.
* You cannot call both \`this()\` and \`super()\` in the same constructor.
* Recursive constructor calls (\`this()\` calling a constructor that calls back) cause a **compile-time error**, not runtime stack overflow.
* If a superclass has only private constructors, it cannot be extended by any other class.`
    },
    {
      id: 'initialization-order',
      title: 'Order of initialization across class hierarchies',
      md: `When a subclass object is instantiated for the first time, initialisation proceeds in this strict order:

1. **Superclass static fields and static initializers** in textual order.
2. **Subclass static fields and static initializers** in textual order.
   *(Static initialisation happens only once per class loading).*
3. **Superclass instance fields and instance initializers** in textual order.
4. **Superclass constructor body**.
5. **Subclass instance fields and instance initializers** in textual order.
6. **Subclass constructor body**.

\`\`\`java
class Base {
  static { System.out.print("S1 "); }
  { System.out.print("I1 "); }
  public Base() { System.out.print("C1 "); }
}
class Sub extends Base {
  static { System.out.print("S2 "); }
  { System.out.print("I2 "); }
  public Sub() { System.out.print("C2 "); }
  public static void main(String[] args) {
    System.out.print("M ");
    new Sub();
    new Sub();
  }
}
// Prints: S1 S2 M I1 C1 I2 C2 I1 C1 I2 C2
\`\`\`

Notice on the second \`new Sub()\`, static blocks do NOT run again!`
    },
    {
      id: 'method-overriding-and-hiding',
      title: 'Method overriding vs method and field hiding',
      md: `## Method Overriding Rules

A method in a subclass overrides an inherited method in a superclass when:
1. **Signature**: Method name and parameter types must match **exactly**. Different parameters = overloading, not overriding.
2. **Access modifier**: Must be **equal or broader** in the subclass:
   * \`public\` → only \`public\`
   * \`protected\` → \`protected\` or \`public\`
   * package-private → package-private, \`protected\`, or \`public\`
   * \`private\` methods are not inherited and **cannot be overridden** (writing the same signature in the child creates a completely independent new method).
3. **Return type**: Must be **covariant** (identical or a subtype of the superclass return type).
   * Primitives must match **exactly**: if parent returns \`int\`, child must return \`int\` (not \`long\`, not \`Integer\`).
   * For objects: if parent returns \`CharSequence\`, child may return \`String\`.
4. **Checked exceptions**: Child method's \`throws\` clause can declare:
   * **Fewer** checked exceptions, or **none**.
   * **Narrower** (subclasses of) declared checked exceptions.
   * **Never** new or broader checked exceptions!
   * *Unchecked (runtime) exceptions* have no restrictions whatsoever.
5. **Cannot override a \`final\` method**.

## Method Hiding (static methods)

* A \`static\` method in a superclass cannot be overridden. If a subclass declares a static method with the exact same signature, it is **hidden**.
* Both must be \`static\`:
  * Superclass static + Subclass non-static → **Compile error**.
  * Superclass non-static + Subclass static → **Compile error**.
* Hidden static methods must still follow access modifier, covariant return, and exception rules!
* Calling a hidden static method is resolved at **compile time by the reference type**, not the runtime object type.

## Field Hiding (variables are never polymorphic)

* Subclass fields with the same name as superclass fields **hide** them.
* Java fields are **never polymorphic**. Accessing \`ref.field\` evaluates the field in the class of the declared **reference type**, not the actual object type.`
    },
    {
      id: 'abstract-classes',
      title: 'Abstract classes and methods',
      md: `* An **abstract class** is declared with the \`abstract\` keyword and **cannot be instantiated** directly: \`new AbstractClass()\` is a compile error.
* An abstract class can have 0 or more abstract methods, or none at all.
* If a class contains *any* abstract method (including inherited unimplemented ones), the class **must be declared \`abstract\`**.
* **Abstract method syntax**: \`public abstract void move();\` – ends with a semicolon \`;\`. It **cannot have a body** \`{}\`.
* Modifiers that **cannot be combined with \`abstract\`**:
  * \`private abstract\` → compile error (cannot be implemented by child).
  * \`final abstract\` → compile error (cannot be extended/overridden).
  * \`static abstract\` → compile error (static belongs to class, not overridden).
* The **first concrete subclass** must provide implementations (with method bodies) for **all** inherited abstract methods.`
    },
    {
      id: 'polymorphism-and-pattern-matching',
      title: 'Polymorphism, casting and pattern matching for instanceof',
      md: `## Polymorphism & Casting

\`\`\`java
Animal a = new Dog(); // Upcasting (always safe, implicit)
Dog d = (Dog) a;      // Downcasting (explicit required; throws ClassCastException if wrong)
\`\`\`

* **Compile-time check**: The compiler allows a cast between reference types only if the types are in the same inheritance tree. Casting between two unrelated classes (e.g. \`String s = (String) new Integer(1);\`) is a **compile-time error**.
* **Runtime check**: \`ClassCastException\` occurs if the runtime object is not actually an instance of the target type.

## Pattern Matching for instanceof (Java 16+)

Introduced to eliminate boilerplate casting:

\`\`\`java
if (obj instanceof String s) {
  System.out.println(s.toUpperCase()); // 's' is automatically in scope and cast to String!
}
\`\`\`

### Flow Scoping Rules:
* The pattern variable is only in scope where the pattern has definitely matched:
  * \`if (obj instanceof String s && s.length() > 0)\` → **Compiles!** (\`&&\` short-circuits: \`s\` is in scope).
  * \`if (obj instanceof String s || s.length() > 0)\` → **Compile error!** (If first condition is false, \`s\` is not in scope).
  * Inverted check:
    \`\`\`java
    if (!(obj instanceof String s)) return;
    System.out.println(s.length()); // Compiles! s is in scope because code only reaches here if match was true!
    \`\`\`
* If \`obj\` is \`null\`, \`instanceof\` always evaluates to \`false\` and the pattern variable is never bound.
* **Redundant pattern matching check**: \`String s = "hi"; if (s instanceof String str)\` is a **compile error** because the compiler knows the expression is already a subtype of the target.`
    },
    {
      id: 'object-methods',
      title: 'Overriding java.lang.Object methods',
      md: `Every Java class inherits from \`java.lang.Object\`. Three methods are heavily tested:

### 1. \`toString()\`
* Default implementation: \`getClass().getName() + '@' + Integer.toHexString(hashCode())\`.
* Automatically invoked during string concatenation \`"obj: " + obj\` or \`System.out.println(obj)\`.

### 2. \`equals(Object obj)\`
* Default implementation uses reference equality \`==\`.
* Signature must be **\`public boolean equals(Object obj)\`**.
* *Exam Trap*: \`public boolean equals(MyClass obj)\` does **not** override \`Object.equals\` – it **overloads** it! Collections and \`Object\` references will call \`Object.equals(Object)\`, missing your method.
* Contract: Reflexive (\`x.equals(x)\`), Symmetric (\`x.equals(y) == y.equals(x)\`), Transitive, Consistent, and \`x.equals(null)\` must return \`false\` (never throw NPE).

### 3. \`hashCode()\`
* Contract with \`equals\`:
  * If \`x.equals(y)\` is true, then \`x.hashCode() == y.hashCode()\` **must** be true.
  * If \`x.hashCode() == y.hashCode()\`, \`x.equals(y)\` may or may not be true (collisions allowed).
  * If \`x.equals(y)\` is false, \`hashCode()\` is **not required** to be different.`
    }
  ],

  gotchas: [
    { title: 'super() must be statement 1', md: '`super()` or `this()` must be the **first line** of a constructor. Putting a print or assignment before it is an immediate compile error.' },
    { title: 'Implicit super() without no-arg parent', md: 'If parent has only custom constructors (e.g. `Animal(String)`), a subclass default constructor or bare `{}` constructor fails to compile because the compiler inserts `super();`.' },
    { title: 'Overriding vs overloading signature', md: 'Overriding requires exact same name and parameter list. Changing `int` to `long` or `Object` to `String` is **overloading**, not overriding.' },
    { title: 'Covariant return type rules', md: 'The child return type can be a subtype for objects (`CharSequence` → `String`), but for primitives it must be **identical** (`int` cannot become `long`).' },
    { title: 'Checked exception widening', md: 'An overriding method can throw **fewer** or **narrower** checked exceptions, or none at all. It can **never** throw a broader checked exception (e.g. parent throws `IOException`, child cannot throw `Exception`).' },
    { title: 'Access modifier narrowing', md: 'An overriding method can never be more restrictive. If parent is `protected`, child must be `protected` or `public`. Making it package-private or `private` fails to compile.' },
    { title: 'Private methods are never overridden', md: 'Subclass cannot override a parent `private` method. It is simply declaring an independent method with the same name. Rules about return types or exceptions do not apply.' },
    { title: 'Static methods hide, not override', md: 'Static methods are resolved at compile time using the reference type. If a subclass declares the same static method, it is **hidden**, not polymorphic.' },
    { title: 'Static and instance method collision', md: 'A static method cannot hide an instance method, and an instance method cannot override a static method. Both produce compile errors.' },
    { title: 'Fields are never polymorphic', md: 'Field access `ref.x` is always resolved by the compile-time type of `ref`, regardless of the runtime object.' },
    { title: 'Abstract class cannot be final', md: '`final abstract class A` is an oxymoron and a compile-time error. Abstract classes must be extended; final classes cannot be.' },
    { title: 'Abstract method cannot have curly braces', md: '`public abstract void run() {}` fails to compile. An abstract method ends with `;` and has no body.' },
    { title: 'Unrelated class casting compile error', md: 'Casting between two classes that have no ancestor/descendant relationship in the hierarchy is a **compile-time error**, not `ClassCastException`.' },
    { title: 'Flow scoping with || operator', md: '`if (o instanceof String s || s.isEmpty())` does not compile because if `o` is not a String, the right side evaluates where `s` is out of scope.' },
    { title: 'Flow scoping after early return', md: '`if (!(o instanceof String s)) return; s.length();` compiles! Because execution can only pass the if statement when the match succeeded, `s` stays in scope.' },
    { title: 'Redundant pattern matching', md: '`String s = "x"; if (s instanceof String str)` is a compile error because the compiler already knows `s` is a `String` (it must be an open question).' },
    { title: 'equals(MyClass) overload trap', md: 'Writing `public boolean equals(Person p)` does not override `Object.equals(Object)`. It is an overload. Code calling `.equals(Object)` will bypass it completely.' },
    { title: 'Recursive this() constructor call', md: 'A constructor calling another constructor that eventually calls back creates a circular constructor dependency, caught by the compiler as an error.' },
    { title: 'Subclass constructor call ordering', md: 'Parent constructor always finishes before child constructor body starts. If parent calls an overridden method in its constructor, the child\'s method runs before child fields are initialized!' },
    { title: 'null instanceof Anything is false', md: '`null instanceof String` evaluates to `false` and never throws an exception. A pattern variable is never bound if the target is null.' }
  ],

  traps: [
    {
      code: `class Parent {
  public Parent() { print(); }
  public void print() { System.out.print("P "); }
}
class Child extends Parent {
  int value = 42;
  public void print() { System.out.print(value + " "); }
  public static void main(String[] args) {
    new Child();
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`0 `**! When `new Child()` runs, `Parent` constructor runs first. It calls `print()`, which resolves polymorphically to `Child.print()`. But `Child`\'s instance field `value` has not been initialized yet (it still has its default value `0`).',
      verify: {
        files: {
          'Parent.java': `public class Parent {
  public Parent() { print(); }
  public void print() { System.out.print("P "); }
}`,
          'Child.java': `public class Child extends Parent {
  int value = 42;
  public void print() { System.out.print(value + " "); }
  public static void main(String[] args) {
    new Child();
  }
}`
        },
        expect: { output: '0 ' }
      }
    },
    {
      code: `class Super {
  static void test() { System.out.print("Super "); }
  int val = 10;
}
class Sub extends Super {
  static void test() { System.out.print("Sub "); }
  int val = 20;
}
public class Test {
  public static void main(String[] args) {
    Super s = new Sub();
    s.test();
    System.out.print(s.val);
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`Super 10`**. Static methods and fields are **not polymorphic**; they are resolved at compile time using the declared reference type (`Super`), not the runtime object type (`Sub`).',
      verify: {
        files: {
          'Super.java': `public class Super {
  static void test() { System.out.print("Super "); }
  int val = 10;
}`,
          'Sub.java': `public class Sub extends Super {
  static void test() { System.out.print("Sub "); }
  int val = 20;
}`,
          'Test.java': `public class Test {
  public static void main(String[] args) {
    Super s = new Sub();
    s.test();
    System.out.print(s.val);
  }
}`
        },
        expect: { output: 'Super 10' }
      }
    },
    {
      code: `class A {
  A(int x) {}
}
class B extends A {
  B() {
    System.out.print("B");
  }
}`,
      prompt: 'Does this code compile?',
      answer: '**Does not compile.** `B`\'s constructor does not explicitly call `super(...)`, so the compiler attempts to insert `super();`. But `class A` has a custom constructor `A(int)` and therefore no no-arg constructor exists.',
      verify: {
        files: {
          'Test.java': `class A { A(int x) {} }
class B extends A {
  B() { System.out.print("B"); }
}`
        },
        expect: 'compile-error'
      }
    },
    {
      code: `public class FlowScope {
  public static void test(Object obj) {
    if (!(obj instanceof String s)) {
      System.out.print("NotString ");
      return;
    }
    System.out.print(s.toUpperCase() + " ");
  }
  public static void main(String[] args) {
    test("java");
    test(123);
  }
}`,
      prompt: 'What is the result of running this code?',
      answer: 'Prints **`JAVA NotString `**. Thanks to flow scoping, the compiler knows that after the early return, `obj` must be a `String`, so `s` is in scope and safely accessed.',
      verify: {
        files: {
          'FlowScope.java': `public class FlowScope {
  public static void test(Object obj) {
    if (!(obj instanceof String s)) {
      System.out.print("NotString ");
      return;
    }
    System.out.print(s.toUpperCase() + " ");
  }
  public static void main(String[] args) {
    test("java");
    test(123);
  }
}`
        },
        expect: { output: 'JAVA NotString ' }
      }
    },
    {
      code: `public class CastTest {
  public static void main(String[] args) {
    String str = "Hello";
    Integer num = (Integer) str;
    System.out.println(num);
  }
}`,
      prompt: 'What happens when compiling or running this code?',
      answer: '**Compile error.** The compiler knows that `String` and `Integer` are completely unrelated classes in the class hierarchy and neither can ever be an instance of the other.',
      verify: {
        files: {
          'CastTest.java': `public class CastTest {
  public static void main(String[] args) {
    String str = "Hello";
    Integer num = (Integer) str;
    System.out.println(num);
  }
}`
        },
        expect: 'compile-error'
      }
    },
    {
      code: `class Base {
  protected CharSequence msg() throws Exception { return "base"; }
}
class Derived extends Base {
  public String msg() throws java.io.IOException { return "derived"; }
}`,
      prompt: 'Does `Derived` legally override `msg()`?',
      answer: '**Yes, it compiles.** Access modifier is broader (`public` vs `protected`), return type is covariant (`String` is a subtype of `CharSequence`), and thrown exception is narrower (`IOException` is a subclass of `Exception`).'
    },
    {
      code: `class X {
  public boolean equals(X other) {
    return true;
  }
}
public class Main {
  public static void main(String[] args) {
    Object a = new X();
    Object b = new X();
    System.out.print(a.equals(b));
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`false`**. `equals(X other)` is an **overload**, not an override of `Object.equals(Object)`. Since the compile-time type of `a` is `Object`, `Object.equals(Object)` is called, which performs identity comparison (`==`).',
      verify: {
        files: {
          'X.java': `public class X {
  public boolean equals(X other) {
    return true;
  }
}`,
          'Main.java': `public class Main {
  public static void main(String[] args) {
    Object a = new X();
    Object b = new X();
    System.out.print(a.equals(b));
  }
}`
        },
        expect: { output: 'false' }
      }
    }
  ],

  questions: [
    {
      id: 'ch06-q01', type: 'single', difficulty: 'easy', objectiveIds: ['3e'], tags: ['overriding', 'rules'],
      question: 'Given the method `protected Number compute(int x) throws IOException`, which of the following is a legal override in a subclass?',
      code: null,
      options: [
        'public Integer compute(int x) throws FileNotFoundException',
        'Number compute(int x) throws IOException',
        'protected Object compute(int x)',
        'public Integer compute(long x) throws IOException',
        'protected Integer compute(int x) throws Exception'
      ],
      answer: [0],
      explanation: 'Option 0 is legal: access is broader (`public` >= `protected`), return type is covariant (`Integer` is a subtype of `Number`), and thrown exception is narrower (`FileNotFoundException` extends `IOException`). Option 1 narrows access to package-private. Option 2 has a broader return type (`Object`). Option 3 changes parameter to `long` (overloading). Option 4 throws broader checked `Exception`.',
      optionNotes: {
        '0': 'Valid: broader access, covariant return, narrower exception.',
        '1': 'Illegal: reduces visibility from protected to package-private.',
        '2': 'Illegal: return type must be covariant (subclass of Number).',
        '3': 'Overloads, does not override (parameter type changed).',
        '4': 'Illegal: cannot declare broader checked exception than parent.'
      },
      verify: null
    },
    {
      id: 'ch06-q02', type: 'single', difficulty: 'medium', objectiveIds: ['3b', '3e'], tags: ['initialization-order'],
      question: 'What is the output of compiling and running this program?',
      code: `class Top {
  static { System.out.print("T1 "); }
  { System.out.print("T2 "); }
  public Top() { System.out.print("T3 "); }
}
class Bottom extends Top {
  static { System.out.print("B1 "); }
  { System.out.print("B2 "); }
  public Bottom() { System.out.print("B3 "); }
  public static void main(String[] args) {
    System.out.print("GO ");
    new Bottom();
  }
}`,
      options: [
        'T1 B1 GO T2 T3 B2 B3 ',
        'GO T1 B1 T2 T3 B2 B3 ',
        'T1 T2 T3 B1 B2 B3 GO ',
        'T1 B1 GO B2 B3 T2 T3 ',
        'GO T1 T2 T3 B1 B2 B3 '
      ],
      answer: [0],
      explanation: 'Static initializers run when classes are loaded in hierarchy order (Top static -> Bottom static). Next, `main` begins printing "GO ". When `new Bottom()` executes, Top instance initializers run, followed by Top constructor body, then Bottom instance initializers, and finally Bottom constructor body.',
      optionNotes: {
        '0': 'Correct order: static Top, static Bottom, main "GO", instance Top, constructor Top, instance Bottom, constructor Bottom.',
        '1': 'Static blocks run before main is entered.',
        '2': 'Top instance blocks do not run before main.',
        '3': 'Superclass instance and constructor must run before subclass.',
        '4': 'Incorrect static initialization timing.'
      },
      verify: {
        files: {
          'Top.java': `public class Top {
  static { System.out.print("T1 "); }
  { System.out.print("T2 "); }
  public Top() { System.out.print("T3 "); }
}`,
          'Bottom.java': `public class Bottom extends Top {
  static { System.out.print("B1 "); }
  { System.out.print("B2 "); }
  public Bottom() { System.out.print("B3 "); }
  public static void main(String[] args) {
    System.out.print("GO ");
    new Bottom();
  }
}`
        },
        expect: { output: 'T1 B1 GO T2 T3 B2 B3 ' }
      }
    },
    {
      id: 'ch06-q03', type: 'single', difficulty: 'medium', objectiveIds: ['3e'], tags: ['polymorphism', 'field-hiding'],
      question: 'What does the following code print?',
      code: `class Vehicle {
  int wheels = 4;
  void print() { System.out.print(wheels + " "); }
}
class Motorcycle extends Vehicle {
  int wheels = 2;
  void print() { System.out.print(wheels + " "); }
}
public class TestDrive {
  public static void main(String[] args) {
    Vehicle v = new Motorcycle();
    System.out.print(v.wheels + " ");
    v.print();
  }
}`,
      options: ['4 2 ', '2 2 ', '4 4 ', '2 4 ', 'Does not compile'],
      answer: [0],
      explanation: 'Fields are not polymorphic; `v.wheels` accesses the field on the declared reference type `Vehicle`, which is 4. In contrast, `v.print()` is an instance method and resolves polymorphically to `Motorcycle.print()`, which accesses `Motorcycle.wheels`, printing 2.',
      optionNotes: {
        '0': 'Correct: field access uses reference type (4); overridden method uses object type (2).',
        '1': 'Field access is not polymorphic.',
        '2': 'Method call is polymorphic, not bound to Vehicle.',
        '3': 'Inverted.',
        '4': 'The code is completely legal Java.'
      },
      verify: {
        files: {
          'Vehicle.java': `public class Vehicle {
  int wheels = 4;
  void print() { System.out.print(wheels + " "); }
}`,
          'Motorcycle.java': `public class Motorcycle extends Vehicle {
  int wheels = 2;
  void print() { System.out.print(wheels + " "); }
}`,
          'TestDrive.java': `public class TestDrive {
  public static void main(String[] args) {
    Vehicle v = new Motorcycle();
    System.out.print(v.wheels + " ");
    v.print();
  }
}`
        },
        expect: { output: '4 2 ' }
      }
    },
    {
      id: 'ch06-q04', type: 'multi', difficulty: 'medium', objectiveIds: ['3e'], tags: ['instanceof', 'pattern-matching'],
      question: 'Which of the following `if` statements compile without error? (Choose all that apply.)',
      code: null,
      options: [
        'if (obj instanceof String s && s.length() > 2) {}',
        'if (obj instanceof String s || s.length() > 2) {}',
        'if (obj instanceof String s && !s.isBlank()) {}',
        'if (!(obj instanceof String s) && s.length() > 2) {}',
        'if (!(obj instanceof String s)) { throw new RuntimeException(); } else { System.out.println(s.length()); }'
      ],
      answer: [0, 2, 4],
      explanation: 'Pattern variable `s` is only in scope where `obj instanceof String` is guaranteed to have evaluated to `true`. With `&&` (options 0 and 2), the right operand only evaluates if the left is true, so `s` is in scope. In option 1 (`||`), if left is false, right evaluates where `s` is not in scope. In option 3, if `!(...)` is true, `s` was not a String. In option 4, the `else` branch only executes when `obj instanceof String` is true, so `s` is in scope.',
      optionNotes: {
        '0': 'Compiles: short-circuit && guarantees s is in scope.',
        '1': 'Does not compile: with ||, right side evaluates when s is not bound.',
        '2': 'Compiles: valid flow scoping.',
        '3': 'Does not compile: s is not in scope on the right side of !instanceof &&.',
        '4': 'Compiles: else branch executes only when pattern test succeeded.'
      },
      verify: null
    },
    {
      id: 'ch06-q05', type: 'single', difficulty: 'hard', objectiveIds: ['3b', '3e'], tags: ['constructors', 'overriding'],
      question: 'What is the output?',
      code: `class Shape {
  String name = "Shape";
  Shape() {
    draw();
  }
  void draw() {
    System.out.print(name + " ");
  }
}
class Circle extends Shape {
  String name = "Circle";
  void draw() {
    System.out.print(name + " ");
  }
  public static void main(String[] args) {
    new Circle();
  }
}`,
      options: ['Shape ', 'Circle ', 'null ', 'null Circle ', 'Does not compile'],
      answer: [2],
      explanation: 'When `new Circle()` is created, `Shape` constructor runs. It calls `draw()`, which resolves polymorphically to `Circle.draw()`. In `Circle`, the field `name` has not yet been initialized to `"Circle"`, so it contains its default value `null`. Prints `null `.',
      optionNotes: {
        '0': 'Method is overridden, so Circle.draw() runs, not Shape.draw().',
        '1': 'Circle.name is not yet initialized when super constructor runs.',
        '2': 'Correct: prints null because instance field initialization happens after super constructor.',
        '3': 'draw() is called only once.',
        '4': 'Code compiles without warning or error.'
      },
      verify: {
        files: {
          'Shape.java': `public class Shape {
  String name = "Shape";
  Shape() {
    draw();
  }
  void draw() {
    System.out.print(name + " ");
  }
}`,
          'Circle.java': `public class Circle extends Shape {
  String name = "Circle";
  void draw() {
    System.out.print(name + " ");
  }
  public static void main(String[] args) {
    new Circle();
  }
}`
        },
        expect: { output: 'null ' }
      }
    },
    {
      id: 'ch06-q06', type: 'single', difficulty: 'easy', objectiveIds: ['3e'], tags: ['abstract', 'syntax'],
      question: 'Which modifier combination is legal for an abstract method declaration in an abstract class?',
      code: null,
      options: [
        'protected abstract void work();',
        'private abstract void work();',
        'public static abstract void work();',
        'public final abstract void work();',
        'default abstract void work();'
      ],
      answer: [0],
      explanation: 'An abstract method can be `public` or `protected` (or package-private). It cannot be `private` (cannot be overridden), `static` (cannot be overridden polymorphically), `final` (cannot be overridden), or `default` (only legal in interfaces with a body).',
      optionNotes: {
        '0': 'Legal: protected abstract methods are allowed.',
        '1': 'Illegal combination: private and abstract.',
        '2': 'Illegal combination: static and abstract.',
        '3': 'Illegal combination: final and abstract.',
        '4': 'default methods exist only in interfaces and must have a body.'
      },
      verify: null
    },
    {
      id: 'ch06-q07', type: 'single', difficulty: 'medium', objectiveIds: ['3e'], tags: ['method-hiding', 'static'],
      question: 'What is the output?',
      code: `class Alpha {
  static void print() { System.out.print("Alpha "); }
}
class Beta extends Alpha {
  static void print() { System.out.print("Beta "); }
}
public class TestHiding {
  public static void main(String[] args) {
    Alpha a = new Beta();
    Beta b = new Beta();
    a.print();
    b.print();
  }
}`,
      options: ['Alpha Beta ', 'Beta Beta ', 'Alpha Alpha ', 'Beta Alpha ', 'Compile error'],
      answer: [0],
      explanation: 'Static methods are hidden, not overridden. Calling `a.print()` resolves at compile time to the static method of class `Alpha` (the reference type). Calling `b.print()` resolves to `Beta.print()`. Output is `Alpha Beta `.',
      optionNotes: {
        '0': 'Correct: static dispatch relies on reference type.',
        '1': 'Static methods are not polymorphic.',
        '2': 'b is of type Beta, so b.print() invokes Beta.print().',
        '3': 'Inverted.',
        '4': 'Static method hiding is completely valid.'
      },
      verify: {
        files: {
          'Alpha.java': `public class Alpha {
  public static void print() { System.out.print("Alpha "); }
}`,
          'Beta.java': `public class Beta extends Alpha {
  public static void print() { System.out.print("Beta "); }
}`,
          'TestHiding.java': `public class TestHiding {
  public static void main(String[] args) {
    Alpha a = new Beta();
    Beta b = new Beta();
    a.print();
    b.print();
  }
}`
        },
        expect: { output: 'Alpha Beta ' }
      }
    },
    {
      id: 'ch06-q08', type: 'single', difficulty: 'medium', objectiveIds: ['3b'], tags: ['constructors', 'chaining'],
      question: 'Consider the class definition below. Which line causes a compile error?',
      code: `class Tree {
  int age;
  Tree() {
    this(10);             // line 1
  }
  Tree(int age) {
    System.out.print("T");
    super();              // line 2
  }
  Tree(int age, String s) {
    this();
    this(age);            // line 3
  }
}`,
      options: ['line 1 only', 'line 2 only', 'line 3 only', 'line 2 and line 3', 'line 1, line 2 and line 3'],
      answer: [3],
      explanation: 'Line 2 causes an error because `super()` must be the first statement in the constructor body (not after `System.out.print`). Line 3 causes an error because a constructor cannot contain two calls to `this()`, and `this(...)` must be the first statement.',
      optionNotes: {
        '0': 'Line 1 is legal: this(10) is the first statement.',
        '1': 'Line 3 is also an error.',
        '2': 'Line 2 is also an error.',
        '3': 'Correct: line 2 violates super() as first statement; line 3 violates this() as first statement and multiple this() calls.',
        '4': 'Line 1 compiles fine.'
      },
      verify: null
    },
    {
      id: 'ch06-q09', type: 'single', difficulty: 'medium', objectiveIds: ['3e'], tags: ['casting', 'class-cast'],
      question: 'What is the result of running this code?',
      code: `class Mammal {}
class FurryMammal extends Mammal {}
class Dog extends FurryMammal {}
class Cat extends FurryMammal {}

public class Vet {
  public static void main(String[] args) {
    Mammal m = new Dog();
    FurryMammal f = (FurryMammal) m;
    Cat c = (Cat) f;
    System.out.print("OK");
  }
}`,
      options: [
        'Prints OK',
        'Compile error at line: FurryMammal f = (FurryMammal) m;',
        'Compile error at line: Cat c = (Cat) f;',
        'Throws ClassCastException at runtime',
        'Throws NullPointerException at runtime'
      ],
      answer: [3],
      explanation: 'All casts compile because all types are in the same inheritance tree. At runtime, `m` is an instance of `Dog`. Downcasting `m` to `FurryMammal` succeeds because `Dog` extends `FurryMammal`. However, downcasting `f` (which is a `Dog`) to `Cat` fails at runtime with `ClassCastException`.',
      optionNotes: {
        '0': 'Fails at runtime when attempting to cast Dog to Cat.',
        '1': 'Compiles fine: Mammal and FurryMammal are related.',
        '2': 'Compiles fine: Cat and FurryMammal are related in the hierarchy.',
        '3': 'Correct: ClassCastException thrown at runtime.',
        '4': 'No references are null.'
      },
      verify: {
        files: {
          'Vet.java': `class Mammal {}
class FurryMammal extends Mammal {}
class Dog extends FurryMammal {}
class Cat extends FurryMammal {}
public class Vet {
  public static void main(String[] args) {
    Mammal m = new Dog();
    FurryMammal f = (FurryMammal) m;
    Cat c = (Cat) f;
    System.out.print("OK");
  }
}`
        },
        expect: 'runtime-exception'
      }
    },
    {
      id: 'ch06-q10', type: 'single', difficulty: 'hard', objectiveIds: ['3e'], tags: ['equals', 'object-contract'],
      question: 'Given the class below, what is the output?',
      code: `class Item {
  int id;
  Item(int id) { this.id = id; }
  public boolean equals(Item other) {
    return this.id == other.id;
  }
}
public class Inventory {
  public static void main(String[] args) {
    Item i1 = new Item(5);
    Item i2 = new Item(5);
    Object o1 = i1;
    Object o2 = i2;
    System.out.print(i1.equals(i2) + " ");
    System.out.print(o1.equals(o2));
  }
}`,
      options: ['true true', 'true false', 'false false', 'false true', 'Compile error'],
      answer: [1],
      explanation: '`equals(Item other)` overloads, rather than overrides, `Object.equals(Object)`. When calling `i1.equals(i2)`, compile-time argument is `Item`, so the overloaded method matches and returns `true`. When calling `o1.equals(o2)`, compile-time type of `o1` is `Object` and argument is `Object`, so `Object.equals(Object)` is called. Since `Item` never overrode `Object.equals(Object)`, reference equality (`==`) is performed, returning `false`.',
      optionNotes: {
        '0': 'o1.equals(o2) does not call equals(Item) because Item does not override Object.equals(Object).',
        '1': 'Correct: i1.equals(i2) calls the overload (true); o1.equals(o2) calls Object.equals(Object) (false).',
        '2': 'i1.equals(i2) evaluates to true.',
        '3': 'Inverted.',
        '4': 'The code is valid and compiles without error.'
      },
      verify: {
        files: {
          'Item.java': `public class Item {
  int id;
  public Item(int id) { this.id = id; }
  public boolean equals(Item other) {
    return this.id == other.id;
  }
}`,
          'Inventory.java': `public class Inventory {
  public static void main(String[] args) {
    Item i1 = new Item(5);
    Item i2 = new Item(5);
    Object o1 = i1;
    Object o2 = i2;
    System.out.print(i1.equals(i2) + " ");
    System.out.print(o1.equals(o2));
  }
}`
        },
        expect: { output: 'true false' }
      }
    },
    {
      id: 'ch06-q11', type: 'single', difficulty: 'easy', objectiveIds: ['3e'], tags: ['polymorphism', 'instanceof'],
      question: 'What is the value of `result` after executing the snippet below?',
      code: `String s = null;
boolean result = s instanceof Object;`,
      options: ['true', 'false', 'Throws NullPointerException', 'Does not compile'],
      answer: [1],
      explanation: '`null instanceof AnyType` always evaluates to `false` and never throws an exception.',
      optionNotes: {
        '0': 'null is never an instance of any class or interface.',
        '1': 'Correct: null instanceof any type evaluates to false.',
        '2': 'instanceof is null-safe and does not throw NPE.',
        '3': 'The expression is completely legal.'
      },
      verify: {
        files: {
          'Main.java': `public class Main {
  public static void main(String[] args) {
    String s = null;
    boolean result = s instanceof Object;
    System.out.print(result);
  }
}`
        },
        expect: { output: 'false' }
      }
    },
    {
      id: 'ch06-q12', type: 'multi', difficulty: 'medium', objectiveIds: ['3b', '3e'], tags: ['abstract', 'rules'],
      question: 'Which statements about abstract classes are TRUE? (Choose all that apply.)',
      code: null,
      options: [
        'An abstract class can declare constructors.',
        'An abstract class must contain at least one abstract method.',
        'A class with at least one abstract method must be declared abstract.',
        'An abstract class can be declared with the final modifier.',
        'A concrete subclass must implement all abstract methods inherited from an abstract superclass.'
      ],
      answer: [0, 2, 4],
      explanation: 'An abstract class can have constructors (invoked via `super()` by subclasses). It is not required to have any abstract methods. However, if any abstract method exists, the class must be declared abstract. An abstract class cannot be `final`. The first concrete subclass must implement all inherited abstract methods.',
      optionNotes: {
        '0': 'True: abstract classes frequently have constructors for initializing shared fields.',
        '1': 'False: an abstract class may have zero abstract methods.',
        '2': 'True: any class containing an abstract method must be marked abstract.',
        '3': 'False: final and abstract cannot be combined.',
        '4': 'True: concrete subclasses must implement all unimplemented abstract methods.'
      },
      verify: null
    },
    {
      id: 'ch06-q13', type: 'single', difficulty: 'medium', objectiveIds: ['3e'], tags: ['method-overriding', 'exceptions'],
      question: 'Consider the classes below. Which line in `Child` fails to compile?',
      code: `class Parent {
  void step1() throws java.io.IOException {}
  void step2() {}
  void step3() throws RuntimeException {}
}
class Child extends Parent {
  void step1() {}                                     // line A
  void step2() throws NullPointerException {}         // line B
  void step3() throws Exception {}                    // line C
}`,
      options: ['line A', 'line B', 'line C', 'line A and line C', 'None; all compile'],
      answer: [2],
      explanation: 'Line A is legal because an overriding method can declare fewer or no checked exceptions. Line B is legal because `NullPointerException` is an unchecked runtime exception (overriding methods can throw any runtime exception). Line C fails to compile because `Exception` is a checked exception that is broader than what `Parent.step3()` declared (`RuntimeException` is unchecked, while checked `Exception` is not allowed).',
      optionNotes: {
        '0': 'Declaring fewer checked exceptions is valid.',
        '1': 'Unchecked exceptions are unrestricted.',
        '2': 'Correct: line C declares new/broader checked Exception.',
        '3': 'Line A is completely legal.',
        '4': 'Line C does not compile.'
      },
      verify: null
    },
    {
      id: 'ch06-q14', type: 'single', difficulty: 'medium', objectiveIds: ['3e'], tags: ['pattern-matching', 'scope'],
      question: 'What happens when compiling and executing the code below?',
      code: `public class Matcher {
  public static void main(String[] args) {
    Object val = "Java 17";
    if (val instanceof String s && s.length() > 5) {
      System.out.print(s + " OK");
    }
  }
}`,
      options: ['Prints: Java 17 OK', 'Prints: OK', 'Compile error: variable s is used before initialization', 'Compile error: pattern matching in if conditions requires casting', 'Runtime exception'],
      answer: [0],
      explanation: 'Pattern matching for instanceof binds `s` to `"Java 17"` upon matching. With `&&`, `s` is in scope for the rest of the boolean expression and the `if` body. Output is `Java 17 OK`.',
      optionNotes: {
        '0': 'Correct: pattern variable s is in scope and bound.',
        '1': 'Prints s + " OK", which includes "Java 17 ".',
        '2': 's is bound by the pattern match.',
        '3': 'Java 16+ supports pattern matching for instanceof directly.',
        '4': 'No exception is thrown.'
      },
      verify: {
        files: {
          'Matcher.java': `public class Matcher {
  public static void main(String[] args) {
    Object val = "Java 17";
    if (val instanceof String s && s.length() > 5) {
      System.out.print(s + " OK");
    }
  }
}`
        },
        expect: { output: 'Java 17 OK' }
      }
    },
    {
      id: 'ch06-q15', type: 'single', difficulty: 'hard', objectiveIds: ['3a', '3b'], tags: ['initialization', 'shadowing'],
      question: 'What is the output of running this program?',
      code: `class Alpha {
  int num = 1;
  Alpha() {
    System.out.print(getNum() + " ");
  }
  int getNum() { return num; }
}
class Beta extends Alpha {
  int num = 2;
  Beta() {
    System.out.print(getNum() + " ");
  }
  int getNum() { return num; }
  public static void main(String[] args) {
    new Beta();
  }
}`,
      options: ['1 2 ', '0 2 ', '2 2 ', '0 0 ', '1 1 '],
      answer: [1],
      explanation: 'When `new Beta()` runs, `Alpha` constructor executes first. It calls `getNum()`, which is polymorphically overridden in `Beta`. In `Beta`, `num` has not yet been initialized to 2 (instance initialization occurs after `super()` returns), so `Beta.num` is its default value 0. Then `Beta` constructor body runs, and `getNum()` returns 2. Output is `0 2 `.',
      optionNotes: {
        '0': 'Alpha constructor calls Beta.getNum(), not Alpha.getNum().',
        '1': 'Correct: Beta.num is 0 during Alpha constructor, then 2 during Beta constructor.',
        '2': 'Beta.num is not yet 2 when Alpha constructor runs.',
        '3': 'Beta.num is 2 by the time Beta constructor body runs.',
        '4': 'getNum() is polymorphically bound to Beta.'
      },
      verify: {
        files: {
          'Alpha.java': `public class Alpha {
  int num = 1;
  public Alpha() {
    System.out.print(getNum() + " ");
  }
  public int getNum() { return num; }
}`,
          'Beta.java': `public class Beta extends Alpha {
  int num = 2;
  public Beta() {
    System.out.print(getNum() + " ");
  }
  public int getNum() { return num; }
  public static void main(String[] args) {
    new Beta();
  }
}`
        },
        expect: { output: '0 2 ' }
      }
    },
    {
      id: 'ch06-q16', type: 'single', difficulty: 'medium', objectiveIds: ['3e'], tags: ['polymorphism', 'interfaces'],
      question: 'Which statement about method overriding and access modifiers is correct?',
      code: null,
      options: [
        'A package-private method can only be overridden by another package-private method.',
        'A protected method can be overridden by a public or protected method.',
        'A public method can be overridden by a protected method.',
        'A private method can be overridden by a private method in a subclass.',
        'A protected method cannot be overridden outside its declaring package.'
      ],
      answer: [1],
      explanation: 'An overriding method can never assign a weaker access privilege. A `protected` method can be overridden with `protected` or `public` access.',
      optionNotes: {
        '0': 'Package-private can be overridden by protected or public as well.',
        '1': 'Correct: equal or broader access is allowed.',
        '2': 'Narrowing from public to protected is a compile error.',
        '3': 'Private methods cannot be overridden.',
        '4': 'A subclass in another package can override a protected method.'
      },
      verify: null
    },
    {
      id: 'ch06-q17', type: 'single', difficulty: 'medium', objectiveIds: ['3e'], tags: ['pattern-matching', 'compiler-error'],
      question: 'What is the result of compiling this code snippet?',
      code: `public class TestPattern {
  public static void check(String s) {
    if (s instanceof String str) {
      System.out.println(str.length());
    }
  }
}`,
      options: [
        'Compiles without error',
        'Compile error: expression type String is a subtype of the pattern type String',
        'Compile error: variable str is already defined',
        'Runtime exception when s is null',
        'Does not compile: instanceof pattern requires an Object variable'
      ],
      answer: [1],
      explanation: 'In Java 16+, pattern matching for instanceof requires that the expression type cannot be a subtype of the pattern type. Because `s` is already statically known to be a `String`, testing `s instanceof String str` is illegal and produces a compile-time error: "expression type java.lang.String is a subtype of the pattern type java.lang.String".',
      optionNotes: {
        '0': 'Does not compile due to redundant pattern matching.',
        '1': 'Correct: compiler forbids pattern match when expression type is already a subtype of pattern type.',
        '2': 'str is not yet defined elsewhere.',
        '3': 'Does not reach runtime.',
        '4': 'It can be any supertype or interface, not just Object, but must not already be a subtype.'
      },
      verify: {
        files: {
          'TestPattern.java': `public class TestPattern {
  public static void check(String s) {
    if (s instanceof String str) {
      System.out.println(str.length());
    }
  }
}`
        },
        expect: 'compile-error'
      }
    },
    {
      id: 'ch06-q18', type: 'single', difficulty: 'easy', objectiveIds: ['3e'], tags: ['final-methods'],
      question: 'What happens when compiling this code?',
      code: `class Parent {
  final void work() {}
}
class Child extends Parent {
  void work() {}
}`,
      options: [
        'Compiles successfully',
        'Compile error: work() in Child cannot override work() in Parent because it is final',
        'Compile error: final methods cannot have package-private access',
        'Compiles with a warning',
        'Runtime error when Child is loaded'
      ],
      answer: [1],
      explanation: 'A `final` method cannot be overridden by any subclass. Attempting to override it results in a compile-time error.',
      optionNotes: {
        '0': 'Cannot override a final method.',
        '1': 'Correct: final prevents overriding.',
        '2': 'Final methods can have any access modifier.',
        '3': 'It is a compile error, not a warning.',
        '4': 'Caught at compile time.'
      },
      verify: {
        files: {
          'Test.java': `class Parent { final void work() {} }
class Child extends Parent { void work() {} }`
        },
        expect: 'compile-error'
      }
    },
    {
      id: 'ch06-q19', type: 'single', difficulty: 'hard', objectiveIds: ['3e'], tags: ['polymorphism', 'casting'],
      question: 'Consider the interfaces and classes below:',
      code: `interface Swimmer {}
class Animal {}
class Fish extends Animal implements Swimmer {}

public class Aquarium {
  public static void main(String[] args) {
    Animal a = new Animal();
    Swimmer s = (Swimmer) a;
    System.out.println("Success");
  }
}`,
      options: [
        'Compile error: Animal cannot be cast to Swimmer',
        'Prints Success',
        'Throws ClassCastException at runtime',
        'Throws NullPointerException at runtime',
        'Compile error: Animal does not implement Swimmer'
      ],
      answer: [2],
      explanation: 'In Java, the compiler permits casting any non-final class reference to an interface, because a subclass of `Animal` (like `Fish`) could implement `Swimmer`. Therefore, `(Swimmer) a` compiles! But at runtime, `a` is an instance of `Animal` which does not implement `Swimmer`, so a `ClassCastException` is thrown.',
      optionNotes: {
        '0': 'Compiles because Animal is not final; a subclass could implement Swimmer.',
        '1': 'Animal does not implement Swimmer at runtime.',
        '2': 'Correct: compiles fine, throws ClassCastException at runtime.',
        '3': 'No null references involved.',
        '4': 'Compiler allows interface casting for non-final classes.'
      },
      verify: {
        files: {
          'Aquarium.java': `interface Swimmer {}
class Animal {}
class Fish extends Animal implements Swimmer {}
public class Aquarium {
  public static void main(String[] args) {
    Animal a = new Animal();
    Swimmer s = (Swimmer) a;
    System.out.println("Success");
  }
}`
        },
        expect: 'runtime-exception'
      }
    },
    {
      id: 'ch06-q20', type: 'single', difficulty: 'medium', objectiveIds: ['3e'], tags: ['hashcode', 'equals'],
      question: 'Which of the following implementations of `hashCode()` violates the general contract of `hashCode` if `equals` compares `id`?',
      code: `class Account {
  int id;
  String holder;
  public boolean equals(Object o) {
    if (!(o instanceof Account a)) return false;
    return this.id == a.id;
  }
  // hashCode implementations below
}`,
      options: [
        'public int hashCode() { return 42; }',
        'public int hashCode() { return id; }',
        'public int hashCode() { return id * 31; }',
        'public int hashCode() { return holder == null ? 0 : holder.hashCode(); }',
        'public int hashCode() { return Integer.hashCode(id); }'
      ],
      answer: [3],
      explanation: 'The contract specifies: if `x.equals(y)` is true, then `x.hashCode() == y.hashCode()` must be true. Since `equals` compares only `id`, two accounts with the same `id` but different `holder` names are equal. Option 3 bases `hashCode` solely on `holder`, meaning two equal objects could return different hash codes, violating the contract! (Returning a constant like 42 is poor for performance but technically legal under the contract).',
      optionNotes: {
        '0': 'Legal: always returns the same hash code for equal objects (though poor hash distribution).',
        '1': 'Legal: consistent with equals(id).',
        '2': 'Legal: consistent with equals(id).',
        '3': 'Violates contract: equal objects (same id) can have different holder values and thus different hash codes.',
        '4': 'Legal: standard integer hash code.'
      },
      verify: null
    },
    {
      id: 'ch06-q21', type: 'single', difficulty: 'medium', objectiveIds: ['3e'], tags: ['overriding', 'static-instance'],
      question: 'What happens when compiling the following code?',
      code: `class Machine {
  public static void start() {}
}
class Robot extends Machine {
  public void start() {}
}`,
      options: [
        'Compiles without error',
        'Compile error: instance method start() in Robot cannot override static method start() in Machine',
        'Compile error: Machine must be declared abstract',
        'Compiles if Robot.start() is marked with @Override',
        'Compiles if start() in Machine is made protected'
      ],
      answer: [1],
      explanation: 'An instance method cannot override a static method. Similarly, a static method cannot hide an instance method. Both produce compile-time errors.',
      optionNotes: {
        '0': 'Cannot mix static and instance methods with identical signatures in inheritance.',
        '1': 'Correct: compile error for instance method overriding static method.',
        '2': 'Machine does not need to be abstract.',
        '3': '@Override would still produce a compile error.',
        '4': 'Access modifier is not the reason for the error.'
      },
      verify: {
        files: {
          'Test.java': `class Machine { public static void start() {} }
class Robot extends Machine { public void start() {} }`
        },
        expect: 'compile-error'
      }
    },
    {
      id: 'ch06-q22', type: 'single', difficulty: 'hard', objectiveIds: ['3b', '3e'], tags: ['initialization', 'static'],
      question: 'What does this program print?',
      code: `class Parent {
  static int count = 10;
  static {
    count += 5;
  }
}
class Child extends Parent {
  static {
    count *= 2;
  }
  public static void main(String[] args) {
    System.out.print(Child.count);
  }
}`,
      options: ['30', '10', '15', '20', 'Compile error'],
      answer: [0],
      explanation: 'When `Child` is referenced in `main`, `Parent` is initialized first: `count` starts at 10, then `Parent` static block adds 5 (`count` becomes 15). Then `Child` is initialized: `Child` static block multiplies `count` by 2 (`count` becomes 30). Prints 30.',
      optionNotes: {
        '0': 'Correct: (10 + 5) * 2 = 30.',
        '1': 'Static blocks run and modify count.',
        '2': 'Child static block also runs.',
        '3': 'Parent static block adds 5 before doubling.',
        '4': 'Valid static inheritance.'
      },
      verify: {
        files: {
          'Parent.java': `public class Parent {
  public static int count = 10;
  static { count += 5; }
}`,
          'Child.java': `public class Child extends Parent {
  static { count *= 2; }
  public static void main(String[] args) {
    System.out.print(Child.count);
  }
}`
        },
        expect: { output: '30' }
      }
    },
    {
      id: 'ch06-q23', type: 'multi', difficulty: 'hard', objectiveIds: ['3e'], tags: ['pattern-matching', 'flow-scoping'],
      question: 'Which lines compile successfully? (Choose all that apply.)',
      code: `public class PatternTest {
  public static void run(Object o) {
    // line 1
    if (o instanceof String s) System.out.println(s);
    // line 2
    if (!(o instanceof String s)) throw new IllegalArgumentException();
    System.out.println(s);
    // line 3
    if (o instanceof Integer i || i > 0) {}
  }
}`,
      options: ['line 1', 'line 2', 'line 3'],
      answer: [0, 1],
      explanation: 'Line 1 is valid: `s` is in scope in the single statement `if` body. Line 2 is valid: because the `if` body throws an exception, any code following the `if` can only be reached if `o instanceof String` was true, so `s` remains in scope! Line 3 fails to compile: in an `||` expression, `i` is not in scope for the right operand because the right operand evaluates when the pattern match was false.',
      optionNotes: {
        '0': 'Compiles: standard pattern match in if statement.',
        '1': 'Compiles: flow scoping allows s after unconditional early exit (throw).',
        '2': 'Does not compile: pattern variable cannot be used on right side of ||.'
      },
      verify: null
    },
    {
      id: 'ch06-q24', type: 'single', difficulty: 'easy', objectiveIds: ['3a', '3b'], tags: ['constructors', 'default'],
      question: 'Which class has a compiler-generated default constructor?',
      code: `class C1 { public C1() {} }
class C2 { C2(int x) {} }
class C3 { void C3() {} }
class C4 { private C4(String s) {} }`,
      options: ['C1', 'C2', 'C3', 'C4', 'None of them'],
      answer: [2],
      explanation: '`C3` defines a method `void C3()`, NOT a constructor (it has a return type). Because `C3` declares no constructor at all, the compiler provides a default no-argument constructor `public C3() {}` (or package-private if class is package-private). `C1`, `C2`, and `C4` all declare explicit constructors, so no default constructor is generated.',
      optionNotes: {
        '0': 'Explicit constructor defined.',
        '1': 'Explicit constructor defined.',
        '2': 'Correct: void C3() is a method, so the compiler generates a default constructor.',
        '3': 'Explicit private constructor defined.',
        '4': 'C3 receives a default constructor.'
      },
      verify: null
    },
    {
      id: 'ch06-q25', type: 'single', difficulty: 'medium', objectiveIds: ['3e'], tags: ['polymorphism', 'override'],
      question: 'What is the output?',
      code: `class Writer {
  public static void write() { System.out.print("Writing..."); }
}
class Author extends Writer {
  public static void write() { System.out.print("Writing book..."); }
}
public class Program {
  public static void main(String[] args) {
    Writer w = new Author();
    w.write();
    Author a = (Author) w;
    a.write();
  }
}`,
      options: [
        'Writing...Writing book...',
        'Writing book...Writing book...',
        'Writing...Writing...',
        'Writing book...Writing...',
        'Compile error'
      ],
      answer: [0],
      explanation: 'Static methods are hidden and not polymorphic. Calls are bound at compile time based on the reference type. `w.write()` invokes `Writer.write()` printing "Writing...". `a.write()` invokes `Author.write()` printing "Writing book...".',
      optionNotes: {
        '0': 'Correct: w is reference type Writer; a is reference type Author.',
        '1': 'Static methods do not dispatch polymorphically.',
        '2': 'a.write() uses Author reference type.',
        '3': 'Inverted.',
        '4': 'Code compiles and runs cleanly.'
      },
      verify: {
        files: {
          'Writer.java': `public class Writer {
  public static void write() { System.out.print("Writing..."); }
}`,
          'Author.java': `public class Author extends Writer {
  public static void write() { System.out.print("Writing book..."); }
}`,
          'Program.java': `public class Program {
  public static void main(String[] args) {
    Writer w = new Author();
    w.write();
    Author a = (Author) w;
    a.write();
  }
}`
        },
        expect: { output: 'Writing...Writing book...' }
      }
    }
  ],

  checklist: [
    'I know every constructor begins with this(...) or super(...), and super() is inserted automatically if omitted.',
    'I know why a subclass fails to compile if its superclass lacks a no-argument constructor.',
    'I can trace the 6-step initialization order across class hierarchies including static vs instance initializers.',
    'I know that parent constructor runs before child constructor body, and calling overridden methods from a constructor sees uninitialized child fields.',
    'I know the 5 rules for method overriding: signature, covariant return, broader/equal access, narrower/fewer checked exceptions, and non-final.',
    'I understand the difference between overriding instance methods and hiding static methods.',
    'I know that instance fields and static members are never polymorphic and depend solely on reference type.',
    'I can spot illegal modifier combinations for abstract methods: private abstract, final abstract, and static abstract.',
    'I know when casting between classes causes a compile error (unrelated classes) vs ClassCastException at runtime.',
    'I understand Java 16+ pattern matching for instanceof and its flow scoping rules (&& vs ||, early return, throw).',
    'I know why testing \`s instanceof String str\` where s is already declared String is a compile error.',
    'I can properly override equals(Object) and know why equals(MyClass) is an overload trap.',
    'I know the equals() and hashCode() contract and know that null instanceof Anything is always false.'
  ]
});
