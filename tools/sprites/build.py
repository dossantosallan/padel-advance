import os
HERE=os.path.dirname(os.path.abspath(__file__))
OUTD=os.path.join(HERE,'out')
os.makedirs(OUTD,exist_ok=True)
import json, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from sklearn.cluster import KMeans
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from extract import load

# (sheet, half, column index after sorting by x) -> name
PICK = {
 ('folha-costas.jpeg',0,0):'back_ready', ('folha-costas.jpeg',0,1):'back_run', ('folha-costas.jpeg',0,2):'back_serve',
 ('folha-costas.jpeg',1,0):'back_forehand', ('folha-correcoes.jpeg',0,0):'back_backhand', ('folha-costas.jpeg',1,2):'back_smash',
 ('folha-especiais.jpeg',0,2):'back_jumpsmash', ('folha-especiais.jpeg',0,0):'back_dive',
 ('folha-frente.jpeg',0,0):'front_ready', ('folha-frente.jpeg',0,1):'front_run', ('folha-correcoes.jpeg',1,1):'front_serve',
 ('folha-frente.jpeg',1,0):'front_forehand', ('folha-correcoes.jpeg',1,0):'front_backhand', ('folha-correcoes.jpeg',1,2):'front_jumpsmash',
 ('folha-especiais.jpeg',1,0):'front_dive',
}
ORDER=['back_ready','back_run','back_serve','back_forehand','back_backhand','back_smash','back_jumpsmash','back_dive',
       'front_ready','front_run','front_serve','front_forehand','front_backhand','front_jumpsmash','front_dive']

def blobs(f):
    a,fg,sh=load(f)
    lab,n=ndi.label(ndi.binary_dilation(fg,iterations=3))
    objs=ndi.find_objects(lab); areas=ndi.sum(fg,lab,range(1,n+1))
    big=[i for i in range(n) if areas[i]>3000]
    owner=np.zeros(n+1,int)
    def box(i):
        sl=objs[i]; return sl[0].start,sl[0].stop,sl[1].start,sl[1].stop
    for i in range(n):
        if areas[i]<30: continue
        if i in big: owner[i+1]=i+1; continue
        y0,y1,x0,x1=box(i); best=None
        for b in big:
            Y0,Y1,X0,X1=box(b)
            d=max(Y0-y1,y0-Y1,0)+max(X0-x1,x0-X1,0)
            if best is None or d<best[0]: best=(d,b)
        if best and best[0]<40: owner[i+1]=best[1]+1
    figmask=owner[lab]
    shl,sn=ndi.label(ndi.binary_opening(sh,iterations=2))
    res=[]
    for b in big:
        m=(figmask==b+1)&fg
        ys,xs=np.nonzero(m); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
        # shadow: largest shadow blob under this figure
        best=None
        for k,sl in enumerate(ndi.find_objects(shl),1):
            if sl is None: continue
            cy=(sl[0].start+sl[0].stop)/2; cx=(sl[1].start+sl[1].stop)/2
            if x0-10<=cx<=x1+10 and y1-40<=cy<=y1+50:
                ar=(shl[sl]==k).sum()
                if best is None or ar>best[0]: best=(ar,k)
        smask=(shl==best[1]) if best else np.zeros_like(m)
        res.append(dict(m=m,smask=smask,box=(x0,y0,x1,y1)))
    # row/col
    for r in res: r['row']=0 if (r['box'][1]+r['box'][3])/2<280 else 1
    out=[]
    for row in (0,1):
        items=sorted([r for r in res if r['row']==row],key=lambda r:r['box'][0])
        for col,r in enumerate(items): out.append((row,col,r))
    return a,fg,sh,out

