import logo from './logo.svg';
import './App.css';
import Login from './Page/Login';
import {Routes,Route} from 'react-router-dom'
import Signup from './Page/Signup';
import Navbar from './Component/Navbar';
import Dashboard from './Page/Dashboard';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Contact from './Component/Contact';
import Homepage from './Page/Homepage';
import Chat from './Page/Chat';
import { useContext } from 'react';
import { context } from './Context';
import Group from './Page/Group';
import Notification from './Page/Notifcation.jsx';
import Room from './Page/Room.jsx';
import Showallroom from './Page/Showallroom.jsx';


function App() {

  const {showcontacts,setshowcontacts,username,Togglemode,Settogglemode,screenSize}=useContext(context)

  console.log(showcontacts)

  return (
    <div className="App" style={{backgroundColor:Togglemode==false?'white':'#132036',color:Togglemode==false?'black':'white'}}>
       <ToastContainer />
       <Navbar/>
      <div className='container'>
          {
               username!==null && showcontacts? <Contact/> : ''
          }
            
            {
                  showcontacts && screenSize<480 ? '' : ( <Routes>     
       
        <Route path='/login' element={<Signup/>} />
        <Route path='/signup' element={<Login/>} />
        {username==null?'':<Route path='/dash' element={<Dashboard/>}/>}
        <Route path='/chat' element={<Chat/>}/>
        <Route path='/group' element={<Group/>}/>
        <Route path='/notify' element={<Notification/>}/>
        <Route path='/room' element={<Room/>}/>
        <Route path='/showroom' element={<Showallroom/>}/>
        
        <Route path="/" element={username ? <Homepage /> : <Signup/>} />

      
        </Routes>)

         }
         
        
      </div>
    </div>
  );
}

export default App;
