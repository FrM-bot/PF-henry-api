import { Router } from 'express'
import axios from 'axios'

const router = Router()

router.get('/', async (req, res) => {
  try {
    // fetch de cryptos
    const getData = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false')
    const data = getData.data
    res.json(data)
  } catch (error) {
    console.error(error)
  }
})

export default router
