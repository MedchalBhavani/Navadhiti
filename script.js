const colors = ['#f39c12', '#e74c3c', '#8e44ad', '#16a085', '#2980b9', '#2c3e50'];
let editingId = null;

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

    let notes = getNotes();

    if (editingId) {
        notes = notes.map(note => {
            if (note.id === editingId) {
                return { ...note, text };
            }
            return note;
        });
        editingId = null;
    } else {
        const note = {
            id: Date.now(),
            text,
            color: colors[Math.floor(Math.random() * colors.length)]
        };
        notes.push(note);
    }

    saveNotes(notes);
    input.value = "";
    renderNotes();
}

function deleteNote(id) {
    const notes = getNotes().filter(note => note.id !== id);
    saveNotes(notes);
    renderNotes();
}

function editNote(id) {
    const note = getNotes().find(n => n.id === id);
    document.getElementById("noteInput").value = note.text;
    editingId = id;
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
        editBtn.innerHTML = "✏️";
        editBtn.onclick = () => editNote(note.id);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-sm btn-light ms-1";
        deleteBtn.innerHTML = "🗑️";
        deleteBtn.onclick = () => deleteNote(note.id);

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        const noteText = document.createElement("p");
        noteText.textContent = note.text;
        noteText.className = "note-text";
        noteText.style.marginTop = "40px";

        card.appendChild(actions);
        card.appendChild(noteText);
        container.appendChild(card);
    });
}

renderNotes();
