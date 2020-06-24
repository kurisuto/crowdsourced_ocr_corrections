# Crowdsourced OCR Corrections

This project is submitted as my capstone student project for Udacity
Cloud Computing course.


## Overview

This project is something off the beaten path.  It has to do with
crowdsourcing of correction of OCR errors.

Efforts such as Project Gutenberg are concerned with digitizing
copyright-expired texts.  The digitizing process can be as crude and
inefficient as someone manually typing a text.  OCR is a step up,
but it is big job for one person to correct the OCR output for an
entire book.

The current project addresses this problem through crowdsourcing.  The
task of correcting OCR output can be spread out over many volunteers.
The system is set up to allow volunteers to correct one line of text
at a time.

Here is a basic user interface displaying one line of text, and the
uncorrected but editable OCR output for that line:

![Alt text](images/design_02.png?raw=true "Image 2")


## System design

Following is a design for a system implementing this kind of
crowdsourced correction of OCR errors.

![Alt text](images/design_01.png?raw=true "Image 1")

Fully implementing this system would be too large of a project for the
Cloud Computing capstone project.  I picked the portions of the system
which most heavily exercise the core cloud computing skills taught in
the course.

I left some parts of the system unimplemented, or implemented only stub
logic as needed.  These were generally parts of the system which don't
heavily exercise cloud computing skills, such as the complicated logic
for assigning specific lines to text to specific volunteers.

Here is an overview of two portions that I implemented.

### Upload and OCR

* The user scans a page and uploads the page image using the web frontend.  The transfer is done by means of a signed URL, and the image is stored in an s3 bucket.
* The s3 upload produces an SNS event which is sent to a Lambda function called RecognizePage.  This function does two things:
** It calls the AWS Textract service to kick off asynchronous OCR on the page image.
** It creates a database record about the page, recording such information as the userId, and noting an initial OCR status of "in progress".
* When Textract has completed asynchronous OCR, it sends an event to an SNS topic which we specified above when starting OCR.  This event kicks off a second Lambda function called RecognitionIsDone, which does two things:
** It calls Textract to retrieve the recognized text, using the Textract jobId in the event as the key.  It saves the Textract output to a second s3 bucket in the form of a JSON file which contains both the text, and the bounding rectangles around the pieces of text.
** It updates the page record in the database, noting that the status is now "completed"

### Crowdsourcing web application

The API for the text correction app includes the following methods:

* A method to get the next line of text to be corrected: both the raw OCR output, and the URL to the cropped image of that line.
* A method to submit a corrected line of text.  Rather than overwrite the raw OCR output, we create an edit record in a separate database table, similar to how edit history is implemented in a wiki.
* There are also methods to update an edit record by marking it REJECTED, or to delete it altogether (these operations affect only the edit record, not the original OCRed text).  These methods are somewhat contrived for the sake of satisfying the capstone requirements, but a user with admin privileges might use these methods if a malicious user submits inappropriate content, such as spam, obscenity, or copyrighted material.


## Data model

Although I implemented only a portion of the system, my data model was
informed by what would be required to implement it fully.

In some APIs, an **update** means that the previous contents of a record
are simply overwritten, and no record of the previous value is
maintained.

This is not how all systems work.  For example, in Wikipedia, when a
user updates an article, it is not the case that the previous version
of the article is simply overwritten.  Rather, a new record is added
to the end of the edit history for that article.

The model for the present project has some similarities to the
Wikipedia model.  When a user submits the corrected version of a line,
the record containing the original OCRed text is not overwritten.
Rather, an edit record is created and is associated with the line.

Unlike Wikipedia, however, the edit records do not form a temporal
sequence of edits.  If the same line is assigned to two volunteers, it
is not the case that one volunteer is editing the other volunteer’s
edit.  Rather, the two volunteers edit the raw OCRed text
independently.  At some later time, the scheduler judges whether the
two edits agree, and schedules a third volunteer if needed.

As already noted, I have not implemented this scheduling process for
the capstone project.  However, I’ve designed the data model with this
functionality in mind.

Thus, the data model is a one-to-many model.  One line object can
correspond to multiple edit records.

![Alt text](images/design_03.png?raw=true "Image 3")


## Mocking up the data

I did not implement the part of the system which loads the OCRed text into
a database for editing, or which crops the page images into individual lines.

For demonstration and development purposes, I mocked up a small amount
of data on my laptop using some hacked Python scripts.  I manually
performed OCR using AWS Textract on a few scanned pages of *The Wizard
of Oz*, a text for which the copyright has expired.  One Python script
seeded the database with the recognized text.  Another script used the
bounding rectangles to shred the page images into individual lines,
which I manually uploaded to s3.

Textract gives pretty accurate results.  For the sake of this mockup,
I deliberately introduced fake OCR errors into the recognized text.  I
hacked another Python script to randomly apply specific substitutions
meant to resemble typical OCR errors (o -> c, d -> cl, etc.)



## Simplifying the scheduling

I will use the word “scheduling” to mean the process of assigning a
particular line to a particular volunteer.  This is actually a very
complicated problem.  Following are factors which a scheduler might
take into consideration:

* We should have each line corrected by at least two volunteers to
  ensure accuracy.  This means that the scheduler must avoid assigning
  a line to the same volunteer twice.

* In the case of conflicting edits, the scheduler should assign the
  line to a third volunteer for resolution.  (This process could
  continue further in the case of a three-way conflict.)

* The scheduler might assign a line to a volunteer, but the volunteer
  might lose interest and never submit the corrected version of that
  line.  The scheduler would need to eventually release the line so
  that it can be assigned to another volunteer.

* The system can rate the accuracy of individual volunteers by
  occasionally assigning a line for which the correct answer is
  already known.  The scheduler might use this rating in various ways;
  for example, it might avoid assigning two weak volunteers to the
  same text.

* Volunteers should be able to specify preferences as to what type of
  texts they want to work on (e.g. 19th century newspapers from
  Kentucky).

Because the point of the capstone project is to exercise competence in
the cloud computing skills covered in the course, I have implemented a
stub scheduler which assigns the lines in round robin fashion over the
small number of sample pages.  When all of the lines have been
completed, we loop back to the beginning and assign each line a second
time.

However, the needs of an actual scheduler have been taken into
consideration in the data model.


