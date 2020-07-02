import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
// import { Grid, Menu, Segment } from 'semantic-ui-react'
import { Menu } from 'semantic-ui-react'

import Auth from './auth/Auth'
import { EditTodo } from './components/EditTodo'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Todos } from './components/Todos'




import { Home } from './components/Home'
import { Correct } from './components/Correct'
import { UploadImage } from './components/UploadImage'
import { Pages } from './components/Pages'

import logo from './logo_small_120.png';

import './App.css'



export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {}

export default class App extends Component<AppProps, AppState> {

  constructor(props: AppProps) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogin() {
    this.props.auth.login()
  }

  handleLogout() {
    this.props.auth.logout()
  }


  render() {
    return (
      <div className="alpha">
        {this.generateHeader()}

                <Router history={this.props.history}>

                  {this.generateCurrentPage()}
                </Router>

      </div>
    )
  }


/*
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>

              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
*/




  generateHeader() {

  // React probably has some elegant component for hilighting
  // the control for the current page, but I'm just going to hack it.

    const location = window.location.pathname

    var styleHome = "map"
    var styleCorrect = "map"
    var styleUpload = "map"
    var stylePages = "map"

    if (this.props.auth.isAuthenticated()) {
      if (location == "/") {
        styleHome = "mapSelected"
      }
      if (location == "/correct") {
        styleCorrect = "mapSelected"
      }
      if (location == "/upload_image") {
        styleUpload = "mapSelected"
      }
      if (location == "/pages") {
        stylePages = "mapSelected"
      }
    }

    return(
	<div className="cedit">
          <img src={logo} alt="logo" />
          <div className="navigate">
        <nav>
          <table className="map">
          <tbody>
          <tr>
            <td className={styleHome}>
              <Link to="/">Home</Link>
            </td>
            <td className={styleCorrect}>
              <Link to="/correct">Correct Text</Link>
            </td>
            <td className={styleUpload}>
              <Link to="/upload_image">Upload Image</Link>
            </td>
            <td className={stylePages}>
              <Link to="/pages">Pages</Link>
            </td>
          </tr>
          </tbody>
          </table>
          </nav>
          </div>
          <hr/>
          </div>
    )	
  }



  generateMenu() {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">Home</Link>
        </Menu.Item>

        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateCurrentPage() {
    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={props => {
            return <Home {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/home"
          exact
          render={props => {
            return <Home {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/correct"
          exact
          render={props => {
            return <Correct {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/pages"
          exact
          render={props => {
            return <Pages {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/upload_image"
          exact
          render={props => {
            return <UploadImage {...props} auth={this.props.auth} />
          }}
        />


        <Route component={NotFound} />
      </Switch>
    )
  }
}

