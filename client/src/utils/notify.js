// client/src/utils/notify.js
import axios from 'axios';

export function notify({ type, taskId, eventId, recipients, payload }) {
  const token = localStorage.getItem('token');
  const body = { type, recipients, payload };
  if (taskId)  body.taskId  = taskId;
  if (eventId) body.eventId = eventId;

  return axios.post(
    `${process.env.REACT_APP_API_URL || ''}/api/notifications`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  ).catch(() => {});  
}
