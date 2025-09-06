import React, { useContext, useState } from 'react';
import '../Page/Login.css';
import {useNavigate} from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {images} from '../Asset/image.js'
import { context } from '../Context.js';



function Login() {
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [name, setname] = useState('');
  const [phone, setphone] = useState('');
  const [image, setimage] = useState('');
  const [desc, setdesc] = useState('');
  const {screenSize,showcontacts,setshowcontacts}=useContext(context);
  
  

  const jump=useNavigate();
  
  async function handleSubmit() {
    try {
      const response = await fetch('https://chatapplication-fyaq.onrender.com/signup', {
        method: 'Post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name,email,password,phone,image,desc}),
      });

      const data = await response.json();
      console.log('Response:', data);
      toast.success("Account Registered");

     
      setTimeout(()=>{
       
        jump('/login')
      },2000)
     
    } catch (error) {
      console.error('Error:', error);
      toast.error("Account Registration Failed")
    }
  }

  return (
    
    <div className='maindiv'>
      <div className='boxdiv'>
        <h2 style={{display:'flex',justifyContent:'flex-start',alignItems:'flex-start'}}>Create Account</h2>

       <div className="boxx">
  <div className="inputGroup">
    <label>Name *</label>
    <input
      type="text"
      onChange={(e) => setname(e.target.value)}
      value={name}
      className="inputbox1"
      required
    />
  </div>

  <div className="inputGroup">
    <label>Email *</label>
    <input
      type="text"
      onChange={(e) => setEmail(e.target.value)}
      value={email}
      className="inputbox1"
      required
    />
  </div>
</div>

<div className="boxx">
  <div className="inputGroup">
    <label>Password *</label>
    <input
      type="password"
      onChange={(e) => setPass(e.target.value)}
      value={password}
      className="inputbox1"
      required
    />
  </div>

  <div className="inputGroup">
    <label>Phone *</label>
    <input
      type="number"
      onChange={(e) => setphone(e.target.value)}
      value={phone}
      className="inputbox1"
      required
    />
  </div>
</div>

  <div className="boxx">
    <div className="inputGroup">
    <label>Image-url </label>
    <input
      type="text"
      onChange={(e) => setimage(e.target.value)}
      value={image}
      className="inputbox1"
    />
  </div>
     <div className="inputGroup">
    <label>Description </label>
    <input
      type="text"
      onChange={(e) => setdesc(e.target.value)}
      value={desc}
      className="inputbox1"
    />
  </div>
  

</div>
 <br/>
        <button className='submitbtn1' onClick={handleSubmit}>Account Register</button>
      <p id='tag'>Already have an account? <span style={{cursor:'pointer'}} onClick={()=>jump('/login')}> Login</span></p> 
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
