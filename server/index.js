import express, { json } from 'express'
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import mongodb from '../server/mongodbconnection.js';
import cors from 'cors'
import userSchema from '../server/Schema/userdata.js'
import MessageSchema from '../server/Schema/chatdata.js'
import http from 'http';
import { Server } from 'socket.io';
import GroupSchema from './Schema/groupschema.js'

const app=express();

app.use(express.json())

const User = mongoose.model('UserData', userSchema);
const Message = mongoose.model("Chats", MessageSchema);
const group = mongoose.model("group", GroupSchema);


app.use(cors({
  origin: "https://chat-application-sigma-seven.vercel.app", // Allow your frontend's origin
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

dotenv.config()

mongodb()

app.get('/',(req,res)=>{
    res.send('Hello from server')

})
// make sure this middleware exists *before* your routes
app.use((req, res, next) => { req.io = io; next(); });

app.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await group.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    if (req.io) {
      req.io.to(id).emit("room-deleted", { roomId: id });
    }

    return res.status(200).json({ success: true, message: "Room deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});


app.post("/login", async (req, res) => {

  try {
    const { email, password } = req.body;
    console.log(req.body)
    const user = await User.findOne({ email, password });
    if (!user) return res.status(400).json("Invalid credentials");

    res.status(200).json({ message: "Login successful", name: user.name,img:user.img ,email:user.email,phone:user.phone,description:user.description});
   
  } catch (error) {
    console.error(error);
    res.status(500).json("Server error");
  }
});

app.get('/allchats/:conversationId', async (req, res) => {
  const { conversationId } = req.params;

  try {
    const result = await Message.find({ conversationId }).sort({ time: 1 });
    res.status(200).json(result); // Send sorted messages as response
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});


app.post('/message', async (req, res) => {
  const { convoid,sender, receiver, time, message } = req.body;

  console.log('message',req.body)
  const chatdata = new Message({ conversationId:convoid, sender, receiver, time, message });
  await chatdata.save();
  res.status(201).json("Message sent");

});

app.get('/allusers', async (req, res) => {
  try {
    const result = await User.find();
    res.status(200).json(result); 
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.delete('/deletegroup/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await group.findByIdAndDelete(id); 
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});



app.post('/newgroupcreate', async (req, res) => {
  try {
    const { name, img, createdBy,type } = req.body; // ✅ match frontend

    if (!name || !img || !createdBy) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const newGroup = new group({
    groupName: name,
    groupImage: img,
    createdBy: createdBy,
    members: [createdBy],
    messages: [],
    type:type
    });

    await newGroup.save();
    res.status(201).json({ success: true, group: newGroup });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.get('/allrooms', async (req, res) => {
  try {
    const rooms = await group.find({ type: "room" });
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});


app.post("/api/groups/addmember", async (req, res) => {
  try {
    const { groupId, member } = req.body;

    console.log('member data',req.body)

    if (!groupId || !member) {
      return res.status(400).json({ success: false, error: "Missing data" });
    }

    const data = await group.findById(groupId);

    if (!data) {
      return res.status(404).json({ success: false, error: "Group not found" });
    }

    if (data.members.includes(member)) {
      return res.status(400).json({ success: false, error: "Member already exists" });
    }

    data.members.push(member);
    await data.save();

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


app.get('/fetchgroup/:username', async (req, res) => {
  const { username } = req.params;

  console.log('Looking for groups with member:', username);

  try {
   
    const result = await group.find({ members: username });
    console.log('Filtered groups for user:', result);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

app.post("/addgrpmessage", async (req, res) => {
  try {
    const { groupId, sender, message ,senderimg} = req.body;

    if (!groupId || !sender || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create new message object
    const newMessage = { sender, message ,senderimg};

    // Push into messages array
    const updatedGroup = await group.findByIdAndUpdate(
      groupId,
      { $push: { messages: newMessage } },
      { new: true } // return updated document
    );

    if (!updatedGroup) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json({ success: true, group: updatedGroup });
  } catch (err) {
    console.error("Error adding message:", err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/groupmessages/:id", async (req, res) => {
  console.log('id is :',req.params.id);
  
  try {
    const group1 = await group.findById(req.params.id);
    res.json(group1.messages); // messages come from group schema
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/updateProfileImage/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { profileImg } = req.body;

    if (!profileImg) {
      return res.json({ success: false, error: "No image provided" });
    }

    const user = await User.findOneAndUpdate(
      { email: email },      // ✅ match by email
      { img: profileImg },
      { new: true }
    );

    if (!user) return res.json({ success: false, error: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});



app.post('/signup',async (req,res)=>{
  
    try {
    const { name, email, password, phone,image, description } = req.body;
    
    console.log(image)

    //const imgPath = req.file ? req.file.path : null; // Cloudinary URL

    const userData = { name, email, password, phone, img: image,description };

    const user = await User.create(userData);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: 'Error saving user' });
  }
})

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (use only for debugging)
    methods: ["GET", "POST"],
    credentials: true
  }
});

var users = [];

// Socket.IO connection handling
io.on('connection', socket => {
  socket.on('user-joined',(name)=>{
  console.log(name,'Joined')

  const user={name:name,id:socket.id}

  const filtered=users.filter((i)=>i.name===name)
  if(filtered.length===0)
  {
    users.push(user)
  }
  else
  {
    console.log('user already exist')
  }
  
console.log('allusers',users)


  })

  socket.on('send-msg-data',(msg)=>{

    const filtered=users.filter((i)=>i.name===msg.receiver)
    if(filtered.length!=0)
    {
      io.to(filtered[0].id).emit('receiving-msg-from-sender',msg)
      console.log('message send to',filtered[0].name)
    }
    else
    {
    console.log('user not exist')
    }


  })

   socket.on('started-typing', (obj) => {
    const filtered = users.filter((i) => i.name === obj.receiver);
    if (filtered.length !== 0) {
      io.to(filtered[0].id).emit('receiver-typing', obj);
    } else {
      console.log('Receiver not found');
    }
  });

  socket.on('stop-typing', (obj) => {
    const filtered = users.filter((i) => i.name === obj.receiver);
    if (filtered.length !== 0) {
      io.to(filtered[0].id).emit('receiver-stop-typing', obj);
    } else {
      console.log('Receiver not found');
    }
  });

  
  socket.on('send-request',(msg)=>{

    const filtered=users.filter((i)=>i.name===msg.receiver)
    if(filtered.length!=0)
    {
      io.to(filtered[0].id).emit('recieve-request-from-sender',msg)
      console.log('request send to',filtered[0].name)
    }
    else
    {
    console.log('user not exist')
    }
  })

   socket.on('accept-request',(msg)=>{

    const filtered=users.filter((i)=>i.name===msg.receiver)
    if(filtered.length!=0)
    {
      io.to(filtered[0].id).emit('recieve-acceptrequest-from-sender',msg)
      console.log('request send to',filtered[0].name)
    }
    else
    {
    console.log('user not exist')
    }
  })

  socket.on("join-group", (id) => {
    socket.join(id);
    console.log(`${socket.id} joined group ${id}`);
  });

  socket.on("sendMessage", (obj) => {
    console.log('msg',obj);
    
    io.to(obj.roomId).emit("receiveMessage", obj);
  });

  socket.on('disconnect', () => {
  users = users.filter((user) => user.id !== socket.id);
  console.log('User disconnected. Remaining users:', users);
});


});






server.listen(5000,()=>{
    console.log('Sever running on 5000 port')
})


