import React, { use, useContext, useEffect } from 'react'
import { images } from '../Asset/image'
import { context } from '../Context'
import './Searchonline.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Socket } from 'socket.io-client';

function Searchonline() {

  const {username,name,socket,data ,setdata}=useContext(context)

function sendrequest(x)
{
  console.log(x)
  const data={sender:username,receiver:x}
  
  socket.emit('send-request',data)
}

useEffect(()=>{

  if(!socket)
    return

  function accepthandler(x)
  {
    if(x.receiver==username)
    {       
        toast.success(x.sender+' send u a request')
        localStorage.setItem('requestdata',JSON.stringify(x))
   
    }

  }

  socket.on('recieve-request-from-sender',accepthandler)

  return()=>{
    socket.off('recieve-request-from-sender',accepthandler)
  }

},[socket])


  return (
    <div className='searchonline'>
      {

   data.map((i)=>{
            return(
                <div className='singlecontact'style={{cursor:'pointer'}}>
                    <img src={i.img==null?images.noprofile:i.img}  alt="" />
                    <p>{i.name}</p>
                    <img id='add'onClick={()=>sendrequest(i.name)} src={images.addfrnd} alt="" />
                </div>
            )
        })
     
      }
    </div>
  )
}

export default Searchonline
