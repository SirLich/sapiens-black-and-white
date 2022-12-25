"""
This little utility allows you to quickly and easily create
shaders for Sapiens.

It functions by automatically pulling in required dependencies from the game
installation folder before compiling, allowing you to keep your project
clean.

Requires you to download compiler yourself.
"""

from pathlib import Path
import shutil
import subprocess
import shlex

# Set these as needed
SOURCE_SHADER_PATH = Path('C:/Program Files (x86)/Steam/steamapps/common/Sapiens/GameResources/glsl/')
VULKAN_COMPILER_PATH = Path('C:/VulkanSDK/1.3.224.1/Bin/glslc.exe')

# Don't adjust these
TEMP_PATH = Path('./shader_temp/')
SHADER_PATH = Path('./glsl/')
SPV_PATH = Path('./spv/')


def compile_shader(shader_path: Path):
	in_path = str(shader_path.resolve())
	out_path = str(shader_path.resolve()) + '.spv'
	
	command = shlex.split(
		f"{str(VULKAN_COMPILER_PATH)} {in_path} -std=450core -o {out_path}",
		posix=False
	)

	process = subprocess.Popen(command, stdout=subprocess.PIPE,  stderr=subprocess.PIPE, universal_newlines=True)
	stdout, stderr = process.communicate()
	
	print(stdout)
	print(stderr)

def main():
	#  Clean up the Run
	shutil.rmtree(TEMP_PATH, ignore_errors=True)
	shutil.rmtree(SPV_PATH, ignore_errors=True)
	SPV_PATH.mkdir()

	# Copy in Shaders
	shutil.copytree(SOURCE_SHADER_PATH, TEMP_PATH)
	shutil.copytree(SHADER_PATH, TEMP_PATH, dirs_exist_ok=True)

	# Compile Shaders
	for shader in SHADER_PATH.rglob('*'):
		compile_shader(TEMP_PATH.joinpath(*shader.parts[1:]))

	# Copy into Destination
	for shader in TEMP_PATH.rglob("*.spv"):
		destination = SPV_PATH.joinpath(*shader.parts[1:])
		shutil.copy(shader, destination)
	
	shutil.rmtree(TEMP_PATH, ignore_errors=True)

if __name__ == "__main__":
	main()