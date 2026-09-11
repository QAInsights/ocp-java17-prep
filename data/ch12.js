OCP.registerChapter({
  id: 12,
  slug: 'modules',
  title: 'Modules',
  objectiveIds: ['7a', '7b'],
  intro: `Objectives **7a** (module definitions, dependencies, reflection exposure, services SPI with \`provides\` and \`uses\`) and **7b** (compilation, modular vs non-modular JARs, runtime images with \`jlink\`, migration with automatic and unnamed modules). The Java Platform Module System (JPMS) is a dedicated objective area on the 1Z0-829 exam. You must know the syntax of \`module-info.java\` directives (\`exports\`, \`requires\`, \`requires transitive\`, \`opens\`, \`provides ... with\`, \`uses\`), module types and migration rules, and the CLI flags for \`javac\`, \`java\`, \`jar\`, \`jdeps\`, and \`jlink\`.`,

  notes: [
    {
      id: 'module-info-directives',
      title: 'module-info.java structure and directives',
      md: `## Anatomy of module-info.java

* Must be placed at the **root of the module's source folder** (directly under \`src\`, alongside root packages).
* File name must be exactly \`module-info.java\`.
* Module names conventionally use reverse-DNS or lowercase dot notation (e.g. \`com.ocp.zoo\`).

\`\`\`java
module com.ocp.app {
  requires com.ocp.staff;            // Module dependency
  requires transitive com.ocp.core;  // Implied readability
  requires static com.ocp.optional;  // Compile-time only dependency
  
  exports com.ocp.app.api;           // Exports package to all
  exports com.ocp.app.internal to com.ocp.admin; // Qualified export
  
  opens com.ocp.app.model;           // Opens package for runtime reflection
  opens com.ocp.app.data to org.hibernate; // Qualified opens
  
  uses com.ocp.service.TourService;  // Consumes a service
  provides com.ocp.service.TourService with com.ocp.app.TourServiceImpl; // Implements service
}
\`\`\`

## Key directive rules
* **\`exports\` takes a PACKAGE name**, not a module name! (Subpackages are **not** exported).
* **\`requires\` takes a MODULE name**, not a package name!
* **\`requires transitive\` (Implied readability)**: any module that requires this module automatically reads the transitive module without having to explicitly declare it.
* **\`requires static\`**: optional at runtime; required only during compilation.
* **\`opens\`**: allows runtime reflection (including private members) via \`java.lang.reflect\`.
  * Compile-time access is **not** granted by \`opens\`.
  * An **\`open module\`** opens all its packages for deep reflection; an \`open module\` cannot declare explicit \`opens\` directives.
* **\`java.base\`** is implicitly required by all modules. Explicitly writing \`requires java.base;\` is legal but redundant.`
    },
    {
      id: 'services-spi',
      title: 'Services: ServiceLoader, provides, and uses',
      md: `## The Service-Provider Interface (SPI)

Java modules support loosely coupled service architectures through:
1. **Service Interface / Abstract Class**: defines the service contract.
2. **Service Provider**: implements the service.
3. **Service Consumer**: searches and loads implementations via \`java.util.ServiceLoader\`.

## Directives
* **Service provider module**:
  \`\`\`java
  provides com.zoo.service.TicketService with com.zoo.service.impl.VipTicketService;
  \`\`\`
  * Must specify the interface followed by \`with\` and the implementation class.
  * The implementation class must have a public no-arg constructor (or a public static \`provider()\` method).
* **Consumer module**:
  \`\`\`java
  uses com.zoo.service.TicketService;
  \`\`\`
  * If a module calls \`ServiceLoader.load(TicketService.class)\` without declaring \`uses TicketService;\` in its \`module-info.java\`, a **\`ServiceConfigurationError\`** is thrown at runtime!
* The consumer does **not** need to require the implementation module; JPMS resolves providers dynamically.`
    },
    {
      id: 'module-types-and-migration',
      title: 'Module types and migration strategy',
      md: `## The three types of modules

| Module type | Defined by | Resides on | Exports | Reads |
|---|---|---|---|---|
| **Named module** | \`module-info.java\` | Module path (\`-p\` / \`--module-path\`) | Only packages listed in \`exports\` | Only modules listed in \`requires\` |
| **Automatic module** | Regular JAR without \`module-info\` | **Module path** (\`-p\` / \`--module-path\`) | **All packages** | **All modules** (reads everything) |
| **Unnamed module** | Code and regular JARs | **Class path** (\`-cp\` / \`--class-path\`) | **All packages** | **All modules** |

### Automatic module naming rules
When a non-modular JAR is placed on the module path:
1. If the JAR's \`MANIFEST.MF\` contains \`Automatic-Module-Name: my.custom.name\`, that name is used.
2. Otherwise, the name is derived from the JAR file name:
   * Remove trailing \`.jar\` extension.
   * Strip version numbers (e.g. \`commons-lang3-3.12.0.jar\` -> \`commons-lang3\`).
   * Replace non-alphanumeric characters (such as hyphens \`-\`) with dots \`.\` -> \`commons.lang3\`.

### Migration rules (Bottom-up vs Top-down)
* **Bottom-up migration**: migrate libraries to named modules first, then application.
* **Top-down migration**: migrate application to named module first; third-party non-modular dependencies are placed on the module path as **automatic modules**.
* **Key limitation**: named modules **cannot require the unnamed module**! Writing \`requires unnamed;\` does not compile.`
    },
    {
      id: 'jpms-cli-tools',
      title: 'CLI tools: javac, java, jar, jdeps, and jlink',
      md: `## Compiling modular code
\`\`\`sh
javac -p mods --module-source-path src -d out -m com.ocp.app
\`\`\`
* \`-p\` / \`--module-path\`: directory containing compiled module JARs or exploded modules.
* \`-d\`: output directory.
* \`-m\` / \`--module\`: module to compile or run.

## Packaging modular JARs
\`\`\`sh
jar --create --file mods/app.jar --main-class com.ocp.app.Main -C out/com.ocp.app .
\`\`\`
* Inspecting a module descriptor:
\`\`\`sh
jar --describe-module --file mods/app.jar
# or short form:
jar -d -f mods/app.jar
\`\`\`

## Running modular applications
\`\`\`sh
java -p mods -m com.ocp.app/com.ocp.app.Main
\`\`\`
* Syntax: \`-m <module-name>/<fully-qualified-class-name>\`.

## jdeps (Java Dependency Analysis Tool)
* \`jdeps -s app.jar\` / \`jdeps --summary app.jar\`: prints high-level module dependencies.
* \`jdeps -jdkinternals app.jar\`: scans for restricted internal JDK APIs.
* \`jdeps --generate-module-info <outputDir> app.jar\`: generates a draft \`module-info.java\`.

## jlink (Java Linker)
Creates a customized, self-contained, minimal runtime image containing only the JDK modules and application modules required:
\`\`\`sh
jlink --module-path $JAVA_HOME/jmods:mods --add-modules com.ocp.app --output my-custom-jre
\`\`\`
* **Crucial exam rule**: \`jlink\` **CANNOT package automatic modules**! All modules linked into a custom image must be explicit named modules with \`module-info.class\`.`
    }
  ],

  gotchas: [
    { title: 'exports package vs requires module', md: '`exports` is followed by a **package** name (`exports com.foo.bar;`). `requires` is followed by a **module** name (`requires com.foo.module;`). Mixing them up is an immediate compile error.' },
    { title: 'Subpackages are not exported', md: '`exports com.foo;` does **not** export `com.foo.sub`. Every package must be exported individually if its contents are to be accessible.' },
    { title: 'requires transitive propagation', md: 'If module A `requires transitive B`, and module C `requires A`, module C automatically reads module B without declaring `requires B`.' },
    { title: 'Automatic modules read everything', md: 'An automatic module automatically reads all other modules (named, automatic, and the unnamed module) and exports all its packages.' },
    { title: 'Named modules cannot require unnamed', md: 'A named module cannot declare a dependency on the unnamed module (`requires unnamed;` is illegal). Non-modular JARs must be placed on the module path as automatic modules.' },
    { title: 'jlink forbids automatic modules', md: '`jlink` fails if any module in the dependency graph is an automatic module. All dependencies must be explicit named modules.' },
    { title: 'uses directive required for ServiceLoader', md: 'If a module calls `ServiceLoader.load(MyService.class)` without having `uses MyService;` in `module-info.java`, a `ServiceConfigurationError` is thrown at runtime.' },
    { title: 'provides with syntax', md: 'The syntax is `provides <Interface> with <ImplementationClass>;`. Writing `with` and the class in the wrong order fails to compile.' },
    { title: 'open module vs opens directive', md: 'An `open module` cannot contain individual `opens` statements inside its body because all packages are already opened.' },
    { title: 'Automatic module name derivation', md: 'Hyphens become dots, trailing versions are stripped. `spring-core-5.3.1.jar` becomes `spring.core`.' }
  ],

  traps: [
    {
      code: `module com.zoo {
  exports com.zoo.animals.*;
}`,
      prompt: 'Does this module-info.java compile?',
      answer: '**Does not compile.** Wildcards (`*`) are not permitted in `exports` or `opens` directives. Only specific, fully-qualified package names are allowed.',
      verify: null
    },
    {
      code: `module com.app {
  requires com.data.Repository;
}`,
      prompt: 'What is wrong with this directive if com.data.Repository is a class?',
      answer: '**Compile error.** `requires` must specify a **module name**, never a class or package name.',
      verify: null
    },
    {
      code: `// Module A:
module A {
  exports pkg.a;
}
// Module B:
module B {
  requires A;
  exports pkg.b;
}
// Module C:
module C {
  requires B;
  // Can C access classes in pkg.a?
}`,
      prompt: 'Can code in Module C access public classes in package pkg.a without explicit requires A?',
      answer: '**No.** Because Module B did not use `requires transitive A;`, readability is not implied for Module C. Module C must explicitly declare `requires A;` to access `pkg.a`.'
    },
    {
      code: `open module com.secret {
  opens com.secret.internal;
}`,
      prompt: 'Does this module declaration compile?',
      answer: '**Does not compile.** An `open module` already opens all packages for deep reflection. Specifying an `opens` directive inside an `open module` is redundant and a compile-time error.'
    },
    {
      code: `jlink --module-path mods --add-modules com.mycompany.app --output myimage`,
      prompt: 'If com.mycompany.app depends on an automatic module (e.g. guava.jar), will jlink succeed?',
      answer: '**No, jlink will fail with an error.** `jlink` requires all linked modules to be explicit named modules. It does not support automatic modules.'
    }
  ],

  questions: [
    {
      id: 'ch12-q01', type: 'single', difficulty: 'easy', objectiveIds: ['7a'], tags: ['module-info', 'syntax'],
      question: 'Which of the following is a valid directive in a `module-info.java` file?',
      code: null,
      options: [
        'requires package com.foo.bar;',
        'exports com.foo.bar to com.client;',
        'imports com.foo.bar;',
        'exports module com.foo.bar;',
        'requires all com.foo.bar;'
      ],
      answer: [1],
      explanation: '`exports <package> to <module>` is a qualified export, which restricts export of the package to specified modules. `requires` takes a module name without the word package. `imports` is not a module directive.',
      optionNotes: {
        '0': 'Invalid syntax: requires does not use the word package.',
        '1': 'Correct: qualified export syntax.',
        '2': 'imports is not a module directive.',
        '3': 'exports takes a package name, not a module.',
        '4': 'requires all is not a valid directive.'
      },
      verify: null
    },
    {
      id: 'ch12-q02', type: 'single', difficulty: 'medium', objectiveIds: ['7a'], tags: ['transitive', 'readability'],
      question: 'Module `A` exports package `p1`. Module `B` declares `requires transitive A;` and exports package `p2`. Module `C` declares `requires B;`. Which packages can code in Module `C` access directly?',
      code: null,
      options: [
        'p2 only',
        'Both p1 and p2',
        'p1 only',
        'Neither p1 nor p2',
        'Compile error in Module B'
      ],
      answer: [1],
      explanation: 'Because Module `B` declares `requires transitive A;`, any module that requires `B` automatically reads `A` as well (implied readability). Therefore, Module `C` reads both `A` and `B` and can access public types in both exported packages `p1` and `p2`.',
      optionNotes: {
        '0': 'transitive allows access to p1 as well.',
        '1': 'Correct: implied readability grants access to both p1 and p2.',
        '2': 'C requires B, so it also accesses p2.',
        '3': 'C has valid readability to both.',
        '4': 'Module B syntax is valid.'
      },
      verify: null
    },
    {
      id: 'ch12-q03', type: 'single', difficulty: 'medium', objectiveIds: ['7b'], tags: ['automatic-module', 'name'],
      question: 'What is the automatic module name derived from a JAR named `commons-math3-3.6.1.jar` if it lacks an `Automatic-Module-Name` manifest header?',
      code: null,
      options: [
        'commons.math3',
        'commons-math3',
        'commons.math3.3.6.1',
        'commonsMath3',
        'commons_math3'
      ],
      answer: [0],
      explanation: 'The automatic module naming algorithm strips the trailing version number (`-3.6.1`), drops `.jar`, and replaces non-alphanumeric characters (such as hyphens) with dots. `commons-math3` becomes `commons.math3`.',
      optionNotes: {
        '0': 'Correct: hyphens become dots and version is removed.',
        '1': 'Hyphens must be converted to dots.',
        '2': 'Trailing version is removed.',
        '3': 'Dots are used, not camelCase.',
        '4': 'Underscores are not used.'
      },
      verify: null
    },
    {
      id: 'ch12-q04', type: 'single', difficulty: 'hard', objectiveIds: ['7a'], tags: ['serviceloader', 'uses'],
      question: 'A modular application calls `ServiceLoader.load(MessageService.class)`. What must be declared in the consumer\'s `module-info.java`?',
      code: null,
      options: [
        'provides MessageService with ...',
        'uses MessageService;',
        'exports MessageService;',
        'requires ServiceLoader;',
        'opens MessageService;'
      ],
      answer: [1],
      explanation: 'A module that consumes a service using `ServiceLoader.load()` must declare `uses <ServiceInterface>;` in its `module-info.java`. Omitting `uses` causes a runtime `ServiceConfigurationError`.',
      optionNotes: {
        '0': 'provides is for the service provider, not consumer.',
        '1': 'Correct: consumer must declare uses.',
        '2': 'exports exposes packages.',
        '3': 'ServiceLoader is part of java.base.',
        '4': 'opens is for reflection.'
      },
      verify: null
    },
    {
      id: 'ch12-q05', type: 'single', difficulty: 'medium', objectiveIds: ['7b'], tags: ['jlink', 'rules'],
      question: 'Which condition prevents `jlink` from successfully creating a custom runtime image?',
      code: null,
      options: [
        'One of the dependencies is an automatic module.',
        'The application contains multiple modular JARs.',
        'The main module requires java.logging.',
        'A module declares open packages.',
        'The output directory does not exist.'
      ],
      answer: [0],
      explanation: '`jlink` does not support automatic modules. Every module packaged into a custom runtime image must be an explicit named module with a valid `module-info.class`.',
      optionNotes: {
        '0': 'Correct: jlink fails if any dependency is an automatic module.',
        '1': 'Multiple modular JARs are standard for jlink.',
        '2': 'JDK modules like java.logging are fully supported.',
        '3': 'Open packages are supported.',
        '4': 'jlink creates the output directory if it does not exist.'
      },
      verify: null
    },
    {
      id: 'ch12-q06', type: 'single', difficulty: 'easy', objectiveIds: ['7b'], tags: ['cli', 'jar'],
      question: 'Which `jar` command option prints the module descriptor of a modular JAR file?',
      code: null,
      options: [
        'jar --describe-module --file app.jar',
        'jar --print-module --file app.jar',
        'jar --info --file app.jar',
        'jar --show-module app.jar',
        'jar -m app.jar'
      ],
      answer: [0],
      explanation: '`jar --describe-module --file <file>` (or `-d -f <file>`) outputs the module descriptor including its exports, requires, and other directives.',
      optionNotes: {
        '0': 'Correct: --describe-module (or -d).',
        '1': '--print-module is not a valid option.',
        '2': '--info is not a valid option.',
        '3': '--show-module is not a valid option.',
        '4': '-m is used for manifest.'
      },
      verify: null
    },
    {
      id: 'ch12-q07', type: 'single', difficulty: 'medium', objectiveIds: ['7a'], tags: ['opens', 'reflection'],
      question: 'What is the difference between `exports` and `opens` in `module-info.java`?',
      code: null,
      options: [
        'exports allows compile-time and runtime public access; opens allows runtime reflection including private members.',
        'exports allows access to private members; opens allows access only to public members.',
        'exports is for subpackages; opens is for root packages.',
        'exports works with class path; opens works with module path.',
        'There is no difference; they are aliases.'
      ],
      answer: [0],
      explanation: '`exports` grants compile-time and runtime access to public and protected members of the package. `opens` grants runtime access for deep reflection (including private members) via `java.lang.reflect`, but does not grant compile-time access.',
      optionNotes: {
        '0': 'Correct: exports for compile/runtime public access; opens for runtime deep reflection.',
        '1': 'Inverted.',
        '2': 'Neither exports subpackages automatically.',
        '3': 'Both apply to module-path modules.',
        '4': 'They serve distinctly different purposes.'
      },
      verify: null
    },
    {
      id: 'ch12-q08', type: 'single', difficulty: 'hard', objectiveIds: ['7b'], tags: ['jdeps', 'cli'],
      question: 'Which tool is specifically designed to analyze code dependencies and detect uses of internal JDK APIs?',
      code: null,
      options: [
        'jdeps',
        'jlink',
        'jmod',
        'jdeprscan',
        'jstat'
      ],
      answer: [0],
      explanation: '`jdeps` (Java Dependency Analysis Tool) with `-jdkinternals` analyzes class files and reports dependencies on internal JDK packages that are not part of the supported public API.',
      optionNotes: {
        '0': 'Correct: jdeps scans package and module dependencies and internal APIs.',
        '1': 'jlink creates runtime images.',
        '2': 'jmod creates JMOD files.',
        '3': 'jdeprscan checks for use of deprecated APIs.',
        '4': 'jstat monitors JVM statistics.'
      },
      verify: null
    },
    {
      id: 'ch12-q09', type: 'single', difficulty: 'medium', objectiveIds: ['7a'], tags: ['module-types', 'unnamed'],
      question: 'Which statement about the unnamed module is TRUE?',
      code: null,
      options: [
        'A named module on the module path can directly declare requires on the unnamed module.',
        'Code on the class path belongs to the unnamed module and can read all modules on the module path.',
        'The unnamed module has a module-info.class generated dynamically at startup.',
        'The unnamed module cannot access any JDK modules.',
        'The unnamed module does not export its packages to other class path code.'
      ],
      answer: [1],
      explanation: 'Code on the class path lives in the unnamed module. The unnamed module can read all packages of all modules on the module path and exports all of its own packages. However, named modules cannot require the unnamed module.',
      optionNotes: {
        '0': 'Named modules cannot require the unnamed module.',
        '1': 'Correct: unnamed module on class path reads all modules.',
        '2': 'Unnamed module has no module-info.',
        '3': 'It has access to root JDK modules.',
        '4': 'It exports all packages to class path code.'
      },
      verify: null
    },
    {
      id: 'ch12-q10', type: 'single', difficulty: 'hard', objectiveIds: ['7a'], tags: ['services', 'provides'],
      question: 'Given the interface `com.foo.api.Engine` and implementation `com.foo.internal.V8Engine`, which directive correctly registers the service provider?',
      code: null,
      options: [
        'provides com.foo.api.Engine with com.foo.internal.V8Engine;',
        'provides com.foo.internal.V8Engine for com.foo.api.Engine;',
        'uses com.foo.api.Engine with com.foo.internal.V8Engine;',
        'provides com.foo.internal.V8Engine as com.foo.api.Engine;',
        'service com.foo.api.Engine implemented by com.foo.internal.V8Engine;'
      ],
      answer: [0],
      explanation: 'The JPMS syntax for providing a service is `provides <Service-Type> with <Implementation-Type>;`.',
      optionNotes: {
        '0': 'Correct: provides Interface with Implementation.',
        '1': 'Keyword is with, not for.',
        '2': 'uses does not take with.',
        '3': 'Keyword is with, not as.',
        '4': 'service is not a directive keyword.'
      },
      verify: null
    }
  ],

  checklist: [
    'I know module-info.java must be at the root of the source hierarchy.',
    'I know exports takes a package name and requires takes a module name.',
    'I know subpackages are not exported when a parent package is exported.',
    'I know requires transitive provides implied readability to dependent modules.',
    'I know opens allows runtime reflection on private members, and open module opens all packages.',
    'I know the Service Provider Interface directives: provides <Service> with <Impl> and uses <Service>.',
    'I know the 3 module types: named, automatic, and unnamed.',
    'I know how automatic module names are derived from JAR names and manifests.',
    'I know named modules cannot require the unnamed module.',
    'I know jlink creates custom runtime images and cannot use automatic modules.',
    'I know jdeps analyzes dependencies and internal JDK API usage.',
    'I know java -p <path> -m <module>/<mainClass> launches modular applications.'
  ]
});
