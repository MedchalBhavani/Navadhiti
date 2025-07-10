const colors = ['#f39c12', '#e74c3c', '#8e44ad', '#16a085', '#2980b9', '#2c3e50'];

function getNotes() {
    return JSON.parse(localStorage.getItem("stickyNotes") || "[]");
}

function saveNotes(notes) {
    localStorage.setItem("stickyNotes", JSON.stringify(notes));
}

function addNote() {
    const input = document.getElementById("noteInput");
    const text = input.value.trim();
    if (!text) return;

    const notes = getNotes();
    const note = {
        id: Date.now(),
        text,
        color: colors[Math.floor(Math.random() * colors.length)]
    };
    notes.push(note);
    saveNotes(notes);
    input.value = "";
    renderNotes();
}

function deleteNote(id) {
    const notes = getNotes().filter(note => note.id !== id);
    saveNotes(notes);
    renderNotes();
}

function toggleEdit(id, textarea, button) {
    if (textarea.disabled) {
        textarea.disabled = false;
        button.innerText = "💾 Save";
    } else {
        const newText = textarea.value.trim();
        const notes = getNotes().map(note => {
            if (note.id === id) {
                note.text = newText;
            }
            return note;
        });
        saveNotes(notes);
        textarea.disabled = true;
        button.innerText = "✏️ Edit";
    }
}

function renderNotes() {
    const container = document.getElementById("notesContainer");
    const notes = getNotes();
    container.innerHTML = "";

    notes.forEach(note => {
        const card = document.createElement("div");
        card.className = "note-card shadow";
        card.style.backgroundColor = note.color;

        const actions = document.createElement("div");
        actions.className = "note-actions";

        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-light";
        editBtn.innerText = "✏️ Edit";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-sm btn-light ms-1";
        deleteBtn.innerHTML = "🗑️";
        deleteBtn.onclick = () => deleteNote(note.id);

        const textarea = document.createElement("textarea");
        textarea.value = note.text;
        textarea.disabled = true;

        editBtn.onclick = () => toggleEdit(note.id, textarea, editBtn);

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        card.appendChild(actions);
        card.appendChild(textarea);
        container.appendChild(card);
    });
}

renderNotes();
