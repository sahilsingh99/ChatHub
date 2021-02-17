let express = require('express');
let env = require('dotenv');
let http = require('http');
let socketIO = require('socket.io');
let {generateMessage, generateLocationMessage} = require('./utils/message');
let {isRealString} = require('./utils/isRealString');
let {Users} = require('./utils/users');
let users = new Users();

env.config();
let app = express();

//handling cors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin",'*');
    res.header(
        "Access-Control-Allow-Headers",
        "origin, X-Requested-With, Accept, Authorization, Content-type"
    );
    
    if(req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH , GET , DELETE");
        return res.status(200).json({});
    }

    next();
})

const port = process.env.PORT || 3000;
var server = http.createServer(app);

// giving server instance to socket.io (socket.io do not work well with app.listen);
options={
    cors:true,
    origins:["*"],
   }
const io = socketIO(server, options);


// setting connection
io.on('connection',(socket) => {
    console.log('A user is connected!');

    socket.on('join', (params, callback) => {
        if(!isRealString(params.name) || !isRealString(params.room)) {
            callback('Name and Room is required!');
        }

        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUsersList', users.getUserList(params.room));

        socket.emit('newMessage' , generateMessage('Admin', `Welcome to ${params.room}`));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} joined ${params.room}`));
        callback();
    })

    socket.on('createMessage', (message) => {
        let user = users.getUser(socket.id);
        console.log(message);
        if(user && isRealString(message.text.inputValue)){
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text.inputValue));
        }
    })

    socket.on('createLocationMessage', (message) => {
        let user = users.getUser(socket.id);

        if(user){
          io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, message.lat, message.lng))
        }
    })

    socket.on('disconnect', () => {
        let user = users.removeUser(socket.id);
        console.log("user disconnected");
        if(user){ 
            io.to(user.room).emit('updateUsersList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left ${user.room} chat room.`))
          }
    })
})



server.listen(port, (req, res) => {console.log("Server is Live !!");});