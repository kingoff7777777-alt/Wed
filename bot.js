(function () {
  "use strict";
  if (window._IPR_BOT) return;
  window._IPR_BOT = true;

  var GROQ_KEY = "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";
  var GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
  var MODEL    = "llama-3.1-8b-instant";

  var SYS = {
    vi: "Ban la AI tro ly cua iprights.asia - trang ca nhan cua 부이뒤칸 (sinh 2010, Viet Nam) va 문준우 (sinh 2011, Han Quoc). Tra loi bang tieng Viet, than thien, ngan gon. Web co: Album anh, Chat ban be, Profile ca nhan, trang xem YouTube.",
    kr: "당신은 iprights.asia의 AI 어시스턴트입니다. 부이뒤칸(2010, 베트남)과 문준우(2011, 한국)의 개인 사이트입니다. 한국어로 친근하고 간결하게 답변하세요.",
    en: "You are the AI assistant of iprights.asia - personal site of 부이뒤칸 (2010, Vietnam) and 문준우 (2011, Korea). Reply in English, friendly and concise."
  };
  var GREET = {
    vi: "Xin chao! Toi la AI tro ly 🤖\nToi co the giup gi cho ban?",
    kr: "안녕하세요! AI 어시스턴트입니다 🤖\n무엇을 도와드릴까요?",
    en: "Hello! I am the AI assistant 🤖\nHow can I help you?"
  };
  var PH    = { vi: "Nhan gi do...", kr: "메시지 입력...", en: "Type a message..." };
  var THINK = { vi: "Dang suy nghi...", kr: "생각 중...", en: "Thinking..." };
  var ERR   = { vi: "Loi! Thu lai nhe.", kr: "오류! 다시 시도하세요.", en: "Error! Try again." };
  var SUGS  = {
    vi: ["Web nay co gi?", "부이뒤칸 la ai?", "Cach dang bai?", "Chat o dau?"],
    kr: ["이 사이트는?", "부이뒤칸 누구?", "게시물 올리기?", "채팅 방법?"],
    en: ["What is this site?", "Who is 부이뒤칸?", "How to post?", "How to chat?"]
  };

  function getLang() {
    return localStorage.getItem("IPRIGHTS_lang") ||
           localStorage.getItem("site_lang") || "vi";
  }

  /* ── CSS ── */
  var s = document.createElement("style");
  s.textContent =
    "#ipr-fab{position:fixed;bottom:84px;right:16px;z-index:99990;" +
    "width:52px;height:52px;border-radius:50%;" +
    "background:linear-gradient(135deg,#a855f7,#38bdf8);" +
    "border:none;cursor:pointer;font-size:24px;" +
    "display:flex;align-items:center;justify-content:center;" +
    "box-shadow:0 4px 20px rgba(168,85,247,.6);" +
    "animation:iprP 2.5s infinite;transition:transform .2s;}" +
    "#ipr-fab:hover{transform:scale(1.1);}" +
    "@keyframes iprP{0%,100%{box-shadow:0 4px 20px rgba(168,85,247,.5)}50%{box-shadow:0 4px 32px rgba(56,189,248,.8)}}" +
    "#ipr-win{position:fixed;bottom:144px;right:12px;z-index:99989;" +
    "width:300px;max-width:calc(100vw - 24px);" +
    "background:#16112b;border:1px solid rgba(168,85,247,.4);" +
    "border-radius:18px;display:none;flex-direction:column;" +
    "box-shadow:0 16px 48px rgba(0,0,0,.7);overflow:hidden;" +
    "max-height:calc(100vh - 160px);}" +
    "#ipr-win.open{display:flex;}" +
    "#ipr-hd{padding:10px 14px;background:rgba(168,85,247,.15);" +
    "border-bottom:1px solid rgba(255,255,255,.07);" +
    "display:flex;align-items:center;gap:8px;flex-shrink:0;}" +
    "#ipr-av{width:32px;height:32px;border-radius:50%;" +
    "background:linear-gradient(135deg,#a855f7,#38bdf8);" +
    "display:flex;align-items:center;justify-content:center;font-size:16px;}" +
    "#ipr-name{font-family:Nunito,sans-serif;font-size:12px;font-weight:900;color:#f0eaff;}" +
    "#ipr-st{font-family:Nunito,sans-serif;font-size:10px;color:#34d399;}" +
    "#ipr-x{margin-left:auto;background:none;border:none;" +
    "color:rgba(240,234,255,.5);font-size:18px;cursor:pointer;padding:2px 6px;}" +
    "#ipr-x:hover{color:#f0eaff;}" +
    "#ipr-msgs{flex:1;overflow-y:auto;padding:10px;" +
    "display:flex;flex-direction:column;gap:7px;" +
    "min-height:150px;max-height:280px;}" +
    ".ipr-row{display:flex;gap:6px;align-items:flex-end;}" +
    ".ipr-row.me{flex-direction:row-reverse;}" +
    ".ipr-ico{width:24px;height:24px;border-radius:50%;" +
    "background:linear-gradient(135deg,#a855f7,#38bdf8);" +
    "display:flex;align-items:center;justify-content:center;" +
    "font-size:11px;flex-shrink:0;}" +
    ".ipr-ico.me{background:linear-gradient(135deg,#ff6eb4,#a855f7);}" +
    ".ipr-bw{display:flex;flex-direction:column;max-width:78%;}" +
    ".ipr-row.me .ipr-bw{align-items:flex-end;}" +
    ".ipr-b{padding:8px 12px;border-radius:14px;" +
    "font-family:Nunito,sans-serif;font-size:13px;" +
    "line-height:1.5;word-break:break-word;white-space:pre-wrap;}" +
    ".ipr-b.ai{background:#1c1535;border-bottom-left-radius:3px;color:#f0eaff;}" +
    ".ipr-b.user{background:linear-gradient(135deg,#a855f7,#ff6eb4);" +
    "border-bottom-right-radius:3px;color:#fff;}" +
    ".ipr-b.think{color:rgba(240,234,255,.4);font-style:italic;}" +
    ".ipr-t{font-size:9px;color:rgba(240,234,255,.3);margin-top:2px;padding:0 2px;}" +
    ".ipr-row.me .ipr-t{text-align:right;}" +
    "#ipr-sugs{display:flex;flex-wrap:wrap;gap:4px;" +
    "padding:6px 10px;border-top:1px solid rgba(255,255,255,.06);flex-shrink:0;}" +
    ".ipr-sug{background:rgba(168,85,247,.1);" +
    "border:1px solid rgba(168,85,247,.25);" +
    "color:rgba(240,234,255,.7);border-radius:50px;" +
    "padding:4px 10px;font-family:Nunito,sans-serif;font-size:11px;" +
    "cursor:pointer;transition:all .15s;white-space:nowrap;}" +
    ".ipr-sug:hover{background:rgba(168,85,247,.2);color:#f0eaff;}" +
    "#ipr-iw{padding:8px 10px;background:#0f0a1e;" +
    "border-top:1px solid rgba(255,255,255,.06);" +
    "display:flex;gap:6px;align-items:center;flex-shrink:0;}" +
    "#ipr-inp{flex:1;background:rgba(255,255,255,.07);" +
    "border:1px solid rgba(255,255,255,.1);border-radius:50px;" +
    "color:#f0eaff;padding:8px 13px;" +
    "font-family:Nunito,sans-serif;font-size:16px;" +
    "outline:none;-webkit-appearance:none;}" +
    "#ipr-inp:focus{border-color:rgba(168,85,247,.6);}" +
    "#ipr-send{background:linear-gradient(135deg,#a855f7,#38bdf8);" +
    "color:#fff;border:none;width:36px;height:36px;" +
    "border-radius:50%;font-size:15px;cursor:pointer;" +
    "display:flex;align-items:center;justify-content:center;flex-shrink:0;}" +
    "#ipr-send:disabled{opacity:.5;cursor:not-allowed;}" +
    "#ipr-pw{font-family:Nunito,sans-serif;font-size:9px;" +
    "color:rgba(240,234,255,.2);text-align:center;" +
    "padding:4px 0;background:#0f0a1e;flex-shrink:0;}";
  document.head.appendChild(s);

  /* ── HTML ── */
  var L = getLang();
  var wrap = document.createElement("div");
  wrap.innerHTML =
    "<button id=\"ipr-fab\">🤖</button>" +
    "<div id=\"ipr-win\">" +
      "<div id=\"ipr-hd\">" +
        "<div id=\"ipr-av\">🤖</div>" +
        "<div>" +
          "<div id=\"ipr-name\">AI Assistant</div>" +
          "<div id=\"ipr-st\">● Online</div>" +
        "</div>" +
        "<button id=\"ipr-x\">✕</button>" +
      "</div>" +
      "<div id=\"ipr-msgs\"></div>" +
      "<div id=\"ipr-sugs\"></div>" +
      "<div id=\"ipr-iw\">" +
        "<input id=\"ipr-inp\" placeholder=\"" + (PH[L]||PH.vi) + "\">" +
        "<button id=\"ipr-send\">➤</button>" +
      "</div>" +
      "<div id=\"ipr-pw\">Powered by Groq AI</div>" +
    "</div>";
  document.body.appendChild(wrap);

  var fab  = document.getElementById("ipr-fab");
  var win  = document.getElementById("ipr-win");
  var xBtn = document.getElementById("ipr-x");
  var msgs = document.getElementById("ipr-msgs");
  var sugs = document.getElementById("ipr-sugs");
  var inp  = document.getElementById("ipr-inp");
  var send = document.getElementById("ipr-send");
  var isOpen = false;
  var history = [];

  function toggle() {
    isOpen = !isOpen;
    win.classList.toggle("open", isOpen);
    fab.textContent = isOpen ? "✕" : "🤖";
    if (isOpen) { inp.placeholder = PH[getLang()]||PH.vi; inp.focus(); }
  }
  fab.addEventListener("click", toggle);
  xBtn.addEventListener("click", toggle);

  function addMsg(text, role, thinking) {
    var row = document.createElement("div");
    row.className = "ipr-row" + (role === "user" ? " me" : "");
    var ico = document.createElement("div");
    ico.className = "ipr-ico" + (role === "user" ? " me" : "");
    ico.textContent = role === "user" ? "👤" : "🤖";
    var bw = document.createElement("div");
    bw.className = "ipr-bw";
    var b = document.createElement("div");
    b.className = "ipr-b " + (role === "user" ? "user" : "ai") + (thinking ? " think" : "");
    b.textContent = text;
    var t = document.createElement("div");
    t.className = "ipr-t";
    t.textContent = new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"});
    bw.appendChild(b); bw.appendChild(t);
    row.appendChild(ico); row.appendChild(bw);
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
    return b;
  }

  function renderSugs() {
    sugs.innerHTML = "";
    if (history.length > 2) return;
    var L = getLang();
    (SUGS[L]||SUGS.vi).forEach(function(s) {
      var btn = document.createElement("button");
      btn.className = "ipr-sug";
      btn.textContent = s;
      btn.onclick = function() { inp.value = s; doSend(); };
      sugs.appendChild(btn);
    });
  }

  function doSend() {
    var text = inp.value.trim();
    if (!text) return;
    inp.value = "";
    send.disabled = true;
    sugs.innerHTML = "";
    var L = getLang();

    addMsg(text, "user", false);
    history.push({ role: "user", content: text });

    var bubble = addMsg(THINK[L]||THINK.vi, "ai", true);

    // Build messages: system + history (max 8)
    var messages = [
      { role: "system", content: SYS[L]||SYS.vi }
    ];
    var recent = history.slice(-8);
    for (var i = 0; i < recent.length; i++) {
      messages.push(recent[i]);
    }

    fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + GROQ_KEY
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        max_tokens: 350,
        temperature: 0.7
      })
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var reply = "";
      if (d.choices && d.choices[0] && d.choices[0].message) {
        reply = d.choices[0].message.content || "";
      }
      if (!reply && d.error) reply = d.error.message || (ERR[getLang()]||ERR.vi);
      if (!reply) reply = ERR[getLang()]||ERR.vi;

      bubble.textContent = reply;
      bubble.classList.remove("think");
      history.push({ role: "assistant", content: reply });
    })
    .catch(function(e) {
      bubble.textContent = ERR[getLang()]||ERR.vi;
      bubble.classList.remove("think");
      console.error("Bot error:", e);
    })
    .finally(function() {
      send.disabled = false;
      msgs.scrollTop = msgs.scrollHeight;
      inp.focus();
    });
  }

  send.addEventListener("click", doSend);
  inp.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); }
  });

  addMsg(GREET[getLang()]||GREET.vi, "ai", false);
  renderSugs();
}());
