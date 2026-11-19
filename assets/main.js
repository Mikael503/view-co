/* VIEW.co — interactions */
(function () {
  "use strict";

  const CONTACT_EMAIL = "viewco205@gmail.com";

  /* ---------- Header state ---------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile navigation ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("primaryNav");

  const closeNav = () => {
    if (!nav || !burger) return;
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Ouvrir le menu");
    document.body.classList.remove("is-locked");
  };

  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      document.body.classList.toggle("is-locked", open);
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* ---------- Services accordion ---------- */
  const services = Array.from(document.querySelectorAll(".service"));

  services.forEach((service) => {
    const toggle = service.querySelector(".service__toggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const willOpen = !service.classList.contains("is-open");

      services.forEach((other) => {
        const otherToggle = other.querySelector(".service__toggle");
        other.classList.remove("is-open");
        if (otherToggle) otherToggle.setAttribute("aria-expanded", "false");
      });

      if (willOpen) {
        service.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Scroll reveals ---------- */
  const revealItems = document.querySelectorAll("[data-reveal]");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("is-in"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    revealItems.forEach((el) => observer.observe(el));
  }

  /* ---------- Contact form (mailto handoff) ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const company = String(data.get("company") || "").trim();
      const need = String(data.get("need") || "").trim();
      const message = String(data.get("message") || "").trim();

      if (!name || !email || !message) {
        if (status) {
          status.textContent = "Merci de renseigner votre nom, votre email et votre projet.";
          status.classList.add("is-error");
        }
        return;
      }

      const subject = "Nouvelle demande — " + (company || name);
      const body = [
        "Nom : " + name,
        "Email : " + email,
        "Entreprise : " + (company || "—"),
        "Besoin : " + need,
        "",
        message,
      ].join("\n");

      window.location.href =
        "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      if (status) {
        status.classList.remove("is-error");
        status.textContent = "Merci " + name.split(" ")[0] + ", votre message s’ouvre dans votre messagerie.";
      }
      form.reset();
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
