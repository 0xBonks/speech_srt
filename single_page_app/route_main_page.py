from flask import Blueprint, request, current_app
import utils
from .app_page_controller import AppPageController

main_blueprint = Blueprint('main', __name__)

@main_blueprint.route('/', methods=['GET', 'POST'])
def main_page():
    turbo = current_app.config['turbo']
    worker = current_app.config['worker']
    
    page = AppPageController(turbo, request, worker, "index.html")
    
    if request.method == "GET":
        return page.full_render()

    page.restore_context()
    page.text = page.get_textarea()
    page.freeze()
    
    voices = page.get_voices()

    if page.is_action_reset():
        page.reset()

    elif page.is_action_change_orig_lang():
        page.clear_download_link()
        page.orig_lang = page.get_selected_orig_lang()

    elif page.is_action_add_lang():
        page.clear_download_link()
        if added_lang := page.get_added_lang():
            page.add_lang(added_lang)

    elif page.is_action_play_current_line():
        try:
            pos = page.get_cursor_position()
        except ValueError:
            return page.update()
        line_of_text = utils.escape_xml_reserved_chars(utils.get_line_by_pos(page.text, pos))
        page.play_current_line(line_of_text, voices)

    elif page.is_action_makeit():
        page.clear_download_link()
        text = utils.escape_xml_reserved_chars(page.text)
        page.makeit_start(text, voices)


    elif page.is_action_refresh_makeit_progress():
        if page.cur_makeit_worker:
            page.makeit_result()

        if page.cur_translate_worker:
            page.add_lang_result()

    elif page.is_action_terminate():
        if page.cur_makeit_worker:
            worker.clear(page.cur_makeit_worker)
            page.cur_makeit_worker = ""
            page.cur_makeit_progress = 0

    elif page.is_action_terminate_translate():
        if page.cur_translate_worker:
            worker.clear(page.cur_translate_worker)
            page.cur_translate_worker = ""
            page.cur_translate_progress = 0

    return page.update()