def fit_grid(crop,m):
    best=None
    for s in (4.1,4.15,4.2,4.25,4.3):
        for ox in np.arange(0,s,0.35):
            for oy in np.arange(0,s,0.35):
                H,W=crop.shape[:2]
                ys=np.arange(oy+s/2,H,s).astype(int); xs=np.arange(ox+s/2,W,s).astype(int)
                small=crop[ys][:,xs]
                iy=np.clip(((np.arange(H)-oy)//s).astype(int),0,len(ys)-1)
                ix=np.clip(((np.arange(W)-ox)//s).astype(int),0,len(xs)-1)
                e=np.abs(small[iy][:,ix]-crop)[m].mean()
                if best is None or e<best[0]: best=(e,s,ox,oy)
    return best

sprites={}
for f in sorted({k[0] for k in PICK}):
    a,fg,sh,res=blobs(f)
    for half,col,r in res:
        name=PICK.get((f,half,col))
        if not name: continue
        x0,y0,x1,y1=r['box']; sy,sx=np.nonzero(r['smask'])
        if len(sy): y1=max(y1,sy.max()+1); x0=min(x0,sx.min()); x1=max(x1,sx.max()+1)
        P=8; x0=max(0,x0-P);y0=max(0,y0-P);x1=min(a.shape[1],x1+P);y1=min(a.shape[0],y1+P)
        crop=a[y0:y1,x0:x1].astype(float); m=r['m'][y0:y1,x0:x1]; s_=r['smask'][y0:y1,x0:x1]
        e,s,ox,oy=fit_grid(crop,m)
        H,W=m.shape
        ny=int((H-oy)//s); nx=int((W-ox)//s)
        rgb=np.zeros((ny,nx,3)); alpha=np.zeros((ny,nx),bool); shad=np.zeros((ny,nx),bool)
        for j in range(ny):
            for i in range(nx):
                ya=int(oy+j*s); xa=int(ox+i*s); yb=int(oy+(j+1)*s); xb=int(ox+(i+1)*s)
                cm=m[ya:yb,xa:xb]; cs=s_[ya:yb,xa:xb]
                if cm.mean()>0.5:
                    alpha[j,i]=True
                    inner=crop[ya+1:yb-1,xa+1:xb-1].reshape(-1,3)
                    c=np.median(inner,0); rgb[j,i]=c
                    if c[0]-c[1]>45 and c[2]-c[1]>45: alpha[j,i]=False
                elif cs.mean()>0.5: shad[j,i]=True
        # ground anchor from shadow (fallback: lowest opaque pixel)
        if shad.sum()>10:
            sy,sx=np.nonzero(shad); gx=sx.mean(); gy=(sy.min()+sy.max())/2
        else:
            oy_,ox_=np.nonzero(alpha); gy=oy_.max(); gx=ox_[oy_>=oy_.max()-2].mean()
        sprites[name]=dict(rgb=rgb,alpha=alpha,gx=gx,gy=gy,err=e,s=s)
        print(name,f,'grid',s,'err',round(e,1),'size',alpha.shape,'shadow',int(shad.sum()))

# shared palette
allpx=np.concatenate([v['rgb'][v['alpha']] for v in sprites.values()])
km=KMeans(n_clusters=22,n_init=6,random_state=0).fit(allpx)
pal=np.clip(km.cluster_centers_,0,255).round().astype(np.uint8)
# snap near-black to pure dark outline
for v in sprites.values():
    idx=km.predict(v['rgb'].reshape(-1,3)).reshape(v['alpha'].shape)
    out=pal[idx]
    # remove isolated single pixels (despeckle alpha)
    al=v['alpha'].copy()
    nb=ndi.convolve(al.astype(int),np.ones((3,3),int),mode='constant')-al
    al[(al)&(nb<=1)]=False
    L,N=ndi.label(al,structure=np.ones((3,3)))
    if N>1:
        sz=ndi.sum(al,L,range(1,N+1))
        for q in range(N):
            if sz[q]<25: al[L==q+1]=False
    v['img']=np.dstack([out,(al*255).astype(np.uint8)])

# trim and lay out frames with common anchor
def bbox(al):
    ys,xs=np.nonzero(al); return ys.min(),ys.max()+1,xs.min(),xs.max()+1
up=max(v['gy']-bbox(v['img'][...,3]>0)[0] for v in sprites.values())
down=max(bbox(v['img'][...,3]>0)[1]-v['gy'] for v in sprites.values())
left=max(v['gx']-bbox(v['img'][...,3]>0)[2] for v in sprites.values())
right=max(bbox(v['img'][...,3]>0)[3]-v['gx'] for v in sprites.values())
FW=int(np.ceil(left+right))+2; FH=int(np.ceil(up+down))+2
AX=int(np.ceil(left))+1; AY=int(np.ceil(up))+1
cols=8; rows=int(np.ceil(len(ORDER)/cols))
sheet=np.zeros((rows*FH,cols*FW,4),np.uint8); meta={'frameWidth':FW,'frameHeight':FH,'anchor':{'x':AX,'y':AY},'frames':{}}
for k,name in enumerate(ORDER):
    v=sprites[name]; img=v['img']
    r,c=divmod(k,cols)
    dx=AX-int(round(v['gx'])); dy=AY-int(round(v['gy']))
    H,W=img.shape[:2]
    for j in range(H):
        for i in range(W):
            if img[j,i,3]:
                yy=dy+j; xx=dx+i
                if 0<=yy<FH and 0<=xx<FW: sheet[r*FH+yy,c*FW+xx]=img[j,i]
    meta['frames'][name]={'x':c*FW,'y':r*FH,'w':FW,'h':FH}
Image.fromarray(sheet).save(os.path.join(OUTD,'player_sheet.png'))
json.dump(meta,open(os.path.join(OUTD,'player_sheet.json'),'w'),indent=1)
json.dump(pal.tolist(),open(os.path.join(OUTD,'palette.json'),'w'))
print('frame',FW,FH,'anchor',AX,AY)
