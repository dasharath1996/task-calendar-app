// script.js

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
}
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyBNVbF3mBExC_fBGmOeKAiUZ2olIO7k_Lc",
  authDomain: "my-task-calendar-f87ad.firebaseapp.com",
  projectId: "my-task-calendar-f87ad",
  storageBucket: "my-task-calendar-f87ad.firebasestorage.app",
  messagingSenderId: "1043925124339",
  appId: "1:1043925124339:web:81d71fba61eaf145ac2386"
};

// ================= INITIALIZE FIREBASE =================
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// ================= DOM ELEMENTS =================
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

// ================= VARIABLES =================
let currentDate = new Date();

let selectedDate = null;

let editIndex = null;

let tasks = {};

// ================= FIRESTORE DOC =================
const docRef =
  doc(db, "calendar", "tasks");

// ================= REALTIME LISTENER =================
onSnapshot(docRef, (snapshot) => {

  if (snapshot.exists()) {

    tasks =
      snapshot.data().data || {};

  } else {

    tasks = {};

  }

  renderCalendar();

});

// ================= SAVE TASKS =================
async function saveTasks() {

  try {

    await setDoc(docRef, {
      data: tasks
    });

  } catch (error) {

    console.error(
      "Error saving tasks:",
      error
    );

  }

}

// ================= RENDER CALENDAR =================
function renderCalendar() {

  calendar.innerHTML = "";

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  // MONTH TITLE
  monthYear.innerText =
    currentDate.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric"
      }
    );

  // FIRST DAY
  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  // TOTAL DAYS
  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  // EMPTY SPACES
  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    const emptyDiv =
      document.createElement("div");

    calendar.appendChild(
      emptyDiv
    );

  }

  // CREATE DAYS
  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const dateKey =
      `${year}-${month + 1}-${day}`;

    const data =
      tasks[dateKey];

    let preview = "";

    let colorClass = "";

    // TASK PREVIEW
    if (data) {

      if (
        data.tasks &&
        data.tasks.length > 0
      ) {

        preview =
          data.tasks
            .slice(0, 2)
            .map(
              task => task.text
            )
            .join(", ");

      }

      if (data.status) {

        colorClass =
          data.status;

      }

    }

    // DAY DIV
    const dayDiv =
      document.createElement("div");

    dayDiv.className =
      `day ${colorClass}`;

    dayDiv.innerHTML = `
      <div>
        <b>${day}</b>
      </div>

      <small>
        ${preview}
      </small>
    `;

    // OPEN MODAL
    dayDiv.onclick = () => {

      openModal(dateKey);

    };

    calendar.appendChild(
      dayDiv
    );

  }

}

// ================= OPEN MODAL =================
window.openModal =
function(date) {

  selectedDate = date;

  selectedDateEl.innerText =
    date;

  taskInput.value = "";

  editIndex = null;

  // CREATE DATE OBJECT
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

// ================= CLOSE MODAL =================
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

// ================= ADD / EDIT TASK =================
addTaskBtn.onclick =
async () => {

  const text =
    taskInput.value.trim();

  if (!text) return;

  // EDIT
  if (
    editIndex !== null
  ) {

    tasks[selectedDate]
      .tasks[editIndex]
      .text = text;

    editIndex = null;

  }

  // ADD
  else {

    tasks[selectedDate]
      .tasks.push({
        text: text,
        done: false
      });

  }

  await saveTasks();

  taskInput.value = "";

  renderTasks();

};

// ================= RENDER TASKS =================
function renderTasks() {

  taskList.innerHTML = "";

  const data =
    tasks[selectedDate];

  if (!data) return;

  // TASKS
  data.tasks.forEach(
    (task, index) => {

    const li =
      document.createElement("li");

    if (task.done) {

      li.classList.add(
        "done"
      );

    }

    li.innerHTML = `
      <span>
        ${task.text}
      </span>

      <div>

        <button
          onclick="toggleDone(${index})"
        >
          ✔
        </button>

        <button
          onclick="editTask(${index})"
        >
          ✏
        </button>

        <button
          onclick="deleteTask(${index})"
          style="color:red;"
        >
          ❌
        </button>

      </div>
    `;

    taskList.appendChild(li);

  });

  // COLOR BUTTONS
  const colorBox =
    document.createElement("div");

  colorBox.style.marginTop =
    "15px";

  colorBox.innerHTML = `
    <button onclick="setColor('green')">
      Green
    </button>

    <button onclick="setColor('red')">
      Red
    </button>

    <button onclick="setColor(null)">
      Reset
    </button>
  `;

  taskList.appendChild(
    colorBox
  );

}

// ================= TOGGLE DONE =================
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

// ================= EDIT TASK =================
window.editTask =
function(index) {

  taskInput.value =
    tasks[selectedDate]
      .tasks[index]
      .text;

  editIndex = index;

};

// ================= DELETE TASK =================
window.deleteTask =
async function(index) {

  tasks[selectedDate]
    .tasks.splice(index, 1);

  // REMOVE EMPTY DATE
  if (
    tasks[selectedDate]
      .tasks.length === 0
  ) {

    delete tasks[selectedDate];

  }

  await saveTasks();

  renderTasks();

};

// ================= SET COLOR =================
window.setColor =
async function(color) {

  if (!tasks[selectedDate]) {

    tasks[selectedDate] = {
      tasks: [],
      status: null
    };

  }

  tasks[selectedDate]
    .status = color;

  await saveTasks();

};

// ================= PREVIOUS MONTH =================
document
.getElementById("prevMonth")
.onclick = () => {

  currentDate.setMonth(
    currentDate.getMonth() - 1
  );

  renderCalendar();

};

// ================= NEXT MONTH =================
document
.getElementById("nextMonth")
.onclick = () => {

  currentDate.setMonth(
    currentDate.getMonth() + 1
  );

  renderCalendar();

};

// ================= INITIAL LOAD =================
renderCalendar();
