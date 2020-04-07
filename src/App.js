import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import './App.css';


const app = new Clarifai.App({
  apiKey: 'fa3b3d8f9a7b46baa06b8256b2e1bd16'
 });

const particleOptions = {
  particles: {
    line_linked: {
      number:{
        value :30,
        density : {
          enable :true,
          value_area:800
        }
      }
    }
  }
}

const initialState = {
  input : '',
  imageURL: '',
  box : {},
  route: 'signin',
  isSignIn : false,
  user:{
    id:'',
    name:'',
    email:'',
    entries :0,
    joinde:''
  }
}

class App extends Component{
  constructor(){
    super();
    this.state = initialState;
  }
 
  loadUser = (data) => {
    this.setState({
      user:{
        id:data.id,
        name:data.name,
        email:data.email,
        entries :data.entries,
        join:data.join
      }
    })
  }

  calcFaceLocation = (data) => {
  const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
  const image = document.getElementById('inputimage')
  const width = Number(image.width);
  const height = Number(image.height);
  console.log(width,height)
  return{
    leftCol:clarifaiFace.left_col * width,
    topRow:clarifaiFace.top_row * height,
    rightCol: width - (clarifaiFace.right_col * width),
    bottomRow : height - (clarifaiFace.bottom_row * height)
  }
  }

displayFaceBox = (box) => {
  this.setState({box:box});
}

  onInputChange = (event) => {
    this.setState({input:event.target.value})
  }

  onButtonSubmit = () => {
    this.setState({imageURL:this.state.input})
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL, 
      this.state.input
      ).then(response => {
        if(response){
        fetch('https://rocky-peak-72119.herokuapp.com/image', {
          method:'put',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            id:this.state.user.id
          })
        }).then(response=> response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries:count}))
        })
      }
        this.displayFaceBox(this.calcFaceLocation(response))})
      .catch(err => console.log(err))
   }
   componentDidMount(){
     console.log(this.state)
   }

   onRouteChange = (route) => {
     if(route==='signin'){
       this.setState(initialState)
       console.log(this.state)
     }else if(route==='home'){
       this.setState({isSignIn:true})
       console.log(this.state)
     }
     this.setState({route:route})
     console.log(this.state)
   }

  render() {  
  return (
    <div className="App">
      <Particles className='particles'
              params={particleOptions}    
            />
         
      <Navigation
      onRouteChange={this.onRouteChange}
      isSignIn={this.state.isSignIn}
      />
      { this.state.route === 'home' ? <div>
          <Logo/>
          <Rank name={this.state.user.name} entries={this.state.user.entries}/> 
          <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
          <FaceRecognition box={this.state.box} imageURL={this.state.imageURL}/>
      </div> : (
        this.state.route === 'signin' 
        ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> 
        : <Register 
        onRouteChange={this.onRouteChange}
        loadUser={this.loadUser}
        />
        )
      
  }
     
    </div>
  );
  }
}

export default App;
