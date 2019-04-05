#!/usr/bin/python3
import os
import json

for f in sorted(os.listdir('.')):
    if f.endswith('.png') or f.endswith('.jpg') and '_' in f:
        chapter, page = f.split('_')
        os.rename(f, page)
