/* ---------- trilha chiptune ----------
   Três temas em loop, tocados por um sequenciador simples (16 passos por compasso). 0 = pausa. */
const MUS={
  menu:{bpm:100,lead:[72,0,76,0,79,0,76,0,74,0,77,0,81,0,77,0,72,0,76,0,79,0,84,0,83,0,79,0,74,0,0,0],
        bass:[48,0,0,0,55,0,0,0,50,0,0,0,53,0,0,0,48,0,0,0,55,0,0,0,55,0,0,0,43,0,0,0],hat:0,kick:0},
  match:{bpm:132,lead:[69,0,72,76,0,72,74,0,72,69,0,67,69,0,0,0,69,0,72,76,0,79,77,0,76,74,0,72,74,0,0,0],
        bass:[45,0,45,0,45,0,52,0,53,0,53,0,52,0,50,0,45,0,45,0,48,0,48,0,50,0,50,0,52,0,52,0],hat:1,kick:1},
  final:{bpm:150,lead:[74,74,77,0,81,0,79,77,76,0,74,0,73,0,76,0,74,74,77,0,81,0,84,0,82,81,79,0,81,0,0,0],
        bass:[38,0,38,50,38,0,38,50,41,0,41,53,45,0,45,57,38,0,38,50,38,0,38,50,46,0,46,58,45,0,45,57],hat:1,kick:1},
};
let musCur=null,musNext=0,musStep=0,hatBuf=null;
const mf=m=>440*Math.pow(2,(m-69)/12);
function musNote(t,f,d,type,vol){try{const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+d+.02)}catch(_){}}
function musHat(t){try{if(!hatBuf){hatBuf=ac.createBuffer(1,Math.floor(ac.sampleRate*.03),ac.sampleRate);const d=hatBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=hatBuf;f.type='highpass';f.frequency.value=7000;g.gain.setValueAtTime(.012,t);g.gain.exponentialRampToValueAtTime(.0001,t+.03);s.connect(f).connect(g).connect(ac.destination);s.start(t);s.stop(t+.04)}catch(_){}}
function musKick(t){try{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.0001,t+.14);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+.16)}catch(_){}}
function musicWanted(){
  if(!save.opts.music||!save.opts.sound||mode==='boot'||mode==='intro')return null;
  if(mode==='game'){const fin=bo3||(kind==='car'&&car&&car.tour&&car.tour.code==='FI');return fin?'final':'match'}
  return'menu';
}
function musicTick(){
  if(!ac||ac.state!=='running')return;
  const want=musicWanted();
  if(want!==musCur){musCur=want;musStep=0;musNext=ac.currentTime+.08}
  if(!musCur)return;
  const S=MUS[musCur],dt=60/S.bpm/4,vol=paused?.5:1;
  while(musNext<ac.currentTime+.15){
    const i=musStep%S.lead.length,t=musNext;
    if(S.lead[i])musNote(t,mf(S.lead[i]),dt*1.8,'square',.016*vol);
    if(S.bass[i])musNote(t,mf(S.bass[i]),dt*1.6,'triangle',.05*vol);
    if(S.hat&&i%2===0)musHat(t);
    if(S.kick&&i%4===0)musKick(t);
    musStep++;musNext+=dt;
  }
}
setInterval(musicTick,40);
