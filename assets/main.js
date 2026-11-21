/* VIEW.co — interactions */
(function () {
  "use strict";

  const CONTACT_EMAIL = "viewco205@gmail.com";

  /* Envoi réel du formulaire : le service relaie la demande vers CONTACT_EMAIL
     sans passer par la messagerie du visiteur. L'adresse est déjà publique sur
     le site, il n'y a donc aucun secret dans cette constante. */
  const FORM_ENDPOINT = "https://formsubmit.co/ajax/" + CONTACT_EMAIL;

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

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const submitHtml = submitBtn ? submitBtn.innerHTML : "";

  /* Repli : lien mailto cliquable, jamais ouvert automatiquement. */
  const showStatus = (text, isError, fallbackUrl) => {
    if (!status) return;
    status.textContent = text;
    status.classList.toggle("is-error", Boolean(isError));
    if (!fallbackUrl) return;
    const link = document.createElement("a");
    link.href = fallbackUrl;
    link.textContent = CONTACT_EMAIL;
    status.append(" ");
    status.append(link);
  };

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const company = String(data.get("company") || "").trim();
      const need = String(data.get("need") || "").trim();
      const message = String(data.get("message") || "").trim();
      const honey = String(data.get("_honey") || "").trim();

      /* Champ piège rempli : c’est un robot, on n’envoie rien et on n’annonce
         aucun succès. Un visiteur qui déclencherait le piège par autofill garde
         la possibilité de réessayer ou d’écrire directement. */
      if (honey) {
        showStatus("Merci de réessayer : le formulaire n’a pas pu être envoyé.", true);
        return;
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

      if (!name || !message || !emailOk) {
        showStatus(
          emailOk || !email
            ? "Merci de renseigner votre nom, votre email et votre projet."
            : "Merci de vérifier l’adresse email saisie.",
          true
        );
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
      const fallbackUrl =
        "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi en cours…";
      }
      showStatus("Envoi de votre demande…", false);

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name: name,
            email: email,
            company: company || "—",
            need: need,
            message: message,
            _subject: subject,
            _template: "table",
            _honey: "",
          }),
        });

        /* Ce service répond 200 même en cas de refus : seul success === "true"
           prouve que la demande a été acceptée puis envoyée. */
        const result = await response.json().catch(() => ({}));
        if (!response.ok || String(result.success) !== "true") {
          throw new Error(String(result.message || "HTTP " + response.status));
        }

        form.reset();
        showStatus(
          "Merci " + name.split(" ")[0] +
            ". Votre demande est bien arrivée ; nous répondons sous 24 h ouvrées.",
          false
        );
      } catch (error) {
        /* Aucun message de réussite si l’envoi a échoué : les champs restent
           remplis et l’adresse email est proposée en repli. */
        console.error("Envoi du formulaire impossible :", error);
        showStatus("L’envoi n’a pas abouti. Réessayez dans un instant, ou écrivez-nous à", true, fallbackUrl);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitHtml;
        }
      }
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
