import { Router} from 'express';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


const router = Router();

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

export default router; 