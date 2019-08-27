# Browsers don't like absolute paths for local HTML files, hence this script.
from flask import Flask, render_template, send_from_directory

app = Flask(__name__, template_folder='docs')

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/blog/')
def blog():
    return render_template("blog/index.html")

@app.route('/about/')
def about():
    return render_template("about/index.html")

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('compiled/css', path)
