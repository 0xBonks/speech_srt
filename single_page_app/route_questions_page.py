from flask import Blueprint, request, current_app
import utils
from .app_page_controller import AppPageController

questions_blueprint = Blueprint('questions', __name__)

@questions_blueprint.route('/questions', methods=['GET', 'POST'])
def questions_page():
    turbo = current_app.config['turbo']
    worker = current_app.config['worker']
    
    page = AppPageController(turbo, request, worker, "questions.html")
    
    if request.method == "GET":
        return page.full_render()

    page.restore_context()
    page.text = page.get_textarea()
    page.freeze()

    if page.is_action_reset():
        page.reset()

    elif page.is_action_refresh():
        page.update_data()

    return page.update()