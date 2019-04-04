import re
import json
import cv2
import pytesseract
import numpy as np
from PIL import Image, ImageDraw

def isolateText(imgfile, boxes, boxPadding=0):
    img = cv2.imread(imgfile)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, bwimg = cv2.threshold(img, 127, 255, cv2.THRESH_OTSU)
    fnimg = np.zeros(img.shape)

    for box in boxes:
        x, y, w, h = [box[x] for x in 'xywh']
        crimg = bwimg[y:y + h, x:x + w]
        cv2.floodFill(crimg, None, (0, int(h / 2)), 200)
        crimg[:, w - 1] = 255
        crimg[0, :] = 255
        crimg[h - 1, :] = 255
        cv2.floodFill(crimg, None, (0, 0), 0)
        cv2.floodFill(crimg, None, (0, 0), 100)
        crimg = np.where(crimg == 100, 0, 255)

        fnimg[y:y + h, x:x + w] = crimg

    fnimg = cv2.erode(fnimg, np.ones((5, 5), np.uint8))
    _, bwimg = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY_INV|cv2.THRESH_OTSU)
    bwimg = np.where(fnimg, bwimg, 0)

    boxes = [x for x in boxes if x.get('type', 'ocr') == 'ocr']
    newBoxes = []

    for box in boxes:
        x, y, w, h = [box[x] for x in 'xywh']
        crimg = bwimg[y:y + h, x:x + w]
        x1, y1, w1, h1 = cv2.boundingRect(cv2.findNonZero(crimg))
        newBoxes.append({ 'x': x, 'y': y, 'w': w, 'h': h })

    textOnly = np.where(fnimg, img, 255)
    pageOnly = np.where(fnimg, 255, 0)
    pageOnly = cv2.merge((pageOnly, pageOnly, pageOnly, pageOnly))

    return {
      'textimg': textOnly,
      'pageimg': pageOnly,
      'boxes': boxes
    }

def runOcr(imgfile, boxes):
    img = Image.open(imgfile)
    
    for box in boxes:
        x, y, w, h = [box[x] for x in 'xywh']
        crimg = img.crop((x, y, x + w, y + h))
        text = pytesseract.image_to_string(crimg, lang='jpn_vert')
        text = re.sub('\s+', '', text)
        box['raw'] = text

    return boxes
