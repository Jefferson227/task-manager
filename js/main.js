// Add your javascript here. Plagiarism is NOT tolerated!
// ###### Event Listeners #####
$("#button-add").on("click", () => {
  enableFormCreateMode();
  clearForm();
  displayAddEditSection();
});

$("#arrow-back").on("click", () => {
  enableFormCreateMode();
  clearForm();
  displayViewSection();
});

$("#button-delete").on("click", function(event) {
  event.preventDefault();
  displayConfirmationDelete();
});

$("#button-save").on("click", function(event) {
  event.preventDefault();
  submitTask();
});

$("#button-create").on("click", function(event) {
  event.preventDefault();
  submitTask();
});

$("#button-confirm-yes").on("click", function(event) {
  event.preventDefault();
  hideConfirmationDelete();

  if (!$("#task-id").val()) return;

  let taskId = parseInt($("#task-id").val());

  deleteTask(taskId);
  updateView();
  displayViewSection();
});

$("#button-confirm-no").on("click", function(event) {
  event.preventDefault();
  hideConfirmationDelete();
});

$("#task-list").on("click", ".task", function() {
  let taskId = $(this).data("task-id");
  let task = getTaskById(taskId);

  if (!task) return;

  $("#task-id").val(task.id);
  $("#task-name").val(task.name);
  $("#task-description").val(decodeURIComponent(task.description));
  $("#task-priority").val(task.priority);

  let date = new Date(task.deadline);
  $("#task-day").val(date.getDate());
  $("#task-month").val(date.getMonth() + 1);
  $("#task-year").val(date.getFullYear());

  enableFormEditMode();
  displayAddEditSection();
});

// ###### Event Listeners #####

// ###### Functions #####

function notify(message) {
  $("#notification").text(message);
  $("#notification").addClass("notification-animation");

  setTimeout(() => {
    $("#notification").removeClass("notification-animation");
  }, 2500);
}

function enableFormEditMode() {
  $(".form-edit-mode").show();
  $(".form-create-mode").hide();
}

function enableFormCreateMode() {
  $(".form-create-mode").show();
  $(".form-edit-mode").hide();
}

function clearForm() {
  $("#task-id").val("");
  $("#task-name").val("");
  $("#task-description").val("");
  $("#task-priority").val("");
  $(".input-error").hide();
  loadDataSelect();
}

function displayAddEditSection() {
  $("#arrow-back").css("visibility", "visible");
  $(".section-add-edit").show();
  $(".section-view").hide();
}

function displayViewSection() {
  $(".section-view").show();
  $(".section-add-edit").hide();
  $("#arrow-back").css("visibility", "hidden");
}

function displayConfirmationDelete() {
  $(".confirmation-delete").show();
  $("#button-confirm-no").focus();
  $(".crud-buttons").hide();
}

function hideConfirmationDelete() {
  $(".crud-buttons").show();
  $(".confirmation-delete").hide();
}

function updateView() {
  let tasks = getTasks();

  $("#task-list").empty();

  for (let i = 0; i < tasks.length; i++) {
    let task = tasks[i];

    $("#task-list").append(`
            <li class="task-item">
                <div class="task task-priority-${task.priority.toLowerCase()} animation-expand" data-task-id="${
      task.id
    }">
                    <div class="task-title"><h3>${task.name}</h3></div>
                    <div class="task-deadline">${formatDate(
                      task.deadline
                    )}</div>
                    <div class="task-priority">${task.priority}</div>
                </div>
            </li>
        `);
  }

  if ($(".task-item").length) $(".no-task-message").hide();
  else $(".no-task-message").show();
}

function formatDate(strDate) {
  return new Date(strDate).toLocaleDateString();
}

function submitTask() {
  if (!validateFields()) return;

  let taskId = $("#task-id").val();
  let task = {
    name: $("#task-name").val(),
    deadline: getTaskDate(),
    description: encodeURIComponent($("#task-description").val()),
    priority: $("#task-priority").val()
  };

  if (taskId) {
    task.id = parseInt(taskId);
    updateTask(task);
  } else {
    createTask(task);
  }

  updateView();
  displayViewSection();
}

function validateFields() {
  if (!validateFieldByName("name")) return false;

  if (!validateDeadline()) return false;

  if (!validateFieldByName("description")) return false;

  if (!validateFieldByName("priority")) return false;

  return true;
}

function validateFieldByName(fieldName) {
  if (!$(`#task-${fieldName}`).val()) {
    $(`#task-${fieldName}`).focus();
    $(`#input-error-${fieldName}`).show();

    return false;
  }

  $(`#input-error-${fieldName}`).hide();
  return true;
}

function validateDeadline() {
  try {
    let date = getTaskDate();
    $("#input-error-deadline").hide();

    return true;
  } catch {
    $("#task-day").focus();
    $("#input-error-deadline").show();

    return false;
  }
}

function createTask(newTask) {
  newTask.id = getNewTaskId();

  let tasks = getTasks();
  tasks = [...tasks, newTask];

  updateTasks(tasks);
  notify("Task created successfully.");
}

function updateTask(taskToUpdate) {
  let tasks = getTasks();

  tasks = tasks.map(task => {
    return task.id === taskToUpdate.id ? taskToUpdate : task;
  });

  updateTasks(tasks);
  notify("Task updated successfully.");
}

function deleteTask(taskIdToDelete) {
  let tasks = getTasks();
  tasks = tasks.filter(task => task.id !== taskIdToDelete);

  updateTasks(tasks);
  notify("Task deleted successfully.");
}

function updateTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTaskById(id) {
  let tasks = getTasks();
  return tasks.find(task => task.id === id);
}

function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function getNewTaskId() {
  let tasks = getTasks();
  if (!tasks.length) return 0;

  let lastId = tasks.map(task => task.id).reverse()[0];

  return lastId + 1;
}

function getTaskDate() {
  let day = parseInt($("#task-day").val());
  let month = parseInt($("#task-month").val()) - 1;
  let year = parseInt($("#task-year").val());

  return new Date(year, month, day).toISOString();
}

function loadDataSelect() {
  let today = new Date();

  let currentDay = today.getDate();
  loadDayOptions(currentDay);

  let currentMonth = today.getMonth() + 1;
  $("#task-month").val(currentMonth);

  let currentYear = today.getFullYear();
  loadYearOptions(currentYear);
}

function loadDayOptions(currentDay) {
  for (let i = 1; i <= 31; i++) {
    let selected = "";

    if (currentDay === i) selected = "selected";

    $("#task-day").append(`<option value="${i}" ${selected}>${i}</option>`);
  }
}

function loadYearOptions(currentYear) {
  for (let i = currentYear; i <= currentYear + 10; i++) {
    let selected = "";

    if (currentYear === i) selected = "selected";

    $("#task-year").append(`<option value="${i}" ${selected}>${i}</option>`);
  }
}

// ###### Functions #####

// ###### Main #####

updateView();
loadDataSelect();

// ###### Main #####
