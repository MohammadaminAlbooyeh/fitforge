// TODO: no screen calls sendTestNotification() yet - there is no UI for
// scheduling or testing workout reminders.
import { api } from './client';

export async function sendTestNotification(workoutName: string): Promise<void> {
  await api.post('/notifications/test', null, {
    params: { workout_name: workoutName },
  });
}
