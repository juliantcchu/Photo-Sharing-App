import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Typography, Paper
} from '@material-ui/core';
import './styles/main.css';
import axios from 'axios';


// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import SideBar from './components/userList/UserList';
import {UserList} from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import LoginRegister from './components/loginRegister/loginRegister';
import FavoriteTable from './components/favorites/favorites';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      logged_in: false,
      user:{first_name:'Julian Chu'}
    }
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.appendImage = this.appendImage.bind(this);
  }

  handleLogin(data){
    console.log("here");
    this.setState({logged_in:true, user:data}, ()=>{
      window.location.assign('#/user/'+data._id);
    });
  }

  handleLogout(){
    this.setState({logged_in:false, user:{first_name:'Julian Chu'}}, ()=>{
      window.location.assign('#/login-register');
    });
  }
  
  updateUser(){
    axios.get('/user/'+this.state.user._id).then(results=>{
      this.setState({user:results.data})
    });
  }

  appendImage(){
    console.log('here')
    this.forceUpdate(()=>{alert('uploaded!')});
  }

  render() {
    console.log('logged_in = ', this.state.logged_in);
    return (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar 
            first_name={this.state.user.first_name} 
            logged_in={this.state.logged_in} 
            handleLogout={this.handleLogout}
            appendImage={this.appendImage}
          />
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
        <Grid item sm={3}>
          {this.state.logged_in ?
            <Paper  className="cs142-main-grid-item">
              <SideBar />
            </Paper>
          :<div></div>}
        </Grid>
        <Grid item sm={9}>
          <Paper className="cs142-main-grid-item">
            <Switch>
                <Route exact path="/"
                  render={() =>
                    <Typography variant="body1">
                    Welcome to your photosharing app! This <a href="https://material-ui.com/demos/paper/">Paper</a> component
                    displays the main content of the application. The {"sm={9}"} prop in
                    the <a href="https://material-ui.com/layout/grid/">Grid</a> item component makes it responsively
                    display 9/12 of the window. The Switch component enables us to conditionally render different
                    components to this part of the screen. You don&apos;t need to display anything here on the homepage,
                    so you should delete this Route component once you get started.
                    </Typography>}
                />
                
                <Route path="/login-register"
                  render={ props => <LoginRegister {...props} handleLogin = {this.handleLogin}/> }
                />

                {this.state.logged_in ?
                <div>
                  <Route path="/users/:userId"
                    render={ props => <UserDetail {...props} /> }
                  />
                  <Route path="/photos/:userId"
                    render ={ props => <UserPhotos {...props} user={this.state.user} updateUser={this.updateUser} /> }
                  />
                  <Route path="/favorites/:userId" 
                    render ={ props => <FavoriteTable {...props} user={this.state.user} updateUser={this.updateUser} /> }
                  />
                  
                  <Route exact path="/users" component={UserList}  />
                  <Redirect path="login-register" to={"/users/" + this.state.user._id} />
                </div>
                :
                <div>
                  <Redirect path="/users/:id" to="/login-register" />
                  <Redirect path="/photos/:userId" to="/login-register" />
                </div>
                }
            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
    </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
