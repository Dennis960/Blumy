import os
import zipfile
import shutil
import glob
import pickle
from werkzeug.datastructures import FileStorage
from casemaker import settings
from dataclasses import dataclass


@dataclass
class Settings:
    board_settings: settings.BoardSettings
    case_settings: settings.CaseSettings


class ProjectRepository:
    def __init__(self, root: str):
        self._root = root

    def project_root(self, project_id: str) -> str:
        return os.path.join(self._root, project_id)

    def _settings_root(self, project_id: str, version: int) -> str:
        directory_path = os.path.join(self.project_root(project_id), str(version))
        os.makedirs(directory_path, exist_ok=True)
        return directory_path

    def store_pcb(self, project_id: str, filename: str, file: FileStorage):
        """
        Store the file, unpack if it is a zip
        """
        directory_path = self.project_root(project_id)
        os.makedirs(directory_path)
        file_path = os.path.join(directory_path, filename)
        file.save(file_path)
        print("Storing upload for project {} at {}".format(project_id, file_path))

        if zipfile.is_zipfile(file_path):
            with zipfile.ZipFile(file_path, "r") as zip_ref:
                zip_ref.extractall(directory_path) # TODO ensure secure unpack

            os.remove(file_path)

            # if the zip contains (just) a single folder, move all its contents up
            extracted_dirs = glob.glob(os.path.join(directory_path, '*'))
            if len(extracted_dirs) == 1 and os.path.isdir(extracted_dirs[0]):
                for file_path in glob.glob(os.path.join(extracted_dirs[0], '*')):
                    shutil.move(file_path, directory_path)
                os.rmdir(extracted_dirs[0])

    def pcb_path(self, project_id: str) -> str:
        """
        Full path to the first kicad_pcb file
        """
        return next(glob.iglob(os.path.join(self.project_root(project_id), '*.kicad_pcb')), '')

    def step_filename(self) -> str:
        return "board.step"

    def cache_path(self, project_id: str) -> str:
        """
        Working directory for casemaker
        """
        return os.path.join(self.project_root(project_id), "cache")

    def _board_cache_path(self, project_id: str) -> str:
        return os.path.join(self.project_root(project_id), "board.pkl")

    def export_base(self, project_id: str, version: int) -> str:
        return os.path.join(self._settings_root(project_id, version), "case")

    def _settings_path(self, project_id: str, version: int) -> str:
        return os.path.join(self._settings_root(project_id, version), "settings.pkl")

    def _store_settings(self, project_id: str, version: int, board_settings: Settings):
        settings_path = self._settings_path(project_id, version)
        with open(settings_path, "wb") as f:
            # TODO use JSON or another secure format
            pickle.dump(board_settings, f)

    def _load_settings(self, project_id: str, version: int) -> Settings:
        settings_path = self._settings_path(project_id, version)
        if not os.path.exists(settings_path):
            return Settings(board_settings=None, case_settings=None)

        with open(settings_path, "rb") as f:
            return pickle.load(f)

    def increment_version(self, project_id: str, version: int) -> int:
        # TODO detect and prevent overwriting versions
        # copy settings to create a new version
        settings = self._load_settings(project_id, version)
        new_version = version + 1
        self._store_settings(project_id, new_version, settings)
        return new_version

    def store_board_settings(self, project_id: str, version: int, board_settings: settings.BoardSettings):
        settings = self._load_settings(project_id, version)
        settings.board_settings = board_settings
        self._store_settings(project_id, version, settings)

    def load_board_settings(self, project_id: str, version: int) -> settings.BoardSettings:
        return self._load_settings(project_id, version).board_settings

    def store_case_settings(self, project_id: str, version: int, case_settings: settings.CaseSettings):
        settings = self._load_settings(project_id, version)
        settings.case_settings = case_settings
        self._store_settings(project_id, version, settings)

    def load_case_settings(self, project_id: str, version: int) -> settings.CaseSettings:
        return self._load_settings(project_id, version).case_settings
