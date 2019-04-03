import os
import cv2
import json
from flask import Flask, request, jsonify, make_response
from ocr import isolateText, runOcr

app = Flask(__name__)

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

@app.route('/')
def home():
    return jsonify({ 'status': 'OCR ready' })

# boxfile: Input text area list
# imgfile: Input comic page
# textfile: Output text-only page
# pagefile: Output img-only page
# newboxfile: Output text area list
@app.route('/run-ocr', methods=['GET', 'POST'])
def ocrPost():
    try:
        req = request.get_json()

        with open(req['boxfile']) as jsonfile:
            boxes = json.load(jsonfile)

        res = isolateText(req['imgfile'], boxes)
        cv2.imwrite(req['textfile'], res['textimg'])
        cv2.imwrite(req['pagefile'], res['pageimg'])
        runOcr(req['textfile'], res['boxes'])

        with open(req['newboxfile'], 'w+') as jsonfile:
            boxes = json.dump(res['boxes'], jsonfile, indent=2, sort_keys=True, ensure_ascii=False)

        return jsonify({ 'status': 'OCR finished' })
    except FileNotFoundError as e:
        return make_response(jsonify({ 'error': str(e) }), 404)

if __name__ == '__main__':
    DEBUG = os.environ.get('COMIC_OCR_DEBUG', '') != ''
    app.run(host='0.0.0.0', debug=DEBUG)
