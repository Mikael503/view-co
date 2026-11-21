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

  const mobileNav = window.matchMedia("(max-width: 860px)");

  /* Menu fermé sur mobile : retiré de l'ordre de tabulation et des lecteurs d'écran.
     Sur desktop, la navigation reste toujours interactive. */
  const syncNav = () => {
    if (!nav) return;
    const open = mobileNav.matches && nav.classList.contains("is-open");
    if (mobileNav.matches) {
      nav.inert = !open;
      if (open) nav.removeAttribute("aria-hidden");
      else nav.setAttribute("aria-hidden", "true");
    } else {
      nav.inert = false;
      nav.removeAttribute("aria-hidden");
    }
  };

  const closeNav = (restoreFocus) => {
    if (!nav || !burger) return;
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Ouvrir le menu");
    document.body.classList.remove("is-locked");
    syncNav();
    if (restoreFocus) burger.focus();
  };

  const openNav = () => {
    if (!nav || !burger) return;
    nav.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Fermer le menu");
    document.body.classList.add("is-locked");
    syncNav();
    const firstLink = nav.querySelector("a");
    if (firstLink) firstLink.focus();
  };

  if (burger && nav) {
    syncNav();

    burger.addEventListener("click", () => {
      if (nav.classList.contains("is-open")) closeNav(true);
      else openNav();
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeNav(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) closeNav(true);
    });

    const onBreakpoint = () => {
      if (!mobileNav.matches) closeNav(false);
      syncNav();
    };
    if (mobileNav.addEventListener) mobileNav.addEventListener("change", onBreakpoint);
    window.addEventListener("resize", onBreakpoint);
  }

  /* ---------- Services accordion ---------- */
  const services = Array.from(document.querySelectorAll(".service"));

  /* Un panneau replié est visuellement caché (0fr + overflow: hidden) mais
     resterait dans l'arbre d'accessibilité. On le retire donc explicitement
     des lecteurs d'écran et de l'ordre de tabulation. */
  const setPanelState = (service, open) => {
    const panel = service.querySelector(".service__panel");
    if (!panel) return;
    panel.inert = !open;
    if (open) panel.removeAttribute("aria-hidden");
    else panel.setAttribute("aria-hidden", "true");
  };

  services.forEach((service) => {
    setPanelState(service, service.classList.contains("is-open"));

    const toggle = service.querySelector(".service__toggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const willOpen = !service.classList.contains("is-open");

      services.forEach((other) => {
        const otherToggle = other.querySelector(".service__toggle");
        other.classList.remove("is-open");
        if (otherToggle) otherToggle.setAttribute("aria-expanded", "false");
        if (other !== service) setPanelState(other, false);
      });

      if (willOpen) {
        service.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
      }
      setPanelState(service, willOpen);
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

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

      if (!name || !message || !emailOk) {
        if (status) {
          status.textContent = emailOk || !email
            ? "Merci de renseigner votre nom, votre email et votre projet."
            : "Merci de vérifier l’adresse email saisie.";
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

      /* Aucun envoi serveur : la demande est remise à la messagerie du visiteur.
         On ne parle donc jamais d’envoi réussi, et les champs sont conservés
         au cas où aucun client mail ne s’ouvrirait. */
      if (status) {
        status.classList.remove("is-error");
        status.textContent =
          "Merci " + name.split(" ")[0] + ". Votre messagerie s’ouvre avec la demande pré-remplie ; " +
          "si rien ne se passe, écrivez-nous à " + CONTACT_EMAIL + ".";
      }

      window.location.href =
        "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
