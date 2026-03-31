const form = document.querySelector(".input-container");
const notesContainer = document.querySelector(".notes-container");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const titleValue = document.getElementById("title").value;
  const authorValue = document.getElementById("author").value;
  const pageValue = document.getElementById("page").value;
  const noteContentValue = document.getElementById("note").value;
  const dateValue = document.getElementById("date").value;

  const timestamp = Date.now();
  const noteId = `note-title-${timestamp}`;

  const newNote = document.createElement("article");
  newNote.classList.add("note");
  newNote.setAttribute("aria-labelledby", noteId);

  const displayDate = dateValue
    ? new Date(dateValue).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
  const attrDate = dateValue || new Date().toISOString().split("T")[0];

  newNote.innerHTML = `
    <h2 id="${noteId}">${titleValue}</h2>
    <div class="note-meta">
        <p><span class="sr-only">Auteur: </span>${authorValue}</p>
        <p>Pagina ${pageValue}</p>
    </div>
    <p>${noteContentValue}</p>
    <footer>
        <time datetime="${attrDate}">
            <span class="sr-only">Notitie gemaakt op: </span>${displayDate}
        </time>
    </footer>
  `;

  notesContainer.prepend(newNote);

  form.reset();

  document.getElementById("title").focus();
});
