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
        include: {
          accounts: {
            include: {
              currencies: true
            }
          }
        }
      })
    }))
    res.json(newFavourites)
  } catch (error) {
    console.log(error)
  }
})

router.post('/createFavourites', async (req, res) => {
  const { id, cvu, username } = req.body
  const validateUsername = Number(username)
  if (cvu && !isNaN(validateUsername)) {
    try {
      const favAcc = await prisma.account.findUnique({
        where: {
          cvu
        },
        include: {
          users: true
        }
      })
      if (!favAcc) return res.status(400).json({ msg: "The fav u want to add doesn't exist" })
      const favAlready = await prisma.fav.findMany({
        where: {
          friendID: favAcc.usersIDs
        }
      })
      if (favAlready.length > 0) return res.status(400).json({ msg: 'Fav already created' })
      const findUser = await prisma.fav.create({
        data: {
          friendID: favAcc.usersIDs,
          User: {
            connect: {
              id
            }
          }
        }
      })
      const userFavs = await prisma.user.findUnique({
        where: {
          id
        },
        select: {
          Fav: true
        }
      })
      const newFavourites = await Promise.all(userFavs.Fav.map(async (favourite) => {
        return await prisma.user.findUnique({
          where: { id: favourite.friendID },
          include: { accounts: true }
        })
      }))
      res.status(200).json(newFavourites)
    } catch (error) {
      console.error(error)
    }
  }
  if (isNaN(validateUsername)) {
    try {
      const fav = await prisma.user.findUnique({
        where: {
          username
        }
      })
      if (!fav) return res.status(400).json({ msg: "the user u want to add doesn't exist" })
      const favArleady = await prisma.user.findUnique({
        where: {
          id
        },
        include: {
          Fav: true
        }
      })
      const same = favArleady.Fav.some(e => {
        return e.friendID === fav.id
      })
      if (same) return res.status(400).json({ msg: 'Fav already created' })
      const newFav = await prisma.fav.create({
        data: {
          friendID: fav.id,
          User: {
            connect: {
              id
            }
          }
        }
      })
      const userFavs = await prisma.user.findUnique({
        where: {
          id
        },
        select: {
          Fav: true
        }
      })
      const newFavourites = await Promise.all(userFavs.Fav.map(async (favourite) => {
        return await prisma.user.findUnique({
          where: { id: favourite.friendID },
          include: { accounts: true }
        })
      }))
      res.status(200).json(newFavourites)
    } catch (error) {
      console.log(error)
      res.status(404).json({ msg: error })
    }
  }
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  console.log(id)
  try {
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
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: "Can't delete" })
  }
})

export default router
