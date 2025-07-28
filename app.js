// ✅ Firebase reference
const db = firebase.firestore();

// ✅ Choose collection based on environment
const COLLECTION_NAME = isTestEnv() ? "workouts_test" : "workouts";
console.log(`📂 Using collection: ${COLLECTION_NAME}`);

// ✅ Test environment detection
function isTestEnv() {
    return location.hostname === "localhost" || location.hostname === "127.0.0.1";
}

let currentExercises = [];

function addExercise() {
    const name = document.getElementById("exercise-name").value.trim();
    const reps = document.getElementById("reps").value.trim();
    const weight = document.getElementById("weight").value.trim();

    if (!name || !reps || !weight) {
        alert("Please fill in all exercise fields.");
        return;
    }

    currentExercises.push({
        exercise: name,
        reps: parseInt(reps),
        weight: parseFloat(weight)
    });
    localStorage.setItem("inProgressExercises", JSON.stringify(currentExercises));

    updateExerciseList();

    document.getElementById("exercise-name").value = "";
    document.getElementById("reps").value = "";
    document.getElementById("weight").value = "";
}

function updateExerciseList() {
    const list = document.getElementById("exercise-items");
    list.innerHTML = "";

    currentExercises.forEach((ex, index) => {
        const li = document.createElement("li");
        li.textContent = `${ex.exercise} - ${ex.reps} reps @ ${ex.weight}kg`;

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

    const id = generateId();

    const workout = {
        id: id,
        date: date,
        exercises: currentExercises
    };

    let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    workouts.push(workout);
    localStorage.setItem("workouts", JSON.stringify(workouts));

    localStorage.removeItem("inProgressExercises");
    localStorage.removeItem("inProgressDate");

    document.getElementById("workout-date").value = "";
    currentExercises = [];
    updateExerciseList();
    alert("Workout saved successfully!");

    db.collection(COLLECTION_NAME).doc(id).set({
        id: id,
        date: workout.date,
        exercises: workout.exercises,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        console.log("✅ Workout uploaded to Firebase with ID:", id);
    }).catch((error) => {
        console.error("❌ Firebase upload failed:", error);
    });

    updateRecentWorkouts();
}

function updateRecentWorkouts() {
    const list = document.getElementById("recent-workout-list");
    list.innerHTML = "";

    let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const recent = workouts.slice(-3).reverse();

    recent.forEach((workout, displayIndex) => {
        const li = document.createElement("li");

        const textSpan = document.createElement("span");
        textSpan.textContent = `📅 ${formatDateDisplay(workout.date)} – ${workout.exercises.length} exercises`;

        const viewBtn = document.createElement("button");
        viewBtn.textContent = "👁 View";
        viewBtn.className = "recent-workout-button view-btn";

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌ Delete";
        deleteBtn.className = "recent-workout-button delete-btn";

        const detailsDiv = document.createElement("div");
        detailsDiv.style.marginTop = "10px";
        detailsDiv.style.display = "none";

        workout.exercises.forEach(ex => {
            const p = document.createElement("p");
            p.textContent = `${ex.exercise} – ${ex.reps} reps @ ${ex.weight}kg`;
            detailsDiv.appendChild(p);
        });

        viewBtn.onclick = () => {
            detailsDiv.style.display = detailsDiv.style.display === "block" ? "none" : "block";
        };

        const actualIndex = workouts.length - 1 - displayIndex;
        deleteBtn.onclick = () => {
            if (!confirm("Delete this workout?")) return;

            const deleted = workouts.splice(actualIndex, 1)[0];
            localStorage.setItem("workouts", JSON.stringify(workouts));
            updateRecentWorkouts();

            if (deleted?.id) {
                db.collection(COLLECTION_NAME).doc(deleted.id).delete()
                    .then(() => console.log(`🗑️ Deleted workout ${deleted.id} from Firebase`))
                    .catch(err => console.error(`❌ Failed to delete workout ${deleted.id}:`, err));
            }
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

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑 Delete Workout";
        deleteBtn.style.marginTop = "8px";
        deleteBtn.style.backgroundColor = "#f94b4b";
        deleteBtn.style.color = "white";
        deleteBtn.style.border = "none";
        deleteBtn.style.borderRadius = "5px";
        deleteBtn.style.padding = "6px 12px";
        deleteBtn.style.cursor = "pointer";

        deleteBtn.onclick = () => {
            if (!confirm("Delete this workout?")) return;

            const deleted = workouts.splice(index, 1)[0];
            localStorage.setItem("workouts", JSON.stringify(workouts));
            loadAllWorkouts();

            if (deleted?.id) {
                db.collection(COLLECTION_NAME).doc(deleted.id).delete()
                    .then(() => console.log(`🗑️ Deleted workout ${deleted.id} from Firebase`))
                    .catch(err => console.error(`❌ Failed to delete workout ${deleted.id}:`, err));
            }
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
            let data = JSON.parse(event.target.result);
            if (!Array.isArray(data)) {
                alert("Invalid file format. Expected an array of workouts.");
                return;
            }

            let updated = false;
            data.forEach(workout => {
                if (!workout.id) {
                    workout.id = generateId();
                    updated = true;
                }
            });

            localStorage.setItem("workouts", JSON.stringify(data));
            alert("✅ Workouts imported successfully!");
            if (updated) console.log("🛠 Added missing IDs to imported workouts.");
            loadAllWorkouts();
            syncLocalWorkoutsToFirebase();
        } catch (e) {
            alert("❌ Failed to import: Invalid JSON file.");
            console.error(e);
        }
    };

    reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("workout-date");

    function migrateLegacyWorkoutsAddIdsOnce() {
        if (localStorage.getItem("migratedWorkoutsWithId") === "true") return;

        let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
        let updated = false;

        workouts.forEach(workout => {
            if (!workout.id) {
                workout.id = generateId();
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem("workouts", JSON.stringify(workouts));
            console.log(`🛠 Migrated ${workouts.length} workouts: added missing IDs.`);
        }

        localStorage.setItem("migratedWorkoutsWithId", "true");
    }

    migrateLegacyWorkoutsAddIdsOnce();

    if (dateInput) {
        const savedDate = localStorage.getItem("inProgressDate");
        const today = new Date().toISOString().split("T")[0];

        if (savedDate === today) {
            dateInput.value = savedDate;
        } else {
            dateInput.value = today;
            localStorage.setItem("inProgressDate", today);
            localStorage.removeItem("inProgressExercises");
            currentExercises = [];
            updateExerciseList();
        }

        dateInput.addEventListener("input", () => {
            localStorage.setItem("inProgressDate", dateInput.value);
        });
    }

    const savedExercises = JSON.parse(localStorage.getItem("inProgressExercises"));
    if (Array.isArray(savedExercises)) {
        currentExercises = savedExercises;
        updateExerciseList();
    }

    if (document.getElementById("recent-workout-list")) {
        updateRecentWorkouts();
    }

    const versionEl = document.getElementById("version-text");
    if (versionEl) versionEl.textContent = "v1.0.1";

    syncLocalWorkoutsToFirebase();
});

function loadPersonalRecords() {
    const prList = document.getElementById("pr-list");
    prList.innerHTML = "";

    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const prs = {};

    workouts.forEach(workout => {
        workout.exercises.forEach(ex => {
            const name = ex.exercise;
            const estimated1RM = ex.weight * (1 + ex.reps / 30);
            if (!prs[name] || estimated1RM > prs[name].estimated1RM) {
                prs[name] = {
                    weight: ex.weight,
                    reps: ex.reps,
                    date: workout.date,
                    estimated1RM: estimated1RM
                };
            }
        });
    });

    const sortedNames = Object.keys(prs).sort();

    sortedNames.forEach(name => {
        const record = prs[name];
        const li = document.createElement("li");
        li.textContent = `${name}: ${record.weight}kg for ${record.reps} reps on ${formatDateDisplay(record.date)} (Est. 1RM: ${record.estimated1RM.toFixed(1)}kg)`;
        prList.appendChild(li);
    });
}

function formatDateDisplay(isoDate) {
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
}

async function syncLocalWorkoutsToFirebase() {
    const localWorkouts = JSON.parse(localStorage.getItem("workouts")) || [];
    if (localWorkouts.length === 0) return;

    try {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const existingIds = new Set(snapshot.docs.map(doc => doc.id));

        for (const workout of localWorkouts) {
            if (!workout.id) continue;

            if (!existingIds.has(workout.id)) {
                await db.collection(COLLECTION_NAME).doc(workout.id).set({
                    id: workout.id,
                    date: workout.date,
                    exercises: workout.exercises,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✅ Synced workout ${workout.id} (${workout.date})`);
            } else {
                console.log(`🔁 Skipped existing workout ${workout.id}`);
            }
        }
    } catch (err) {
        console.error("❌ Failed to sync workouts:", err);
    }
}

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    window.location.reload();
                }
            });
        });
    });
}
