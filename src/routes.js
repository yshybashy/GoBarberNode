import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';


import userController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';


import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', userController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware); 
routes.put('/users', userController.update);

routes.get('/providers', ProviderController.index);

routes.get('/appointments', AppointmentController.index);
routes.post('/appointments', AppointmentController.store);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotificationController.index);

routes.post('/files', upload.single('file'), FileController.store);


// routes.get('/', async (req, res) => {
//   const user = await User.create({
//     name: 'Daniel',
//     email: 'daniel@gmail.com',
//     password_hash: '123412154566513254',
//   });

//   return res.json(user);
// });

export default routes;