import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
}
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* ========================= */
/* FIREBASE CONFIG */
/* ========================= */

const firebaseConfig = {

  apiKey: "YOUR_API_KEY",

  authDomain: "YOUR_AUTH_DOMAIN",

  projectId: "YOUR_PROJECT_ID",

  storageBucket: "YOUR_STORAGE_BUCKET",

  messagingSenderId: "YOUR_SENDER_ID",

  appId: "YOUR_APP_ID"
};

/* ========================= */
/* INIT FIREBASE */
/* ========================= */

const app =
  initializeApp(firebaseConfig);

const db =
  getFirestore(app);

/* ========================= */
/* DOM ELEMENTS */
/* ========================= */

const calendar =
  document.getElementById("calendar");

const monthYear =
  document.getElementById("monthYear");

const modal =
  document.getElementById("taskModal");

const closeModal =
  document.querySelector(".close");

const selectedDateEl =
  document.getElementById("selectedDate");

const taskInput =
  document.getElementById("taskInput");

const addTaskBtn =
  document.getElementById("addTaskBtn");

const taskList =
  document.getElementById("taskList");

const taskCount =
  document.getElementById("taskCount");

const completedCount =
  document.getElementById("completedCount");

const pendingCount =
  document.getElementById("pendingCount");

const progressFill =
  document.getElementById("progressFill");

const progressText =
  document.getElementById("progressText");

/* ========================= */
/* VARIABLES */
/* ========================= */

let currentDate =
  new Date();

let selectedDate = null;

let editIndex = null;

let tasks = {};

/* ========================= */
/* FIRESTORE DOC */
/* ========================= */

const docRef =
  doc(db, "calendar", "tasks");

/* ========================= */
/* REALTIME SYNC */
/* ========================= */

onSnapshot(docRef, (snapshot) => {

  if (snapshot.exists()) {

    tasks =
      snapshot.data().data || {};
  }

  renderCalendar();
});

/* ========================= */
/* SAVE TASKS */
/* ========================= */

async function saveTasks() {

  await setDoc(docRef, {
    data: tasks
  });

  renderCalendar();
}

/* ========================= */
/* RENDER CALENDAR */
/* ========================= */

function renderCalendar() {

  calendar.innerHTML = "";

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  const firstDay =
    new Date(year, month, 1).getDay();

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();

  monthYear.innerText =
    currentDate.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric"
      }
    );

  /* EMPTY BOXES */

  for (let i = 0; i < firstDay; i++) {

    calendar.innerHTML +=
      `<div></div>`;
  }

  /* DAYS */

  for (let day = 1; day <= daysInMonth; day++) {

    const dateKey =
      `${year}-${month + 1}-${day}`;

    const data =
      tasks[dateKey];

    let preview = "";

    let colorClass = "";

    if (data) {

      if (data.tasks?.length > 0) {

        preview =
          data.tasks[0].text;
      }

      if (data.status) {

        colorClass =
          data.status;
      }
    }

    const today =
      new Date();

    const isToday =
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year;

    calendar.innerHTML += `

      <div
        class="day ${colorClass} ${isToday ? 'today' : ''}"
        onclick="openModal('${dateKey}')"
      >

        <div class="day-number">
          ${day}
        </div>

        ${
          data?.tasks?.length
          ?
          `<div class="task-badge">
            ${data.tasks.length}
          </div>`
          :
          ""
        }

        <div class="task-preview">

          ${preview || ""}

        </div>

      </div>
    `;
  }

  updateStats();
}

/* ========================= */
/* UPDATE STATS */
/* ========================= */

function updateStats() {

  let total = 0;

  let completed = 0;

  Object.values(tasks).forEach(day => {

    day.tasks?.forEach(task => {

      total++;

      if (task.done) {

        completed++;
      }
    });
  });

  const pending =
    total - completed;

  taskCount.innerText =
    total;

  completedCount.innerText =
    completed;

  pendingCount.innerText =
    pending;

  const progress =
    total === 0
    ? 0
    : Math.round(
        (completed / total) * 100
      );

  progressFill.style.width =
    `${progress}%`;

  progressText.innerText =
    `${progress}%`;
}

