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

interface HomeProps {
  auth: Auth
  history: History
}

interface HomeState {
  dummy: boolean
}

export class Home extends React.PureComponent<HomeProps, HomeState> {
  state: HomeState = {
    dummy: true
  }


  render() {
    return (
      <div>
        <h1>Welcome!</h1>
	
	<p>This app allows volunteers to correct the OCRed text of copyright-expired books, one line at a time.</p>
	
	<p>This is not a full implementation of the app.  You can do the following:</p>

	<ul>

	<li>Click <b>Correct Text</b> above to correct some lines of text.</li>

	<li>Click <b>Upload Image</b> to upload a scanned page from a book.  OCR will automatically be peformed offline.</li>

	<li>Click <b>Pages</b> to see a status table of pages which have been uploaded for OCR.</li>

	</ul>


      </div>
    )
  }


}
