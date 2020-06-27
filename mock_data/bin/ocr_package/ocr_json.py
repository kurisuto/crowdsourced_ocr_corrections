#!/usr/bin/env python3
import os.path
import json


def get_bounding_rect(block, page_width, page_height):
    rect = {}
    bounding_box = block["Geometry"]["BoundingBox"]

    left_ratio = bounding_box["Left"]
    top_ratio = bounding_box["Top"]
    width_ratio = bounding_box["Width"]
    height_ratio = bounding_box["Height"]

    rect["left"] = int(left_ratio * page_width)
    rect["top"] = int(top_ratio * page_height)

    width = int(width_ratio * page_width)
    height = int(height_ratio * page_height)

    rect["right"] = rect["left"] + width
    rect["bottom"] = rect["top"] + height

    return rect


def block_to_line_structure(block, page_width, page_height):
    line_structure = {}
    line_structure["text"] = block["Text"]

    rect = get_bounding_rect(block, page_width, page_height)
    line_structure["rect"] = rect
    
    return line_structure


def parse_ocr_json(pathname, page_width, page_height):

    if not os.path.isfile(pathname):
        raise Exception("Image file does not exist")

    with open(pathname, 'r') as content_file:
        structure = json.load(content_file)

    line_list = []
    for block in structure["Blocks"]:
        if block["BlockType"] != 'LINE':
            continue

        line_structure = block_to_line_structure(block, page_width, page_height)
        line_list.append(line_structure)

    return(line_list)

