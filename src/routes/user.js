import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userExtractor from '../middlewares/userExtractor.js'
import { upload, destroy, uploadProfilepic } from '../cloudinaryUpload.js'
import fs from 'fs/promises'
import { v2 as cloudinary } from 'cloudinary'
// import { transporter } from '../config/mailer.js'

const prisma = new PrismaClient()
const router = Router()

const isAdmin = async (id) => {
  const user = await prisma.user.findUnique({
    where: {
      id
    }
  })
  return user.isAdmin
}
const arraySuperUsers = process.env.SUPER_USERS?.split('||')

// importante hashear la password antes de user esta funcion
const createUser = async ({ email, password, name, lastname, DNI, username, profilepic, googleID }) => {
  const cvuPart = `${Math.floor(Math.random() * 10000000000000)}`
  const cvu = DNI + cvuPart
  const DEFAULT_PIC = 'data:image/jpeg;base64,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'
  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        username,
        dni: DNI,
        lastname,
        password,
        profilepic: profilepic || DEFAULT_PIC,
        googleID,
        isAdmin: arraySuperUsers.includes(email),
        accounts: {
          create: {
            cvu,
            currencies: {
              connectOrCreate: {
                where: {
                  name: 'Pesos'
                },
                create: {
                  name: 'Pesos'
                }
              }
            }
          }
        }
      },
      include: {
        accounts: true
      }
    })
    return newUser
  } catch (error) {
    throw new Error(error)
  }
}
const SignInController = async (req, res) => {
  const { id } = req.body
  try {
    const userValidate = await prisma.newUser.findUnique({
      where: {
        id
      }
    })

    const newUser = await createUser({
      email: userValidate.email,
      DNI: userValidate.dni,
      googleID: userValidate.googleID,
      lastname: userValidate.lastname,
      name: userValidate.name,
      password: userValidate.password,
      profilepic: userValidate.profilepic,
      username: userValidate.username
    })
    await prisma.newUser.delete({
      where: {
        id: userValidate.id
      }
    })
    await destroy(userValidate.publicID)
    await destroy(userValidate.publicIDRev)

    res.status(200).json({ message: `User ${newUser.username} is acepted` })
  } catch (error) {
    res.json({ error })
  }
}

const passAdmin = async (req, res, next) => {
  const id = req.userToken
  try {
    if (!isAdmin(id)) {
      res.status(401).json({ error: 'Not authorized' })
    }
    next()
  } catch (error) {
    res.send({ error })
  }
}
router.post('/acept', userExtractor, passAdmin, SignInController)

router.delete('/reject', userExtractor, passAdmin, async (req, res) => {
  const { id } = req.body
  try {
    const userValidate = await prisma.newUser.findUnique({
      where: {
        id
      }
    })
    await prisma.newUser.delete({
      where: {
        id: userValidate.id
      }
    })
    await destroy(userValidate.publicID)
    await destroy(userValidate.publicIDRev)
    res.status(200).json({ message: `User ${userValidate.username} is rejected` })
  } catch (error) {
    res.status(200).send({ error })
  }
})

async function removeImagesToLocal (filesPaths) {
  try {
    for (const path of filesPaths) {
      await fs.unlink(path)
    }
  } catch (error) {
    console.error(error)
  }
}

const existDataInBD = async (data, prop, dbName) => {
  try {
    const dataInDB = await prisma[dbName].findUnique({
      where: {
        [prop]: data
      },
      select: {
        [prop]: true
      }
    })
    return dataInDB || false
  } catch (error) {
    console.error(error)
  }
}

