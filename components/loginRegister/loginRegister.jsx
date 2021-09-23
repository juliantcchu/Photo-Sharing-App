import React from 'react';
import {
  Typography
} from '@material-ui/core';


import './loginRegister.css';
import axios from 'axios';

/**
 * Define LoginRegister, a React componment 
 */
class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login_name: '',
      password: '',
      new_login_name: '',
      new_password: '',
      repeat_password: '',
      first_name: '',
      last_name: '',
      location: '',
      description:'',
      occupation: '',

      logged_in: false,
      login_message:'',
      create_account_message:'',
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.handleCreateAccountSubmit = this.handleCreateAccountSubmit.bind(this);
  }

  handleLoginSubmit(event){
    event.preventDefault();
    console.log('submitting');
    let self = this;
    axios.post('/admin/login', {
      login_name: this.state.login_name, 
      password: this.state.password
    }).then(results=>{
      if (results.data._id !== undefined){
        self.setState({data: results.data});
        self.props.handleLogin(results.data);
        console.log(self.state.data);
      }
    }).catch(err=>{
      console.log(err);
      self.setState({login_message: 'wrong username, please try again!'});
    });
  }

  handleCreateAccountSubmit(event){
    event.preventDefault();
    console.log('submitting create account form');
    if (this.state.new_login_name.length === 0){
      this.setState({create_account_message: 'empty username not allowed'});
      return;
    }
    if (this.state.new_password != this.state.repeat_password){
      this.setState({create_account_message: 'password does not match!'});
      return;
    }
    let self = this;
    axios.post('/user', {
        login_name: this.state.new_login_name,
        password: this.state.new_password,
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        location: this.state.location,
        description:this.state.description,
        occupation: this.state.occupation
            }).then(results=>{
      if (results.data._id !== undefined){
        self.setState({data: results.data});
        self.props.handleLogin(results.data);
        console.log(self.state.data);
      }
    }).catch(err=>{
      console.log(err);
      self.setState({create_account_message: 'invalid, please try again!'});
    });
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  render() {

    return (
      <div>
        <Typography variant="h2" align="left">
          Login
        </Typography>
        <form onSubmit={this.handleLoginSubmit}>
          Username: <input type='text' name='login_name' value={this.state.login_name} onChange={this.handleChange}/>
          Password: <input type='password' name='password' value={this.state.password} onChange={this.handleChange}/>
          <input type='submit' value='login' />
          {this.state.login_message}
        </form>
        <hr />
        <form onSubmit={this.handleCreateAccountSubmit}>
          Login Name     : <input type='text' name='new_login_name' value={this.state.new_login_name} onChange={this.handleChange}/><br />
          Password       : <input type='password' name='new_password' value={this.state.new_password} onChange={this.handleChange}/><br />
          Repeat Password: <input type='password' name='repeat_password' value={this.state.repeat_password} onChange={this.handleChange}/><br />
          First Name     : <input type='text' name='first_name' value={this.state.first_name} onChange={this.handleChange}/><br />
          Last Name      : <input type='text' name='last_name' value={this.state.last_name} onChange={this.handleChange}/><br />
          Location       : <input type='text' name='location' value={this.state.location} onChange={this.handleChange}/><br />
          Description    : <input type='text' name='description' value={this.state.description} onChange={this.handleChange}/><br />
          Occupation     : <input type='text' name='occupation' value={this.state.occupation} onChange={this.handleChange}/><br />
          <input type='submit' value='Create Account' />
          {this.state.create_account_message}
        </form>
      </div>
    );
  }
}

export default LoginRegister;
