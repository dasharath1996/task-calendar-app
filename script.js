import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* ========================= */
/* FIREBASE CONFIG */
/* ========================= */
const firebaseConfig = {
  apiKey: "AIzaSyBNVbF3mBExC_fBGmOeKAiUZ2olIO7k_Lc",
  authDomain: "my-task-calendar-f87ad.firebaseapp.com",
  projectId: "my-task-calendar-f87ad",
  storageBucket: "my-task-calendar-f87ad.firebasestorage.app",
  messagingSenderId: "1043925124339",
  appId: "1:1043925124339:web:81d71fba61eaf145ac2386"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const docRef = doc(db, "calendar", "tasks");

/* ========================= */
/* DOM ELEMENTS & VARIABLES */
/* ========================= */
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const modal = document.getElementById("taskModal");
const closeModalBtn = document.getElementById("closeModal");
const selectedDateEl = document.getElementById("selectedDate");
const taskInput = document.getElementById("taskInput");
const taskPriority = document.getElementById("taskPriority");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

let currentDate = new Date();
let selectedDate = null;
let editIndex = null;
let tasks = {};

/* ========================= */
/* REALTIME SYNC */
/* ========================= */
onSnapshot(docRef, (snapshot) => {
  if (snapshot.exists()) {
    tasks = snapshot.data().data || {};
  }
  renderCalendar();
});

async function saveTasks() {
  await setDoc(docRef, { data: tasks });
  renderCalendar();
}

/* ========================= */
/* RENDER CALENDAR */
/* ========================= */
function renderCalendar() {
  calendar.innerHTML = "";
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  monthYear.innerText = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "day empty";
    emptyDiv.style.background = "transparent";
    emptyDiv.style.border = "none";
    calendar.appendChild(emptyDiv);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${month + 1}-${day}`;
    const data = tasks[dateKey] || {};
    const dayTasks = data.tasks || [];
    
    const today = new Date();
    const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

    // Build Preview HTML safely
    let previewHTML = "";
    if (dayTasks.length > 0) {
      // Show up to 2 tasks in the preview
      const visibleTasks = dayTasks.slice(0, 2);
      visibleTasks.forEach(t => {
        previewHTML += `<div class="preview-item">${t.text}</div>`;
      });
      if (dayTasks.length > 2) {
        previewHTML += `<div class="more-tasks">+${dayTasks.length - 2} more</div>`;
      }
    }

    const dayEl = document.createElement("div");
    dayEl.className = `day ${data.status || ""} ${isToday ? "today" : ""}`;
    dayEl.onclick = () => openModal(dateKey);
    
    dayEl.innerHTML = `
      <div class="day-number">${day}</div>
      <div class="task-preview">${previewHTML}</div>
    `;
    calendar.appendChild(dayEl);
  }
  updateStats();
}

/* ========================= */
/* STATS CALCULATION */
/* ========================= */
function updateStats() {
  let total = 0, completed = 0;
  Object.values(tasks).forEach(day => {
    day.tasks?.forEach(task => {
      total++;
      if (task.done) completed++;
    });
  });

  document.getElementById("taskCount").innerText = total;
  document.getElementById("completedCount").innerText = completed;
  document.getElementById("pendingCount").innerText = total - completed;

  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  document.getElementById("progressFill").style.width = `${progress}%`;
  document.getElementById("progressText").innerText = `${progress}%`;
}

/* ========================= */
/* MODAL LOGIC */
/* ========================= */
window.openModal = function(date) {
  selectedDate = date;
  selectedDateEl.innerText = `Tasks for ${new Date(date).toLocaleDateString()}`;
  taskInput.value = "";
  taskPriority.value = "medium";
  editIndex = null;

  if (!tasks[selectedDate]) tasks[selectedDate] = { tasks: [], status: null };
  renderTasks();
  modal.style.display = "block";
};

closeModalBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

addTaskBtn.onclick = async () => {
  const text = taskInput.value.trim();
  if (!text) return;

  const priority = taskPriority.value;

  if (editIndex !== null) {
    tasks[selectedDate].tasks[editIndex] = { ...tasks[selectedDate].tasks[editIndex], text, priority };
    editIndex = null;
  } else {
    tasks[selectedDate].tasks.push({ text, done: false, priority });
  }

  taskInput.value = "";
  await saveTasks();
  renderTasks();
};

taskInput.addEventListener("keypress", (e) => { if (e.key === "Enter") addTaskBtn.click(); });

/* ========================= */
/* RENDER TASK LIST IN MODAL */
/* ========================= */
function renderTasks() {
  taskList.innerHTML = "";
  const data = tasks[selectedDate];
  if (!data || data.tasks.length === 0) {
    taskList.innerHTML = `<div style="text-align:center; padding: 20px; color: #888;">🚀 No tasks yet. Add one above!</div>`;
    return;
  }

  data.tasks.forEach((task, index) => {
    const li = document.createElement("li");
    if (task.done) li.classList.add("done");
    li.dataset.priority = task.priority || "medium";

    li.innerHTML = `
      <span>${task.text}</span>
      <div class="task-actions">
        <button onclick="toggleDone(${index})" title="Toggle Status">✅</button>
        <button onclick="editTask(${index})" title="Edit">✏️</button>
        <button onclick="deleteTask(${index})" title="Delete">❌</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

/* ========================= */
/* GLOBAL ACTIONS */
/* ========================= */
window.toggleDone = async function(index) {
  tasks[selectedDate].tasks[index].done = !tasks[selectedDate].tasks[index].done;
  await saveTasks();
  renderTasks();
};

window.editTask = function(index) {
  taskInput.value = tasks[selectedDate].tasks[index].text;
  taskPriority.value = tasks[selectedDate].tasks[index].priority || "medium";
  editIndex = index;
};

window.deleteTask = async function(index) {
  tasks[selectedDate].tasks.splice(index, 1);
  await saveTasks();
  renderTasks();
};

window.setColor = async function(color) {
  tasks[selectedDate].status = color;
  await saveTasks();
};

/* ========================= */
/* NAVIGATION & CLOCK */
/* ========================= */
document.getElementById("prevMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

function updateClock() {
  const now = new Date();
  document.getElementById("liveClock").innerText = now.toLocaleString("en-US", {
    weekday: "long", hour: "numeric", minute: "numeric", second: "numeric"
  });
}
setInterval(updateClock, 1000);
updateClock();
