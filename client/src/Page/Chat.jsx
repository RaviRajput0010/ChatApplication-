import React, { useContext, useEffect, useRef, useState } from 'react'
import './Chat.css'
import { useLocation } from 'react-router-dom'
import { context } from '../Context'
import { images } from '../Asset/image'

function Chat() {
  const location = useLocation()
  const { name, profile } = location.state || {}

  const { socket, username,screenSize,showcontacts,setshowcontacts } = useContext(context)

  const [messagearray, setmessagearray] = useState([])
  const [message, setmessage] = useState('')
  const [conversationid, setconversationid] = useState(null)
  const bottomscroll = useRef()

  function sendmsg() {
    if (!message.trim()) return

    const obj = { convoid: conversationid, sender: username, message, receiver: name ,time:Date()}

    // ✅ update UI instantly
    setmessagearray((prev) => [...prev, obj])

    // ✅ emit to socket
    socket.emit('send-msg-data', obj)

    setmessage('')

    // ✅ save to backend
    try {
      fetch('https://chatapplication-fyaq.onrender.com/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj),
      })
    } catch (error) {
      console.error('Error while sending message to backend:', error)
    }
  }

  // generate conversation id
  useEffect(() => {
    if (!username || !name) return
    const id = username > name ? `${name}-${username}` : `${username}-${name}`
    setconversationid(id)
  }, [username, name])

  // listen for incoming messages
  useEffect(() => {
    if (!socket) return
    const handler = (msg) => {
      if (msg.convoid === conversationid) {
        setmessagearray((prev) => [...prev, msg])
      }
    }
    socket.on('receiving-msg-from-sender', handler)
    return () => socket.off('receiving-msg-from-sender', handler)
  }, [socket, conversationid])

  // fetch past chats when conversationid changes
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`https://chatapplication-fyaq.onrender.com/allchats/${conversationid}`)
        const data = await res.json()
        setmessagearray(data)
      } catch (error) {
        console.error('Failed to fetch chats:', error)
      }
    }
    if (conversationid) fetchChats()
  }, [conversationid])

  // auto-scroll
  useEffect(() => {
    bottomscroll.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagearray])

  return (
    <div className='chat'>
      <div className='chatheader'>
        {
          screenSize < 480 ? <img src={images.back} style={{height:'18px',width:'18px'}} onClick={()=>setshowcontacts(true)} alt='error'/> : ''
        }
        <div className='usernameandprofile'>
          <img src={profile == null ? images.noprofile : profile} alt='' />
          <p>{name}</p>
        </div>
      </div>

      <div className='chatbox'>
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
          src={profile == null ? images.noprofile : profile}
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

        <div ref={bottomscroll} />
      </div>

      <div className='chatinput'>
        <input
          type='text'
          onChange={(e) => setmessage(e.target.value)}
          value={message}
          onKeyUp={(e) => e.key === 'Enter' && sendmsg()}
        />
        <img onClick={sendmsg} src={images.send} alt='' />
      </div>
    </div>
  )
}

export default Chat
