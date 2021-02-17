import './App.css';
import {useEffect , useState} from 'react';
import socketIOClient from 'socket.io-client';
import Moment from 'react-moment';
import { Redirect } from 'react-router-dom';

const endPoint = "http://127.0.0.1:3000";

function App(props) {
  //let [response, setResponse] = useState("");
  let [inputValue, setInputValue] = useState("");
  let [currentSocket, setCurrentSocket] = useState(null);
  let [button, setButton] = useState(0);
  let [chat, setChat] = useState([]);

  useEffect(() => {
    const socket = socketIOClient(endPoint);
    setCurrentSocket(socket);
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

    return () => socket.disconnect();
  },[])

  const submitHandler = (event) => {
    event.preventDefault();
    console.log("button", button);
    if(button === 1){
      currentSocket.emit('createMessage', {
        text : {inputValue}
      })
      
    } else {
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
            </form>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default App;
