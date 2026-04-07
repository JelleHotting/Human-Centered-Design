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
const srLiveRegion = document.getElementById("sr-live");

// ─── Navigation & Selection Helpers ───────────────────────────────────────────
function announceToSR(message) {
  srLiveRegion.textContent = "";
  setTimeout(() => (srLiveRegion.textContent = message), 100);
}

function updateEmptyState() {
  const hasNotes = notesContainer.querySelector("article") !== null;
  notesEmptyMsg.hidden = hasNotes;
}

function returnToText() {
  const el = activeParagraphId ? document.getElementById(activeParagraphId) : paragraphs[0];
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
  activeParagraphNumber = el.querySelector(".para-number").textContent;

  if (isActive) {
    paragraphs.forEach((p) => {
      p.classList.remove("is-active", "is-focused");
      p.setAttribute("aria-selected", "false");
    });
    el.classList.add("is-active");
    el.setAttribute("aria-selected", "true");
    activeParaLabel.textContent = `Alinea ${activeParagraphNumber} geselecteerd`;
    noteTextarea.focus();
  } else {
    paragraphs.forEach((p) => p.classList.remove("is-focused"));
    el.classList.add("is-focused");
    activeParaLabel.textContent = `Alinea ${activeParagraphNumber} in focus — druk Enter om een notitie te maken`;
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

[document.getElementById("cancel-note"), noteTextarea, notesContainer].forEach((el) => {
  el?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      returnToText();
    } else if (e.key.toLowerCase() === "n") {
      e.preventDefault();
      focusNotes();
    }
  });
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

  const paraLabel = activeParagraphNumber ? `Alinea ${activeParagraphNumber}` : "Algemene notitie";

  newNote.innerHTML = `
    <header class="note-header"><h3 id="${noteId}" class="note-para-label">${paraLabel}</h3></header>
    <p id="${contentId}" class="note-content">${noteContent.replace(/[<>&"']/g, m => ({"<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;","'":"&#39;"}[m]))}</p>
    <footer class="note-footer">
      <time datetime="${dateObj.toISOString().split("T")[0]}">
        <span class="sr-only">Notitie gemaakt op: </span>${dateObj.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
      </time>
      <button class="note-delete-btn" aria-label="Verwijder notitie voor ${paraLabel}" type="button">Verwijder</button>
    </footer>
  `;

  newNote.querySelector(".note-delete-btn").addEventListener("click", () => {
    newNote.remove();
    updateEmptyState();
    announceToSR(`Notitie voor ${paraLabel} verwijderd.`);
  });

  notesContainer.appendChild(newNote);
  updateEmptyState();
  newNote.scrollIntoView({ behavior: "instant", block: "nearest" });
  noteTextarea.value = "";
  returnToText();
  announceToSR(`Notitie voor ${paraLabel} opgeslagen.`);
});

// Initial Welcome
window.addEventListener("load", () => {
  setTimeout(() => announceToSR("Welkom bij Socrates. Sneltoetsen: Tab om te navigeren, Enter voor nieuwe notitie, N voor opgeslagen notities, en Escape om weergaves te sluiten."), 800);
});

