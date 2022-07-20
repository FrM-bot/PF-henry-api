import { Router } from 'express'
import userRoute from './user.js' // esta es la manera de importar rutas de cada archivo accountRoute, typeRoute, etc
import categoryRoute from './category.js'
import typesRoute from './type.js'
import cryptsRoute from './crypts.js'

const router = Router()

router.use('/user', userRoute) // esta es la forma de usar rutas de cada archivo
router.use('/category', categoryRoute)
router.use('/types', typesRoute)// esta es la forma de usar rutas de cada archivo
router.use('/crypts', cryptsRoute)// esta es la forma de usar rutas de cada archivo

// OJO: aqui van las otras rutas para cada tabla

export default router
