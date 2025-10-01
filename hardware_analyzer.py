import argparse
import json
import platform
import subprocess
import sys
from datetime import datetime

def get_cpu_info():
    """Gathers detailed CPU information."""
    try:
        import cpuinfo
        info = cpuinfo.get_cpu_info()
        return {
            "Model": info.get('brand_raw', "N/A"),
            "Vendor": info.get('vendor_id_raw', "N/A"),
            "Cores": f"{info.get('count', 'N/A')} physical",
            "Frequency": {
                "Current": f"{info.get('hz_actual_friendly', 'N/A')}",
                "Max": f"{info.get('hz_advertised_friendly', 'N/A')}",
            },
            "Architecture": info.get('arch', "N/A"),
        }
    except ImportError:
        return {"Error": "py-cpuinfo not installed. Please run: pip install py-cpuinfo"}
    except Exception as e:
        return {"Error": f"Could not retrieve CPU info: {e}"}

def get_memory_info():
    """Gathers memory (RAM) information."""
    try:
        import psutil
        mem = psutil.virtual_memory()
        return {
            "Total": f"{mem.total / (1024**3):.2f} GB",
            "Available": f"{mem.available / (1024**3):.2f} GB",
            "Used": f"{mem.used / (1024**3):.2f} GB ({mem.percent}%)",
        }
    except ImportError:
        return {"Error": "psutil not installed. Please run: pip install psutil"}
    except Exception as e:
        return {"Error": f"Could not retrieve memory info: {e}"}

def get_gpu_info():
    """Gathers basic GPU information."""
    # This is a placeholder. A more robust solution would use libraries like `py-nvml` for NVIDIA or `rocm-smi` for AMD.
    # For this general-purpose script, we'll rely on system commands that are more likely to be present.
    try:
        # For Linux, `lspci` is a good general tool.
        if sys.platform.startswith('linux'):
            result = subprocess.run(['lspci'], capture_output=True, text=True)
            gpus = [line for line in result.stdout.split('\n') if "VGA compatible controller" in line or "3D controller" in line]
            if gpus:
                # Extracting the name, which is often descriptive enough.
                return [{"Name": gpu.split(': ')[-1]} for gpu in gpus]
        # For Windows, `wmic` can be used.
        elif sys.platform.startswith('win32'):
            result = subprocess.run(['wmic', 'path', 'win32_videocontroller', 'get', 'caption'], capture_output=True, text=True)
            gpus = [line.strip() for line in result.stdout.split('\n') if line.strip() and "Caption" not in line]
            return [{"Name": gpu} for gpu in gpus]
        return [{"Name": "No standard GPU detection tool found for this OS."}]
    except FileNotFoundError:
        return [{"Error": "A command-line tool for GPU detection (like 'lspci' or 'wmic') was not found."}]
    except Exception as e:
        return [{"Error": f"An error occurred while detecting GPUs: {e}"}]


def get_disk_info():
    """Gathers disk storage information."""
    try:
        import psutil
        partitions = psutil.disk_partitions()
        disk_info = []
        for p in partitions:
            try:
                usage = psutil.disk_usage(p.mountpoint)
                disk_info.append({
                    "Device": p.device,
                    "Mountpoint": p.mountpoint,
                    "FileSystem": p.fstype,
                    "TotalSize": f"{usage.total / (1024**3):.2f} GB",
                    "Used": f"{usage.used / (1024**3):.2f} GB",
                    "Free": f"{usage.free / (1024**3):.2f} GB",
                    "UsagePercentage": f"{usage.percent}%",
                })
            except Exception:
                # Ignore partitions that cause errors (e.g., cd-rom with no media)
                continue
        return disk_info
    except ImportError:
        return {"Error": "psutil not installed. Please run: pip install psutil"}
    except Exception as e:
        return {"Error": f"Could not retrieve disk info: {e}"}

def generate_compiler_flags(cpu_info):
    """Generates recommended GCC/G++ compiler flags based on CPU architecture."""
    arch = cpu_info.get("Architecture", "").lower()
    vendor = cpu_info.get("Vendor", "").lower()

    if "x86" in arch or "amd64" in arch:
        # A simple approach for x86. A real-world tool would have a detailed CPU feature map.
        if "intel" in vendor:
            # Generic flags for modern Intel CPUs
            return {
                "Architecture": "-march=native",
                "Tune": "-mtune=native",
                "Optimization": "-O3 -flto",
                "Vectorization": "-ftree-vectorize",
                "Comment": "Using -march=native is often best for local builds."
            }
        elif "amd" in vendor:
            # Generic flags for modern AMD CPUs
            return {
                "Architecture": "-march=native",
                "Tune": "-mtune=native",
                "Optimization": "-O3 -flto",
                "Vectorization": "-ftree-vectorize",
                "Comment": "Using -march=native is often best for local builds."
            }
    # Placeholder for ARM
    elif "aarch64" in arch or "arm" in arch:
        return {
            "Architecture": "-march=native",
            "Tune": "-mtune=native",
            "Optimization": "-O3 -flto",
            "Comment": "Generic ARM flags. Specifics depend on the core (e.g., cortex-a72)."
        }

    return {"Flags": "Not determined for this architecture."}

