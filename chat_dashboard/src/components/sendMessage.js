import {useEffect} from 'react';
import { useParams } from 'react-router-dom';
import socketIOClient from 'socket.io-client';

const endPoint = "http://127.0.0.1:3000";

function SendMessage() {

    let {message} = useParams();
    useEffect(() => {
        const socket = socketIOClient(endPoint);
        socket.emit('message', {
            from : "Admin",
            text : {message}
        })
        return () => socket.disconnect();
    },[message]);

    return(
        <div>message sent!</div>
    )
}

export default SendMessage;