// ─── State ───────────────────────────────────────────────────────────────────
let activeParagraphId = null;
let activeParagraphNumber = null;

// ─── Elements ─────────────────────────────────────────────────────────────────
const paragraphs = document.querySelectorAll(".paragraph-item");
const form = document.getElementById("note-form");
const noteTextarea = document.getElementById("note");
const activeParaLabel = document.getElementById("active-para-label");
const notesContainer = document.querySelector(".notes-container");
const notesEmptyMsg = document.getElementById("notes-empty");

// ─── Helpers ───────────────────────────────────────────────────────────
function updateEmptyState() {
  const hasNotes = notesContainer.querySelector("article") !== null;
  notesEmptyMsg.hidden = hasNotes;
}

function updateNoteIndicators() {
  paragraphs.forEach((p) => {
    const existing = p.querySelector(".note-indicator");
    if (existing) existing.remove();
  });

  const notes = document.querySelectorAll(".note");
  const paragraphsWithNotes = new Set();
  notes.forEach((note) => {
    if (note.dataset.paraId) {
      paragraphsWithNotes.add(note.dataset.paraId);
    }
  });

  paragraphsWithNotes.forEach((paraId) => {
    const p = document.getElementById(paraId);
    if (p) {
      const numSpan = p.querySelector(".para-number");
      if (numSpan && !p.querySelector(".note-indicator")) {
        numSpan.insertAdjacentHTML(
          "beforeend",
          '<span class="note-indicator" aria-hidden="true" style="margin-left: 6px;" title="Heeft notitie(s)">📝</span>',
        );
      }
    }
  });
}

function returnToText() {
  const el = activeParagraphId
    ? document.getElementById(activeParagraphId)
    : paragraphs[0];
  if (el) el.focus();
}

function focusNotes() {
  const firstNote = notesContainer.querySelector(".note");
  if (firstNote) {
    firstNote.focus();
  } else if (!notesEmptyMsg.hidden) {
    notesEmptyMsg.setAttribute("tabindex", "-1");
    notesEmptyMsg.focus();
  } else {
    document.getElementById("notes-title")?.focus();
  }
}

function setParagraphState(el, isActive = false) {
  activeParagraphId = el.id;
  activeParagraphNumber = el
    .querySelector(".para-number")
    .textContent.replace("📝", "")
    .trim();

  if (isActive) {
    paragraphs.forEach((p) => {
      p.classList.remove("is-active", "is-focused");
      p.setAttribute("aria-selected", "false");
    });
    el.classList.add("is-active");
    el.setAttribute("aria-selected", "true");
    activeParaLabel.textContent = `Je schrijft nu voor alinea ${activeParagraphNumber} ✍️`;
    noteTextarea.focus();
  } else {
    paragraphs.forEach((p) => p.classList.remove("is-focused"));
    el.classList.add("is-focused");
    activeParaLabel.textContent = `Alinea ${activeParagraphNumber}`;
  }
}

// ─── Event Handlers ───────────────────────────────────────────────────────────
paragraphs.forEach((el) => {
  el.addEventListener("click", () => setParagraphState(el, true));
  el.addEventListener("focus", () => setParagraphState(el, false));
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setParagraphState(el, true);
    } else if (e.key.toLowerCase() === "n") {
      e.preventDefault();
      focusNotes();
    }
  });
});

[document.getElementById("cancel-note"), noteTextarea, notesContainer].forEach(
  (el) => {
    el?.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        returnToText();
      } else if (e.key.toLowerCase() === "n") {
        if (e.target.tagName !== "TEXTAREA" && e.target.tagName !== "INPUT") {
          e.preventDefault();
          focusNotes();
        }
      }
    });
  },
);

noteTextarea?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    document.getElementById("submit")?.click();
  }
});

document.getElementById("cancel-note")?.addEventListener("click", returnToText);
document.getElementById("go-to-notes")?.addEventListener("click", focusNotes);

