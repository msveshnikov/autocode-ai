import argparse
import os
import sys
import openvino_genai as ov_genai
from flask import Flask, request, jsonify
import logging # Moved import here

# --- Global Variables ---
app = Flask(__name__)
pipeline = None
# Model path and device will be set at startup via command-line arguments
MODEL_PATH = None
DEVICE = "NPU" # Default device

# --- Helper Functions ---
def initialize_pipeline(model_path_arg, device_arg):
    """Initializes the OpenVINO GenAI LLMPipeline."""
    global pipeline, MODEL_PATH, DEVICE
    MODEL_PATH = model_path_arg
    DEVICE = device_arg
    try:
        app.logger.info(f"Initializing LLMPipeline for device: {DEVICE} and model: {MODEL_PATH}")
        pipeline = ov_genai.LLMPipeline(MODEL_PATH, DEVICE)
        app.logger.info("LLMPipeline initialized successfully.")
    except Exception as e:
        app.logger.error(f"Error initializing LLMPipeline: {e}")
        # Depending on desired behavior, we might want to exit if model loading fails.
        # For now, it will allow the server to start but /generate will fail.
        pipeline = None

# --- Flask Endpoints ---
@app.route("/generate", methods=["POST"])
def generate():
    global pipeline, DEVICE
    if pipeline is None:
        return jsonify({"error": "LLMPipeline not initialized. Check server logs."}), 500

    try:
        data = request.get_json()
        if not data or "prompt" not in data:
            return jsonify({"error": "Missing 'prompt' in request body"}), 400

        prompt = data["prompt"]
        max_new_tokens = data.get("max_new_tokens", 100)

        # Device for this request - currently uses the globally loaded device.
        # If per-request device switching was desired and feasible with a single pipeline instance,
        # logic would be added here. For now, it uses the server's DEVICE.
        # requested_device = data.get("device", DEVICE)
        # if requested_device != DEVICE:
        #     # This would require re-initializing or a more complex pipeline management
        #     return jsonify({"error": f"Device switching per request not supported. Server loaded on {DEVICE}."}), 400


        app.logger.info(f"Received prompt: '{prompt}', max_new_tokens: {max_new_tokens}")

        generation_config = ov_genai.GenerationConfig()
        generation_config.max_new_tokens = int(max_new_tokens)
        # Add other configurable generation parameters if needed from request:
        # generation_config.temperature = float(data.get("temperature", 0.8))
        # generation_config.top_p = float(data.get("top_p", 0.9))

        app.logger.info(f"Generating text with max_new_tokens={generation_config.max_new_tokens}...")
        results = pipeline.generate(prompt, generation_config)

        generated_text = ""
        if isinstance(results, list) and len(results) > 0:
            generated_text = results[0]
        elif isinstance(results, str):
            generated_text = results
        else:
            if hasattr(results, 'texts') and len(results.texts) > 0:
                 generated_text = results.texts[0]
            elif hasattr(results, 'text'):
                 generated_text = results.text
            else:
                app.logger.error(f"Unexpected result type from pipeline: {type(results)}")
                return jsonify({"error": "Could not extract generated text from pipeline results."}), 500

        app.logger.info(f"Generated text: {generated_text}")
        return jsonify({"generated_text": generated_text})

    except Exception as e:
        app.logger.error(f"An error occurred during generation: {e}")
        return jsonify({"error": str(e)}), 500

# --- Main Application ---
def main():
    parser = argparse.ArgumentParser(description="Flask HTTP server for OpenVINO LLM inference.")
    parser.add_argument("--model-path", type=str, required=True,
                        help="Path to the OpenVINO IR model directory.")
    parser.add_argument("--device", type=str, default="NPU",
                        help="Device to run inference on (e.g., NPU, CPU, GPU). Default: NPU")
    parser.add_argument("--port", type=int, default=5001,
                        help="Port to run the Flask server on. Default: 5001")
    parser.add_argument("--host", type=str, default="0.0.0.0",
                        help="Host address to bind the Flask server to. Default: 0.0.0.0 (all interfaces)")

    args = parser.parse_args()

    initialize_pipeline(args.model_path, args.device)

    app.logger.info(f"Starting Flask server on {args.host}:{args.port}")
    app.run(host=args.host, port=args.port)

if __name__ == "__main__":
    # It's good practice to set up logging for Flask applications
    app.logger.addHandler(logging.StreamHandler(sys.stdout))
    app.logger.setLevel(logging.INFO)
    # import logging # ensure logging is imported for the handlers -> This line removed
    main()
