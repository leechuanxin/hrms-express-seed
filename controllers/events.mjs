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

  const showAdminEventsByMonth = async (request, response) => {
    const firstOfMonthDate = new Date(`${request.params.year}-${Number(request.params.month) + 1}-1`);

    const firstOfNextMonthDate = util.getMonthDate(firstOfMonthDate, 'next');
    const firstOfMonthString = util.getMonthString(firstOfMonthDate);
    try {
      let newObj = {};
      const user = await db.User.findOne({
        where: {
          [db.Sequelize.Op.and]: [
            { id: request.params.adminId },
            { role: 'admin' },
          ],
        },
      });

      if (!user) {
        // we didnt find a user with that email.
        // the error for password and user are the same.
        // don't tell the user which error they got for security reasons,
        // otherwise people can guess if a person is a user of a given service.
        throw new Error(globals.ADMIN_NOT_FOUND);
      }

      let workers = await db.User.findAll({
        where: {
          [db.Sequelize.Op.and]: [
            { organisationId: user.organisationId },
            { role: 'worker' },
          ],
        },
      });

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
          dateAt: {
            [db.Sequelize.Op.and]: [
              { [db.Sequelize.Op.gte]: firstOfMonthDate },
              { [db.Sequelize.Op.lt]: firstOfNextMonthDate },
            ],
          },
        },
      });

      events = await Promise.all(
        events.map(async (event) => {
          const eventUser = await event.getUser();
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
            title: `${eventUser.dataValues.realName}'s ${event.dataValues.type.charAt(0).toUpperCase()}${event.dataValues.type.substring(1)}`,
            date: combinedDateStr,
            extendedProps: {
              id: event.dataValues.id,
              userId: eventUser.dataValues.id,
              realName: eventUser.dataValues.realName,
              type: event.dataValues.type,
              title: `${eventUser.dataValues.realName}'s ${event.dataValues.type.charAt(0).toUpperCase()}${event.dataValues.type.substring(1)}`,
              date: combinedDateStr,
            },
          };
          return {
            ...eventObj,
          };
        }),
      );

      workers = workers.map((worker) => {
        let workerObj = {
          ...worker.dataValues,
        };

        const monthsLeft = 11 - Number(firstOfMonthDate.getMonth()) + 1;

        if ((workerObj.remainingShifts / monthsLeft) >= ((260 - 14) / 16)) {
          workerObj = {
            ...workerObj,
            remainingShiftsStatus: 'danger',
          };
        } else if (
          (workerObj.remainingShifts / monthsLeft) < ((260 - 14) / 16)
          && (workerObj.remainingShifts / monthsLeft) >= ((260 - 14) / 49)
        ) {
          workerObj = {
            ...workerObj,
            remainingShiftsStatus: 'warning',
          };
        } else {
          workerObj = {
            ...workerObj,
            remainingShiftsStatus: 'success',
          };
        }

        if ((workerObj.remainingLeaves / monthsLeft) >= 3) {
          workerObj = {
            ...workerObj,
            remainingLeavesStatus: 'danger',
          };
        } else if (
          (workerObj.remainingLeaves / monthsLeft) < 3
          && (workerObj.remainingLeaves / monthsLeft) >= 1.5
        ) {
          workerObj = {
            ...workerObj,
            remainingLeavesStatus: 'warning',
          };
        } else {
          workerObj = {
            ...workerObj,
            remainingLeavesStatus: 'success',
          };
        }

        delete workerObj.password;
        delete workerObj.createdAt;
        delete workerObj.updatedAt;
        delete workerObj.wage;

        return workerObj;
      });

      const shiftDates = events.filter((event) => (event.type === 'shift'));
      const leaveDates = events.filter((event) => (event.type === 'leave'));

      const successMessage = `Successful retrieval of workers by Admin ID ${request.params.adminId} on ${firstOfMonthString} ${request.params.year}!`;
      response.send({
        message: successMessage,
        ...newObj,
        shiftDates,
        leaveDates,
        workers,
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

  const workerCreate = async (request, response) => {
    const {
      userId, organisationId, type, dateAt, createdAt, updatedAt,
    } = request.body;

    const firstOfMonthDate = new Date(`${request.params.year}-${Number(request.params.month) + 1}-1`);
    const firstOfMonthString = util.getMonthString(firstOfMonthDate);
    try {
      let newObj = {};
      const user = await db.User.findOne({
        where: {
          [db.Sequelize.Op.and]: [
            { id: userId },
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

      let newEvent = await db.Event.create({
        userId,
        organisationId,
        type,
        dateAt,
        createdAt,
        updatedAt,
      });

      newEvent = {
        ...newEvent.dataValues,
      };

      const dateNumberStr = `${newEvent.dateAt.getDate()}`;

      newEvent = {
        ...newEvent,
        title: newEvent.type.charAt(0).toUpperCase()
          + newEvent.type.substring(1),
        extendedProps: {
          id: newEvent.id,
          userId: newEvent.userId,
          realName: newObj.realName,
          type: newEvent.type,
          title: newEvent.type.charAt(0).toUpperCase()
            + newEvent.type.substring(1),
        },
      };

      const successMessage = `Successful creation of new event for worker ID ${request.params.workerId}'s preferred schedule on ${firstOfMonthString} ${dateNumberStr}!`;
      response.send({
        message: successMessage,
        newEvent,
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

  const workerDelete = async (request, response) => {
    try {
      const event = await db.Event.findOne({
        where: {
          [db.Sequelize.Op.and]: [
            { id: request.params.eventId },
            { userId: request.params.workerId },
          ],
        },
      });

      if (!event) {
        // we didnt find a user with that email.
        // the error for password and user are the same.
        // don't tell the user which error they got for security reasons,
        // otherwise people can guess if a person is a user of a given service.
        throw new Error(globals.EVENT_NOT_FOUND);
      }

      await db.Event.destroy({
        where: {
          [db.Sequelize.Op.and]: [
            { id: request.params.eventId },
            { userId: request.params.workerId },
          ],
        },
      });

      const successMessage = `Successful deletion of event ID ${request.params.eventId} for worker ID ${request.params.workerId}!`;
      response.send({
        success: true,
        message: successMessage,
        eventId: request.params.eventId,
      });
    } catch (error) {
      const errorMessage = error.message;

      const resObj = {
        isError: true,
        error: errorMessage,
        message: errorMessage,
        ...request.params,
      };
      response.send(resObj);
    }
  };

  const workerEdit = async (request, response) => {
    try {
      const { organisationId, type, dateAt } = request.body;
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

      const event = await db.Event.findOne({
        where: {
          [db.Sequelize.Op.and]: [
            { id: request.params.eventId },
            { userId: request.params.workerId },
          ],
        },
      });

      if (!event) {
        // we didnt find a user with that email.
        // the error for password and user are the same.
        // don't tell the user which error they got for security reasons,
        // otherwise people can guess if a person is a user of a given service.
        throw new Error(globals.EVENT_NOT_FOUND);
      }

      let modifiedEvent = await db.Event.update(
        {
          organisationId,
          userId: request.params.workerId,
          type,
          dateAt,
          createdAt: event.dataValues.createdAt,
          updatedAt: new Date(),
        },
        {
          where: {
            [db.Sequelize.Op.and]: [
              { id: request.params.eventId },
              { userId: request.params.workerId },
            ],
          },
          returning: true,
        },
      );

      modifiedEvent = {
        ...modifiedEvent[1][0].dataValues,
      };

      modifiedEvent = {
        ...modifiedEvent,
        title: modifiedEvent.type.charAt(0).toUpperCase()
          + modifiedEvent.type.substring(1),
        extendedProps: {
          id: modifiedEvent.id,
          userId: modifiedEvent.userId,
          realName: newObj.realName,
          type: modifiedEvent.type,
          title: modifiedEvent.type.charAt(0).toUpperCase()
            + modifiedEvent.type.substring(1),
        },
      };

      const successMessage = `Successful editing of event ID ${request.params.eventId} for worker ID ${request.params.workerId}!`;
      response.send({
        success: true,
        message: successMessage,
        modifiedEvent,
      });
    } catch (error) {
      const errorMessage = error.message;

      const resObj = {
        isError: true,
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
    showAdminEventsByMonth,
    workerCreate,
    workerDelete,
    workerEdit,
  };
}
