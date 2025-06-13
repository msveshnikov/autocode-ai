import argparse
import os
from flask import Flask, request, jsonify
from openvino_genai import LLMPipeline

# Globals
app = Flask(__name__)
pipeline = None
model_path_g = None
device_g = None

def initialize_pipeline():
    """Initializes the OpenVINO LLM pipeline."""
    global pipeline
    try:
        print(f"Attempting to load model from: {model_path_g}")
        print(f"Target device: {device_g}")
        pipeline = LLMPipeline(model_path_g, device_g)
        print(f"LLMPipeline initialized successfully for device: {device_g}")
        return True
    except Exception as e:
        print(f"FATAL: Failed to initialize LLMPipeline. Error: {e}")
        pipeline = None
        return False

@app.route('/generate', methods=['POST'])
def generate():
    """Handle inference requests."""
    if not pipeline:
        return jsonify({"error": "LLMPipeline not initialized. Check server logs."}), 500

    try:
        data = request.get_json()
        prompt = data.get('prompt')
        max_new_tokens = data.get('max_new_tokens', 100) # Default to 100 tokens

        if not prompt:
            return jsonify({"error": "Missing 'prompt' in request body"}), 400

        print(f"Received request: max_new_tokens={max_new_tokens}")
        generated_text = pipeline(prompt, max_new_tokens=max_new_tokens)
        print("Successfully generated text.")

        return jsonify({"generated_text": generated_text})

    except Exception as e:
        print(f"Error during generation: {e}")
        return jsonify({"error": f"An error occurred during text generation: {str(e)}"}), 500

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="OpenVINO Local Inference Server")
    parser.add_argument('--model-path', type=str, required=True, help='Path to the OpenVINO IR model directory.')
    parser.add_argument('--device', type=str, default='NPU', help='Device for inference (e.g., NPU, CPU, GPU).')
    parser.add_argument('--port', type=int, default=5001, help='Port to run the server on.')
    args = parser.parse_args()

    model_path_g = args.model_path
    device_g = args.device

    if not os.path.isdir(model_path_g):
        print(f"Error: Model path '{model_path_g}' not found or is not a valid directory.")
    else:
        initialize_pipeline()

    app.run(host='0.0.0.0', port=args.port)
