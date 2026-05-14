const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

const modal = document.getElementById("taskModal");
const closeModal = document.querySelector(".close");

const selectedDateEl = document.getElementById("selectedDate");
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

let currentDate = new Date();
let selectedDate = null;
let editIndex = null;

let tasks = JSON.parse(localStorage.getItem("tasks")) || {};

// -------------------- CALENDAR --------------------
function renderCalendar() {
  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthYear.innerText = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  for (let i = 0; i < firstDay; i++) {
    calendar.innerHTML += `<div></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${month + 1}-${day}`;

    calendar.innerHTML += `
      <div class="day" onclick="openModal('${dateKey}')">
        <span>${day}</span>
        <small>${tasks[dateKey] ? tasks[dateKey].length + " task(s)" : ""}</small>
      </div>
    `;
  }
}

// -------------------- OPEN MODAL --------------------
window.openModal = function (date) {
  selectedDate = date;
  selectedDateEl.innerText = date;
  taskInput.value = "";
  editIndex = null;

  renderTasks();
  modal.style.display = "block";
};

// -------------------- CLOSE MODAL --------------------
closeModal.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// -------------------- ADD / UPDATE TASK --------------------
addTaskBtn.onclick = () => {
  if (!taskInput.value.trim()) return;

  if (!tasks[selectedDate]) {
    tasks[selectedDate] = [];
  }

  if (editIndex !== null) {
    // EDIT MODE
    tasks[selectedDate][editIndex] = taskInput.value;
    editIndex = null;
  } else {
    // ADD MODE
    tasks[selectedDate].push(taskInput.value);
  }

  saveTasks();
  taskInput.value = "";
  renderTasks();
  renderCalendar();
};

// -------------------- RENDER TASKS --------------------
function renderTasks() {
  taskList.innerHTML = "";

  if (!tasks[selectedDate]) return;

  tasks[selectedDate].forEach((task, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${task}</span>
      <button onclick="editTask(${index})">Edit</button>
      <button onclick="deleteTask(${index})">Delete</button>
    `;

    taskList.appendChild(li);
  });
}

// -------------------- EDIT TASK --------------------
window.editTask = function (index) {
  taskInput.value = tasks[selectedDate][index];
  editIndex = index;
};

// -------------------- DELETE TASK --------------------
window.deleteTask = function (index) {
  tasks[selectedDate].splice(index, 1);

  if (tasks[selectedDate].length === 0) {
    delete tasks[selectedDate];
  }

  saveTasks();
  renderTasks();
  renderCalendar();
};

// -------------------- SAVE --------------------
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// -------------------- MONTH NAVIGATION --------------------
document.getElementById("prevMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

renderCalendar();
