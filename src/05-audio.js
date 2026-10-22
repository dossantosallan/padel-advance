/* ---------- som ---------- */
let ac=null,noiseBuf=null,quiet=false;
function unlock(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume()}catch(_){}}
function beep(f,d=.06,type='square',vol=.07,slide=0,delay=0){
  if(!save.opts.sound||!ac||quiet)return;
  try{const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();
    o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(f*slide,t+d);
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g).connect(ac.destination);o.start(t);o.stop(t+d+.02)}catch(_){}
}
function applause(n,vol){
  if(!save.opts.sound||!ac||quiet)return;
  try{
    if(!noiseBuf){noiseBuf=ac.createBuffer(1,Math.floor(ac.sampleRate*.05),ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
    const t0=ac.currentTime;
    for(let i=0;i<n;i++){
      const t=t0+Math.random()*1.4,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
      s.buffer=noiseBuf;f.type='bandpass';f.frequency.value=rnd(1100,3200);f.Q.value=1.3;
      g.gain.setValueAtTime(vol*(1-(t-t0)/1.7),t);g.gain.exponentialRampToValueAtTime(.0001,t+.045);
      s.connect(f).connect(g).connect(ac.destination);s.start(t);s.stop(t+.05);
    }
  }catch(_){}
}
const sfx={
  smash:()=>{beep(900,.09,'square',.09,.4);beep(120,.08,'triangle',.1,.5,.02)},
  lob:()=>beep(440,.09,'triangle',.09,1.8),
  bounce:()=>beep(200,.03,'triangle',.08),
  wall:()=>beep(110,.05,'square',.04,.8),
  fence:()=>{beep(1250,.05,'square',.035,.6);beep(830,.07,'square',.03,.7,.015)},
  cord:()=>beep(1500,.03,'square',.04,.5),
  out:()=>beep(300,.25,'triangle',.06,2.5),
  point:w=>{const s=w===0?[523,659,784]:[392,330,262];s.forEach((f,i)=>beep(f,.09,'square',.06,0,i*.09))},
  game:()=>[523,659,784,1046].forEach((f,i)=>beep(f,.12,'square',.07,0,i*.1)),
  fanfare:()=>[523,523,523,659,784,659,784,1046].forEach((f,i)=>beep(f,.14,'square',.07,0,i*.13)),
  fault:()=>beep(160,.18,'sawtooth',.05,.6),
  hit:(pow,q,type)=>{const v=type==='volley';beep((v?640:420)+pow*380,v?.035:.05,q>.55?'square':'triangle',.05+.04*pow,1.25+.35*q);if(pow>.65&&!v)beep(90+70*pow,.05,'triangle',.07*pow,.5)},
  corner:()=>{beep(130,.05,'square',.05,.7);beep(95,.06,'square',.04,.7,.03)},
  ui:()=>beep(880,.03,'square',.05),
};
