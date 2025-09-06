import React, { useContext } from 'react'
import { context } from '../Context'
import { useNavigate } from 'react-router-dom'

function Dashboard() {

    const {username}=useContext(context)

    const jump=useNavigate();

  return (
    <div className='dashboard'>
        
    </div>
  )
}

export default Dashboard
