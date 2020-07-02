import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import Auth from '../auth/Auth'

import spinner from './spinner.gif';
import gamify from './gamify.png';


enum EditState {
  NoEdit,
  FetchingNextEdit,
  SubmittingEditAndFetchingNextEdit,
  EditReceived
}



import { getNextEdit, submitEditedLine } from '../api/todos-api'
import { EditDownload } from '../types/EditDownload'
import { EditUpload } from '../types/EditUpload'



interface CorrectProps {
  auth: Auth
  history: History
}

interface CorrectState {
  editState: EditState
  lineId: string
  imageUrl: string,
  rawText: string
  correctedText: string
}


function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class Correct extends React.PureComponent<CorrectProps, CorrectState> {
  state: CorrectState = {
    editState: EditState.NoEdit,
    lineId: '',
    imageUrl: '',
    rawText: '',
    correctedText: ''
  }


  async componentDidMount() {

    if (this.state.editState == EditState.NoEdit) {
      try {
        this.setState({
          editState: EditState.FetchingNextEdit,
	  lineId: '',
	  rawText: '',
	  correctedText: '',
	  imageUrl: ''
        })
	// await sleep(1000);
        const nextEdit = await getNextEdit(this.props.auth.getIdToken())
        this.setState({
          editState: EditState.EditReceived,
	  lineId: nextEdit.lineId,
	  rawText: nextEdit.rawText,
	  correctedText: nextEdit.rawText,
	  imageUrl: nextEdit.imageUrl
        })
      } catch (e) {
        alert(`Failed to fetch pages: ${e.message}`)
      }
    }
  }


  handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ correctedText: event.target.value })
  }

  onSubmit = async (event: React.ChangeEvent<HTMLButtonElement>) => {
      try {

        const editUpload = {
	  lineId: this.state.lineId,
	  correctedText: this.state.correctedText
	}
	
        this.setState({
          editState: EditState.SubmittingEditAndFetchingNextEdit,
	  lineId: '',
	  rawText: '',
	  correctedText: '',
	  imageUrl: ''
        })
	
	// await sleep(1000);
        const nextEdit = await submitEditedLine(this.props.auth.getIdToken(), editUpload)
	
        this.setState({
          editState: EditState.EditReceived,
	  lineId: nextEdit.lineId,
	  rawText: nextEdit.rawText,
	  correctedText: nextEdit.rawText,
	  imageUrl: nextEdit.imageUrl
        })
	
      } catch (e) {
        alert(`Failed to fetch pages: ${e.message}`)
      }

  }


  render() {
    const form = this.renderForm()

    return (
      <div>
      <h1>Correct Text</h1>

      <p>Edit the text to match the original, and then click Submit.<br/>
      If the text is already correct, just click Submit.</p>
      <br/>
      <hr/>
      <br/>

      <div className="corrections">
      {form}
      </div>

      <hr/>

      <p>
      <b>Not implemented:</b><br/> Volunteer progress can be gamified.  Following
      is one initial concept.  The icons update each time the volunteer
      submits an edit.
      </p>

	<Image src={gamify} wrapped />


      </div>
    )
  }


  renderForm() {
    if (this.state.editState == EditState.NoEdit) {
      return(
        <h1>Edit not available</h1>
      )
    }

    else if (this.state.editState == EditState.FetchingNextEdit) {
      return(
	<div className="center_spinner">
	<Image src={spinner} wrapped />
	</div>
      )
    }

    else if (this.state.editState == EditState.SubmittingEditAndFetchingNextEdit) {
      return(
	<div className="center_spinner">
	<Image src={spinner} wrapped />
	</div>
      )
    }

    else if (this.state.editState == EditState.EditReceived) {
      return(
        <div>

	<i>Original text:</i><br/>
	<Image src={this.state.imageUrl} wrapped />

	<br/>
	<br/>
	<br/>

	<i>Your correction:</i>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Submit',
              onClick: this.onSubmit
            }}
            fluid
            actionPosition="left"
            defaultValue={this.state.rawText}
            onChange={this.handleTextChange}
          />

	
	</div>
      )
    }

    else {
      return(
        <h1>Unknown state</h1>
      )
    }

    
  }


}
