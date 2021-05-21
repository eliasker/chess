import React, { useState, useContext } from 'react'

import Context from '../../context/Context'

const User = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  let { user, setUser } = useContext(Context)

  // TODO: send update to server
  const handleLogin = async (event) => {
    event.preventDefault()
    console.log('handleLogin')
    setUsername('')
    setUser({
      ...user,
      name: `User#${user.id.slice(0, 4)}`,
      guest: false
    })
  }

  const handleLogout = () => {
    console.log('handleLogout')
    setUser({
      ...user,
      name: `Guest#${user.id.slice(0, 4)}`,
      guest: true
    })
  }

  return (
    <>
      {user.guest ?
        <>
          <p>Playing as {user.name}</p>
          <form onSubmit={handleLogin}>
            <div>Username 
              <input
                type="text"
                value={username}
                name={"Username"}
                onChange={({ target }) => setUsername(target.value)}
              />
            </div>
            <div>Password 
              <input
                type="text"
                value={password}
                name={"Password"}
                onChange={({ target }) => setPassword(target.value)}
              />
            </div>
            <button type="submit">Log in</button>
          </form>
        </>
        :
        <>
          <p>Logged in as {user.name}</p>
          <button onClick={handleLogout}>Log out</button>
        </>
      }
    </>
  )
}

export default User
