import React, { useState, useContext, useEffect } from 'react';
import './Group.css';
import { images } from '../Asset/image';
import { useLocation } from 'react-router-dom';
import { context } from '../Context';

function Group() {
  const location = useLocation();
  const {
    name,
    profile,
    totalmemebers,
    members = [],
    createdBy,
    id
  } = location.state || {};

  const [groupMembers, setGroupMembers] = useState(members);
  const { data, socket, username, userprofile, screenSize, showcontacts, setshowcontacts } =
    useContext(context);

  const [messagearray, setmessagearray] = useState([]);
  const [message, setmessage] = useState('');
  const [addmemberboxclose, setaddmemberboxclose] = useState(false);
  const [viewmemberboxclose, setviewmemberboxclose] = useState(false);

  // ------------------- Add Member -------------------
  const addMemberToGroup = async (memberUsername) => {
    if (groupMembers.includes(memberUsername)) {
      alert(`${memberUsername} is already in the group`);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/groups/addmember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: id,
          member: memberUsername
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`${memberUsername} added to the group`);
        setGroupMembers((prev) => [...prev, memberUsername]);
      } else {
        alert(result.error || "Failed to add member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  // ------------------- Join Group -------------------
  useEffect(() => {
    if (id) {
      socket.emit('join-group', id);
    }
  }, [socket, id]);

  // ------------------- Send Message -------------------
  async function sendmessage() {
    if (!message.trim()) return;

    const obj = { sender: username, groupId: id, message: message, senderimg: userprofile, time: Date() };
    socket.emit('sendMessage', obj);
    setmessagearray((previous) => [...previous, obj]);
    setmessage('');

    try {
      await fetch("http://localhost:5000/addgrpmessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj),
      });
    } catch (err) {
      console.error("Failed to save message:", err);
    }
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

  // ------------------- Fetch Group Messages -------------------
  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5000/groupmessages/${id}`)
      .then(res => res.json())
      .then(data => {
        setmessagearray(data);
      })
      .catch(err => {
        console.error("Error fetching messages:", err);
      });
  }, [id]);

  // ------------------- Toggle Boxes -------------------
  function toggleaddmemberbox() {
    if (addmemberboxclose) {
      setaddmemberboxclose(false);
    } else {
      if (viewmemberboxclose) setviewmemberboxclose(false);
      setaddmemberboxclose(true);
    }
  }

  function toggleviewmemberbox() {
    if (viewmemberboxclose) {
      setviewmemberboxclose(false);
    } else {
      if (addmemberboxclose) setaddmemberboxclose(false);
      setviewmemberboxclose(true);
    }
  }

  // ------------------- Chat UI -------------------
  const ChatUI = () => (
    <>
      <div className="chatheader">
        {screenSize < 480 && (
          <img
            src={images.back}
            style={{ height: '18px', width: '18px', cursor: "pointer" }}
            onClick={() => setshowcontacts(true)}
          />
        )}
        <div className="usernameandprofile">
          <img src={profile == null ? images.noprofile : profile} alt="Group" />
          <div>
            <p>{name}</p>
            {screenSize >= 480 && <p>{groupMembers.length} members</p>}
          </div>
        </div>
        <div className="chatheaderright">
          {username === createdBy && (
            <button id='addandview' onClick={toggleaddmemberbox}>{screenSize <480 ? 'Add':'Add Member'}</button>
          )}
          <button id='addandview' onClick={toggleviewmemberbox}>{screenSize <480 ? 'View':'View Member'}</button>
        </div>
      </div>

      <div className="chatbox">
        {/* Add Member Box */}
        {addmemberboxclose && (
          <div className='addmemberbox'>
            <button id='addandview' onClick={() => setaddmemberboxclose(false)}>Close</button>
            {data.map((i) => {
              const alreadyInGroup = groupMembers.includes(i.name);
              return (
                <div
                  key={i.name}
                  className='singlecontact'
                  style={{
                    cursor: alreadyInGroup ? 'not-allowed' : 'pointer',
                    opacity: alreadyInGroup ? 0.6 : 1
                  }}
                  onClick={() => {
                    if (!alreadyInGroup) addMemberToGroup(i.name);
                  }}
                >
                  <img src={i.img == null ? images.noprofile : i.img} alt="" />
                  <p>
                    {i.name}{" "}
                    {alreadyInGroup && (
                      <span style={{ color: "green" }}>✔ Added</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* View Member Box */}
        {viewmemberboxclose && (
          <div className='addmemberbox'>
            <button id='addandview' onClick={() => setviewmemberboxclose(false)}>Close</button>
            <ul>
              {groupMembers.map((member, index) => (
                <li key={index}>
                  {member}
                  {member === createdBy && (
                    <span className="admin-tag"> (Admin)</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Messages */}
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
              {!isSender && (
                <img src={i.senderimg} alt="dp" className="profile-pic" />
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
    </>
  );

  return (
    <div className='chat'>
      {/* Phone: contacts OR chat */}
      {screenSize < 480 ? (
        showcontacts ? (
          <div className="contacts-screen">
            <p>📱 Contacts list goes here...</p>
          </div>
        ) : (
          <ChatUI />
        )
      ) : (
        // Laptop: always show chat
        <ChatUI />
      )}
    </div>
  );
}

export default Group;
