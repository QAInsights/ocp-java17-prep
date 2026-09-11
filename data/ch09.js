OCP.registerChapter({
  id: 9,
  slug: 'collections-generics',
  title: 'Collections & Generics',
  objectiveIds: ['5', '12c'],
  intro: `Collections questions reward precise vocabulary. An array has a fixed runtime component type and a length field; a List has collection operations and a size method. A wildcard describes an unknown type, not a type that accepts every value. Learn the mutability and ordering guarantees of each factory, then apply PECS and type erasure to generic APIs.`,

  notes: [
    {
      id: 'arrays-lists',
      title: 'Arrays, List factories, and mutability',
      md: `Arrays have a fixed length, a reifiable runtime component type, and the field \`length\). Lists use methods such as \`size()\), \`get()\), and \`add()\). Arrays are covariant: a \`String[]\) can be assigned to \`Object[]\), but storing a non-String then fails with \`ArrayStoreException\). Generic collections are invariant: \`List<String>\) is not a \`List<Object>\).

| Factory or class | Size | Modification |
|---|---|---|
| \`List.of\`, \`List.copyOf\) | fixed | unmodifiable; null rejected |
| \`Arrays.asList(array)\) | fixed | set allowed and writes through; add/remove unsupported |
| \`ArrayList\) | resizable | fast indexed access; permits null |
| \`LinkedList\) | resizable | efficient ends; indexed access traverses |

\`List.of\) and \`copyOf\) make unmodifiable lists. \`copyOf\) also makes a snapshot: later changes to the source list are not reflected. \`Arrays.asList\) is a fixed-size view backed by the array, so \`set\) changes the array. \`Collections.unmodifiableList\) is an unmodifiable view, not a snapshot; changes through the original list remain visible.`,
    },
    {
      id: 'sets-maps',
      title: 'Set and Map implementations',
      md: `A \`HashSet\) uses hashing and has no encounter-order guarantee. \`LinkedHashSet\) preserves insertion order. \`TreeSet\) keeps sorted order using natural ordering or a supplied \`Comparator\). A sorted set treats elements as duplicates when comparison returns zero, even if \`equals\) is false.

| Map | Ordering |
|---|---|
| \`HashMap\) | no guaranteed order |
| \`LinkedHashMap\) | insertion order by default; can be access-ordered |
| \`TreeMap\) | sorted by keys |

Important map operations include \`put\), \`putIfAbsent\), \`getOrDefault\), \`merge\), \`compute\), \`computeIfAbsent\), \`computeIfPresent\), \`replace\), \`replaceAll\), and \`forEach\). \`put\) returns the previous value or null. \`merge(k, value, fn)\) inserts value for an absent key; for a present key it combines old and new values. If the remapping function returns null, the key is removed.

\`Map.of\) rejects null keys/values and duplicate keys with \`IllegalArgumentException\). The \`Map.Entry\) view from \`entrySet()\) is the normal way to iterate keys and values together.`,
    },
    {
      id: 'deque-iterators',
      title: 'Deque, Queue, and Iterator operations',
      md: `A \`Deque\) can be used as both queue and stack:

| Operation | Empty result | End |
|---|---|---|
| \`offer\), \`poll\), \`peek\) | false, null, null | queue-style |
| \`add\), \`remove\), \`element\) | exception | queue-style |
| \`push\), \`pop\), \`peek\) | pop exception, null | stack/front |

\`addFirst/addLast\), \`offerFirst/offerLast\), \`removeFirst/removeLast\), \`pollFirst/pollLast\), \`getFirst/getLast\), and \`peekFirst/peekLast\) make the end explicit. \`ArrayDeque\) does not permit null.

An \`Iterator\) can remove the last element returned by its own \`next()\) using \`iterator.remove()\). Calling remove before next or twice for one next is illegal. Most collection iterators are fail-fast: structural modification through the collection while iterating may throw \`ConcurrentModificationException\). \`removeIf\) is the safe bulk-removal method for a predicate.`,
    },
    {
      id: 'ordering-search',
      title: 'Comparable, Comparator, sorting, and searching',
      md: `\`Comparable<T>\) supplies an object’s natural order through \`compareTo\). \`Comparator<T>\) supplies an external order and can be passed to sorting and sorted collections. A \`TreeSet\) or \`TreeMap\) needs comparable keys/elements or a comparator; adding a non-comparable type without one throws \`ClassCastException\).

\`Collections.sort(list)\` uses natural order; the overload accepting a comparator uses that comparator. \`List.sort\), \`Arrays.sort\), and stream \`sorted\) follow the same ordering concepts. Object sorting is stable: equal keys retain their prior relative order. \`Collections.reverse\), \`min\), \`max\), \`frequency\), \`fill\), and \`binarySearch\) are common utilities.

\`Collections.binarySearch\) requires a sorted list using the same ordering. When not found, it returns \`-(insertion point) - 1\). A negative result can therefore recover the insertion point as \`-result - 1\). Sorting a list after searching with a different order invalidates the assumption.`,
    },
    {
      id: 'generic-types',
      title: 'Generic classes, methods, and bounds',
      md: `A generic declaration parameterizes a class, interface, or method:

\`\`\`java
class Box<T> {
  private T value;
  Box(T value) { this.value = value; }
  T get() { return value; }
}
static <T> T first(List<T> values) { return values.get(0); }
\`\`\`

The method type parameter appears before the return type. Bounds use \`<T extends Number>\); multiple bounds place the class first and interfaces after it: \`<T extends Number & Comparable<T>>\). Type arguments cannot be primitive types, so use \`List<Integer>\), not \`List<int>\).

Type erasure removes most generic type information at runtime. You cannot overload methods whose signatures erase to the same parameter types, create generic arrays such as \`new T[10]\), or use \`instanceof List<String>\). Raw types such as \`List\) disable generic checking and can produce an unchecked warning and a later \`ClassCastException\).`,
    },
    {
      id: 'wildcards-pecs',
      title: 'Wildcards and PECS',
      md: `A wildcard represents an unknown type:

* \`List<?>\) can refer to a list of any element type. You can read elements as \`Object\), but cannot add a non-null value because the exact type is unknown.
* \`List<? extends Number>\) is a producer. You can read values as \`Number\), but cannot add a \`Number\) or any specific subtype.
* \`List<? super Integer>\) is a consumer. You can safely add \`Integer\) values; reads have static type \`Object\).

This is PECS: **Producer Extends, Consumer Super**. A method that only reads should generally accept \`? extends T\); a method that inserts T should accept \`? super T\). A wildcard capture can be passed to a private generic helper when an operation needs the same unknown type.

Wildcards and type parameters differ. \`<T> void copy(List<T> a, List<T> b)\) requires the same inferred T, while \`void copy(List<? extends T> source, List<? super T> dest)\) supports a producer and consumer relationship. \`List<Object>\) is not a supertype of \`List<String>\); \`List<?>\) is the common read-only view.`,
    },
  ],

  gotchas: [
    { title: 'Array length field', md: 'Arrays use `length`; collections use `size()`.' },
    { title: 'Generic invariance', md: '`List<String>` is not assignable to `List<Object>`.' },
    { title: 'List.of immutable', md: 'List.of and List.copyOf reject structural changes and null elements.' },
    { title: 'copyOf snapshot', md: 'List.copyOf does not track later source-list changes.' },
    { title: 'Arrays.asList fixed size', md: 'Arrays.asList permits set but not add or remove.' },
    { title: 'Unmodifiable view', md: 'Collections.unmodifiableList reflects changes made through the original list.' },
    { title: 'Hash order', md: 'HashSet and HashMap do not promise encounter order.' },
    { title: 'Linked order', md: 'LinkedHashSet and LinkedHashMap preserve insertion order by default.' },
    { title: 'Tree ordering', md: 'TreeSet and TreeMap require natural ordering or a comparator.' },
    { title: 'Map.of duplicate', md: 'Map.of with duplicate keys throws IllegalArgumentException.' },
    { title: 'putIfAbsent null', md: 'putIfAbsent replaces a null mapping because null is treated as absent.' },
    { title: 'Deque null', md: 'ArrayDeque rejects null elements.' },
    { title: 'Stack aliases', md: 'push adds at the front and pop removes from the front.' },
    { title: 'Iterator ownership', md: 'Iterator.remove removes the last element returned by that iterator.' },
    { title: 'Fail-fast is not synchronization', md: 'ConcurrentModificationException is a best-effort iterator check, not thread safety.' },
    { title: 'removeIf', md: 'removeIf is designed for safe predicate-based bulk removal.' },
    { title: 'Comparable direction', md: 'compareTo negative means this object sorts before the argument.' },
    { title: 'Comparator equality', md: 'TreeSet duplicate detection uses comparator result zero.' },
    { title: 'Stable sort', md: 'Equal sort keys retain their previous relative order.' },
    { title: 'binarySearch precondition', md: 'The list must already be sorted using the same ordering.' },
    { title: 'binarySearch negative result', md: 'Not found returns `-(insertion point) - 1`.' },
    { title: 'Generic method syntax', md: 'A method type parameter appears before its return type.' },
    { title: 'Primitive type arguments', md: 'Generics use wrapper types, never primitive type arguments.' },
    { title: 'Erasure overload clash', md: 'Methods that erase to the same signature cannot be overloaded.' },
    { title: 'Generic arrays', md: 'Direct creation of arrays of a type variable or non-reifiable generic type is forbidden.' },
    { title: 'Raw types', md: 'Raw collections bypass checks and can defer type errors to a cast.' },
    { title: 'Unknown wildcard', md: 'You cannot add an arbitrary value to List<?>.' },
    { title: 'Extends producer', md: 'List<? extends T> is safe to read as T but not to add T.' },
    { title: 'Super consumer', md: 'List<? super T> accepts T values but reads only as Object.' },
    { title: 'PECS', md: 'Use Producer Extends and Consumer Super when designing generic APIs.' },
  ],

  traps: [
    {
      code: `import java.util.*;
class Demo {
  public static void main(String[] args) {
    String[] words = {"a", "b"};
    List<String> list = Arrays.asList(words);
    list.set(1, "c");
    System.out.print(Arrays.toString(words));
    list.add("d");
  }
}`,
      prompt: 'What happens in this Arrays.asList example?',
      answer: 'set writes through to the backing array, so `[a, c]` prints before add throws UnsupportedOperationException.',
      verify: { files: { 'Demo.java': `import java.util.*;
class Demo {
  public static void main(String[] args) {
    String[] words = {"a", "b"};
    List<String> list = Arrays.asList(words);
    list.set(1, "c");
    System.out.print(Arrays.toString(words));
    list.add("d");
  }
}` }, expect: 'runtime-exception' },
    },
    {
      code: `import java.util.*;
class Demo {
  public static void main(String[] args) {
    Map<String, Integer> map = new HashMap<>();
    map.merge("x", 2, Integer::sum);
    map.merge("x", 3, Integer::sum);
    map.merge("x", 0, (a, b) -> null);
    System.out.print(map.containsKey("x") + " " + map.getOrDefault("x", 9));
  }
}`,
      prompt: 'What does merge do in this example?',
      answer: 'The first merge inserts 2, the second combines to 5, and the null remapping removes the key, so it prints `false 9`.',
      verify: { files: { 'Demo.java': `import java.util.*;
class Demo {
  public static void main(String[] args) {
    Map<String, Integer> map = new HashMap<>();
    map.merge("x", 2, Integer::sum);
    map.merge("x", 3, Integer::sum);
    map.merge("x", 0, (a, b) -> null);
    System.out.print(map.containsKey("x") + " " + map.getOrDefault("x", 9));
  }
}` }, expect: { output: 'false 9' } },
    },
    {
      code: `import java.util.*;
class Demo {
  public static void main(String[] args) {
    Deque<String> d = new ArrayDeque<>();
    d.addLast("b");
    d.push("a");
    d.offerLast("c");
    System.out.print(d + " " + d.pollFirst() + " " + d.pop() + " " + d.peek());
  }
}`,
      prompt: 'What does this deque example print?',
      answer: 'The deque is `[a, b, c]`; pollFirst removes a, pop removes b, and peek sees c, so it prints `[a, b, c] a b c`.',
      verify: { files: { 'Demo.java': `import java.util.*;
class Demo {
  public static void main(String[] args) {
    Deque<String> d = new ArrayDeque<>();
    d.addLast("b");
    d.push("a");
    d.offerLast("c");
    System.out.print(d + " " + d.pollFirst() + " " + d.pop() + " " + d.peek());
  }
}` }, expect: { output: '[a, b, c] a b c' } },
    },
    {
      code: `import java.util.*;
class Demo {
  public static void main(String[] args) {
    Set<Object> set = new TreeSet<>();
    set.add("a");
    set.add(1);
  }
}`,
      prompt: 'What happens when incompatible natural-order elements enter this TreeSet?',
      answer: 'The first String establishes a natural-ordering context; adding Integer cannot compare it with String and throws ClassCastException.',
      verify: { files: { 'Demo.java': `import java.util.*;
class Demo {
  public static void main(String[] args) {
    Set<Object> set = new TreeSet<>();
    set.add("a");
    set.add(1);
  }
}` }, expect: 'runtime-exception' },
    },
    {
      code: `import java.util.*;
class Demo {
  static void add(List<? extends Number> values) {
    values.add(1);
  }
  public static void main(String[] args) {
    add(new ArrayList<Integer>());
  }
}`,
      prompt: 'Does adding an Integer to this extends-bounded list compile?',
      answer: 'It does not compile because the exact element subtype is unknown, even though the list produces Number values.',
      verify: { files: { 'Demo.java': `import java.util.*;
class Demo {
  static void add(List<? extends Number> values) {
    values.add(1);
  }
  public static void main(String[] args) {
    add(new ArrayList<Integer>());
  }
}` }, expect: 'compile-error' },
    },
    {
      code: `import java.util.*;
class Demo {
  public static void main(String[] args) {
    List<String> names = new ArrayList<>(List.of("a", "b", "c"));
    Iterator<String> it = names.iterator();
    while (it.hasNext()) {
      if (it.next().equals("b")) it.remove();
    }
    System.out.print(names);
  }
}`,
      prompt: 'What remains after iterator.remove is used correctly?',
      answer: 'The iterator removes b without structurally modifying through the list, leaving `[a, c]`.',
      verify: { files: { 'Demo.java': `import java.util.*;
class Demo {
  public static void main(String[] args) {
    List<String> names = new ArrayList<>(List.of("a", "b", "c"));
    Iterator<String> it = names.iterator();
    while (it.hasNext()) {
      if (it.next().equals("b")) it.remove();
    }
    System.out.print(names);
  }
}` }, expect: { output: '[a, c]' } },
    },
    {
      code: `import java.util.*;
class Demo {
  public static void main(String[] args) {
    List<String> values = new ArrayList<>(List.of("aa", "b", "cc"));
    Comparator<String> order = Comparator.comparingInt(String::length)
      .thenComparing(Comparator.naturalOrder());
    Collections.sort(values, order);
    int result = Collections.binarySearch(values, "z", order);
    System.out.print(values + " " + result + " " + (-result - 1));
  }
}`,
      prompt: 'What does binarySearch return for the missing length-two key?',
      answer: 'The sorted list is `[b, aa, cc]`. A length-two key is inserted before the existing equal-length values at index 1, so a valid result is `-2`; the recovered insertion point is 1.',
      verify: { files: { 'Demo.java': `import java.util.*;
class Demo {
  public static void main(String[] args) {
    List<String> values = new ArrayList<>(List.of("aa", "b", "cc"));
    Comparator<String> order = Comparator.comparingInt(String::length)
      .thenComparing(Comparator.naturalOrder());
    Collections.sort(values, order);
    int result = Collections.binarySearch(values, "z", order);
    System.out.print(values + " " + result + " " + (-result - 1));
  }
}` }, expect: { output: '[b, aa, cc] -2 1' } },
    },
    {
      code: `import java.util.*;
class Demo {
  public static void main(String[] args) {
    Map<String, Integer> m = Map.of("a", 1, "b", 2);
    System.out.print(m.getOrDefault("c", 7) + " " + m.containsKey("a"));
  }
}`,
      prompt: 'What does this immutable Map factory example print?',
      answer: 'The absent key uses the default 7 and a is present, so it prints `7 true`.',
      verify: { files: { 'Demo.java': `import java.util.*;
class Demo {
  public static void main(String[] args) {
    Map<String, Integer> m = Map.of("a", 1, "b", 2);
    System.out.print(m.getOrDefault("c", 7) + " " + m.containsKey("a"));
  }
}` }, expect: { output: '7 true' } },
    },
  ],

  questions: [
    {
      id: 'ch09-q01',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['5'],
      tags: ['array', 'list'],
      question: 'Which expression obtains the number of elements in a List?',
      code: null,
      options: ['list.length', 'list.length()', 'list.size()', 'list.capacity()', 'list.count'],
      answer: [2],
      explanation: 'Collections expose size() while arrays expose the length field.',
      optionNotes: { '0': 'Arrays have length, not Lists.', '1': 'List has no length method.', '2': 'Correct.', '3': 'Capacity is not the collection size API.', '4': 'No count field.' },
      verify: null,
    },
    {
      id: 'ch09-q02',
      type: 'multi',
      difficulty: 'easy',
      objectiveIds: ['5'],
      tags: ['list-factory'],
      question: 'Which list factories return unmodifiable lists?',
      code: null,
      options: ['List.of', 'List.copyOf', 'Arrays.asList', 'new ArrayList', 'Collections.unmodifiableList'],
      answer: [0, 1, 4],
      explanation: 'List.of, List.copyOf, and Collections.unmodifiableList reject mutation through the returned reference. Arrays.asList is fixed-size but permits set.',
      optionNotes: { '0': 'Unmodifiable.', '1': 'Unmodifiable snapshot.', '2': 'set is supported.', '3': 'ArrayList is mutable.', '4': 'Unmodifiable view.' },
      verify: null,
    },
    {
      id: 'ch09-q03',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['5'],
      tags: ['arrays-as-list'],
      question: 'Which operation is supported by `Arrays.asList(array)`?',
      code: null,
      options: ['add', 'remove', 'set', 'resize', 'clear'],
      answer: [2],
      explanation: 'Arrays.asList creates a fixed-size, array-backed list. set changes an existing position; structural changes are unsupported.',
      optionNotes: { '0': 'Structural growth is unsupported.', '1': 'Structural shrink is unsupported.', '2': 'Correct.', '3': 'The array length is fixed.', '4': 'Clear is structural removal.' },
      verify: null,
    },
    {
      id: 'ch09-q04',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['5'],
      tags: ['set', 'map'],
      question: 'Which ordering descriptions are correct?',
      code: null,
      options: ['HashSet has no guaranteed encounter order', 'LinkedHashSet preserves insertion order', 'TreeSet sorts by natural order or Comparator', 'HashMap guarantees sorted keys', 'TreeMap sorts keys'],
      answer: [0, 1, 2, 4],
      explanation: 'Hash collections do not promise order, linked variants preserve insertion order, and tree variants sort.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'HashMap has no sorted-key guarantee.', '4': 'True.' },
      verify: null,
    },
    {
      id: 'ch09-q05',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['5'],
      tags: ['map', 'merge'],
      question: 'What happens when a Map.merge remapping function returns null?',
      code: null,
      options: ['The mapping is inserted with null', 'The existing mapping is removed', 'The map throws NullPointerException always', 'The key is ignored and old value remains', 'The map becomes unmodifiable'],
      answer: [1],
      explanation: 'For a present key, a null result from merge’s remapping function removes the mapping.',
      optionNotes: { '0': 'Null result means removal.', '1': 'Correct.', '2': 'The function is allowed to return null.', '3': 'The old value is removed.', '4': 'Mutability is unchanged.' },
      verify: null,
    },
    {
      id: 'ch09-q06',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['5'],
      tags: ['map'],
      question: 'Which operations can compute or update a Map value?',
      code: null,
      options: ['putIfAbsent', 'compute', 'computeIfAbsent', 'computeIfPresent', 'replaceAll'],
      answer: [0, 1, 2, 3, 4],
      explanation: 'All listed methods are Map update/computation operations with different absent/present and remapping rules.',
      optionNotes: { '0': 'Map update method.', '1': 'Map computation method.', '2': 'Computes absent values.', '3': 'Computes present values.', '4': 'Updates all entries.' },
      verify: null,
    },
    {
      id: 'ch09-q07',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['5'],
      tags: ['deque'],
      question: 'Which Deque operation adds an element at the front and is the stack-style alias?',
      code: null,
      options: ['offerLast', 'push', 'pollFirst', 'peekLast', 'addLast'],
      answer: [1],
      explanation: 'push(e) is equivalent to addFirst(e).',
      optionNotes: { '0': 'Adds at the back.', '1': 'Correct.', '2': 'Removes from the front.', '3': 'Peeks at the back.', '4': 'Adds at the back.' },
      verify: null,
    },
    {
      id: 'ch09-q08',
      type: 'multi',
      difficulty: 'easy',
      objectiveIds: ['5'],
      tags: ['queue'],
      question: 'Which Queue method pairs return a benign status/null rather than throwing when empty or full?',
      code: null,
      options: ['offer', 'poll', 'peek', 'add', 'remove'],
      answer: [0, 1, 2],
      explanation: 'offer, poll, and peek are the non-throwing queue forms. add and remove throw on failure/empty conditions.',
      optionNotes: { '0': 'Returns false if insertion fails.', '1': 'Returns null when empty.', '2': 'Returns null when empty.', '3': 'May throw when insertion fails.', '4': 'Throws when empty.' },
      verify: null,
    },
    {
      id: 'ch09-q09',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['5'],
      tags: ['iterator'],
      question: 'Which removal is supported while traversing with an Iterator?',
      code: null,
      options: ['collection.remove from any thread', 'iterator.remove after next', 'iterator.remove before next', 'calling next twice then remove twice', 'changing list size directly'],
      answer: [1],
      explanation: 'Iterator.remove is supported once for the element most recently returned by next.',
      optionNotes: { '0': 'Can trigger fail-fast behavior.', '1': 'Correct.', '2': 'Illegal state.', '3': 'Second remove is illegal without another next.', '4': 'Can trigger ConcurrentModificationException.' },
      verify: null,
    },
    {
      id: 'ch09-q10',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['5'],
      tags: ['sorting'],
      question: 'Which statements about sorting and searching are true?',
      code: null,
      options: ['binarySearch requires compatible sorted order', 'Object sorting is stable', 'Collections.reverse reverses a list in place', 'Natural ordering comes from Comparable', 'binarySearch always returns a nonnegative index'],
      answer: [0, 1, 2, 3],
      explanation: 'Binary search requires sorted input and can return a negative insertion encoding. The other listed ordering facts are true.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'True.', '4': 'Not found is negative.' },
      verify: null,
    },
    {
      id: 'ch09-q11',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['12c'],
      tags: ['generic-method'],
      question: 'Where does a generic method’s type parameter appear?',
      code: null,
      options: ['After the method body', 'Before the return type', 'After the parameter list only', 'Inside the method name', 'Only on the class declaration'],
      answer: [1],
      explanation: 'The declaration `<T> T first(...)` places the method type parameter before its return type.',
      optionNotes: { '0': 'Too late in the declaration.', '1': 'Correct.', '2': 'The parameter list follows the return type/name.', '3': 'Type parameters are not part of the method name.', '4': 'Methods can introduce their own parameters.' },
      verify: null,
    },
    {
      id: 'ch09-q12',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['12c'],
      tags: ['bounds'],
      question: 'Which generic bounds are legal forms?',
      code: null,
      options: ['`<T extends Number>`', '`<T extends Number & Comparable<T>>`', '`<T super Number>`', '`<T extends Runnable & AutoCloseable>`', '`<T extends Runnable, AutoCloseable>`'],
      answer: [0, 1, 3],
      explanation: 'Type parameters use extends for class/interface bounds, with at most one class first and interfaces after it. super is a wildcard bound, not a type-parameter bound.',
      optionNotes: { '0': 'Valid.', '1': 'Valid class plus interface bounds.', '2': 'Type parameters do not use super bounds.', '3': 'Valid interface intersection.', '4': 'Bounds use &, not a comma.' },
      verify: null,
    },
    {
      id: 'ch09-q13',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['12c'],
      tags: ['wildcard'],
      question: 'What can safely be added to a `List<?>`?',
      code: null,
      options: ['Any Object', 'Only String', 'Only null', 'Any Number', 'The wildcard’s unknown type is named automatically'],
      answer: [2],
      explanation: 'The exact element type is unknown, so only null is safely addable through a List<?> reference.',
      optionNotes: { '0': 'The unknown type may not be Object.', '1': 'It may be another type.', '2': 'Correct.', '3': 'Number may be unsafe.', '4': 'The capture is not exposed as a concrete source type.' },
      verify: null,
    },
    {
      id: 'ch09-q14',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['12c'],
      tags: ['pecs'],
      question: 'Which PECS statements are true?',
      code: null,
      options: ['A producer is commonly declared with extends', 'A consumer is commonly declared with super', 'A List<? extends Number> can be read as Number', 'A List<? super Integer> can safely add Integer', 'A List<? extends Number> can safely add any Number'],
      answer: [0, 1, 2, 3],
      explanation: 'Producer Extends and Consumer Super describe safe read/write directions. The extends list cannot accept an arbitrary Number.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'True.', '4': 'The exact subtype is unknown.' },
      verify: null,
    },
    {
      id: 'ch09-q15',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['12c'],
      tags: ['erasure'],
      question: 'Which operation is prevented by generic type erasure and reifiability rules?',
      code: null,
      options: ['new ArrayList<String>()', 'new String[2]', 'new T[2] inside a generic class', 'List<?> values', 'List<String> values'],
      answer: [2],
      explanation: 'A type variable is non-reifiable, so direct creation of `new T[2]` is forbidden.',
      optionNotes: { '0': 'Allowed.', '1': 'String arrays are reifiable.', '2': 'Correct.', '3': 'Wildcard references are allowed.', '4': 'Parameterized references are allowed.' },
      verify: null,
    },
    {
      id: 'ch09-q16',
      type: 'multi',
      difficulty: 'hard',
      objectiveIds: ['12c'],
      tags: ['raw-type', 'erasure'],
      question: 'Which are consequences or properties of raw generic types?',
      code: null,
      options: ['They disable many compile-time checks', 'They may produce unchecked warnings', 'They can lead to ClassCastException later', 'They preserve all type arguments at runtime', 'They are recommended for new APIs'],
      answer: [0, 1, 2],
      explanation: 'Raw types erase generic checks at the source level and may move failures to runtime. They do not preserve type arguments and should be avoided in new APIs.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'Erasure removes most type arguments.', '4': 'Parameterized APIs are preferred.' },
      verify: null,
    },
    {
      id: 'ch09-q17',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['5'],
      tags: ['tree-set', 'comparator'],
      question: 'What does a TreeSet use to decide whether two elements are duplicates?',
      code: null,
      options: ['Only object identity', 'Only hashCode', 'compareTo or Comparator result zero', 'Always equals regardless of ordering', 'Insertion timestamp'],
      answer: [2],
      explanation: 'Sorted collections use their ordering and treat a zero comparison as duplicate.',
      optionNotes: { '0': 'Identity is not the criterion.', '1': 'TreeSet is not hash-based.', '2': 'Correct.', '3': 'equals is not necessarily consulted for uniqueness.', '4': 'No timestamp criterion.' },
      verify: null,
    },
    {
      id: 'ch09-q18',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['5'],
      tags: ['list', 'linked-list'],
      question: 'Which statements distinguish ArrayList and LinkedList?',
      code: null,
      options: ['ArrayList usually provides fast indexed access', 'LinkedList can efficiently add/remove at ends', 'Both implement List', 'LinkedList indexed access is generally constant time', 'ArrayList cannot grow'],
      answer: [0, 1, 2],
      explanation: 'ArrayList is array-backed and efficient for indexes; LinkedList links nodes and is useful at ends. Both are resizable Lists.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'Indexed traversal is generally linear.', '4': 'ArrayList grows as needed.' },
      verify: null,
    },
    {
      id: 'ch09-q19',
      type: 'single',
      difficulty: 'easy',
      objectiveIds: ['5'],
      tags: ['map'],
      question: 'What does `Map.put` return when replacing an existing mapping?',
      code: null,
      options: ['The new value always', 'The previous value', 'The key', 'A boolean always true', 'The map itself'],
      answer: [1],
      explanation: 'put returns the prior value associated with the key, or null if there was no mapping.',
      optionNotes: { '0': 'It returns the old value.', '1': 'Correct.', '2': 'The key is not returned.', '3': 'Map.put does not return boolean.', '4': 'It returns a value, not the map.' },
      verify: null,
    },
    {
      id: 'ch09-q20',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['5'],
      tags: ['map'],
      question: 'Which Map statements are true?',
      code: null,
      options: ['getOrDefault supplies a value when a key is absent', 'entrySet exposes key/value entries', 'Map.of rejects duplicate keys', 'putIfAbsent treats a null mapping as present always', 'computeIfAbsent can create an absent mapping'],
      answer: [0, 1, 2, 4],
      explanation: 'The listed read and update operations behave as described. putIfAbsent treats a null current mapping as absent for replacement purposes.',
      optionNotes: { '0': 'True.', '1': 'True.', '2': 'True.', '3': 'A null mapping is treated as absent.', '4': 'True.' },
      verify: null,
    },
    {
      id: 'ch09-q21',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['12c'],
      tags: ['list-type'],
      question: 'Which assignment is legal?',
      code: null,
      options: ['List<Object> x = new ArrayList<String>()', 'List<?> x = new ArrayList<String>()', 'List<String> x = new ArrayList<Object>()', 'List<int> x = new ArrayList<int>()', 'List<Number> x = new ArrayList<Integer>()'],
      answer: [1],
      explanation: 'List<?> can reference a list of any element type. Generic collections are invariant and primitive type arguments are illegal.',
      optionNotes: { '0': 'Generic invariance rejects this.', '1': 'Correct.', '2': 'Generic invariance rejects this.', '3': 'Primitive type arguments are forbidden.', '4': 'Integer list is not a Number list.' },
      verify: null,
    },
    {
      id: 'ch09-q22',
      type: 'multi',
      difficulty: 'hard',
      objectiveIds: ['12c'],
      tags: ['generic-method'],
      question: 'Which declarations use legal generic method syntax or bounds?',
      code: null,
      options: ['`<T> T id(T value)`', '`static <T extends Number> T id(T value)`', '`<T super Number> T id(T value)`', '`<T extends Runnable & AutoCloseable> void use(T x)`', '`T <T> id(T value)`'],
      answer: [0, 1, 3],
      explanation: 'Method type parameters precede the return type and use extends bounds. Type parameters cannot use super and cannot appear after the return type.',
      optionNotes: { '0': 'Valid.', '1': 'Valid.', '2': 'super is not a type-parameter bound.', '3': 'Valid intersection bound.', '4': 'Wrong placement.' },
      verify: null,
    },
    {
      id: 'ch09-q23',
      type: 'single',
      difficulty: 'medium',
      objectiveIds: ['5'],
      tags: ['array-store'],
      question: 'What runtime exception can arise from storing an Integer through an Object[] reference that actually refers to String[]?',
      code: null,
      options: ['ClassCastException', 'ArrayStoreException', 'ConcurrentModificationException', 'IllegalArgumentException', 'UnsupportedOperationException'],
      answer: [1],
      explanation: 'Arrays retain a reifiable component type and check stores at runtime, producing ArrayStoreException.',
      optionNotes: { '0': 'This is a cast failure, not an array store check.', '1': 'Correct.', '2': 'Iterator modification issue.', '3': 'Not the array store exception.', '4': 'Common for unmodifiable collections.' },
      verify: null,
    },
    {
      id: 'ch09-q24',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['5'],
      tags: ['collections'],
      question: 'Which classes or methods reject null in the stated standard usage?',
      code: null,
      options: ['List.of', 'List.copyOf', 'ArrayDeque', 'HashMap', 'Map.of'],
      answer: [0, 1, 2, 4],
      explanation: 'The immutable of/copyOf factories, ArrayDeque, and Map.of reject null. HashMap permits one null key and null values.',
      optionNotes: { '0': 'Rejects null elements.', '1': 'Rejects null source elements.', '2': 'ArrayDeque does not permit null.', '3': 'HashMap permits nulls.', '4': 'Rejects null keys/values.' },
      verify: null,
    },
    {
      id: 'ch09-q25',
      type: 'single',
      difficulty: 'hard',
      objectiveIds: ['5'],
      tags: ['binary-search'],
      question: 'If binarySearch does not find a value with insertion point 3, what result is returned?',
      code: null,
      options: ['3', '-3', '-4', '4', '0'],
      answer: [2],
      explanation: 'The not-found encoding is `-(insertion point) - 1`, so `-3 - 1` is -4.',
      optionNotes: { '0': 'The value was not found.', '1': 'Missing the final minus one.', '2': 'Correct.', '3': 'Positive results indicate found positions.', '4': 'Not the insertion encoding.' },
      verify: null,
    },
    {
      id: 'ch09-q26',
      type: 'multi',
      difficulty: 'medium',
      objectiveIds: ['12c'],
      tags: ['wildcards'],
      question: 'Which operations are safe through `List<? super Integer>`?',
      code: null,
      options: ['add(Integer.valueOf(1))', 'add(null)', 'read an element as Object', 'read an element as Integer without a cast', 'add(Double.valueOf(1))'],
      answer: [0, 1, 2],
      explanation: 'A super wildcard can consume Integer and null, while reads are only guaranteed as Object. Double is not safely accepted.',
      optionNotes: { '0': 'Safe consumer operation.', '1': 'Null is safe for reference lists.', '2': 'Every element is at least Object.', '3': 'The actual list may be List<Number> or List<Object>.', '4': 'Double is not necessarily accepted.' },
      verify: null,
    },
  ],

  checklist: [
    'I can distinguish array length from List size and array covariance from generic invariance.',
    'I know List.of, List.copyOf, Arrays.asList, ArrayList, LinkedList, and unmodifiable-view mutability.',
    'I can describe HashSet, LinkedHashSet, TreeSet, HashMap, LinkedHashMap, and TreeMap ordering.',
    'I know Map put, putIfAbsent, getOrDefault, merge, compute, and replace operation behavior.',
    'I can use Queue and Deque method pairs and identify their empty-result behavior.',
    'I know ArrayDeque rejects null and push/pop operate at the front.',
    'I can remove through Iterator.remove and understand fail-fast modification checks.',
    'I can distinguish Comparable natural order from Comparator external order.',
    'I know sorting is stable and binarySearch requires compatible sorted order.',
    'I can calculate the negative binarySearch insertion-point encoding.',
    'I can declare generic classes, interfaces, methods, and bounded type parameters.',
    'I know type-parameter bounds use extends and place a class bound before interfaces.',
    'I understand erasure, raw types, non-reifiable types, and generic-array restrictions.',
    'I can distinguish List<Object>, List<?>, and List<String> assignments.',
    'I can apply PECS to extends producers and super consumers.',
    'I know what can be read from and added to each wildcard form.',
  ],
});
