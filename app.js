const $ = id => document.getElementById(id);
const camera = $("camera");
let stream = null;
let listening = false;

function addBubble(text, who="luna"){
  const d=document.createElement("div");
  d.className=`bubble ${who}`;
  d.textContent=text;
  $("chat").appendChild(d);
  $("chat").scrollTop=$("chat").scrollHeight;
}

async function toggleCamera(){
  if(stream){
    stream.getTracks().forEach(t=>t.stop());
    stream=null; camera.srcObject=null;
    $("visionStatus").textContent="Camera off";
    $("cameraBtn").textContent="📷 Camera";
    return;
  }
  try{
    stream=await navigator.mediaDevices.getUserMedia({
      video:{facingMode:"user"},audio:false
    });
    camera.srcObject=stream;
    $("visionStatus").textContent="Camera on • local preview";
    $("cameraBtn").textContent="⏹ Camera off";
  }catch(e){
    addBubble("I couldn't access the camera. Check your browser permission. ❤️");
  }
}

function speak(text){
  if(!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.rate=.95; u.pitch=1.08;
  const voices=speechSynthesis.getVoices();
  const preferred=voices.find(v=>/female|samantha|aria|zira|google us english/i.test(v.name));
  if(preferred) u.voice=preferred;
  speechSynthesis.speak(u);
}

async function send(text){
  if(!text.trim()) return;
  addBubble(text,"you");
  $("message").value="";
  const name=$("name").value||"Luna";
  const tone=$("tone").value;
  const romantic=$("romantic").checked;

  // Demo mode works without a server. Replace this block with /chat
  // when you deploy a backend that securely holds your AI API key.
  let reply = `I'm here, ${name === "Luna" ? "you" : "you"} ❤️ Tell me what's on your mind.`;
  if(/what am i doing|what am i doing\?/i.test(text))
    reply = stream ? "You're in front of the camera right now 😏❤️. I can see your video feed, but this demo hasn't connected an AI vision model yet." : "Turn on the camera and I'll be ready to use vision once the AI backend is connected.";
  else if(/hello|hi|hey/i.test(text))
    reply = tone==="playful" ? "There you are 😏 I was waiting for you." : "Hey you ❤️ I'm glad you're here.";
  else if(/goodnight|sleep/i.test(text))
    reply = "Goodnight, twin. Get some proper rest, okay? 🌙❤️";

  addBubble(reply);
  speak(reply);
}

$("cameraBtn").onclick=toggleCamera;
$("form").onsubmit=e=>{e.preventDefault();send($("message").value)};
$("micBtn").onclick=()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){addBubble("Speech recognition isn't available in this browser.");return;}
  if(listening)return;
  const r=new SR(); r.lang="en-IN"; r.interimResults=false;
  listening=true; $("micBtn").textContent="🎙 Listening…";
  r.onresult=e=>send(e.results[0][0].transcript);
  r.onerror=()=>addBubble("I couldn't hear that. Try again ❤️");
  r.onend=()=>{listening=false;$("micBtn").textContent="🎙 Talk"};
  r.start();
};

$("settingsBtn").onclick=()=>$("settings").showModal();
$("closeSettings").onclick=()=>$("settings").close();
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
