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
      org_id: 1,
      role: 'worker',
      remainder_leaves: 5,
      remainder_shifts: 2,
      month: Number(request.params.month),
      prev_month: prevMonth,
      year: Number(request.params.year),
      shift_dates: [
        { title: 'Shift', date: '2021-12-03', extendedProps: { user_id: 1, real_name: 'Lee Chuan Xin', type: 'shift' } },
        { title: 'Shift', date: '2021-12-08', extendedProps: { user_id: 1, real_name: 'Lee Chuan Xin', type: 'shift' } },
        { title: 'Shift', date: '2021-12-23', extendedProps: { user_id: 1, real_name: 'Lee Chuan Xin', type: 'shift' } },
      ],
      leave_dates: [
        { title: 'Leave', date: '2021-12-07', extendedProps: { user_id: 1, real_name: 'Lee Chuan Xin', type: 'leave' } },
        { title: 'Leave', date: '2021-12-09', extendedProps: { user_id: 1, real_name: 'Lee Chuan Xin', type: 'leave' } },
        { title: 'Leave', date: '2021-12-25', extendedProps: { user_id: 1, real_name: 'Lee Chuan Xin', type: 'leave' } },
      ],
    });
  };

  // return all methods we define in an object
  // refer to the routes file above to see this used
  return {
    showSchedule,
  };
}