router.post('/new', async (req, res) => {
  const { email, password, name, lastname, DNI, profilepic, googleID, username } = req.body

  for (const property in req?.body) {
    if (property === 'profilepic' || property === 'googleID') {
      continue
    }
    if (!req?.body[property]) {
      await removeImagesToLocal([req?.files?.imageTwo?.tempFilePath, req?.files?.imagesOne?.tempFilePath])
      return res.status(404).json({ msg: `Required info is never sent: ${property}` })
    }
  }

  try {
    let existUserEmail = await existDataInBD(email, 'email', 'user')

    if (existUserEmail) {
      await removeImagesToLocal([req?.files?.imageTwo?.tempFilePath, req?.files?.imagesOne?.tempFilePath])
      return res.status(406).send({ message: `The email ${existUserEmail.email} is already register.` })
    }

    let existUserUsername = await existDataInBD(username, 'username', 'user')

    if (existUserUsername) {
      await removeImagesToLocal([req?.files?.imageTwo?.tempFilePath, req?.files?.imagesOne?.tempFilePath])
      return res.status(406).send({ message: `The user ${existUserUsername.username} is already register.` })
    }

    existUserEmail = await existDataInBD(email, 'email', 'newUser')

    if (existUserEmail) {
      await removeImagesToLocal([req?.files?.imageTwo?.tempFilePath, req?.files?.imagesOne?.tempFilePath])
      return res.status(406).send({ message: `The email ${existUserEmail.email} is already register.` })
    }

    existUserUsername = await existDataInBD(username, 'username', 'newUser')

    if (existUserUsername) {
      await removeImagesToLocal([req?.files?.imageTwo?.tempFilePath, req?.files?.imagesOne?.tempFilePath])
      return res.status(406).send({ message: `The user ${existUserUsername.username} is already register.` })
    }

    if (arraySuperUsers.includes(email)) {
      await removeImagesToLocal([req?.files?.imageTwo?.tempFilePath, req?.files?.imagesOne?.tempFilePath])
      const hashedPass = await bcrypt.hash(password, 10)
      const newAdmin = await createUser({ email, DNI, googleID, lastname, name, password: hashedPass, profilepic, username })
      return res.status(200).json(newAdmin)
    }

    if (Object.values(req?.files).length !== 2) {
      await removeImagesToLocal([req?.files?.imageTwo?.tempFilePath, req?.files?.imagesOne?.tempFilePath])

      return res.json({ error: 'Images of DNI is never sent' })
    }
    const { public_id: publicID, secure_url: imgURL } = await upload(req?.files?.imagesOne?.tempFilePath)
    const { public_id: publicIDRev, secure_url: imgURLRev } = await upload(req?.files?.imageTwo?.tempFilePath)

    await removeImagesToLocal([req?.files?.imageTwo?.tempFilePath, req?.files?.imagesOne?.tempFilePath])

    const hashedPass = await bcrypt.hash(password, 10)

    const newUser = await prisma.newUser.create({
      data: {
        email,
        password: hashedPass,
        name,
        lastname,
        dni: DNI,
        username,
        profilepic,
        googleID,
        imgURL,
        publicID,
        imgURLRev,
        publicIDRev
      }
    })

    res.status(201).json(newUser)
  } catch (error) {
    await removeImagesToLocal([req?.files?.imageTwo?.tempFilePath, req?.files?.imagesOne?.tempFilePath])
    console.error(error)
    res.status(404).json({ msg: 'An error ocurred', error })
  }
})

router.get('/newUsers', userExtractor, passAdmin, async (req, res) => {
  try {
    const newUsers = await prisma.newUser.findMany({})
    res.status(200).json(newUsers)
  } catch (error) {
    res.send({ error })
  }
})

router.get('/', userExtractor, async (req, res) => {
  const id = req.userToken
  try {
    const data = await prisma.user.findUnique({
      where: {
        id
      },
      include: {
        accounts: {
          include: {
            movements: {
              include: {
                accounts: {
                  include: {
                    currencies: true,
                    users: true,
                    movements: true
                  }
                },
                categories: true,
                operations: true
              },
              orderBy: {
                date: 'desc'
              }
            }
          }
        },
        Fav: true
      }
    })
    res.json(data)
  } catch (error) {
    res.status(404).json(error)
  }
})

router.get('/users', async (req, res) => {
  const { id } = req.body
  try {
    const data = await prisma.user.findUnique({
      where: {
        id
      }
    })
    res.json(data)
  } catch (error) {
    res.status(404).json(error)
  }
})

