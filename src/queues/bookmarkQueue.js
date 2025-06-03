import {Queue} from 'bullmq';
import {connection} from './redisConnection.js';

export const bookmarkQueue= new Queue('bookmark-queue',{
    connection,
});