def display_report(data):
    """Prints the hardware report in a human-readable format."""
    print("="*80)
    print("HARDWARE ENUMERATION & COMPILER OPTIMIZATION REPORT")
    print("="*80)
    print(f"Generated: {datetime.now().isoformat()}")
    print("\n" + "="*20 + " HARDWARE LISTING " + "="*20)

    # CPU
    print("\n🖥  CPU INFORMATION")
    print("."*40)
    for key, value in data['cpu'].items():
        if isinstance(value, dict):
            print(f"  {key}:")
            for sub_key, sub_value in value.items():
                print(f"    {sub_key}: {sub_value}")
        else:
            print(f"  {key}: {value}")

    # Memory
    print("\n💾 MEMORY INFORMATION")
    print("."*40)
    for key, value in data['memory'].items():
        print(f"  {key}: {value}")

    # GPU
    print("\n🎮 GRAPHICS CARDS")
    print("."*40)
    if isinstance(data['gpu'], list) and data['gpu']:
        for i, gpu in enumerate(data['gpu']):
            print(f"  GPU {i+1}:")
            for key, value in gpu.items():
                print(f"    {key}: {value}")
    else:
        print("  No GPUs detected or an error occurred.")


    # Disks
    print("\n💿 STORAGE DEVICES")
    print("."*40)
    if isinstance(data['disks'], list) and data['disks']:
        for i, disk in enumerate(data['disks']):
            print(f"  Disk {i+1}:")
            for key, value in disk.items():
                 print(f"    {key}: {value}")
    else:
         print("  No disks detected or an error occurred.")


    print("\n" + "="*20 + " OPTIMAL COMPILER FLAGS " + "="*20)
    # Compiler Flags
    print("\n🔧 GCC/G++ OPTIMIZATION")
    print("."*40)
    for key, value in data['compiler_flags'].items():
        print(f"  {key}: {value}")

    # Quick Copy Commands
    print("\n" + "="*20 + " QUICK COPY COMMANDS " + "="*20)
    flags = data['compiler_flags']
    cflags = f"{flags.get('Architecture', '')} {flags.get('Tune', '')} {flags.get('Optimization', '')}"
    print(f'\n# General Purpose Optimization')
    print(f'export CFLAGS="{cflags.strip()}"')
    print(f'export CXXFLAGS="$CFLAGS"')
    if 'Cores' in data['cpu'] and isinstance(data['cpu']['Cores'], str):
        try:
            core_count = int(data['cpu']['Cores'].split()[0])
            print(f'\n# Parallel Build (using {core_count} cores)')
            print(f'export MAKEFLAGS="-j{core_count}"')
        except (ValueError, IndexError):
            pass

    print("\n" + "="*80)


def main():
    """Main function to gather and display hardware info."""
    parser = argparse.ArgumentParser(description="A general-purpose hardware enumerator and compiler optimizer.")
    parser.add_argument('--json', action='store_true', help='Output the report in JSON format instead of human-readable text.')
    args = parser.parse_args()

    cpu_info = get_cpu_info()

    data = {
        "cpu": cpu_info,
        "memory": get_memory_info(),
        "gpu": get_gpu_info(),
        "disks": get_disk_info(),
        "compiler_flags": generate_compiler_flags(cpu_info),
        "system": {
            "OS": platform.system(),
            "Release": platform.release(),
            "Version": platform.version()
        }
    }

    if args.json:
        print(json.dumps(data, indent=4))
    else:
        display_report(data)

if __name__ == "__main__":
    # Check for necessary dependencies and guide the user if they are missing.
    try:
        import psutil
        import cpuinfo
    except ImportError as e:
        missing_module = str(e).split("'")[1]
        print(f"Error: Required Python package '{missing_module}' is not installed.", file=sys.stderr)
        print(f"Please install it by running: pip install {missing_module}", file=sys.stderr)
        sys.exit(1)

    main()