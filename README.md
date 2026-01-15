# TeamTrainer - Fitness Training Platform

A modern, beautiful, and intuitive platform for trainers to create workouts and team members to log their progress.

## Features

✨ **For Trainers:**
- Create and schedule workout sessions with multiple exercises
- Define sets, reps, and exercise details
- Manage teams and invite members
- Monitor team progress and completion rates

📊 **For Members:**
- View upcoming and completed workouts
- Log weights, reps, and personal notes for each exercise
- Track progress over time
- Easy-to-use mobile-friendly interface

🎨 **User Experience:**
- Beautiful, modern UI with Tailwind CSS
- Responsive design for all devices
- Intuitive forms and workflows
- Real-time feedback and validation

## Tech Stack

- **Frontend:** React 18, Next.js 15 (App Router)
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** MongoDB with Mongoose
- **Authentication:** bcryptjs for password hashing
- **Form Handling:** React Hook Form, Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB instance (local or cloud)

### Installation

1. **Navigate to project**
   ```bash
   cd team-training
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit .env.local and add your MongoDB URI
   MONGODB_URI=mongodb://localhost:27017/team-training
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── trainings/         # Training pages
│   ├── teams/             # Team management
│   ├── api/               # API routes
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   └── ui/                # shadcn/ui components
├── models/                # MongoDB schemas
├── lib/
│   ├── db/                # Database connection
│   └── utils/             # Helper functions
└── globals.css            # Global styles
```

## Database Models

### User
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  role: 'trainer' | 'member'
  team: ObjectId
  createdAt: Date
  updatedAt: Date
}
```

### Team
```typescript
{
  name: string
  description: string
  trainer: ObjectId
  members: [ObjectId]
  createdAt: Date
  updatedAt: Date
}
```

### Training
```typescript
{
  title: string
  description: string
  exercises: [{
    name: string
    sets: number
    reps: string
    notes: string
  }]
  team: ObjectId
  trainer: ObjectId
  scheduledDate: Date
  status: 'scheduled' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}
```

### WorkoutLog
```typescript
{
  training: ObjectId
  member: ObjectId
  exercises: [{
    exerciseName: string
    setNumber: number
    weight: number
    reps: number
    notes: string
  }]
  completedAt: Date
  notes: string
  createdAt: Date
  updatedAt: Date
}
```

## Key Components

- **TrainingCard.tsx** - Display training details with action buttons
- **CreateTrainingForm.tsx** - Form for trainers to create workouts
- **WorkoutLogForm.tsx** - Form for members to log their workout data
- **CreateTeamForm.tsx** - Form for creating teams

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Trainings (To be implemented)
- `GET /api/trainings` - Get all trainings
- `POST /api/trainings` - Create training
- `GET /api/trainings/:id` - Get training details
- `PATCH /api/trainings/:id` - Update training
- `DELETE /api/trainings/:id` - Delete training

### Workout Logs (To be implemented)
- `POST /api/workouts` - Log workout
- `GET /api/workouts/:trainingId` - Get workout logs

## UI Components

Uses shadcn/ui for professional, accessible components:
- Button, Card, Input, Label, Form
- Select, Tabs, Badge, Alert
- Dialog, Dropdown Menu

## Next Steps

1. ✅ Project scaffold complete
2. 🚀 Run development server: `npm run dev`
3. 📝 Complete remaining API routes
4. 🎨 Enhance dashboard pages
5. 📊 Add progress analytics
6. 📱 Test on mobile devices
7. 🚀 Deploy to production

## Environment Variables

Create `.env.local` file:
```
MONGODB_URI=mongodb://localhost:27017/team-training
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## License

MIT - Use freely for personal or commercial projects

---

Built with ❤️ for fitness enthusiasts
