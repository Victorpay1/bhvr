import { useState } from 'react'
import './App.css'

interface Tweet {
  id: string
  url: string
  text: string
  author: string
  createdAt: string
}

function App() {
  const [keyword, setKeyword] = useState('')
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchTweets = async () => {
    if (!keyword.trim()) {
      setError('Please enter a keyword')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/search-tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: keyword.trim() })
      })

      if (!response.ok) {
        throw new Error('Failed to search tweets')
      }

      const data = await response.json()
      setTweets(data.tweets)
    } catch (err) {
      setError('Failed to search tweets. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>🐦 Twitter Brand Monitor</h1>
      
      <div className="search-section">
        <input
          type="text"
          placeholder="Enter keyword to search..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              searchTweets()
            }
          }}
        />
        <button onClick={searchTweets} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {tweets.length > 0 && (
        <table className="tweets-table">
          <thead>
            <tr>
              <th>Twitter URL</th>
              <th>Tweet Text</th>
            </tr>
          </thead>
          <tbody>
            {tweets.map(tweet => (
              <tr key={tweet.id}>
                <td>
                  <a href={tweet.url} target="_blank" rel="noopener noreferrer">
                    View Tweet
                  </a>
                </td>
                <td>{tweet.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tweets.length === 0 && !loading && !error && (
        <p className="no-tweets">Enter a keyword above to search for tweets</p>
      )}
    </div>
  )
}

export default App