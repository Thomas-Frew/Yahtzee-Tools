from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import pandas as pd
import data_processing as dp

app = Flask(__name__)
model_name = "output_model.keras"
model = None

def process_data(data):
    df = pd.DataFrame([data])
    
    # Add headers and eliminate non-float data
    df = dp.add_headers(df)
    df = dp.trim_id(df)
    
    # Reinterpret data as numeric
    df = df.replace("", np.nan)
    df = df.astype(float)
    
    # Impute NaNs
    df = dp.mask_data(df)
    df = dp.impute_nans(df)
    
    # Split and scale the data 
    df, _ = dp.split_xy(df)
    df = dp.scale_data(df, False)
    
    return df

@app.route('/', methods=['POST'])
def evaluate_position():
    data = request.get_json()
    print('Received data:', data)
    
    predicted_scores = []
    for value in data:
        value = process_data(value)
        evaluation = int(model.predict(value)[0][0])
        predicted_scores.append(evaluation)
        
    return jsonify({"evaluations": predicted_scores})

if __name__ == '__main__':
    CORS(app)
    model = tf.keras.models.load_model(model_name)

    print("Starting app...")
    app.run(port=2763)
    
