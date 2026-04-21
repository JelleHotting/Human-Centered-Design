// ─── Tutorial State ────────────────────────────────────────────────────────────
let currentPhase = 1;
// Phases:
// 1: Wait for Tab to focus paragraph
// 2: Wait for Enter to open note form
// 3: Wait for text input and Submit (Enter or click)
// 4: Wait for N to open notes
// 5: Finished

const readingPane = document.getElementById("tut-reading-pane");
const formSection = document.getElementById("tut-form-section");
const notesContainer = document.getElementById("tut-notes-container");
const tutorialMessage = document.getElementById("tutorial-message");

const paragraph = document.getElementById("para-1");
const noteArea = document.getElementById("note");
const submitBtn = document.getElementById("submit");
const form = document.getElementById("note-form");
const activeParaLabel = document.getElementById("active-para-label");

function updateTutorialMessage(msg) {
  // We use textContent for the SR to avoid reading HTML tags, but innerHTML for the visual kbd tags.
  // The alert role on the container will handle the announcement.
  tutorialMessage.innerHTML = msg;
  
  // Klein animatietje voor visuele feedback
  tutorialMessage.parentElement.style.transform = 'translate(-50%, 10px)';
  setTimeout(() => {
    tutorialMessage.parentElement.style.transform = 'translate(-50%, 0)';
  }, 150);
}

// ─── Initialization ───────────────────────────────────────────────────────────
readingPane.classList.remove("dimmed");
readingPane.removeAttribute("aria-hidden");

// Initially hide other sections from SR
formSection.setAttribute("aria-hidden", "true");
notesContainer.setAttribute("aria-hidden", "true");

noteArea.disabled = true;
submitBtn.disabled = true;

// ─── Phase Transitions ────────────────────────────────────────────────────────
function startPhase2() {
  if (currentPhase !== 1) return;
  paragraph.classList.add("is-focused");
  paragraph.setAttribute("aria-label", "Alinea 1. Geselecteerd. Druk op Enter om een notitie te maken.");
  currentPhase = 2;
  updateTutorialMessage("Goed zo! De alinea is nu geselecteerd. Druk op <kbd>Enter</kbd> om een notitie te maken.");
}

function startPhase3() {
  if (currentPhase !== 2) return;
  paragraph.classList.add("is-active");
  paragraph.removeAttribute("aria-label"); 
  
  activeParaLabel.textContent = "Je schrijft nu voor alinea 1 ✍️";
  
  formSection.classList.remove("dimmed");
  formSection.removeAttribute("inert");
  formSection.removeAttribute("aria-hidden");
  
  readingPane.setAttribute("aria-hidden", "true");
  
  noteArea.disabled = false;
  submitBtn.disabled = false;
  
  noteArea.focus();
  currentPhase = 3;
  updateTutorialMessage("Perfect! Het tekstvak is nu actief. Typ een korte notitie en druk op <kbd>Enter</kbd> om op te slaan.");
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
paragraph.addEventListener("focus", startPhase2);
paragraph.addEventListener("click", () => {
    if (currentPhase === 1) startPhase2();
    else if (currentPhase === 2) startPhase3();
});

// ─── Keydown Locks & Logic ────────────────────────────────────────────────────
document.addEventListener("keydown", (e) => {
  
  if (currentPhase === 1) {
    if (e.key === "Tab") {
      e.preventDefault();
      paragraph.focus(); // Triggers startPhase2 via focus event
    } else if (e.key === "Enter") {
        e.preventDefault();
        startPhase2();
        // Optioneel: direct door naar phase 3? Nee, volg de tutorial stappen.
    }
    return;
  }

  if (currentPhase === 2) {
    if (e.key === "Tab") {
        e.preventDefault(); 
    } else if (e.key === "Enter") {
      e.preventDefault();
      startPhase3();
    }
    return;
  }

  if (currentPhase === 3) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitBtn.click();
    } else if (e.key === "Tab" || e.key === "Escape") {
      e.preventDefault(); 
    }
    return;
  }

  if (currentPhase === 4) {
    if (e.key.toLowerCase() === "n") {
      e.preventDefault();
      
      // Unlock Notes for SR
      notesContainer.classList.remove("dimmed");
      notesContainer.removeAttribute("inert");
      notesContainer.removeAttribute("aria-hidden");
      
      // Focus the title of notes
      const notesTitle = document.getElementById("notes-title");
      notesTitle.focus();
      
      currentPhase = 5;
      updateTutorialMessage('Geweldig! Je hebt je eerste notitie bekeken. Je kent nu de basis. <br><br> <span style="font-size: 0.9rem; font-weight: normal;">Je wordt nu doorgestuurd naar de echte tekst...</span>');
      
      const skipBtn = document.querySelector('.skip-btn');
      if(skipBtn) skipBtn.remove();

      window.tutorialRedirectTimeout = setTimeout(() => {
        window.location.href = 'lezen.html';
      }, 4000);
    }
    return;
  }

  if (currentPhase === 5) {
    if (e.key === "Enter") {
      e.preventDefault();
      clearTimeout(window.tutorialRedirectTimeout);
      window.location.href = 'lezen.html';
    }
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (currentPhase !== 3) return;

  const content = noteArea.value.trim() || 'Dit is een proefnotitie!';
  
  // Create dummy note visually
  const dummyNote = document.createElement("article");
  dummyNote.className = "note";
  dummyNote.setAttribute("role", "listitem");
  dummyNote.innerHTML = `
    <header class="note-header"><h3 class="note-para-label">Alinea 1</h3></header>
    <div class="note-content-container"><p class="note-content">${content}</p></div>
  `;
  notesContainer.appendChild(dummyNote);
  
  noteArea.value = "";
  noteArea.disabled = true;
  submitBtn.disabled = true;
  
  // Visual dim and SR lock for form
  formSection.classList.add("dimmed");
  formSection.setAttribute("inert", "");
  formSection.setAttribute("aria-hidden", "true");
  
  // Re-enable reading pane visually (keep it dimmed or not?)
  // User wants to keep dimmed text, so let's keep reading pane active for SR but visually still "tutorial style"
  readingPane.removeAttribute("aria-hidden");
  
  paragraph.classList.remove("is-active");
  paragraph.classList.remove("is-focused");
  paragraph.blur();

  currentPhase = 4;
  updateTutorialMessage("Notitie opgeslagen! De tekst is weer beschikbaar. Druk nu op de letter <kbd>N</kbd> om naar je opgeslagen notities te gaan.");
});
