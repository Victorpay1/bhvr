import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { ApiResponse } from 'shared/dist'

const app = new Hono()

app.use(cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/hello', async (c) => {

  const data: ApiResponse = {
    message: "Hello BHVR!",
    success: true
  }

  return c.json(data, { status: 200 })
})

app.post('/api/search-tweets', async (c) => {
  try {
    const { keyword, dateFilter } = await c.req.json()
    
    if (!keyword) {
      return c.json({ error: 'Keyword is required' }, 400)
    }

    const apiToken = process.env.APIFY_API_TOKEN
    
    if (!apiToken) {
      return c.json({ error: 'API token not configured' }, 500)
    }

    // Calculate date filter
    let startDate = null
    if (dateFilter && dateFilter !== 'all') {
      const today = new Date()
      if (dateFilter === '7days') {
        startDate = new Date(today.setDate(today.getDate() - 7))
      } else if (dateFilter === '2weeks') {
        startDate = new Date(today.setDate(today.getDate() - 14))
      } else if (dateFilter === '3weeks') {
        startDate = new Date(today.setDate(today.getDate() - 21))
      }
    }

    // Build request body
    const requestBody: any = {
      searchTerms: [keyword],
      sort: 'Latest',
      maxItems: 50,
      onlyVerifiedUsers: false,
      onlyTwitterBlue: false
    }

    // Add date filter if specified
    if (startDate) {
      requestBody.start = startDate.toISOString().split('T')[0] // Format: YYYY-MM-DD
    }
    
    // Run Apify Twitter scraper
    const runResponse = await fetch('https://api.apify.com/v2/acts/apidojo~tweet-scraper/runs?token=' + apiToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!runResponse.ok) {
      throw new Error('Failed to start Twitter search')
    }

    const runData = await runResponse.json() as any
    const runId = runData.data.id

    // Wait for the run to complete (with timeout)
    let attempts = 0
    const maxAttempts = 30 // 30 seconds timeout
    let status = 'RUNNING'

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      
      const statusResponse = await fetch(`https://api.apify.com/v2/acts/apidojo~tweet-scraper/runs/${runId}?token=${apiToken}`)
      const statusData = await statusResponse.json() as any
      status = statusData.data.status
      attempts++
    }

    if (status !== 'SUCCEEDED') {
      throw new Error('Twitter search timed out or failed')
    }

    // Get the results
    const datasetId = runData.data.defaultDatasetId
    const resultsResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiToken}&limit=50`)
    const results = await resultsResponse.json() as any[]

    // Format and filter the tweets
    const tweets = results
      .map((item: any) => ({
        id: item.id || item.url,
        url: item.url,
        text: item.text || item.full_text || '',
        author: item.author?.name || item.author?.username || 'Unknown',
        createdAt: item.createdAt || item.created_at || ''
      }))
      .filter((tweet) => {
        // Only include tweets that actually contain the search keyword
        const tweetText = tweet.text.toLowerCase()
        const searchKeyword = keyword.toLowerCase()
        return tweetText.includes(searchKeyword)
      })

    return c.json({ tweets })
  } catch (error) {
    console.error('Error searching tweets:', error)
    return c.json({ error: 'Failed to search tweets' }, 500)
  }
})

export default app