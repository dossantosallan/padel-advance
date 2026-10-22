/* ---------- salvamento ---------- */
const SAVE_KEY='padelAdvance.v1';
const save={attr:{vel:40,for:40,pre:40,top:40},xp:2,season:1,titles:0,wins:0,opts:{court:0,cam:0,btn:1,full:false,music:true,tips:true,timing:true,shirt:0,hair:0,golden:true,marker:false,sound:true},me:{name:'',hs:0,hair:0,skin:0,shirt:0,side:0,lefty:0,style:0,acc:0,accC:0,shoe:0,rkt:0,c2:0,pat:0,team:''},car:null,school:[],tipsSeen:{},stats:null,tour:null};
let firstRun=true;try{firstRun=!localStorage.getItem(SAVE_KEY)}catch(_){}
try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(s){Object.assign(save,s,{attr:{...save.attr,...s.attr},opts:{...save.opts,...s.opts},me:{...save.me,shirt:(s.opts&&s.opts.shirt)||0,hair:(s.opts&&s.opts.hair)||0,...s.me}})}}catch(_){}
CAM=CAMS[save.opts.cam]||CAMS[0];
/* escala de atributos 40-99 (versões antigas usavam 1-8) */
const toScale=a=>{if(!a)return a;const o={};for(const k in a)o[k]=a[k]<=8?Math.round(40+(a[k]-1)*6):clamp(a[k]|0,40,99);return o};
save.attr=toScale(save.attr);if(save.slots)for(const s of save.slots)if(s&&s.prof)s.prof.attr=toScale(s.prof.attr);
const BTNS=[['P',.82],['M',1],['G',1.16],['GG',1.3]];
function applyBtn(){try{document.documentElement.style.setProperty('--cs',BTNS[save.opts.btn][1])}catch(_){}}
applyBtn();
function setCam(i){save.opts.cam=i;CAM=CAMS[i];buildCrowd();store()}
function store(){try{syncSlot()}catch(_){}try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(_){}}
