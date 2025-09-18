// MongoDB initialization script
db = db.getSiblingDB('ticketnow');

// Create collections with indexes
db.createCollection('users');
db.createCollection('events');
db.createCollection('tickettypes');
db.createCollection('orders');
db.createCollection('tickets');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });

db.events.createIndex({ "slug": 1 }, { unique: true });
db.events.createIndex({ "organizerId": 1 });
db.events.createIndex({ "startAt": 1 });
db.events.createIndex({ "status": 1 });

db.tickettypes.createIndex({ "eventId": 1 });
db.tickettypes.createIndex({ "salesStart": 1, "salesEnd": 1 });

db.orders.createIndex({ "userId": 1 });
db.orders.createIndex({ "email": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": 1 });

db.tickets.createIndex({ "orderId": 1 });
db.tickets.createIndex({ "eventId": 1 });
db.tickets.createIndex({ "ticketUUID": 1 }, { unique: true });
db.tickets.createIndex({ "status": 1 });

print('Database initialized successfully');
