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
  const [dateFilter, setDateFilter] = useState('all')
  const [loadingMessage, setLoadingMessage] = useState('Searching Twitter...')

  const searchTweets = async () => {
    if (!keyword.trim()) {
      setError('Please enter a keyword')
      return
    }

    setLoading(true)
    setError('')
    setLoadingMessage('Searching Twitter...')
    
    // Update loading messages
    const messageTimer = setInterval(() => {
      setLoadingMessage(prev => {
        if (prev === 'Searching Twitter...') return 'Gathering tweets...'
        if (prev === 'Gathering tweets...') return 'Almost done...'
        return prev
      })
    }, 2000)
    
    try {
      const response = await fetch('/api/search-tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: keyword.trim(), dateFilter })
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
      clearInterval(messageTimer)
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>🐦 Twitter Brand Monitor</h1>
      
      <div className="filter-section">
        <select 
          value={dateFilter} 
          onChange={(e) => setDateFilter(e.target.value)}
          className="date-filter"
        >
          <option value="all">All time</option>
          <option value="7days">Last 7 days</option>
          <option value="2weeks">Last 2 weeks</option>
          <option value="3weeks">Last 3 weeks</option>
        </select>
      </div>

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
          {loading ? (
            <span className="loading-button">
              <span className="spinner"></span>
              Searching...
            </span>
          ) : 'Search'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">{loadingMessage}</p>
          </div>
        </div>
      )}

      {tweets.length > 0 && !loading && (
        <table className="tweets-table">
          <thead>
            <tr>
              <th>Twitter URL</th>
              <th>Tweet Text</th>
              <th>Posted On</th>
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
                <td>{new Date(tweet.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}</td>
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