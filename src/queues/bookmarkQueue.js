import { Queue, Worker } from 'bullmq';
import { connection } from './redisConnection.js';
import { createPdfBuffer } from '../helper/helper.js';
import { transporter } from '../utils/transporter.js';
export const eventActionsQueue= new Queue('event-action-queue',{
    connection,
});



// Worker code


new Worker(
  'event-action-queue',
  async (job) => {
    const { name, data } = job;
    console.log(`Received job: ${name}`);
    console.log("worker started!");

    const { userId, eventId, userEmail, userName } = data;

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
        text: `Hi ${userName}, check the attached PDF for full event info.`,
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
