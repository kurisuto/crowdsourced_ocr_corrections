#!/usr/bin/env python3
import os.path
from PIL import Image, ImageDraw, ImageFont

class PageImage:

    def __init__(self, pathname):
        self.pathname = pathname

        if not os.path.isfile(pathname):
            raise Exception("Image file does not exist")

        self.image = Image.open(pathname)

        
    def get_dimensions(self):
        bounding_box = self.image.getbbox()
        return(bounding_box[2], bounding_box[3])
        

    def crop_and_write(self, output_pathname, rect):
        image_crop = self.image.crop((rect["left"], rect["top"], rect["right"], rect["bottom"]))
        image_crop.save(output_pathname)
