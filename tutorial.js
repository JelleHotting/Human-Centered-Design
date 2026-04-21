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
  tutorialMessage.innerHTML = msg;
  // Klein animatietje
  tutorialMessage.parentElement.style.transform = 'translate(-50%, 10px)';
  setTimeout(() => {
    tutorialMessage.parentElement.style.transform = 'translate(-50%, 0)';
  }, 150);
}

// ─── Initialization ───────────────────────────────────────────────────────────
readingPane.classList.remove("dimmed");
noteArea.disabled = true;
submitBtn.disabled = true;

// Clicks worden nu via CSS en inert afgehandeld.

// ─── Keydown Locks & Logic ────────────────────────────────────────────────────
document.addEventListener("keydown", (e) => {
  
  if (currentPhase === 1) {
    // Check op pure navigatie flow. We blokkeren niet randzaken die de SR nodig heeft.
    if (e.key === "Tab") {
      e.preventDefault();
      paragraph.focus();
      paragraph.classList.add("is-focused");
      currentPhase = 2;
      updateTutorialMessage("Goed zo! Nu je de alinea in focus hebt, druk op <kbd>Enter</kbd> om een notitie te maken.");
    }
    return;
  }

  if (currentPhase === 2) {
    // We are focused on paragraph. Only allow Enter for action, Tab is trapped
    if (e.key === "Tab") {
        e.preventDefault(); // restrict moving away
    } else if (e.key === "Enter") {
      e.preventDefault();
      paragraph.classList.add("is-active");
      activeParaLabel.textContent = "Je schrijft nu voor alinea 1 ✍️";
      
      formSection.classList.remove("dimmed");
      formSection.removeAttribute("inert");
      noteArea.disabled = false;
      submitBtn.disabled = false;
      
      noteArea.focus();
      currentPhase = 3;
      updateTutorialMessage("Perfect! Typ een korte test-notitie in het tekstvak en druk op <kbd>Enter</kbd> om op te slaan.");
    }
    return;
  }

  if (currentPhase === 3) {
    // User is in textarea. Allow typing. Enter submits.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitBtn.click();
    } else if (e.key === "Tab" || e.key === "Escape") {
      e.preventDefault(); // Lock them in textarea for tutorial
    }
    return;
  }

  if (currentPhase === 4) {
    // Waiting for 'n' or 'N'
    if (e.key.toLowerCase() === "n") {
      e.preventDefault();
      notesContainer.classList.remove("dimmed");
      notesContainer.removeAttribute("inert");
      document.getElementById("notes-title").focus();
      currentPhase = 5;
      
      // End of tutorial
      updateTutorialMessage('Geweldig! Je kent nu de basis. <br><br> <span style="font-size: 0.9rem; font-weight: normal;">Je wordt automatisch doorgestuurd... (of druk op <kbd>Enter</kbd>)</span>');
      
      const skipBtn = document.querySelector('.skip-btn');
      if(skipBtn) skipBtn.remove();

      // Automatische tijds-redirect
      window.tutorialRedirectTimeout = setTimeout(() => {
        window.location.href = 'lezen.html';
      }, 3500);

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
  dummyNote.innerHTML = `
    <header class="note-header"><h3 class="note-para-label">Alinea 1</h3></header>
    <div class="note-content-container"><p class="note-content">${content}</p></div>
  `;
  document.getElementById("notes-empty").hidden = true;
  notesContainer.appendChild(dummyNote);
  
  noteArea.value = "";
  noteArea.disabled = true;
  submitBtn.disabled = true;
  formSection.classList.add("dimmed");
  formSection.setAttribute("inert", "");
  paragraph.classList.remove("is-active");
  paragraph.classList.remove("is-focused");
  paragraph.blur();

  currentPhase = 4;
  updateTutorialMessage("Opgeslagen! Druk nu ergens op <kbd>N</kbd> om snel naar je notities te springen.");
});
