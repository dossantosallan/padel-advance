/* ---------- loop ---------- */
mode='boot';applyScreen();
let last=performance.now(),acc=0;
function loop(now){
  acc+=Math.min(100,now-last);last=now;
  const stepMs=1000/(60*SPEED);
  while(acc>=stepMs){update();acc-=stepMs}
  render();requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
