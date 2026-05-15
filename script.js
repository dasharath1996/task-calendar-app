import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot
}
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// ---------------- FIREBASE CONFIG ----------------
const firebaseConfig = {
  apiKey: "AIzaSyBNVbF3mBExC_fBGmOeKAiUZ2olIO7k_Lc",
  authDomain: "my-task-calendar-f87ad.firebaseapp.com",
  projectId: "my-task-calendar-f87ad",
  storageBucket: "my-task-calendar-f87ad.firebasestorage.app",
  messagingSenderId: "1043925124339",
  appId: "1:1043925124339:web:81d71fba61eaf145ac2386"
};

// ---------------- INIT FIREBASE ----------------
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// ---------------- DOM ----------------
const calendar = document.getElementById("calendar");

const monthYear = document.getElementById("monthYear");

const modal = document.getElementById("taskModal");

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

// ---------------- VARIABLES ----------------
let currentDate = new Date();

let selectedDate = null;

let editIndex = null;

let tasks = {};

// ---------------- FIREBASE DOC ----------------
const docRef =
  doc(db, "calendar", "tasks");

// ---------------- REALTIME SYNC ----------------
onSnapshot(docRef, (snapshot) => {

  if (snapshot.exists()) {

    tasks = snapshot.data().data || {};

  }

  renderCalendar();

});

// ---------------- SAVE TASKS ----------------
async function saveTasks() {

  await setDoc(docRef, {
    data: tasks
  });

}

// ---------------- CALENDAR ----------------
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

  for (let i = 0; i < firstDay; i++) {

    calendar.innerHTML += `<div></div>`;

  }

  for (let day = 1; day <= daysInMonth; day++) {

    const dateKey =
      `${year}-${month + 1}-${day}`;

    const data = tasks[dateKey];

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

    calendar.innerHTML += `
      <div class="day ${colorClass}"
           onclick="openModal('${dateKey}')">

        <div>
          <b>${day}</b>
        </div>

        <small>${preview}</small>

      </div>
    `;
  }
}

// ---------------- OPEN MODAL ----------------
window.openModal = function(date) {

  selectedDate = date;

  selectedDateEl.innerText = date;

  taskInput.value = "";

  editIndex = null;

  if (!tasks[selectedDate]) {

    tasks[selectedDate] = {
      tasks: [],
      status: null
    };

  }

  renderTasks();

  modal.style.display = "block";
};

// ---------------- CLOSE MODAL ----------------
closeModal.onclick = () => {

  modal.style.display = "none";

};

window.onclick = (e) => {

  if (e.target === modal) {

    modal.style.display = "none";

  }

};

// ---------------- ADD / EDIT ----------------
addTaskBtn.onclick = async () => {

  if (!taskInput.value.trim()) return;

  if (editIndex !== null) {

    tasks[selectedDate]
      .tasks[editIndex]
      .text = taskInput.value;

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

// ---------------- RENDER TASKS ----------------
function renderTasks() {

  taskList.innerHTML = "";

  const data = tasks[selectedDate];

  if (!data) return;

  data.tasks.forEach((task, index) => {

    const li =
      document.createElement("li");

    if (task.done) {

      li.classList.add("done");

    }

    li.innerHTML = `
      <span>${task.text}</span>

      <div>

        <button onclick="toggleDone(${index})">
          ✔
        </button>

        <button onclick="editTask(${index})">
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

  colorBox.style.marginTop = "10px";

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

  taskList.appendChild(colorBox);
}

// ---------------- COLOR ----------------
window.setColor = async function(color) {

  tasks[selectedDate].status = color;

  await saveTasks();

};

// ---------------- DONE ----------------
window.toggleDone = async function(index) {

  tasks[selectedDate]
    .tasks[index]
    .done =
      !tasks[selectedDate]
        .tasks[index]
        .done;

  await saveTasks();

  renderTasks();
};

// ---------------- EDIT ----------------
window.editTask = function(index) {

  taskInput.value =
    tasks[selectedDate]
      .tasks[index]
      .text;

  editIndex = index;
};

// ---------------- DELETE ----------------
window.deleteTask = async function(index) {

  tasks[selectedDate]
    .tasks.splice(index, 1);

  await saveTasks();

  renderTasks();
};

// ---------------- MONTH NAVIGATION ----------------
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
