const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const modal = document.getElementById("taskModal");
const closeModal = document.querySelector(".close");
const selectedDateText = document.getElementById("selectedDate");
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

let currentDate = new Date();
let selectedDate = "";

const tasks = JSON.parse(localStorage.getItem("calendarTasks")) || {};

function saveTasks() {
  localStorage.setItem("calendarTasks", JSON.stringify(tasks));
}

function renderCalendar() {
  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthYear.textContent = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Empty boxes before month starts
  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement("div");
    calendar.appendChild(emptyDiv);
  }

  // Create days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");

    const dateKey = `${year}-${month + 1}-${day}`;

    const dayTasks = tasks[dateKey] || [];

    // Latest task decides color
    const latestTask = dayTasks[dayTasks.length - 1];

    if (latestTask) {
      if (latestTask.status === "completed") {
        dayDiv.style.backgroundColor = "#90EE90"; // green
      } else if (latestTask.status === "missed") {
        dayDiv.style.backgroundColor = "#FFCCCB"; // red
      }
    }

    dayDiv.innerHTML = `
      <div class="day-number">${day}</div>
      <div class="task-preview">
        ${dayTasks
          .slice(0, 2)
          .map(task => task.text)
          .join("<br>")}
      </div>
    `;

    dayDiv.addEventListener("click", () => openModal(dateKey));

    calendar.appendChild(dayDiv);
  }
}

function openModal(dateKey) {
  selectedDate = dateKey;
  selectedDateText.textContent = `Tasks for ${dateKey}`;

  modal.style.display = "block";

  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";

  const dayTasks = tasks[selectedDate] || [];

  dayTasks.forEach((task, index) => {
    const li = document.createElement("li");

    let taskClass = "";

    if (task.status === "completed") {
      taskClass = "completed-task";
    } else if (task.status === "missed") {
      taskClass = "missed-task";
    }

    li.innerHTML = `
      <span class="${taskClass}">${task.text}</span>

      <div class="task-actions">
        <button class="complete">✔</button>
        <button class="missed">✖</button>
      </div>
    `;

    // GREEN
    li.querySelector(".complete").addEventListener("click", () => {
      tasks[selectedDate][index].status = "completed";

      saveTasks();

      renderTasks();
      renderCalendar();
    });

    // RED
    li.querySelector(".missed").addEventListener("click", () => {
      tasks[selectedDate][index].status = "missed";

      saveTasks();

      renderTasks();
      renderCalendar();
    });

    taskList.appendChild(li);
  });
}

addTaskBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();

  if (!taskText) return;

  if (!tasks[selectedDate]) {
    tasks[selectedDate] = [];
  }

  tasks[selectedDate].push({
    text: taskText,
    status: "pending",
  });

  taskInput.value = "";

  saveTasks();

  renderTasks();
  renderCalendar();
});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);

  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);

  renderCalendar();
});

renderCalendar();