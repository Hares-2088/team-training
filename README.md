# TeamTrainer - Fitness Training Platform

A modern, beautiful, and intuitive platform for trainers to create workouts and team members to log their progress.

## Features

✨ **For Trainers:**
- Create and schedule workout sessions with multiple exercises
- Define sets, reps, rest time, and exercise details
- Create and manage multiple teams
- Invite members via unique codes or shareable links
- Manage team members (add/remove)
- Edit and delete teams and trainings
- View all trainings for their teams
- Monitor team progress and completion rates
- Only see data for teams they own

📊 **For Members:**
- View upcoming and completed workouts in "Workout Plans"
- Track personal workout stats in "My Workout Stats"
- Join teams using invite codes or shareable links
- Log weights, reps, RPE, and personal notes for each exercise
- Exercise-specific rest timers during workouts
- Track elapsed time and duration for complete workouts
- Easy-to-use mobile-friendly interface
- View-only access to their team details
- Only see trainings for their team

🔐 **Authorization & Security:**
- JWT-based authentication with HTTP-only cookies
- Secure password hashing with bcryptjs
- Post-registration role selection (Trainer or Member)
- Auto-team creation for trainers
- Protected API routes with role-based access control
- Data isolation - trainers only see their teams
- Members can't create/edit/delete teams or trainings
- Members can't add/remove team members
- Trainers can't log workouts (member-only feature)

🎨 **User Experience:**
- Beautiful, modern UI with Tailwind CSS v4
- Responsive design for all devices
- Dark mode support with localStorage persistence
- Intuitive forms with NumberInput components
- Real-time feedback and validation
- Personalized dashboard with user greeting
- Role-specific navigation (My Team for members)
- Seamless invite link flow with auto-join

## Tech Stack

- **Frontend:** React 18, Next.js 16 (App Router with Turbopack)
- **Styling:** Tailwind CSS v4, class-based dark mode
- **Backend:** Next.js API Routes
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT tokens, bcryptjs for password hashing
- **Icons:** lucide-react
- **UI Components:** shadcn/ui

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
├── app/                           # Next.js App Router
│   ├── auth/
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   └── role-select/          # Post-registration role selection
│   ├── dashboard/                # User dashboard
│   │   ├── log-workout/          # Workout logging interface
│   │   └── my-trainings/         # User workout stats
│   ├── trainings/                # Training management
│   │   ├── create/               # Create training page
│   │   ├── [id]/                 # Training details & edit
│   │   └── page.tsx              # Workouts list
│   ├── teams/                    # Team management
│   │   ├── [id]/                 # Team details, edit, invite
│   │   ├── invite/[id]/          # Invite link handler
│   │   └── page.tsx              # Teams list
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── teams/                # Team management endpoints
│   │   ├── trainings/            # Training endpoints
│   │   ├── users/                # User endpoints
│   │   └── workout-logs/         # Workout logging endpoints
│   └── page.tsx                  # Home page
├── components/                    # Reusable React components
│   ├── ui/                       # shadcn/ui components
│   ├── AddMemberModal.tsx        # Team member invitation modal
│   ├── CreateTeamForm.tsx        # Team creation form
│   ├── CreateTrainingForm.tsx    # Training creation form
│   ├── EditTrainingForm.tsx      # Training edit form
│   ├── Navbar.tsx                # Navigation component
│   ├── ThemeToggle.tsx           # Dark mode toggle
│   ├── TrainingCard.tsx          # Training display card
│   └── WorkoutLogForm.tsx        # Workout logging form
├── contexts/                      # React contexts
│   └── AuthContext.tsx           # Authentication state management
├── models/                        # MongoDB schemas
│   ├── Team.ts
│   ├── Training.ts
│   ├── User.ts
│   └── WorkoutLog.ts
├── lib/
│   ├── db/                       # Database connection
│   ├── auth.ts                   # JWT utilities
│   └── utils/                    # Helper functions
└── globals.css                    # Global styles
```

## Database Models

### User
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  role: 'trainer' | 'member'
  createdAt: Date
  updatedAt: Date
}
```

### Team
```typescript
{
  name: string
  description: string
  trainer: ObjectId (ref: User)
  members: [ObjectId] (ref: User)
  inviteCode: string (unique)
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
    restTime: number (seconds)
    notes: string
  }]
  team: ObjectId (ref: Team)
  scheduledDate: Date
  status: 'scheduled' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}
```

### WorkoutLog
```typescript
{
  training: ObjectId (ref: Training)
  member: ObjectId (ref: User)
  exercises: [{
    exerciseName: string
    setNumber: number
    weight: number
    reps: number
    rpe: number (Rate of Perceived Exertion)
    notes: string
  }]
  completedAt: Date
  elapsedTime: number (seconds)
  createdAt: Date
  updatedAt: Date
}
```

## Key Components

