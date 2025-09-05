// --- Config ---
const STORAGE_KEY = "expenses_v1";
const CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"];

// --- Helpers ---
const inr = n => "₹" + (n || 0).toFixed(2);
const todayStr = () => new Date().toISOString().slice(0, 10);

function loadExpenses() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveExpenses(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// --- Init Dropdown ---
const categorySel = document.getElementById("category");
CATEGORIES.forEach(c => {
  let opt = document.createElement("option");
  opt.value = c;
  opt.textContent = c;
  categorySel.appendChild(opt);
});

// --- Form handling ---
const form = document.getElementById("expense-form");   // ✅ corrected
const tbody = document.getElementById("expense-list");  // ✅ corrected
let editingId = null;

form.addEventListener("submit", e => {
  e.preventDefault();

  const amount = parseFloat(document.getElementById("amount").value);
  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount!");
    return;
  }

  const expense = {
    id: editingId || Date.now(),
    amount: amount,
    category: categorySel.value,
    date: document.getElementById("date").value || todayStr(),
    note: document.getElementById("note").value
  };

  let list = loadExpenses();
  if (editingId) {
    list = list.map(e => e.id === editingId ? expense : e);
    editingId = null;
  } else {
    list.push(expense);
  }

  saveExpenses(list);
  form.reset();
  document.getElementById("date").value = todayStr(); // reset date to today
  render();
});

// --- Render Function ---
function render() {
  const list = loadExpenses().sort((a, b) => b.date.localeCompare(a.date));
  tbody.innerHTML = "";

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">No expenses yet.</td></tr>`;
  } else {
    let total = 0;
    list.forEach(exp => {
      total += exp.amount;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${inr(exp.amount)}</td>
        <td>${exp.category}</td>
        <td>${exp.date}</td>
        <td>${exp.note || ""}</td>
        <td>
          <button onclick="editExpense(${exp.id})">✏️</button>
          <button onclick="deleteExpense(${exp.id})">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // --- Update Summary ---
    document.getElementById("total").textContent = total.toFixed(2);
    document.getElementById("count").textContent = list.length;
    document.getElementById("average").textContent = (total / list.length || 0).toFixed(2);
  }
}

// --- Edit Expense ---
function editExpense(id) {
  const list = loadExpenses();
  const exp = list.find(e => e.id === id);
  if (!exp) return;

  document.getElementById("amount").value = exp.amount;
  categorySel.value = exp.category;
  document.getElementById("date").value = exp.date;
  document.getElementById("note").value = exp.note;
  editingId = id;
}

// --- Delete Expense ---
function deleteExpense(id) {
  let list = loadExpenses().filter(e => e.id !== id);
  saveExpenses(list);
  render();
}

// --- Run on load ---
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("date").value = todayStr();
  render();
});
