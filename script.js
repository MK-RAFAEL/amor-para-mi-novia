const ACCESS_PARAM = "access";
const ACCESS_HASH =
  "3ff561239f3dcce343fba3c51c4f5e1b6bb89e28b211a137aff5f17f479e9c15";

const revealElements = document.querySelectorAll(".reveal");
const quotePanels = document.querySelectorAll(".quote-panel");
const noteModal = document.getElementById("noteModal");
const privatePanel = document.getElementById("privatePanel");
const accessGate = document.getElementById("accessGate");
const accessForm = document.getElementById("accessForm");
const accessInput = document.getElementById("accessInput");
const accessStatus = document.getElementById("accessStatus");
const openNoteButton = document.querySelector("[data-open-note]");
const closeNoteButtons = document.querySelectorAll("[data-close-note]");
const openPrivateButtons = document.querySelectorAll("[data-open-private]");
const closePrivateButtons = document.querySelectorAll("[data-close-private]");

const getSearchAccess = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get(ACCESS_PARAM)?.trim() || "";
};

const hashText = async (value) => {
  const buffer = await window.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );

  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const setAccessMessage = (message, isError = false) => {
  if (!accessStatus) {
    return;
  }

  accessStatus.textContent = message;
  accessStatus.classList.toggle("is-error", isError);
};

const unlockSite = () => {
  document.body.classList.remove("access-pending");

  if (accessGate) {
    accessGate.setAttribute("aria-hidden", "true");
  }
};

const lockSite = () => {
  document.body.classList.add("access-pending");

  if (accessGate) {
    accessGate.setAttribute("aria-hidden", "false");
  }
};

const validateAccess = async (rawValue) => {
  if (!rawValue) {
    return false;
  }

  const hashedValue = await hashText(rawValue);
  return hashedValue === ACCESS_HASH;
};

const syncBodyScroll = () => {
  const hasOpenOverlay = [noteModal, privatePanel].some(
    (element) => element && element.classList.contains("is-visible")
  );

  document.body.style.overflow = hasOpenOverlay || document.body.classList.contains("access-pending")
    ? "hidden"
    : "";
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

if (accessForm && accessInput) {
  accessForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submittedValue = accessInput.value.trim();
    const isValid = await validateAccess(submittedValue);

    if (!isValid) {
      setAccessMessage("Clave invalida. Usa el enlace privado completo.", true);
      accessInput.focus();
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set(ACCESS_PARAM, submittedValue);
    window.location.replace(url.toString());
  });
}

const initializeAccess = async () => {
  const accessValue = getSearchAccess();
  const isValid = await validateAccess(accessValue);

  if (isValid) {
    unlockSite();
    syncBodyScroll();
    return;
  }

  lockSite();
  syncBodyScroll();
  setAccessMessage("Acceso bloqueado. Solo entra quien tenga el enlace privado.", true);

  if (accessInput) {
    accessInput.value = "";
    accessInput.focus();
  }
};

initializeAccess();
