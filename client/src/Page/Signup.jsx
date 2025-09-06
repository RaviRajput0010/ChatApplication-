import React, { useContext, useState } from 'react';
import '../Page/Signup.css';
import {useNavigate} from 'react-router-dom' 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { context } from '../Context';


function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const {setusername}=useContext(context);
  const {screenSize,showcontacts,setshowcontacts}=useContext(context);
  

  const navigate=useNavigate();

  async function handleSubmit() {
    
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'Post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email,password}),

      });

      const data = await response.json();
      console.log('Response:', data);
      if(data.name==null)
      {
        toast.error("Account Authentication Failed")
      }
      else
      {
           
      setTimeout(() => {
        toast.success("Account Authentication Successfull")
       localStorage.setItem('userdata', JSON.stringify(data))
       setusername(data.name);
        if(screenSize < 480) 
          {
            setshowcontacts(true)
          } 
      navigate('/')

      },3000);
     
      }
      
    } catch (error) {
      console.error('Error:', error);
      toast.error("Account Authentication Failed")
    }
  }
  
  return (
    <div className='maindiv2'>
      <div className='boxdiv2'>
      <h2>Login</h2>
        <p>Email Address</p>
        <input className='inputbox'
          type="text"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder='abc@example.com'
        />
        <p>Password</p>
        <input  className='inputbox'
          type="password"
          onChange={(e) => setPass(e.target.value)}
          value={password}
          placeholder='password'
        /><br/>
        <button className='submitbtn' onClick={handleSubmit}>Account Login</button>
         <p onClick={()=>navigate('/signup')} >Don't have an account? <span style={{cursor:'pointer'}}>Register</span> </p>
      </div>
    </div>
  ); 
}

export default Signup;
