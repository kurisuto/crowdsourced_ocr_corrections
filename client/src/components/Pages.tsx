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

import { getPages } from '../api/todos-api'
import { Page } from '../types/Page'
import spinner from './spinner.gif';


interface PagesProps {
  auth: Auth
  history: History
}

interface PagesState {
  pages: Page[]
  loadingPages: boolean
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function compare(a: Page, b: Page) {
  if (a.ocrStartedAt > b.ocrStartedAt) { return 1; }
  if (a.ocrStartedAt < b.ocrStartedAt) { return -1; }
  return 0;
}


export class Pages extends React.PureComponent<PagesProps, PagesState> {
  state: PagesState = {
    pages: [],
    loadingPages: true
  }


  async componentDidMount() {
    try {
      const pages = await getPages(this.props.auth.getIdToken())
      this.setState({
        pages,
        loadingPages: false
      })
    } catch (e) {
      alert(`Failed to fetch pages: ${e.message}`)
    }
  }



  renderHeader() {
    return(
            <tr key="heading">
            <td className="pages"><b></b></td>
            <td className="pages"><b>pageId (Page table key)</b></td>
            <td className="pages"><b>Status</b></td>
            <td className="pages"><b>OCR start time</b></td>
            <td className="pages"><b>OCR completion time</b></td>
            <td className="pages"><b>Page upload s3 bucket key</b></td>
            <td className="pages"><b>URL to OCR output JSON</b></td>
            </tr>
    )
  }


  renderRows = () => {
      var pages = this.state.pages
      pages = pages.sort(compare)
      console.log(pages)
      var pageslist = pages.map(function(page, index){
          const url = page.ocrOutputUrl
          console.log(url)

	  var statusCell = (
	      <td className="pages"><span className='blue'>{page.status}</span></td>
	  )
	  if (page.status == "performing_ocr") {
	    statusCell = (
	      <td className="pages"><span className='red'>{page.status}</span></td>
  	    )

	  }

          return (<tr key={ index }>
                  <td className="pages">{index+1}</td>
                  <td className="pages">{page.pageId}</td>
                  {statusCell}
                  <td className="pages">{page.ocrStartedAt}</td>
                  <td className="pages">{page.ocrCompletedAt}</td>
                  <td className="pages">{page.imageFilename}</td>
                  <td className="pages"><a href='{url}'>Link</a></td>
                  </tr>)
              })
      return pageslist
  }


  reloadPages = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      this.setState({
          pages: [],
	  loadingPages: true
      })

      const pages = await getPages(this.props.auth.getIdToken())

      this.setState({
        pages,
        loadingPages: false
      })
    } catch (e) {
      alert(`Failed to fetch pages: ${e.message}`)
    }
  }
  

  renderTable() {
    if (this.state.loadingPages) {
       return (
          <div className="center_spinner">
	  <br/>
	  <br/>
	  <br/>
	  <br/>
	  <br/>
          <Image src={spinner} wrapped />
	  </div>
       )
    }
    else {
       const theadMarkup = this.renderHeader();
       const tbodyMarkup = this.renderRows();

       return (
         <div>
	 <form onSubmit={this.reloadPages}>
	  <input type="submit" value="Refresh" />
	 </form>
	 <br/>

	 <table className="pages">
           <thead>{theadMarkup}</thead>
           <thead>{tbodyMarkup}</thead>
         </table>

	 </div>
       )
    }
  }


  render() {

    const pageTable = this.renderTable()

    return (
      <div>
      <h1>Pages</h1>

        <p><i>If you just got here because you uploaded a page, please
        click <b>Refresh</b> every few seconds to see the progress.</i></p>

        <p>
	Most of this information wouldn't really be exposed to volunteer
	users.  It's here to show how things work.  In a full implementation,
	the OCR output would be loaded into the database to make it available
	for volunteer corrections.
	</p>

        <p>
            Sorry you have to manually copy and paste that URL!  I&apos;m totally new
        to React and couldn&apos;t get the framework to stop messing with the URL.
        </p>

	<br/>
	<br/>
        
        {pageTable}

      </div>
    )
  }


}
