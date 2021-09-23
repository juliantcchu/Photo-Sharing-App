import React from 'react';
import {
  Typography
} from '@material-ui/core';
import { Link } from "react-router-dom";
import './userPhotos.css';
import axios from 'axios';

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    }
    this.setData = this.setData.bind(this);
  }

  setData(){
    let userID = this.props.match.params.userId;
    let self = this;
    axios.get('/photosOfUser/' + userID).then(results=>{
      if (results.data.login_unsuccessful === true){
        console.log('here');
        this.props.history.push('/login-register');
      }
      self.setState({data: results.data});
    }).catch(err=>{
      console.log(err);
    });
  }

  componentDidMount(){
    this.setData();
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.setData();
    }
  }

  render() {

    let photos = this.state.data;
    //let photos = window.cs142models.photoOfUserModel(this.props.match.params.userId);
    let posts = [];
    for (let i = 0; i < photos.length; i++){
      posts.push(<Post info = {photos[i]} user = {this.props.user} updateUser={this.props.updateUser}/>);
    }
    console.log(posts);

    return (
      <div>
        {posts}
      </div>

    );
  }
}




class Post extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      info: this.props.info,
      writeCommentValue: '',
      favorite: false
    }
    this.handleComment = this.handleComment.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleFav = this.handleFav.bind(this);
  }

  componentDidMount(){
    let self = this;
    let isFav = this.props.user.favorites.some(function(el) {
      return el.photo_id === self.state.info._id;
    });
    this.setState({
      favorite: isFav
    });

  }

  // componentDidUpdate(prevProps) {
  //   if (this.props !== prevProps) {
  //     this.
  //   }
  // }


  handleComment(e){
    e.preventDefault();

    if (typeof this.state.writeCommentValue !== 'string' || this.state.writeCommentValue === ''){
      return;
    }
    let new_comment = {
      user_id: this.props.user._id,
      comment: this.state.writeCommentValue
    };
    // let new_info = this.state.info;
    // new_info.comments = this.state.info.comments.concat(new_comment);
    // this.setState({
    //   info: new_info,
    //   writeCommentValue: ''
    // })
    
    axios.post('/commentsOfPhoto/'+this.state.info._id, {comment:new_comment}).then(results=>{
      //success
      let new_info = this.state.info;
      new_info.comments = this.state.info.comments.concat([results.data]);
      console.log(new_info)
      this.setState({
        info: new_info,
        writeCommentValue: ''
      });
    })
  }

  handleChange(event) {
    this.setState({writeCommentValue: event.target.value});
  }

  handleFav(){
    console.log("handleFav is called")
    if (this.state.favorite){
      //remove from favorite
      console.log(this.state.info)
      axios.post('/removeFromFavorite', {photo_id: this.state.info._id});
      this.props.updateUser()
      this.setState({favorite: false});
      return;
    }
    // add to favorite
    axios.post('/addToFavorite', {photo_id: this.state.info._id});
    this.props.updateUser();
    this.setState({favorite: true});
  }

  render(){
    console.log('state - isfav', this.state.favorite);
    console.log('props favs list', this.props.user.favorites);
    //console.log(this.props.user.favorites)
    let info = this.state.info;

    let comments = <small>no comments so far</small>;
    if (info.comments){
      comments = [];
      for (let i = 0; i < info.comments.length; i++){
        comments.push(<Comment 
          id = {info.comments[i]._id} 
          fullName = {info.comments[i].user.first_name + ' ' + info.comments[i].user.last_name} 
          userID = {info.comments[i].user._id} 
          dateTime = {info.comments[i].date_time} 
          comment = {info.comments[i].comment}
          />);
      }
    }

    return (
      <div className="post" id={info._id}>
        <Typography variant="body2">
          Posted at: {info.date_time}
          <br />
          <img src={'/images/'+info.file_name} />
          <br />
          <button onClick={this.handleFav}>{this.state.favorite ? 'remove from favorites' : 'add to favorites'}</button>
          <br />
          <form onSubmit={this.handleComment}>
            <input className='inputComment' name='comment' placeholder='write your comment here...' type='text' value={this.state.writeCommentValue} onChange={this.handleChange}/>
            <input type='submit' value='post comment' />
          </form>
          <b>Comments:</b><br />
          {comments}
          <hr />
        </Typography>
      </div>
    );
  }
}
export default UserPhotos;


class Comment extends React.Component {
  constructor(props){
    super(props);
  }
  

  render(){
    return (
      <div className="comment" id={this.props.id}>
        <br />
        <Link to={'/users/' + this.props.userID}><b>{this.props.fullName}</b></Link> <small>{this.props.dateTime}</small>
        <br />
        <span>{this.props.comment}</span>
      </div>
    )
  }
}