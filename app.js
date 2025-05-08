let currentExercises = [];
function addExercise() {
    const name = document.getElementById("exercise-name").value.trim();
    const reps = document.getElementById("reps").value.trim();
    const weight = document.getElementById("weight").value.trim();

    if (!name || !reps || !weight) {
        alert("Please fill in all exercise fields.");
        return;
    }

    // Add to the currentExercises array
    currentExercises.push({
        exercise: name,
        reps: parseInt(reps),
        weight: parseFloat(weight)
    });
    localStorage.setItem("inProgressExercises", JSON.stringify(currentExercises));

    // Update the visible list
    updateExerciseList();

    // Clear the input fields
    document.getElementById("exercise-name").value = "";
    document.getElementById("reps").value = "";
    document.getElementById("weight").value = "";
}
function updateExerciseList() {
    const list = document.getElementById("exercise-items");
    list.innerHTML = ""; // Clear the existing list

    currentExercises.forEach((ex, index) => {
        const li = document.createElement("li");
        li.textContent = `${ex.exercise} - ${ex.reps} reps @ ${ex.weight}kg`;

        // Create delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.style.marginLeft = "10px";
        deleteBtn.style.backgroundColor = "#ff4d4d";
        deleteBtn.style.color = "#fff";
        deleteBtn.style.border = "none";
        deleteBtn.style.borderRadius = "4px";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.onclick = () => {
            currentExercises.splice(index, 1);
        
            // 🛠️ Update localStorage with new state
            if (currentExercises.length > 0) {
                localStorage.setItem("inProgressExercises", JSON.stringify(currentExercises));
            } else {
                localStorage.removeItem("inProgressExercises");
            }
        
            updateExerciseList();
        };
        

        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}
function saveWorkout() {
    const date = document.getElementById("workout-date").value;

    if (!date) {
        alert("Please select a workout date.");
        return;
    }

    if (currentExercises.length === 0) {
        alert("Please add at least one exercise.");
        return;
    }

    // Build the workout object
    const workout = {
        date: date,
        exercises: currentExercises
    };

    // Get existing workouts or start with empty array
    let workouts = JSON.parse(localStorage.getItem("workouts")) || [];

    // Add the new workout to the list
    workouts.push(workout);

    // Save updated list back to localStorage
    localStorage.setItem("workouts", JSON.stringify(workouts));

    localStorage.removeItem("inProgressExercises");
    localStorage.removeItem("inProgressDate");


    // Clear form + reset state
    document.getElementById("workout-date").value = "";
    currentExercises = [];
    updateExerciseList();

    alert("Workout saved successfully!");

    //update recent workouts list
    updateRecentWorkouts();
}
function updateRecentWorkouts() {
    const list = document.getElementById("recent-workout-list");
    list.innerHTML = "";

    let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const recent = workouts.slice(-3).reverse();

    recent.forEach((workout, displayIndex) => {
        const li = document.createElement("li");

        // Workout summary
        const textSpan = document.createElement("span");
        textSpan.textContent = `📅 ${formatDateDisplay(workout.date)} – ${workout.exercises.length} exercises`;


        // View button
        const viewBtn = document.createElement("button");
        viewBtn.textContent = "👁 View";
        viewBtn.className = "recent-workout-button view-btn";

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌ Delete";
        deleteBtn.className = "recent-workout-button delete-btn";

        // Details div
        const detailsDiv = document.createElement("div");
        detailsDiv.style.marginTop = "10px";
        detailsDiv.style.display = "none";

        workout.exercises.forEach(ex => {
            const p = document.createElement("p");
            p.textContent = `${ex.exercise} – ${ex.reps} reps @ ${ex.weight}kg`;
            detailsDiv.appendChild(p);
        });

        // View toggle logic
        viewBtn.onclick = () => {
            detailsDiv.style.display = detailsDiv.style.display === "block" ? "none" : "block";
        };

        // Delete logic
        const actualIndex = workouts.length - 1 - displayIndex;
        deleteBtn.onclick = () => {
            if (!confirm("Delete this workout?")) return;
            workouts.splice(actualIndex, 1);
            localStorage.setItem("workouts", JSON.stringify(workouts));
            updateRecentWorkouts();
        };

        li.appendChild(textSpan);
        li.appendChild(viewBtn);
        li.appendChild(deleteBtn);
        li.appendChild(detailsDiv);
        list.appendChild(li);
    });
}
function loadAllWorkouts() {

    
        console.log("✅ loadAllWorkouts() called");
    
        const list = document.getElementById("all-workout-list");
        list.innerHTML = "";
    
        let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    
        // Sort by date descending (newest first)
        workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
        workouts.forEach((workout, index) => {
            const li = document.createElement("li");
    
            const dateHeading = document.createElement("h3");
            dateHeading.textContent = `📅 ${formatDateDisplay(workout.date)}`;
            li.appendChild(dateHeading);
    
            workout.exercises.forEach(ex => {
                const p = document.createElement("p");
                p.textContent = `${ex.exercise} – ${ex.reps} reps @ ${ex.weight}kg`;
                li.appendChild(p);
            });
    
            // 🔴 Add Delete Button
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🗑 Delete Workout";
            deleteBtn.style.marginTop = "8px";
            deleteBtn.style.backgroundColor = "#f94b4b";
            deleteBtn.style.color = "white";
            deleteBtn.style.border = "none";
            deleteBtn.style.borderRadius = "5px";
            deleteBtn.style.padding = "6px 12px";
            deleteBtn.style.cursor = "pointer";
    
            // Actual index is from reverse-sorted array
            const actualIndex = workouts.length - 1 - index;
    
            deleteBtn.onclick = () => {
                currentExercises.splice(index, 1);
                // 🔧 Update autosaved data
                if (currentExercises.length > 0) {
                    localStorage.setItem("inProgressExercises", JSON.stringify(currentExercises));
                } else {
                    localStorage.removeItem("inProgressExercises");
                }
                updateExerciseList(); // refresh list
            };
            
    
            li.appendChild(deleteBtn);
            list.appendChild(li);
           

        });
        
    
    
}


    

function downloadWorkoutData() {
    const data = localStorage.getItem("workouts");

    if (!data) {
        alert("No workouts to download.");
        return;
    }

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "workouts.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
function importWorkoutData() {
    const fileInput = document.getElementById("import-file");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to import.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        try {
            const data = JSON.parse(event.target.result);

            if (!Array.isArray(data)) {
                alert("Invalid file format. Expected an array of workouts.");
                return;
            }

            localStorage.setItem("workouts", JSON.stringify(data));
            alert("✅ Workouts imported successfully!");
            loadAllWorkouts(); // refresh display if needed

        } catch (e) {
            alert("❌ Failed to import: Invalid JSON file.");
            console.error(e);
        }
    };

    reader.readAsText(file);
}





document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("workout-date");

if (dateInput) {
    // Try to restore the saved in-progress date
    const savedDate = localStorage.getItem("inProgressDate");

    if (savedDate) {
        dateInput.value = savedDate;
    } else {
        // If no saved date, set to today's date
        const today = new Date().toISOString().split("T")[0];
        dateInput.value = today;
    }

    // Save changes to date field
    dateInput.addEventListener("input", () => {
        localStorage.setItem("inProgressDate", dateInput.value);
    });
    
}


    // Load recent workouts if element is present
    if (document.getElementById("recent-workout-list")) {
        updateRecentWorkouts();
    }

    const savedExercises = JSON.parse(localStorage.getItem("inProgressExercises"));
if (Array.isArray(savedExercises)) {
    currentExercises = savedExercises;
    updateExerciseList();
}

const savedDate = localStorage.getItem("inProgressDate");
if (savedDate) {
    const dateInput = document.getElementById("workout-date");
    if (dateInput) dateInput.value = savedDate;
}
const versionEl = document.getElementById("version-text");
if (versionEl) versionEl.textContent = "v1.0.1";
    


});
function loadPersonalRecords() {
    const prList = document.getElementById("pr-list");
    prList.innerHTML = "";

    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const prs = {};

    workouts.forEach(workout => {
        workout.exercises.forEach(ex => {
            const name = ex.exercise;
            if (!prs[name] || ex.weight > prs[name].weight) {
                prs[name] = {
                    weight: ex.weight,
                    reps: ex.reps,
                    date: workout.date
                };
            }
        });
    });

    const sortedNames = Object.keys(prs).sort();

    sortedNames.forEach(name => {
        const record = prs[name];
        const li = document.createElement("li");
        li.textContent = `${name}: ${record.weight}kg for ${record.reps} reps on ${formatDateDisplay(record.date)}`;
        prList.appendChild(li);
    });
}

function formatDateDisplay(isoDate) {
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
}
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.onupdatefound = () => {
        const newWorker = reg.installing;
        newWorker.onstatechange = () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            if (confirm("New version available! Refresh now?")) {
              window.location.reload();
            }
          }
        };
      };
    });
  }
  