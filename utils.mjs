import jssha from 'jssha';

const { SALT } = process.env;

export function getHash(input) {
  // eslint-disable-next-line new-cap
  const shaObj = new jssha('SHA-512', 'TEXT', { encoding: 'UTF8' });
  const unhasedString = `${input}-${SALT}`;
  shaObj.update(unhasedString);

  return shaObj.getHash('HEX');
}
// Hello Heroku
export const getInvalidFormRequests = (obj) => Object.keys(obj).filter((key) => key.indexOf('invalid') >= 0);

export const getMonthDate = (date, type) => {
  const currentMonth = date.getMonth();
  const nextMonth = (currentMonth === 11) ? 0 : date.getMonth() + 1;
  const month = (type === 'next') ? nextMonth : currentMonth;
  const year = (type === 'next' && nextMonth === 0) ? date.getFullYear() + 1 : date.getFullYear();
  const monthDate = new Date(year, month, 1);
  return monthDate;
};

export const getMonthString = (date) => {
  const formatter = new Intl.DateTimeFormat('default', { month: 'long' });
  const monthDateStr = formatter.format(date);
  return monthDateStr;
};
