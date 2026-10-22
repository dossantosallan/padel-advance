/* ---------- dados ---------- */
const COURTS=[
  {n:'AZUL',turf:'#2a62d4',dot:'#2558c2',line:'#e6eeff',out:'#0d1333',out2:'#141b44',glass:'#6db7d9',fence:'#2e3556',bounce:.62,fric:.9},
  {n:'VERDE',turf:'#2f9a4c',dot:'#2a8a44',line:'#f0fff2',out:'#0d1a13',out2:'#15261d',glass:'#7fd0c8',fence:'#2f3a33',bounce:.64,fric:.93},
  {n:'SAIBRO',turf:'#c8643a',dot:'#b45632',line:'#fff3e6',out:'#1d120d',out2:'#2a1a12',glass:'#9fd0d9',fence:'#3a2e2a',bounce:.56,fric:.84},
  {n:'NOITE',turf:'#3270e6',dark:'#0f2350',dot:'#2558c2',line:'#d9e4ff',out:'#04060d',out2:'#0a0f22',glass:'#3f7f9e',fence:'#1c2033',bounce:.62,fric:.9,night:true},
];
const SHIRTS=['#ef3e36','#2e86ff','#ffb000','#20c070','#b05cff','#ff5ca8','#f2f2f2'];
const HAIRS=['#3b2416','#1b1b1b','#d9a441','#8a4b20','#e0e0e0','#c0392b'];
const STY={
  equil:{n:'EQUILIBRADOS',back:38,net:66,lob:.1,lobNet:.5,smash:.4,vib:.3,drop:.07,ue:1,pow:0},
  parede:{n:'PAREDOES',back:30,net:50,lob:.22,lobNet:.6,smash:.2,vib:.2,drop:.05,ue:.75,pow:-.1},
  rede:{n:'VOLEADORES',back:46,net:76,lob:.05,lobNet:.35,smash:.6,vib:.3,drop:.12,ue:1.1,pow:.08},
  globo:{n:'LOBISTAS',back:36,net:60,lob:.4,lobNet:.7,smash:.3,vib:.2,drop:.05,ue:.95,pow:-.05},
  canhoto:{n:'CANHOTOS',back:38,net:66,lob:.1,lobNet:.5,smash:.4,vib:.5,drop:.07,ue:1,pow:0,lefty:true},
};
const SKINS=['#f2c18d','#e0a878','#c68642','#8d5524','#5c3a1e'];
const HS=['short','long','tail','bald'],HS_N=['CURTO','LONGO','RABO','CARECA'];
/* jogador: [nome, cabelo(estilo), cor do cabelo, pele] */
const PAIRS=[
  {s:'parede',lv:0,c:'#c9a26b',p:[['JOAO DIAS','short','#3b2416',0],['LUIS BRUM','bald','#1b1b1b',2]]},
  {s:'globo',lv:0,c:'#ff9ed8',p:[['ANA MELO','long','#d9a441',0],['BIA ROSA','tail','#3b2416',1]]},
  {s:'equil',lv:0,c:'#9b7bff',p:[['CAIO REIS','short','#1b1b1b',3],['DAVI LUZ','short','#8a4b20',1]]},
  {s:'canhoto',lv:0,c:'#7fe0ff',p:[['LEO VAZ','short','#d9a441',0],['RUI NERI','short','#e0e0e0',1]]},
  {s:'rede',lv:0,c:'#fff36b',p:[['GABI LEAL','tail','#1b1b1b',2],['LIA GOES','long','#c0392b',0]]},
  {s:'globo',lv:1,c:'#ff8a3d',p:[['IGOR LOBO','short','#3b2416',1],['TOM CRUZ','short','#1b1b1b',4]]},
  {s:'parede',lv:1,c:'#6b8cff',p:[['NINA PAZ','long','#1b1b1b',3],['JU MOTA','tail','#8a4b20',1]]},
  {s:'canhoto',lv:1,c:'#c0c8d8',p:[['ENZO RIOS','short','#1b1b1b',2],['HUGO LINS','bald','#3b2416',0]]},
  {s:'rede',lv:1,c:'#3fb8c8',p:[['RAFA MAIA','short','#d9a441',0],['IAN ROMA','short','#3b2416',3]]},
  {s:'globo',lv:2,c:'#e8f0ff',p:[['CLARA VILA','long','#d9a441',0],['LU BRAZ','tail','#1b1b1b',4]]},
  {s:'parede',lv:2,c:'#a0a0a0',p:[['MARCOS LEME','short','#e0e0e0',1],['OTTO SENA','short','#3b2416',2]]},
  {s:'rede',lv:2,c:'#40e0a0',p:[['DANI VALE','tail','#8a4b20',1],['TATI LAGO','long','#1b1b1b',3]]},
  {s:'parede',lv:3,c:'#f2f2f2',p:[['VITOR PENA','short','#1b1b1b',1],['SAUL ALVA','bald','#3b2416',3]]},
  {s:'canhoto',lv:3,c:'#ffd23f',p:[['FELIPE LEON','short','#3b2416',0],['MATEO GIL','short','#1b1b1b',2]]},
  {s:'rede',lv:3,c:'#ff4fa0',p:[['LARA CANO','tail','#1b1b1b',2],['IRIS VEGA','long','#c0392b',0]]},
];
PAIRS.forEach(q=>{q.n=q.p.map(x=>x[0].split(' ').pop()).join('/')});
const PARTNER=['BETO RAMOS','short','#1b1b1b',1];
const KIT2=['#f4f4f4','#1b1b1b','#24305e','#ffd23f','#ef3e36','#2e86ff','#20c070'];
const ACCS=['#ffffff','#ef3e36','#ffd23f','#2e86ff','#1b1b1b','#20c070'];
const SHOES=['#e8e8e8','#1b1b1b','#ff5a52','#2e86ff','#ffd23f'];
const RKTC=['#1c1c2a','#ef3e36','#2e86ff','#20c070','#ffd23f','#f2f2f2'];
const SIDE_N=['DIREITA','ESQUERDA'],HAND_N=['DESTRO','CANHOTO'],STYLE_N=['COMPLETO','ATACANTE','DEFENSOR'],ACC_N=['NENHUM','FAIXA','VISEIRA','PUNHO'],PAT_N=['LISA','LISTRAS','FAIXA','OMBROS'];
const NAMEGRID='ABCDEFGHIJKLMNOPQRSTUVWXYZ <';
const ATTR=[['vel','VELOCIDADE','CORRE MAIS RAPIDO'],['for','FORCA','BOLAS MAIS FORTES'],['pre','PRECISAO','MENOS ERROS'],['top','POR CIMA','REMATE E BANDEJA']];
