
/* ==========================================
   STUDYMATE - JAVASCRIPT FUNCTIONALITY
========================================== */

// 1. APPLICATION DATA

const STORAGE_KEY = "studymate_tasks";

let tasks = loadTasks();
let editingTaskId = null;


// 2. GET HTML ELEMENTS

const taskForm = document.getElementById("taskForm");
const subjectInput = document.getElementById("subject");
const descriptionInput = document.getElementById("description");
const deadlineInput = document.getElementById("deadline");

const taskList = document.getElementById("taskList");
const upcomingTasks = document.getElementById("upcomingTasks");

const searchInput = document.getElementById("searchInput");
const filterTasks = document.getElementById("filterTasks");


// 3. LOAD AND SAVE TASKS

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (!savedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);

        return Array.isArray(parsedTasks) ? parsedTasks : [];

    } catch (error) {
        console.error("Could not load saved tasks:", error);
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        alert("Unable to save tasks. Please check your browser storage.");
        console.error("Storage error:", error);
    }
}


// 4. NAVIGATION BETWEEN SCREENS

const navButtons = document.querySelectorAll(".nav-btn");

function showView(viewId) {

    document.querySelectorAll(".view").forEach(view => {
        view.classList.remove("active");
    });

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.remove("active");
    });

    const selectedView = document.getElementById(viewId);

    if (!selectedView) return;

    selectedView.classList.add("active");

    const selectedButton = document.querySelector(
        `.nav-btn[data-view="${viewId}"]`
    );

    if (selectedButton) {
        selectedButton.classList.add("active");
    }

    if (viewId === "tasks") {
        displayTasks();
    }

    if (viewId === "dashboard") {
        updateDashboard();
    }
}

navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const viewId = button.dataset.view;

        if (viewId === "add-task" && editingTaskId === null) {
            resetForm();
        }

        showView(viewId);

    });

});


