import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const router = Router()

router.get('/', async (req, res) => {
  const user = req.body
  try {
    const data = await prisma.user.findMany({
      where: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastname: user.lastname,
        password: user.password,
        username: user.username,
        dni: user.dni,
        profilepic: user.profilepic,
        Validate: prisma.Validate,
        favouritesIDs: user.favouritesIDs,
        accountsIDs: user.accountsIDs,
        accounts: user.accounts,
        favourites: user.favourites
      }
    })
    res.json(data)
  } catch (error) {
    console.log(error)
  }
})

export default router
