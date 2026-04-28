const revealElements = document.querySelectorAll(".reveal");
const quotePanels = document.querySelectorAll(".quote-panel");
const noteModal = document.getElementById("noteModal");
const openNoteButton = document.querySelector("[data-open-note]");
const closeNoteButtons = document.querySelectorAll("[data-close-note]");

if (revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

if (quotePanels.length > 1) {
  let activeQuote = 0;

  window.setInterval(() => {
    quotePanels[activeQuote].classList.remove("is-active");
    activeQuote = (activeQuote + 1) % quotePanels.length;
    quotePanels[activeQuote].classList.add("is-active");
  }, 3800);
}

const toggleModal = (shouldOpen) => {
  if (!noteModal) {
    return;
  }

  noteModal.classList.toggle("is-visible", shouldOpen);
  noteModal.setAttribute("aria-hidden", String(!shouldOpen));
  document.body.style.overflow = shouldOpen ? "hidden" : "";
};

if (openNoteButton) {
  openNoteButton.addEventListener("click", () => toggleModal(true));
}

closeNoteButtons.forEach((button) => {
  button.addEventListener("click", () => toggleModal(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    toggleModal(false);
  }
});
