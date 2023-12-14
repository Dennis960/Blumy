import os
import pickle
from flask import current_app
from . import parameters

def get_project_directory(project_id: str) -> str:
    return os.path.join(current_app.config['UPLOAD_ROOT'], project_id)

def get_project_version_directory(project_id: str, version: int) -> str:
    return os.path.join(get_project_directory(project_id), str(version))

def get_config_file(project_id: str, version: int) -> str:
    return os.path.join(get_project_version_directory(project_id, version), "config.pkl")

# TODO unsafe - do not use pickle
def read_config(project_id: str, version: int) -> parameters.CaseConfiguration:
    with open(get_config_file(project_id, version), 'rb') as file:
        return pickle.load(file)

def write_config(project_id: str, version: int, c: parameters.CaseConfiguration):
    version_dir = get_project_version_directory(project_id, version)
    os.makedirs(version_dir)
    with open(get_config_file(project_id, version), 'wb') as file:
        pickle.dump(c, file)

def get_project_cache_path(project_id: str):
    project_root = get_project_directory(project_id)
    return os.path.join(project_root, "cache")

def get_project_export_glb_path(project_id: str):
    project_root = get_project_directory(project_id)
    return os.path.join(project_root, "board.glb")

def get_project_version_export_base_path(project_id: str, version: int):
    project_version_root = get_project_version_directory(project_id, version)
    return os.path.join(project_version_root, "board")
