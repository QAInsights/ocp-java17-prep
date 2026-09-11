OCP.registerChapter({
  id: 15,
  slug: 'jdbc',
  title: 'JDBC',
  objectiveIds: ['10'],
  intro: `Objective **10** (create connections, basic/prepared/callable statements, query results processing with ResultSet, transaction control with commit/rollback and savepoints). Chapter 15 completes the 1Z0-829 syllabus. The exam tests the mechanics of JDBC: the 3 statement interfaces, 1-based indexing for parameters and columns, executeQuery vs executeUpdate vs execute, ResultSet cursor navigation (beforeFirst, next, absolute, relative), handling SQL NULL with wasNull(), and transaction management with setAutoCommit(false).`,

  notes: [
    {
      id: 'jdbc-architecture-and-connection',
      title: 'JDBC architecture and connecting to a database',
      md: `## JDBC Architecture
JDBC is defined in two packages:
* **\`java.sql\`**: Core JDBC interfaces and classes (\`Connection\`, \`Statement\`, \`PreparedStatement\`, \`CallableStatement\`, \`ResultSet\`, \`SQLException\`, \`DriverManager\`).
* **\`javax.sql\`**: Advanced features (connection pools, \`DataSource\`, \`RowSet\`).

## The JDBC URL
Format:
\`\`\`
jdbc:<vendor/subprotocol>:<vendor-specific-connection-details>
\`\`\`
* Must always begin with \`jdbc:\`.
* Examples:
  * \`jdbc:postgresql://localhost:5432/zoo\`
  * \`jdbc:mysql://localhost:3306/zoo\`
  * \`jdbc:derby:zoodb;create=true\`

## Getting a Connection
\`\`\`java
try (Connection conn = DriverManager.getConnection(
       "jdbc:postgresql://localhost:5432/zoo", "user", "pass")) {
  // work with connection
}
\`\`\`
* \`DriverManager\` automatically discovers drivers on the classpath or module-path using ServiceLoader. Calling \`Class.forName("...")\` is legacy and not required.`
    },
    {
      id: 'statements-and-execution',
      title: 'Statements and executing SQL',
      md: `## The three Statement interfaces

\`\`\`
Statement
  └── PreparedStatement
        └── CallableStatement
\`\`\`

1. **\`Statement\`**: for basic SQL queries without parameters.
2. **\`PreparedStatement\`**: for parameterized queries using bind variables (\`?\`). Pre-compiled, faster for repeated execution, and protects against SQL injection.
3. **\`CallableStatement\`**: for executing database stored procedures (\`{call proc_name(?, ?)}\`).

## Parameter indexing rule (1-BASED!)
* In \`PreparedStatement\` and \`CallableStatement\`, **parameters are 1-based**:
  \`\`\`java
  PreparedStatement ps = conn.prepareStatement("INSERT INTO exhibits VALUES (?, ?)");
  ps.setInt(1, 101);       // parameter 1 (first ?), NOT 0!
  ps.setString(2, "Lions"); // parameter 2 (second ?)
  \`\`\`
  * Passing index \`0\` throws **\`SQLException\`** at runtime!

## The three execute methods

| Method | Used For | Return Type | Notes |
|---|---|---|---|
| **\`executeQuery()\`** | \`SELECT\` statements | \`ResultSet\` | Throws \`SQLException\` if used for DDL/DML |
| **\`executeUpdate()\`** | \`INSERT\`, \`UPDATE\`, \`DELETE\`, DDL | \`int\` (rows affected) | Returns \`0\` for DDL statements (like CREATE TABLE); throws \`SQLException\` if used for SELECT |
| **\`execute()\`** | Any SQL statement | \`boolean\` | Returns \`true\` if result is a \`ResultSet\`; \`false\` if update count or no result |

### Processing \`execute()\`:
\`\`\`java
boolean isResultSet = stmt.execute(sql);
if (isResultSet) {
  try (ResultSet rs = stmt.getResultSet()) { ... }
} else {
  int rowsAffected = stmt.getUpdateCount();
}
\`\`\``
    },
    {
      id: 'resultset-navigation-and-reading',
      title: 'ResultSet: cursor navigation and reading columns',
      md: `## Cursor positioning
* When a \`ResultSet\` is first returned, the cursor is positioned **BEFORE THE FIRST ROW**.
* Calling \`rs.getString(...)\` before calling \`rs.next()\` throws a **\`SQLException\`**!

\`\`\`java
try (ResultSet rs = stmt.executeQuery("SELECT name, age FROM animals")) {
  while (rs.next()) { // moves forward one row; returns false at end
    String name = rs.getString(1); // or rs.getString("name")
    int age = rs.getInt(2);       // or rs.getInt("age")
  }
}
\`\`\`

## Scrollable ResultSet navigation methods
*(Requires \`ResultSet.TYPE_SCROLL_INSENSITIVE\` or \`TYPE_SCROLL_SENSITIVE\`)*:
* **\`next()\`**: moves forward 1 row.
* **\`previous()\`**: moves backward 1 row.
* **\`first()\`**: moves to row 1.
* **\`last()\`**: moves to the last row.
* **\`beforeFirst()\`**: moves before row 1.
* **\`afterLast()\`**: moves after the last row.
* **\`absolute(int row)\`**:
  * Positive: moves to 1-based row number from top (\`absolute(1)\` is first row).
  * Negative: moves from bottom (\`absolute(-1)\` is last row).
  * \`absolute(0)\`: moves before the first row.
* **\`relative(int rows)\`**: moves forward (+) or backward (-) relative to current row.

## Reading columns and handling SQL NULL
* Column numbers are **1-based** (\`rs.getString(1)\` is the first column in the select list).
* Reading SQL \`NULL\`:
  * Object types: returns Java \`null\` (\`rs.getString("desc")\` -> \`null\`).
  * Primitive types: returns the primitive default (\`rs.getInt("age")\` -> **\`0\`**!).
  * To detect whether the column was actually SQL NULL: call **\`rs.wasNull()\`** immediately after reading the column!`
    },
    {
      id: 'transactions-and-closing',
      title: 'Transaction management and closing resources',
      md: `## Managing transactions
By default, every JDBC connection operates in **auto-commit mode** (\`conn.getAutoCommit() == true\`), meaning each statement commits immediately upon completion.

### Transaction control methods:
\`\`\`java
try {
  conn.setAutoCommit(false); // Begin transaction block
  
  stmt1.executeUpdate();
  Savepoint sp = conn.setSavepoint("Savepoint1");
  stmt2.executeUpdate();
  
  conn.commit(); // Commit all changes
} catch (SQLException e) {
  conn.rollback(); // Rollback to beginning
  // or conn.rollback(sp); // Rollback to savepoint
}
\`\`\`

## Closing resources
* \`Connection\`, \`Statement\`, and \`ResultSet\` all implement **\`AutoCloseable\`**.
* Best practice is managing all three in a try-with-resources statement:
\`\`\`java
try (Connection conn = DriverManager.getConnection(url, user, pass);
     PreparedStatement ps = conn.prepareStatement(sql);
     ResultSet rs = ps.executeQuery()) {
  // read rs
}
\`\`\`
* **Cascading closes**:
  * Closing a \`Connection\` automatically closes any open \`Statement\` objects created from it.
  * Closing a \`Statement\` automatically closes its current open \`ResultSet\`.`
    }
  ],

  gotchas: [
    { title: 'Parameters and columns are 1-based', md: 'Both `PreparedStatement` parameter indices (`setInt(1, val)`) and `ResultSet` column indices (`getString(1)`) are **1-based**. Passing `0` throws `SQLException`.' },
    { title: 'Cursor starts before first row', md: 'A new `ResultSet` cursor is positioned before the first row. Calling `rs.getString()` before `rs.next()` throws `SQLException`.' },
    { title: 'executeQuery vs executeUpdate', md: 'Calling `executeQuery()` with an `INSERT`/`UPDATE` statement throws `SQLException`. Calling `executeUpdate()` with a `SELECT` statement throws `SQLException`.' },
    { title: 'execute() return value', md: '`stmt.execute(sql)` returns `true` if the result is a `ResultSet` (query). It returns `false` if the result is an update count or no result.' },
    { title: 'wasNull() primitive trap', md: 'If an SQL column is `NULL`, `rs.getInt("age")` returns `0`, NOT `null`. Call `rs.wasNull()` to check if the database value was actually NULL.' },
    { title: 'absolute(0) is beforeFirst', md: '`rs.absolute(0)` moves the cursor before the first row. Calling getters on row 0 throws `SQLException`.' },
    { title: 'absolute(-1) is last row', md: 'Negative numbers in `rs.absolute()` count from the end: `rs.absolute(-1)` moves to the last row of the ResultSet.' },
    { title: 'autoCommit default is true', md: 'JDBC connections default to `autoCommit = true`. You must call `conn.setAutoCommit(false)` to control transactions.' },
    { title: 'Closing statement closes ResultSet', md: 'Closing a `Statement` automatically closes its open `ResultSet`. If you close a statement and then try to read from its result set, an exception is thrown.' }
  ],

  traps: [
    {
      code: `Connection conn = DriverManager.getConnection(url);
PreparedStatement ps = conn.prepareStatement("SELECT * FROM zoo WHERE id = ?");
ps.setInt(0, 10);
ResultSet rs = ps.executeQuery();`,
      prompt: 'What happens when this code is executed?',
      answer: '**Throws SQLException at runtime.** Parameter indices in JDBC are **1-based** (`setInt(1, 10)`), not 0-based. Passing `0` causes an index-out-of-bounds `SQLException`.',
      verify: null
    },
    {
      code: `ResultSet rs = stmt.executeQuery("SELECT name FROM animals");
String name = rs.getString("name");
System.out.println(name);`,
      prompt: 'What happens when this code is executed?',
      answer: '**Throws SQLException at runtime.** The cursor is initially positioned before the first row. You must call `rs.next()` before attempting to read any data.',
      verify: null
    },
    {
      code: `Statement stmt = conn.createStatement();
int result = stmt.executeUpdate("SELECT COUNT(*) FROM animals");`,
      prompt: 'What happens when this code is executed?',
      answer: '**Throws SQLException at runtime.** `executeUpdate()` cannot be used for `SELECT` queries; `executeQuery()` must be used for queries.',
      verify: null
    },
    {
      code: `boolean b = stmt.execute("UPDATE animals SET age = age + 1");
System.out.println(b);`,
      prompt: 'What does this code print assuming the update succeeds?',
      answer: 'Prints **`false`**. `stmt.execute()` returns `true` only when the query returns a `ResultSet`. For update statements, it returns `false`.',
      verify: null
    },
    {
      code: `// Assuming table has 3 rows:
rs.absolute(2);
rs.relative(-1);
System.out.println(rs.getInt("id"));`,
      prompt: 'Which row is the cursor on when getInt is called?',
      answer: 'Row **1**. `absolute(2)` moves to row 2. `relative(-1)` moves back 1 row from row 2, positioning the cursor on row 1.',
      verify: null
    }
  ],

  questions: [
    {
      id: 'ch15-q01', type: 'single', difficulty: 'easy', objectiveIds: ['10'], tags: ['jdbc-url', 'syntax'],
      question: 'Which of the following is a valid format for a JDBC connection URL?',
      code: null,
      options: [
        'jdbc:postgresql://localhost:5432/zoodb',
        'http://jdbc:localhost:5432/zoodb',
        'sql:postgresql:zoodb',
        'driver:jdbc:postgresql://zoodb',
        'db:localhost:5432/zoodb'
      ],
      answer: [0],
      explanation: 'A JDBC URL must begin with `jdbc:`, followed by the database vendor or subprotocol (e.g. `postgresql:`, `mysql:`, `derby:`), followed by vendor-specific connection details.',
      optionNotes: {
        '0': 'Correct: starts with jdbc: followed by vendor and host/db.',
        '1': 'Cannot start with http://.',
        '2': 'Cannot start with sql:.',
        '3': 'Cannot start with driver:.',
        '4': 'Must start with jdbc:.'
      },
      verify: null
    },
    {
      id: 'ch15-q02', type: 'single', difficulty: 'easy', objectiveIds: ['10'], tags: ['preparedstatement', 'indexing'],
      question: 'Given `PreparedStatement ps = conn.prepareStatement("SELECT * FROM emp WHERE dept = ? AND salary > ?");`, what are the correct parameter indices?',
      code: null,
      options: [
        '1 and 2',
        '0 and 1',
        'dept and salary',
        ':dept and :salary',
        '1 and 0'
      ],
      answer: [0],
      explanation: 'JDBC parameter bind placeholders (`?`) are **1-based**. The first parameter is 1, and the second is 2.',
      optionNotes: {
        '0': 'Correct: 1-based indexing.',
        '1': '0-based indexing is illegal in JDBC and throws SQLException.',
        '2': 'Named parameters are not supported in standard JDBC SQL strings.',
        '3': 'Named parameters are not used with JDBC ? placeholders.',
        '4': 'Invalid indices.'
      },
      verify: null
    },
    {
      id: 'ch15-q03', type: 'single', difficulty: 'medium', objectiveIds: ['10'], tags: ['resultset', 'navigation'],
      question: 'What happens if you attempt to call `rs.getString(1)` immediately after receiving a new `ResultSet rs` without calling `rs.next()`?',
      code: null,
      options: [
        'Throws SQLException at runtime',
        'Returns the value of column 1 from the first row',
        'Returns null',
        'Throws NullPointerException',
        'Returns an empty String'
      ],
      answer: [0],
      explanation: 'The cursor of a newly opened `ResultSet` is positioned before the first row. Attempting to access column data without first advancing the cursor via `rs.next()` throws a `SQLException`.',
      optionNotes: {
        '0': 'Correct: cursor is before first row, throwing SQLException.',
        '1': 'Cursor must be positioned on a valid row first via rs.next().',
        '2': 'Does not return null.',
        '3': 'rs itself is not null.',
        '4': 'Does not return empty string.'
      },
      verify: null
    },
    {
      id: 'ch15-q04', type: 'single', difficulty: 'medium', objectiveIds: ['10'], tags: ['execute', 'return-type'],
      question: 'What is returned by `statement.execute(sql)` when executing a `DELETE FROM inventory WHERE count = 0` statement?',
      code: null,
      options: [
        'false',
        'true',
        'The number of rows deleted as an int',
        '0',
        'A ResultSet'
      ],
      answer: [0],
      explanation: '`statement.execute()` returns `boolean`: `true` if the first result is a `ResultSet` (such as from a SELECT), and `false` if it is an update count or there are no results. For a DELETE statement, it returns `false`.',
      optionNotes: {
        '0': 'Correct: returns false for DML/DDL statements.',
        '1': 'true is returned only when the statement produces a ResultSet.',
        '2': 'executeUpdate() returns the row count int, not execute().',
        '3': 'execute() returns a boolean, not an int.',
        '4': 'DELETE does not produce a ResultSet.'
      },
      verify: null
    },
    {
      id: 'ch15-q05', type: 'single', difficulty: 'hard', objectiveIds: ['10'], tags: ['resultset', 'wasnull'],
      question: 'A database table contains an integer column `points` whose value for the current row is SQL `NULL`. What is the result of calling `int pts = rs.getInt("points");`?',
      code: null,
      options: [
        'pts is assigned 0',
        'pts is assigned null',
        'Throws NullPointerException at runtime',
        'Throws SQLException at runtime',
        'pts is assigned -1'
      ],
      answer: [0],
      explanation: 'In JDBC, reading an SQL `NULL` value into a primitive variable converts the value to the primitive default (`0` for numeric types, `false` for boolean). To determine if the database column was actually NULL, callers invoke `rs.wasNull()`.',
      optionNotes: {
        '0': 'Correct: primitive default 0 is returned for SQL NULL.',
        '1': 'Primitive int cannot be assigned null.',
        '2': 'No exception is thrown.',
        '3': 'SQL NULL does not throw SQLException.',
        '4': 'Default is 0, not -1.'
      },
      verify: null
    },
    {
      id: 'ch15-q06', type: 'single', difficulty: 'medium', objectiveIds: ['10'], tags: ['transactions', 'autocommit'],
      question: 'What is the default auto-commit behavior of a newly created JDBC `Connection`?',
      code: null,
      options: [
        'Auto-commit is enabled (true)',
        'Auto-commit is disabled (false)',
        'Auto-commit is determined by the SQL dialect',
        'Auto-commit is only enabled for SELECT statements',
        'Auto-commit throws an exception if not explicitly set'
      ],
      answer: [0],
      explanation: 'By default in JDBC, a new `Connection` has auto-commit enabled (`conn.getAutoCommit() == true`). Every statement is committed as soon as execution finishes.',
      optionNotes: {
        '0': 'Correct: default is true.',
        '1': 'Must be explicitly turned off with setAutoCommit(false).',
        '2': 'JDBC specification sets default to true.',
        '3': 'Applies to all statements.',
        '4': 'Does not throw exception.'
      },
      verify: null
    },
    {
      id: 'ch15-q07', type: 'single', difficulty: 'hard', objectiveIds: ['10'], tags: ['resultset', 'absolute'],
      question: 'Given a scrollable `ResultSet` containing 5 rows, what does `rs.absolute(-1)` do?',
      code: null,
      options: [
        'Moves the cursor to the 5th (last) row',
        'Moves the cursor before the first row',
        'Throws SQLException because negative rows are illegal',
        'Moves the cursor to row 1',
        'Moves the cursor after the last row'
      ],
      answer: [0],
      explanation: 'In `rs.absolute(int row)`, negative values count backwards from the end of the `ResultSet`. `-1` specifies the last row, `-2` the second-to-last, etc. Row 5 is the last row.',
      optionNotes: {
        '0': 'Correct: -1 moves to the last row.',
        '1': 'absolute(0) moves before the first row.',
        '2': 'Negative numbers are valid in absolute().',
        '3': 'absolute(1) moves to row 1.',
        '4': 'afterLast() moves after the last row.'
      },
      verify: null
    },
    {
      id: 'ch15-q08', type: 'single', difficulty: 'medium', objectiveIds: ['10'], tags: ['statements', 'executeupdate'],
      question: 'What is returned by `stmt.executeUpdate("CREATE TABLE test (id INT)")`?',
      code: null,
      options: [
        '0',
        '1',
        'true',
        'false',
        'Throws SQLException because CREATE TABLE is not an update'
      ],
      answer: [0],
      explanation: '`executeUpdate()` is used for DML statements (INSERT, UPDATE, DELETE) and DDL statements (CREATE, DROP, ALTER). For DDL statements that return nothing, `executeUpdate()` returns `0`.',
      optionNotes: {
        '0': 'Correct: DDL statements return 0 from executeUpdate().',
        '1': 'No rows are affected by table creation.',
        '2': 'executeUpdate returns primitive int, not boolean.',
        '3': 'Returns int, not boolean.',
        '4': 'DDL statements are valid in executeUpdate().'
      },
      verify: null
    },
    {
      id: 'ch15-q09', type: 'single', difficulty: 'medium', objectiveIds: ['10'], tags: ['callablestatement', 'stored-procedures'],
      question: 'Which symbol is used for bind parameters in JDBC `CallableStatement` calls to stored procedures?',
      code: null,
      options: [
        '?',
        ':param',
        '@param',
        '%',
        '$1'
      ],
      answer: [0],
      explanation: 'Standard JDBC uses the question mark `?` placeholder for both IN and OUT parameters in `CallableStatement` (e.g. `{call calc_bonus(?, ?)}`).',
      optionNotes: {
        '0': 'Correct: ? placeholder.',
        '1': 'Named parameter syntax is not standard JDBC SQL.',
        '2': '@ is SQL Server parameter syntax, not JDBC placeholder.',
        '3': '% is a wildcard in LIKE clauses.',
        '4': '$1 is PostgreSQL internal syntax, not JDBC standard.'
      },
      verify: null
    },
    {
      id: 'ch15-q10', type: 'single', difficulty: 'easy', objectiveIds: ['10'], tags: ['resources', 'closing'],
      question: 'What happens to open `Statement` objects when their parent `Connection` is closed?',
      code: null,
      options: [
        'They are automatically closed',
        'They remain open and can still execute queries',
        'They throw a ConnectionClosedException immediately',
        'They are committed automatically',
        'Their cursor moves to afterLast'
      ],
      answer: [0],
      explanation: 'Closing a `Connection` automatically closes any active `Statement` objects associated with that connection, and closing a `Statement` automatically closes its associated `ResultSet`.',
      optionNotes: {
        '0': 'Correct: cascading close behavior in JDBC.',
        '1': 'Statements cannot remain open without a connection.',
        '2': 'They are closed cleanly.',
        '3': 'Uncommitted transactions may be rolled back, not committed.',
        '4': 'Result sets are closed.'
      },
      verify: null
    }
  ],

  checklist: [
    'I know JDBC URLs begin with jdbc: followed by vendor/subprotocol.',
    'I know PreparedStatement bind parameters (?) and ResultSet column indices are 1-based.',
    'I know executeQuery() is for SELECT queries and returns ResultSet.',
    'I know executeUpdate() is for INSERT/UPDATE/DELETE/DDL and returns an int.',
    'I know execute() returns boolean (true for ResultSet, false for update count/no result).',
    'I know ResultSet cursors start before the first row and require next() before reading.',
    'I know rs.wasNull() must be checked after reading primitive values from a ResultSet to detect SQL NULL.',
    'I know scrollable cursor methods: first(), last(), beforeFirst(), afterLast(), absolute(row), relative(rows).',
    'I know absolute(-1) moves to the last row and absolute(0) moves before the first row.',
    'I know autoCommit defaults to true and setAutoCommit(false) is required for manual transaction control.',
    'I know closing a Connection automatically closes its Statements and ResultSets.'
  ]
});
