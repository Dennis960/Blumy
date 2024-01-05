import os
import zipfile
import shutil
import glob
import pickle
from werkzeug.datastructures import FileStorage
from casemaker import settings


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

    def _board_settings_path(self, project_id: str, version: int) -> str:
        return os.path.join(self._settings_root(project_id, version), "board_settings.pkl")

    def store_board_settings(self, project_id: str, version: int, board_settings: settings.BoardSettings):
        board_settings_path = self._board_settings_path(project_id, version)
        with open(board_settings_path, "wb") as f:
            # TODO use JSON or another secure format
            pickle.dump(board_settings, f)

    def load_board_settings(self, project_id: str, version: int) -> settings.BoardSettings:
        board_settings_path = self._board_settings_path(project_id, version)
        if not os.path.exists(board_settings_path):
            return None

        with open(board_settings_path, "rb") as f:
            return pickle.load(f)
