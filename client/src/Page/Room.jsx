import { useState, useContext, useEffect } from 'react';
import './Group.css'; // you can rename to Room.css if you like
import { images } from '../Asset/image';
import { useLocation, useNavigate } from 'react-router-dom';
import { context } from '../Context';



function Room() {
  const location = useLocation();
  const {
    name,
    profile,
    id,
    createdBy
  } = location.state || {};

  const { socket, username, userprofile,screenSize,setshowcontacts } = useContext(context);

  const [messagearray, setmessagearray] = useState([]);
  const [message, setmessage] = useState('');


  
const navigate =useNavigate();

  // ------------------- Join Room -------------------
  useEffect(() => {
    if (id) {
      socket.emit('join-group', id);   // 🔹 use "room" instead of "group"
    }
  }, [socket, id]);

  // ------------------- Send Message -------------------
  function sendmessage() {
    if (!message.trim()) return;

    const obj = {
      sender: username,
      roomId: id,
      message: message,
      senderimg: userprofile,
      time: Date()
    };

    // Emit to socket
    socket.emit('sendMessage', obj);

    // Add locally
    setmessagearray((previous) => [...previous, obj]);
    setmessage('');
  }

  // ------------------- Receive Message -------------------
  useEffect(() => {
    const handler = (obj) => {
      if (obj.sender !== username) {
        setmessagearray((previous) => [...previous, obj]);
      }
    };

    socket.on('receiveMessage', handler);

    return () => {
      socket.off('receiveMessage', handler);
    };
  }, [socket, username]);


const [deleting, setDeleting] = useState(false);

async function deleteRoom() {
  if (!id || deleting) return;         // guard
  setDeleting(true);

  try {
    const res = await fetch(`http://localhost:5000/delete/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success !== false) {
      alert(data.message || "Room deleted successfully");
      navigate("/showroom");            // <-- ensure this matches your router
    } else {
      alert(data.error || data.msg || "Failed to delete room");
    }
  } catch (err) {
    console.error("Error deleting room:", err);
    alert("Network error while deleting room");
  } finally {
    setDeleting(false);
  }
}

  return (
    <div className='chat'>
      {/* ------------------- Header ------------------- */}
      <div className="chatheader">
         {screenSize < 480 && (
                  <img
                    src={images.back}
                    style={{ height: '18px', width: '18px', cursor: "pointer" }}
                    onClick={() => setshowcontacts(true)}
                  />
                )}
        <div className="usernameandprofile">
          <img src={profile == null ? images.noprofile : profile} alt="Room" />
          <div>
            <p>{name}</p>
           {screenSize <480 ? '' : <p>Created by {createdBy}</p>} 
          </div>
        </div>
         {username===createdBy?( <div className="delete-btn">
            <button onClick={()=>{deleteRoom()}}>{screenSize <480 ?'Delete':'Delete Room'}</button>
        </div>):''}
      </div>

      {/* ------------------- Chat Box ------------------- */}
      <div className="chatbox">
        {messagearray.map((i, index) => {
          const date = new Date(i.time);
          const formattedTime = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });

          const isSender = i.sender === username;

          return (
            <div
              key={index}
              className={`message-row ${isSender ? 'sender-row' : 'receiver-row'}`}
            >
              {/* Show profile only for receiver */}
              {!isSender && (
                <img
                  src={i.senderimg}
                  alt="dp"
                  className="profile-pic"
                />
              )}

              <div className={isSender ? 'sendermsg' : 'receivermsg'}>
                <p>
                  {i.message}{' '}
                  <span className="time">{formattedTime}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------- Input ------------------- */}
      <div className="chatinput">
        <input
          type="text"
          placeholder="Type a message..."
          onChange={(x) => setmessage(x.target.value)}
          value={message}
          onKeyUp={(e) => e.key === 'Enter' && sendmessage()}
        />
        <img src={images.send} alt="Send" onClick={sendmessage} />
      </div>
    </div>
  );
}

export default Room;
