import os
from celery import Celery
from celery import Task
from flask import Flask
from flask import render_template


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(
        CELERY=dict(
            broker_url="redis://localhost",
            #result_backend="redis://localhost",
            task_ignore_result=True  # no task state is stored
        ),
        UPLOAD_ROOT="./upload",
        SECRET_KEY="changeme"
    )

    app.config.from_prefixed_env()
    app.config['UPLOAD_ROOT'] = os.path.abspath(app.config['UPLOAD_ROOT'])
    if not os.path.exists(app.config['UPLOAD_ROOT']):
        os.makedirs(app.config['UPLOAD_ROOT'])

    celery_init_app(app)

    @app.route("/")
    def index() -> str:
        return render_template("pages/index.html")

    from .views import projects

    app.register_blueprint(projects.bp)
    return app


def celery_init_app(app: Flask) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(app.config["CELERY"])
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app