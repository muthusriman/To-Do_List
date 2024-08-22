const input = document.querySelector("#input");
const add = document.querySelector(".add");
const taskList = document.querySelector(".task-list");
const alert = document.querySelector(".alert");
const noTasksMessage = document.querySelector(".empty");
const statusButtons = document.querySelectorAll(".status-row button");
const taskCounter = document.querySelector("#task-counter");
const tabs = document.querySelectorAll(".status-btn");
const line = document.querySelector(".line");
const clearButton = document.querySelector(".clear-btn");

let todos = [];
let filter = "all";

// Load tasks from localStorage when the window loads
window.onload = () => {
  todos = JSON.parse(localStorage.getItem("todos")) || [];
  renderTasks();
  updateLine();
};

// Update the position and width of the active tab indicator on window resize
window.onresize = updateLine;

function updateLine() {
  const activeTab = document.querySelector(".status-btn.active");
  if (activeTab) {
    line.style.width = `${activeTab.offsetWidth}px`;
    line.style.left = `${activeTab.offsetLeft}px`;
  }
}

// Event listeners for adding a task via button click or Enter key
add.addEventListener("click", addTaskFromInput);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTaskFromInput();
});

function addTaskFromInput() {
  if (input.value.trim() === "") {
    showAlert("Please enter a task before adding!", "red");
  } else {
    const taskName = input.value.trim().substring(0, 150);
    const newTask = { name: taskName, completed: false };
    todos.push(newTask);
    localStorage.setItem("todos", JSON.stringify(todos));
    showAlert("Task added successfully!", "green");
    input.value = "";
    renderTasks();
  }
}

// Generate the HTML for a task item
function generateTaskHTML(task) {
  const checkboxIcon = task.completed
    ? "images/marked.png"
    : "images/unmarked.png";
  return `
    <span class="task-name ${task.completed ? "completed" : ""}">${
    task.name
  } </span>
    <img src="${checkboxIcon}" class="checkbox-icon" id="check-${
    task.name
  }" title="Check-box">
    <img src="images/edit_icon.png" alt="Edit" class="edit" title="Edit">
    <img src="images/save_icon.png" alt="Save" class="save" style="display:none;">
    <img src="images/remove_icon.png" alt="Remove" class="rem" title="Delete">
  `;
}

// Generate the HTML for a task item in edit mode
function generateEditTaskHTML(task) {
  const checkboxIcon = task.completed
    ? "images/marked.png"
    : "images/unmarked.png";
  return `
    <input type="text" class="edit-input" value="${task.name}">
    <img src="${checkboxIcon}" class="checkbox-icon" title="Check-box" id="check-${task.name}">
    <img src="images/save_icon.png" alt="Save" class="save" title="Save">
    <img src="images/remove_icon.png" alt="Remove" class="rem" title="Delete">
  `;
}

// Add a task item to the task list
function addTask(task) {
  const li = document.createElement("li");
  li.innerHTML = generateTaskHTML(task);
  addTaskEventListeners(li, task.name);
  taskList.appendChild(li);
}

// Add event listeners to task item elements
function addTaskEventListeners(li, taskName) {
  const remBtn = li.querySelector(".rem");
  const editBtn = li.querySelector(".edit");
  const saveBtn = li.querySelector(".save");
  const checkboxIcon = li.querySelector(".checkbox-icon");

  remBtn.addEventListener("click", () => removeTask(taskName));
  editBtn.addEventListener("click", () => editTask(li, taskName));
  saveBtn.addEventListener("click", () => saveTask(li, taskName));
  checkboxIcon.addEventListener("click", () => toggleComplete(taskName));
}

// Find the index of a task in the todos array
function findTaskIndex(taskName) {
  return todos.findIndex((todo) => todo.name === taskName);
}

// Remove a task from the task list and localStorage
function removeTask(taskName) {
  if (confirm("Are you sure you want to delete this task?")) {
    todos = todos.filter((todo) => todo.name !== taskName);
    localStorage.setItem("todos", JSON.stringify(todos));
    showAlert("Task removed successfully!", "green");

    // Remove blur from all tasks
    Array.from(taskList.children).forEach((taskItem) => {
      taskItem.classList.remove("task-blur");
    });
    clearButton.disabled = false; // Enable the clear button
    clearButton.classList.remove("disabled-button"); // Remove disabled-button class
    add.disabled = false; // Enable the add button
    add.classList.remove("disabled-button"); // Remove disabled-button class
  } else {
    showAlert("Task removal canceled!", "red");
  }
  renderTasks();
}

// Disable or enable features during editing
function disableFeaturesDuringEdit(disable = true) {
  // Disable or enable status buttons and delete buttons
  tabs.forEach((tab) => {
    tab.disabled = disable;
    tab.classList.toggle("disabled-button", disable);
  });

  const deleteButtons = document.querySelectorAll(".rem");
  deleteButtons.forEach((button) => {
    button.disabled = disable;
    button.classList.toggle("disabled-button", disable);
  });

  // Disable or enable add button
  add.disabled = disable;
  add.classList.toggle("disabled-button", disable);

  // Disable or enable clear button
  clearButton.disabled = disable;
  clearButton.classList.toggle("disabled-button", disable);

  // Add or remove event listener for add button
  if (disable) {
    add.removeEventListener("click", addTaskFromInput);
  } else {
    add.addEventListener("click", addTaskFromInput);
  }
}

