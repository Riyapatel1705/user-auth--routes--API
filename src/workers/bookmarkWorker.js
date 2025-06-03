import { Worker } from 'bullmq';
import { connection } from '../queues/redisConnection.js';
import { Bookmark } from '../db/models/Bookmark.js';

export const bookmarkWorker = new Worker(
  'bookmark-queue',
  async (job) => {
    try {
      const { user_id, event_id } = job.data;
      await Bookmark.create({ user_id, event_id });
    } catch (err) {
      console.log("Error in bookmark queue:", err.message);
    }
  },
   {
    connection,
    concurrency:1
   } 
);
