// ── iprights.asia AI Chatbot ─────────────────────────────
(function(){
const GEMINI_KEY = "AIzaSyCTQMhrF8P3LtJ5i1Jf-UIKhazvAJ8_OOQ";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

const SYSTEM = {
  vi: `Bạn là trợ lý AI của website iprights.asia - trang cá nhân của 부이뒤칸 (sinh 2010, Việt Nam) và 문준우 (sinh 2011, Hàn Quốc). Trả lời bằng tiếng Việt, thân thiện, ngắn gọn. Nếu hỏi về web thì giới thiệu các tính năng: Album ảnh, Chat với bạn bè, Profile cá nhân.`,
  kr: `당신은 iprights.asia 웹사이트의 AI 어시스턴트입니다. 이 사이트는 부이뒤칸(2010년생, 베트남)과 문준우(2011년생, 한국)의 개인 페이지입니다. 한국어로 친근하고 간결하게 답변하세요.`,
  en: `You are the AI assistant of iprights.asia - a personal website of 부이뒤칸 (born 2010, Vietnam) and 문준우 (born 2011, Korea). Reply in English, friendly and concise. The site has: Photo Album, Friend Chat, Personal Profile features.`
};

const GREET = {
  vi: "Xin chào! Tôi là AI trợ lý của iprights.asia 🤖\nTôi có thể giúp gì cho bạn?",
  kr: "안녕하세요! 저는 iprights.asia의 AI 어시스턴트입니다 🤖\n무엇을 도와드릴까요?",
  en: "Hello! I'm the AI assistant of iprights.asia 🤖\nHow can I help you?"
};

const PH = {vi:"Nhắn gì đó...",kr:"메시지를 입력하세요...",en:"Type a message..."};
const THINKING = {vi:"Đang suy nghĩ...",kr:"생각 중...",en:"Thinking..."};
const ERR = {vi:"Xin lỗi, tôi gặp lỗi. Thử lại nhé!",kr:"죄송합니다, 오류가 발생했습니다. 다시 시도해주세요!",en:"Sorry, I encountered an error. Please try again!"};

let history = [];
let open = false;
let lang = localStorage.getItem("site_lang") || "vi";

// Watch language changes
const observer = new MutationObserver(() => {
  const newLang = localStorage.getItem("site_lang") || "vi";
  if (newLang !== lang) {
    lang = newLang;
    updateLang();
  }
});
observer.observe(document.body, {childList:true, subtree:true});
setInterval(() => {
  const newLang = localStorage.getItem("site_lang") || "vi";
  if (newLang !== lang) { lang = newLang; updateLang(); }
}, 500);

function updateLang() {
  const inp = document.getElementById("bot-inp");
  if (inp) inp.placeholder = PH[lang];
}

// ── CSS ──────────────────────────────────────────────────
const style = document.createElement("style");
style.textContent = `
#bot-toggle {
  position:fixed; bottom:24px; right:20px; z-index:8000;
  width:54px; height:54px; border-radius:50%;
  background:linear-gradient(135deg,#a855f7,#38bdf8);
  border:none; cursor:pointer; box-shadow:0 6px 24px rgba(168,85,247,0.5);
  display:flex; align-items:center; justify-content:center;
  font-size:24px; transition:transform .2s;
  animation:botPulse 2.5s infinite;
}
#bot-toggle:hover{transform:scale(1.1);}
@keyframes botPulse{0%,100%{box-shadow:0 6px 24px rgba(168,85,247,0.5);}50%{box-shadow:0 6px 32px rgba(56,189,248,0.7);}}
#bot-badge{
  position:absolute; top:-2px; right:-2px;
  background:#ff6eb4; color:#fff; font-size:10px; font-weight:900;
  width:18px; height:18px; border-radius:50%;
  display:none; align-items:center; justify-content:center;
  border:2px solid #0f0a1e;
}
#bot-window{
  position:fixed; bottom:88px; right:16px; z-index:7999;
  width:320px; max-width:calc(100vw - 32px);
  background:#16112b; border:1px solid rgba(168,85,247,0.35);
  border-radius:20px; display:none; flex-direction:column;
  box-shadow:0 20px 60px rgba(0,0,0,0.6);
  overflow:hidden; animation:botSlide .25s ease;
  max-height:calc(100vh - 120px);
}
#bot-window.open{display:flex;}
@keyframes botSlide{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
#bot-header{
  padding:12px 16px; display:flex; align-items:center; gap:10px;
  background:linear-gradient(135deg,rgba(168,85,247,0.2),rgba(56,189,248,0.1));
  border-bottom:1px solid rgba(255,255,255,0.07); flex-shrink:0;
}
#bot-avatar{
  width:36px; height:36px; border-radius:50%;
  background:linear-gradient(135deg,#a855f7,#38bdf8);
  display:flex; align-items:center; justify-content:center;
  font-size:18px; flex-shrink:0;
}
#bot-title{font-family:'Nunito',sans-serif; font-size:13px; font-weight:900; color:#f0eaff;}
#bot-sub{font-family:'Nunito',sans-serif; font-size:10px; color:#34d399; font-weight:600;}
#bot-close{
  margin-left:auto; background:none; border:none; color:rgba(240,234,255,0.5);
  font-size:18px; cursor:pointer; padding:2px 4px; transition:color .2s;
}
#bot-close:hover{color:#f0eaff;}
#bot-msgs{
  flex:1; overflow-y:auto; padding:12px;
  display:flex; flex-direction:column; gap:8px;
  min-height:200px; max-height:340px;
}
.bot-msg{display:flex; gap:8px; align-items:flex-end; animation:msgIn .2s ease;}
.bot-msg.user{flex-direction:row-reverse;}
@keyframes msgIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.bot-av{
  width:26px; height:26px; border-radius:50%; flex-shrink:0;
  background:linear-gradient(135deg,#a855f7,#38bdf8);
  display:flex; align-items:center; justify-content:center;
  font-size:13px;
}
.bot-av.user-av{background:linear-gradient(135deg,#ff6eb4,#a855f7); font-size:11px; font-weight:900; color:#fff;}
.bot-bubble{
  max-width:75%; padding:8px 12px; border-radius:14px;
  font-family:'Nunito',sans-serif; font-size:13px; line-height:1.5;
  word-break:break-word; white-space:pre-wrap;
}
.bot-bubble.ai{background:#1c1535; border-bottom-left-radius:3px; color:#f0eaff;}
.bot-bubble.user{background:linear-gradient(135deg,#a855f7,#ff6eb4); border-bottom-right-radius:3px; color:#fff;}
.bot-bubble.thinking{color:rgba(240,234,255,0.5); font-style:italic;}
.bot-time{font-size:9px; color:rgba(240,234,255,0.3); margin-top:2px; padding:0 2px;}
.bot-msg.user .bot-time{text-align:right;}
#bot-input-wrap{
  padding:10px 12px; display:flex; gap:8px; align-items:center;
  border-top:1px solid rgba(255,255,255,0.07); flex-shrink:0;
  background:#0f0a1e;
}
#bot-inp{
  flex:1; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08);
  border-radius:50px; color:#f0eaff; padding:9px 14px;
  font-family:'Nunito',sans-serif; font-size:16px; outline:none;
  -webkit-appearance:none; transition:border-color .2s;
}
#bot-inp:focus{border-color:rgba(168,85,247,0.5);}
#bot-send{
  background:linear-gradient(135deg,#a855f7,#38bdf8); color:#fff;
  border:none; width:38px; height:38px; border-radius:50%;
  font-size:16px; cursor:pointer; display:flex; align-items:center;
  justify-content:center; flex-shrink:0; transition:transform .15s;
  box-shadow:0 3px 12px rgba(168,85,247,0.4);
}
#bot-send:hover{transform:scale(1.08);}
#bot-send:disabled{opacity:.5; cursor:not-allowed; transform:none;}
#bot-powered{
  text-align:center; font-family:'Nunito',sans-serif;
  font-size:9px; color:rgba(240,234,255,0.25); padding:4px 0;
  border-top:1px solid rgba(255,255,255,0.04); flex-shrink:0;
}
.bot-suggestions{display:flex; flex-wrap:wrap; gap:4px; padding:0 12px 8px;}
.bot-sug{
  background:rgba(168,85,247,0.1); border:1px solid rgba(168,85,247,0.25);
  color:rgba(240,234,255,0.7); border-radius:50px; padding:4px 10px;
  font-family:'Nunito',sans-serif; font-size:11px; cursor:pointer;
  transition:all .15s;
}
.bot-sug:hover{background:rgba(168,85,247,0.2); color:#f0eaff;}
`;
document.head.appendChild(style);

// ── HTML ──────────────────────────────────────────────────
const wrap = document.createElement("div");
wrap.innerHTML = `
<button id="bot-toggle" title="AI Assistant">
  🤖<span id="bot-badge"></span>
</button>
<div id="bot-window">
  <div id="bot-header">
    <div id="bot-avatar">🤖</div>
    <div>
      <div id="bot-title">AI Assistant</div>
      <div id="bot-sub">● Online</div>
    </div>
    <button id="bot-close" onclick="window._botToggle()">✕</button>
  </div>
  <div id="bot-msgs"></div>
  <div class="bot-suggestions" id="bot-sugs"></div>
  <div id="bot-input-wrap">
    <input id="bot-inp" placeholder="${PH[lang]}" onkeydown="if(event.key==='Enter')window._botSend()">
    <button id="bot-send" onclick="window._botSend()">➤</button>
  </div>
  <div id="bot-powered">Powered by Google Gemini AI</div>
</div>`;
document.body.appendChild(wrap);

const msgs = document.getElementById("bot-msgs");
const toggle = document.getElementById("bot-toggle");
const win = document.getElementById("bot-window");
const badge = document.getElementById("bot-badge");
let hasNew = 0;

// Suggestions
const SUGS = {
  vi:["Web này có gì?","부이뒤칸 là ai?","Cách đăng bài?","Chat với ai?"],
  kr:["이 웹사이트는?","부이뒤칸이 누구야?","게시물 올리기?","채팅하는 법?"],
  en:["What's on this site?","Who is 부이뒤칸?","How to post?","How to chat?"]
};

function renderSugs(){
  const sb=document.getElementById("bot-sugs");
  if(!sb) return;
  sb.innerHTML="";
  if(history.length>2){sb.style.display="none";return;}
  sb.style.display="flex";
  (SUGS[lang]||SUGS.vi).forEach(s=>{
    const btn=document.createElement("button");
    btn.className="bot-sug"; btn.textContent=s;
    btn.onclick=()=>{document.getElementById("bot-inp").value=s; window._botSend();};
    sb.appendChild(btn);
  });
}

function addMsg(text, role, thinking=false){
  const userChar = (localStorage.getItem("userName")||"U")[0].toUpperCase();
  const row = document.createElement("div");
  row.className = "bot-msg" + (role==="user"?" user":"");
  const time = new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"});
  row.innerHTML = `
    <div class="bot-av ${role==="user"?"user-av":""}">${role==="user"?userChar:"🤖"}</div>
    <div>
      <div class="bot-bubble ${role==="user"?"user":"ai"}${thinking?" thinking":""}">${text}</div>
      <div class="bot-time">${time}</div>
    </div>`;
  msgs.appendChild(row);
  msgs.scrollTop = msgs.scrollHeight;
  return row;
}

// Greet
addMsg(GREET[lang]||GREET.vi, "ai");
renderSugs();

window._botToggle = function(){
  open = !open;
  win.classList.toggle("open", open);
  toggle.style.fontSize = open ? "20px" : "24px";
  toggle.textContent = open ? "✕" : "🤖";
  if(open){
    hasNew=0; badge.style.display="none";
    document.getElementById("bot-inp").focus();
  }
};

toggle.addEventListener("click", window._botToggle);

window._botSend = async function(){
  const inp = document.getElementById("bot-inp");
  const send = document.getElementById("bot-send");
  const text = inp.value.trim();
  if(!text) return;
  inp.value = "";
  send.disabled = true;
  document.getElementById("bot-sugs").style.display="none";

  addMsg(text, "user");
  history.push({role:"user", parts:[{text}]});

  const thinking = addMsg(THINKING[lang]||"...", "ai", true);

  try {
    const sysPrompt = SYSTEM[lang]||SYSTEM.vi;
    const contents = [
      {role:"user", parts:[{text: sysPrompt + "\n\nNgười dùng: " + text}]},
      ...history.slice(-8)
    ];

    const res = await fetch(GEMINI_URL, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        contents: history.length <= 1
          ? [{role:"user", parts:[{text: sysPrompt + "\n\n" + text}]}]
          : [{role:"user", parts:[{text: sysPrompt}]}, ...history.slice(-10)],
        generationConfig:{maxOutputTokens:400, temperature:0.8}
      })
    });
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || ERR[lang];
    thinking.querySelector(".bot-bubble").textContent = reply;
    thinking.querySelector(".bot-bubble").classList.remove("thinking");
    history.push({role:"model", parts:[{text:reply}]});

    if(!open){ hasNew++; badge.textContent=hasNew; badge.style.display="flex"; }
    msgs.scrollTop = msgs.scrollHeight;
  } catch(e) {
    thinking.querySelector(".bot-bubble").textContent = ERR[lang];
    thinking.querySelector(".bot-bubble").classList.remove("thinking");
  }
  send.disabled = false;
  inp.focus();
};
})();
