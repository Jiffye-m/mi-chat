
const socket = io();

const clientsTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messageTone = new Audio('/message-tone.mp3')

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
})

// real time comm..

// Send Message Function
function sendMessage() {
    if(messageInput.value === '') return	
    const data = {
        name: nameInput.value,
        message: messageInput.value,
        dateTime: new Date()
    }
    socket.emit('message', data);
    addMessage(true, data);
    messageInput.value = '';
}

// receiving message
socket.on('message', (data) => {
    messageTone.play();
    addMessage(false, data);
});

// Checking total participants
socket.on('clients-total', (data) => {
    console.log(data);
    clientsTotal.innerText = `Total Clients ${data}`;
})

// Add message to ui
function addMessage(isOwnMessage, data){
    clearFeedback();
    const element = `<li class="${isOwnMessage ? "message-right" : "message-left"}">
    <p class="message">
      ${data.message}
      <span>${isOwnMessage ? " " : data.name} ● ${moment(data.dateTime).fromNow()}</span>
    </p>
  </li>`

  messageContainer.innerHTML += element;
  scrollToBottom();
}

// Scroll after tyoing
function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

// Output feedback
socket.on('feedback', (data) => {
    clearFeedback();
if(data.feedback === '') return;

  const element = `<li class="message-feedback">
  <p class="feedback" id="feedback">${data.feedback}</p>
</li>`;
messageContainer.innerHTML += element;
})

// clear feedback
function clearFeedback() {
    document.querySelectorAll('.message-feedback').forEach(element => {
        element.parentNode.removeChild(element);
    })
}

// User joined feedback
// Listening for user-joined event
// socket.on('user-joined', (data) => {
//     const element = `<li class="message-feedback">
//     <p class="feedback" id="feedback">${data.feedback}</p>
//   </li>`;
//   messageContainer.innerHTML += element;
// });


// Input field events
messageInput.addEventListener('focus', (e) => {
    socket.emit('feedback',{
        feedback: `✍️ ${nameInput.value} is typing...`
    })
});


messageInput.addEventListener('keypress', (e) => {
    socket.emit('feedback',{
        feedback: `✍️ ${nameInput.value} is typing...`
    })
  });

  
messageInput.addEventListener('blur', (e) => {
    socket.emit('feedback',{
        feedback: ''
    })
  });