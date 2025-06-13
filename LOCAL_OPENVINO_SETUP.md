# Local OpenVINO Model Inference Setup Guide

## Overview

This guide explains how to set up and use local OpenVINO models for inference within this application. This feature allows you to run supported Large Language Models (LLMs) on your local hardware (CPU or Intel NPU) using the OpenVINO™ toolkit, providing an alternative to cloud-based models.

## Prerequisites

Before you begin, ensure you have the following:

*   **Node.js:** Version 20.0.0 or higher (and npm).
*   **Python:** Version 3.9 or higher recommended.
*   **Intel Hardware (for NPU):**
    *   An Intel CPU with integrated NPU (e.g., Intel® Core™ Ultra processors).
    *   Latest Intel NPU drivers installed. Refer to [Intel's NPU Driver Page](https://www.intel.com/content/www/us/en/download/794734/intel-npu-driver-windows.html) (or search for your specific OS).
    *   Note: If NPU hardware/drivers are unavailable or not correctly configured, inference can fall back to CPU.
*   **OpenVINO™ Toolkit:**
    *   Core Toolkit: Version 2025.1 or later is recommended. Installation of Python packages below usually handles this.
*   **OpenVINO GenAI and Python Packages:**
    *   `openvino-genai`
    *   `openvino`
    *   `optimum-intel` (for model conversion)
    *   `nncf` (for quantization)
    *   `onnx` (often a dependency for optimum)
    *   `flask` (for the Python inference server)

## Setup Instructions

### 1. Clone the Repository (if applicable)

If you haven't already, clone the application repository to your local machine.
```bash
git clone <repository_url>
cd <repository_directory>
```

### 2. Python Environment Setup

It's highly recommended to use a Python virtual environment.

*   **Create a virtual environment:**
    ```bash
    python -m venv .venv
    ```

*   **Activate the virtual environment:**
    *   On Windows:
        ```bash
        .venv\Scripts\activate
        ```
    *   On macOS/Linux:
        ```bash
        source .venv/bin/activate
        ```

*   **Install Python dependencies:**
    Ensure you have a `requirements.txt` file in the project root that includes at least:
    ```
    flask
    openvino-genai
    openvino>=2025.1
    optimum[openvino,nncf]
    # onnx might be pulled by optimum, but can be listed explicitly
    onnx
    ```
    Then run:
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: `optimum[openvino,nncf]` installs `optimum-intel` and its dependencies for OpenVINO and NNCF.)*

### 3. Node.js Environment Setup

Install the Node.js dependencies for the main application:
```bash
npm install
```

### 4. Model Conversion

Local inference requires models in the OpenVINO Intermediate Representation (IR) format. For NPU, INT4 symmetric quantization is preferred.

*   **Download a base model:**
    Choose a model supported by OpenVINO NPU (see `openvino_llm_npu_research.txt` for more examples).
    Example using `microsoft/Phi-3-mini-4k-instruct`:
    *(You don't need to download it manually; `optimum-cli` will fetch it.)*

*   **Convert the model to OpenVINO INT4 for NPU:**
    Run the following command in your terminal (ensure your Python virtual environment with `optimum-cli` is active):
    ```bash
    optimum-cli export openvino --model microsoft/Phi-3-mini-4k-instruct --weight-format int4 --sym --ratio 1.0 --group-size 128 Phi-3-mini-4k-instruct-int4-npu
    ```
    This command will:
    *   Download the `microsoft/Phi-3-mini-4k-instruct` model from Hugging Face.
    *   Convert it to OpenVINO IR format.
    *   Apply INT4 symmetric quantization (`--weight-format int4 --sym`).
    *   Use a group size of 128 (`--group-size 128`), which is recommended for NPU.
    *   Save the converted model into a new directory named `Phi-3-mini-4k-instruct-int4-npu` in your current working directory.

*   **Model Placement:**
    The converted model directory (e.g., `Phi-3-mini-4k-instruct-int4-npu`) can be placed anywhere, but you'll need to provide its path when starting the Python inference server. For ease, you might place it in the project's root or a dedicated `models` subfolder.

### 5. Running the Python Inference Server

*   **Start the server:**
    From your project root (with the Python virtual environment active):
    ```bash
    python openvino_inference_server.py --model-path ./Phi-3-mini-4k-instruct-int4-npu --device NPU
    ```
    Replace `./Phi-3-mini-4k-instruct-int4-npu` with the actual path to your converted model directory if it's different.
    *   To use CPU: `--device CPU`
    *   To change port (default is 5001): `--port <your_port_number>`

*   You should see log messages indicating the server has started and the LLMPipeline is initialized.

### 6. Running the Node.js Application

*   **Start the main application:**
    In a new terminal, from the project root:
    ```bash
    node index.js
    ```
    (Or your application's specific start command)

*   **Select Local OpenVINO Model:**
    In the application's UI, when prompted to choose a model, select the option similar to:
    `Local OpenVINO (openvino_local_phi3_mini_npu)`
    The name in parentheses might reflect `defaultLocalModelName` from `config.js`. The key identifier is `openvino_local`.

## Configuration

*   **`config.js`:**
    *   `localOpenVinoServerUrl`: This setting in `config.js` (located in the project root) defines the URL for the Python inference server. By default, it is `http://localhost:5001/generate`. Ensure this matches the host and port your Python server is running on.

## Troubleshooting

*   **Python Server Not Running / Connection Refused:**
    *   Ensure you have started `openvino_inference_server.py` in its own terminal.
    *   Check that the port in `CONFIG.localOpenVinoServerUrl` matches the port the server is running on (default 5001).
    *   Look for error messages in the Python server's console output.
*   **Model Path Errors (Server-side):**
    *   "Error: Model path <...> not found or is not a valid directory."
        *   Verify the `--model-path` provided when starting the server is correct and points to a directory containing the `openvino_model.xml` and `.bin` files.
*   **NPU Driver Issues / NPU Not Detected:**
    *   Server log might show "NPU device is not available" or similar.
    *   Ensure NPU drivers are correctly installed for your Intel hardware.
    *   Try running with `--device CPU` to confirm the rest of the setup works.
    *   You can check for OpenVINO NPU detection using OpenVINO's [benchmark_app](https://docs.openvino.ai/latest/get_started/learn_openvino/openvino_samples/benchmark_tool.html) or sample Python scripts from OpenVINO documentation (e.g., `hello_query_device`).
*   **OpenVINO Environment Problems:**
    *   Ensure your Python virtual environment is activated and all dependencies from `requirements.txt` are installed correctly.
    *   Conflicts with other Python packages: Try setting up in a clean virtual environment.
*   **Incorrect Model Conversion for NPU:**
    *   If NPU performance is poor or you encounter errors, double-check the `optimum-cli` conversion command. NPU typically requires INT4 symmetric quantization with specific parameters like `--group-size`.
*   **"LLMPipeline not initialized" error in Node.js app:**
    * This means the Python server started, but the `LLMPipeline` object within it failed to load. Check the Python server's console output for detailed errors (e.g., model loading issues, OpenVINO runtime errors).

This concludes the setup guide. You should now be able to use local OpenVINO models for inference.
