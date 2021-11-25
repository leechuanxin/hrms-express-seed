// db is an argument to this function so
// that we can make db queries inside
export default function initLoginController() {
  const login = (request, response) => {
    if (request.body.username === 'admin') {
      response.send({
        token: '123456',
        user_id: 2,
        username: 'admin',
        org_id: 1,
        role: 'admin',
      });
    } else {
      response.send({
        token: 'abcdef',
        user_id: 1,
        username: 'chee_kean',
        org_id: 1,
        role: 'worker',
      });
    }
  };

  // return all methods we define in an object
  // refer to the routes file above to see this used
  return {
    login,
  };
}
