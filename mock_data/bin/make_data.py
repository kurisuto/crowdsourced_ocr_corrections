#!/usr/bin/env python3
import os.path
import json
import uuid
from ocr_package import ocr_image, ocr_json, ocr_noise

# This is a totally hacked script to mock up some data for the Udacity
# capstone project.  Don't expect elegance or particularly good
# programming practice here.  Some things like the range of page
# numbers 176 to 182 are hard-coded.


bin_directory = os.path.dirname(os.path.abspath(__file__))
parent_directory = os.path.dirname(bin_directory)

scan_directory = os.path.join(parent_directory, "01_scans")
ocr_output_directory = os.path.join(parent_directory, "02_ocr_output")
shredded_image_directory = os.path.join(parent_directory, "03_output_shredded_images")
output_text_directory = os.path.join(parent_directory, "04_output_text")




# In the interest of time, I'm going to use a nasty global.
g_output_rows = []


def add_noisy_text(line_list):
    for line in line_list:
        clean_text = line["text"]
        noisy_text = ocr_noise.add_ocr_noise(clean_text)
        line["noisy_text"] = noisy_text


def marshall_data_for_one_page(input_image, input_json):

    # First get the dimensions of the page.
    page_image = ocr_image.PageImage(input_image)
    (page_width, page_height) = page_image.get_dimensions()


    # Now read the OCR output.
    # For each line, we pull out the recognized text and the bounding rectangle.
    # We have to pass in the page dimensions because Textract represents the
    # coordinates as percentages.  We want absolute coordinates.
    line_list = ocr_json.parse_ocr_json(input_json, page_width, page_height)


    # Add the noisy text
    add_noisy_text(line_list)

    return(page_image, line_list)



def make_shredded_filename(page, index):
    padded_index = str(index).zfill(5)
    padded_page = str(page).zfill(5)
    filename = "text_000001"
    filename += "_page_" + padded_page
    filename += "_line_" + padded_index + ".png"
    return filename



def shred_image(page, page_image, line_list):
    for index, line in enumerate(line_list):
        filename = make_shredded_filename(page, index)
        output_pathname = os.path.join(shredded_image_directory, filename)
        page_image.crop_and_write(output_pathname, line["rect"])


def make_database_records(page, line_list):
    for index, line in enumerate(line_list):
        row = {}
        row['imageKey'] = make_shredded_filename(page, index)
        row['lineId'] = str(uuid.uuid4())
        row['rawText'] = line['noisy_text']

        g_output_rows.append(row)


        
def process_one_page(page):
    input_image = os.path.join(scan_directory, "wizard_of_oz_" + str(page) + ".jpg")
    input_json = os.path.join(ocr_output_directory, str(page) + ".json")

    # Get two things:
    # On of our PageImage objects for manipulating the page image
    # A list of lines, each with text and a bounding rectangle
    (page_image, line_list) = marshall_data_for_one_page(input_image, input_json)


    # Make the shredded images
    shred_image(page, page_image, line_list)

    # Create preliminary database records for the Line table
    make_database_records(page, line_list)



def add_next_to_line_table_data():
    first_line_id = g_output_rows[0]['lineId']

    for i, row in enumerate(g_output_rows):

        # Normally, the nextLineId is just the next lineId.
        # However, if this is the last line, then loop back around to the beginning.
        if i == len(g_output_rows)-1:
            next_line_id = first_line_id
        else:
            next_line_id = g_output_rows[i+1]['lineId']

        row['nextLineId'] = next_line_id


def output_line_table_data():
    output_text_filepath = os.path.join(output_text_directory, "line_data.json")

    json_string = json.dumps(g_output_rows, sort_keys=True, indent=4)
    with open(output_text_filepath, 'w') as output_text_file:
        output_text_file.write(json_string + "\n")
        

def create_line_table_data():
    add_next_to_line_table_data()
    output_line_table_data()


def main():
    for i in range(176, 182):
        process_one_page(i)

    create_line_table_data()
        

    

if __name__ == "__main__":
    main()

