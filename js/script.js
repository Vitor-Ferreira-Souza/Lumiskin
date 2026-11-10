const navLinks = [...document.querySelectorAll(".nav-links a")];
const observedSections = [...new Set(
    navLinks
        .map((link) => link.getAttribute("href"))
        .filter((href) => href && href.startsWith("#"))
        .map((href) => document.querySelector(href))
        .filter(Boolean)
      )];

function updateActiveNavigation() {
    const headerHeight = document.querySelector(".topbar")?.offsetHeight || 0;
    const activationLine = headerHeight + window.innerHeight * 0.28;
    let currentSection = observedSections[0];

observedSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= activationLine) {
        currentSection = section;
    }
});

navLinks.forEach((link) => {
    link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${currentSection.id}`
    );
});

}

window.addEventListener("scroll", updateActiveNavigation, { passive: true });
window.addEventListener("resize", updateActiveNavigation);
updateActiveNavigation();

document.querySelectorAll("[data-reason-picker]").forEach((picker) => {
    const select = picker.querySelector(".reason-native-select");
    const trigger = picker.querySelector(".reason-picker-trigger");
    const label = picker.querySelector("[data-reason-label]");
    const listbox = picker.querySelector(".reason-options");
    const options = [...picker.querySelectorAll(".reason-option")];

    function closeOptions() {
        listbox.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
    }

    function openOptions(focusOption = false) {
        listbox.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
        if (focusOption) {
            const selectedOption = options.find((option) => option.dataset.value === select.value);
            (selectedOption || options[0])?.focus();
        }
    }

    function chooseOption(option) {
        select.value = option.dataset.value;
        label.textContent = option.textContent;
        trigger.removeAttribute("aria-invalid");
        options.forEach((item) => {
            item.setAttribute("aria-selected", String(item === option));
        });
        select.dispatchEvent(new Event("change", { bubbles: true }));
        closeOptions();
        trigger.focus();
    }

    trigger.addEventListener("click", () => {
        if (listbox.hidden) {
            openOptions();
        } else {
            closeOptions();
        }
    });

    trigger.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openOptions(true);
        }
    });

    options.forEach((option, index) => {
        option.addEventListener("click", () => chooseOption(option));
        option.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                chooseOption(option);
            } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                const direction = event.key === "ArrowDown" ? 1 : -1;
                options[(index + direction + options.length) % options.length].focus();
            } else if (event.key === "Home" || event.key === "End") {
                event.preventDefault();
                options[event.key === "Home" ? 0 : options.length - 1].focus();
            } else if (event.key === "Escape") {
                closeOptions();
                trigger.focus();
            }
        });
    });

    select.addEventListener("invalid", (event) => {
        event.preventDefault();
        trigger.setAttribute("aria-invalid", "true");
        openOptions();
        trigger.focus();
    });

    document.addEventListener("click", (event) => {
        if (!picker.contains(event.target)) {
            closeOptions();
        }
    });
});