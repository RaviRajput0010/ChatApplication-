import React, { useContext, useEffect, useState } from 'react';
import './Contact.css';
import { useNavigate } from 'react-router-dom';
import { context } from '../Context';
import { images } from '../Asset/image';
import Searchonline from '../Component/Searchonline.jsx';
import { toast } from 'react-toastify';

function Contact() {
  const jump = useNavigate();
  const { showcontacts,setshowcontacts,username, data, setdata, grouparray, setgrouparray,screenSize, setScreenSize } = useContext(context);

  const [searchtext, setsearchtext] = useState('');
  const [toggle, settoggle] = useState(false);
  
  // ----------------- Search Contacts -----------------
  useEffect(() => {
    if (!searchtext) return;

    const filtered = data.filter((i) =>
      i.name.toLowerCase().includes(searchtext.toLowerCase())
    );
    setdata(filtered);
  }, [searchtext]);

  // ----------------- Toggle -----------------
  function ManageToggle() {
    settoggle((prev) => !prev);
  }

  // ----------------- Create Group -----------------
  async function creategroup() {
    const groupimage = [images.group];
    const random = Math.floor(Math.random() * groupimage.length);

    const x = prompt("Enter Group name");
    if (!x) 
    {
      setshowcontacts(true);
      return;
    }
    
    const obj = {
      name: x,
      img: groupimage[random],
      createdBy: username,
      members: [username],
      type: 'group'
    };

    try {
      const response = await fetch('https://chatapplication-fyaq.onrender.com/newgroupcreate', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj)
      });

      const result = await response.json();
      if (result.success) {
        setgrouparray((prev) => [...prev, result.group]);
        toast.success("Group created");
        
      } else {
        toast.error("Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Error creating group");
    }
  }

  
  return (
    <div className={showcontacts? 'contact': 'hide'}>
      {/* ---------- Header ---------- */}
      <div className="search">
        <div className="one">
          <h3>Chat</h3>
          <div className='rightdiv'>
            <img id='roompic' src={images.talk}  onClick={() => { 
              setshowcontacts(false)
              jump('/showroom') }}/>            
            <img id='grouplogo' src={images.group} alt="" onClick={
               ()=>{
                setshowcontacts(false)
              creategroup()
               }
              } />
          </div>
        </div>
        <div className="inpuutt">
          <input
            type="text"
            onChange={(x) => setsearchtext(x.target.value)}
            value={searchtext}
          />
        </div>
      </div>

      {/* ---------- Groups (only) ---------- */}
      {grouparray
        .filter(group => group.type === "group" && group.members?.includes(username))
        .map((i, index) => (
          <div key={index} className='singlecontact' onClick={()=>setshowcontacts(false)}>
            <div
              style={{ display: "flex", alignItems: "center", flex: 1, cursor: "pointer" }}
              onClick={() => {
                jump('/group', {
                  state: {
                    name: i.groupName,
                    profile: i.img || images.group,
                    totalmemebers: i.members.length,
                    members: i.members,
                    createdBy: i.createdBy,
                    id: i._id
                  }
                })
              }}
            >
              <img src={i.img || images.group} alt="" />
              <p>{i.groupName}</p>
            </div>
          </div>
        ))}

      {/* ---------- Contacts ---------- */}
      {toggle === false ? (
        <div className="allcontact">
          {data.length === 0 ? (
            <p style={{ paddingLeft: '25px' }}>No Contact yet</p>
          ) : (
            data.map((i, idx) => (
              <div
                key={idx}
                className='singlecontact'
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setshowcontacts(false)
                  jump('/chat', { state: { name: i.name, profile: i.img } });
                }}
              >
                <img src={i.img == null ? images.noprofile : i.img} alt="" />
                <p>{i.name}</p>
              </div>
            ))
          )}
        </div>
      ) : (
        <Searchonline />
      )}
    </div>
  );
}

export default Contact;
