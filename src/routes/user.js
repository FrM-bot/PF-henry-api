import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
const prisma = new PrismaClient()

const router = Router()

router.post('/signin', async (req, res) => {
  const { email, password, name, lastname, username } = req.body
  if (!email || !password || !name || !lastname || !username) {
    res.status(404).json({ msg: 'Required info is never sent' })
  }
  const hashedPass = await bcrypt.hash(password, 10)
  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        username,
        lastname,
        password: hashedPass,
        profilepic: 'www.sdhgfdoug.com/odshnfgd',
        accounts: {
          create: { cvu: '56789312hn21', currenciesIDs: 'we' }
        }
      },
      include: {
        accounts: true
      }
    })
    if (newUser) {
      res.status(200).json(newUser)
    }
  } catch (error) {
    console.log(error)
    res.status(404).json({ msg: 'An error ocurred', error })
  }
})

router.get('/', async (req, res) => {
  const names = ['Franco Maciel']
  res.status(200).send(names)
})

router.get('/u', async (req, res) => {
  const data = await prisma.user.findMany({})
  res.json(data)
})

router.post('/addUser', async (req, res) => {
  const user = req.body
  const data = await prisma.user.create({
    data: {
      username: user.username
    }
  })
  res.status(201).json(data)
})

export default router
