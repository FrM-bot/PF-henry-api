import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const router = Router()

router.get('/', async (req, res) => {
  const { id } = req.body
  try {
    const favourites = await prisma.user.findUnique({
      where: {
        id
      },
      select: {
        Fav: true
      }
    })
    res.json(favourites)
  } catch (error) {
    console.log(error)
  }
})

router.post('/find', async (req, res) => {
  const { id, friendID } = req.body
  try {
    const findUser = await prisma.fav.create({
      data: {
        friendID,
        User: {
          connect: {
            id
          }
        }
      }
    })
    res.json(findUser)
  } catch (error) {
    console.error(error)
  }
})

router.delete('/delete', async (req, res) => {
  const { id } = req.body
  const removeFav = await prisma.fav.delete({
    where: {
      id
    }
  })
  res.json({ removeFav, msg: 'Favorite deleted' })
})

export default router
