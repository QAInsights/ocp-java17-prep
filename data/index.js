(function () {
  "use strict";
  var OCP = (window.OCP = {
    chapters: [],
    registerChapter: function (ch) {
      OCP.chapters.push(ch);
      OCP.chapters.sort(function (a, b) {
        return a.id - b.id;
      });
    },
    objectives: [
      {
        area: "Handling date, time, text, numeric and boolean values",
        bullets: [
          {
            id: "1a",
            text: "Use primitives and wrapper classes including Math API, parentheses, type promotion, and casting to evaluate arithmetic and boolean expressions",
          },
          {
            id: "1b",
            text: "Manipulate text, including text blocks, using String and StringBuilder classes",
          },
          {
            id: "1c",
            text: "Manipulate date, time, duration, period, instant and time-zone objects using Date-Time API",
          },
        ],
      },
      {
        area: "Controlling Program Flow",
        bullets: [
          {
            id: "2",
            text: "Create program flow control constructs including if/else, switch statements and expressions, loops, and break and continue statements",
          },
        ],
      },
      {
        area: "Utilizing Java Object-Oriented Approach",
        bullets: [
          {
            id: "3a",
            text: "Declare and instantiate Java objects including nested class objects, and explain the object life-cycle including creation, reassigning references, and garbage collection",
          },
          {
            id: "3b",
            text: "Create classes and records, and define and use instance and static fields and methods, constructors, and instance and static initializers",
          },
          {
            id: "3c",
            text: "Implement overloading, including var-arg methods",
          },
          {
            id: "3d",
            text: "Understand variable scopes, use local variable type inference, apply encapsulation, and make objects immutable",
          },
          {
            id: "3e",
            text: "Implement inheritance, including abstract and sealed classes. Override methods, including that of Object class. Implement polymorphism and differentiate object type versus reference type. Perform type casting, identify object types using instanceof operator and pattern matching",
          },
          {
            id: "3f",
            text: "Create and use interfaces, identify functional interfaces, and utilize private, static, and default interface methods",
          },
          {
            id: "3g",
            text: "Create and use enumerations with fields, methods and constructors",
          },
        ],
      },
      {
        area: "Handling Exceptions",
        bullets: [
          {
            id: "4",
            text: "Handle exceptions using try/catch/finally, try-with-resources, and multi-catch blocks, including custom exceptions",
          },
        ],
      },
      {
        area: "Working with Arrays and Collections",
        bullets: [
          {
            id: "5",
            text: "Create Java arrays, List, Set, Map, and Deque collections, and add, remove, update, retrieve and sort their elements",
          },
        ],
      },
      {
        area: "Working with Streams and Lambda expressions",
        bullets: [
          {
            id: "6a",
            text: "Use Java object and primitive Streams, including lambda expressions implementing functional interfaces, to supply, filter, map, consume, and sort data",
          },
          {
            id: "6b",
            text: "Perform decomposition, concatenation and reduction, and grouping and partitioning on sequential and parallel streams",
          },
        ],
      },
      {
        area: "Packaging and deploying Java code and use the Java Platform Module System",
        bullets: [
          {
            id: "7a",
            text: "Define modules and their dependencies, expose module content including for reflection. Define services, producers, and consumers",
          },
          {
            id: "7b",
            text: "Compile Java code, produce modular and non-modular jars, runtime images, and implement migration using unnamed and automatic modules",
          },
        ],
      },
      {
        area: "Managing concurrent code execution",
        bullets: [
          {
            id: "8a",
            text: "Create worker threads using Runnable and Callable, manage the thread lifecycle, including automations provided by different Executor services and concurrent API",
          },
          {
            id: "8b",
            text: "Develop thread-safe code, using different locking mechanisms and concurrent API",
          },
          {
            id: "8c",
            text: "Process Java collections concurrently including the use of parallel streams",
          },
        ],
      },
      {
        area: "Using Java I/O API",
        bullets: [
          {
            id: "9a",
            text: "Read and write console and file data using I/O Streams",
          },
          { id: "9b", text: "Serialize and de-serialize Java objects" },
          {
            id: "9c",
            text: "Create, traverse, read, and write Path objects and their properties using java.nio.file API",
          },
        ],
      },
      {
        area: "Accessing databases using JDBC",
        bullets: [
          {
            id: "10",
            text: "Create connections, create and execute basic, prepared and callable statements, process query results and control transactions using JDBC API",
          },
        ],
      },
      {
        area: "Implementing Localization",
        bullets: [
          {
            id: "11",
            text: "Implement localization using locales, resource bundles, parse and format messages, dates, times, and numbers including currency and percentage values",
          },
        ],
      },
      {
        area: "Also expected",
        bullets: [
          { id: "12a", text: "Understand the basics of Java Logging API" },
          {
            id: "12b",
            text: "Use Annotations such as Override, FunctionalInterface, Deprecated, SuppressWarnings, and SafeVarargs",
          },
          { id: "12c", text: "Use generics, including wildcards" },
        ],
      },
    ],
    plannedChapters: [
      [1, "Building Blocks", ["1a"]],
      [2, "Operators", ["1a"]],
      [3, "Making Decisions", ["2"]],
      [4, "Core APIs", ["1a", "1b", "1c", "5"]],
      [5, "Methods", ["3b", "3c", "3d", "12b"]],
      [6, "Class Design", ["3a", "3b", "3e"]],
      [7, "Beyond Classes", ["3e", "3f", "3g", "3a"]],
      [8, "Lambdas & Functional Interfaces", ["3f", "6a"]],
      [9, "Collections & Generics", ["5", "12c"]],
      [10, "Streams", ["6a", "6b"]],
      [11, "Exceptions & Localization", ["4", "11", "12a"]],
      [12, "Modules", ["7a", "7b"]],
      [13, "Concurrency", ["8a", "8b", "8c"]],
      [14, "I/O & NIO.2", ["9a", "9b", "9c"]],
      [15, "JDBC", ["10"]],
    ].map(function (x) {
      return { id: x[0], title: x[1], objectiveIds: x[2] };
    }),
  });
})();
