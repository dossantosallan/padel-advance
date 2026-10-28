import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

import os
UP=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','art','jogador')+'/'
def load(f):
    a=np.array(Image.open(UP+f).convert('RGB')).astype(int)
    R,G,B=a[...,0],a[...,1],a[...,2]
    magenta=(R-G>70)&(B-G>70)&(abs(R-B)<60)
    shadow=magenta&(R<228)
    fg=~magenta
    fg=ndi.binary_opening(fg,iterations=1)
    return a,fg,shadow

def blobs(f):
    a,fg,sh=load(f)
    grp=ndi.binary_dilation(fg,iterations=12)
    lab,n=ndi.label(grp)
    out=[]
    for i,sl in enumerate(ndi.find_objects(lab),1):
        m=(lab[sl]==i)&fg[sl]
        if m.sum()<1500: continue
        out.append(dict(y0=sl[0].start,y1=sl[0].stop,x0=sl[1].start,x1=sl[1].stop,area=int(m.sum())))
    return out
