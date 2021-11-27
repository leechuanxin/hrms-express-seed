// db is an argument to this function so
// that we can make db queries inside
export default function initWorkerController() {
  const showSchedule = (request, response) => {
    const prevMonth = (request.params.month === 0) ? 11 : request.params.month - 1;
    response.send({
      token: 'abcdef',
      user_id: 1,
      username: 'chee_kean',
      real_name: 'Chee Kean',
      organisation_id: 1,
      role: 'worker',
      remainder_leaves: 5,
      remainder_shifts: 2,
      month: Number(request.params.month),
      prev_month: prevMonth,
      year: Number(request.params.year),
      shift_dates: [
        {
          id: 1,
          title: 'Shift',
          date: '2021-12-03',
          extendedProps: {
            id: 1,
            user_id: 1,
            real_name: 'Lee Chuan Xin',
            type: 'shift',
            title: 'Shift',
            date: '2021-12-03',
          },
        },
        {
          id: 2,
          title: 'Shift',
          date: '2021-12-08',
          extendedProps: {
            id: 2,
            user_id: 1,
            real_name: 'Lee Chuan Xin',
            type: 'shift',
            title: 'Shift',
            date: '2021-12-03',
          },
        },
        {
          id: 3,
          title: 'Shift',
          date: '2021-12-23',
          extendedProps: {
            id: 3,
            user_id: 1,
            real_name: 'Lee Chuan Xin',
            type: 'shift',
            title: 'Shift',
            date: '2021-12-03',
          },
        },
      ],
      leave_dates: [
        {
          id: 4,
          title: 'Leave',
          date: '2021-12-07',
          extendedProps: {
            id: 4,
            user_id: 1,
            real_name: 'Lee Chuan Xin',
            type: 'leave',
            title: 'Shift',
            date: '2021-12-03',
          },
        },
        {
          id: 5,
          title: 'Leave',
          date: '2021-12-09',
          extendedProps: {
            id: 5,
            user_id: 1,
            real_name: 'Lee Chuan Xin',
            type: 'leave',
            title: 'Shift',
            date: '2021-12-03',
          },
        },
        {
          id: 6,
          title: 'Leave',
          date: '2021-12-25',
          extendedProps: {
            id: 6,
            user_id: 1,
            real_name: 'Lee Chuan Xin',
            type: 'leave',
            title: 'Shift',
            date: '2021-12-03',
          },
        },
      ],
    });
  };

  // return all methods we define in an object
  // refer to the routes file above to see this used
  return {
    showSchedule,
  };
}