// 5. HELPER FUNCTIONS

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function formatDate(dateString) {

    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString(
        "en-GB",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

function getToday() {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getDeadlineStatus(task) {

    if (task.completed) {
        return "Completed";
    }

    if (task.deadline < getToday()) {
        return "Overdue";
    }

    return "Pending";
}


// 6. ADD OR UPDATE A STUDY TASK

// Add a Cancel button to the existing form.
const cancelButton = document.createElement("button");

cancelButton.type = "button";
cancelButton.textContent = "Cancel";
cancelButton.className = "action-btn";

cancelButton.style.background = "#718096";
cancelButton.style.marginLeft = "10px";
cancelButton.style.width = "auto";
cancelButton.style.marginTop = "22px";

taskForm.appendChild(cancelButton);


taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const subject = subjectInput.value.trim();
    const description = descriptionInput.value.trim();
    const deadline = deadlineInput.value;

    // Validate important fields.
    if (!subject || !description || !deadline) {
        alert("Please complete all the required fields.");
        return;
    }

    if (deadline < getToday()) {
        alert("Please select today or a future deadline.");
        return;
    }

    if (editingTaskId !== null) {

        // Update an existing task.
        const task = tasks.find(
            item => item.id === editingTaskId
        );

        if (task) {
            task.subject = subject;
            task.description = description;
            task.deadline = deadline;

            saveTasks();

            alert("Study task updated successfully!");
        }

    } else {

        // Create a new task.
        const newTask = {
            id: Date.now(),
            subject: subject,
            description: description,
            deadline: deadline,
            completed: false
        };

        tasks.push(newTask);

        saveTasks();

        alert("Study task added successfully!");

    }

    resetForm();
    updateDashboard();
    displayTasks();
    showView("tasks");

});


// 7. RESET THE FORM

function resetForm() {

    taskForm.reset();

    editingTaskId = null;

    const submitButton = taskForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.textContent = "Save Study Task";

    cancelButton.style.display = "none";

}

cancelButton.addEventListener("click", function() {

    resetForm();
    showView("tasks");

});


// 8. DISPLAY STUDY TASKS

function displayTasks() {

    const searchTerm = searchInput.value.toLowerCase().trim();

    const selectedFilter = filterTasks.value;

    let filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.subject.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm);

        const matchesFilter =
            selectedFilter === "all" ||
            (selectedFilter === "completed" && task.completed) ||
            (selectedFilter === "pending" && !task.completed);

        return matchesSearch && matchesFilter;

    });

    // Arrange tasks by deadline.
    filteredTasks.sort((a, b) =>
        a.deadline.localeCompare(b.deadline)
    );

    if (filteredTasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-message">
                <h3>No study tasks found</h3>
                <p>Try another search or add a new study task.</p>
            </div>
        `;

        return;
    }

    taskList.innerHTML = filteredTasks.map(task => {

        const status = getDeadlineStatus(task);

        const statusClass = task.completed ? "completed" : "";

        return `
            <div class="task-card ${task.completed ? "completed" : ""}">

                <div class="task-details">

                    <h3>${escapeHTML(task.subject)}</h3>

                    <p>${escapeHTML(task.description)}</p>

                    <p>
                        <strong>Deadline:</strong>
                        ${formatDate(task.deadline)}
                    </p>

                    <span class="task-status ${statusClass}">
                        ${status}
                    </span>

                </div>

                <div class="task-actions">

                    <button
                        class="complete-btn"
                        data-action="toggle"
                        data-id="${task.id}">
                        ${task.completed ? "Undo" : "Complete"}
                    </button>

                    <button
                        class="edit-btn"
                        data-action="edit"
                        data-id="${task.id}">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        data-action="delete"
                        data-id="${task.id}">
                        Delete
                    </button>

                </div>

            </div>
        `;

    }).join("");

}


// 9. COMPLETE, EDIT AND DELETE TASKS

taskList.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const taskId = Number(button.dataset.id);
    const action = button.dataset.action;

    const task = tasks.find(item => item.id === taskId);

    if (!task) return;


    if (action === "toggle") {

        task.completed = !task.completed;

        saveTasks();

        displayTasks();
        updateDashboard();

    }


    if (action === "edit") {

        editingTaskId = taskId;

        subjectInput.value = task.subject;
        descriptionInput.value = task.description;
        deadlineInput.value = task.deadline;

        taskForm.querySelector(
            'button[type="submit"]'
        ).textContent = "Update Study Task";

        cancelButton.style.display = "inline-block";

        showView("add-task");

    }


    if (action === "delete") {

        const confirmed = confirm(
            `Are you sure you want to delete "${task.subject}"?`
        );

        if (confirmed) {

            tasks = tasks.filter(item => item.id !== taskId);

            saveTasks();

            displayTasks();
            updateDashboard();

            alert("Study task deleted successfully!");

        }

    }

});


// 10. SEARCH AND FILTER

searchInput.addEventListener("input", displayTasks);

filterTasks.addEventListener("change", displayTasks);


// 11. UPDATE DASHBOARD STATISTICS

function updateDashboard() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);


    document.getElementById("totalTasks").textContent = total;

    document.getElementById("completedTasks").textContent = completed;

    document.getElementById("pendingTasks").textContent = pending;


    document.getElementById("progressBar").style.width =
        percentage + "%";

    document.getElementById("progressText").textContent =
        percentage + "% completed";


    displayUpcomingTasks();

}


// 12. DISPLAY UPCOMING TASKS

function displayUpcomingTasks() {

    const pendingTasks = tasks
        .filter(task => !task.completed)
        .sort((a, b) => a.deadline.localeCompare(b.deadline))
        .slice(0, 3);


    if (pendingTasks.length === 0) {

        upcomingTasks.innerHTML = `
            <div class="empty-message">
                <p>No pending study tasks. Great work!</p>
            </div>
        `;

        return;
    }


    upcomingTasks.innerHTML = pendingTasks.map(task => {

        const status = getDeadlineStatus(task);

        return `
            <div class="task-card">

                <div>
                    <h3>${escapeHTML(task.subject)}</h3>

                    <p>${escapeHTML(task.description)}</p>

                    <p>
                        <strong>Deadline:</strong>
                        ${formatDate(task.deadline)}
                    </p>

                    <span class="task-status">
                        ${status}
                    </span>
                </div>

            </div>
        `;

    }).join("");

}


// 13. INITIALISE APPLICATION

function initialiseApp() {

    // Prevent selecting past deadlines.
    deadlineInput.min = getToday();

    // Hide the cancel button initially.
    cancelButton.style.display = "none";

    updateDashboard();

    displayTasks();

    showView("dashboard");

}

// Start StudyMate.
initialiseApp();
