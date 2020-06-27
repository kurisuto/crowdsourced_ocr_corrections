# CollaborEdit

![Alt text](images/logo_large_200.png?raw=true "Logo")


This project is submitted as my capstone student project for Udacity
Cloud Computing course.


## Overview

This project is something off the beaten path.  It has to do with
crowdsourcing of correction of OCR errors.

Efforts such as Project Gutenberg are concerned with digitizing
copyright-expired texts.  The digitizing process can be as crude and
inefficient as someone manually typing a text.  Scanning and OCR is a
step up in sophistication, but it is big job--potentially a
prohibitive one--for one person to correct the OCR output for an
entire book.

The current project addresses this problem through crowdsourcing.  The
system is set up to allow volunteers to correct the OCR output one line
at a time.  The effort of correcting a whole book can be spread out over
dozens of volunteers.

Here is a basic user interface displaying one line of text.

![Alt text](images/design_02.png?raw=true "Image 2")

The two UI elements here are:
* The cropped image of a line of text
* An editable text box containing the corresponding raw OCR output

Each volunteer can correct as few or as many lines of text as they
choose.  They can start and stop whenever they like.


## System design

Following is a design for a system implementing this kind of
crowdsourced correction of OCR errors.

![Alt text](images/design_01.png?raw=true "Image 1")

Fully implementing this system would be too large of a project for the
Cloud Computing capstone project.  I picked the portions of the system
which most heavily exercise the core cloud computing skills taught in
the course.

I left other parts of the system unimplemented, or implemented only stub
logic as needed.  These were generally parts of the system which don't
heavily exercise cloud computing skills, such as the complicated logic
for assigning specific lines to text to specific volunteers.


## Portions implemented for Capstone project

Here is an overview of two portions that I implemented.

### Upload and OCR

* The user scans a page and uploads the page image using the web frontend.  The transfer is done by means of a signed URL, and the image is stored in an s3 bucket.
* The s3 upload produces an SNS event which is sent to a Lambda function called RecognizePage.  This function does two things:
  * It calls the AWS Textract service to kick off asynchronous OCR on the page image.
  * It creates a database record about the page, including such information as the userId, and noting an initial OCR status of "in progress".
* When Textract has completed asynchronous OCR, it sends an event to an SNS topic which we specified above when invoking Textract.  This event kicks off a second Lambda function called RecognitionIsDone, which does two things:
  * It calls Textract to retrieve the recognized text, using the Textract jobId in the event as the key.  It saves the Textract output to a second s3 bucket in the form of a JSON file.  The JSON file contains both the text, and the bounding rectangles around the pieces of text.
  * It updates the page record in the database, noting that the status is now "OCR completed".

### Crowdsourcing web application

The API for the text correction app includes the following methods:

* A method to get the next line of text to be corrected: both the raw OCR output, and the URL to the cropped image of that line.
* A method to submit a corrected line of text.  Rather than overwrite the raw OCR output, we create an edit record in a separate database table, similar to how edit history is implemented in a wiki.
* There are also methods to **update** an edit record by marking it REJECTED, or to **delete** it altogether (these operations affect only the edit record, not the original OCRed text).  These methods are somewhat contrived for the sake of satisfying the capstone requirements, but a user with admin privileges might use these methods if a malicious user submits inappropriate content, such as spam, obscenity, or copyrighted material.


## Data model

Following is an illustration of the CollaborEdit data model:

![Alt text](images/design_04.png?raw=true "Image 4")

* One Book has many Pages
* One Page has many Lines
* One Line can have many Edits

Each of these has its own DynamoDb table.  (The Book table was not
implemented as part of the capstone; the sample pages in the small
amount of mocked-up data all belong to a stub book whose bookId is
'1'.)

### What is an Edit record?

The notion of an Edit needs some explanation.

In some APIs, an **update** means that the previous contents of a
record are simply overwritten.  No record of the previous value is
maintained.

Contrast this with how things work in a Wiki system.  When a user
edits and submits a wiki page, the new version does not overwrite the
old version.  Rather, a wiki page has a history consisting of a
sequence of edit records.  A newly submitted edit is appended to the
end of this sequence.

This is close to how things work in CollaborEdit.  A line can have
multiple edit records associated with it.

However, unlike a wiki, there is not a notion of a sequential edit
history.  When a volunteer edits and submits a line, the edit record
is simply associated with the line.  There are timestamps on the
edit records, of course, but there is not a notion that the most
recent edit is the current one.

![Alt text](images/design_03.png?raw=true "Image 3")


The reasons for this have to do with the problem of scheduling.


### Scheduling

I will use the word **scheduling** here to mean the process of
assigning a particular line to a particular volunteer.  When volunteer
Jane Smith clicks a web control and the web app hits the API to fetch
the next line for editing, how do we decide which line to assign?

This is actually a very complicated problem.  Following are factors
which a scheduler might take into consideration:

* To ensure accuracy, each line should be edited by at least two volunteers.

  * There scheduler must ensure that the same line is not assigned to the same volunteer twice.

  * In the case of conflicting edits, the line should be assigned to a third volunteer for resolution.  (This can continue if there is a three-way conflict, and so on.)

* A volunteer might be assigned a line but never submit it.  The scheduler needs to keep track of what has been assigned, but release it for reassignment after some timeout.

* The scheduler might occasionally rate the accuracy of a volunteer by assigning a line for which the correct answer is already known.

  * The scheduler might use this information e.g. to avoid assigning two weak volunteers to the same line.

* The user might specify preferences for a type of text (language, time period, genre).

The capstone project does not implement any of this complicated logic.
The stub logic simply randomly assigns a line from the small amount of
mocked-up data.  However, the data *model* is very much designed with
this logic in mind.  If the scheduler sees that a line has two edits
associated with it, and they agree, then it would know not to queue
that line for assignment in the near future.



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


## Installation notes

In addition to deploying the Serverless app with the usual **sls deploy** command, the following must be done to put the mock data into place:

* The **loadfakelinedata** endpoint must be hit with an HTTP GET.  This causes the system to load mocked-up data (which ships with the system) into the Page table.

* The .png files must be copied from **mock_data/03_output_shredded_images** into the **line-images** s3 bucket.  This bucket is automatically created with the Serverless app is deployed.

