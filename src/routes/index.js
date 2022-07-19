import { Router } from 'express';
import userRoute from './user.js'; // esta es la manera de importar rutas de cada archivo accountRoute, typeRoute, etc


const router = Router();


router.use('/user', userRoute); // esta es la forma de usar rutas de cada archivo

// OJO: aqui van las otras rutas para cada tabla


export default router;