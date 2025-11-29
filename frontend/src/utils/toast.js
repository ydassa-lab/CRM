// crm-frontend/src/utils/toast.js
// Very small toast util using DOM. Replace with library if you want.
const containerId = "my-toast-container";
function ensure() {
  let c = document.getElementById(containerId);
  if (!c) {
    c = document.createElement("div");
    c.id = containerId;
    c.style.position = "fixed";
    c.style.right = "20px";
    c.style.top = "20px";
    c.style.zIndex = "9999";
    document.body.appendChild(c);
  }
  return c;
}

function show(msg, bg="black") {
  const c = ensure();
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.background = bg;
  el.style.color = "white";
  el.style.padding = "8px 12px";
  el.style.marginTop = "8px";
  el.style.borderRadius = "6px";
  c.appendChild(el);
  setTimeout(()=> el.remove(), 4000);
}

export default {
  success: (m)=> show(m, "green"),
  error: (m)=> show(m, "crimson"),
  info: (m)=> show(m, "black")
};
