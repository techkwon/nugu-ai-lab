(function () {
  "use strict";

  var FAMILIES = ["GPT", "Claude", "Gemini", "기타"];
  var TYPES = ["모델 대결", "도구·사용법"];
  var state = { family: "전체", type: "전체", data: null };

  /* ---------- theme ---------- */
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");

  function storedTheme() {
    try { return localStorage.getItem("lab-hub-theme"); } catch (e) { return null; }
  }
  function saveTheme(v) {
    try { localStorage.setItem("lab-hub-theme", v); } catch (e) { /* ignore */ }
  }
  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function paintToggle() {
    var dark = currentTheme() === "dark";
    toggle.textContent = dark ? "밝은 화면" : "어두운 화면";
    toggle.setAttribute("aria-label", dark ? "밝은 화면으로 바꾸기" : "어두운 화면으로 바꾸기");
  }
  var saved = storedTheme();
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  paintToggle();
  toggle.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    saveTheme(next);
    paintToggle();
  });

  /* ---------- helpers ---------- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "text") node.textContent = attrs[k];
        else if (k === "className") node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }
  function safeUrl(u) {
    return typeof u === "string" && /^https:\/\//.test(u) ? u : null;
  }
  var ICON_PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4 2.5v11l9-5.5z"/></svg>';
  var ICON_OUT = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" d="M6 3H3v10h10v-3M9 2h5v5M14 2 7 9"/></svg>';

  function linkBtn(href, label, primary, icon) {
    var a = el("a", { href: href, className: "link-btn" + (primary ? " primary" : ""), target: "_blank", rel: "noopener" });
    a.innerHTML = icon;
    a.appendChild(document.createTextNode(label));
    a.appendChild(el("span", { className: "visually-hidden", text: " (새 창)" }));
    return a;
  }

  function families(entry) {
    var set = {};
    (entry.models || []).forEach(function (m) { set[m.family] = true; });
    return set;
  }

  /* ---------- filters ---------- */
  function buildFilterGroup(container, key, values) {
    ["전체"].concat(values).forEach(function (v) {
      var b = el("button", { type: "button", className: "chip-btn", "aria-pressed": String(state[key] === v) });
      if (key === "family" && v !== "전체") b.appendChild(el("span", { className: "dot " + v, "aria-hidden": "true" }));
      b.appendChild(document.createTextNode(v));
      b.addEventListener("click", function () {
        state[key] = v;
        Array.prototype.forEach.call(container.querySelectorAll(".chip-btn"), function (x) {
          x.setAttribute("aria-pressed", String(x === b));
        });
        render();
      });
      container.appendChild(b);
    });
  }

  /* ---------- render ---------- */
  function renderEntry(e) {
    var meta = el("div", { className: "entry-meta" });
    if (typeof e.episode === "number") {
      var no = el("span", { className: "ep-no" });
      no.textContent = e.episode;
      no.appendChild(el("small", { text: "편" }));
      meta.appendChild(no);
    } else {
      meta.appendChild(el("span", { className: "ep-no", text: "다음" }));
    }
    meta.appendChild(el("time", { datetime: e.date, text: e.date }));
    if (e.status && e.status !== "공개") {
      meta.appendChild(document.createElement("br"));
      meta.appendChild(el("span", { className: "status", text: e.status }));
    }

    var body = el("div", { className: "entry-body" });
    body.appendChild(el("p", { className: "entry-type", text: e.type }));
    body.appendChild(el("h3", { text: e.title }));

    var models = el("ul", { className: "models", "aria-label": "참여 모델" });
    (e.models || []).forEach(function (m) {
      var li = el("li", null, [
        el("span", { className: "dot " + m.family, "aria-hidden": "true" }),
        document.createTextNode(m.name)
      ]);
      if (m.role) li.appendChild(el("span", { className: "role", text: "(" + m.role + ")" }));
      models.appendChild(li);
    });
    body.appendChild(models);

    if (e.takeaway) body.appendChild(el("p", { className: "takeaway", text: e.takeaway }));

    if (e.highlights && e.highlights.length) {
      var hl = el("ul", { className: "highlights", "aria-label": "주요 숫자" });
      e.highlights.forEach(function (h) { hl.appendChild(el("li", { text: h })); });
      body.appendChild(hl);
    }

    if (e.tags && e.tags.length) {
      var tags = el("ul", { className: "tags", "aria-label": "태그" });
      e.tags.forEach(function (t) { tags.appendChild(el("li", { text: t })); });
      body.appendChild(tags);
    }

    var links = el("div", { className: "links" });
    var yt = safeUrl(e.youtube), site = safeUrl(e.site);
    if (yt) links.appendChild(linkBtn(yt, "영상 보기", true, ICON_PLAY));
    if (site) links.appendChild(linkBtn(site, "결과 사이트", false, ICON_OUT));
    (e.links || []).forEach(function (l) {
      var u = safeUrl(l.url);
      if (u) links.appendChild(linkBtn(u, l.label, false, ICON_OUT));
    });
    if (links.childNodes.length) body.appendChild(links);
    else body.appendChild(el("p", { className: "no-link", text: e.status === "진행 중" ? "링크는 공개 후 추가됩니다." : "공개된 링크가 아직 없습니다." }));

    return el("li", { className: "entry", id: e.id }, [meta, body]);
  }

  function render() {
    var list = document.getElementById("entries");
    var count = document.getElementById("result-count");
    var entries = state.data.entries.filter(function (e) {
      if (state.type !== "전체" && e.type !== state.type) return false;
      if (state.family !== "전체" && !families(e)[state.family]) return false;
      return true;
    });
    list.textContent = "";
    entries.forEach(function (e) { list.appendChild(renderEntry(e)); });
    if (!entries.length) list.appendChild(el("li", { className: "empty", text: "조건에 맞는 실험이 없습니다." }));
    count.textContent = "실험 " + entries.length + "개 표시 중 / 전체 " + state.data.entries.length + "개";
  }

  function renderPrinciples(items) {
    var ol = document.getElementById("principles");
    ol.textContent = "";
    items.forEach(function (p, i) {
      var li = el("li", { className: i === items.length - 1 ? "key" : "" }, [
        el("span", { className: "pno", text: "원칙 " + String(i + 1).padStart(2, "0") }),
        el("h3", { text: p.title }),
        el("p", { text: p.body })
      ]);
      ol.appendChild(li);
    });
  }

  function renderStats(d) {
    var pub = d.entries.filter(function (e) { return e.status === "공개"; });
    var duel = pub.filter(function (e) { return e.type === "모델 대결"; }).length;
    var sites = pub.filter(function (e) { return safeUrl(e.site); }).length;
    var s = document.getElementById("stats");
    s.textContent = "";
    [[pub.length, "편 공개"], [duel, "모델 대결"], [sites, "결과 사이트"]].forEach(function (x) {
      var li = el("li");
      li.appendChild(el("b", { text: String(x[0]) }));
      li.appendChild(document.createTextNode(x[1]));
      s.appendChild(li);
    });
    var up = document.getElementById("updated");
    if (up && d.updated) up.textContent = d.updated;
  }

  function start(d, fromFallback) {
    d.entries.sort(function (a, b) {
      var ea = typeof a.episode === "number" ? a.episode : Infinity;
      var eb = typeof b.episode === "number" ? b.episode : Infinity;
      return eb - ea;
    });
    state.data = d;
    renderStats(d);
    renderPrinciples(d.principles || []);
    render();
    if (fromFallback) document.getElementById("fallback-note").hidden = false;
  }

  buildFilterGroup(document.getElementById("filter-family"), "family", FAMILIES);
  buildFilterGroup(document.getElementById("filter-type"), "type", TYPES);

  function fallback() {
    try {
      var raw = document.getElementById("fallback-data").textContent;
      start(JSON.parse(raw), true);
    } catch (e) {
      document.getElementById("entries").textContent = "데이터를 불러오지 못했습니다.";
    }
  }

  if (location.protocol === "file:" || !window.fetch) {
    fallback();
  } else {
    fetch("data.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { start(d, false); })
      .catch(fallback);
  }
})();
