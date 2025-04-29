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
            // Remove from array
            currentExercises.splice(index, 1);
            updateExerciseList(); // Refresh list
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
        textSpan.textContent = `📅 ${workout.date} – ${workout.exercises.length} exercises`;

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



document.addEventListener("DOMContentLoaded", () => {
    updateRecentWorkouts();
});
