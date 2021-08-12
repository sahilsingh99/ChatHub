import './App.css';
import {useEffect , useState} from 'react';
import socketIOClient from 'socket.io-client';
import Moment from 'react-moment';
import { Redirect } from 'react-router-dom';
import SocketIOFileUpload from 'socketio-file-upload';
import downloadImage from './images/downloadImage.png';
import downloadJS from 'downloadjs';

const endPoint = "http://127.0.0.1:3000";

function App(props) {
  //let [response, setResponse] = useState("");
  let [inputValue, setInputValue] = useState("");
  let [currentSocket, setCurrentSocket] = useState(null);
  let [button, setButton] = useState(0);
  let [chat, setChat] = useState([]);
  
  const imageClick = async (name) => {
    console.log('Clicked on', name);
    const res = await fetch(endPoint + `/api/download/${name}`);
    const blob = await res.blob();
    // const fileName = "";
    // const extension = "";
    // let Flag = False;
    // for(var i = 0; i < name.length; i++) {
    //   if(Flag == true) {
    //     extension += name[i];
    //   }
    //   if(name[i] == '.') {Flag = True;}
    //   if(flag == False) {
    //     fileName += name[i];
    //   }
    // }
    downloadJS(blob, name);
  } 

  useEffect(() => {
    const socket = socketIOClient(endPoint);
    setCurrentSocket(socket);

    var instance = new SocketIOFileUpload(socket);
    instance.chunkSize = 1024 * 1000;
    instance.maxFileSize = 39062.5 * 1024;

    // Do something on upload progress:
    instance.listenOnSubmit(document.getElementById("chat-button1"), document.getElementById("file-upload"));

    instance.addEventListener("progress", function(event){
      var percent = event.bytesLoaded / event.file.size * 100;
      console.log("File is", percent.toFixed(2), "percent loaded");
      });

      // Do something when a file is uploaded:
      instance.addEventListener("complete", function(event){
          console.log(event.success);
          console.log(event.file);
          document.getElementById('file-upload').value = null;
      });
      // for size issue
      instance.addEventListener("error", function(data){
        if(data.code === 1) {
          alert('File size should be less than 5 MB!!');
          document.getElementById('file-upload').value = null;
        }
      }) 

    socket.on('connect', () => {
      let queryString = props.location.search.substring(1);
      let params = JSON.parse('{"' + decodeURI(queryString).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g,'":"') + '"}');

      socket.emit('join', params, function(err) {
        if(err){
          alert(err);
          return props.history.push('/');
        }else {
          console.log('No Error');
        }
      })
    })

    socket.on('updateUsersList', function (users) {
      let ol = document.createElement('ol');
    
      users.forEach(function (user) {
        let li = document.createElement('li');
        li.innerHTML = user;
        ol.appendChild(li);
      });
    
      let usersList = document.querySelector('#users');
      usersList.innerHTML = "";
      usersList.appendChild(ol);
    })

    socket.on('newMessage', data => {
      let cc = <div className = "message">
      <div className = "message_title">
        <h4>{data.from} <Moment format = "h:mm a">{data.createdAt}</Moment></h4>
      </div>
      <div className = "message_body">
        <p>{data.text}</p>
      </div>
    </div>;
      setChat(prev => [...prev, cc]);
      var element = document.querySelector('.chat-container');
      element.scrollTop = element.scrollHeight;
    })

    socket.on('newLocationMessage', data => {
      console.log('newLocationMessage', data);
      let cc = <div className = "message">
      <div className = "message_title">
        <h4>{data.from} <Moment format = "h:mm a">{data.createdAt}</Moment></h4>
      </div>
      <div className = "message_body">
        <a href = {`${data.url}`} target = "_blank">My current location</a>
      </div>
    </div>;
      setChat(prev => [...prev, cc]);
      var element = document.querySelector('.chat-container');
      element.scrollTop = element.scrollHeight;
    })

    socket.on('newFileMessage', data => {
      let cc = <div className = "message">
      <div className = "message_title">
        <h4>{data.from} <Moment format = "h:mm a">{data.createdAt}</Moment></h4>
      </div>
      <div className = "message_body">
        <img src = {downloadImage} style = {{height: "50px", width: "50px", cursor: "pointer"}} onClick = {() => imageClick(data.text)}></img>
        <p>{data.text}</p>
      </div>
    </div>;
      setChat(prev => [...prev, cc]);
      var element = document.querySelector('.chat-container');
      element.scrollTop = element.scrollHeight;
    })

    return () => socket.disconnect();
  },[])

  const submitHandler = (event) => {
    event.preventDefault();
    console.log("button", button);
    if(button === 1){
      currentSocket.emit('createMessage', {
        text : {inputValue}
      })
      
    } else if(button === 2){
      if(navigator.geolocation === undefined) {
        return alert('GeoLocation is not supported in your Browser :(');
      }
      navigator.geolocation.getCurrentPosition((position) => {
        currentSocket.emit('createLocationMessage', {
          lat : position.coords.latitude,
          lng : position.coords.longitude
        })
      }, function(){
        return alert('Unable to fetch Location :(');
      })
    }
    
    setInputValue("");
  }

  const inputHandler = (event) => {
    event.preventDefault();
    setInputValue(event.target.value);
  }

  return (
    <div className = "App">
      <div className = "main">
        <div className = "side-bar">
          <h2>People</h2>
          <div id = "users"></div>
        </div>
        <div className = "chat">
          <div className = "chat-container">
              {chat}
          </div>
          <div className = "form-container">
            <form onSubmit = {submitHandler} className = "form">
              <input 
                type = "text"
                placeholder = "Type here.."
                onChange = {inputHandler}
                value = {inputValue}
              />
              <button 
                className = "chat-button"
                onClick = {() => setButton(1)}
                type = "submit"
              >Submit</button>
              <button
                className = "chat-button"
                onClick = {() => setButton(2)}
                type = "submit"
              >
                Share Location
              </button>
              <input 
                type = "file"
                className = "file-upload"
                id = "file-upload"
              />
              <button 
                className = "chat-button"
                onClick = {() => setButton(0)}
                id = "chat-button1"
                type = "submit"
              >Share File</button>
            </form>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default App;