router.post('/login', async (req, res) => {
  const { email, password, googleID } = req.body

  let user = {}

  const TOKENT_EXPIRED = 60
  try {
    if (googleID) {
      user = await prisma.user.findUnique({
        where: {
          googleID
        }
      })

      if (user.isBan) {
        return res.send({ message: 'You were banned from the platform.' }).status(401)
      }

      const dataForToken = {
        userID: user.id
      }

      const token = jwt.sign(dataForToken, process.env.JWT, {
        expiresIn: 60 * TOKENT_EXPIRED
      })
      if (user.isAdmin) {
        return res.status(200).send({ token, isAdmin: user.isAdmin })
      }

      return res.status(200).send({ token })
    }

    user = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (!user) {
      return res.status(404).send({ error: 'User not found' })
    }

    if (user.isBan) {
      return res.send({ message: 'You were banned from the platform.' }).status(401)
    }

    const passwordIs = user ? (await bcrypt.compare(password, user.password)) : (false)

    if (!(passwordIs && user)) {
      return res.status(406).send({ error: 'Email or password are incorrect' })
    }

    const dataForToken = {
      userID: user.id
    }

    const token = jwt.sign(dataForToken, process.env.JWT, {
      expiresIn: 60 * TOKENT_EXPIRED
    })

    if (user.isAdmin) {
      return res.status(200).send({ token, isAdmin: user.isAdmin })
    }

    res.status(200).send({ token })
  } catch (error) {
    res.status(401).json({ error })
  }
})

router.post('/ban', userExtractor, passAdmin, async (req, res) => {
  const { id, isBan } = req.body
  try {
    const userBanned = await prisma.user.update({
      where: {
        id
      },
      data: {
        isBan
      },
      select: {
        email: true,
        dni: true,
        id: true,
        profilepic: true,
        name: true,
        lastname: true,
        isBan: true,
        username: true
      }
    })
    res.send(userBanned)
  } catch (error) {
    res.send({ error })
  }
})
router.put('/useredit', userExtractor, async (req, res) => {
  const { username, profilepic, password } = req.body
  const id = req.userToken
  let hashedPass = ''
  // const passwordIs = id ? (await bcrypt.compare(password, id.password)) : (false)
  if (password) {
    hashedPass = await bcrypt.hash(password, 10)
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        id
      }
    })
    const data = await prisma.user.update({
      where: {
        id
      },
      data: {
        username: username || user.username,
        password: hashedPass || user.password,
        profilepic: profilepic || user.profilepic
      }
    })
    res.json(data)
  } catch (error) {
    res.status(401).json(error)
  }
})

router.put('/updateProfilepic', userExtractor, async (req, res) => {
  const { profilepicID: profilepicIDToRemove } = req.body
  const id = req.userToken

  try {
    if (profilepicIDToRemove) {
      await destroy(profilepicIDToRemove)
    }
    const { public_id: profilepicID, secure_url: profilepic } = await uploadProfilepic(req?.files?.newProfilepic?.tempFilePath)
    await removeImagesToLocal([req?.files?.newProfilepic?.tempFilePath])
    const newData = await prisma.user.update({
      where: {
        id
      },
      data: {
        profilepic,
        profilepicID
      }
    })
    res.send(newData)
  } catch (error) {
    await removeImagesToLocal([req?.files?.newProfilepic?.tempFilePath])
    console.error(error)
  }
})

router.post('/search', userExtractor, passAdmin, async (req, res) => {
  const { username } = req.body

  try {
    const user = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: username
            }
          },
          {
            email: {
              contains: username
            }
          }
        ]
      },
      select: {
        email: true,
        dni: true,
        id: true,
        profilepic: true,
        name: true,
        lastname: true,
        isBan: true,
        username: true
      }
    })

    res.json(user)
  } catch (error) {
    res.send({ error })
  }
})

router.put('/reset-password', async (req, res) => {
  const { email, password } = req.body
  const hashedPass = await bcrypt.hash(password, 10)
  try {
    const user = await prisma.user.update({
      where: {
        email
      },
      data: {
        password: hashedPass
      }
    })
    res.json(user)
  } catch (err) { console.error(err) }
})

// router.post('/sendReset', async (req, res) => {
//   const { email } = req.body
//   const user = await prisma.user.findUnique({
//     where: {
//       email
//     }
//   })
//   if (!user) {
//     res.status(404).send({ msg: 'not found user' })
//   } else {
//     await transporter.sendMail({
//       from: 'wallet.pfhenry@outlook.com', // sender address
//       to: `${email}`, // list of receivers
//       subject: 'Reset password', // Subject line
//       html: `<h2> Click to the link:  http://localhost:3000/reset/${email} for reset the password.</h2>`
//     })
//     res.status(200).send({ msg: 'success' })
//   }
// })

export default router
