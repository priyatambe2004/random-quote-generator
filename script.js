/* ---------- Quotes: an array of objects ---------- */
const quotes = [
  { text: "Well done is better than well said.", author: "Benjamin Franklin", category: "Motivation" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs", category: "Motivation" },
  { text: "The only thing we have to fear is fear itself.", author: "Franklin D. Roosevelt", category: "Motivation" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt", category: "Motivation" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb", category: "Motivation" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu", category: "Wisdom" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "Wisdom" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant", category: "Wisdom" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch", category: "Wisdom" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay", category: "Coding" },
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson", category: "Coding" },
  { text: "Premature optimization is the root of all evil.", author: "Donald Knuth", category: "Coding" },
  { text: "Simplicity is prerequisite for reliability.", author: "Edsger Dijkstra", category: "Coding" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", category: "Coding" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck", category: "Coding" }
];

const categories = ["All", "Motivation", "Wisdom", "Coding"];

const $ = (id) => document.getElementById(id);
const quoteEl = $("quote"), authorEl = $("author"), categoryEl = $("category");
const cardEl = $("card"), toastEl = $("toast");
const recentList = $("recent-list"), recentEmpty = $("recent-empty"), countEl = $("count");

let selectedCategory = "All";
let currentQuote = null;
let recent = [];
let shownCount = 0;
let toastTimer;

/* ---------- Picking a random quote ---------- */

// Math.random() gives a decimal from 0 up to (but not including) 1.
// Multiply by the list length and use Math.floor() to get a valid index.
function pickRandomQuote(list, current) {
  if (list.length === 1) return list[0];
  let next;
  do {
    next = list[Math.floor(Math.random() * list.length)];
  } while (next === current); // keep picking until it is different from the last quote
  return next;
}

function getFilteredQuotes() {
  return selectedCategory === "All" ? quotes : quotes.filter((q) => q.category === selectedCategory);
}

/* ---------- Showing a quote ---------- */

function showQuote(quote) {
  quoteEl.textContent = quote.text;
  authorEl.textContent = quote.author;
  categoryEl.textContent = quote.category;
  categoryEl.className = "tag " + quote.category;

  // Restart the fade-in animation
  cardEl.classList.remove("fade");
  void cardEl.offsetWidth;
  cardEl.classList.add("fade");
}

function newQuote() {
  currentQuote = pickRandomQuote(getFilteredQuotes(), currentQuote);
  showQuote(currentQuote);
  shownCount++;
  recent.unshift(currentQuote);
  recent = recent.slice(0, 5);
  renderRecent();
}

function renderRecent() {
  recentList.innerHTML = "";
  // Skip the first item because it is already shown in the main card
  recent.slice(1).forEach((q) => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    const author = document.createElement("span");
    text.className = "rq"; text.textContent = q.text;
    author.className = "ra"; author.textContent = "— " + q.author;
    li.append(text, author);
    recentList.appendChild(li);
  });
  recentEmpty.hidden = recent.length > 1;
  countEl.textContent = shownCount + (shownCount === 1 ? " quote" : " quotes");
}

/* ---------- Category chips ---------- */

function buildChips() {
  const wrap = $("chips");
  categories.forEach((name) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (name === selectedCategory ? " active" : "");
    btn.textContent = name;
    btn.addEventListener("click", () => {
      selectedCategory = name;
      wrap.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === btn));
      newQuote();
    });
    wrap.appendChild(btn);
  });
}

/* ---------- Copy and share ---------- */

function toast(message) {
  toastEl.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.textContent = ""), 2500);
}

function quoteAsText() {
  return `"${currentQuote.text}" — ${currentQuote.author}`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers or when clipboard access is blocked
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

$("copy").addEventListener("click", async () => {
  toast((await copyText(quoteAsText())) ? "Quote copied!" : "Could not copy. Please select the text manually.");
});

$("share").addEventListener("click", async () => {
  if (navigator.share) {
    try {
      await navigator.share({ title: "Random Quote", text: quoteAsText() });
    } catch { /* the person closed the share sheet */ }
  } else {
    // No share menu on this device, so copy the quote instead
    toast((await copyText(quoteAsText())) ? "Sharing is not supported here, so the quote was copied." : "Could not share.");
  }
});

$("new-quote").addEventListener("click", newQuote);

/* ---------- Start ---------- */
buildChips();
newQuote();
