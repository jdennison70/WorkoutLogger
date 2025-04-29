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
    list.innerHTML = ""; // Clear existing items

    currentExercises.forEach((ex, index) => {
        const li = document.createElement("li");
        li.textContent = `${ex.exercise} - ${ex.reps} reps @ ${ex.weight}kg`;
        list.appendChild(li);
    });
}
