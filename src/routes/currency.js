import { Router } from 'express'
import axios from 'axios'

const router = Router()

router.get('/crypto', async (req, res) => {
  try {
    const getCryptoData = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false')
    const data = getCryptoData.data
    const crypts = data.map((crypt) => {
      return {
        id: crypt.id,
        name: crypt.name,
        image: crypt.image,
        symbol: crypt.symbol,
        marketCap: crypt.market_cap,
        ranking: crypt.market_cap_rank,
        currentPrice: crypt.current_price,
        dailyRateChange: crypt.price_change_percentage_24h
      }
    })
    res.json(crypts)
  } catch (error) {
    console.error(error)
  }
})

router.get('/:idCrypto', async (req, res) => {
  try {
    const id = req.params.idCrypto
    const getDetailsCrypto = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`)
    const data = getDetailsCrypto.data
    res.json(data)
  } catch (error) {
    console.error(error)
  }
})

router.get('/dolarblue', async (req, res) => {
  try {
    const getCurrData = await axios.get('https://api-dolar-argentina.herokuapp.com/api/dolarblue')
    const data = getCurrData.data
    const dolarBlue = {
      name: 'Dolar Blue',
      date: data.fecha,
      purchaseRate: data.venta,
      saleRate: data.compra
    }
    res.json(dolarBlue)
  } catch (error) {
    console.error(error)
  }
})

router.get('/riesgopais', async (req, res) => {
  try {
    const getRiskData = await axios.get('https://api-dolar-argentina.herokuapp.com/api/riesgopais')
    const data = getRiskData.data
    const CountryRisk = {
      date: data.fecha,
      value: data.valor
    }
    res.json(CountryRisk)
  } catch (error) {
    console.error(error)
  }
})

export default router
