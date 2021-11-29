import * as globals from '../globals.mjs';
import * as util from '../utils.mjs';

// db is an argument to this function so
// that we can make db queries inside
export default function initOptimisationsController(db) {
  const show = async (request, response) => {
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

      let schedules = await db.Schedule.findAll({
        where: {
          [db.Sequelize.Op.and]: [
            { organisationId: user.organisationId },
            {
              startMonthDate:
              {
                [db.Sequelize.Op.and]: [
                  { [db.Sequelize.Op.gte]: firstOfMonthDate },
                  { [db.Sequelize.Op.lt]: firstOfNextMonthDate },
                ],
              },
            },
          ],
        },
      });

      let scheduleSelected = false;

      let optimisedSchedule = await db.Schedule.findOne({
        where: {
          [db.Sequelize.Op.and]: [
            { organisationId: user.organisationId },
            { isSelected: true },
            {
              startMonthDate:
              {
                [db.Sequelize.Op.and]: [
                  { [db.Sequelize.Op.gte]: firstOfMonthDate },
                  { [db.Sequelize.Op.lt]: firstOfNextMonthDate },
                ],
              },
            },
          ],
        },
      });

      if (optimisedSchedule) {
        scheduleSelected = true;
        optimisedSchedule = await optimisedSchedule.getOptimisations();
        optimisedSchedule = await Promise.all(
          optimisedSchedule.map(async (optimisation) => {
            const eventUser = await optimisation.getUser();
            let monthNumberStr = `${Number(request.params.month) + 1}`;
            let dateNumberStr = `${(new Date(optimisation.dataValues.dateAt)).getDate()}`;

            if (monthNumberStr < 2) {
              monthNumberStr = `0${monthNumberStr}`;
            }

            if (dateNumberStr.length < 2) {
              dateNumberStr = `0${dateNumberStr}`;
            }

            const combinedDateStr = `${request.params.year}-${monthNumberStr}-${dateNumberStr}`;

            const optimisationObj = {
              ...optimisation.dataValues,
              title: `${eventUser.dataValues.realName}`,
              date: combinedDateStr,
              extendedProps: {
                id: optimisation.dataValues.id,
                userId: eventUser.dataValues.id,
                realName: eventUser.dataValues.realName,
                type: optimisation.dataValues.type,
                title: `${eventUser.dataValues.realName}`,
                date: combinedDateStr,
              },
            };
            return {
              ...optimisationObj,
            };
          }),
        );
      }

      schedules = await Promise.all(
        schedules.map(async (schedule) => {
          let optimisations = await schedule.getOptimisations();
          optimisations = await Promise.all(
            optimisations.map(async (optimisation) => {
              const eventUser = await optimisation.getUser();
              let monthNumberStr = `${Number(request.params.month) + 1}`;
              let dateNumberStr = `${(new Date(optimisation.dataValues.dateAt)).getDate()}`;

              if (monthNumberStr < 2) {
                monthNumberStr = `0${monthNumberStr}`;
              }

              if (dateNumberStr.length < 2) {
                dateNumberStr = `0${dateNumberStr}`;
              }

              const combinedDateStr = `${request.params.year}-${monthNumberStr}-${dateNumberStr}`;

              const optimisationObj = {
                ...optimisation.dataValues,
                title: `${eventUser.dataValues.realName}`,
                date: combinedDateStr,
                extendedProps: {
                  id: optimisation.dataValues.id,
                  userId: eventUser.dataValues.id,
                  realName: eventUser.dataValues.realName,
                  type: optimisation.dataValues.type,
                  title: `${eventUser.dataValues.realName}`,
                  date: combinedDateStr,
                },
              };
              return {
                ...optimisationObj,
              };
            }),
          );
          const scheduleObj = {
            ...schedule.dataValues,
            optimisations,
          };
          return {
            ...scheduleObj,
          };
        }),
      );

      const successMessage = `Successful retrieval of optimisations by Admin ID ${request.params.adminId} on ${firstOfMonthString} ${request.params.year}!`;
      response.send({
        message: successMessage,
        ...newObj,
        workers,
        schedules,
        scheduleSelected,
        optimisedSchedule,
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

  const select = async (request, response) => {
    const firstOfMonthDate = new Date(`${request.body.year}-${Number(request.body.month) + 1}-1`);
    const firstOfNextMonthDate = util.getMonthDate(firstOfMonthDate, 'next');
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

      const selectedSchedule = await db.Schedule.findOne({
        where: {
          id: request.params.scheduleId,
        },
      });

      if (!selectedSchedule) {
        // we didnt find a user with that email.
        // the error for password and user are the same.
        // don't tell the user which error they got for security reasons,
        // otherwise people can guess if a person is a user of a given service.
        throw new Error(globals.SCHEDULE_NOT_FOUND);
      }

      let workers = await db.User.findAll({
        where: {
          [db.Sequelize.Op.and]: [
            { organisationId: user.organisationId },
            { role: 'worker' },
          ],
        },
      });

      const prevMonth = (request.body.month === 0) ? 11 : request.body.month - 1;

      newObj = {
        ...user.dataValues,
        userId: user.id,
        token: util.getHash(user.id),
        month: Number(request.body.month),
        prev_month: prevMonth,
        year: Number(request.body.year),
      };

      delete newObj.password;
      delete newObj.id;
      delete newObj.createdAt;
      delete newObj.updatedAt;
      delete newObj.wage;

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

      const updatedSchedule = {
        ...selectedSchedule.dataValues,
        isSelected: true,
        updatedAt: new Date(),
      };

      delete updatedSchedule.id;

      let modifiedSchedule = await db.Schedule.update(
        {
          ...updatedSchedule,
        },
        {
          where: {
            id: request.params.scheduleId,
          },
          returning: true,
        },
      );

      modifiedSchedule = await db.Schedule.findOne({
        where: {
          [db.Sequelize.Op.and]: [
            { organisationId: user.organisationId },
            { isSelected: true },
            {
              startMonthDate:
              {
                [db.Sequelize.Op.and]: [
                  { [db.Sequelize.Op.gte]: firstOfMonthDate },
                  { [db.Sequelize.Op.lt]: firstOfNextMonthDate },
                ],
              },
            },
          ],
        },
      });

      modifiedSchedule = await modifiedSchedule.getOptimisations();
      modifiedSchedule = await Promise.all(
        modifiedSchedule.map(async (optimisation) => {
          const eventUser = await optimisation.getUser();
          let monthNumberStr = `${Number(request.body.month) + 1}`;
          let dateNumberStr = `${(new Date(optimisation.dataValues.dateAt)).getDate()}`;

          if (monthNumberStr < 2) {
            monthNumberStr = `0${monthNumberStr}`;
          }

          if (dateNumberStr.length < 2) {
            dateNumberStr = `0${dateNumberStr}`;
          }

          const combinedDateStr = `${request.body.year}-${monthNumberStr}-${dateNumberStr}`;

          const optimisationObj = {
            ...optimisation.dataValues,
            title: `${eventUser.dataValues.realName}`,
            date: combinedDateStr,
            extendedProps: {
              id: optimisation.dataValues.id,
              userId: eventUser.dataValues.id,
              realName: eventUser.dataValues.realName,
              type: optimisation.dataValues.type,
              title: `${eventUser.dataValues.realName}`,
              date: combinedDateStr,
            },
          };
          return {
            ...optimisationObj,
          };
        }),
      );

      let schedules = await db.Schedule.findAll({
        where: {
          [db.Sequelize.Op.and]: [
            { organisationId: user.organisationId },
            {
              startMonthDate:
              {
                [db.Sequelize.Op.and]: [
                  { [db.Sequelize.Op.gte]: firstOfMonthDate },
                  { [db.Sequelize.Op.lt]: firstOfNextMonthDate },
                ],
              },
            },
          ],
        },
      });

      schedules = await Promise.all(
        schedules.map(async (schedule) => {
          let optimisations = await schedule.getOptimisations();
          optimisations = await Promise.all(
            optimisations.map(async (optimisation) => {
              const eventUser = await optimisation.getUser();
              let monthNumberStr = `${Number(request.body.month) + 1}`;
              let dateNumberStr = `${(new Date(optimisation.dataValues.dateAt)).getDate()}`;

              if (monthNumberStr < 2) {
                monthNumberStr = `0${monthNumberStr}`;
              }

              if (dateNumberStr.length < 2) {
                dateNumberStr = `0${dateNumberStr}`;
              }

              const combinedDateStr = `${request.body.year}-${monthNumberStr}-${dateNumberStr}`;

              const optimisationObj = {
                ...optimisation.dataValues,
                title: `${eventUser.dataValues.realName}`,
                date: combinedDateStr,
                extendedProps: {
                  id: optimisation.dataValues.id,
                  userId: eventUser.dataValues.id,
                  realName: eventUser.dataValues.realName,
                  type: optimisation.dataValues.type,
                  title: `${eventUser.dataValues.realName}`,
                  date: combinedDateStr,
                },
              };
              return {
                ...optimisationObj,
              };
            }),
          );
          const scheduleObj = {
            ...schedule.dataValues,
            optimisations,
          };
          return {
            ...scheduleObj,
          };
        }),
      );

      const successMessage = `Successful selection of Schedule ID ${request.params.scheduleId} by Admin ID ${request.params.adminId}!`;
      response.send({
        message: successMessage,
        ...newObj,
        workers,
        schedules,
        scheduleSelected: true,
        optimisedSchedule: [...modifiedSchedule],
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

  const edit = async (request, response) => {
    try {
      const {
        workerId, organisationId, type, dateAt,
      } = request.body;
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

      const optimisation = await db.Optimisation.findOne({
        where: {
          id: request.params.optimisationId,
        },
      });

      if (!optimisation) {
        // we didnt find a user with that email.
        // the error for password and user are the same.
        // don't tell the user which error they got for security reasons,
        // otherwise people can guess if a person is a user of a given service.
        throw new Error(globals.EVENT_NOT_FOUND);
      }

      let modifiedEvent = await db.Optimisation.update(
        {
          scheduleId: optimisation.dataValues.scheduleId,
          organisationId,
          userId: (workerId === 0) ? optimisation.dataValues.userId : workerId,
          type,
          dateAt,
          createdAt: optimisation.dataValues.createdAt,
          updatedAt: new Date(),
        },
        {
          where: {
            id: request.params.optimisationId,
          },
          returning: true,
        },
      );

      modifiedEvent = {
        ...modifiedEvent[1][0].dataValues,
      };

      const newOptimisation = await db.Optimisation.findOne({
        where: {
          id: request.params.optimisationId,
        },
      });

      const eventUser = await newOptimisation.getUser();

      modifiedEvent = {
        ...modifiedEvent,
        title: eventUser.dataValues.realName,
        extendedProps: {
          id: modifiedEvent.id,
          userId: eventUser.dataValues.id,
          realName: eventUser.dataValues.realName,
          type: modifiedEvent.type,
          title: eventUser.dataValues.realName,
        },
      };

      const successMessage = `Successful editing of optimisation ID ${request.params.optimisationId} for admin ID ${request.params.adminId}!`;
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

  const adminDelete = async (request, response) => {
    try {
      const optimisation = await db.Optimisation.findOne({
        where: {
          id: request.params.optimisationId,
        },
      });

      if (!optimisation) {
        // we didnt find a user with that email.
        // the error for password and user are the same.
        // don't tell the user which error they got for security reasons,
        // otherwise people can guess if a person is a user of a given service.
        throw new Error(globals.EVENT_NOT_FOUND);
      }

      await db.Optimisation.destroy({
        where: { id: request.params.optimisationId },
      });

      const successMessage = `Successful deletion of optimisation ID ${request.params.optimisationId} by admin ID ${request.params.adminId}!`;
      response.send({
        success: true,
        message: successMessage,
        eventId: request.params.optimisationId,
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

  const create = async (request, response) => {
    const {
      adminId, userId, scheduleId, organisationId, type, dateAt, createdAt, updatedAt,
    } = request.body;

    try {
      let newObj = {};
      const admin = await db.User.findOne({
        where: {
          [db.Sequelize.Op.and]: [
            { id: adminId },
            { role: 'admin' },
          ],
        },
      });

      if (!admin) {
        // we didnt find a user with that email.
        // the error for password and user are the same.
        // don't tell the user which error they got for security reasons,
        // otherwise people can guess if a person is a user of a given service.
        throw new Error(globals.ADMIN_NOT_FOUND);
      }

      const prevMonth = (request.params.month === 0) ? 11 : request.params.month - 1;

      newObj = {
        ...admin.dataValues,
        userId: admin.id,
        token: util.getHash(admin.id),
        month: Number(request.params.month),
        prev_month: prevMonth,
        year: Number(request.params.year),
      };

      delete newObj.password;
      delete newObj.id;
      delete newObj.createdAt;
      delete newObj.updatedAt;
      delete newObj.wage;

      let newEvent = await db.Optimisation.create({
        userId,
        organisationId,
        scheduleId,
        type,
        dateAt,
        createdAt,
        updatedAt,
      });

      newEvent = {
        ...newEvent.dataValues,
      };

      const newOptimisation = await db.Optimisation.findOne({
        where: {
          id: newEvent.id,
        },
      });

      const eventUser = await newOptimisation.getUser();

      newEvent = {
        ...newEvent,
        title: eventUser.dataValues.realName,
        extendedProps: {
          id: newEvent.id,
          userId: eventUser.dataValues.id,
          realName: eventUser.dataValues.realName,
          type: newEvent.type,
          title: eventUser.dataValues.realName,
        },
      };

      const successMessage = `Successful creation of new optimisation for worker ID ${request.params.userId} by ${request.params.adminId}!`;
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

  // return all methods we define in an object
  // refer to the routes file above to see this used
  return {
    show,
    select,
    edit,
    adminDelete,
    create,
  };
}
