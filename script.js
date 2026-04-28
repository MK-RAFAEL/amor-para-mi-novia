const revealElements = document.querySelectorAll(".reveal");
const quotePanels = document.querySelectorAll(".quote-panel");
const noteModal = document.getElementById("noteModal");
const privatePanel = document.getElementById("privatePanel");
const openNoteButton = document.querySelector("[data-open-note]");
const closeNoteButtons = document.querySelectorAll("[data-close-note]");
const openPrivateButtons = document.querySelectorAll("[data-open-private]");
const closePrivateButtons = document.querySelectorAll("[data-close-private]");

const syncBodyScroll = () => {
  const hasOpenOverlay = [noteModal, privatePanel].some(
    (element) => element && element.classList.contains("is-visible")
  );

  document.body.style.overflow = hasOpenOverlay ? "hidden" : "";
};

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
  syncBodyScroll();
};

const syncPrivateHash = (shouldOpen) => {
  const cleanUrl = `${window.location.pathname}${window.location.search}`;

  if (shouldOpen) {
    if (window.location.hash !== "#rincon") {
      window.history.replaceState(null, "", `${cleanUrl}#rincon`);
    }

    return;
  }

  if (window.location.hash === "#rincon") {
    window.history.replaceState(null, "", cleanUrl);
  }
};

const togglePrivatePanel = (shouldOpen, updateHash = true) => {
  if (!privatePanel) {
    return;
  }

  privatePanel.classList.toggle("is-visible", shouldOpen);
  privatePanel.setAttribute("aria-hidden", String(!shouldOpen));

  if (updateHash) {
    syncPrivateHash(shouldOpen);
  }

  syncBodyScroll();
};

if (openNoteButton) {
  openNoteButton.addEventListener("click", () => toggleModal(true));
}

closeNoteButtons.forEach((button) => {
  button.addEventListener("click", () => toggleModal(false));
});

openPrivateButtons.forEach((button) => {
  button.addEventListener("click", () => togglePrivatePanel(true));
});

closePrivateButtons.forEach((button) => {
  button.addEventListener("click", () => togglePrivatePanel(false));
});

window.addEventListener("hashchange", () => {
  togglePrivatePanel(window.location.hash === "#rincon", false);
});

togglePrivatePanel(window.location.hash === "#rincon", false);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    togglePrivatePanel(false);
    toggleModal(false);
  }
});
