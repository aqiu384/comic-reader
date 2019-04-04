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

# boxes: Input text areas
# imgfile: Input comic page
# textfile: Output text-only page
# pagefile: Output img-only page
@app.route('/run-ocr', methods=['GET', 'POST'])
def ocrPost():
    try:
        req = request.get_json()

        result = isolateText(req['imgfile'], req['boxes'])
        cv2.imwrite(req['textfile'], result['textimg'])
        cv2.imwrite(req['pagefile'], result['pageimg'])
        runOcr(req['textfile'], result['boxes'])

        return jsonify({ 'boxes': result['boxes'] })
    except FileNotFoundError as e:
        return make_response(jsonify({ 'error': str(e) }), 404)

if __name__ == '__main__':
    DEBUG = os.environ.get('COMIC_OCR_DEBUG', '') != ''
    app.run(host='0.0.0.0', debug=DEBUG)
