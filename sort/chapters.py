#!/usr/bin/python3
import os
import json

chapters = {}
output = []

for f in sorted(os.listdir('.')):
    if f.endswith('.png') or f.endswith('.jpg'):
        chapter, page = f.split('_')

        if chapter not in chapters:
            chapters[chapter] = []
        
        chapters[chapter].append(f)

for chapter in sorted(chapters):
    if len(chapters[chapter]) > 2:
        output.append(chapters[chapter])

with open('chapters.json', 'w+') as jsonfile:
    json.dump(output, jsonfile, indent=2, sort_keys=True)