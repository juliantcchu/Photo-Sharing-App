import React from 'react';
import {
  AppBar, Toolbar, Typography, Grid,   Divider,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import {
  Route, Switch
} from "react-router-dom";
import './TopBar.css';
import axios from 'axios';

import ReactModal from 'react-modal';


/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {}, 
      version: 'unknown',
    };
    this.handleLogout = this.handleLogout.bind(this);
    this.handleUploadButtonClicked = this.handleUploadButtonClicked.bind(this);
    this.handleCloseActivityFeed = this.handleCloseActivityFeed.bind(this);
    this.handleOpenActivityFeed = this.handleOpenActivityFeed.bind(this);
    
  }

  componentDidMount() {
    let self = this;
    axios.get('http://localhost:3000/test/info').then(results=>{
      self.setState({version: results.data.__v});
    }).catch(err=>{
      console.log(err);
    });
  }

  handleLogout(){
    axios.post('/admin/logout', {}).then(()=>{
      this.props.handleLogout();
    }).catch(err=>{
      console.log(err);
    });
  }
  handleUploadButtonClicked(e){
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {

     // Create a DOM form and add the file to it under the name uploadedphoto
     const domForm = new FormData();
     domForm.append('uploadedphoto', this.uploadInput.files[0]);
     axios.post('/photos/new', domForm)
       .then(() => {
         this.props.appendImage();
       })
       .catch(err => console.log(`POST ERR: ${err}`));
    }
  }
  
  handleOpenActivityFeed () {
    this.setState({ showModal: true});
  }
  
  handleCloseActivityFeed () {
    this.setState({ showModal: false });
  }


  render() {

    return (
      <div>
        <AppBar className="cs142-topbar-appBar" position="absolute">
          <Toolbar>
            <Grid container>
              <Grid item xs={12} sm={3}>
                <Typography variant="h5" color="inherit">
                    {this.props.first_name}
                </Typography>
                {this.props.logged_in ? 
                    <div>
                      <button onClick={this.handleOpenActivityFeed}>
                        Activities
                      </button>
                    </div>
                    : <div></div>}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Switch>
                  <Route path='/login-register'
                    render = {() =>
                      <Typography variant="h5">
                        Please login
                      </Typography>}
                  />
                  <Route exact path="/"
                    render={() =>
                      <Typography variant="h5">
                        Home
                      </Typography>}
                    />
                    <Route path="/:pageType/:userId" 
                      render ={ props => <Location {...props} /> }
                    />
                    <Route path="/users" 
                      render={() =>
                        <Typography variant="h5">
                          List of users
                        </Typography>}
                    />
                  </Switch>
                  {this.props.logged_in ? 
                    <span>
                      <input type='button' value='Upload' onClick={this.handleUploadButtonClicked}/> 
                      <input type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} />
                    </span>
                    : <div></div>}
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="h5">
                    version {this.state.version}
                  </Typography>
                  {this.props.logged_in ? 
                    <div>
                      <input type='button' value='Log Out' onClick={this.handleLogout}/> 
                    </div>
                    : <div></div>}
                </Grid>
              </Grid>
          </Toolbar>
        </AppBar>

        <ReactModal 
          isOpen={this.state.showModal}
          contentLabel="Minimal Modal Example" 
        >
          <button onClick={this.handleCloseActivityFeed}>Close Modal</button>
          <ActivityFeed />
      </ReactModal>
      </div>
    );
  }
}

export default TopBar;

class Location extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      data:{},
    }
    this.setData = this.setData.bind(this);
  }

  setData(){
    let urlParams = this.props.match.params;
    let self = this;
    axios.get('/user/'+urlParams.userId).then(results=>{
      let data =results.data;
      self.setState({
        full_name: data.first_name + ' ' + data.last_name, 
        type: (urlParams.pageType === 'users') ? 'Profile' : ((urlParams.pageType === 'favorites')? 'Favorites':'Photos')
      });
    }).catch(err=>{
      console.log(err);
    });
  }

  componentDidMount() {
    this.setData()
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params !== prevProps.match.params) {
      this.setData();
    }
  }

  
  render(){
    return (
      <Typography variant="h5">
        {this.state.type } of {this.state.full_name}
      </Typography>
    )
  }
}


class ActivityFeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    }

    this.setData = this.setData.bind(this);

  }

  setData(){
    let self = this;
    axios.get('/getLatestActivities').then(results=>{
      self.setState({data: results.data});
    }).catch(err=>{
      console.log(err);
    });
  }

  componentDidMount() {
    this.setData();
    
    this.interval = setInterval(() => {
      this.setData();
    }, 1000);
  }
  render() {
    let activities = this.state.data;

    let listElems = [];
    for (let i = 0; i < activities.length; i++){
      let elem = (
          <div key={activities[i]._id}>
            <ListItem>
              <ListItemText primary={activities[i].name + ' ' + activities[i].activity} />
              <ListItemText primary={activities[i].date_time.toString()} />
            </ListItem>
             {activities[i].details ? <img src={'/images/' + activities[i].details.file_name} className='mediumThumbnail'/> : <span></span>} 
            <Divider />
          </div>
        );

      listElems.push(elem);
    }
    

    return (
      <div>
        {/* <Typography variant="body1">
          This is the user list, which takes up 3/12 of the window.
          You might choose to use <a href="https://material-ui.com/demos/lists/">Lists</a> and <a href="https://material-ui.com/demos/dividers">Dividers</a> to
          display your users like so:
        </Typography> */}
        <Typography variant="h5">
          Activities
        </Typography>
        <Divider />
          <List component="nav">
            {listElems}
          </List>
      </div>
    );
  }
}