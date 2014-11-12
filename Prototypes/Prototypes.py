from flask import *

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/strum')
def strum():
    return render_template('static-prototype.html')

@app.route('/keyboard')
def keyboard():
    return render_template('follow-prototype.html')

if __name__ == '__main__':
    app.run()
