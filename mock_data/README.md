# Mock data generator

This part of the project isn't submitted as part of the Capstone.
It's a hacked Python script which I ran on my laptop to generate
mocked up stub data.

Here is what is in the directories:

* **01_scans:** A few scanned pages from a paper copy of **The Wizard of Oz**, on which the copyright has expired.

* **02_ocr_output:** Some of the scanned pages were run through AWS Textract.  This directory contains the JSON files containing the OCR output.

* **03_output_shredded_images:** The page images from 01_scans, but shredded into smaller images with one line of text in each image.  The bounding rectangles are in the OCR output JSON files.

* **04_output_text:** The recognized text from the OCR output, with additional errors randomly and deliberately introduced for demonstration purposes.  The records can be read as stub data into the CollaborEdit "Line" table in DynamoDb.

* **bin:** The hacked Python code

