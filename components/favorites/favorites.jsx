import React from 'react';
import {
  Typography
} from '@material-ui/core';
import './favorites.css';
import axios from 'axios';
import ReactModal from 'react-modal';


class FavoriteTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data:[], 
      showModal: false,
      picToShow:null,
    };
    this.setData = this.setData.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }



  setData(){
    console.log('setting data');
    let userID = this.props.match.params.userId;
    let self = this;
    axios.get('/favoritesOfUser/' + userID).then(results=>{
      console.log('request fav results: ', results);
      if (results.data.login_unsuccessful === true){
        this.props.history.push('/login-register');
      }
      self.setState({data: results.data.favorites});
    }).catch(err=>{
      console.log(err);
    });
  }

  componentDidMount(){
    console.log('mounting');
    this.setData();
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.setData();
    }
  }

  handleOpenModal (ind) {
    this.setState({ showModal: true, picToShow:  ind});
  }
  
  handleCloseModal () {
    this.setState({ showModal: false });
  }

  handleRemoveFav(ind){
    console.log("handleFav is called, removing", this.state.data[ind]._id);
    axios.post('/removeFromFavorite', {photo_id: this.state.data[ind]._id});
    this.props.updateUser();
    return;
  }

  render() {
    console.log('showing favorites', this.state.data);
    console.log(this.state.data.length);
    let showFavs = [];
    for (let i = 0; i < this.state.data.length; i++){
      console.log(<Thumbnail data={this.state.data[i]} />);
      showFavs.push(
        <div>
          <button onClick={()=>{this.handleOpenModal(i)}} className='picButton'>
            <Thumbnail data={this.state.data[i]}/>
          </button><br />
          {this.props.user._id === this.props.match.params.userId ? 
          <button onClick={()=>{this.handleRemoveFav(i)}}>
            Remove from Favorites
          </button>: <span></span> }
          <hr />
        </div>
      );
    }

    console.log('this.state.data', this.state.data);
    console.log('this.state.picToShow', this.state.picToShow);
    console.log('this.state.data[this.state.picToShow]', this.state.data[this.state.picToShow])
    console.log(this.props.user._id, this.props.match.params.userId);
    return (
      <div>
        {showFavs.length !== 0 ? showFavs : <Typography variant="h5" align="center">User have not added any favorite photos</Typography>}

        <ReactModal 
           isOpen={this.state.showModal}
           contentLabel="Minimal Modal Example" 
        >
          <button onClick={this.handleCloseModal}>Close Modal</button>
          <PopupPost info = {this.state.data[this.state.picToShow]} closeModal={this.handleCloseModal} user = {this.props.user} updateUser={this.props.updateUser}/>
        </ReactModal>
      </div>

    );
  }
}

export default FavoriteTable;


class Thumbnail extends React.Component {
  constructor(props) {
    super(props);
    // this.state = {
      
    // }
  }


  render(){
    console.log('rendering thumbnail')
    return (
      <div className='thumbnail'>
        <img id={this.props.data.file_name} src={'/images/'+this.props.data.file_name} />
      </div>
    )
  }
}

class PopupPost extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      info: this.props.info,
      writeCommentValue: '',
      favorite: false
    }
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

    return (
      <div className="post" id={info._id}>
        <button onClick={this.handleFav}>{this.state.favorite ? 'remove from favorites' : 'add to favorites'}</button>
        <Typography variant="body2">
          Posted at: {info.date_time}
          <br />
          <img src={'/images/'+info.file_name} />
          <br />
        </Typography>
      </div>
    );
  }
}

export {Thumbnail}