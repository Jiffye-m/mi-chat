const express = require('express');
const app = express();
const ejs = require('ejs');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session'); // Import express-session
const sharedSession = require('express-socket.io-session');
// Create HTTP server
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server);

const PORT = process.env.PORT || 4000;

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

// Add this line after your session middleware setup
const sessionMiddleware = session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
});

// Use the session middleware for Express app
app.use(sessionMiddleware);

// Use the session middleware for socket.io
io.use(sharedSession(sessionMiddleware, {
    autoSave: true
}));


// Serving static files
app.use(express.static('public'));

// View engine
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/', (req, res) => {
    const name = req.body.name;
    console.log(name)
    if(name){
      req.session.name = name;
      res.redirect('/chat');

    } else{
        res.redirect('/');
    }
});

app.get('/chat', (req, res) => {
    const name = req.session.name;
    if(!name){
        res.redirect('/');
    }
    res.render('chat',{
        name
    });
});


let socketsConnected = new Set();

io.on('connection', (socket) => {
    console.log('A user connected');
    console.log(socket.id);
    socketsConnected.add(socket.id);
    // Access session data
    const name = socket.handshake.session.name;


    // Emitting events..
    io.emit('clients-total', socketsConnected.size);

    io.emit('user-joined', { username: name }); // You can pass any relevant user data here

    socket.on('message', (data) => {
        socket.broadcast.emit('message', data);
    });

    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        socketsConnected.delete(socket.id);
    });
});

// Serve socket.io client
// app.get('/socket.io/socket.io.js', (req, res) => {
//     res.sendFile(__dirname + '/node_modules/socket.io/client-dist/socket.io.js');
// });

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
