# End-to-End Test Plan for Local OpenVINO Inference

This document outlines test cases for validating the setup and functionality of local OpenVINO model inference.

## 1. Environment & Setup

*   **Test Case 1.1: Python Environment Setup**
    *   **Objective:** Verify successful setup of Python virtual environment and installation of all dependencies.
    *   **Steps:**
        1.  Follow Python environment setup in `LOCAL_OPENVINO_SETUP.md`.
        2.  Create virtual environment.
        3.  Activate virtual environment.
        4.  Run `pip install -r requirements.txt`.
    *   **Expected Result:** All packages in `requirements.txt` (Flask, openvino-genai, openvino, optimum-intel, nncf, onnx) install without errors.

*   **Test Case 1.2: Node.js Environment Setup**
    *   **Objective:** Verify successful installation of Node.js dependencies.
    *   **Steps:**
        1.  Run `npm install`.
    *   **Expected Result:** All Node.js packages (including `axios`) install without errors.

*   **Test Case 1.3: Model Conversion (Phi-3-mini for NPU)**
    *   **Objective:** Verify successful model conversion of `microsoft/Phi-3-mini-4k-instruct` to INT4 OpenVINO IR for NPU.
    *   **Steps:**
        1.  Activate Python virtual environment.
        2.  Run the command:
            ```bash
            optimum-cli export openvino --model microsoft/Phi-3-mini-4k-instruct --weight-format int4 --sym --ratio 1.0 --group-size 128 Phi-3-mini-4k-instruct-int4-npu
            ```
    *   **Expected Result:** The command completes successfully, creating a directory named `Phi-3-mini-4k-instruct-int4-npu` containing `openvino_model.xml`, `openvino_model.bin`, and other metadata files.

*   **Test Case 1.4: Model Conversion (TinyLlama for NPU)**
    *   **Objective:** Verify successful model conversion of `TinyLlama/TinyLlama-1.1B-Chat-v1.0` to INT4 OpenVINO IR for NPU.
    *   **Steps:**
        1.  Activate Python virtual environment.
        2.  Run the command:
            ```bash
            optimum-cli export openvino --model TinyLlama/TinyLlama-1.1B-Chat-v1.0 --weight-format int4 --sym --ratio 1.0 --group-size 128 TinyLlama-1.1B-Chat-v1.0-int4-npu
            ```
    *   **Expected Result:** The command completes successfully, creating a directory named `TinyLlama-1.1B-Chat-v1.0-int4-npu`.


## 2. Python Inference Server (`openvino_inference_server.py`)

*   **Test Case 2.1: Server Startup - NPU Device**
    *   **Objective:** Verify the server starts correctly with a valid model and NPU device.
    *   **Steps:**
        1.  Run `python openvino_inference_server.py --model-path ./Phi-3-mini-4k-instruct-int4-npu --device NPU`.
    *   **Expected Result:** Server starts without errors, logs indicate `LLMPipeline initialized successfully for device: NPU`.

*   **Test Case 2.2: Server Startup - CPU Device**
    *   **Objective:** Verify the server starts correctly with a valid model and CPU device.
    *   **Steps:**
        1.  Run `python openvino_inference_server.py --model-path ./Phi-3-mini-4k-instruct-int4-npu --device CPU`.
    *   **Expected Result:** Server starts without errors, logs indicate `LLMPipeline initialized successfully for device: CPU`.

*   **Test Case 2.3: Server Startup - Invalid Model Path**
    *   **Objective:** Verify the server handles an invalid model path gracefully.
    *   **Steps:**
        1.  Run `python openvino_inference_server.py --model-path ./non_existent_model --device CPU`.
    *   **Expected Result:** Server may still start (as per current implementation), but logs should show an error during `initialize_pipeline` (e.g., "LLMPipeline not initialized. Check server logs."). Subsequent API calls should fail.

*   **Test Case 2.4: `/generate` Endpoint - Valid Request**
    *   **Objective:** Verify the `/generate` endpoint processes a valid POST request.
    *   **Steps:**
        1.  Start the server (e.g., with Phi-3 mini on CPU).
        2.  Send a POST request to `http://localhost:5001/generate` with JSON payload: `{"prompt": "Translate 'hello' to French", "max_new_tokens": 5}`.
    *   **Expected Result:** HTTP 200 OK response with JSON body like `{"generated_text": "Bonjour"}` (actual text will vary).

*   **Test Case 2.5: `/generate` Endpoint - Default `max_new_tokens`**
    *   **Objective:** Verify the server uses default `max_new_tokens` if not provided.
    *   **Steps:**
        1.  Start the server.
        2.  Send POST request to `http://localhost:5001/generate` with `{"prompt": "Short story:"}`.
    *   **Expected Result:** HTTP 200 OK, generated text uses server-side default for `max_new_tokens` (currently 100 in `openvino_inference_server.py`).

*   **Test Case 2.6: `/generate` Endpoint - Invalid Input (Missing Prompt)**
    *   **Objective:** Verify the server returns an error for invalid requests.
    *   **Steps:**
        1.  Start the server.
        2.  Send POST request to `http://localhost:5001/generate` with JSON `{"max_new_tokens": 50}`.
    *   **Expected Result:** HTTP 400 Bad Request with JSON error message like `{"error": "Missing 'prompt' in request body"}`.