/* ========================= */
/* OPEN MODAL */
/* ========================= */

window.openModal = function(date) {

  selectedDate = date;

  selectedDateEl.innerText =
    `Tasks for ${date}`;

  taskInput.value = "";

  editIndex = null;

  if (!tasks[selectedDate]) {

    tasks[selectedDate] = {

      tasks: [],

      status: null
    };
  }

  renderTasks();

  modal.style.display =
    "block";
};

/* ========================= */
/* CLOSE MODAL */
/* ========================= */

closeModal.onclick = () => {

  modal.style.display =
    "none";
};

window.onclick = (e) => {

  if (e.target === modal) {

    modal.style.display =
      "none";
  }
};

/* ========================= */
/* ADD TASK */
/* ========================= */

addTaskBtn.onclick = async () => {

  if (!taskInput.value.trim()) {

    return;
  }

  if (editIndex !== null) {

    tasks[selectedDate]
      .tasks[editIndex]
      .text =
        taskInput.value;

    editIndex = null;

  } else {

    tasks[selectedDate]
      .tasks.push({

        text: taskInput.value,

        done: false
      });
  }

  await saveTasks();

  taskInput.value = "";

  renderTasks();
};

/* ========================= */
/* ENTER KEY SUPPORT */
/* ========================= */

taskInput.addEventListener(
  "keypress",
  (e) => {

    if (e.key === "Enter") {

      addTaskBtn.click();
    }
  }
);

/* ========================= */
/* RENDER TASKS */
/* ========================= */

function renderTasks() {

  taskList.innerHTML = "";

  const data =
    tasks[selectedDate];

  if (!data) return;

  /* EMPTY STATE */

  if (data.tasks.length === 0) {

    taskList.innerHTML = `

      <div class="empty-state">

        <h3>
          🚀 No tasks yet
        </h3>

        <p>
          Add your first task
        </p>

      </div>
    `;

    return;
  }

  data.tasks.forEach((task, index) => {

    const li =
      document.createElement("li");

    if (task.done) {

      li.classList.add("done");
    }

    li.innerHTML = `

      <span>
        ${task.text}
      </span>

      <div class="task-actions">

        <button
          onclick="toggleDone(${index})"
        >
          ✅
        </button>

        <button
          onclick="editTask(${index})"
        >
          ✏️
        </button>

        <button
          onclick="deleteTask(${index})"
        >
          ❌
        </button>

      </div>
    `;

    taskList.appendChild(li);
  });
}

/* ========================= */
/* TOGGLE DONE */
/* ========================= */

window.toggleDone =
async function(index) {

  tasks[selectedDate]
    .tasks[index]
    .done =
      !tasks[selectedDate]
        .tasks[index]
        .done;

  await saveTasks();

  renderTasks();
};

/* ========================= */
/* EDIT TASK */
/* ========================= */

window.editTask = function(index) {

  taskInput.value =
    tasks[selectedDate]
      .tasks[index]
      .text;

  editIndex = index;
};

/* ========================= */
/* DELETE TASK */
/* ========================= */

window.deleteTask =
async function(index) {

  tasks[selectedDate]
    .tasks.splice(index, 1);

  await saveTasks();

  renderTasks();
};

/* ========================= */
/* STATUS COLORS */
/* ========================= */

window.setColor =
async function(color) {

  tasks[selectedDate]
    .status = color;

  await saveTasks();
};

/* ========================= */
/* MONTH NAVIGATION */
/* ========================= */

document
.getElementById("prevMonth")
.onclick = () => {

  currentDate.setMonth(
    currentDate.getMonth() - 1
  );

  renderCalendar();
};

document
.getElementById("nextMonth")
.onclick = () => {

  currentDate.setMonth(
    currentDate.getMonth() + 1
  );

  renderCalendar();
};

/* ========================= */
/* LIVE CLOCK */
/* ========================= */

function updateClock() {

  const now = new Date();

  document.getElementById(
    "liveClock"
  ).innerText =
    now.toLocaleString(
      "en-US",
      {
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
      }
    );
}

setInterval(updateClock, 1000);

updateClock();
