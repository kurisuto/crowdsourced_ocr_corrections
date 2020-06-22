# Crowdsourced OCR Corrections
Capstone student project for Udacity Cloud Computing course

## Overview

This project is something off the beaten path.  It has to do with
crowdsourcing of correction of OCR errors.

Projects such as Project Gutenberg are concerned with digitizing
copyright-expired texts.  The digitizing process can be as crude as
someone manually typing a text.

Following is a design for a system which allows volunteers to correct
OCR errors in bite-sized pieces of text.

![Alt text](images/design_01.png?raw=true "Image 1")

The correction of a single book might be spread out over dozens of
volunteers. A single volunteer can correct as few or as many fragments
as he or she chooses.

A fully featured application of this kind is too large of a project
for the capstone project for the Cloud Computing course.  For the
capstone, I will focus only on the portion of the application in the
dotted box.


## Basic user interface design

Here is how the core of the user interface might look to the user.

![Alt text](images/design_02.png?raw=true "Image 2")

There are two key parts:

* A cropped image of one line of text from the page image
* The corresponding OCRed text, which may include OCR errors, presented in an editable textbox.

The text is presented to the volunteer for correction one line at a time.

Of course, this is a slightly contrived example.  Decent language
modeling would generally predict that “bcoks” is an error for “books”.
However, some errors will still remain.


## Mocking up the data

This system could potentially handle a century’s worth of newspapers,
covering hundreds of thousands of pages.  For demonstration purposes,
I mocked up the data for just 10 pages from The Wizard of Oz, a text
on which the copyright has expired.

I used AWS Textract to perform the OCR.  One form of output from AWS
Textract is a JSON document which includes not only the recognized
text, but also the bounding rectangles for the lines of text in the
original page image.

For the purpose of mocking up some data, I hacked a Python script on
my laptop to read these bounding rectangles, and to repeatedly crop
the page image, producing the snippet images of individual lines like
the one in the user interface above.  I manually uploaded these image
files to s3.  (A fully featured app would do all of this
automatically.)

Because Textract gives pretty accurate results, for the sake of this
mockup, I deliberately introduced fake OCR errors into the recognized
text.  I hacked another Python script to randomly apply specific
substitutions meant to resemble typical OCR errors (o -> c, d -> cl,
etc.)



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


## Data model

In some APIs, an update means that the previous contents of a record
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


## API

The API for this capstone implements the following methods.

* GET lineEdit: When the user requests a line to correct, the frontend
  sends this request to the API.  The API returns the raw OCRed text,
  a link to the corresponding line image in s3, and an identifier for
  the line object.

* POST lineEdit: The frontend submits the corrected text together with
  the line identifier.  The API creates a database record of the edit
  event, including the corrected text and the userId.

* DELETE lineEdit: This method would be used only rarely.  For
  example, if a malicious user submits inappropriate content
  (obscenity, copyrighted text, etc.), a user with administrator
  privileges could use frontend controls which call this method.

* PATCH lineEdit: The capstone rubric requires that “the application
  allows users to create, update, delete items”.  In the context of
  this application, line objects are not “updated” per se; rather, an
  edit record is created and is associated with a line object.
  However, since the ability to update a record is a requirement, I
  have come up with a somewhat contrived use case where a user with
  administrator privileges might mark an edit record as REJECTED
  without actually deleting it.

Note that I have not actually implemented user roles which distinguish
administrator from non-administrator users.  For this capstone
project, all of these methods are available to any authenticated user.
A further, future refinement would be to restrict DELETE and PATCH
only to adminstrator users.


