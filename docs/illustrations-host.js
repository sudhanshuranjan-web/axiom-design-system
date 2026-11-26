/* Hosts hairline figures inside the design system. It does what the hairline
   bench does for one figure (inject the kernel's styles, make the svg, own the
   read-out and the play tour) for every [data-hl-mount] on the page. The kernel
   (illustrations/hairline-kernel.js) is included unchanged; the figures are the
   files the hairline skill built and checked. Colours come from AXIOM tokens
   through the kernel's own --hairline-* variables (see showcase.css). */
(function () {
  "use strict";
  const RULES = ["hit", "order", "reach", "accent", "rest", "honesty", "cost", "clock", "radius", "quiet"];
  const figures = {};
  window.hairline = (figure) => { figures[figure.name] = figure; };

  function mountAll() {
    if (!window.HL) return;
    HL.inject(document);
    document.querySelectorAll("[data-hl-mount]").forEach((box) => {
      const f = figures[box.dataset.hlMount];
      if (!f || box.dataset.hlMounted) return;
      box.dataset.hlMounted = "1";
      const stage = box.querySelector(".ds-hl__stage"), readEl = box.querySelector("[data-hl-read]");
      stage.setAttribute("data-hairline", f.name);
      stage.setAttribute("role", "img");
      stage.setAttribute("aria-label", f.means);
      const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
      let text = null;
      const read = {
        get textContent() { return text; },
        set textContent(v) { text = v == null ? "" : String(v); readEl.textContent = text; },
      };
      box.querySelector("[data-hl-means]").textContent = f.means;
      box.querySelector("[data-hl-rules]").textContent = f.rules.map((n) => String(n).padStart(2, "0") + " " + RULES[n - 1]).join(" · ");
      f.mount({ stage, svg, read }, f.range[1]);
      if (text === null) read.textContent = "rest";
      const play = box.querySelector("[data-hl-play]");
      let tour = null;
      play.addEventListener("click", () => {
        const on = play.getAttribute("aria-pressed") !== "true";
        if (tour) { tour.stop(); tour = null; }
        if (on) tour = HL.tour(stage, f.tour || HL.LAP, () => {});
        play.setAttribute("aria-pressed", String(on));
        play.querySelector(".lucide, i") && (play.innerHTML = on ? '<i data-lucide="pause"></i>Stop tour' : '<i data-lucide="play"></i>Play tour');
        window.Axiom && Axiom.icons(play);
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAll); else setTimeout(mountAll);
})();
