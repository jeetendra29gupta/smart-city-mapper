from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit
from tinydb import TinyDB, Query
from tinydb.operations import increment

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize TinyDB
db = TinyDB('features.json')
features_table = db.table('features')
meta_table = db.table('meta')

# Initialize meta table for primary key counter
if not meta_table.contains(Query().key == 'id_counter'):
    meta_table.insert({'key': 'id_counter', 'value': 0})


def get_next_id():
    meta_table.update(increment('value'), Query().key == 'id_counter')
    return meta_table.get(Query().key == 'id_counter')['value']


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')


@app.route('/get_features', methods=['GET'])
def get_features():
    return jsonify({
        "type": "FeatureCollection",
        "features": features_table.all()
    })

@socketio.on('add_feature')
def add_feature(data):
    # Auto-increment ID
    new_id = get_next_id()
    data['id'] = new_id
    features_table.insert(data)

    emit('map_updated', {
        "type": "FeatureCollection",
        "features": features_table.all()
    }, broadcast=True)


@socketio.on('delete_feature')
def delete_feature(data):
    feature_id = data.get('id')
    features_table.remove(Query().id == feature_id)

    emit('map_updated', {
        "type": "FeatureCollection",
        "features": features_table.all()
    }, broadcast=True)



if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8181, debug=True)
