import React from 'react';
import {
  Typography
} from '@material-ui/core';

import { Link } from "react-router-dom";

import './userDetail.css';
import axios from 'axios';

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data:{},
    }

    this.setData = this.setData.bind(this);
  }

  setData(){
    let currURL = window.location.href;
    let info = currURL.slice(currURL.indexOf('#/') + 2).split('/');
    let self = this;
    axios.get('/user/'+info[1]).then(results=>{
      if (results.data.login_unsuccessful === true){
        console.log('here');
        this.props.history.push('/login-register');
      }
      self.setState({data: results.data});
    }).catch(err=>{
      console.log(err);
    });
  }

  componentDidMount() {
    this.setData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params !== prevProps.match.params) {
      this.setData();
    }
  }

  render() {
    let user = this.state.data;

    return (
      <div>
        <Typography variant="h2" align="center">
          {user.first_name + ' ' + user.last_name}
        </Typography>
        <Typography variant="h5" align="center">
          Currently at: {user.location} <br />
          Occupation: {user.occupation} <br /><br />
          <Typography variant="body1" align="center">{user.description}</Typography>
          <br />
          <Link to={'/photos/'+user._id}>See Pictures</Link>
          <br />
          <Link to={'/favorites/'+user._id}>See Favorites</Link>
        </Typography>
      </div>
    );
  }
}

export default UserDetail;