/* ---------- tela: modo GBA ou tela cheia ---------- */
const landQ=()=>matchMedia('(orientation:landscape) and (max-height:560px)').matches;
function fitCanvas(){
  try{
    if(!save.opts.full){cv.style.width='';cv.style.height='';return}
    const g=document.querySelector('.gba'),bz=document.querySelector('.bezel');
    let w,h;
    if(landQ()){h=g.clientHeight-8;const side=document.querySelector('.dpad').getBoundingClientRect().width;w=g.clientWidth-2*Math.max(side,140)-40}
    else{w=bz.clientWidth;h=bz.clientHeight}
    const s=Math.max(.5,Math.min(w/160,h/288));
    cv.style.width=Math.floor(160*s)+'px';cv.style.height=Math.floor(288*s)+'px';
  }catch(_){}
}
function applyScreen(){try{document.body.classList.toggle('full',!!save.opts.full)}catch(_){}requestAnimationFrame(fitCanvas)}
addEventListener('resize',()=>requestAnimationFrame(fitCanvas));
addEventListener('orientationchange',()=>setTimeout(fitCanvas,250));
