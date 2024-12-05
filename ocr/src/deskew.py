#!/usr/bin/python3
import os
import cv2
import time
import numpy as np

SRC_DIR = 'back2/'
DST_DIR = 'back0/'
BLACK_LEFT = 0 # 70
WHITE_RIGHT = 255 # 220
ERODE_RATIO = 0.001
CROP_RATIO = 0.001
OUTPUT_HEIGHT = 4000
POLL_SECS = 5

def deskew_and_crop(img):
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Clean leaks around border of scan
    _, page_mask = cv2.threshold(img, 1, 255, cv2.THRESH_BINARY)
    page_mask[0, :] = 255
    page_mask[-1, :] = 255
    page_mask[:, 0] = 255
    page_mask[:, -1] = 255
    src_height, src_width = page_mask.shape
    mask = np.zeros((src_height + 2, src_width + 2), np.uint8)
    cv2.floodFill(page_mask, mask, (0, 0), 0)

    # Remove dust
    erode_size = int(src_height * ERODE_RATIO)
    kernel = np.ones((erode_size, erode_size), np.uint8)
    kernel2 = np.ones((erode_size * 2, erode_size * 2), np.uint8)
    page_mask = cv2.erode(page_mask, kernel)
    page_mask = cv2.dilate(page_mask, kernel2)
    page_mask = cv2.erode(page_mask, kernel)

    # Find page contour
    page_cnt = []
    curr_max_area = 0
    contours, _ = cv2.findContours(page_mask, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contours:
        cnt_area = cv2.contourArea(cnt)
        if curr_max_area < cnt_area:
            curr_max_area = cnt_area
            page_cnt = cnt

    # Smooth page contour
    epsilon = 0.05 * cv2.arcLength(page_cnt, True)
    page_cnt = cv2.approxPolyDP(page_cnt, epsilon, True)

    # Give up if page contour does not have four sides
    if len(page_cnt) != 4:
        return page_mask

    # Cycle through page contour until top-right corner is first
    top_right_ind = 0
    top_right_min = 9999
    for i, cnt in enumerate(page_cnt):
        if top_right_min > sum(cnt[0]):
            top_right_ind = i
            top_right_min = sum(cnt[0])
    src_corners = np.array([x for x in page_cnt[top_right_ind:]] + [x for x in page_cnt[:top_right_ind]])

    # Deskewed page should use max width and height of tilted page
    cnt_lens = []
    for i in range(len(page_cnt)):
        cnt_lens.append(round(np.linalg.norm(page_cnt[i - 1] - page_cnt[i])))
    cnt_lens.sort()
    dst_width = cnt_lens[1]
    dst_height = cnt_lens[3]
    dst_corners = np.array([[0, 0], [0, dst_height], [dst_width, dst_height], [dst_width, 0]])

    # Deskew page
    proj_matrix, mask = cv2.findHomography(src_corners, dst_corners, cv2.RANSAC)
    page = cv2.warpPerspective(img, proj_matrix, (dst_width, dst_height))

    def crop_pages():
        yield page
        yield np.transpose(page)
        yield np.flip(page)
        yield np.flip(np.transpose(page))

    # Crop black edges
    crop_max = int(src_height * CROP_RATIO)
    avg_black = BLACK_LEFT
    avg_white = int(WHITE_RIGHT * 0.8)
    crops = []
    for crop_page in crop_pages():
        crop_depth = 0
        if np.mean(crop_page[crop_max, :]) > avg_white:
            for depth in range(crop_max):
                if np.mean(crop_page[depth, :]) > avg_black:
                    break
                crop_depth = depth + 2
        crops.append(crop_depth)

    # print(crops)
    page = page[crops[0]:page.shape[0] - crops[2], crops[1]:page.shape[1] - crops[3]]

    # Resize page
    if OUTPUT_HEIGHT > 0:
        page = cv2.resize(page, (int(page.shape[1] * OUTPUT_HEIGHT / page.shape[0]), OUTPUT_HEIGHT))

    # Contrast stretch page
    if BLACK_LEFT != 0 or WHITE_RIGHT != 255:
        cont_lookup = np.interp(np.arange(256), [BLACK_LEFT, WHITE_RIGHT], [0, 255]).astype(np.uint8)
        page = cv2.LUT(page, cont_lookup)

    # Done
    return page

PREVIEWER = """
<!DOCTYPE html>
<html>
  <head>
    <title>Typesetting Preview</title>
  </head>
  <style>
    table.center {
      text-align:center; 
      margin-left:auto; 
      margin-right:auto;
    }
  </style>
  <body style="background-color:white;">
    <table id="images" class="center"> 
      <tbody></tbody>
    </table>
  </body>
</html>
"""

def update_imgs(src_dir, dst_dir):
    todo = sorted([x for x in os.listdir(src_dir) if x.endswith('.png')])
    done = sorted([x for x in os.listdir(dst_dir) if x.endswith('.png')])

    for fname in done:
        if fname not in todo:
            print('Deleting ', fname)
            os.remove(dst_dir + fname)
    for fname in todo:
        if fname not in done:
            print('Processing ', fname)
            img = cv2.imread(src_dir + fname)
            img = deskew_and_crop(img)
            cv2.imwrite(dst_dir + fname, img)

            thumbs = [f'<tr><td><img src="{DST_DIR}{x}"></td></tr>' for x in todo]
            thumb_table = f'<tbody>{"        \n".join(thumbs)}\n</tbody>'
            with open('preview.html', 'w+') as htmlfile:
                htmlfile.write(PREVIEWER.replace('<tbody></tbody>', thumb_table))
            break

if __name__ == '__main__':
    os.mkdir(SRC_DIR)
    os.mkdir(DST_DIR)
    loop = True
    while loop:
        try:
            update_imgs(SRC_DIR, DST_DIR)
            time.sleep(POLL_SECS)
        except KeyboardInterrupt:
            loop = False
