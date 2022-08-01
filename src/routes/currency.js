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
    console.error('fallo perrito')
  }
})

router.get('/:idCrypto', async (req, res) => {
  try {
    const id = req.params.idCrypto
    const getDetailsCrypto = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`)
    const getDateCrypto = await axios.get(`http://localhost:4000/api/currency/cryptodate/${id}`)

    const data = getDetailsCrypto.data
    const data2 = getDateCrypto.data

    res.json({ data, data2 })
  } catch (error) {
    console.error('fallo perrito')
  }
})

router.get('/dolarblue', async (req, res) => {
  try {
    const getCurrData = await axios.get('https://api-dolar-argentina.herokuapp.com/api/dolarblue')
    const data = await getCurrData.data
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

router.get('/cryptodate/:idCrypto', async (req, res) => {
  try {
    const id = req.params.idCrypto
    const getDateJanuary = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/history?date=26-1-2022`)
    const getDatefebruary = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/history?date=26-2-2022`)
    const getDateMarch = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/history?date=26-3-2022`)
    const getDateApril = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/history?date=26-4-2022`)
    const getDateMay = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/history?date=26-5-2022`)
    const getDateJune = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/history?date=26-6-2022`)
    const getDateJuly = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/history?date=26-7-2022`)
    const data = getDateJanuary.data.market_data.current_price.usd
    const data1 = getDatefebruary.data.market_data.current_price.usd
    const data2 = getDateMarch.data.market_data.current_price.usd
    const data3 = getDateApril.data.market_data.current_price.usd
    const data4 = getDateMay.data.market_data.current_price.usd
    const data5 = getDateJune.data.market_data.current_price.usd
    const data6 = getDateJuly.data.market_data.current_price.usd

    res.json({ data, data1, data2, data3, data4, data5, data6 })
  } catch (error) {
    console.error(error)
  }
})

export default router
