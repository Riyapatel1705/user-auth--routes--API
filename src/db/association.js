// associations.js
import { Event } from './models/Event.js';
import { Bookmark } from './models/Bookmark.js';
import {User} from './models/User.js';
import {Feedback} from './models/Feedback.js';
import { Organization } from './models/Organization.js';
import { Admin } from './models/Admin.js';

// Define the associations directly here after both models are initialized
Event.hasMany(Bookmark, {
  foreignKey: 'eventId',
  as: 'bookmarks',
});

Bookmark.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'event',
});

User.hasMany(Feedback,{foreignKey:"userId"});
Feedback.belongsTo(User,{foreignKey:"userId"});

Event.hasMany(Feedback,{foreignKey:"eventId"});
Feedback.belongsTo(Event,{foreignKey:"eventId"});

Organization.hasMany(Event,{foreignKey:'organization_id'});
Event.belongsTo(Organization,{foreignKey:'organization_id'});

Admin.hasMany(Organization, { foreignKey: 'admin_id' });
Organization.belongsTo(Admin, { foreignKey: 'admin_id' });

Admin.belongsTo(User, { foreignKey: 'Admin_id' });  // Each admin refers to one user
User.hasOne(Admin, { foreignKey: 'Admin_id' });    // Each user can have one admin

