import api from '../../lib/axios.ts';

export const getCurrentWeek = async () => {
  const res = await api.get('/weather/logs/currentWeek');

  const logs = res?.data?.body;
  console.log(logs)
  return Array.isArray(logs) ? logs : [];
};

export const getLogsToday = async () => {
  const res = await api.get('/weather/logs');
  const logs = res?.data?.body || [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const logsToday = logs.filter((log: any) => {
    const logDate = new Date(log.time);
    return logDate >= today && logDate < tomorrow;
  });
  console.log(logsToday)


  return logsToday;
};