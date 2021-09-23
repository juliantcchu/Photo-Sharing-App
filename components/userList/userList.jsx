import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
}
from '@material-ui/core';

import { Link } from "react-router-dom";
//import { Thumbnail } from "../favorites";

import './userList.css';

import axios from 'axios';

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    }

    this.setData = this.setData.bind(this);

  }

  setData(){
    let self = this;
    axios.get('/user/list').then(results=>{
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
    let users = this.state.data;

    let listElems = [];
    for (let i = 0; i < users.length; i++){
      let elem = (
          <div key={users[i]._id}>
            <Link to={'/users/' + users[i]._id}>
              <ListItem className='clickable'>
                <ListItemText primary={users[i].first_name + ' ' + users[i].last_name + 
                ' Latest Activity: ' + users[i].last_activity} />
                </ListItem>
                <div style = {{padding: '0 0 0 15px'}}>
                {users[i].activity_details ? <img src={'/images/' + users[i].activity_details.file_name} className='smallThumbnail'/> : <span></span>}
                </div>
            </Link>
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
          Users
        </Typography>
        <Divider />
          <List component="nav">
            {listElems}
          </List>
      </div>
    );
  }
}


class SideBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    }

  }


  render() {

    return (
      <div>
        <UserList />
      </div>
    );
  }
}
export default SideBar;
export {UserList};
