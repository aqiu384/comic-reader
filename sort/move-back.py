#!/usr/bin/python3
import os
import json

for BASEDIR in sorted([x + '/' for x in os.listdir('.') if 'x' in x]):
    print('Processing... ' + BASEDIR)

    for f in sorted(os.listdir(BASEDIR)):
        oname = BASEDIR + f
        os.rename(oname, f)
