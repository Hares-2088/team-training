# 🌱 Database Seeding Guide

Your project includes a seed script to populate the database with test accounts and sample data.

## Prerequisites

**MongoDB must be running** before seeding.

### Option 1: MongoDB Locally

```bash
# macOS (if using Homebrew)
brew services start mongodb-community

# Windows
# Start MongoDB Desktop or run mongod from command line

# Linux
sudo systemctl start mongod
```

### Option 2: MongoDB Atlas (Cloud)

1. Create an account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get connection string
3. Update `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/team-training
   ```

---

## Running the Seed Script

Once MongoDB is running:

```bash
npm run seed
```

This will create:
- **3 test users** (1 trainer, 2 members)
- **1 team** (CrossFit Elite)
- **3 trainings** (2 scheduled, 1 completed)
- **2 workout logs** (sample completed workouts)

---

## Test Account Credentials

### Trainer Account
- **Email:** trainer@test.com
- **Password:** trainer123

### Member Accounts
- **Email:** sarah@test.com
- **Password:** member123

- **Email:** mike@test.com
- **Password:** member123

---

## What Gets Seeded

### Users
```
John Smith (Trainer)
  └── trainer@test.com / trainer123

Sarah Johnson (Member)
  └── sarah@test.com / member123

Mike Davis (Member)
  └── mike@test.com / member123
```

### Team
- **Name:** CrossFit Elite
- **Members:** Sarah, Mike (trainer: John)

### Trainings
1. **Upper Body Strength** (Tomorrow)
   - Bench Press, Barbell Rows, Shoulder Press, Pull-ups

2. **Lower Body Power** (Next Week)
   - Squats, Deadlifts, Leg Press, Leg Curls

3. **Core & Cardio** (Completed - 2 days ago)
   - Planks, Russian Twists, Treadmill

### Workout Logs
- Sarah's Core & Cardio session (with set details)
- Mike's Core & Cardio session (with set details)

---

## Troubleshooting

### Error: "connect ECONNREFUSED"
MongoDB is not running. Start MongoDB and try again.

### Error: "E11000 duplicate key error"
Data already exists. The seed script clears old data first, so this shouldn't happen. If it does, clear MongoDB manually:

```javascript
// In MongoDB shell
use team-training
db.users.deleteMany({})
db.teams.deleteMany({})
db.trainings.deleteMany({})
db.workoutlogs.deleteMany({})
```

### Can't connect to MongoDB Atlas
- Check your connection string in `.env.local`
- Ensure IP address is whitelisted in Atlas
- Check network connectivity

---

## Next Steps

1. **Start MongoDB** (local or Atlas)
2. **Run seed script:** `npm run seed`
3. **Login to app** with test credentials
4. **Explore the data** in the app
5. **Start developing** your features!

---

## Quick Start

```bash
# 1. MongoDB must be running
mongod  # or start MongoDB Desktop

# 2. In another terminal
cd team-training
npm run seed

# 3. Start the dev server
npm run dev

# 4. Open http://localhost:3000
# 5. Login with: trainer@test.com / trainer123
```

---

**Once seeded, you can immediately test the app with realistic data!** 🚀
