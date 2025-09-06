import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { images } from "../Asset/image";
import "./Showallroom.css"; // optional stylesheet
import { toast } from 'react-toastify';
import { context } from "../Context";

function Showallroom() {
  const [rooms, setRooms] = useState([]);
  const jump = useNavigate();

  const { username,screenSize,setshowcontacts} = useContext(context);
  

  // Fetch all rooms from DB
  useEffect(() => {
    fetch("http://localhost:5000/allrooms") 
      .then((res) => res.json())
      .then((data) => {
        setRooms(data);
      })
      .catch((err) => {
        console.error("Error fetching rooms:", err);
      });
  }, []);

  async function createroom() {
      const groupimage = [images.group];
      const random = Math.floor(Math.random() * groupimage.length);
  
      const x = prompt("Enter Room name");
      if (!x) return;
  
      const obj = {
        name: x,
        img: groupimage[random],
        createdBy: username,
        members: [username],
        type: 'room'
      };
  
      try {
        const response = await fetch('http://localhost:5000/newgroupcreate', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(obj)
        });
  
        const result = await response.json();
        if (result.success) {
          toast.success("Room created");
        } else {
          toast.error("Failed to create room");
        }
      } catch (error) {
        console.error("Error creating room:", error);
        toast.error("Error creating room");
      }
    }
  

  return (
    <div className="all-rooms">

     <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
      {screenSize < 480 && (
                <img
                  src={images.back}
                  style={{ height: '18px', width: '18px', cursor: "pointer" }}
                  onClick={() => setshowcontacts(true)}
                />
              )}
      <h2>Available Rooms</h2>
       <button onClick={()=>{createroom()}} id="delbtn">{screenSize <480 ?'Create':'Create Room'}</button>
     </div>

      {rooms.length === 0 ? (
        <p>No rooms available</p>
      ) : (
        rooms.map((room, index) => (
          <div
            key={index}
            className="room-card"
            onClick={() =>
              jump("/room", {
                state: {
                  id: room._id,
                  name: room.groupName || room.name,
                  profile: room.img || images.room,
                  createdBy: room.createdBy,
                },
              })
            }
          >
            <img
              src={room.img || images.room}
              alt="room"
              className="room-img"
            />
            <div className="room-info">
              <h3>{room.groupName || room.name}</h3>
              <p>Created by: {room.createdBy}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Showallroom;
