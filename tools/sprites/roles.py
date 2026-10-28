import os
HERE=os.path.dirname(os.path.abspath(__file__))
OUTD=os.path.join(HERE,'out')
os.makedirs(OUTD,exist_ok=True)
import json, numpy as np
from PIL import Image
from scipy import ndimage as ndi
pal=np.array(json.load(open(os.path.join(OUTD,'palette.json'))))
meta=json.load(open(os.path.join(OUTD,'player_sheet.json')))
sheet=np.array(Image.open(os.path.join(OUTD,'player_sheet.png')).convert('RGBA'))
FW,FH=meta['frameWidth'],meta['frameHeight']
import colorsys
LIGHT,GREY,DARK,OUT,SKIN,HAIR=set(),set(),set(),set(),set(),set()
for i,c in enumerate(pal):
    h,l,s_=colorsys.rgb_to_hls(*[v/255 for v in c])
    if l<.1: OUT.add(i)
    elif s_<.2 and l>=.7: LIGHT.add(i)
    elif s_<.15 and l>=.36: GREY.add(i)
    elif s_<.15: DARK.add(i)
    elif l<.3: HAIR.add(i)
    else: SKIN.add(i)
def idx_of(rgba):
    out=np.full(rgba.shape[:2],-1)
    for i,c in enumerate(pal):
        out[(rgba[...,0]==c[0])&(rgba[...,1]==c[1])&(rgba[...,2]==c[2])&(rgba[...,3]>0)]=i
    return out
ROLE_COL={'outline':(20,0,20),'shirt':(255,60,60),'shoe':(255,255,0),'shorts':(60,60,255),'skin':(240,170,120),'hair':(90,50,20),'racket':(0,200,0),'other':(255,0,255)}
frames={}; prev=[]
for name,fr in meta['frames'].items():
    tile=sheet[fr['y']:fr['y']+FH,fr['x']:fr['x']+FW]
    I=idx_of(tile); op=I>=0
    role=np.full(I.shape,'',object)
    inset=lambda S: np.isin(I,list(S))
    # racket: dark-dense region
    D=inset(DARK)|inset(OUT)
    dens=ndi.convolve(D.astype(int),np.ones((3,3),int),mode='constant')
    core=D&(dens>=9)
    core=ndi.binary_opening(core,np.ones((2,2)))
    lab,n=ndi.label(core)
    if n:
        sz=ndi.sum(core,lab,range(1,n+1)); core=np.isin(lab,[i+1 for i in range(n) if sz[i]>=12])
    DG=inset(DARK)|inset(GREY)|inset(OUT)
    rk=ndi.binary_dilation(core,iterations=2)&DG
    rk=ndi.binary_fill_holes(rk)&DG
    role[rk]='racket'
    L=inset(LIGHT)|(inset(GREY)&False)
    lab,n=ndi.label(L)
    big=np.zeros_like(L)
    for i in range(1,n+1):
        m=lab==i
        if m.sum()>=40: big|=m
    near=ndi.binary_dilation(big,iterations=2)
    for i in range(1,n+1):
        m=lab==i
        role[m]='shirt' if (m.sum()>=40 or (m&near).any()) else 'shoe'
    G=inset(GREY)&(role=='')
    lab,n=ndi.label(G)
    for i in range(1,n+1):
        m=lab==i
        # shorts if big or touching other shorts-ish area; small grey near shoes -> shoe
        dm=ndi.binary_dilation(m,iterations=2)
        role[m]='shorts' if (dm&(role=='shirt')).any() or not (dm&(role=='shoe')).any() else 'shoe'
    role[(role=='')&inset(SKIN)]='skin'
    role[(role=='')&inset(HAIR)]='hair'
    role[(role=='')&inset(OUT)]='outline'
    role[(role=='')&inset(DARK)]='outline'
    role[(role=='')&op]='other'
    frames[name]=(I,role)
    img=np.zeros((FH,FW,3),np.uint8)+235
    for r,c in ROLE_COL.items(): img[role==r]=c
    prev.append(Image.fromarray(img).resize((FW*3,FH*3),Image.NEAREST))
W=len(prev); cols=5; rows=(W+cols-1)//cols
canvas=Image.new('RGB',(cols*FW*3,rows*FH*3),'white')
for k,im in enumerate(prev): canvas.paste(im,((k%cols)*FW*3,(k//cols)*FH*3))
canvas.save(os.path.join(OUTD,'roles.png'))
np.save(os.path.join(OUTD,'roles.npy'),{k:(v[0],v[1]) for k,v in frames.items()},allow_pickle=True)
print('ok')
