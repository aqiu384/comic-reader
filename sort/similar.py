#!/usr/bin/python3
import os
import sys
import numpy as np
from PIL import Image

PIXTHRESH = 16
PERTHRESH = 0.5

dimensions = {}
dimdirs = []
keyframes = {}
currKeyframe = None

for f in sorted(os.listdir('.')):
    if f.endswith('.png') or f.endswith('.jpg'):
        with Image.open(f) as img:
            width, height = img.size
            if width not in dimensions:
                dimensions[width] = {}
            if height not in dimensions[width]:
                dimensions[width][height] = []
                print('Found dimension ' + str(width) + 'x' + str(height))
            dimensions[width][height].append(f)

for width, ws in dimensions.items():
    for height, hs in ws.items():
        dimdir = str(width) + 'x' + str(height) + '/'
        os.mkdir(dimdir)
        for img in hs:
            print(img)
            os.rename(img, dimdir + img)

# Sorting images...
def imgSimilar(img1, img2, pixthresh, perthresh):
    diff = np.absolute(img1 - img2)
    samepix = (diff < pixthresh).sum()
    return samepix / img1.size > perthresh

for BASEDIR in sorted([x + '/' for x in os.listdir('.') if 'x' in x]):
    print('Processing... ' + BASEDIR)
    keyframes = {}
    currKeyframe = None

    for imgfile in os.listdir(BASEDIR):
        if len(imgfile) < 7 and (imgfile.endswith('.png') or imgfile.endswith('.jpg')):
            newimgfile = ('00' + imgfile)[-7:]
            os.rename(BASEDIR + imgfile, BASEDIR + newimgfile)
            print(imgfile + ' renamed to ' + newimgfile)

    for imgfile in sorted(os.listdir(BASEDIR)):
        if len(imgfile) < 11 and (imgfile.endswith('.png') or imgfile.endswith('.jpg')):
            currFrame = np.asarray(Image.open(BASEDIR + imgfile).convert('L'), dtype='uint8')
            matchFound = currKeyframe and imgSimilar(currFrame, keyframes[currKeyframe], PIXTHRESH, PERTHRESH)

            if not matchFound:
                for i, keyframe in enumerate(keyframes):
                    if imgSimilar(currFrame, keyframes[keyframe], PIXTHRESH, PERTHRESH):
                        currKeyframe = keyframe
                        matchFound = True
                        break
            
            if matchFound:
                print(imgfile + ' matches set ' + currKeyframe)
            else:
                print(imgfile + ' goes in new set')
                currKeyframe = imgfile[:-4]
                keyframes[currKeyframe] = currFrame
            
            os.rename(BASEDIR + imgfile, BASEDIR + currKeyframe + '_' + imgfile)
