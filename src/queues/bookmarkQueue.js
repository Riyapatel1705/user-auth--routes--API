import { Queue, Worker } from 'bullmq';
import { Bookmark } from '../db/models/Bookmark.js';
import { Event } from "../db/models/Event.js";
import { createPdfBuffer } from '../helper/helper.js';
import { transporter } from '../utils/transporter.js';
import { connection } from './redisConnection.js';
export const eventActionsQueue= new Queue('event-action-queue',{
    connection,
});


// Worker code
new Worker(
  'event-action-queue',
  async (job) => {

    const { userId, eventId, userEmail, userName } = job.data;
    if(!userId || !eventId || !userEmail || !userName){
      return
    }



 // Simulate delay before processing (for testing purpose)
  await new Promise((resolve) => {
      setTimeout(() => {
        console.log("Simulated delay complete. Processing job now...");
        resolve();
      }, 3000); // 3 second delay
    });
  try{
    await Bookmark.create({
      user_id: userId,
      event_id: eventId,
      bookmarked_at: new Date(),
    });
  }catch(err){
    console.log("error while creating bookmark:",err.message);
    
  }
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
  },
  { connection }
);
