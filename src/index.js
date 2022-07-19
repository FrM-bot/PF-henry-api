import dotenv from 'dotenv'

import express from 'express'

import { PrismaClient } from '@prisma/client'

import cors from 'cors'

dotenv.config()

const prisma = new PrismaClient()

const app = express()

app.use(express.json())

app.use(cors())

console.log(process.env.NODE_ENV)

app.get('/', async (req, res) => {
  const names = ['Franco Maciel']
  res.status(200).send(names)
})

app.get('/u', async (req, res) => {
  const data = await prisma.user.findMany({})
  res.json(data)
})

app.get('/b', async (req, res) => {
  const data = await prisma.bank.findMany({})
  res.json(data)
})

//francomei

app.post('/addBank', async (req, res) => {
  const bank = req.body
  const data = await prisma.bank.create({
    data: {
      name: bank.name
    }
  })
  res.status(201).json(data)
})

app.post('/addUser', async (req, res) => {
  const user = req.body
  const data = await prisma.user.create({
    data: {
      username: user.username
    }
  })
  res.status(201).json(data)
})

app.post('/subscribe', async (req, res) => {
  const user = req.body
  const data = await prisma.user.update({
    where: {
      id: user.userID
    },
    data: {
      banks: {
        connect: {
          id: user.bankID
        }
      }
    }
  })
  res.status(201).json(data)
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})