// Edit a task item
function editTask(li, oldTaskName) {
  const taskIndex = findTaskIndex(oldTaskName);
  const currentTask = todos[taskIndex];

  li.innerHTML = generateEditTaskHTML(currentTask);

  input.disabled = true;
  disableFeaturesDuringEdit(); // Disable features during editing

  const editInput = li.querySelector(".edit-input");
  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);

  const remBtn = li.querySelector(".rem");
  const saveBtn = li.querySelector(".save");
  const enterBtn = li.querySelector(".edit-input");

  remBtn.disabled = true; // Disable remove button during edit

  saveBtn.addEventListener("click", () => saveTask(li, oldTaskName));
  enterBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveTask(li, oldTaskName);
  });

  // Blur all other tasks except the one being edited
  Array.from(taskList.children).forEach((taskItem) => {
    if (taskItem !== li) {
      taskItem.classList.add("task-blur");
    }
  });
}

// Save the edited task item
function saveTask(li, oldTaskName) {
  const inputField = li.querySelector(".edit-input");
  const newTaskName = inputField.value.trim().substring(0, 150);

  if (newTaskName === "") {
    showAlert("Task cannot be empty!", "red");
    return;
  }

  const taskIndex = findTaskIndex(oldTaskName);
  todos[taskIndex].name = newTaskName;
  localStorage.setItem("todos", JSON.stringify(todos));

  li.innerHTML = generateTaskHTML(todos[taskIndex]);
  addTaskEventListeners(li, newTaskName);

  input.disabled = false;
  disableFeaturesDuringEdit(false); // Re-enable features after editing

  showAlert("Task updated successfully!", "green");
  renderTasks();

  // Remove blur from all tasks
  Array.from(taskList.children).forEach((taskItem) => {
    taskItem.classList.remove("task-blur");
  });

  // Re-enable remove button after saving
  const remBtn = li.querySelector(".rem");
  remBtn.disabled = false;
}

// Toggle the completion status of a task item
function toggleComplete(taskName) {
  const taskIndex = findTaskIndex(taskName);
  todos[taskIndex].completed = !todos[taskIndex].completed;
  localStorage.setItem("todos", JSON.stringify(todos));
  showAlert(
    todos[taskIndex].completed
      ? "Task marked as completed!"
      : "Task marked as incomplete!",
    "green"
  );
  renderTasks();
}

// Render the task list based on the current filter
function renderTasks() {
  taskList.innerHTML = "";
  let filteredTodos = todos;

  if (filter === "assigned") {
    filteredTodos = todos.filter((todo) => !todo.completed);
  } else if (filter === "completed") {
    filteredTodos = todos.filter((todo) => todo.completed);
  }

  filteredTodos.forEach((todo) => addTask(todo));
  updateNoTasksMessage();
  updateTaskCounter();
}

// Clear all tasks based on the current filter
function clearAllTasks() {
  let tasksToRemove = [];

  if (filter === "assigned") {
    tasksToRemove = todos.filter((todo) => !todo.completed);
  } else if (filter === "completed") {
    tasksToRemove = todos.filter((todo) => todo.completed);
  } else {
    tasksToRemove = todos.slice();
  }

  if (tasksToRemove.length === 0) {
    showAlert("No tasks to clear in this section!", "red");
    return;
  }

  if (confirm("Are you sure you want to clear these tasks?")) {
    todos = todos.filter((todo) => !tasksToRemove.includes(todo));
    localStorage.setItem("todos", JSON.stringify(todos));
    renderTasks();
    showAlert("Tasks cleared!", "green");

    clearButton.disabled = false; // Enable the clear button
    clearButton.classList.remove("disabled-button"); // Remove disabled-button class
    add.disabled = false; // Enable the add button
    add.classList.remove("disabled-button"); // Remove disabled-button class
  } else {
    showAlert("Task clearing canceled!", "red");
  }
}

// Show an alert message
function showAlert(message, color) {
  alert.textContent = message;
  alert.className = `alert ${color}`;
  alert.style.visibility = "visible";
  setTimeout(() => {
    alert.style.visibility = "hidden";
  }, 3000);
}

// Event listeners for status tabs
tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    tabs.forEach((tab) => tab.classList.remove("active"));
    e.target.classList.add("active");
    updateLine();
  });
});

// Filter tasks based on the selected status
function filterTasks(type) {
  filter = type;
  renderTasks();
}

// Update the "no tasks" message visibility
function updateNoTasksMessage() {
  noTasksMessage.style.display = taskList.children.length === 0 ? "" : "none";
}

// Update the task counter
function updateTaskCounter() {
  const assignedTasks = todos.filter((todo) => !todo.completed).length;
  taskCounter.textContent = assignedTasks;
}
