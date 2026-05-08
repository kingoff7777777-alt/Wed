// ── iprights.asia AI Chatbot (Optimized for Album Safety) ─────────────────────
(function(){
    const GEMINI_KEY = "AIzaSyCTQMhrF8P3LtJ5i1Jf-UIKhazvAJ8_OOQ";
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

    const SYSTEM = {
        vi: "Bạn là trợ lý AI của website iprights.asia - trang cá nhân của 부이뒤칸 (2010) và 문준우 (2011). Trả lời thân thiện, ngắn gọn bằng tiếng Việt.",
        kr: "당신은 iprights.asia의 AI 어시스턴트입니다. 부이뒤칸과 문준우의 개인 페이지입니다. 한국어로 친근하게 답변하세요.",
        en: "You are the AI assistant of iprights.asia. Reply in English, friendly and concise."
    };

    const GREET = {
        vi: "Xin chào! Tôi là AI trợ lý của iprights.asia 🤖\nTôi có thể giúp gì cho bạn?",
        kr: "안녕하세요! 저는 iprights.asia의 AI 어시스턴트입니다 🤖\n무엇을 도와드릴까요?",
        en: "Hello! I'm the AI assistant of iprights.asia 🤖\nHow can I help you?"
    };

    const PH = {vi:"Nhắn gì đó...", kr:"메시지를 입력하세요...", en:"Type a message..."};
    const THINKING = {vi:"Đang suy nghĩ...", kr:"생각 중...", en:"Thinking..."};
    const ERR = {vi:"Lỗi rồi, thử lại nhé!", kr:"오류가 발생했습니다!", en:"Error, try again!"};

    // Tách biệt history để không xung đột với Album
    let IPRIGHTS_AI_HISTORY = [];
    let open = false;
    let lang = localStorage.getItem("site_lang") || "vi";

    // Cập nhật ngôn ngữ nhẹ nhàng hơn MutationObserver
    setInterval(() => {
        const currentLang = localStorage.getItem("site_lang") || "vi";
        if (currentLang !== lang) {
            lang = currentLang;
            const inp = document.getElementById("bot-inp");
            if (inp) inp.placeholder = PH[lang];
        }
    }, 1000);

    const style = document.createElement("style");
    style.textContent = `
        #bot-toggle { position:fixed; bottom:24px; right:20px; z-index:9999; width:54px; height:54px; border-radius:50%; background:linear-gradient(135deg,#a855f7,#38bdf8); border:none; cursor:pointer; box-shadow:0 6px 24px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; font-size:24px; transition:all .2s; }
        #bot-toggle:hover { transform: scale(1.1); }
        #bot-window { position:fixed; bottom:88px; right:16px; z-index:9998; width:320px; max-width:calc(100vw - 32px); background:#16112b; border:1px solid rgba(168,85,247,0.3); border-radius:20px; display:none; flex-direction:column; box-shadow:0 10px 40px rgba(0,0,0,0.5); overflow:hidden; max-height:450px; }
        #bot-window.open { display:flex; }
        #bot-header { padding:12px; background:rgba(168,85,247,0.1); border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; }
        #bot-msgs { flex:1; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:8px; background:#0f0a1e; }
        .bot-bubble { padding:8px 12px; border-radius:12px; font-size:13px; max-width:80%; line-height:1.4; }
        .bot-bubble.ai { background:#1c1535; color:#f0eaff; align-self: flex-start; }
        .bot-bubble.user { background:linear-gradient(135deg,#a855f7,#ff6eb4); color:#fff; align-self: flex-end; }
        #bot-input-wrap { padding:10px; display:flex; gap:5px; background:#16112b; }
        #bot-inp { flex:1; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:20px; color:#fff; padding:7px 12px; outline:none; }
        #bot-send { background:#a855f7; color:#fff; border:none; border-radius:50%; width:34px; height:34px; cursor:pointer; }
    `;
    document.head.appendChild(style);

    const wrap = document.createElement("div");
    wrap.innerHTML = `
        <button id="bot-toggle">🤖</button>
        <div id="bot-window">
            <div id="bot-header"><span style="font-weight:900;font-size:13px;color:#a855f7">AI ASSISTANT</span><button id="bot-close" style="margin-left:auto;background:none;border:none;color:#fff;cursor:pointer">✕</button></div>
            <div id="bot-msgs"></div>
            <div id="bot-input-wrap">
                <input id="bot-inp" placeholder="${PH[lang]}">
                <button id="bot-send">➤</button>
            </div>
        </div>
    `;
    document.body.appendChild(wrap);

    const msgs = document.getElementById("bot-msgs");
    const win = document.getElementById("bot-window");
    const inp = document.getElementById("bot-inp");

    function addMsg(text, role, thinking=false){
        const b = document.createElement("div");
        b.className = "bot-bubble " + role + (thinking?" thinking":"");
        b.textContent = text;
        msgs.appendChild(b);
        msgs.scrollTop = msgs.scrollHeight;
        return b;
    }

    addMsg(GREET[lang], "ai");

    window._botToggle = () => {
        open = !open;
        win.classList.toggle("open", open);
        if(open) inp.focus();
    };

    document.getElementById("bot-toggle").onclick = window._botToggle;
    document.getElementById("bot-close").onclick = window._botToggle;
    
    document.getElementById("bot-send").onclick = async () => {
        const text = inp.value.trim();
        if(!text) return;
        inp.value = "";
        addMsg(text, "user");
        IPRIGHTS_AI_HISTORY.push({role:"user", parts:[{text}]});

        const think = addMsg(THINKING[lang], "ai", true);

        try {
            const res = await fetch(GEMINI_URL, {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify({
                    contents: [{role:"user", parts:[{text: SYSTEM[lang] + "\n\n" + text}]}],
                    generationConfig:{maxOutputTokens:200, temperature:0.7}
                })
            });
            const data = await res.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || ERR[lang];
            think.textContent = reply;
            IPRIGHTS_AI_HISTORY.push({role:"model", parts:[{text:reply}]});
        } catch(e) {
            think.textContent = ERR[lang];
        }
    };

    inp.onkeydown = (e) => { if(e.key==="Enter") document.getElementById("bot-send").click(); };
})();
