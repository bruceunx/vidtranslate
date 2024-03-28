import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import './App.css'

type Message = {
  event: string
  payload: {
    message: string
  }
}

function App() {
  const [greetMsg, setGreetMsg] = useState('')
  const [name, setName] = useState('')
  const [enable, setEnable] = useState(true)

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    await invoke('stream_greet', { name })
  }
  useEffect(() => {
    listen('greet', (e: Message) => {
      const message = e.payload.message
      if (message === 'stop') {
        setEnable(true)
      } else {
        setEnable(false)
        setGreetMsg(message)
      }
    })
  }, [])

  return (
    <div className="container">
      <h1>Welcome to new world!</h1>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          greet()
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        {enable && <button type="submit">Greet</button>}
      </form>

      <p>{greetMsg}</p>
    </div>
  )
}

export default App
