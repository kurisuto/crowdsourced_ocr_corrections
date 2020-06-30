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


interface PagesProps {
  auth: Auth
  history: History
}

interface PagesState {
  pages: Page[]
  loadingPages: boolean
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
      console.log(pages)
      var pageslist = pages.map(function(page, index){
          const url = page.ocrOutputUrl
          console.log(url)
          return (<tr key={ index }>
                  <td className="pages">{index}</td>
                  <td className="pages">{page.pageId}</td>
                  <td className="pages">{page.status}</td>
                  <td className="pages">{page.ocrStartedAt}</td>
                  <td className="pages">{page.ocrCompletedAt}</td>
                  <td className="pages">{page.imageFilename}</td>
                  <td className="pages">{page.ocrOutputUrl}</td>
                  </tr>)
              })
      return pageslist
  }



  render() {

    const theadMarkup = this.renderHeader();
    const tbodyMarkup = this.renderRows();


    return (
      <div>
      <h1>Pages</h1>
	

         <p>
        This table is for development/demonstration purposes.
        </p>

        <p>
        When you upload a page image, a new row will appear in the table with the
        status <b>performing_ocr</b>, indicating that the page has been submitted
        to AWS Textract.  After 10-20 seconds or so, reloading the page should show
        status <b>completed</b>, and you can follow the link to see the JSON output
        from AWS Textract.
        </p>

        <p>
            Sorry you have to manually copy and paste that URL!  I&apos;n totally new
        to React and couldn&apos;t get the framework to stop messing with the URL.
        </p>
        
      <table className="pages">
        <thead>{theadMarkup}</thead>
        <thead>{tbodyMarkup}</thead>
      </table>


      </div>
    )
  }


}
