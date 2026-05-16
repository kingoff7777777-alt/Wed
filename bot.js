(function () {
  "use strict";
  if (window._IPR_BOT) return;
  window._IPR_BOT = true;

  // ĐÃ KHỬ KEY CÔNG KHAI - LẤY TỪ TRÌNH DUYỆT ĐỂ BẢO MẬT KHÔNG BỊ QUÉT LỖI
  function getApiKey() {
    return localStorage.getItem("IPRIGHTS_GEMINI_KEY") || "";
  }

  var LANG_SYS = {
    vi: "Bạn là AI trợ lý của website iprights.asia. Trả lời bằng tiếng Việt, thân thiện, ngắn gọn, xưng tôi.",
    kr: "당신은 iprights.asia AI 어시스턴트입니다. 한국어로 간결하게 답변하세요.",
    en: "You are the AI assistant of iprights.asia. Reply in English, brief and friendly."
  };
  var GREET = {
    vi: "Xin chào! Tôi là AI trợ lý 🤖\nTôi có thể giúp gì cho bạn?",
    kr: "안녕하세요! AI 어시스턴트입니다 🤖",
    en: "Hello! I am the AI assistant 🤖"
  };
  var PH    = { vi: "Nhắn gì đó...", kr: "메시지 입력...", en: "Type a message..." };
  var THINK = { vi: "Đang suy nghĩ...", kr: "생각 중...", en: "Thinking..." };
  var ERR   = { vi: "Xin lỗi, có lỗi xảy ra!", kr: "오류 발생!", en: "Error! Try again." };

  function getLang() {
    return localStorage.getItem("IPRIGHTS_lang") ||
           localStorage.getItem("site_lang") || "vi";
  }

  /* ── CSS GIỮ NGUYÊN CỦA DUY KHÁNH ── */
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

  /* ── HTML GIỮ NGUYÊN CỦA DUY KHÁNH ── */
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
      "<div id=\"ipr-iw\">" +
        "<input id=\"ipr-inp\" placeholder=\"" + (PH[L]||PH.vi) + "\">" +
        "<button id=\"ipr-send\">➤</button>" +
      "</div>" +
      "<div id=\"ipr-pw\">Powered by Google Gemini AI</div>" +
    "</div>";
  document.body.appendChild(wrap);

  var fab  = document.getElementById("ipr-fab");
  var win  = document.getElementById("ipr-win");
  var xBtn = document.getElementById("ipr-x");
  var msgs = document.getElementById("ipr-msgs");
  var inp  = document.getElementById("ipr-inp");
  var send = document.getElementById("ipr-send");
  var open = false;

  function toggle() {
    open = !open;
    win.classList.toggle("open", open);
    if (open) {
      fab.textContent = "✕";
      inp.focus();
    } else {
      fab.textContent = "🤖";
    }
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
    bw.appendChild(b);
    bw.appendChild(t);
    row.appendChild(ico);
    row.appendChild(bw);
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
    return b;
  }

  /* ── ĐÃ BẢO MẬT: HÀM DO_SEND KIỂM TRA KEY THÔNG MINH ── */
  function doSend() {
    var text = inp.value.trim();
    if (!text) return;

    var currentKey = getApiKey();

    // Nếu chưa có key trong máy, biến ô chat thành ô nhập mật khẩu key
    if (!currentKey) {
      if (text.startsWith("AIzaSy")) {
        localStorage.setItem("IPRIGHTS_GEMINI_KEY", text);
        inp.value = "";
        addMsg("Hệ thống đã lưu API Key của Khánh thành công! Bây giờ bạn có thể chat bình thường rồi nhé 🎉", "ai", false);
        return;
      } else {
        inp.value = "";
        addMsg("⚠️ Bảo mật: Vui lòng dán mã API Key Gemini mới của bạn vào đây và nhấn gửi để kích hoạt Bot (mã bắt đầu bằng AIzaSy...)", "ai", false);
        return;
      }
    }

    inp.value = "";
    send.disabled = true;
    var L = getLang();
    addMsg(text, "user", false);
    var bubble = addMsg(THINK[L]||THINK.vi, "ai", true);

    var payload = {
      contents: [
        { parts: [{ text: text }] }
      ],
      systemInstruction: {
        parts: [{ text: LANG_SYS[L] || LANG_SYS.vi }]
      }
    };

    var API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + currentKey;

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var reply = "";
      if (d.candidates && d.candidates[0] &&
          d.candidates[0].content && d.candidates[0].content.parts &&
          d.candidates[0].content.parts[0]) {
        reply = d.candidates[0].content.parts[0].text || "";
      }
      if (!reply) {
        if (d.error && d.error.message && d.error.message.includes("API key not valid")) {
          reply = "❌ Key của bạn đã bị Google khóa do lộ trước đó. Hãy xóa lịch sử duyệt web hoặc nhập Key mới tinh để chạy lại nhé.";
          localStorage.removeItem("IPRIGHTS_GEMINI_KEY"); // Xóa key lỗi
        } else {
          reply = d.error ? d.error.message : (ERR[getLang()]||ERR.vi);
        }
      }
      bubble.textContent = reply;
      bubble.classList.remove("think");
    })
    .catch(function(e) {
      bubble.textContent = ERR[getLang()]||ERR.vi;
      bubble.classList.remove("think");
      console.error("Bot error:", e);
    })
    .finally(function() {
      send.disabled = false;
      msgs.scrollTop = msgs.scrollHeight;
    });
  }

  send.addEventListener("click", doSend);
  inp.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); }
  });

  // Chào mừng và hướng dẫn nếu chưa có key
  addMsg(GREET[getLang()]||GREET.vi, "ai", false);
  if (!getApiKey()) {
    addMsg("🔑 Để kích hoạt Bot an toàn, Khánh hãy lấy 1 cái API Key mới tinh bên Google AI Studio, dán thẳng mã đó vào ô chat này rồi nhấn gửi nhé!", "ai", false);
  }
}());
