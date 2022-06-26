import os
import shutil
import subprocess
import json

dir_path = os.path.dirname(os.path.realpath(__file__)).replace("\\", "/")

build_path = dir_path + "/build/"
data_path = dir_path + "/../../data/"


p = subprocess.Popen(["npm", "run", "build"], cwd=dir_path, shell=True)
p.wait()

print(build_path, data_path)

for file in os.listdir(data_path):
    os.unlink(os.path.join(data_path, file))

for file in os.listdir(build_path):
    if (file == "asset-manifest.json"):
        with open(build_path + file, "r") as file:
            data = json.load(file)
            files = data["files"]
            for filename in files:
                if (filename in ["main.css", "main.js", "index.html"]):
                    shutil.copy(build_path + files[filename], data_path + filename)
