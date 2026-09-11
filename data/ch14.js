OCP.registerChapter({
  id: 14,
  slug: 'io-and-nio',
  title: 'I/O & NIO.2',
  objectiveIds: ['9a', '9b', '9c'],
  intro: `Objectives **9a** (reading and writing console and file data using I/O Streams), **9b** (serialization and deserialization, transient fields, inheritance rules), and **9c** (creating, traversing, reading, and writing Path objects and java.nio.file API). I/O questions on the 1Z0-829 exam are notoriously detail-oriented: Path relativize vs resolve rules, subpath index boundaries, Files stream methods (list, walk, lines) that require try-with-resources, serialization constructor execution rules across inheritance hierarchies, and System.console() char[] return types.`,

  notes: [
    {
      id: 'classic-io',
      title: 'Classic I/O Streams and Console',
      md: `## Byte streams vs Character streams

| Category | Base classes | Common implementations | Purpose |
|---|---|---|---|
| **Byte streams** | \`InputStream\` / \`OutputStream\` | \`FileInputStream\`, \`FileOutputStream\`, \`BufferedInputStream\` | Binary data (images, bytes) |
| **Character streams** | \`Reader\` / \`Writer\` | \`FileReader\`, \`FileWriter\`, \`BufferedReader\`, \`BufferedWriter\` | Textual data (Unicode, charset encodings) |

### Important stream methods
* **\`BufferedReader.readLine()\`**: returns next line as a \`String\`, or **\`null\`** at end of stream (EOF).
* **\`BufferedWriter.newLine()\`**: writes a platform-dependent line terminator.
* **\`PrintWriter\` / \`PrintStream\`**:
  * Provide \`print()\`, \`println()\`, and \`printf()\`.
  * **Do NOT throw checked \`IOException\`**! They suppress I/O exceptions; you must check for errors via \`checkError()\`.

## The java.io.Console singleton
\`\`\`java
Console console = System.console();
if (console != null) {
  String username = console.readLine("Enter username: ");
  char[] password = console.readPassword("Enter password: ");
}
\`\`\`
* \`System.console()\` returns \`null\` if no interactive terminal is attached (e.g. running inside an IDE or background script).
* **\`readPassword()\` returns \`char[]\`**, NOT a \`String\`! This allows the password memory to be zeroed out immediately after use for security.`
    },
    {
      id: 'serialization',
      title: 'Object Serialization and Deserialization',
      md: `## java.io.Serializable
* A marker interface (declares 0 methods).
* To serialize: \`new ObjectOutputStream(out).writeObject(obj);\`.
* To deserialize: \`new ObjectInputStream(in).readObject();\` (throws \`ClassNotFoundException\`).

## What gets serialized?
* **Instance fields** that are not marked \`transient\`.
* **\`transient\` fields**: skipped during serialization; initialized to default values (\`null\`, \`0\`, \`false\`) on deserialization.
* **\`static\` fields**: never serialized (they belong to the class, not individual instances).
* If a class is \`Serializable\` but contains a non-transient reference to an object that does NOT implement \`Serializable\`, a **\`NotSerializableException\`** is thrown at runtime!

## Inheritance and constructor rules during deserialization (HIGH EXAM FREQUENCY)
When an object is **deserialized**:
1. Java checks the class hierarchy from top to bottom.
2. The **first non-serializable superclass** must have an **accessible no-argument constructor**!
3. That non-serializable superclass constructor **RUNS** during deserialization.
4. Any constructors of the **serializable class or its serializable subclasses DO NOT RUN**!
5. Instance initializers and default field assignments of serializable classes **DO NOT RUN**.`
    },
    {
      id: 'nio-path-operations',
      title: 'NIO.2 Path operations: relativize, resolve, normalize, subpath',
      md: `## Creating a Path
* \`Path.of("home", "user", "docs")\` (Java 11+)
* \`Paths.get("/var/log/app.log")\`

## Path methods summary

| Method | Behavior | Example |
|---|---|---|
| **\`getNameCount()\`** | Number of name elements (root is excluded) | \`Path.of("/a/b").getNameCount()\` -> \`2\` |
| **\`getName(index)\`** | 0-indexed element name | \`Path.of("/a/b/c").getName(0)\` -> \`a\` |
| **\`getFileName()\`** | Last element of path | \`Path.of("/a/b/c.txt").getFileName()\` -> \`c.txt\` |
| **\`getParent()\`** | Path without last element, or \`null\` if at root | \`Path.of("/a/b").getParent()\` -> \`/a\` |
| **\`getRoot()\`** | Root component, or \`null\` if relative | \`Path.of("/a/b").getRoot()\` -> \`/\` |
| **\`subpath(begin, end)\`**| Subsequence of elements; \`end\` is **exclusive**! | \`Path.of("/a/b/c").subpath(0, 2)\` -> \`a/b\` |

### Path operations
* **\`resolve(other)\`**:
  * Concatenates two paths.
  * *Trap*: if \`other\` is an **absolute path**, \`resolve()\` returns \`other\` directly:
    \`Path.of("/a/b").resolve("/c")\` -> **\`"/c"\`**!
* **\`relativize(other)\`**:
  * Computes the relative path from this path to \`other\`.
  * *Trap*: both paths **must be of the same type** (both absolute or both relative). Mixing an absolute path with a relative path throws **\`IllegalArgumentException\`**!
* **\`normalize()\`**:
  * Removes redundant \`.\` (current directory) and resolves \`..\` (parent directory).
* **\`toRealPath()\`**:
  * Resolves symbolic links and checks if file **actually exists on the filesystem** (throws checked \`IOException\` if missing).`
    },
    {
      id: 'nio-files-utility',
      title: 'Files utility methods and stream processing',
      md: `The \`java.nio.file.Files\` class provides static methods for filesystem operations:

## File management
* \`Files.exists(Path)\`
* \`Files.isSameFile(Path p1, Path p2)\`: tests if two paths resolve to the same underlying file. Resolves symlinks.
* \`Files.createDirectory(Path)\`: creates single directory (fails if parent does not exist).
* \`Files.createDirectories(Path)\`: creates directory and any missing parent directories.
* \`Files.copy(Path src, Path dst, CopyOption...)\`
  * Will not overwrite existing destination unless \`StandardCopyOption.REPLACE_EXISTING\` is passed.
* \`Files.move(Path src, Path dst, CopyOption...)\`

## Reading and writing
* \`Files.readString(Path)\` / \`Files.writeString(Path, CharSequence)\`
* \`Files.readAllLines(Path)\`: reads entire file into a \`List<String>\` (caution: loads all lines into memory).
* \`Files.lines(Path)\`: reads file lazily as a **\`Stream<String>\`**.
  * **Critical Rule**: \`Files.lines()\` opens a file handle and **must be managed with try-with-resources** to prevent file descriptor leaks!

## Navigating directories with Streams
* **\`Files.list(Path dir)\`**: returns \`Stream<Path>\` containing direct children (depth 1, non-recursive).
* **\`Files.walk(Path start, int maxDepth, FileVisitOption...)\`**: depth-first recursive walk returning \`Stream<Path>\`.
* **\`Files.find(Path start, int maxDepth, BiPredicate<Path, BasicFileAttributes> matcher)\`**: searches directory tree.`
    }
  ],

  gotchas: [
    { title: 'Console.readPassword returns char[]', md: '`console.readPassword()` returns a `char[]`, NOT a `String`. This is for security so the array can be cleared from memory immediately.' },
    { title: 'PrintWriter does not throw IOException', md: 'Methods like `println()` on `PrintWriter` or `PrintStream` do not throw checked `IOException`. Use `checkError()` to detect failures.' },
    { title: 'Deserialization constructor rule', md: 'During deserialization, constructors of `Serializable` classes do **NOT** run. Only the no-arg constructor of the first **non-serializable** superclass runs!' },
    { title: 'transient and static serialization', md: '`transient` fields revert to default values (`null`, `0`, `false`). `static` fields are never serialized because they belong to the class, not the object.' },
    { title: 'Path.resolve with absolute path', md: '`path1.resolve(path2)`: if `path2` is absolute, the result is `path2`! `Path.of("/a").resolve("/b")` returns `"/b"`.' },
    { title: 'Path.relativize mixing relative and absolute', md: 'Calling `relativize` where one path is absolute and the other is relative throws `IllegalArgumentException` at runtime.' },
    { title: 'getNameCount does not count root', md: 'In `Path.of("/a/b/c")`, the root `/` is NOT counted. `getNameCount()` is `3`.' },
    { title: 'subpath endIndex is exclusive', md: '`path.subpath(0, 2)` includes elements 0 and 1, but excludes 2.' },
    { title: 'Files.lines must be closed', md: '`Files.lines(path)` opens an operating system file descriptor. It must be enclosed in a try-with-resources block.' },
    { title: 'Files.deleteIfExists', md: '`Files.delete(path)` throws `NoSuchFileException` if the file does not exist. `Files.deleteIfExists(path)` returns `false` without throwing an exception.' },
    { title: 'Files.createDirectory vs createDirectories', md: '`createDirectory` throws `NoSuchFileException` if parent directories do not exist. `createDirectories` creates all missing parents automatically.' }
  ],

  traps: [
    {
      code: `import java.nio.file.Path;
public class RelativizeTest {
  public static void main(String[] args) {
    Path p1 = Path.of("/home/user/docs");
    Path p2 = Path.of("/home/user/photos/vacation");
    System.out.print(p1.relativize(p2));
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`../photos/vacation`**. To go from `/home/user/docs` to `/home/user/photos/vacation`, you go up one directory (`..`) to `/home/user`, then into `photos/vacation`.',
      verify: {
        files: {
          'RelativizeTest.java': `import java.nio.file.Path;
public class RelativizeTest {
  public static void main(String[] args) {
    Path p1 = Path.of("/home/user/docs");
    Path p2 = Path.of("/home/user/photos/vacation");
    System.out.print(p1.relativize(p2));
  }
}`
        },
        expect: { output: '../photos/vacation' }
      }
    },
    {
      code: `import java.nio.file.Path;
public class ResolveAbsolute {
  public static void main(String[] args) {
    Path p1 = Path.of("/a/b");
    Path p2 = Path.of("/c/d");
    System.out.print(p1.resolve(p2));
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`/c/d`**. In `p1.resolve(p2)`, if `p2` is an absolute path, the result is `p2` unchanged.',
      verify: {
        files: {
          'ResolveAbsolute.java': `import java.nio.file.Path;
public class ResolveAbsolute {
  public static void main(String[] args) {
    Path p1 = Path.of("/a/b");
    Path p2 = Path.of("/c/d");
    System.out.print(p1.resolve(p2));
  }
}`
        },
        expect: { output: '/c/d' }
      }
    },
    {
      code: `import java.nio.file.Path;
public class SubpathTest {
  public static void main(String[] args) {
    Path path = Path.of("/animals/mammals/canines/dog.txt");
    Path sub = path.subpath(1, 3);
    System.out.print(sub);
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`mammals/canines`**. Element 0 is `animals`, element 1 is `mammals`, element 2 is `canines`, element 3 is `dog.txt`. `subpath(1, 3)` takes indices 1 and 2, which is `mammals/canines`.',
      verify: {
        files: {
          'SubpathTest.java': `import java.nio.file.Path;
public class SubpathTest {
  public static void main(String[] args) {
    Path path = Path.of("/animals/mammals/canines/dog.txt");
    Path sub = path.subpath(1, 3);
    System.out.print(sub);
  }
}`
        },
        expect: { output: 'mammals/canines' }
      }
    },
    {
      code: `import java.io.*;
class Parent {
  int x = 10;
  Parent() { System.out.print("P "); }
}
class Child extends Parent implements Serializable {
  int y = 20;
  Child() { System.out.print("C "); }
}
public class SerOrder {
  public static void main(String[] args) throws Exception {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    new ObjectOutputStream(baos).writeObject(new Child());
    System.out.print("| ");
    ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
    new ObjectInputStream(bais).readObject();
  }
}`,
      prompt: 'What does this program print?',
      answer: 'Prints **`P C | P `**. When `new Child()` is instantiated during serialization, both constructors run (`P C `). During deserialization, because `Child` is `Serializable`, its constructor does NOT run! However, `Parent` is not serializable, so its no-arg constructor DOES run (`P `).',
      verify: {
        files: {
          'Parent.java': `public class Parent {
  int x = 10;
  public Parent() { System.out.print("P "); }
}`,
          'Child.java': `import java.io.Serializable;
public class Child extends Parent implements Serializable {
  int y = 20;
  public Child() { System.out.print("C "); }
}`,
          'SerOrder.java': `import java.io.*;
public class SerOrder {
  public static void main(String[] args) throws Exception {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    new ObjectOutputStream(baos).writeObject(new Child());
    System.out.print("| ");
    ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
    new ObjectInputStream(bais).readObject();
  }
}`
        },
        expect: { output: 'P C | P ' }
      }
    },
    {
      code: `import java.nio.file.Path;
public class MixedRelativize {
  public static void main(String[] args) {
    Path p1 = Path.of("/a/b");
    Path p2 = Path.of("c/d");
    System.out.print(p1.relativize(p2));
  }
}`,
      prompt: 'What happens when running this code?',
      answer: '**Throws IllegalArgumentException.** `relativize()` cannot compare an absolute path with a relative path.',
      verify: {
        files: {
          'MixedRelativize.java': `import java.nio.file.Path;
public class MixedRelativize {
  public static void main(String[] args) {
    Path p1 = Path.of("/a/b");
    Path p2 = Path.of("c/d");
    System.out.print(p1.relativize(p2));
  }
}`
        },
        expect: 'runtime-exception'
      }
    }
  ],

  questions: [
    {
      id: 'ch14-q01', type: 'single', difficulty: 'easy', objectiveIds: ['9a'], tags: ['console', 'readpassword'],
      question: 'What is the return type of `System.console().readPassword()`?',
      code: null,
      options: ['char[]', 'String', 'byte[]', 'CharSequence', 'Password'],
      answer: [0],
      explanation: '`Console.readPassword()` returns a `char[]` so that the confidential characters can be overwritten in memory immediately after verification.',
      optionNotes: {
        '0': 'Correct: returns char[].',
        '1': 'String is immutable and cannot be cleared from memory, making it insecure for passwords.',
        '2': 'Does not return byte[].',
        '3': 'Does not return CharSequence.',
        '4': 'Password class does not exist in java.io.'
      },
      verify: null
    },
    {
      id: 'ch14-q02', type: 'single', difficulty: 'medium', objectiveIds: ['9c'], tags: ['path', 'relativize'],
      question: 'What is the result of `Path.of("a/b").relativize(Path.of("a/b/c/d"))`?',
      code: null,
      options: ['c/d', '../c/d', '/c/d', 'a/b/c/d', 'Throws IllegalArgumentException'],
      answer: [0],
      explanation: 'Both paths are relative and share prefix `a/b`. Moving from `a/b` to `a/b/c/d` only requires entering `c/d`.',
      optionNotes: {
        '0': 'Correct: relative navigation is c/d.',
        '1': 'No up-directory navigation (..) is required.',
        '2': 'Both paths are relative, so result is relative without leading slash.',
        '3': 'Prefix is removed.',
        '4': 'Both paths are relative, so no exception is thrown.'
      },
      verify: null
    },
    {
      id: 'ch14-q03', type: 'single', difficulty: 'hard', objectiveIds: ['9b'], tags: ['serialization', 'constructors'],
      question: 'When an object of a `Serializable` subclass is deserialized, which constructor is invoked?',
      code: null,
      options: [
        'The accessible no-argument constructor of the nearest non-serializable superclass',
        'The no-argument constructor of the serializable subclass',
        'The constructor that was used when the object was originally created',
        'All constructors in the class hierarchy from Object down to the subclass',
        'No constructors are invoked during deserialization'
      ],
      answer: [0],
      explanation: 'During deserialization, constructors of classes that implement `Serializable` are bypassed. The runtime invokes only the accessible no-arg constructor of the first non-serializable superclass in the inheritance chain.',
      optionNotes: {
        '0': 'Correct: non-serializable superclass no-arg constructor runs.',
        '1': 'Serializable class constructors never run during deserialization.',
        '2': 'Original constructor does not run.',
        '3': 'Serializable constructors are skipped.',
        '4': 'The non-serializable superclass constructor does run.'
      },
      verify: null
    },
    {
      id: 'ch14-q04', type: 'single', difficulty: 'medium', objectiveIds: ['9c'], tags: ['path', 'resolve'],
      question: 'What is the output of running this code?',
      code: `import java.nio.file.Path;
public class PathResolve {
  public static void main(String[] args) {
    Path p1 = Path.of("cats");
    Path p2 = Path.of("/dogs");
    System.out.print(p1.resolve(p2));
  }
}`,
      options: ['/dogs', 'cats/dogs', '/cats/dogs', 'dogs', 'Throws IllegalArgumentException'],
      answer: [0],
      explanation: 'In `p1.resolve(p2)`, if `p2` is an absolute path (starts with `/`), the result is simply `p2` (`/dogs`).',
      optionNotes: {
        '0': 'Correct: resolving an absolute path returns that absolute path.',
        '1': 'p2 is absolute, so cats is discarded.',
        '2': 'p1 is relative.',
        '3': 'Leading slash is preserved.',
        '4': 'resolve accepts mixed relative and absolute (unlike relativize).'
      },
      verify: {
        files: {
          'PathResolve.java': `import java.nio.file.Path;
public class PathResolve {
  public static void main(String[] args) {
    Path p1 = Path.of("cats");
    Path p2 = Path.of("/dogs");
    System.out.print(p1.resolve(p2));
  }
}`
        },
        expect: { output: '/dogs' }
      }
    },
    {
      id: 'ch14-q05', type: 'single', difficulty: 'medium', objectiveIds: ['9c'], tags: ['path', 'getnamecount'],
      question: 'What is printed by `Path.of("/usr/local/bin/java").getNameCount()`?',
      code: null,
      options: ['4', '5', '3', '1', 'Compile error'],
      answer: [0],
      explanation: 'The root `/` is not counted as a name element. The name elements are `usr`, `local`, `bin`, and `java` (total of 4 elements).',
      optionNotes: {
        '0': 'Correct: 4 elements (root does not count).',
        '1': 'Root / is not included in getNameCount.',
        '2': 'java is counted.',
        '3': 'Only one would be if top level.',
        '4': 'Path.of is standard Java 11+.'
      },
      verify: null
    },
    {
      id: 'ch14-q06', type: 'single', difficulty: 'easy', objectiveIds: ['9b'], tags: ['serialization', 'transient'],
      question: 'What value does a `transient int age = 30;` field have immediately following deserialization?',
      code: null,
      options: ['0', '30', 'null', 'Throws NotSerializableException', '-1'],
      answer: [0],
      explanation: 'Transient fields are not serialized, and field initializers of serializable classes do not execute during deserialization. Primitive numeric fields receive their default primitive value, which is `0`.',
      optionNotes: {
        '0': 'Correct: default int value is 0.',
        '1': 'Field initializers do not run during deserialization.',
        '2': 'Primitives cannot be null.',
        '3': 'transient fields prevent NotSerializableException.',
        '4': 'Default is 0, not -1.'
      },
      verify: null
    },
    {
      id: 'ch14-q07', type: 'single', difficulty: 'medium', objectiveIds: ['9c'], tags: ['files', 'lines'],
      question: 'Why should `Files.lines(Path)` always be used within a try-with-resources statement?',
      code: null,
      options: [
        'Because it opens an underlying file channel and must be closed to avoid resource leaks',
        'Because it throws a checked ClassNotFoundException',
        'Because it converts the path to an AutoCloseable Path',
        'Because intermediate stream operations cannot run without closing the stream',
        'It does not need to be in a try-with-resources statement'
      ],
      answer: [0],
      explanation: '`Files.lines()` returns a `Stream<String>` backed by an open operating system file handle. Closing the stream closes the underlying file handle, which is why try-with-resources is essential.',
      optionNotes: {
        '0': 'Correct: closing the stream closes the underlying file descriptor.',
        '1': 'Does not throw ClassNotFoundException.',
        '2': 'Path does not implement AutoCloseable.',
        '3': 'Stream intermediate operations are unaffected.',
        '4': 'Failure to close can cause resource starvation in production.'
      },
      verify: null
    },
    {
      id: 'ch14-q08', type: 'single', difficulty: 'hard', objectiveIds: ['9c'], tags: ['path', 'normalize'],
      question: 'What is the result of `Path.of("/a/b/../c/./d").normalize()`?',
      code: null,
      options: ['/a/c/d', '/a/b/c/d', '/c/d', '/a/../c/d', '/a/b/../c/d'],
      answer: [0],
      explanation: '`normalize()` resolves `.` (current dir) and `..` (parent dir). `/a/b/..` resolves to `/a`. Then `/a/c/./d` resolves to `/a/c/d`.',
      optionNotes: {
        '0': 'Correct: /a/b/.. becomes /a, and ./ is stripped, yielding /a/c/d.',
        '1': '.. was not resolved.',
        '2': 'a was not popped.',
        '3': '.. was not resolved.',
        '4': 'Neither .. nor . was resolved.'
      },
      verify: null
    },
    {
      id: 'ch14-q09', type: 'single', difficulty: 'medium', objectiveIds: ['9a'], tags: ['printwriter', 'exceptions'],
      question: 'Which method on `PrintWriter` allows detecting if an I/O error occurred during writing?',
      code: null,
      options: [
        'checkError()',
        'hasError()',
        'getError()',
        'isError()',
        'PrintWriter throws IOException directly'
      ],
      answer: [0],
      explanation: '`PrintWriter` suppresses checked `IOException`s from underlying streams. To verify whether an error has occurred, callers invoke `checkError()`, which flushes the stream and returns `true` if an error occurred.',
      optionNotes: {
        '0': 'Correct: checkError() returns boolean.',
        '1': 'hasError does not exist.',
        '2': 'getError does not exist.',
        '3': 'isError does not exist.',
        '4': 'PrintWriter print/println methods do not declare throws IOException.'
      },
      verify: null
    },
    {
      id: 'ch14-q10', type: 'single', difficulty: 'medium', objectiveIds: ['9c'], tags: ['files', 'directory-creation'],
      question: 'What happens if you execute `Files.createDirectory(Path.of("/dir1/dir2"))` when `/dir1` does not exist?',
      code: null,
      options: [
        'Throws NoSuchFileException',
        'Creates both /dir1 and /dir1/dir2',
        'Returns false',
        'Throws FileAlreadyExistsException',
        'Creates /dir1 only'
      ],
      answer: [0],
      explanation: '`Files.createDirectory()` fails with `NoSuchFileException` if any parent directory is missing. To create parent directories automatically, use `Files.createDirectories()`.',
      optionNotes: {
        '0': 'Correct: parent missing causes NoSuchFileException.',
        '1': 'createDirectories() does this, not createDirectory().',
        '2': 'Does not return boolean.',
        '3': 'Throws NoSuchFileException.',
        '4': 'createDirectory creates only the target leaf directory.'
      },
      verify: null
    }
  ],

  checklist: [
    'I know Console.readPassword() returns a char[] and System.console() can be null.',
    'I know PrintWriter and PrintStream do not throw checked IOException and use checkError().',
    'I know transient fields revert to default values and static fields are not serialized.',
    'I know the deserialization constructor rule: only the no-arg constructor of the first non-serializable superclass runs.',
    'I know Path.getNameCount() does not count the root element.',
    'I know Path.subpath(begin, end) has an exclusive end index.',
    'I know Path.resolve(other) returns other unchanged if other is an absolute path.',
    'I know Path.relativize() throws IllegalArgumentException if mixing relative and absolute paths.',
    'I know Path.normalize() strips redundant . and resolves .. parent directories.',
    'I know Files.lines() returns a Stream<String> that must be closed in try-with-resources.',
    'I know Files.createDirectory() requires parents to exist, while Files.createDirectories() creates missing parents.'
  ]
});
