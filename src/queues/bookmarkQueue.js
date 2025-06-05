import { Queue, Worker } from 'bullmq';
import { connection } from './redisConnection.js';
import { createPdfBuffer } from '../helper/helper.js';
import { transporter } from '../utils/transporter.js';
import { Bookmark } from '../db/models/Bookmark.js';
import {Event} from "../db/models/Event.js";
import { validateEmail } from '../utils/validation.js';
export const eventActionsQueue= new Queue('event-action-queue',{
    connection,
});


// Worker code
new Worker(
  'event-action-queue',
  async (job) => {
    const { user, data } = job;
    const { userId, eventId, userEmail, userName } = data;
    const requiredFields = { userId, eventId, userEmail, userName };

if (Object.values(requiredFields).some((value) => !value)) {
  console.error("Missing required job data:", requiredFields);
  return;
}
if(!validateEmail(userEmail)){
  console.log("email format is not proper");
  return;
}
 // Simulate delay before processing (for testing purpose)
  await new Promise((resolve) => {
      setTimeout(() => {
        console.log("Simulated delay complete. Processing job now...");
        resolve();
      }, 3000); // 3 second delay
    });

    await Bookmark.create({
      user_id: userId,
      event_id: eventId,
      bookmarked_at: new Date(),
    });
    console.log(`Bookmark added for user ${userId}`);

    const event = await Event.findByPk(eventId);
    if (!event) {
      console.error(`Event ${eventId} not found`);
      return;
    }

    const pdfBuffer = await createPdfBuffer({ userName, event });

    await transporter.sendMail({
      from: 'riya.test.nodejs@gmail.com',
      to: userEmail,
      subject: `You bookmarked: ${event.name}`,
      template: 'eventConfirmation',
      context: {
        firstName: userName.split(' ')[0],
        event: event.toJSON(),
      },
      attachments: [
        {
          filename: `event-${event.id}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log(`Email with PDF sent to ${userEmail}`);
  },
  { connection }
);
