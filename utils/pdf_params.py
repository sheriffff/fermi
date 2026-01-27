from dataclasses import dataclass
from reportlab.lib.units import cm

@dataclass
class PDFParams:
    MARGIN_HORIZONTAL = 2.5 * cm
    MARGIN_TOP = 2 * cm
    MARGIN_BOTTOM = 3 * cm

    FORM_BOX_HEIGHT = 1 * cm
    FORM_BOX_WIDTH = 4 * cm
    FORM_COL_SPACING = 5 * cm
    FORM_ROW_SPACING = 1.2 * cm
    FORM_BOX_OFFSET_Y = 0.15 * cm
    FORM_CHECKBOX_SIZE = 0.4 * cm
    FORM_CHECKBOX_OFFSET_Y = 0.1 * cm
    FORM_CHECKBOX_LABEL_SPACING = 0.6 * cm
    FORM_CHECKBOX_ITEM_SPACING = 2.5 * cm
    FORM_CHECKBOX_ROW_SPACING = 0.7 * cm

    TITLE_SPACING = 0.8 * cm
    SECTION_SPACING = 1 * cm

    QUESTION_AFTER_SEPARATOR_SPACING = 1 * cm
    QUESTION_NUMBER_INDENT = 0.6 * cm
    ANSWER_BOX_HEIGHT = 1.5 * cm
    ANSWER_BOX_LINE_GAP = 0.8 * cm

    ANSWER_TOTAL_SPACE_PAGE1 = 3 * cm
    ANSWER_TOTAL_SPACE_PAGE2 = 5.4 * cm
