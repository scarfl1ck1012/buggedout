// ═══════════════════════════════════════════════
// BuggedOut — Complete Task Question Bank
// 48+ tasks across 6 topics, 8+ per topic
// Types: spot_the_bug, fill_the_gap, predict_output
// ═══════════════════════════════════════════════

const TASK_BANK = {
  // ─────────────────────────────────────────────
  // TOPIC: DSA (Data Structures & Algorithms)
  // ─────────────────────────────────────────────
  DSA: [
    {
      id: "dsa_001",
      topic: "DSA",
      type: "spot_the_bug",
      difficulty: 1,
      title: "Fix the Binary Search",
      description:
        "This binary search has a bug causing infinite loops on some inputs.",
      code: `def binary_search(arr, target):
    left, right = 0, len(arr)
    while left < right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid
        else:
            right = mid
    return -1`,
      language: "python",
      options: ["Line 2", "Line 4", "Line 8", "Line 10"],
      correctAnswer: "Line 8",
      explanation:
        "left = mid causes infinite loop when left + 1 == right. Should be left = mid + 1.",
    },
    {
      id: "dsa_002",
      topic: "DSA",
      type: "spot_the_bug",
      difficulty: 1,
      title: "Off-by-one in Bubble Sort",
      description:
        "This bubble sort crashes with an IndexError on some arrays.",
      code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`,
      language: "python",
      options: ["Line 2", "Line 3", "Line 4", "Line 5"],
      correctAnswer: "Line 4",
      explanation:
        "range(0, n-i) goes one too far. Should be range(0, n-i-1) to prevent arr[j+1] IndexError.",
    },
    {
      id: "dsa_003",
      topic: "DSA",
      type: "fill_the_gap",
      difficulty: 1,
      title: "Stack Push/Pop",
      description:
        "Complete the Stack implementation with the correct methods.",
      code: `class Stack:
    def __init__(self):
        self.items = []
    def push(self, item):
        self.items.___(item)
    def pop(self):
        return self.items.___()`,
      language: "python",
      options: [
        "append / pop",
        "add / remove",
        "push / pull",
        "insert / delete",
      ],
      correctAnswer: "append / pop",
      explanation:
        "Python lists use append() to add and pop() to remove from the end (stack top).",
    },
    {
      id: "dsa_004",
      topic: "DSA",
      type: "predict_output",
      difficulty: 1,
      title: "Array Last Element",
      description: "What does this code print?",
      code: `arr = [1, 2, 3, 4, 5]
print(arr[len(arr) - 1])`,
      language: "python",
      options: ["5", "4", "IndexError", "None"],
      correctAnswer: "5",
      explanation: "len(arr) is 5, so arr[4] is the last element: 5.",
    },
    {
      id: "dsa_005",
      topic: "DSA",
      type: "spot_the_bug",
      difficulty: 2,
      title: "Linked List Insert",
      description: "This linked list insertion loses nodes. Find the bug.",
      code: `def insert_after(node, new_data):
    new_node = Node(new_data)
    new_node.next = None
    node.next = new_node`,
      language: "python",
      options: ["Line 2", "Line 3", "Line 4", "No bug"],
      correctAnswer: "Line 3",
      explanation:
        "new_node.next should be set to node.next BEFORE node.next is overwritten. Setting to None loses the rest of the list.",
    },
    {
      id: "dsa_006",
      topic: "DSA",
      type: "fill_the_gap",
      difficulty: 2,
      title: "Queue with Two Stacks",
      description: "Complete the dequeue operation using two stacks.",
      code: `class Queue:
    def __init__(self):
        self.in_stack = []
        self.out_stack = []
    def enqueue(self, item):
        self.in_stack.append(item)
    def dequeue(self):
        if not self.out_stack:
            while self.___:
                self.out_stack.append(self.in_stack.___())
        return self.out_stack.pop()`,
      language: "python",
      options: [
        "in_stack / pop",
        "out_stack / pop",
        "in_stack / shift",
        "items / remove",
      ],
      correctAnswer: "in_stack / pop",
      explanation:
        "We drain in_stack by popping from it and pushing to out_stack, reversing the order.",
    },
    {
      id: "dsa_007",
      topic: "DSA",
      type: "predict_output",
      difficulty: 2,
      title: "Recursion Base Case",
      description:
        "What happens when this function is called with factorial(5)?",
      code: `def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

print(factorial(5))`,
      language: "python",
      options: ["120", "24", "RecursionError", "0"],
      correctAnswer: "120",
      explanation:
        "5! = 5*4*3*2*1 = 120. The base case n==0 returns 1 correctly.",
    },
    {
      id: "dsa_008",
      topic: "DSA",
      type: "spot_the_bug",
      difficulty: 3,
      title: "Hash Map Collision",
      description: "This hash map loses values on collision. Find the flaw.",
      code: `class HashMap:
    def __init__(self, size=10):
        self.table = [None] * size
    def put(self, key, value):
        idx = hash(key) % len(self.table)
        self.table[idx] = value
    def get(self, key):
        idx = hash(key) % len(self.table)
        return self.table[idx]`,
      language: "python",
      options: ["Line 3", "Line 5", "Line 6", "Line 9"],
      correctAnswer: "Line 6",
      explanation:
        "Directly setting table[idx] = value overwrites any existing value at that index. Needs chaining (e.g., list of (key, value) pairs).",
    },
    {
      id: "dsa_009",
      topic: "DSA",
      type: "predict_output",
      difficulty: 1,
      title: "List Slicing",
      description: "Predict the output of this slice operation.",
      code: `nums = [10, 20, 30, 40, 50]
print(nums[1:4])`,
      language: "python",
      options: [
        "[20, 30, 40]",
        "[10, 20, 30]",
        "[20, 30, 40, 50]",
        "[10, 20, 30, 40]",
      ],
      correctAnswer: "[20, 30, 40]",
      explanation:
        "Slice [1:4] includes indices 1, 2, 3 → elements 20, 30, 40.",
    },
  ],

  // ─────────────────────────────────────────────
  // TOPIC: Java Fundamentals
  // ─────────────────────────────────────────────
  Java: [
    {
      id: "java_001",
      topic: "Java",
      type: "spot_the_bug",
      difficulty: 1,
      title: "String Comparison Trap",
      description: "This code incorrectly compares strings. Find the bug.",
      code: `String a = new String("hello");
String b = new String("hello");
if (a == b) {
    System.out.println("Same");
} else {
    System.out.println("Different");
}`,
      language: "java",
      options: ["Line 1", "Line 2", "Line 3", "Line 5"],
      correctAnswer: "Line 3",
      explanation:
        "== compares references, not values. Should use a.equals(b) for string content comparison.",
    },
    {
      id: "java_002",
      topic: "Java",
      type: "predict_output",
      difficulty: 2,
      title: "Integer Overflow",
      description: "What does this code print?",
      code: `int x = Integer.MAX_VALUE;
x = x + 1;
System.out.println(x);`,
      language: "java",
      options: ["2147483648", "-2147483648", "0", "Overflow Error"],
      correctAnswer: "-2147483648",
      explanation:
        "Java integers wrap around silently. MAX_VALUE + 1 = MIN_VALUE = -2147483648.",
    },
    {
      id: "java_003",
      topic: "Java",
      type: "spot_the_bug",
      difficulty: 1,
      title: "Missing Break in Switch",
      description:
        "This switch statement has fall-through behavior. Find where.",
      code: `switch (day) {
    case 1:
        result = "Monday";
    case 2:
        result = "Tuesday";
        break;
    case 3:
        result = "Wednesday";
        break;
}`,
      language: "java",
      options: ["Line 1", "Line 3", "Line 5", "Line 8"],
      correctAnswer: "Line 3",
      explanation:
        'Missing break after case 1 causes fall-through: day=1 sets result to "Monday" then immediately to "Tuesday".',
    },
    {
      id: "java_004",
      topic: "Java",
      type: "fill_the_gap",
      difficulty: 1,
      title: "Array Initialization",
      description: "Complete the array declaration and access.",
      code: `int[] numbers = ___ int[5];
numbers[0] = 10;
System.out.println(numbers.___);`,
      language: "java",
      options: [
        "new / length",
        "new / size()",
        "create / length",
        "make / count",
      ],
      correctAnswer: "new / length",
      explanation:
        'Java arrays use "new" for allocation and ".length" (not a method) to get size.',
    },
    {
      id: "java_005",
      topic: "Java",
      type: "spot_the_bug",
      difficulty: 2,
      title: "NullPointerException",
      description: "This code throws NPE. Find the null access.",
      code: `String[] names = new String[3];
names[0] = "Alice";
names[1] = "Bob";
for (int i = 0; i < names.length; i++) {
    System.out.println(names[i].toUpperCase());
}`,
      language: "java",
      options: ["Line 1", "Line 3", "Line 4", "Line 5"],
      correctAnswer: "Line 5",
      explanation:
        "names[2] is null (never assigned). Calling .toUpperCase() on null throws NullPointerException.",
    },
    {
      id: "java_006",
      topic: "Java",
      type: "predict_output",
      difficulty: 1,
      title: "Post-increment vs Pre-increment",
      description: "What does this print?",
      code: `int a = 5;
int b = a++;
System.out.println(a + " " + b);`,
      language: "java",
      options: ["5 5", "6 5", "6 6", "5 6"],
      correctAnswer: "6 5",
      explanation:
        "a++ returns 5 (old value) then increments a to 6. So b=5, a=6.",
    },
    {
      id: "java_007",
      topic: "Java",
      type: "fill_the_gap",
      difficulty: 2,
      title: "StringBuilder Usage",
      description: "Complete the StringBuilder pattern.",
      code: `StringBuilder sb = new StringBuilder();
sb.___(\"Hello\");
sb.___(\" World\");
System.out.println(sb.toString());`,
      language: "java",
      options: [
        "append / append",
        "add / add",
        "concat / concat",
        "push / push",
      ],
      correctAnswer: "append / append",
      explanation: "StringBuilder uses .append() to add strings efficiently.",
    },
    {
      id: "java_008",
      topic: "Java",
      type: "spot_the_bug",
      difficulty: 2,
      title: "ArrayList Modification",
      description: "This code throws ConcurrentModificationException.",
      code: `List<String> list = new ArrayList<>(Arrays.asList("a","b","c"));
for (String s : list) {
    if (s.equals("b")) {
        list.remove(s);
    }
}`,
      language: "java",
      options: ["Line 1", "Line 2", "Line 4", "Line 5"],
      correctAnswer: "Line 4",
      explanation:
        "Removing from a list during enhanced for-loop throws ConcurrentModificationException. Use Iterator.remove() instead.",
    },
  ],

  // ─────────────────────────────────────────────
  // TOPIC: Python Basics
  // ─────────────────────────────────────────────
  Python: [
    {
      id: "py_001",
      topic: "Python",
      type: "spot_the_bug",
      difficulty: 2,
      title: "Mutable Default Argument",
      description: "This function behaves unexpectedly on repeated calls.",
      code: `def add_item(item, lst=[]):
    lst.append(item)
    return lst

print(add_item(1))
print(add_item(2))`,
      language: "python",
      options: ["Line 1", "Line 2", "Line 5", "Line 6"],
      correctAnswer: "Line 1",
      explanation:
        "Default mutable argument lst=[] is shared across calls. Second call returns [1, 2] instead of [2]. Use lst=None instead.",
    },
    {
      id: "py_002",
      topic: "Python",
      type: "predict_output",
      difficulty: 1,
      title: "String Multiplication",
      description: "What does this expression evaluate to?",
      code: `result = "ab" * 3
print(result)`,
      language: "python",
      options: ['"ababab"', '"ab3"', "TypeError", '"aabbcc"'],
      correctAnswer: '"ababab"',
      explanation:
        'String * int repeats the string that many times. "ab" * 3 = "ababab".',
    },
    {
      id: "py_003",
      topic: "Python",
      type: "fill_the_gap",
      difficulty: 1,
      title: "List Comprehension",
      description:
        "Complete the list comprehension to get squares of even numbers.",
      code: `numbers = [1, 2, 3, 4, 5, 6]
squares = [x**2 ___ x ___ numbers ___ x % 2 == 0]`,
      language: "python",
      options: [
        "for / in / if",
        "in / for / if",
        "for / from / when",
        "each / in / where",
      ],
      correctAnswer: "for / in / if",
      explanation:
        "List comprehension syntax: [expr for var in iterable if condition].",
    },
    {
      id: "py_004",
      topic: "Python",
      type: "spot_the_bug",
      difficulty: 1,
      title: "Tuple Assignment Error",
      description: "This code crashes when trying to modify a tuple.",
      code: `coords = (10, 20, 30)
coords[0] = 15
print(coords)`,
      language: "python",
      options: ["Line 1", "Line 2", "Line 3", "No bug"],
      correctAnswer: "Line 2",
      explanation: "Tuples are immutable. coords[0] = 15 raises TypeError.",
    },
    {
      id: "py_005",
      topic: "Python",
      type: "predict_output",
      difficulty: 2,
      title: "Dictionary Key Access",
      description: "What happens when you access a missing key?",
      code: `d = {"a": 1, "b": 2}
print(d["c"])`,
      language: "python",
      options: ["None", "0", "KeyError", "IndexError"],
      correctAnswer: "KeyError",
      explanation:
        'Accessing a missing key with [] raises KeyError. Use .get("c") for None default.',
    },
    {
      id: "py_006",
      topic: "Python",
      type: "fill_the_gap",
      difficulty: 2,
      title: "Try-Except Pattern",
      description: "Complete the error handling block.",
      code: `___:
    result = 10 / 0
___ ZeroDivisionError:
    result = 0
___:
    print("Done")`,
      language: "python",
      options: [
        "try / except / finally",
        "try / catch / finally",
        "begin / rescue / ensure",
        "do / except / end",
      ],
      correctAnswer: "try / except / finally",
      explanation: "Python uses try/except/finally for exception handling.",
    },
    {
      id: "py_007",
      topic: "Python",
      type: "spot_the_bug",
      difficulty: 2,
      title: "Scope Confusion",
      description: "This function cannot modify the counter. Why?",
      code: `counter = 0
def increment():
    counter += 1
    return counter
print(increment())`,
      language: "python",
      options: ["Line 1", "Line 2", "Line 3", "Line 5"],
      correctAnswer: "Line 3",
      explanation:
        'counter += 1 tries to assign to a local variable that is not yet defined. Need "global counter" declaration.',
    },
    {
      id: "py_008",
      topic: "Python",
      type: "predict_output",
      difficulty: 1,
      title: "Boolean Short Circuit",
      description: "What does this expression return?",
      code: `x = 0
y = 5
result = x or y
print(result)`,
      language: "python",
      options: ["True", "0", "5", "False"],
      correctAnswer: "5",
      explanation:
        '"or" returns the first truthy value. 0 is falsy, so it returns y which is 5.',
    },
    {
      id: "py_009",
      topic: "Python",
      type: "fill_the_gap",
      difficulty: 1,
      title: "String Formatting",
      description: "Complete the f-string expression.",
      code: `name = "World"
age = 25
msg = ___"Hello {name}, you are {age} years old"
print(msg)`,
      language: "python",
      options: ["f", "$", "fmt", "str"],
      correctAnswer: "f",
      explanation: 'Python f-strings use the f prefix: f"Hello {name}".',
    },
  ],

  // ─────────────────────────────────────────────
  // TOPIC: Web Development
  // ─────────────────────────────────────────────
  "Web Dev": [
    {
      id: "web_001",
      topic: "Web Dev",
      type: "predict_output",
      difficulty: 1,
      title: "typeof null Surprise",
      description: "What does typeof null return in JavaScript?",
      code: `console.log(typeof null);`,
      language: "javascript",
      options: ['"null"', '"undefined"', '"object"', '"string"'],
      correctAnswer: '"object"',
      explanation:
        'typeof null returns "object" — a famous JavaScript bug from its original implementation.',
    },
    {
      id: "web_002",
      topic: "Web Dev",
      type: "fill_the_gap",
      difficulty: 2,
      title: "Async/Await Pattern",
      description: "Complete the async function with proper await calls.",
      code: `async function fetchUser(id) {
    const response = ___ fetch('/api/user/' + id);
    const data = ___ response.json();
    return data;
}`,
      language: "javascript",
      options: [
        "await / await",
        "async / async",
        "await / then",
        "return / return",
      ],
      correctAnswer: "await / await",
      explanation:
        "Both fetch() and response.json() return Promises that need to be awaited.",
    },
    {
      id: "web_003",
      topic: "Web Dev",
      type: "spot_the_bug",
      difficulty: 2,
      title: "Closure Trap in Loop",
      description: "All buttons alert the same number. Find why.",
      code: `for (var i = 0; i < 5; i++) {
    buttons[i].addEventListener('click', function() {
        alert(i);
    });
}`,
      language: "javascript",
      options: ["Line 1", "Line 2", "Line 3", "Line 4"],
      correctAnswer: "Line 1",
      explanation:
        "var is function-scoped, so all closures share the same i (which is 5 after loop). Use let instead of var.",
    },
    {
      id: "web_004",
      topic: "Web Dev",
      type: "predict_output",
      difficulty: 1,
      title: "Triple Equals",
      description: "What does this comparison return?",
      code: `console.log(0 == "0");
console.log(0 === "0");`,
      language: "javascript",
      options: ["true / true", "true / false", "false / false", "false / true"],
      correctAnswer: "true / false",
      explanation:
        '== does type coercion (0 equals "0"), === checks type AND value (number !== string).',
    },
    {
      id: "web_005",
      topic: "Web Dev",
      type: "fill_the_gap",
      difficulty: 1,
      title: "DOM Selection",
      description: "Complete the DOM query to select elements.",
      code: `const btn = document.___("submit-btn");
const items = document.___(".list-item");`,
      language: "javascript",
      options: [
        "getElementById / querySelectorAll",
        "getElement / selectAll",
        "findById / findAll",
        "select / selectAll",
      ],
      correctAnswer: "getElementById / querySelectorAll",
      explanation:
        "getElementById for single ID, querySelectorAll for CSS selector matching multiple elements.",
    },
    {
      id: "web_006",
      topic: "Web Dev",
      type: "spot_the_bug",
      difficulty: 2,
      title: "Promise Chain Error",
      description: "This promise chain silently swallows errors.",
      code: `fetch('/api/data')
    .then(res => res.json())
    .then(data => processData(data))
    .then(result => displayResult(result));`,
      language: "javascript",
      options: ["Line 1", "Line 2", "Line 3", "Line 4"],
      correctAnswer: "Line 4",
      explanation:
        "No .catch() handler. Any error in the chain is silently swallowed. Add .catch(err => handleError(err)).",
    },
    {
      id: "web_007",
      topic: "Web Dev",
      type: "predict_output",
      difficulty: 2,
      title: "Array Spread vs Reference",
      description: "What does modifying b do to a?",
      code: `const a = [1, 2, 3];
const b = [...a];
b.push(4);
console.log(a.length);`,
      language: "javascript",
      options: ["3", "4", "undefined", "TypeError"],
      correctAnswer: "3",
      explanation:
        "Spread creates a shallow copy. Modifying b does not affect a. a.length is still 3.",
    },
    {
      id: "web_008",
      topic: "Web Dev",
      type: "fill_the_gap",
      difficulty: 2,
      title: "CSS Flexbox Center",
      description:
        "Complete the CSS to center items horizontally and vertically.",
      code: `.container {
    display: flex;
    ___: center;
    ___: center;
    height: 100vh;
}`,
      language: "css",
      options: [
        "justify-content / align-items",
        "text-align / vertical-align",
        "margin / padding",
        "left / top",
      ],
      correctAnswer: "justify-content / align-items",
      explanation:
        "Flexbox uses justify-content (main axis) and align-items (cross axis) to center.",
    },
  ],

  // ─────────────────────────────────────────────
  // TOPIC: SQL & Databases
  // ─────────────────────────────────────────────
  SQL: [
    {
      id: "sql_001",
      topic: "SQL",
      type: "spot_the_bug",
      difficulty: 1,
      title: "WHERE vs HAVING",
      description:
        "This query fails because aggregate functions are used with WHERE.",
      code: `SELECT department, COUNT(*)
FROM employees
WHERE COUNT(*) > 5
GROUP BY department;`,
      language: "sql",
      options: ["Line 1", "Line 2", "Line 3", "Line 4"],
      correctAnswer: "Line 3",
      explanation:
        "WHERE cannot use aggregate functions. Use HAVING COUNT(*) > 5 after GROUP BY.",
    },
    {
      id: "sql_002",
      topic: "SQL",
      type: "fill_the_gap",
      difficulty: 1,
      title: "Basic SELECT Query",
      description: "Complete the query to get unique departments.",
      code: `SELECT ___ department
FROM employees
___ BY department;`,
      language: "sql",
      options: [
        "DISTINCT / ORDER",
        "UNIQUE / SORT",
        "DIFFERENT / GROUP",
        "SINGLE / ARRANGE",
      ],
      correctAnswer: "DISTINCT / ORDER",
      explanation: "DISTINCT removes duplicates. ORDER BY sorts results.",
    },
    {
      id: "sql_003",
      topic: "SQL",
      type: "spot_the_bug",
      difficulty: 2,
      title: "NULL Comparison",
      description:
        "This query returns no results even though NULL values exist.",
      code: `SELECT name, email
FROM users
WHERE email = NULL;`,
      language: "sql",
      options: ["Line 1", "Line 2", "Line 3", "No bug"],
      correctAnswer: "Line 3",
      explanation:
        "Cannot compare with = NULL. Must use IS NULL. NULL = NULL evaluates to NULL (falsy).",
    },
    {
      id: "sql_004",
      topic: "SQL",
      type: "predict_output",
      difficulty: 1,
      title: "COUNT with NULL",
      description:
        "Given a table with values [10, NULL, 30, NULL, 50], what does COUNT(value) return?",
      code: `-- Table: data(value)
-- Rows: 10, NULL, 30, NULL, 50
SELECT COUNT(value) FROM data;`,
      language: "sql",
      options: ["5", "3", "0", "NULL"],
      correctAnswer: "3",
      explanation:
        "COUNT(column) skips NULL values. Only 3 non-NULL values exist. COUNT(*) would return 5.",
    },
    {
      id: "sql_005",
      topic: "SQL",
      type: "fill_the_gap",
      difficulty: 2,
      title: "JOIN Syntax",
      description: "Complete the JOIN query to get orders with customer names.",
      code: `SELECT c.name, o.total
FROM customers c
___ JOIN orders o
___ c.id = o.customer_id;`,
      language: "sql",
      options: ["INNER / ON", "INNER / WHERE", "LEFT / USING", "CROSS / IF"],
      correctAnswer: "INNER / ON",
      explanation:
        "INNER JOIN with ON clause matches rows where the condition is true.",
    },
    {
      id: "sql_006",
      topic: "SQL",
      type: "spot_the_bug",
      difficulty: 2,
      title: "Missing GROUP BY",
      description: "This query fails because of a missing GROUP BY.",
      code: `SELECT department, name, AVG(salary)
FROM employees
GROUP BY department;`,
      language: "sql",
      options: ["Line 1", "Line 2", "Line 3", "No bug"],
      correctAnswer: "Line 1",
      explanation:
        '"name" is not in GROUP BY and not aggregated. Either add name to GROUP BY or remove it from SELECT.',
    },
    {
      id: "sql_007",
      topic: "SQL",
      type: "predict_output",
      difficulty: 1,
      title: "UNION vs UNION ALL",
      description: "What is the difference in row count?",
      code: `-- Table A: (1, 2, 3)  Table B: (2, 3, 4)
SELECT * FROM A UNION SELECT * FROM B;
-- vs
SELECT * FROM A UNION ALL SELECT * FROM B;`,
      language: "sql",
      options: ["4 / 6", "6 / 6", "3 / 6", "4 / 4"],
      correctAnswer: "4 / 6",
      explanation:
        "UNION removes duplicates (1,2,3,4 = 4 rows). UNION ALL keeps all (1,2,3,2,3,4 = 6 rows).",
    },
    {
      id: "sql_008",
      topic: "SQL",
      type: "fill_the_gap",
      difficulty: 2,
      title: "Subquery Filter",
      description:
        "Complete the subquery to find employees earning above average.",
      code: `SELECT name, salary
FROM employees
WHERE salary > (
    SELECT ___(salary) FROM ___
);`,
      language: "sql",
      options: [
        "AVG / employees",
        "MAX / employees",
        "SUM / salary",
        "COUNT / employees",
      ],
      correctAnswer: "AVG / employees",
      explanation:
        "Subquery calculates average salary, outer query filters employees above that average.",
    },
  ],

  // ─────────────────────────────────────────────
  // TOPIC: Systems & OS
  // ─────────────────────────────────────────────
  Systems: [
    {
      id: "sys_001",
      topic: "Systems",
      type: "predict_output",
      difficulty: 2,
      title: "Bitwise Left Shift",
      description: "What does left-shifting 5 by 2 produce?",
      code: `int x = 5;
printf("%d", x << 2);`,
      language: "c",
      options: ["10", "20", "7", "25"],
      correctAnswer: "20",
      explanation:
        "5 in binary is 101. Left shift by 2: 10100 = 20. Left shift by n multiplies by 2^n.",
    },
    {
      id: "sys_002",
      topic: "Systems",
      type: "spot_the_bug",
      difficulty: 2,
      title: "NULL Pointer Dereference",
      description: "This C code crashes. Find the null dereference.",
      code: `int* ptr = NULL;
if (ptr != NULL || *ptr > 0) {
    printf("Valid: %d", *ptr);
}`,
      language: "c",
      options: ["Line 1", "Line 2", "Line 3", "No bug"],
      correctAnswer: "Line 2",
      explanation:
        "|| does not short-circuit on false in the right way here. Should be && to avoid dereferencing NULL when ptr is NULL.",
    },
    {
      id: "sys_003",
      topic: "Systems",
      type: "fill_the_gap",
      difficulty: 2,
      title: "Mutex Lock Pattern",
      description: "Complete the mutex pattern to prevent race conditions.",
      code: `pthread_mutex_t lock;
pthread_mutex_init(&lock, NULL);

pthread_mutex___(&lock);
shared_counter++;
pthread_mutex___(&lock);`,
      language: "c",
      options: [
        "lock / unlock",
        "acquire / release",
        "enter / exit",
        "begin / end",
      ],
      correctAnswer: "lock / unlock",
      explanation:
        "pthread_mutex_lock() acquires the mutex, pthread_mutex_unlock() releases it.",
    },
    {
      id: "sys_004",
      topic: "Systems",
      type: "predict_output",
      difficulty: 3,
      title: "Fork Process Count",
      description: "How many processes exist after this code runs?",
      code: `fork();
fork();
printf("hello\\n");`,
      language: "c",
      options: ["2", "3", "4", "1"],
      correctAnswer: "4",
      explanation:
        'First fork creates 2 processes. Each then forks again → 4 total processes, each printing "hello".',
    },
    {
      id: "sys_005",
      topic: "Systems",
      type: "spot_the_bug",
      difficulty: 2,
      title: "Memory Leak",
      description: "This code leaks memory. Find the missing free.",
      code: `char* buffer = malloc(256);
if (buffer == NULL) return -1;
strcpy(buffer, input);
if (strlen(buffer) > 100) {
    return -1;
}
free(buffer);
return 0;`,
      language: "c",
      options: ["Line 1", "Line 3", "Line 5", "Line 7"],
      correctAnswer: "Line 5",
      explanation:
        "Early return on line 5 skips free(buffer), causing a memory leak. Must free before returning.",
    },
    {
      id: "sys_006",
      topic: "Systems",
      type: "fill_the_gap",
      difficulty: 1,
      title: "File Operations",
      description: "Complete the file open and close pattern.",
      code: `FILE* fp = ___("data.txt", "r");
if (fp == NULL) {
    perror("Error");
    return 1;
}
// ... read data ...
___(fp);`,
      language: "c",
      options: [
        "fopen / fclose",
        "open / close",
        "read / write",
        "create / destroy",
      ],
      correctAnswer: "fopen / fclose",
      explanation:
        "C standard library uses fopen() to open files and fclose() to close them.",
    },
    {
      id: "sys_007",
      topic: "Systems",
      type: "predict_output",
      difficulty: 1,
      title: "Bitwise AND",
      description: "What is the result of this bitwise AND?",
      code: `int a = 12;  // 1100
int b = 10;  // 1010
printf("%d", a & b);`,
      language: "c",
      options: ["8", "10", "12", "2"],
      correctAnswer: "8",
      explanation:
        "1100 & 1010 = 1000 = 8. AND gives 1 only where both bits are 1.",
    },
    {
      id: "sys_008",
      topic: "Systems",
      type: "spot_the_bug",
      difficulty: 3,
      title: "Deadlock Conditions",
      description:
        "This code creates a deadlock. Identify the problematic line.",
      code: `// Thread 1:
pthread_mutex_lock(&lockA);
pthread_mutex_lock(&lockB);
// work...
pthread_mutex_unlock(&lockB);
pthread_mutex_unlock(&lockA);

// Thread 2:
pthread_mutex_lock(&lockB);
pthread_mutex_lock(&lockA);`,
      language: "c",
      options: ["Line 2", "Line 3", "Line 9", "Line 10"],
      correctAnswer: "Line 9",
      explanation:
        "Thread 2 locks in reverse order (B then A). If Thread 1 holds A and Thread 2 holds B, neither can proceed → deadlock.",
    },
  ],
};

export default TASK_BANK;
