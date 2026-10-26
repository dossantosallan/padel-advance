const cv=document.getElementById('c');
let cx=cv.getContext('2d');cx.imageSmoothingEnabled=false;
const CW=160,CH=288;
const W=100,L=200,NET=100,NETH=9,SV1=30.5,SV2=169.5,G=.06;
/* Perspectiva: fundo de cima mais estreito e comprimido (k=0.78) */
/* Câmeras: AEREA = vista de cima com leve inclinação; FUNDO = atrás da quadra, perspectiva mais forte e alturas mais visíveis.
   kn = largura relativa do fundo distante; e = compressão vertical do fundo; zf = escala das alturas. */
const CAMS=[
  {n:'AEREA',oy:38,h:240,wn:48000/(L*1.78),kn:.78,e:1,zf:.75,pole:9},
  {n:'FUNDO',oy:86,h:192,wn:150,kn:.55,e:1.7,zf:1,pole:44},
];
let CAM=CAMS[0];
const kf=y=>CAM.kn+(1-CAM.kn)*y/L;
const gRaw=y=>Math.pow(Math.max(.01,kf(y)),CAM.e+1)-Math.pow(CAM.kn,CAM.e+1);
const fy=y=>CAM.h*gRaw(y)/gRaw(L);
const zs=y=>CAM.wn/100*kf(y)*CAM.zf;
const proj=(x,y,z)=>[80+(x-50)*CAM.wn/100*kf(y),CAM.oy+fy(y)-z*zs(y)];
const yAt=sy=>{let lo=-60,hi=L+60;for(let i=0;i<32;i++){const m=(lo+hi)/2;if(CAM.oy+fy(m)<sy)lo=m;else hi=m}return(lo+hi)/2};
const SPEED=.8075,SW=18;
const F8='8px "Press Start 2P", monospace',F16='16px "Press Start 2P", monospace';
const ACC='#ffd23f',RED='#ff5a52',WHITE='#f4f6ff',MUT='#8f8ac8',NAVY='#0d1333',GRN='#5bff7a',BLU='#7fd0ff';
const PL=['0','15','30','40'];
const RN=['OITAVAS','QUARTAS','SEMIFINAL','FINAL'],RN_NA=['NAS OITAVAS','NAS QUARTAS','NA SEMIFINAL','NA FINAL'];
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,c,t)=>a+(c-a)*t;
const sideOf=y=>y>NET?0:1;
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(h1,h2,t)=>{const a=hex(h1),c=hex(h2);return'rgb('+a.map((v,i)=>Math.round(lerp(v,c[i],t))).join(',')+')'};