// ─── Form Submission ──────────────────────────────────────────────────────────
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const noteContent = noteTextarea.value.trim();

  if (!noteContent) {
    noteTextarea.focus();
    noteTextarea.setAttribute("aria-invalid", "true");
    return;
  }
  noteTextarea.removeAttribute("aria-invalid");

  const timestamp = Date.now();
  const noteId = `note-${timestamp}`;
  const contentId = `content-${timestamp}`;
  const dateObj = new Date();

  const newNote = document.createElement("article");
  newNote.className = "note";
  newNote.setAttribute("tabindex", "0");
  newNote.setAttribute("aria-labelledby", `${noteId} ${contentId}`);
  if (activeParagraphId) {
    newNote.dataset.paraId = activeParagraphId;
  }

  const paraLabel = activeParagraphNumber
    ? `Alinea ${activeParagraphNumber}`
    : "Algemene notitie";

  newNote.innerHTML = `
    <header class="note-header"><h3 id="${noteId}" class="note-para-label">${paraLabel}</h3></header>
    <div class="note-content-container">
      <p id="${contentId}" class="note-content">${noteContent}</p>
    </div>
    <div class="note-edit-container" hidden>
      <textarea class="note-edit-textarea" aria-label="Bewerk notitie voor ${paraLabel}"></textarea>
      <div class="note-edit-actions">
        <button type="button" class="note-save-btn">Opslaan</button>
        <button type="button" class="note-cancel-btn btn-secondary">Annuleren</button>
      </div>
    </div>
    <footer class="note-footer">
      <time datetime="${dateObj.toISOString().split("T")[0]}">
        <span class="sr-only">Notitie gemaakt op: </span>${dateObj.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
      </time>
      <div class="note-actions">
        <button class="note-edit-btn" aria-label="Bewerk notitie voor ${paraLabel}" type="button">Bewerken</button>
        <button class="note-delete-btn" aria-label="Verwijder notitie voor ${paraLabel}" type="button">Verwijder</button>
      </div>
    </footer>
  `;

  const contentContainer = newNote.querySelector(".note-content-container");
  const contentP = newNote.querySelector(".note-content");
  const editContainer = newNote.querySelector(".note-edit-container");
  const editTextarea = newNote.querySelector(".note-edit-textarea");
  const editBtn = newNote.querySelector(".note-edit-btn");
  const saveBtn = newNote.querySelector(".note-save-btn");
  const cancelBtn = newNote.querySelector(".note-cancel-btn");
  const footer = newNote.querySelector(".note-footer");
  let currentRawText = noteContent;

  editBtn.addEventListener("click", () => {
    editTextarea.value = currentRawText;
    contentContainer.hidden = true;
    footer.hidden = true;
    editContainer.hidden = false;
    editTextarea.focus();
  });

  editTextarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveBtn.click();
    } else if (e.key === "Escape") {
      e.preventDefault();
      stopEditing();
    }
  });

  const stopEditing = () => {
    editContainer.hidden = true;
    contentContainer.hidden = false;
    footer.hidden = false;
    editBtn.focus();
  };

  cancelBtn.addEventListener("click", stopEditing);

  saveBtn.addEventListener("click", () => {
    const updatedContent = editTextarea.value.trim();
    if (!updatedContent) {
      editTextarea.setAttribute("aria-invalid", "true");
      editTextarea.focus();
      return;
    }
    editTextarea.removeAttribute("aria-invalid");
    currentRawText = updatedContent;
    contentP.innerHTML = currentRawText;
    stopEditing();
  });

  newNote.querySelector(".note-delete-btn").addEventListener("click", () => {
    newNote.remove();
    updateEmptyState();
    updateNoteIndicators();
  });

  notesContainer.appendChild(newNote);
  updateEmptyState();
  updateNoteIndicators();
  newNote.scrollIntoView({ behavior: "instant", block: "nearest" });
  noteTextarea.value = "";

  // Go to next paragraph automatically
  if (activeParagraphId) {
    const currentEl = document.getElementById(activeParagraphId);
    const currentIndex = Array.from(paragraphs).indexOf(currentEl);
    if (currentIndex !== -1 && currentIndex + 1 < paragraphs.length) {
      const nextEl = paragraphs[currentIndex + 1];
      setParagraphState(nextEl, true);
      return;
    }
  }
  returnToText();
});
