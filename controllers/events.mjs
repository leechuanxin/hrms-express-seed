import * as globals from '../globals.mjs';
import * as util from '../utils.mjs';

// db is an argument to this function so
// that we can make db queries inside
export default function initEventsController(db) {
  const showWorkerEventsByMonth = async (request, response) => {
    const firstOfMonthDate = new Date(`${request.params.year}-${Number(request.params.month) + 1}-1`);

    const firstOfNextMonthDate = util.getMonthDate(firstOfMonthDate, 'next');
    const firstOfMonthString = util.getMonthString(firstOfMonthDate);
    try {
      let newObj = {};
      const user = await db.User.findOne({
        where: {
          [db.Sequelize.Op.and]: [
            { id: request.params.workerId },
            { role: 'worker' },
          ],
        },
      });

      if (!user) {
        // we didnt find a user with that email.
        // the error for password and user are the same.
        // don't tell the user which error they got for security reasons,
        // otherwise people can guess if a person is a user of a given service.
        throw new Error(globals.WORKER_NOT_FOUND);
      }

      const prevMonth = (request.params.month === 0) ? 11 : request.params.month - 1;

      newObj = {
        ...user.dataValues,
        userId: user.id,
        token: util.getHash(user.id),
        month: Number(request.params.month),
        prev_month: prevMonth,
        year: Number(request.params.year),
      };

      delete newObj.password;
      delete newObj.id;
      delete newObj.createdAt;
      delete newObj.updatedAt;
      delete newObj.wage;

      let events = await db.Event.findAll({
        where: {
          [db.Sequelize.Op.and]: [
            { userId: user.id },
            {
              dateAt: {
                [db.Sequelize.Op.and]: [
                  { [db.Sequelize.Op.gte]: firstOfMonthDate },
                  { [db.Sequelize.Op.lt]: firstOfNextMonthDate },
                ],
              },
            },
          ],
        },
      });

      events = events.map((event) => {
        let monthNumberStr = `${Number(request.params.month) + 1}`;
        let dateNumberStr = `${(new Date(event.dataValues.dateAt)).getDate()}`;

        if (monthNumberStr < 2) {
          monthNumberStr = `0${monthNumberStr}`;
        }

        if (dateNumberStr.length < 2) {
          dateNumberStr = `0${dateNumberStr}`;
        }

        const combinedDateStr = `${request.params.year}-${monthNumberStr}-${dateNumberStr}`;

        const eventObj = {
          ...event.dataValues,
          title: event.dataValues.type.charAt(0).toUpperCase()
            + event.dataValues.type.substring(1),
          date: combinedDateStr,
          extendedProps: {
            id: event.dataValues.id,
            userId: newObj.userId,
            realName: newObj.realName,
            type: event.dataValues.type,
            title: event.dataValues.type.charAt(0).toUpperCase()
              + event.dataValues.type.substring(1),
            date: combinedDateStr,
          },
        };
        return {
          ...eventObj,
        };
      });

      const shiftDates = events.filter((event) => (event.type === 'shift'));
      const leaveDates = events.filter((event) => (event.type === 'leave'));

      const successMessage = `Successful retrieval of worker ID ${request.params.workerId}'s preferred schedule on ${firstOfMonthString} ${request.params.year}!`;
      response.send({
        message: successMessage,
        ...newObj,
        shiftDates,
        leaveDates,
      });
    } catch (error) {
      const errorMessage = error.message;

      const resObj = {
        error: errorMessage,
        message: errorMessage,
        ...request.params,
      };
      response.send(resObj);
    }
  };

  // return all methods we define in an object
  // refer to the routes file above to see this used
  return {
    showWorkerEventsByMonth,
  };
}