## 3. Node.js Application - Local Inference Path

*   **Test Case 3.1: Model Selection in UI**
    *   **Objective:** Verify the local OpenVINO model appears in the UI model selection list.
    *   **Steps:**
        1.  Run `node index.js`.
        2.  Navigate to the model selection interface (e.g., choose "Change model" action).
    *   **Expected Result:** An option like "Local OpenVINO (openvino_local_phi3_mini_npu)" is available.

*   **Test Case 3.2: Successful Local Inference Request**
    *   **Objective:** Verify successful end-to-end request from Node.js app to Python server.
    *   **Steps:**
        1.  Ensure Python server is running with a converted model (e.g., Phi-3 mini on CPU).
        2.  Run `node index.js`.
        3.  Select the "openvino_local" model.
        4.  Perform an action that triggers `model.getResponse()` (e.g., "Chat interface" or a generation task).
        5.  Enter a prompt like "What is OpenVINO?".
    *   **Expected Result:** The Node.js application displays a generated text response from the local OpenVINO model. Python server logs show request being processed.

*   **Test Case 3.3: Node.js Handles Server Connection Error**
    *   **Objective:** Verify Node.js app handles connection errors gracefully if Python server is not running.
    *   **Steps:**
        1.  Ensure Python server is NOT running.
        2.  Run `node index.js`, select "openvino_local" model.
        3.  Attempt a generation task.
    *   **Expected Result:** Node.js application displays an appropriate error message (e.g., "No response from OpenVINO server. Ensure it's running..."). Console shows error logs.

*   **Test Case 3.4: Node.js Handles Error Response from Server**
    *   **Objective:** Verify Node.js app handles JSON error responses from the Python server.
    *   **Steps:**
        1.  Start Python server *without* `--model-path` (or with an invalid one that causes `LLMPipeline` to be None).
        2.  Run `node index.js`, select "openvino_local" model.
        3.  Attempt a generation task.
    *   **Expected Result:** The Python server should return a 500 error (e.g., `{"error": "LLMPipeline not initialized..."}`). The Node.js application should display this error or a user-friendly version of it.

## 4. End-to-End Code Generation

*   **Test Case 4.1: Simple Code Generation (NPU)**
    *   **Objective:** Verify a basic code generation task using the local NPU model.
    *   **Steps:**
        1.  Convert `microsoft/Phi-3-mini-4k-instruct` for NPU.
        2.  Start Python server with the NPU model and `--device NPU`.
        3.  Run `node index.js`, select "openvino_local".
        4.  Use "Generate code" for a new file (e.g., `test_function.js`).
        5.  Provide a simple README instruction: "Create a JavaScript function that adds two numbers."
    *   **Expected Result:** `test_function.js` is created with a valid JavaScript function for adding two numbers. Output uses max_new_tokens specified in `codeGenerator.js` (e.g., 4096).

*   **Test Case 4.2: Simple Code Generation (CPU)**
    *   **Objective:** Verify the same task using the local CPU model.
    *   **Steps:**
        1.  Use the same NPU-converted model (INT4 is fine for CPU too).
        2.  Start Python server with the model and `--device CPU`.
        3.  Repeat steps from Test Case 4.1 (Node.js app).
    *   **Expected Result:** `test_function.js` is created with a valid JavaScript function. Performance might differ from NPU, but functionality should be similar.

## 5. (Optional) FP16 NPU Tests
*(Execute if an FP16 NPU path is specifically implemented and deemed viable for certain models/hardware)*

*   **Test Case 5.1: Model Conversion (FP16 for NPU)**
    *   **Objective:** Convert a model to FP16 OpenVINO IR potentially suitable for NPU (if specific flags or methods are identified).
    *   **Steps:** Use `optimum-cli export openvino --model <model_name> --precision fp16 <output_dir_fp16_npu>` (or other NPU-specific FP16 flags if found).
    *   **Expected Result:** Successful conversion to FP16 OpenVINO IR.
*   **Test Case 5.2: Python Server with FP16 NPU Model**
    *   **Objective:** Verify server runs with FP16 model on NPU.
    *   **Steps:** `python openvino_inference_server.py --model-path <path_to_fp16_model> --device NPU`.
    *   **Expected Result:** Server starts and loads the FP16 model on NPU.
*   **Test Case 5.3: End-to-End Code Generation (FP16 NPU)**
    *   **Objective:** Test code generation with FP16 NPU model.
    *   **Steps:** Repeat Test Case 4.1 using the FP16 NPU setup.
    *   **Expected Result:** Code is generated. Performance and accuracy characteristics to be noted.

**Note on FP16 for NPU:** Current OpenVINO documentation (2025.1) emphasizes INT4 symmetric quantization for LLMs on NPU via `openvino_genai`. FP16 is not highlighted as an optimized or preferred path for this specific use case. These FP16 tests should only be prioritized if new information or specific model/hardware combinations suggest FP16 NPU viability for LLMs.
