import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Code, Play, ChevronRight, BookOpen, ArrowLeft, CheckCircle } from 'lucide-react'
import { languages } from '../Languages/languages'

export default function TutorialPage() {
  const { language } = useParams()
  const navigate = useNavigate()
  const [activeTopic, setActiveTopic] = useState(null)
  const [completedTopics, setCompletedTopics] = useState(() => {
    const saved = localStorage.getItem(`codelearn_progress_${language}`)
    return saved ? JSON.parse(saved) : []
  })

  const lang = languages.find(l => l.id === language)

  if (!lang) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Language not found</h2>
          <Link to="/home" className="text-primary font-bold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const handleTryIt = (topic) => {
    navigate(`/workspace/${language}`, { state: { topic } })
  }

  const markCompleted = (topicId) => {
    const newCompleted = [...completedTopics, topicId]
    setCompletedTopics(newCompleted)
    localStorage.setItem(`codelearn_progress_${language}`, JSON.stringify(newCompleted))
  }

  const progress = Math.round((completedTopics.length / lang.topics.length) * 100)

  return (
    <div className="min-h-[calc(100vh-120px)] bg-slate-50">
      {/* Language Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link to="/home" className="inline-flex items-center gap-1 text-blue-200 hover:text-white mb-4 transition">
            <ArrowLeft size={16} />
            Back to Languages
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{lang.icon}</span>
            <div>
              <h1 className="text-3xl font-black">{lang.name}</h1>
              <p className="text-blue-200">{lang.description}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 bg-white/20 rounded-full h-2 max-w-xs">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium">{progress}% Complete</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Topics Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen size={18} />
                Topics ({lang.topics.length})
              </h2>
              <div className="space-y-2">
                {lang.topics.map((topic, index) => (
                  <button
                    key={topic.id}
                    onClick={() => setActiveTopic(topic)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${
                      activeTopic?.id === topic.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      completedTopics.includes(topic.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {completedTopics.includes(topic.id) ? (
                        <CheckCircle size={14} />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="text-sm font-medium flex-1">{topic.title}</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topic Content */}
          <div className="lg:col-span-2">
            {activeTopic ? (
              <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">
                      {activeTopic.title}
                    </h2>
                    <p className="text-slate-500">{activeTopic.content}</p>
                  </div>
                </div>

                {/* Example Code Block */}
                <div className="bg-slate-900 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Example
                    </span>
                    <button
                      onClick={() => handleTryIt(activeTopic)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-dark transition"
                    >
                      <Play size={12} />
                      Try It Yourself
                    </button>
                  </div>
                  <pre className="text-green-400 text-sm font-mono overflow-x-auto">
                    <code>{getExampleCode(language, activeTopic.id)}</code>
                  </pre>
                </div>

                {/* Explanation */}
                <div className="prose prose-slate max-w-none">
                  <div 
                    className="text-slate-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: getTopicExplanation(language, activeTopic.id) 
                    }}
                  />
                </div>

                {/* Mark Complete Button */}
                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const currentIndex = lang.topics.findIndex(t => t.id === activeTopic.id)
                      if (currentIndex < lang.topics.length - 1) {
                        setActiveTopic(lang.topics[currentIndex + 1])
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-primary transition"
                  >
                    Next Topic
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => markCompleted(activeTopic.id)}
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition ${
                      completedTopics.includes(activeTopic.id)
                        ? 'bg-green-100 text-green-600'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {completedTopics.includes(activeTopic.id) ? '✓ Completed' : 'Mark as Complete'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="text-primary" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Select a Topic
                </h3>
                <p className="text-slate-500">
                  Choose a topic from the sidebar to start learning {lang.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getExampleCode(language, topicId) {
  const examples = {
    python: {
      intro: `# Your first Python program
print("Hello, World!")`,
      variables: `# Variables in Python
name = "Alice"
age = 25
height = 5.6
is_student = True

print(f"Name: {name}")
print(f"Age: {age}")`,
      operators: `# Arithmetic operators
a = 10
b = 3

print(f"Add: {a + b}")      # 13
print(f"Subtract: {a - b}") # 7
print(f"Multiply: {a * b}") # 30
print(f"Divide: {a / b}")   # 3.33
print(f"Modulus: {a % b}")  # 1`,
      conditionals: `# If-Else statements
age = 18

if age >= 18:
    print("You can vote!")
else:
    print("Too young to vote")`,
      loops: `# For loop
for i in range(5):
    print(i)

# While loop
count = 0
while count < 3:
    print(f"Count: {count}")
    count += 1`,
      lists: `# Lists in Python
fruits = ["apple", "banana", "cherry"]
fruits.append("date")
print(fruits)
print(fruits[0])  # apple`,
      dicts: `# Dictionaries
person = {
    "name": "John",
    "age": 30,
    "city": "New York"
}
print(person["name"])`,
      functions: `# Functions
def greet(name):
    return f"Hello, {name}!"

message = greet("World")
print(message)`,
      classes: `# Classes and Objects
class Dog:
    def __init__(self, name):
        self.name = name
    
    def bark(self):
        return f"{self.name} says Woof!"

my_dog = Dog("Buddy")
print(my_dog.bark())`,
      fileio: `# File I/O
# Writing to a file
with open("example.txt", "w") as f:
    f.write("Hello, File!")

# Reading from a file
with open("example.txt", "r") as f:
    content = f.read()
    print(content)`
    },
    javascript: {
      intro: `// Your first JavaScript program
console.log("Hello, World!");`,
      variables: `// Variables in JavaScript
let name = "Alice";
const age = 25;
var height = 5.6;

console.log(name, age, height);`,
      operators: `// Arithmetic operators
let a = 10;
let b = 3;

console.log("Add:", a + b);      // 13
console.log("Subtract:", a - b); // 7
console.log("Multiply:", a * b); // 30
console.log("Divide:", a / b);   // 3.33`,
      conditionals: `// If-Else statements
let age = 18;

if (age >= 18) {
    console.log("You can vote!");
} else {
    console.log("Too young to vote");
}`,
      loops: `// For loop
for (let i = 0; i < 5; i++) {
    console.log(i);
}

// While loop
let count = 0;
while (count < 3) {
    console.log("Count:", count);
    count++;
}`,
      arrays: `// Arrays
let fruits = ["apple", "banana", "cherry"];
fruits.push("date");
console.log(fruits);
console.log(fruits[0]);  // apple`,
      objects: `// Objects
let person = {
    name: "John",
    age: 30,
    city: "New York"
};
console.log(person.name);`,
      functions: `// Functions
function greet(name) {
    return \`Hello, \${name}!\`;
}

let message = greet("World");
console.log(message);`,
      dom: `// DOM Manipulation
let element = document.getElementById("demo");
element.innerHTML = "Hello, DOM!";
element.style.color = "blue";`,
      events: `// Event Handling
document.getElementById("btn").addEventListener("click", function() {
    console.log("Button clicked!");
});`
    },
    html: {
      intro: `<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Welcome to HTML</p>
</body>
</html>`,
      elements: `<!-- HTML Elements -->
<h1>Main Heading</h1>
<h2>Sub Heading</h2>
<p>This is a paragraph.</p>
<div>This is a division</div>
<span>This is a span</span>`,
      text: `<!-- Text Elements -->
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<p>Paragraph text</p>
<strong>Bold text</strong>
<em>Italic text</em>
<br>Line break`,
      links: `<!-- Links and Images -->
<a href="https://example.com">Click me</a>
<img src="image.jpg" alt="Description">`,
      lists: `<!-- Lists -->
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
</ul>
<ol>
    <li>First</li>
    <li>Second</li>
</ol>`,
      tables: `<!-- Tables -->
<table>
    <tr>
        <th>Name</th>
        <th>Age</th>
    </tr>
    <tr>
        <td>John</td>
        <td>30</td>
    </tr>
</table>`,
      forms: `<!-- Forms -->
<form>
    <input type="text" placeholder="Name">
    <input type="email" placeholder="Email">
    <button type="submit">Submit</button>
</form>`,
      semantic: `<!-- Semantic HTML -->
<header>Header</header>
<nav>Navigation</nav>
<main>
    <article>Content</article>
    <aside>Sidebar</aside>
</main>
<footer>Footer</footer>`,
      media: `<!-- Media Elements -->
<video src="video.mp4" controls></video>
<audio src="audio.mp3" controls></audio>
<iframe src="https://example.com"></iframe>`,
      meta: `<!-- Meta Tags -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Page description">`
    },
    css: {
      intro: `/* CSS Styling */
body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
}

h1 {
    color: #1e5aa8;
}`,
      selectors: `/* CSS Selectors */
p { color: blue; }           /* Element */
.class { color: red; }       /* Class */
#id { color: green; }        /* ID */
div p { color: yellow; }     /* Descendant */`,
      colors: `/* Colors & Backgrounds */
body {
    background-color: #f5f5f5;
    color: #333;
}

.highlight {
    background: linear-gradient(to right, #ff891c, #ff6b6b);
}`,
      text: `/* Typography */
h1 {
    font-size: 2.5rem;
    font-weight: bold;
    line-height: 1.2;
}

p {
    font-size: 1rem;
    letter-spacing: 0.5px;
}`,
      boxmodel: `/* Box Model */
.box {
    width: 200px;
    padding: 20px;
    margin: 10px;
    border: 2px solid #333;
    box-sizing: border-box;
}`,
      layout: `/* Layout */
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}`,
      flexbox: `/* Flexbox */
.flex-container {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.flex-item {
    flex: 1;
    min-width: 200px;
}`,
      grid: `/* CSS Grid */
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}`,
      responsive: `/* Responsive Design */
@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }
    
    h1 {
        font-size: 1.5rem;
    }
}`,
      animations: `/* Animations */
.button {
    transition: all 0.3s ease;
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}`
    }
  }

  return examples[language]?.[topicId] || `// Example code for ${language} - ${topicId}\nconsole.log("Coming soon!");`
}

function getTopicExplanation(language, topicId) {
  const explanations = {
    python: {
      intro: `<h3>Why Python?</h3>
<p>Python is one of the most popular programming languages in the world. It's known for its simple, readable syntax that makes it perfect for beginners.</p>
<ul>
<li><strong>Easy to learn</strong> - Clean, English-like syntax</li>
<li><strong>Versatile</strong> - Web development, data science, AI, automation</li>
<li><strong>Large community</strong> - Tons of libraries and resources</li>
<li><strong>High demand</strong> - Top salary potential in tech</li>
</ul>`,
      variables: `<h3>Understanding Variables</h3>
<p>Variables are containers for storing data values. In Python, you don't need to declare the type - Python figures it out automatically.</p>
<h4>Data Types:</h4>
<ul>
<li><strong>str</strong> - Strings (text)</li>
<li><strong>int</strong> - Integers (whole numbers)</li>
<li><strong>float</strong> - Floating point (decimals)</li>
<li><strong>bool</strong> - Boolean (True/False)</li>
</ul>`,
      operators: `<h3>Operators in Python</h3>
<p>Operators are used to perform operations on variables and values.</p>
<h4>Arithmetic Operators:</h4>
<ul>
<li><strong>+</strong> Addition</li>
<li><strong>-</strong> Subtraction</li>
<li><strong>*</strong> Multiplication</li>
<li><strong>/</strong> Division</li>
<li><strong>%</strong> Modulus (remainder)</li>
<li><strong>**</strong> Exponentiation</li>
</ul>`,
      conditionals: `<h3>Conditional Statements</h3>
<p>Conditional statements allow your program to make decisions based on conditions.</p>
<h4>Key Points:</h4>
<ul>
<li><strong>if</strong> - Executes code if condition is True</li>
<li><strong>elif</strong> - Checks another condition if first is False</li>
<li><strong>else</strong> - Executes if no conditions are True</li>
</ul>`,
      loops: `<h3>Loops in Python</h3>
<p>Loops allow you to repeat code multiple times.</p>
<h4>Two types:</h4>
<ul>
<li><strong>for loop</strong> - Iterates over a sequence</li>
<li><strong>while loop</strong> - Repeats while condition is True</li>
</ul>`,
      lists: `<h3>Lists in Python</h3>
<p>Lists are ordered, mutable collections that can hold multiple items.</p>
<h4>Key Features:</h4>
<ul>
<li>Ordered - items have defined order</li>
<li>Mutable - can change after creation</li>
<li>Allows duplicates</li>
</ul>`,
      dicts: `<h3>Dictionaries</h3>
<p>Dictionaries store data in key-value pairs.</p>
<h4>Key Features:</h4>
<ul>
<li>Fast lookups by key</li>
<li>Mutable - add/remove items</li>
<li>No duplicate keys allowed</li>
</ul>`,
      functions: `<h3>Functions</h3>
<p>Functions are reusable blocks of code that perform specific tasks.</p>
<h4>Benefits:</h4>
<ul>
<li>Code reusability</li>
<li>Better organization</li>
<li>Easier debugging</li>
</ul>`,
      classes: `<h3>Object-Oriented Programming</h3>
<p>Classes are blueprints for creating objects with properties and methods.</p>
<h4>Key Concepts:</h4>
<ul>
<li><strong>Class</strong> - Blueprint/template</li>
<li><strong>Object</strong> - Instance of a class</li>
<li><strong>Attributes</strong> - Data/properties</li>
<li><strong>Methods</strong> - Functions in a class</li>
</ul>`,
      fileio: `<h3>File Operations</h3>
<p>Python makes it easy to read from and write to files.</p>
<h4>Modes:</h4>
<ul>
<li><strong>'r'</strong> - Read (default)</li>
<li><strong>'w'</strong> - Write (overwrites)</li>
<li><strong>'a'</strong> - Append</li>
</ul>`
    }
  }

  return explanations[language]?.[topicId] || `<p>Learn about ${topicId} in ${language}. This topic covers the fundamentals and best practices.</p>`
}
