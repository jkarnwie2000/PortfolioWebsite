document.documentElement.classList.add("js");

const EMAILJS = {
    publicKey: "476QBa57rXxhABYJa",
    serviceId: "service_56y7j1g",
    templateId: "template_87bdkhg",
};
const DIRECT_EMAIL = "jkarnwie2000@yahoo.com";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Theme ---------- */
function currentTheme() {
    // Dark is the default; light is opt-in through the toggle.
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#08100E" : "#EFEADF");
    try { localStorage.setItem("jk-theme", theme); } catch (e) { /* storage unavailable */ }
}

document.querySelector(".theme-toggle").addEventListener("click", () => {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
});

/* ---------- Mobile nav ---------- */
const navToggle = document.querySelector(".nav__toggle");
const navList = document.getElementById("nav-list");

function setNav(open) {
    navList.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
navToggle.addEventListener("click", () => setNav(!navList.classList.contains("is-open")));
navList.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });

/* ---------- Ask-my-portfolio console ---------- */
const ANSWERS = {
    stack: {
        q: "What do you build?",
        a: "Production web apps, end to end. React and Next.js interfaces in TypeScript, serverless APIs on Vercel, and integrations with AI image analysis, Stripe payments, Resend email and Firebase auth.",
    },
    ai: {
        q: "Show me AI work",
        a: "Skinstric AI. Users capture or upload a headshot, I send it to an image-analysis API and show age, race and sex predictions with confidence scores. I built it from a Figma spec in Next.js and TypeScript during a remote internship. The live demo is in Work, just below.",
    },
    ship: {
        q: "How do you ship?",
        a: "I use a Git and GitHub flow, run ESLint in GitHub Actions on every push and PR, write component tests in Vitest and React Testing Library, and deploy everything on Vercel. AI assistants speed me up, and I still review and test their output before it ships.",
    },
    hire: {
        q: "Are you available?",
        a: "Yes. I'm open to full-time Full-Stack or AI Developer roles, remote or around Roanoke, VA. The fastest way to reach me is the form at the bottom of this page or " + DIRECT_EMAIL + ".",
    },
};

const qEl = document.getElementById("console-q");
const aEl = document.getElementById("console-a");
const chips = document.querySelectorAll(".chip");
let typingTimer = null;

function ask(key) {
    const item = ANSWERS[key];
    if (!item) return;

    chips.forEach((c) => c.classList.toggle("is-active", c.dataset.q === key));
    clearInterval(typingTimer);
    qEl.textContent = item.q;

    if (reduceMotion) {
        aEl.classList.remove("is-typing");
        aEl.textContent = item.a;
        return;
    }

    aEl.textContent = "";
    aEl.classList.add("is-typing");
    let i = 0;
    typingTimer = setInterval(() => {
        i += 2;
        aEl.textContent = item.a.slice(0, i);
        if (i >= item.a.length) {
            clearInterval(typingTimer);
            aEl.classList.remove("is-typing");
        }
    }, 18);
}

chips.forEach((chip) => chip.addEventListener("click", () => ask(chip.dataset.q)));
// Start with one answer so the console never looks empty.
setTimeout(() => ask("stack"), reduceMotion ? 0 : 700);

/* ---------- Project filters ---------- */
const filters = document.querySelectorAll(".filter");
const tiles = document.querySelectorAll(".tile");

filters.forEach((btn) => {
    btn.addEventListener("click", () => {
        const f = btn.dataset.filter;
        filters.forEach((b) => {
            const on = b === btn;
            b.classList.toggle("is-active", on);
            b.setAttribute("aria-pressed", String(on));
        });
        tiles.forEach((t) => {
            const show = f === "all" || t.dataset.tags.split(" ").includes(f);
            t.classList.toggle("is-hidden", !show);
            if (show) t.classList.add("is-in");
        });
    });
});

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-in");
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
} else {
    revealEls.forEach((el) => el.classList.add("is-in"));
}

/* ---------- Contact form (EmailJS) ---------- */
const form = document.getElementById("contact__form");
const statusEl = form.querySelector(".form__status");
const submitBtn = document.getElementById("contact__submit");
const submitLabel = submitBtn.querySelector(".btn__label");

function setStatus(msg, isError) {
    statusEl.textContent = msg;
    statusEl.classList.toggle("is-error", Boolean(isError));
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    let valid = true;
    form.querySelectorAll("input, textarea").forEach((field) => {
        const ok = field.checkValidity() && field.value.trim() !== "";
        field.closest(".field").classList.toggle("is-invalid", !ok);
        if (!ok) valid = false;
    });
    if (!valid) {
        setStatus("Please fill in your name, a valid email and a message.", true);
        return;
    }

    if (typeof emailjs === "undefined") {
        setStatus("The message service didn't load. Please email " + DIRECT_EMAIL + ".", true);
        return;
    }

    submitBtn.disabled = true;
    submitLabel.textContent = "Sending…";
    setStatus("");

    emailjs
        .sendForm(EMAILJS.serviceId, EMAILJS.templateId, form, { publicKey: EMAILJS.publicKey })
        .then(() => {
            form.reset();
            setStatus("Message sent. Thank you! I'll get back to you soon.");
        })
        .catch(() => {
            setStatus("The email service is temporarily unavailable. Please email " + DIRECT_EMAIL + ".", true);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitLabel.textContent = "Send message";
        });
});

/* ---------- Back to top ----------
   #top is the sticky header, which the browser treats as already in view,
   and a focused form field can keep the page pinned. Scroll the window directly. */
document.querySelectorAll('a[href="#top"]').forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur(); // closes the message box / mobile keyboard
        }
        setNav(false);
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        if (location.hash) history.replaceState(null, "", location.pathname + location.search);
        // Keep keyboard users at the top of the page without a second jump.
        document.querySelector(".brand").focus({ preventScroll: true });
    });
});

/* ---------- Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
