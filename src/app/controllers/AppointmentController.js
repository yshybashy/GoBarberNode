import * as Yup from 'yup';
import User from '../models/User';
import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import File from '../models/File';
import Notification from '../schemas/notification';


class AppointmentController {
  async index(req, res){
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({ //listar todos os horarios agendados
      where: { user_id: req.userId, canceled_at: null},
      order: ['date'],
      attributes: ['id', 'date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          limit: 20,
          offset: (page - 1) * 20,
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if(!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails'});
    }

    const { provider_id, date } = req.body;

    /**
     * Check is provider_id is a provider
     */

     const CheckIsProvider = await User.findOne({
       where: { id: provider_id, provider: true },
     });

     if(!CheckIsProvider) {
       return res
       .status(401)
       .json({ error: 'You can only create appointments with providers'});
     }

     const hourStart = startOfHour(parseISO(date));
     console.log(hourStart);

     if (isBefore(hourStart, new Date())){ //verifica se a data ja esta no passado
       return res.status(400).json({ error: 'Past dates are not permitted'});
     }

     const checkAvailability = await Appointment.findOne({
       where: {
         provider_id,
         canceled_at: null,
         date: hourStart,
       },
     });

     if(checkAvailability){
       return res.status(400).json({
         error: 'Appointment date is not available'
       });
     }

     const appointment = await Appointment.create({
       user_id: req.userId,
       provider_id,
       date,
     });

     // notificar prestador de serviços
     const user = await User.findByPk(req.userId);
     const formattedDate = format(
       hourStart,
       "'dia' dd 'de' MMMM', às' H:mm'h'",
       { locale: pt }
     );

     await Notification.create({
       content: `Novo agendamento de ${user.name} para ${formattedDate}`,
       user: provider_id,
     });

     return res.json(appointment);
  }
}

export default new AppointmentController();