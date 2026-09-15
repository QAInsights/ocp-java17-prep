OCP.registerChapter({
  id: 9,
  slug: 'collections-and-generics',
  title: 'Collections & Generics',
  objectiveIds: ['5', '12c'],
  intro: `Objectives **5** (arrays, List, Set, Map, and Deque collections, adding, removing, updating, retrieving, sorting) and **12c** (generics, including wildcards and bounds). Collections and Generics form a major portion of the 1Z0-829 exam. High-frequency exam questions test the modern \`Map\` methods (\`merge\`, \`computeIfAbsent\`, \`computeIfPresent\`), unmodifiable factory methods (\`List.of\`, \`Set.of\`, \`Map.of\`), Deque stack vs queue operations, sorting with \`Comparable\` vs \`Comparator\`, and generic wildcard rules (unbounded \`?\`, upper-bounded \`? extends T\`, lower-bounded \`? super T\`).`,

  notes: [
    {
      id: 'collections-hierarchy',
      title: 'The Collections Framework hierarchy',
      md: `## Core interfaces

\`\`\`
Iterable<E>
  └── Collection<E>
        ├── List<E>          (ordered sequence, allows duplicates, index-based access)
        ├── Set<E>           (no duplicates, at most one null depending on impl)
        │     └── SortedSet<E> ── NavigableSet<E> ── TreeSet<E>
        └── Queue<E>         (FIFO processing order)
              └── Deque<E>   (double-ended queue: FIFO queue or LIFO stack)
\`\`\`

* **Important**: \`Map<K, V>\` is part of the Collections Framework, but does **not** implement \`Collection\` or \`Iterable\`!

## Implementations summary

| Interface | Implementation | Characteristics | Ordering / Sorting | Nulls allowed? |
|---|---|---|---|---|
| **List** | \`ArrayList\` | Fast random access, backed by array | Insertion order | Yes |
| **List** | \`LinkedList\` | Implements both \`List\` and \`Deque\` | Insertion order | Yes |
| **Set** | \`HashSet\` | Uses \`hashCode()\` and \`equals()\` | No guaranteed order | Yes (at most 1) |
| **Set** | \`LinkedHashSet\`| Hash table with linked list | Insertion order | Yes (at most 1) |
| **Set** | \`TreeSet\` | Red-black tree, implements \`NavigableSet\` | Natural or Comparator | **NO** (throws NPE) |
| **Queue/Deque**| \`ArrayDeque\` | Resizable array deque | FIFO / LIFO | **NO** (throws NPE) |
| **Map** | \`HashMap\` | Key hash table | No guaranteed order | Yes (1 null key) |
| **Map** | \`LinkedHashMap\`| Insertion-ordered hash map | Insertion order | Yes (1 null key) |
| **Map** | \`TreeMap\` | Red-black tree, implements \`NavigableMap\` | Sorted by keys | **NO null keys** |`
    },
    {
      id: 'factory-methods',
      title: 'Collection factories: List.of vs Arrays.asList',
      md: `## Comparison of list creation approaches

| Feature | \`new ArrayList<>()\` | \`Arrays.asList(...)\` | \`List.of(...)\` / \`List.copyOf(...)\` |
|---|---|---|---|
| **Mutability** | Fully mutable | Fixed-size (values can change) | **Immutable** (unmodifiable) |
| **Add / Remove** | Allowed | Throws \`UnsupportedOperationException\` | Throws \`UnsupportedOperationException\` |
| **set(index, val)** | Allowed | **Allowed** (updates backed array) | Throws \`UnsupportedOperationException\` |
| **Null allowed?** | Yes | Yes | **NO** (throws \`NullPointerException\`) |
| **Backed by array** | No (copies) | **Yes** (mutation reflects in array) | No (independent copy) |

### Set.of and Map.of traps
* \`Set.of("a", "a")\` throws **\`IllegalArgumentException\`** at runtime because duplicates are forbidden!
* \`Map.of("k1", "v1", "k1", "v2")\` throws **\`IllegalArgumentException\`** for duplicate keys.
* Both throw **\`NullPointerException\`** if any element, key, or value is \`null\`.`
    },
    {
      id: 'deque-methods',
      title: 'Deque: Queue vs Stack semantics',
      md: `A \`Deque\` (double-ended queue) can be used either as a **FIFO Queue** or a **LIFO Stack**.

## 1. FIFO Queue usage (First-In, First-Out)
* **Insert at tail**: \`offer(e)\` (returns false if full) or \`add(e)\` (throws exception)
* **Remove from head**: \`poll()\` (returns null if empty) or \`remove()\` (throws exception)
* **Examine head**: \`peek()\` (returns null if empty) or \`element()\` (throws exception)

## 2. LIFO Stack usage (Last-In, First-Out)
* **Push onto top (front)**: \`push(e)\` – inserts element at the **head** (beginning)!
* **Pop from top (front)**: \`pop()\` – removes element from the **head** (throws exception if empty)!
* **Peek top**: \`peek()\` – inspects head without removing.

## 3. Explicit positional methods
\`offerFirst\` / \`offerLast\`, \`pollFirst\` / \`pollLast\`, \`peekFirst\` / \`peekLast\`.

*Exam Trap*:
\`\`\`java
Deque<String> d = new ArrayDeque<>();
d.push("A");
d.push("B");
System.out.println(d.poll()); // Prints "B" because push puts at the front and poll removes from the front!
\`\`\``
    },
    {
      id: 'map-methods',
      title: 'Modern Map methods: merge, compute, and replace',
      md: `The 1Z0-829 exam heavily tests the following methods added to \`Map\`:

### 1. \`putIfAbsent(K key, V value)\`
* If \`key\` is not present or mapped to \`null\`, puts \`value\` and returns \`null\`.
* If \`key\` is already mapped to a non-null value, does nothing and returns the **existing value**.

### 2. \`merge(K key, V value, BiFunction<V, V, V> remappingFunction)\`
* If key is **absent or mapped to null**: puts \`value\` directly (remapping function is **NOT** called).
* If key is **present with non-null value**: calls \`remappingFunction.apply(existingValue, value)\`.
  * If the remapping function returns a non-null value: updates key to that value.
  * If the remapping function returns **\`null\`**: **removes** the key from the map!

### 3. \`computeIfAbsent(K key, Function<K, V> mappingFunction)\`
* Called only if the key is **not present or mapped to null**.
* Mapping function receives the \`key\`. If it returns non-null, associates key with the result.

### 4. \`computeIfPresent(K key, BiFunction<K, V, V> remappingFunction)\`
* Called only if the key is **present and mapped to a non-null value**.
* If remapping function returns \`null\`, the key is **removed** from the map!

### 5. \`compute(K key, BiFunction<K, V, V> remappingFunction)\`
* Always called regardless of whether key is present or not. Current value is passed (or \`null\` if absent).
* If remapping function returns \`null\`, the key is removed (or remains absent).`
    },
    {
      id: 'sorting',
      title: 'Comparable and Comparator',
      md: `## Comparable<T> (java.lang)
* Defines the **natural ordering** of a class.
* Single method: \`int compareTo(T other)\`.
* Returns:
  * Negative int if \`this < other\`
  * 0 if \`this.equals(other)\` (recommended consistency)
  * Positive int if \`this > other\`

## Comparator<T> (java.util)
* Defines **alternative custom orderings**.
* Functional interface with abstract method: \`int compare(T o1, T o2)\`.
* Useful static & default helper methods:
  * \`Comparator.comparing(Function<T, U> keyExtractor)\`
  * \`thenComparing(Function<T, U> secondaryExtractor)\`
  * \`reversed()\`
  * \`Comparator.naturalOrder()\` and \`Comparator.reverseOrder()\`
  * \`Comparator.nullsFirst(Comparator)\` and \`Comparator.nullsLast(Comparator)\`

### Sorting lists and arrays
* \`Collections.sort(list)\` (requires elements to implement \`Comparable\`).
* \`list.sort(comparator)\` (takes explicit \`Comparator\`; pass \`null\` for natural order).
* Binary search (\`Collections.binarySearch(list, key)\`):
  * List **must be sorted** in ascending natural/comparator order first.
  * If found: returns index \`>= 0\`.
  * If not found: returns \`(-insertionPoint - 1)\`.`
    },
    {
      id: 'generics-and-wildcards',
      title: 'Generics and wildcard rules',
      md: `## Generics basics
* Generics provide compile-time type safety; types are **erased** at runtime.
* Generic classes: \`class Box<T> { private T value; }\`
* Generic methods: \`public <T> T identity(T item) { return item; }\` (formal type parameter \`<T>\` placed before return type).

## Invariance of generic types
In Java, arrays are covariant (\`String[]\` is a subtype of \`Object[]\`), but generic types are **invariant**:
* \`List<Integer>\` is **NOT** a subtype of \`List<Number>\`!
* \`List<Number> list = new ArrayList<Integer>();\` **DOES NOT COMPILE**.

## Wildcards

### 1. Unbounded wildcard \`List<?>\`
* Represents a list of an unknown type.
* **Can read**: elements can be read as \`Object\`.
* **Cannot add**: cannot add any object to \`List<?>\` (except literal \`null\`).

### 2. Upper-bounded wildcard \`List<? extends Number>\`
* Represents a list of \`Number\` or any subtype of \`Number\` (e.g. \`Integer\`, \`Double\`).
* **Can read**: elements can be safely read as \`Number\` (Producer).
* **Cannot add**: cannot add any element (even a \`Number\` or \`Integer\`), because the actual underlying list might be \`List<Double>\`! (Only \`null\` allowed).

### 3. Lower-bounded wildcard \`List<? super Integer>\`
* Represents a list of \`Integer\` or any supertype of \`Integer\` (e.g. \`Number\`, \`Object\`).
* **Can add**: can add an \`Integer\` or any subclass of \`Integer\` (Consumer)!
* **Can read**: elements can only be read as \`Object\`.

### PECS principle:
* **Producer Extends**: if you only READ from a generic structure, use \`? extends T\`.
* **Consumer Super**: if you only WRITE into a generic structure, use \`? super T\`.`
    }
  ],

  gotchas: [
    { title: 'List.of is immutable and null-hostile', md: '`List.of("a", null)` throws `NullPointerException`. `list.add("b")` throws `UnsupportedOperationException`.' },
    { title: 'Set.of with duplicates throws exception', md: '`Set.of("a", "b", "a")` throws `IllegalArgumentException` at runtime when constructing the set.' },
    { title: 'Arrays.asList backed array mutation', md: '`Arrays.asList` returns a fixed-size list backed by the array. Changing an element (`list.set(0, "Z")`) updates the original array!' },
    { title: 'Deque push adds to the FRONT', md: 'In a `Deque`, `push(e)` is a stack operation that inserts at the **head** (index 0), not the tail! `pop()` removes from the head.' },
    { title: 'TreeSet and TreeMap forbid null', md: '`TreeSet` and `TreeMap` (keys) do not permit `null` elements because natural comparison (`compareTo`) throws `NullPointerException`.' },
    { title: 'Map.merge with null returned removes key', md: 'If the remapping function in `map.merge(key, val, (v1, v2) -> null)` returns `null`, the key is removed from the map!' },
    { title: 'Map.computeIfAbsent vs computeIfPresent', md: '`computeIfAbsent` runs when key is absent/null. `computeIfPresent` runs when key is present and non-null.' },
    { title: 'Generic invariance trap', md: '`List<Object> list = new ArrayList<String>();` does NOT compile! Generic type parameters must match exactly unless wildcards are used.' },
    { title: 'Cannot add to ? extends Type', md: '`List<? extends Number> list = new ArrayList<Integer>(); list.add(1);` fails to compile! The compiler cannot guarantee the list is not a `List<Double>`.' },
    { title: 'Binary search on unsorted collection', md: '`Collections.binarySearch` on an unsorted list produces an **undefined** result (often negative or wrong index), not an exception.' },
    { title: 'Binary search negative return formula', md: 'When an element is not found, binary search returns `(-insertionPoint - 1)`. If insertion point is 2, it returns `-3`.' },
    { title: 'Comparable compareTo signature', md: '`Comparable<T>` declares `public int compareTo(T o)`. It is in `java.lang`, not `java.util`.' },
    { title: 'Comparator compare signature', md: '`Comparator<T>` declares `public int compare(T o1, T o2)`. It is in `java.util`.' },
    { title: 'Cannot instantiate generic type or array', md: '`new T()` and `new T[10]` are illegal because of type erasure at runtime.' }
  ],

  traps: [
    {
      code: `import java.util.ArrayDeque;
import java.util.Deque;
public class DequeOrder {
  public static void main(String[] args) {
    Deque<Integer> d = new ArrayDeque<>();
    d.push(1);
    d.offer(2);
    d.push(3);
    System.out.print(d.poll() + " " + d.poll() + " " + d.poll());
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`3 1 2`**. `push(1)` puts 1 at head: [1]. `offer(2)` adds 2 to tail: [1, 2]. `push(3)` puts 3 at head: [3, 1, 2]. `poll()` removes from head in order: 3, then 1, then 2.',
      verify: {
        files: {
          'DequeOrder.java': `import java.util.ArrayDeque;
import java.util.Deque;
public class DequeOrder {
  public static void main(String[] args) {
    Deque<Integer> d = new ArrayDeque<>();
    d.push(1);
    d.offer(2);
    d.push(3);
    System.out.print(d.poll() + " " + d.poll() + " " + d.poll());
  }
}`
        },
        expect: { output: '3 1 2' }
      }
    },
    {
      code: `import java.util.HashMap;
import java.util.Map;
public class MapMergeTest {
  public static void main(String[] args) {
    Map<String, Integer> map = new HashMap<>();
    map.put("A", 10);
    map.merge("A", 5, (oldVal, newVal) -> oldVal + newVal);
    map.merge("B", 20, (oldVal, newVal) -> oldVal + newVal);
    map.merge("A", 15, (oldVal, newVal) -> null);
    System.out.print(map.get("A") + " " + map.get("B"));
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`null 20`**. For "A", 10 + 5 becomes 15. For "B", absent key gets 20. Then for "A", remapping function returns `null`, which causes key "A" to be **removed** from the map! `map.get("A")` is therefore `null`.',
      verify: {
        files: {
          'MapMergeTest.java': `import java.util.HashMap;
import java.util.Map;
public class MapMergeTest {
  public static void main(String[] args) {
    Map<String, Integer> map = new HashMap<>();
    map.put("A", 10);
    map.merge("A", 5, (oldVal, newVal) -> oldVal + newVal);
    map.merge("B", 20, (oldVal, newVal) -> oldVal + newVal);
    map.merge("A", 15, (oldVal, newVal) -> null);
    System.out.print(map.get("A") + " " + map.get("B"));
  }
}`
        },
        expect: { output: 'null 20' }
      }
    },
    {
      code: `import java.util.Arrays;
import java.util.List;
public class AsListTest {
  public static void main(String[] args) {
    String[] arr = { "a", "b", "c" };
    List<String> list = Arrays.asList(arr);
    list.set(0, "z");
    System.out.print(arr[0] + " " + list.get(0));
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`z z`**. `Arrays.asList` creates a list backed directly by the array. Changing an element in the list modifies the underlying array.',
      verify: {
        files: {
          'AsListTest.java': `import java.util.Arrays;
import java.util.List;
public class AsListTest {
  public static void main(String[] args) {
    String[] arr = { "a", "b", "c" };
    List<String> list = Arrays.asList(arr);
    list.set(0, "z");
    System.out.print(arr[0] + " " + list.get(0));
  }
}`
        },
        expect: { output: 'z z' }
      }
    },
    {
      code: `import java.util.ArrayList;
import java.util.List;
public class WildcardAdd {
  public static void main(String[] args) {
    List<? extends Number> list = new ArrayList<Integer>();
    list.add(10);
    System.out.print(list.get(0));
  }
}`,
      prompt: 'Does this code compile?',
      answer: '**Does not compile.** You cannot add elements to a `List<? extends Number>` (upper-bounded wildcard) because the compiler cannot verify the specific concrete subtype of the underlying list at runtime.',
      verify: {
        files: {
          'WildcardAdd.java': `import java.util.ArrayList;
import java.util.List;
public class WildcardAdd {
  public static void main(String[] args) {
    List<? extends Number> list = new ArrayList<Integer>();
    list.add(10);
  }
}`
        },
        expect: 'compile-error'
      }
    },
    {
      code: `import java.util.ArrayList;
import java.util.List;
public class SuperWildcard {
  public static void main(String[] args) {
    List<? super Integer> list = new ArrayList<Number>();
    list.add(42);
    System.out.print(list.get(0));
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`42`**. A lower-bounded wildcard `List<? super Integer>` allows adding `Integer` (and its subtypes). Elements are retrieved as `Object` and printed.',
      verify: {
        files: {
          'SuperWildcard.java': `import java.util.ArrayList;
import java.util.List;
public class SuperWildcard {
  public static void main(String[] args) {
    List<? super Integer> list = new ArrayList<Number>();
    list.add(42);
    System.out.print(list.get(0));
  }
}`
        },
        expect: { output: '42' }
      }
    },
    {
      code: `import java.util.Arrays;
import java.util.Collections;
import java.util.List;
public class BinarySearchTest {
  public static void main(String[] args) {
    List<Integer> list = Arrays.asList(1, 3, 5, 7);
    int idx = Collections.binarySearch(list, 4);
    System.out.print(idx);
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`-3`**. 4 is not in the list. It would be inserted at index 2 (between 3 and 5). The formula for unfound elements is `(-insertionPoint - 1)`, so `(-2 - 1) = -3`.',
      verify: {
        files: {
          'BinarySearchTest.java': `import java.util.Arrays;
import java.util.Collections;
import java.util.List;
public class BinarySearchTest {
  public static void main(String[] args) {
    List<Integer> list = Arrays.asList(1, 3, 5, 7);
    int idx = Collections.binarySearch(list, 4);
    System.out.print(idx);
  }
}`
        },
        expect: { output: '-3' }
      }
    },
    {
      code: `import java.util.Set;
public class SetOfDup {
  public static void main(String[] args) {
    Set<String> s = Set.of("apple", "banana", "apple");
    System.out.print(s.size());
  }
}`,
      prompt: 'What happens when running this code?',
      answer: '**Throws IllegalArgumentException.** `Set.of` checks for duplicate elements at runtime and immediately throws `IllegalArgumentException` if any duplicates are passed.',
      verify: {
        files: {
          'SetOfDup.java': `import java.util.Set;
public class SetOfDup {
  public static void main(String[] args) {
    Set<String> s = Set.of("apple", "banana", "apple");
    System.out.print(s.size());
  }
}`
        },
        expect: 'runtime-exception'
      }
    }
  ],

  questions: [
    {
      id: 'ch09-q01', type: 'single', difficulty: 'easy', objectiveIds: ['5'], tags: ['list-of', 'immutability'],
      question: 'What is the result of running the following code?',
      code: `import java.util.List;
public class ImmutableTest {
  public static void main(String[] args) {
    List<String> list = List.of("A", "B", "C");
    list.add("D");
    System.out.println(list.size());
  }
}`,
      options: [
        'Prints 4',
        'Prints 3',
        'Throws UnsupportedOperationException at runtime',
        'Throws NullPointerException at runtime',
        'Does not compile'
      ],
      answer: [2],
      explanation: '`List.of()` produces an unmodifiable list. Calling mutator methods such as `add()`, `remove()`, or `set()` throws `UnsupportedOperationException` at runtime.',
      optionNotes: {
        '0': 'List.of cannot be modified.',
        '1': 'add() does not fail silently; it throws an exception.',
        '2': 'Correct: throws UnsupportedOperationException.',
        '3': 'No null elements involved.',
        '4': 'Compiles without error.'
      },
      verify: {
        files: {
          'ImmutableTest.java': `import java.util.List;
public class ImmutableTest {
  public static void main(String[] args) {
    List<String> list = List.of("A", "B", "C");
    list.add("D");
  }
}`
        },
        expect: 'runtime-exception'
      }
    },
    {
      id: 'ch09-q02', type: 'single', difficulty: 'medium', objectiveIds: ['5'], tags: ['map', 'compute-if-absent'],
      question: 'What does this code print?',
      code: `import java.util.HashMap;
import java.util.Map;
public class ComputeTest {
  public static void main(String[] args) {
    Map<String, String> map = new HashMap<>();
    map.put("x", "hello");
    map.computeIfAbsent("x", k -> "world");
    map.computeIfAbsent("y", k -> "java");
    System.out.print(map.get("x") + " " + map.get("y"));
  }
}`,
      options: [
        'hello java',
        'world java',
        'hello null',
        'world null',
        'Compile error'
      ],
      answer: [0],
      explanation: '`computeIfAbsent` only computes and sets a value if the key is absent or mapped to `null`. Since "x" is already mapped to "hello", the mapping function is not called for "x". Key "y" is absent, so "java" is computed and stored. Output is `hello java`.',
      optionNotes: {
        '0': 'Correct: x remains hello; y gets java.',
        '1': 'computeIfAbsent does not overwrite existing non-null keys.',
        '2': 'y is added.',
        '3': 'x is not overwritten.',
        '4': 'Completely valid Map operations.'
      },
      verify: {
        files: {
          'ComputeTest.java': `import java.util.HashMap;
import java.util.Map;
public class ComputeTest {
  public static void main(String[] args) {
    Map<String, String> map = new HashMap<>();
    map.put("x", "hello");
    map.computeIfAbsent("x", k -> "world");
    map.computeIfAbsent("y", k -> "java");
    System.out.print(map.get("x") + " " + map.get("y"));
  }
}`
        },
        expect: { output: 'hello java' }
      }
    },
    {
      id: 'ch09-q03', type: 'single', difficulty: 'medium', objectiveIds: ['12c'], tags: ['generics', 'wildcards'],
      question: 'Which of the following assignments compiles without error?',
      code: null,
      options: [
        'List<Number> list = new ArrayList<Integer>();',
        'List<? extends Number> list = new ArrayList<Integer>();',
        'List<? super Number> list = new ArrayList<Integer>();',
        'List<Integer> list = new ArrayList<Number>();',
        'List<?> list = new List<String>();'
      ],
      answer: [1],
      explanation: 'Generic types are invariant: `List<Number>` cannot reference `ArrayList<Integer>`. Upper-bounded wildcard `List<? extends Number>` accepts `ArrayList<Integer>` because `Integer` extends `Number`. Option 2 fails because `Integer` is not a supertype of `Number`. Option 4 attempts to instantiate the interface `List`.',
      optionNotes: {
        '0': 'Does not compile: generics are invariant.',
        '1': 'Correct: Integer is a subtype of Number, matching ? extends Number.',
        '2': 'Does not compile: Integer is not a supertype of Number.',
        '3': 'Does not compile: invariant.',
        '4': 'Cannot instantiate interface List directly.'
      },
      verify: null
    },
    {
      id: 'ch09-q04', type: 'single', difficulty: 'hard', objectiveIds: ['5'], tags: ['comparator', 'sorting'],
      question: 'What is the output?',
      code: `import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
public class SortTest {
  public static void main(String[] args) {
    List<String> list = Arrays.asList("bear", "cat", "ant", "bee");
    Comparator<String> comp = Comparator.comparingInt(String::length)
                                        .thenComparing(Comparator.naturalOrder());
    list.sort(comp);
    System.out.print(list);
  }
}`,
      options: [
        '[ant, cat, bee, bear]',
        '[ant, bee, cat, bear]',
        '[bear, ant, bee, cat]',
        '[cat, ant, bee, bear]',
        'Compile error'
      ],
      answer: [1],
      explanation: 'Sorted first by length: the three 3-letter words ("cat", "ant", "bee") come before "bear" (length 4). Within length 3, the secondary sort is natural alphabetical order: "ant" (a), "bee" (b), "cat" (c). Output is `[ant, bee, cat, bear]`.',
      optionNotes: {
        '0': 'cat before bee is not alphabetical.',
        '1': 'Correct: length 3 words sorted alphabetically (ant, bee, cat), then length 4 (bear).',
        '2': 'Does not sort by length first.',
        '3': 'cat is not before ant.',
        '4': 'Code compiles and runs cleanly.'
      },
      verify: {
        files: {
          'SortTest.java': `import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
public class SortTest {
  public static void main(String[] args) {
    List<String> list = Arrays.asList("bear", "cat", "ant", "bee");
    Comparator<String> comp = Comparator.comparingInt(String::length)
                                        .thenComparing(Comparator.naturalOrder());
    list.sort(comp);
    System.out.print(list);
  }
}`
        },
        expect: { output: '[ant, bee, cat, bear]' }
      }
    },
    {
      id: 'ch09-q05', type: 'single', difficulty: 'medium', objectiveIds: ['5'], tags: ['treeset', 'comparable'],
      question: 'Consider the class below:',
      code: `import java.util.TreeSet;
class Duck {
  String name;
  Duck(String name) { this.name = name; }
}
public class Pond {
  public static void main(String[] args) {
    TreeSet<Duck> ducks = new TreeSet<>();
    ducks.add(new Duck("Donald"));
    System.out.println("Done");
  }
}`,
      options: [
        'Prints Done',
        'Throws ClassCastException at runtime',
        'Compile error: Duck must implement Comparable',
        'Throws NullPointerException at runtime',
        'Prints [Donald]'
      ],
      answer: [1],
      explanation: '`TreeSet` elements must implement `Comparable` (or a `Comparator` must be passed to the constructor). Since `Duck` does not implement `Comparable`, adding an element throws `ClassCastException` at runtime when `TreeSet` attempts to compare it.',
      optionNotes: {
        '0': 'Fails at runtime on add().',
        '1': 'Correct: Duck cannot be cast to Comparable.',
        '2': 'The compiler does not enforce Comparable on generic type parameters of TreeSet.',
        '3': 'Duck instance is not null.',
        '4': 'Exception thrown before print.'
      },
      verify: {
        files: {
          'Pond.java': `import java.util.TreeSet;
class Duck {
  String name;
  Duck(String name) { this.name = name; }
}
public class Pond {
  public static void main(String[] args) {
    TreeSet<Duck> ducks = new TreeSet<>();
    ducks.add(new Duck("Donald"));
    System.out.println("Done");
  }
}`
        },
        expect: 'runtime-exception'
      }
    },
    {
      id: 'ch09-q06', type: 'single', difficulty: 'easy', objectiveIds: ['5'], tags: ['map', 'put-if-absent'],
      question: 'What is the output?',
      code: `import java.util.HashMap;
import java.util.Map;
public class PutIfAbsentTest {
  public static void main(String[] args) {
    Map<Integer, String> map = new HashMap<>();
    map.put(1, "one");
    map.putIfAbsent(1, "uno");
    map.putIfAbsent(2, "dos");
    System.out.print(map.get(1) + " " + map.get(2));
  }
}`,
      options: [
        'one dos',
        'uno dos',
        'one null',
        'uno null',
        'Compile error'
      ],
      answer: [0],
      explanation: 'Key 1 is already present with non-null value "one", so `putIfAbsent(1, "uno")` does nothing. Key 2 is absent, so `putIfAbsent(2, "dos")` puts "dos". Output is `one dos`.',
      optionNotes: {
        '0': 'Correct: key 1 unchanged; key 2 added.',
        '1': 'putIfAbsent does not overwrite existing key.',
        '2': 'key 2 was inserted.',
        '3': 'key 1 was not overwritten.',
        '4': 'Completely valid Map method.'
      },
      verify: {
        files: {
          'PutIfAbsentTest.java': `import java.util.HashMap;
import java.util.Map;
public class PutIfAbsentTest {
  public static void main(String[] args) {
    Map<Integer, String> map = new HashMap<>();
    map.put(1, "one");
    map.putIfAbsent(1, "uno");
    map.putIfAbsent(2, "dos");
    System.out.print(map.get(1) + " " + map.get(2));
  }
}`
        },
        expect: { output: 'one dos' }
      }
    },
    {
      id: 'ch09-q07', type: 'single', difficulty: 'hard', objectiveIds: ['12c'], tags: ['generics', 'methods'],
      question: 'Which method declaration correctly defines a generic method with a bounded type parameter?',
      code: null,
      options: [
        'public <T extends CharSequence> int count(T item) { return item.length(); }',
        'public int count<T extends CharSequence>(T item) { return item.length(); }',
        'public <T super CharSequence> int count(T item) { return 0; }',
        'public int count(T extends CharSequence item) { return item.length(); }',
        'public <T> int count(T item) extends CharSequence { return item.length(); }'
      ],
      answer: [0],
      explanation: 'Generic type parameters on methods must appear before the return type: `public <T extends Bound> ReturnType methodName(T param)`. Lower bounds (`super`) are not allowed on type parameters (only on wildcards). Options 2, 3, 4, and 5 (indices 1, 2, 3, and 4) use invalid syntax.',
      optionNotes: {
        '0': 'Correct syntax: <T extends CharSequence> before return type int.',
        '1': 'Type parameter placed after method name is invalid.',
        '2': 'super is illegal on type parameter declarations.',
        '3': 'Invalid parameter syntax.',
        '4': 'Invalid extends location.'
      },
      verify: null
    },
    {
      id: 'ch09-q08', type: 'multi', difficulty: 'medium', objectiveIds: ['5'], tags: ['collections', 'methods'],
      question: 'Which operations throw an exception on an empty collection? (Choose all that apply.)',
      code: null,
      options: [
        'Deque.pop()',
        'Queue.poll()',
        'Queue.remove()',
        'Queue.peek()',
        'Queue.element()'
      ],
      answer: [0, 2, 4],
      explanation: '`pop()`, `remove()`, and `element()` throw `NoSuchElementException` when called on an empty queue/deque. `poll()` and `peek()` return `null` on an empty queue.',
      optionNotes: {
        '0': 'Throws NoSuchElementException when empty.',
        '1': 'Returns null when empty.',
        '2': 'Throws NoSuchElementException when empty.',
        '3': 'Returns null when empty.',
        '4': 'Throws NoSuchElementException when empty.'
      },
      verify: null
    },
    {
      id: 'ch09-q09', type: 'single', difficulty: 'medium', objectiveIds: ['12c'], tags: ['generics', 'wildcards-read-write'],
      question: 'Given the method `void process(List<? super Integer> list)`, which operation is legal inside the method?',
      code: null,
      options: [
        'list.add(10);',
        'list.add(new Object());',
        'Integer n = list.get(0);',
        'Number num = list.get(0);',
        'list.add("text");'
      ],
      answer: [0],
      explanation: 'A `List<? super Integer>` is a consumer of `Integer`. You can safely add `Integer` (or its subtypes) to the list. You cannot add `Object` or `String`. When reading elements, the return type is unknown and can only be treated as `Object`, so assignment to `Integer` or `Number` without explicit casting is a compile error.',
      optionNotes: {
        '0': 'Legal: can add Integer to ? super Integer.',
        '1': 'Illegal: cannot add Object.',
        '2': 'Illegal: read type is Object, not Integer.',
        '3': 'Illegal: read type is Object, not Number.',
        '4': 'Illegal: String cannot be added.'
      },
      verify: null
    },
    {
      id: 'ch09-q10', type: 'single', difficulty: 'hard', objectiveIds: ['5'], tags: ['map', 'compute-if-present'],
      question: 'What is the output?',
      code: `import java.util.HashMap;
import java.util.Map;
public class ComputeIfPresentTest {
  public static void main(String[] args) {
    Map<String, Integer> map = new HashMap<>();
    map.put("k", 10);
    map.computeIfPresent("k", (k, v) -> v > 5 ? null : v * 2);
    System.out.print(map.containsKey("k"));
  }
}`,
      options: ['false', 'true', 'null', '10', 'Compile error'],
      answer: [0],
      explanation: 'Key "k" is present with value 10. `v > 5` is true (10 > 5), so the remapping function returns `null`. When `computeIfPresent` (or `merge`) returns `null`, the key is **removed** from the map! Thus `map.containsKey("k")` returns `false`.',
      optionNotes: {
        '0': 'Correct: returning null from computeIfPresent removes the mapping.',
        '1': 'Key was removed, so containsKey is false.',
        '2': 'containsKey returns boolean.',
        '3': 'Value was removed.',
        '4': 'Valid Map code.'
      },
      verify: {
        files: {
          'ComputeIfPresentTest.java': `import java.util.HashMap;
import java.util.Map;
public class ComputeIfPresentTest {
  public static void main(String[] args) {
    Map<String, Integer> map = new HashMap<>();
    map.put("k", 10);
    map.computeIfPresent("k", (k, v) -> v > 5 ? null : v * 2);
    System.out.print(map.containsKey("k"));
  }
}`
        },
        expect: { output: 'false' }
      }
    }
  ],

  checklist: [
    'I know Map does not implement Collection or Iterable.',
    'I know List.of, Set.of, and Map.of are immutable, disallow null, and throw IllegalArgumentException on duplicates.',
    'I know Arrays.asList returns a fixed-size list backed by the array where set() mutates the array.',
    'I know Deque methods: push adds to front, pop removes from front, offer adds to tail, poll removes from head.',
    'I know TreeSet and TreeMap do not allow null elements/keys.',
    'I understand Map.merge(), computeIfAbsent(), and computeIfPresent(), and know returning null removes the key.',
    'I know Comparable<T> is in java.lang with compareTo(T), and Comparator<T> is in java.util with compare(T, T).',
    'I know Collections.binarySearch() returns (-insertionPoint - 1) if not found, and requires sorted collection.',
    'I know generics are invariant: List<Integer> is not a subtype of List<Number>.',
    'I understand the PECS rule: Producer Extends, Consumer Super.',
    'I know you cannot add elements to List<? extends T> (except null).',
    'I know you can add T to List<? super T>.'
  ]
});
