from flask import Flask
from turbo_flask import Turbo
from my_worker import MyWorker
from single_page_app.route_main_page import main_blueprint
from single_page_app.route_questions_page import questions_blueprint

def create_app():
    app = Flask(__name__)
    turbo = Turbo(app)
    worker = MyWorker(storage={})
    
    app.config['turbo'] = turbo
    app.config['worker'] = worker

    app.register_blueprint(main_blueprint)
    app.register_blueprint(questions_blueprint)

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)