- **Navbar.tsx** - Responsive navigation with role-based links (Dashboard, Workouts, My Team/Teams)
- **TrainingCard.tsx** - Display training with user-specific status and role-based actions
- **CreateTrainingForm.tsx** - Create trainings with exercise-specific rest times
- **EditTrainingForm.tsx** - Edit trainings (trainer only)
- **WorkoutLogForm.tsx** - 3-screen logging interface (pre-workout, set logging, summary)
- **CreateTeamForm.tsx** - Team creation form (trainer only)
- **AddMemberModal.tsx** - Invite members via code or shareable link (2 tabs)
- **ThemeToggle.tsx** - Dark mode toggle with localStorage
- **NumberInput.tsx** - Custom number input with +/- buttons (no native spinners)

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Teams
- `GET /api/teams` - Get user's teams (trainer's owned teams or member's team)
- `POST /api/teams` - Create new team (trainer only, auto-generates invite code)
- `GET /api/teams/:id` - Get team details (requires team membership)
- `PATCH /api/teams/:id` - Update team (trainer only)
- `DELETE /api/teams/:id` - Delete team (trainer only)
- `POST /api/teams/:id/invite-code` - Generate new invite code (trainer only)
- `POST /api/teams/:id/join` - Join team via invite link (auto-join for authenticated users)
- `DELETE /api/teams/:id/members/:memberId` - Remove team member (trainer only)
- `POST /api/teams/join` - Join team with invite code

### Trainings
- `GET /api/trainings` - Get trainings for user's teams (filtered by access)
- `POST /api/trainings` - Create training (trainer only, validates team ownership)
- `GET /api/trainings/:id` - Get training details (requires team access)
- `PATCH /api/trainings/:id` - Update training (trainer only)
- `DELETE /api/trainings/:id` - Delete training (trainer only)
- `GET /api/trainings/:id/logs` - Get training workout logs (requires team access)
- `POST /api/trainings/:id/logs` - Save workout log (members only, validates team membership)

### Users
- `GET /api/users` - Get all users (select _id and name)

### Workout Logs
- `GET /api/workout-logs` - Get current user's workout logs

## User Flows

### New User Registration & Team Selection
1. User registers → Auto-redirected to role selection page
2. **If Trainer:** Team auto-created → Directed to dashboard
3. **If Member:** Invite code input modal shown → Enter code to join team → Dashboard

### Trainer Inviting Members
1. Go to team details page
2. Click "Add Member" button
3. Choose:
   - **Option 1:** Generate & copy invite code (member enters code on role selection)
   - **Option 2:** Copy shareable link (new users register then auto-join; existing users auto-join)

### Member Logging Workout
1. Go to "Workout Plans" (navbar)
2. Click "Log Workout" on non-completed training (trainers don't see this button)
3. **Screen 1:** Pre-workout summary (review exercise list, start timer)
4. **Screen 2:** Set-by-set logging (weight, reps, RPE for each set)
   - Exercise-specific rest timer between sets (configured per exercise)
   - Total elapsed time tracker
   - Navigation between exercises
5. **Screen 3:** Summary (review all logged data, add notes, confirm)
6. Redirected to workout stats page

### Member Viewing Team
1. Click "My Team" in navbar (instead of "Teams")
2. Directly opens team details page
3. View-only access:
   - See team name and description
   - View trainer information
   - See list of team members
   - No edit/delete/add member buttons visible

## UI Components

Uses shadcn/ui for professional, accessible components:
- Button, Card, Input, Label, Form
- Select, Tabs, Badge, Alert
- Dialog, Dropdown Menu
- NumberInput (custom component with +/- buttons)

## Features Implemented

✅ User registration and login with JWT authentication
✅ Post-registration role selection (Trainer/Member)
✅ Auto-team creation for trainers
✅ **Authorization & Data Isolation:**
  - Trainers only see their own teams and trainings
  - Members only see their team's trainings
  - Role-based UI (different buttons/actions per role)
  - Protected API routes with ownership validation
✅ Invite code system (generate, validate, join)
✅ Shareable invite links with auto-join
✅ Team management (create, edit, delete - trainer only)
✅ Add/remove team members (trainer only)
✅ Training creation with exercise details
✅ Exercise-specific rest time configuration
✅ Complete workout logging MVP (members only)
✅ RPE tracking and weight/reps logging
✅ Personal workout stats and completion tracking
✅ User-specific training status (Completed vs Scheduled)
✅ Dark mode support with localStorage
✅ Responsive mobile-friendly design
✅ Protected API routes with JWT
✅ Role-specific navigation (My Team for members, Teams for trainers)
✅ Workout Plans accessible from navbar
✅ Trainer redirect prevention from logging pages
✅ Member redirect from teams list to team details

## Next Steps (Future Enhancements)

- [ ] Workout performance analytics and charts
- [ ] PR (Personal Record) tracking
- [ ] Exercise form videos/photos
- [ ] Social features (comparisons, leaderboards)
- [ ] Email notifications
- [ ] Workout export (PDF)
- [ ] Advanced filtering and search
- [ ] Batch member management
- [ ] Team invitations history

## Environment Variables

Create `.env.local` file:
```
MONGODB_URI=mongodb://localhost:27017/team-training
JWT_SECRET=your-secret-key-change-in-production
```

## Seeding Test Data

Run the seed script to populate the database with test data:

```bash
node seed.js
```

This creates:
- 1 Trainer: `trainer@test.com` / `trainer123`
- 2 Members: `sarah@test.com` and `mike@test.com` / `member123`
- 1 Team: CrossFit Elite (with unique invite code)
- 3 Trainings: 2 scheduled, 1 completed
- 2 Workout Logs: Sample logs with RPE and timing data

All test data includes:
- Exercise-specific rest times
- Invite codes for team joining
- Proper authorization setup (trainer owns team, members are team members)
- Realistic workout data with weights, reps, and RPE values

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT - Use freely for personal or commercial projects

---

Built with ❤️ for fitness enthusiasts
