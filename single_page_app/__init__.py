from flask import Flask
from turbo_flask import Turbo
from my_worker import MyWorker

def create_app():
    app = Flask(__name__)
    turbo = Turbo(app)
    worker = MyWorker(storage={})
    
    app.config['turbo'] = turbo
    app.config['worker'] = worker
    
    from single_page_app.route_main_page import main_blueprint
    from single_page_app.route_questions_page import questions_blueprint
    from single_page_app.route_status import status
    from single_page_app.route_download import download
    from single_page_app.route_help import show_help, show_training_video
    
    app.register_blueprint(main_blueprint)
    app.register_blueprint(questions_blueprint)
    
    return app