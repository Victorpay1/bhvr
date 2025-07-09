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
    const { keyword } = await c.req.json()
    
    if (!keyword) {
      return c.json({ error: 'Keyword is required' }, 400)
    }

    const apiToken = process.env.APIFY_API_TOKEN
    
    if (!apiToken) {
      return c.json({ error: 'API token not configured' }, 500)
    }
    
    // Run Apify Twitter scraper
    const runResponse = await fetch('https://api.apify.com/v2/acts/apidojo~tweet-scraper/runs?token=' + apiToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchTerms: [keyword],
        sort: 'Latest',
        maxItems: 50,
        onlyVerifiedUsers: false,
        onlyTwitterBlue: false
      })
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

    // Format the tweets
    const tweets = results.map((item: any) => ({
      id: item.id || item.url,
      url: item.url,
      text: item.text || item.full_text || '',
      author: item.author?.name || item.author?.username || 'Unknown',
      createdAt: item.createdAt || item.created_at || ''
    }))

    return c.json({ tweets })
  } catch (error) {
    console.error('Error searching tweets:', error)
    return c.json({ error: 'Failed to search tweets' }, 500)
  }
})

export default app