/* ASTRALIX — interações */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sem storage */ } },
  };

  /* ---------- Intro ---------- */
  const done = () => document.documentElement.classList.add("is-loaded");
  addEventListener("load", () => setTimeout(done, reduced ? 0 : 500));
  setTimeout(done, 2800); // nunca prende o visitante

  /* ---------- Navegação ---------- */
  const nav = $("#nav");
  const burger = $("#burger");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.setProperty("--d", `${Math.min(sibs.indexOf(el), 6) * 0.08}s`);
    io.observe(el);
  });

  /* ---------- Brilho do cursor ---------- */
  const glow = $(".cursor-glow");
  let mx = innerWidth / 2, my = innerHeight / 2;
  if (matchMedia("(hover: hover)").matches && !reduced) {
    let gx = mx, gy = my;
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    const follow = () => {
      gx += (mx - gx) * 0.12; gy += (my - gy) * 0.12;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      requestAnimationFrame(follow);
    };
    follow();
  }

  /* ---------- Vórtice de estrelas (hero) ---------- */
  const canvas = $("#stars");
  const ctx = canvas.getContext("2d");
  const hero = $(".hero");
  let W, H, stars = [], heroVisible = true;
  const COLORS = ["243,226,140", "214,189,79", "201,168,255", "139,77,255", "255,63,164", "255,255,255"];
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.width = hero.offsetWidth * dpr;
    H = canvas.height = hero.offsetHeight * dpr;
    const n = Math.round(Math.min(260, (hero.offsetWidth * hero.offsetHeight) / 5200));
    stars = Array.from({ length: n }, () => ({
      a: Math.random() * Math.PI * 2,
      r: Math.random() ** 0.7 * Math.hypot(W, H) * 0.6,
      s: (Math.random() * 1.4 + 0.3) * dpr,
      v: (Math.random() * 0.0016 + 0.0004) * (Math.random() < 0.85 ? 1 : -1),
      c: COLORS[(Math.random() * COLORS.length) | 0],
      t: Math.random() * Math.PI * 2,
    }));
  };
  resize();
  addEventListener("resize", resize);
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);
  const draw = () => {
    if (heroVisible) {
      ctx.clearRect(0, 0, W, H);
      const px = (mx / innerWidth - 0.5) * 30, py = (my / innerHeight - 0.5) * 30;
      const cx = W / 2 + px, cy = H / 2 + py;
      for (const st of stars) {
        st.a += st.v; st.t += 0.03;
        st.r -= 0.12;
        if (st.r < 4) st.r = Math.hypot(W, H) * 0.6;
        const x = cx + Math.cos(st.a) * st.r;
        const y = cy + Math.sin(st.a) * st.r * 0.82;
        const tw = 0.45 + Math.sin(st.t) * 0.35;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${st.c},${tw})`;
        ctx.arc(x, y, st.s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (!reduced) requestAnimationFrame(draw);
  };
  draw();

  /* ---------- Tilt no retrato ---------- */
  $$(".tilt").forEach((el) => {
    if (reduced || !matchMedia("(hover: hover)").matches) return;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });

  /* ---------- Vídeos de release ---------- */
  const reels = $$(".reel");
  reels.forEach((reel) => {
    const video = $("video", reel);
    $(".reel__play", reel).addEventListener("click", () => {
      reels.forEach((r) => { if (r !== reel) $("video", r).pause(); });
      video.controls = true;
      video.play().catch(() => {});
    });
    video.addEventListener("play", () => {
      reel.classList.add("is-playing");
      reels.forEach((r) => { if (r !== reel) $("video", r).pause(); });
    });
    video.addEventListener("ended", () => { reel.classList.remove("is-playing"); video.controls = false; });
  });

  /* ---------- Lightbox ---------- */
  const tiles = $$("#masonry .tile");
  const lb = $("#lightbox");
  const lbImg = $("img", lb);
  let idx = 0, lastFocus = null;
  const show = (i) => {
    idx = (i + tiles.length) % tiles.length;
    const img = $("img", tiles[idx]);
    lbImg.src = tiles[idx].href;
    lbImg.alt = img.alt;
  };
  const close = () => { lb.hidden = true; document.body.style.overflow = ""; lastFocus?.focus(); };
  tiles.forEach((t, i) => t.addEventListener("click", (e) => {
    e.preventDefault();
    lastFocus = t;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    $(".lightbox__close", lb).focus();
  }));
  $(".lightbox__close", lb).addEventListener("click", close);
  $(".lightbox__nav--prev", lb).addEventListener("click", () => show(idx - 1));
  $(".lightbox__nav--next", lb).addEventListener("click", () => show(idx + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });

  /* ---------- Idioma PT / EN ---------- */
  let lang = store.get("astralix-lang") === "en" ? "en" : "pt";
  const langBtn = $("#langBtn");
  const applyLang = () => {
    $$("[data-en]").forEach((el) => {
      if (el.dataset.pt === undefined) el.dataset.pt = el.innerHTML;
      el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.pt;
    });
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    const [a, , b] = langBtn.children;
    a.textContent = lang === "en" ? "EN" : "PT";
    b.textContent = lang === "en" ? "PT" : "EN";
  };
  langBtn.addEventListener("click", () => {
    lang = lang === "en" ? "pt" : "en";
    store.set("astralix-lang", lang);
    applyLang();
  });
  if (lang === "en") applyLang();

  /* ---------- Clipboard ---------- */
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.append(ta); ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    }
  };

  /* ---------- Pedido de booking ---------- */
  const AGENCY = "https://instagram.com/echoesofgaia__";
  const form = $("#brief");
  const status = $("#briefStatus");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const req = $$("[required]", form);
    req.forEach((f) => f.classList.toggle("is-invalid", !f.value.trim()));
    const missing = req.find((f) => !f.value.trim());
    if (missing) {
      status.style.color = "var(--magenta)";
      status.textContent = lang === "en" ? "Please fill in the highlighted fields." : "Preencha os campos destacados.";
      missing.focus();
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    const date = d.data ? d.data.split("-").reverse().join("/") : "";
    const text = lang === "en"
      ? `Hi Echoes of Gaia! I'd like to book ASTRALIX.\n\nEvent: ${d.evento}\nCity: ${d.cidade}\nDate: ${date}\nFormat: ${d.formato}\nContact: ${d.nome}${d.msg ? `\n\n${d.msg}` : ""}`
      : `Olá, Echoes of Gaia! Gostaria de contratar o ASTRALIX.\n\nEvento: ${d.evento}\nCidade: ${d.cidade}\nData: ${date}\nFormato: ${d.formato}\nContato: ${d.nome}${d.msg ? `\n\n${d.msg}` : ""}`;
    const ok = await copy(text);
    status.style.color = "";
    status.textContent = ok
      ? (lang === "en" ? "Request copied! Paste it in the agency's DM." : "Pedido copiado! Cole no direct da agência.")
      : (lang === "en" ? "Opening Instagram — send your details in the DM." : "Abrindo o Instagram — envie seus dados no direct.");
    const link = Object.assign(document.createElement("a"), { href: AGENCY, target: "_blank", rel: "noopener", textContent: lang === "en" ? " Open Echoes of Gaia →" : " Abrir Echoes of Gaia →" });
    link.style.cssText = "color: var(--gold); text-decoration: underline";
    status.append(link);
    window.open(AGENCY, "_blank", "noopener");
  });
  $$("input, textarea", form).forEach((f) => f.addEventListener("input", () => f.classList.remove("is-invalid")));

  /* ---------- Bio curta (press kit) ---------- */
  const BIO = {
    pt: "Astralix é o projeto de Full On Night do DJ paulistano Caique Souza. Desde 2016 no psytrance, aperfeiçoou sua técnica estudando mixagem no Studio Leo Casagrande e constrói sets intensos e envolventes, que conduzem a pista por uma verdadeira jornada psicodélica. Booking: Echoes of Gaia.",
    en: "Astralix is the Full On Night project of São Paulo DJ Caique Souza. Into psytrance since 2016, he refined his craft studying mixing at Studio Leo Casagrande and builds intense, immersive sets that take the dancefloor on a true psychedelic journey. Booking: Echoes of Gaia.",
  };
  const bioBtn = $("#copyBio");
  bioBtn.addEventListener("click", async () => {
    const type = $(".kit__type", bioBtn);
    const ok = await copy(BIO[lang]);
    type.textContent = ok ? (lang === "en" ? "copied ✓" : "copiada ✓") : "—";
    setTimeout(() => { type.textContent = lang === "en" ? "click to copy" : "clique para copiar"; }, 2200);
  });

  $("#year").textContent = new Date().getFullYear();
})();
