import React, { useContext, useEffect, useState } from 'react'
import { Socket } from 'socket.io-client';
import { context } from '../Context';
import { toast } from 'react-toastify';

function Notifcation() {

  const [requestarray,setrequestarray]=useState([])

  const {socket,username,name}=useContext(context)

  useEffect(()=>{

    var x=JSON.parse(localStorage.getItem('requestdata'))

    console.log('x data',x);
    

    if(x!==null)
      requestarray.push(x)

    
  },[])

  function sendconfirmation(rec)
  {
    console.log('rec',rec);
   
    const datax={sender:username,receiver:rec}
    socket.emit('accept-request',datax)

  }

  useEffect(()=>{

    if(!socket)
      return

    function handler(obj)
    {
      if(username==obj.receiver)
      {
        toast.success(obj.sender+' accepted ur request')
      }
  
    }

    socket.on('recieve-acceptrequest-from-sender',handler)

  },[socket])


  return (
    <div className='chat'>
      {requestarray.length==0?<p>No request found</p>:
      (requestarray.map((i)=>{
            return(
              <div>
                <div>
                  Sender name - {i.sender}
                  <div>
                   <button onClick={()=>sendconfirmation(i.sender)}>Confirm</button>
                
                   <button>Delete</button>
                
                  </div>
                  </div>
                  
              </div>
            )
      }))
      }      
    </div>
  )
}

export default Notifcation
