import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const router = Router()

router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const favourites = await prisma.user.findUnique({
      where: {
        id
      },
      select: {
        Fav: true

      }
    })
    const newFavourites = await Promise.all(favourites.Fav.map(async (favourite) => {
      return await prisma.user.findUnique({
        where: { id: favourite.friendID },
        include: { accounts: true }
      })
    }))
    res.json(newFavourites)
  } catch (error) {
    console.log(error)
  }
})

router.post('/createFavourites', async (req, res) => {
  const { id, friendID } = req.body
  try {
    const existUser = await prisma.user.findUnique({
      where: {
        id: friendID
      }
    })
    if (!existUser) return res.status(404).json({ msg: "The user you want to add doesn't exist" })
    const favAlready = await prisma.fav.findMany({
      where: {
        friendID
      }
    })
    console.log(favAlready)
    if (favAlready.length > 0) return res.status(400).json({ msg: 'Fav already created' })
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
  console.log('elid', id)
  const favInfo = await prisma.fav.findMany({
    where: {
      friendID: id
    }
  })
  const removeFav = await prisma.fav.delete({
    where: {
      id: favInfo[0].id
    }
  })
  res.json({ removeFav, msg: 'Favorite deleted' })
})

router.delete('/xd', async (req, res) => {
  const { favId } = req.body
  try {
    const deleteFav = await prisma.fav.delete({
      where: {
        id: favId
      }
    })
    res.json(deleteFav)
  } catch (error) {
    console.log(error)
  }
})

export default router
