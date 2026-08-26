export const languages = [
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    color: '#3776AB',
    shortDescription: 'Versatile, beginner-friendly language',
    description: 'Python is a high-level, interpreted programming language known for its simplicity and readability. It supports multiple programming paradigms including procedural, object-oriented, and functional programming.',
    topics: [
      { id: 'intro', title: 'Introduction to Python', content: 'Learn what Python is and why it\'s popular.' },
      { id: 'variables', title: 'Variables & Data Types', content: 'Understand variables, strings, integers, floats, and booleans.' },
      { id: 'operators', title: 'Operators', content: 'Arithmetic, comparison, and logical operators.' },
      { id: 'conditionals', title: 'If-Else Statements', content: 'Control flow with conditional statements.' },
      { id: 'loops', title: 'Loops', content: 'For loops and while loops for iteration.' },
      { id: 'lists', title: 'Lists & Tuples', content: 'Working with collections of data.' },
      { id: 'dicts', title: 'Dictionaries', content: 'Key-value pair data structures.' },
      { id: 'functions', title: 'Functions', content: 'Creating reusable code blocks.' },
      { id: 'classes', title: 'Classes & Objects', content: 'Object-oriented programming basics.' },
      { id: 'fileio', title: 'File I/O', content: 'Reading from and writing to files.' }
    ]
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: '📜',
    color: '#F7DF1E',
    shortDescription: 'Web development powerhouse',
    description: 'JavaScript is the programming language of the web. It enables interactive web pages and is an essential part of web applications. It supports event-driven, functional, and imperative programming styles.',
    topics: [
      { id: 'intro', title: 'Introduction to JavaScript', content: 'What is JavaScript and its role in web development.' },
      { id: 'variables', title: 'Variables & Data Types', content: 'let, const, var and primitive types.' },
      { id: 'operators', title: 'Operators', content: 'Arithmetic, string, and comparison operators.' },
      { id: 'conditionals', title: 'If-Else Statements', content: 'Conditional logic in JavaScript.' },
      { id: 'loops', title: 'Loops', content: 'for, while, and do-while loops.' },
      { id: 'arrays', title: 'Arrays', content: 'Working with arrays and array methods.' },
      { id: 'objects', title: 'Objects', content: 'Object literals and properties.' },
      { id: 'functions', title: 'Functions', content: 'Function declarations and expressions.' },
      { id: 'dom', title: 'DOM Manipulation', content: 'Interacting with HTML elements.' },
      { id: 'events', title: 'Event Handling', content: 'Responding to user interactions.' }
    ]
  },
  {
    id: 'html',
    name: 'HTML',
    icon: '🌐',
    color: '#E34F26',
    shortDescription: 'Structure of web pages',
    description: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page using elements and tags.',
    topics: [
      { id: 'intro', title: 'Introduction to HTML', content: 'What is HTML and how it works.' },
      { id: 'elements', title: 'HTML Elements', content: 'Understanding tags and elements.' },
      { id: 'text', title: 'Text Elements', content: 'Headings, paragraphs, and text formatting.' },
      { id: 'links', title: 'Links & Images', content: 'Creating hyperlinks and embedding images.' },
      { id: 'lists', title: 'Lists', content: 'Ordered and unordered lists.' },
      { id: 'tables', title: 'Tables', content: 'Creating data tables.' },
      { id: 'forms', title: 'Forms', content: 'Input fields and form elements.' },
      { id: 'semantic', title: 'Semantic HTML', content: 'Meaningful HTML structure.' },
      { id: 'media', title: 'Media Elements', content: 'Audio, video, and embed.' },
      { id: 'meta', title: 'Meta Tags', content: 'SEO and metadata.' }
    ]
  },
  {
    id: 'css',
    name: 'CSS',
    icon: '🎨',
    color: '#1572B6',
    shortDescription: 'Styling for the web',
    description: 'CSS (Cascading Style Sheets) is a stylesheet language used to describe the presentation of HTML documents. It controls layout, colors, fonts, and responsive design.',
    topics: [
      { id: 'intro', title: 'Introduction to CSS', content: 'What is CSS and how to use it.' },
      { id: 'selectors', title: 'Selectors', content: 'Targeting HTML elements.' },
      { id: 'colors', title: 'Colors & Backgrounds', content: 'Setting colors and background styles.' },
      { id: 'text', title: 'Typography', content: 'Font styles, sizes, and text effects.' },
      { id: 'boxmodel', title: 'Box Model', content: 'Margin, padding, and borders.' },
      { id: 'layout', title: 'Layout', content: 'Display, position, and float.' },
      { id: 'flexbox', title: 'Flexbox', content: 'Modern flexible layout system.' },
      { id: 'grid', title: 'CSS Grid', content: 'Two-dimensional layout system.' },
      { id: 'responsive', title: 'Responsive Design', content: 'Media queries and mobile-first.' },
      { id: 'animations', title: 'Animations', content: 'Transitions and keyframes.' }
    ]
  },
  {
    id: 'java',
    name: 'Java',
    icon: '☕',
    color: '#007396',
    shortDescription: 'Enterprise-grade language',
    description: 'Java is a class-based, object-oriented programming language designed for portability. It\'s widely used for enterprise applications, Android development, and large systems.',
    topics: [
      { id: 'intro', title: 'Introduction to Java', content: 'Java philosophy and "Write Once, Run Anywhere."' },
      { id: 'variables', title: 'Variables & Data Types', content: 'Primitive and reference types.' },
      { id: 'operators', title: 'Operators', content: 'All Java operators.' },
      { id: 'conditionals', title: 'If-Else & Switch', content: 'Conditional statements.' },
      { id: 'loops', title: 'Loops', content: 'for, while, do-while, for-each.' },
      { id: 'arrays', title: 'Arrays', content: 'Array manipulation.' },
      { id: 'methods', title: 'Methods', content: 'Creating and calling methods.' },
      { id: 'classes', title: 'Classes & Objects', content: 'OOP in Java.' },
      { id: 'inheritance', title: 'Inheritance', content: 'Class hierarchy and polymorphism.' },
      { id: 'exceptions', title: 'Exception Handling', content: 'try-catch-finally blocks.' }
    ]
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    icon: '🎯',
    color: '#7F52FF',
    shortDescription: 'Modern Android language',
    description: 'Kotlin is a modern, statically-typed programming language that runs on the JVM. It\'s the preferred language for Android development and is fully interoperable with Java.',
    topics: [
      { id: 'intro', title: 'Introduction to Kotlin', content: 'Why Kotlin over Java.' },
      { id: 'variables', title: 'Variables & Types', content: 'val, var and type inference.' },
      { id: 'functions', title: 'Functions', content: 'Function syntax and default params.' },
      { id: 'null', title: 'Null Safety', content: 'Handling nullable types.' },
      { id: 'classes', title: 'Classes', content: 'Data classes and sealed classes.' },
      { id: 'inheritance', title: 'Inheritance', content: 'Abstract classes and interfaces.' },
      { id: 'lambdas', title: 'Lambdas', content: 'Higher-order functions.' },
      { id: 'collections', title: 'Collections', content: 'Lists, sets, and maps.' },
      { id: 'coroutines', title: 'Coroutines', content: 'Asynchronous programming.' },
      { id: 'android', title: 'Android Basics', content: 'Getting started with Android.' }
    ]
  },
  {
    id: 'c',
    name: 'C',
    icon: '⚙️',
    color: '#A8B9CC',
    shortDescription: 'Foundation of modern languages',
    description: 'C is a general-purpose, procedural programming language. It provides low-level access to memory and is the foundation for many modern languages.',
    topics: [
      { id: 'intro', title: 'Introduction to C', content: 'History and importance of C.' },
      { id: 'variables', title: 'Variables & Data Types', content: 'int, char, float, double.' },
      { id: 'operators', title: 'Operators', content: 'All C operators.' },
      { id: 'conditionals', title: 'If-Else & Switch', content: 'Decision making.' },
      { id: 'loops', title: 'Loops', content: 'for, while, do-while.' },
      { id: 'arrays', title: 'Arrays', content: 'Array operations.' },
      { id: 'pointers', title: 'Pointers', content: 'Memory addresses and pointers.' },
      { id: 'functions', title: 'Functions', content: 'Function definition and calling.' },
      { id: 'strings', title: 'Strings', content: 'String manipulation.' },
      { id: 'structures', title: 'Structures', content: 'Custom data types.' }
    ]
  },
  {
    id: 'cpp',
    name: 'C++',
    icon: '🔧',
    color: '#00599C',
    shortDescription: 'Powerful systems language',
    description: 'C++ is a powerful, high-performance language used for system software, game development, and competitive programming. It extends C with object-oriented features.',
    topics: [
      { id: 'intro', title: 'Introduction to C++', content: 'C++ vs C and OOP concepts.' },
      { id: 'variables', title: 'Variables & Types', content: 'Built-in and user-defined types.' },
      { id: 'oOP', title: 'Classes & Objects', content: 'Encapsulation and abstraction.' },
      { id: 'inheritance', title: 'Inheritance', content: 'Class hierarchies.' },
      { id: 'polymorphism', title: 'Polymorphism', content: 'Virtual functions.' },
      { id: 'stl', title: 'STL', content: 'Standard Template Library.' },
      { id: 'templates', title: 'Templates', content: 'Generic programming.' },
      { id: 'pointers', title: 'Pointers & References', content: 'Memory management.' },
      { id: 'fileio', title: 'File I/O', content: 'Stream operations.' },
      { id: 'exceptions', title: 'Exception Handling', content: 'Error handling.' }
    ]
  },
  {
    id: 'csharp',
    name: 'C#',
    icon: '🎯',
    color: '#239120',
    shortDescription: 'Microsoft\'s premier language',
    description: 'C# is a modern, object-oriented language developed by Microsoft. It\'s used for Windows applications, game development with Unity, and enterprise software.',
    topics: [
      { id: 'intro', title: 'Introduction to C#', content: '.NET ecosystem overview.' },
      { id: 'variables', title: 'Variables & Types', content: 'Value and reference types.' },
      { id: 'oOP', title: 'Classes & Objects', content: 'OOP in C#.' },
      { id: 'inheritance', title: 'Inheritance', content: 'Base and derived classes.' },
      { id: 'interfaces', title: 'Interfaces', content: 'Interface implementation.' },
      { id: 'generics', title: 'Generics', content: 'Type-safe collections.' },
      { id: 'linq', title: 'LINQ', content: 'Language Integrated Query.' },
      { id: 'async', title: 'Async/Await', content: 'Asynchronous programming.' },
      { id: 'events', title: 'Events & Delegates', content: 'Event handling.' },
      { id: 'unity', title: 'Unity Basics', content: 'Game development intro.' }
    ]
  },
  {
    id: 'ruby',
    name: 'Ruby',
    icon: '💎',
    color: '#CC342D',
    shortDescription: 'Elegant & productive',
    description: 'Ruby is a dynamic, object-oriented language focused on simplicity and productivity. It\'s famous for Ruby on Rails web framework.',
    topics: [
      { id: 'intro', title: 'Introduction to Ruby', content: 'Ruby philosophy and elegance.' },
      { id: 'variables', title: 'Variables & Types', content: 'Dynamic typing in Ruby.' },
      { id: 'methods', title: 'Methods', content: 'Method definition and calling.' },
      { id: 'blocks', title: 'Blocks & Procs', content: 'Closures in Ruby.' },
      { id: 'classes', title: 'Classes', content: 'Object-oriented Ruby.' },
      { id: 'inheritance', title: 'Inheritance', content: 'Class hierarchies.' },
      { id: 'modules', title: 'Modules', content: 'Mixins and namespaces.' },
      { id: 'arrays', title: 'Arrays & Hashes', content: 'Collection types.' },
      { id: 'io', title: 'File I/O', content: 'Reading and writing files.' },
      { id: 'rails', title: 'Rails Intro', content: 'Web development with Rails.' }
    ]
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: '📘',
    color: '#3178C6',
    shortDescription: 'JavaScript with types',
    description: 'TypeScript is a superset of JavaScript that adds static typing. It catches errors at compile time and improves code quality and maintainability.',
    topics: [
      { id: 'intro', title: 'Introduction to TypeScript', content: 'Why TypeScript over JavaScript.' },
      { id: 'types', title: 'Basic Types', content: 'string, number, boolean, etc.' },
      { id: 'interfaces', title: 'Interfaces', content: 'Defining object shapes.' },
      { id: 'classes', title: 'Classes', content: 'Typed class syntax.' },
      { id: 'generics', title: 'Generics', content: 'Reusable type-safe components.' },
      { id: 'enums', title: 'Enums', content: 'Enumeration types.' },
      { id: 'functions', title: 'Function Types', content: 'Parameter and return types.' },
      { id: 'modules', title: 'Modules', content: 'Import/export with types.' },
      { id: 'advanced', title: 'Advanced Types', content: 'Unions, intersections, mapped types.' },
      { id: 'react', title: 'TypeScript + React', content: 'Typed React components.' }
    ]
  },
  {
    id: 'go',
    name: 'Go',
    icon: '🐹',
    color: '#00ADD8',
    shortDescription: 'Fast & concurrent',
    description: 'Go (Golang) is a statically-typed language designed at Google. It\'s known for simplicity, fast compilation, and excellent concurrency support.',
    topics: [
      { id: 'intro', title: 'Introduction to Go', content: 'Go design philosophy.' },
      { id: 'variables', title: 'Variables & Types', content: 'Static typing in Go.' },
      { id: 'functions', title: 'Functions', content: 'Multiple return values.' },
      { id: 'structs', title: 'Structs', content: 'Custom types.' },
      { id: 'interfaces', title: 'Interfaces', content: 'Implicit implementation.' },
      { id: 'goroutines', title: 'Goroutines', content: 'Lightweight threads.' },
      { id: 'channels', title: 'Channels', content: 'Communication between goroutines.' },
      { id: 'slices', title: 'Slices & Maps', content: 'Dynamic collections.' },
      { id: 'errors', title: 'Error Handling', content: 'Explicit error returns.' },
      { id: 'http', title: 'HTTP Servers', content: 'Building web servers.' }
    ]
  }
]
