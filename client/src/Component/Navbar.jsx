import React, { useContext, useState } from 'react';
import { images } from '../Asset/image.js';
import '../Component/Navbar.css';
import { useNavigate } from 'react-router-dom';
import { context } from '../Context.js';

function Navbar() {
  const { Togglemode, Settogglemode, username, setusername ,userprofile,setuserprofile,setshowcontacts} = useContext(context);
  const jump = useNavigate();

  const [showProfileBox, setShowProfileBox] = useState(false);
  const [profileImg, setProfileImg] = useState(localStorage.getItem('profileImg') || images.noprofile);
  const [newImg, setNewImg] = useState('');

  function del() {
    localStorage.removeItem('userdata');
    localStorage.removeItem('profileImg');
    setTimeout(() => {
      setshowcontacts(false)
      jump('/login');
    }, 2000);
    setusername(null);
    setProfileImg(images.noprofile);
  }

  const storedUser = JSON.parse(localStorage.getItem('userdata'));
  const userEmail = storedUser?.email;

  async function updateProfileImg() {
    if (!newImg.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/updateProfileImage/${userEmail}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImg: newImg })
      });

      const result = await res.json();
      if (result.success) {
        setuserprofile(newImg)
        localStorage.setItem('profileImg', newImg);
        setNewImg('');
        setShowProfileBox(false);
      } else {
        console.error(result.error);
        alert("Failed to update image");
      }
    } catch (error) {
      console.error("Error updating profile image:", error);
    }
  }

  // Safely extract username
  const displayName =
    typeof username === "object"
      ? username?.name || "User"
      : username || "User";

  return (
    <nav>
      {/* Left Logo */}
      <div className="left">
        <img
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setshowcontacts(true)
            jump('/')}}
          src={images.logo}
          alt="Logo"
        />
      </div>

      {/* Right Side */}
      <div className="right">
       
        {username && (
          <div className="profile-section">
            <button
              onClick={() => setShowProfileBox(!showProfileBox)}
              style={{ cursor: 'pointer' }}
            >
              {displayName}
            </button>

            {showProfileBox && (
              <div className="profile-box">
                <img
                  src={userprofile}
                  alt="Profile"
                  className="profile-pic"
                />
                <p>{displayName}</p>

                <input
                  type="text"
                  placeholder="Enter image link..."
                  value={newImg}
                  onChange={(e) => setNewImg(e.target.value)}
                />
                <button onClick={updateProfileImg}>Update</button>

                <button onClick={del}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
