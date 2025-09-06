import React, { createContext, useEffect, useState } from 'react';
import io from 'socket.io-client'

// 1. Create the context
export const context = createContext();


// 2. Create the provider component
export function UserProvider({ children }) {

const [username,setusername]=useState(null);
const [userprofile,setuserprofile]= useState(null)
const [showcontacts,setshowcontacts] = useState(true)
const [socket,setsocket]=useState(null)

const [Togglemode,Settogglemode]=useState(false)

const [data,setdata]=useState([])

const [grouparray,setgrouparray]=useState([])

const [screenSize, setScreenSize] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);

    handleResize(); // update on mount

    return () => window.removeEventListener("resize", handleResize);
  }, []);

    

useEffect(()=>{
  
 if (!username) return;

  const socket = io("https://chatapplication-fyaq.onrender.com");
  socket.emit('user-joined', username);
  setsocket(socket);

  return () => {
    socket.disconnect();
  };

},[username])


console.log('xdata',username)

useEffect(()=>{

  var xdata=JSON.parse(localStorage.getItem('userdata'))

  if(xdata!==null )
  {
    setusername(xdata.name)  
    setuserprofile(xdata.img)
  }
  else if(xdata==undefined || xdata==null)
  {
    setusername(null)
    setshowcontacts(false)
    
  }


},[])


  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('https://chatapplication-fyaq.onrender.com/allusers');
        const data = await res.json(); // convert response to JSON
        setdata(data); // store the contacts in state
        console.log('contacts',data)
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    }

    fetchData();
  }, []);

   useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`https://chatapplication-fyaq.onrender.com/fetchgroup/${username}`);
        const data = await res.json(); // convert response to JSON
        setgrouparray(data); // store the contacts in state
        console.log('grouparray',data)
      } catch (error) {
        console.error('Error fetching group:', error);
      }
    }

    fetchData();
  }, [username]);


  return (
    <context.Provider value={{screenSize, setScreenSize,showcontacts,setshowcontacts,setuserprofile,userprofile,grouparray,setgrouparray,data,setdata,Togglemode,Settogglemode,username,socket,setusername}}>
      {children}
    </context.Provider>
  );
}
