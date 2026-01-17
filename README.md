# TeamTrainer - Fitness Training Platform

A comprehensive, modern platform for fitness team management, workout planning, and progress tracking. Designed for trainers to lead teams and members to log their fitness journey.

## 🎯 Overview

TeamTrainer is a full-stack web application that bridges the gap between trainers and their team members. Trainers can create structured workout programs, manage multiple teams, and monitor progress. Members can log workouts, track personal stats, and stay connected with their team's training schedule.

## ✨ Core Features

### 👨‍🏫 For Trainers
- **Team Management**
  - Create and manage unlimited teams
  - Add/remove members with ease
  - Promote members to Coach role for delegated training management
  - Generate unique invite codes and shareable links
  - View team member workout logs and activity
  
- **Workout Programming**
  - Create detailed training sessions with multiple exercises
  - Define sets, reps, weights, rest periods, and notes per exercise
  - Schedule workouts for specific dates
  - Edit and delete trainings
  - View team completion rates
  
- **Activity Monitoring**
  - Interactive calendar showing team member activity
  - Daily breakdown of members who trained
  - Click any active day to see detailed member logs
  - Team-wide activity dashboard

### 🏋️ For Members
- **Workout Tracking**
  - View all scheduled and completed workouts
  - Log weights, reps, RPE (Rate of Perceived Exertion), and notes for each set
  - Exercise-specific rest timers guide recovery between sets
  - Real-time elapsed time tracking during workouts
  - Three-screen workout logging flow (overview → set logging → summary)
  
- **Personal Stats**
  - "My Workout Stats" page with complete training history
  - Workout completion streak counter with 🔥 indicator
  - Activity calendar highlighting training days
  - Filter workouts by scheduled/completed status
  
- **Team Integration**
  - Join teams via invite code or shareable link
  - View team members and their roles
  - Access team details and trainer information
  - See scheduled vs. completed training status

### 🎖️ For Coaches (Hybrid Role)
- **Member + Training Management**
  - All member permissions (log workouts, view stats)
  - Create, edit, and delete trainings like a trainer
  - Cannot manage teams (trainer-only privilege)
  - Perfect for assistant coaches or senior athletes
  - Promoted by trainers on the team members page

### 🔐 Security & Authorization
- JWT-based authentication with HTTP-only cookies
- Secure password hashing with bcryptjs
- Role-based access control (Trainer, Coach, Member)
- Protected API routes with ownership validation
- Data isolation - users only see their teams' data
- Post-registration role selection flow
- Trainer-only team management
- Member/Coach workout logging restrictions

### 🎨 User Experience
- **Modern UI/UX**
  - Clean, professional interface built with Tailwind CSS v4
  - Fully responsive design - optimized for mobile, tablet, and desktop
  - Dark mode with system preference detection and manual toggle
  - Smooth transitions and hover effects
  - Role-specific dashboards and navigation
  
- **Mobile-First Design**
  - Touch-optimized buttons and forms
  - Responsive card layouts that stack on mobile
  - Mobile-friendly navigation
  - Optimized button arrangements for small screens
  
- **Smart Features**
  - Auto-redirect for users without teams
  - Seamless invite link flow for new users
  - Real-time form validation
  - Loading states and error handling
  - Role badges (Coach/Member) on team member lists
  - Personalized greetings and quick actions

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router with Turbopack)
- **UI Library:** React 18
- **Styling:** Tailwind CSS v4
- **Theme:** Class-based dark mode with system detection
- **Icons:** Lucide React
- **UI Components:** shadcn/ui (radix-ui primitives)
- **Date Utilities:** date-fns

### Backend
- **API:** Next.js API Routes
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Validation:** Built-in with Mongoose schemas

### Development
- **Language:** TypeScript
- **Package Manager:** npm
- **Linting:** ESLint
- **Code Quality:** Prettier (via Tailwind plugin)

## 🚀 Getting Started

### Prerequisites

- **Node.js:** 18.x or higher
- **Package Manager:** npm or yarn
- **Database:** MongoDB (local installation or cloud instance via MongoDB Atlas)

### Installation Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd team-training
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   
   Add your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/team-training
   JWT_SECRET=your-super-secret-key-change-this-in-production
   ```
   
   > **Note:** For production, use a strong, randomly generated JWT secret

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### First-Time Setup

1. Register a new account
2. Select your role (Trainer or Member)
3. **If Trainer:** A team will be auto-created for you
4. **If Member:** Enter an invite code from your trainer
5. Start creating workouts or logging training sessions!

### Optional: Seed the Database

If you want sample data for testing:
```bash
npm run seed
```
This will create sample users, teams, trainings, and workout logs.

## 📁 Project Structure

```
team-training/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # Backend API routes
│   │   │   ├── activity/             # Activity data & calendar endpoints
│   │   │   ├── auth/                 # Authentication (login, register, logout, me)
│   │   │   ├── teams/                # Team CRUD & member management
│   │   │   ├── trainings/            # Training CRUD & workout logs
│   │   │   ├── users/                # User listing
│   │   │   └── workout-logs/         # User workout log retrieval
│   │   │
│   │   ├── auth/                     # Authentication pages
│   │   │   ├── login/                # Login page
│   │   │   ├── register/             # Registration page
│   │   │   └── role-select/          # Post-registration role selection
│   │   │
│   │   ├── dashboard/                # Main user dashboard
│   │   │   ├── activity/[date]/      # Daily team activity breakdown
│   │   │   ├── log-workout/[id]/     # 3-screen workout logging flow
│   │   │   ├── my-trainings/         # Member workout stats & history
│   │   │   │   └── [logId]/          # Individual workout log details
│   │   │   └── page.tsx              # Dashboard home
│   │   │
│   │   ├── teams/                    # Team management
│   │   │   ├── [id]/                 # Team details, edit, member management
│   │   │   │   ├── edit/             # Edit team page
│   │   │   │   └── members/[memberId]/ # Member workout logs
│   │   │   ├── invite/[id]/          # Invite link handler
│   │   │   └── page.tsx              # Teams list
│   │   │
│   │   ├── trainings/                # Workout planning
│   │   │   ├── [id]/                 # Training details & edit
│   │   │   │   └── edit/             # Edit training page
│   │   │   ├── create/               # Create new training
│   │   │   └── page.tsx              # All workouts list
│   │   │
│   │   ├── globals.css               # Global styles & Tailwind imports
│   │   ├── layout.tsx                # Root layout with theme provider
│   │   └── page.tsx                  # Landing page
│   │
│   ├── components/                   # Reusable React components
│   │   ├── ui/                       # shadcn/ui primitives
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── date-picker.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── number-input.tsx      # Custom component with +/- buttons
│   │   │   ├── popover.tsx
│   │   │   ├── select.tsx
│   │   │   └── tabs.tsx
│   │   │
│   │   ├── ActivityChart.tsx         # Calendar & activity visualization
│   │   ├── AddMemberModal.tsx        # Team member invite modal
│   │   ├── CreateTeamForm.tsx        # Team creation form
│   │   ├── CreateTrainingForm.tsx    # Training creation with exercises
│   │   ├── EditTrainingForm.tsx      # Training editing form
│   │   ├── Navbar.tsx                # Main navigation with role-based links
│   │   ├── ThemeProvider.tsx         # Dark mode context provider
│   │   ├── ThemeToggle.tsx           # Dark/light mode switcher
│   │   ├── TrainingCard.tsx          # Training display with actions
│   │   └── WorkoutLogForm.tsx        # Multi-step workout logging
│   │
│   ├── contexts/                     # React Context providers
│   │   └── AuthContext.tsx           # User authentication state
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── db/
│   │   │   ├── mongodb.ts            # MongoDB connection handler
│   │   │   └── seed.ts               # Database seeding script
│   │   ├── utils/
│   │   │   └── helpers.ts            # Utility functions
│   │   ├── auth.ts                   # JWT sign/verify utilities
│   │   └── utils.ts                  # Class name merger (cn)
│   │
│   └── models/                       # Mongoose schemas & models
│       ├── Team.ts                   # Team model
│       ├── Training.ts               # Training/workout model
│       ├── User.ts                   # User model
│       └── WorkoutLog.ts             # Workout log model
│
├── public/                           # Static assets
├── .env.local                        # Environment variables (git-ignored)
├── .env.example                      # Example env file
├── components.json                   # shadcn/ui configuration
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies & scripts
└── README.md                         # This file
```

## 📊 Database Models

### User
```typescript
{
  name: string                      // User's full name
  email: string                     // Unique email address
  password: string                  // Hashed with bcryptjs
  role: 'trainer' | 'coach' | 'member'  // User role
  createdAt: Date                   // Account creation timestamp
  updatedAt: Date                   // Last update timestamp
}
```

**Roles:**
- **Trainer:** Creates teams, manages members, creates trainings, promotes coaches
- **Coach:** Creates trainings, logs workouts (promoted by trainer)
- **Member:** Logs workouts, views stats (default role)

### Team
```typescript
{
  name: string                      // Team name
  description: string               // Team description/purpose
  trainer: ObjectId                 // Reference to User (trainer only)
  members: ObjectId[]               // Array of User references
  inviteCode: string                // Unique 8-char invite code
  createdAt: Date
  updatedAt: Date
}
```

**Features:**
- Auto-generated unique invite codes
- Trainer ownership validation
- Member role stored on User model
- Supports multiple members per team

### Training
```typescript
{
  title: string                     // Workout name
  description: string               // Workout description/goals
  exercises: [{
    name: string                    // Exercise name
    sets: number                    // Number of sets
    reps: string                    // Target reps (e.g., "8-12")
    restTime: number                // Rest between sets (seconds)
    notes: string                   // Exercise-specific instructions
  }]
  team: ObjectId                    // Reference to Team
  scheduledDate: Date               // When workout is scheduled
  status: 'scheduled' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}
```

**Authorization:**
- Trainers and coaches can create/edit/delete
- Members can view and log
- Team ownership validated on all operations

### WorkoutLog
```typescript
{
  training: ObjectId                // Reference to Training
  member: ObjectId                  // Reference to User (member)
  exercises: [{
    exerciseName: string            // Name of exercise
    setNumber: number               // Set number (1, 2, 3...)
    weight: number                  // Weight used
    reps: number                    // Reps completed
    rpe: number                     // Rate of Perceived Exertion (1-10)
    notes: string                   // Set-specific notes
  }]
  completedAt: Date                 // When workout finished
  elapsedTime: number               // Total workout duration (seconds)
  createdAt: Date
  updatedAt: Date
}
```

**Features:**
- Detailed set-by-set tracking
- RPE (Rate of Perceived Exertion) scoring
- Elapsed time tracking
- Exercise-specific notes

## 🧩 Key Components

### UI Components

**Navbar** (`Navbar.tsx`)
- Role-based navigation links
- Trainer: Dashboard, Workouts, Teams
- Member/Coach: Dashboard, Workouts, My Team
- Theme toggle and logout button
- Responsive mobile menu

**TrainingCard** (`TrainingCard.tsx`)
- Displays training with status badge (Scheduled/Completed)
- Role-based action buttons (Edit/Delete for trainer/coach)
- "Log Workout" button for incomplete trainings
- Responsive button layout (stacks on mobile)
- Shows scheduled date and exercise count

**ActivityChart** (`ActivityChart.tsx`)
- Interactive calendar visualization
- Color-coded activity:
  - Blue: Completed workout
  - Light blue: Scheduled but not completed
  - Neutral: No training
- Trainer view: Click days to see team member breakdown
- Member view: Streak counter with fire emoji
- Dark mode optimized colors

**WorkoutLogForm** (`WorkoutLogForm.tsx`)
- Three-screen workout logging flow
- Real-time elapsed timer
- Exercise-specific rest timers
- Set-by-set input forms
- RPE tracking (1-10 scale)
- Summary review before submission

**CreateTrainingForm** (`CreateTrainingForm.tsx`)
- Dynamic exercise list management
- Add/remove exercises
- Date picker for scheduling
- NumberInput components for sets/rest
- Form validation

**AddMemberModal** (`AddMemberModal.tsx`)
- Tabbed interface (Invite Link / Invite Code)
- One-click link copying
- Generate new invite codes
- Shareable link generation

### UI Primitives (shadcn/ui)

- **Button** - Multiple variants (default, outline, destructive, ghost)
- **Card** - Container with header, content, footer sections
- **Dialog** - Modal confirmations (delete, remove member)
- **Input** - Text inputs with dark mode support
- **Select** - Dropdown selections
- **Badge** - Status indicators (Scheduled, Completed, Coach, Member)
- **Tabs** - Tabbed interfaces (invite methods)
- **Calendar** - Date picker component
- **NumberInput** - Custom +/- button inputs (removes native spinners)

### Context Providers

**AuthContext** (`AuthContext.tsx`)
- Global user authentication state
- Auto-fetches user on mount
- Provides `user`, `loading`, and `setUser`
- Used throughout app for role checks

**ThemeProvider** (`ThemeProvider.tsx`)
- Dark mode state management
- localStorage persistence
- System preference detection
- Applies theme class to document

## 🎨 Styling & Theming

### Dark Mode Implementation
- Class-based dark mode (`dark:` prefix)
- System preference detection on first visit
- Manual toggle persists to localStorage
- Neutral colors in dark mode for inactive calendar cells
- Optimized contrast for accessibility

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px)
- Stacking cards on mobile
- Horizontal layouts on desktop
- Touch-optimized button sizes

### Color Palette
- **Primary:** Blue (#2563eb) - Actions, links, active states
- **Success:** Green - Completed status
- **Warning:** Orange/Red - Streak counter
- **Destructive:** Red - Delete actions
- **Muted:** Slate - Secondary text, borders
- **Background:** White/Slate-950 (light/dark)

## 🔌 API Reference

### Authentication Endpoints

#### `POST /api/auth/register`
Register a new user account.
```json
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

// Response
{
  "message": "User registered successfully",
  "userId": "..."
}
```

#### `POST /api/auth/login`
Authenticate and receive JWT token.
```json
// Request
{
  "email": "john@example.com",
  "password": "securepassword123"
}

// Response - Sets HTTP-only cookie
{
  "message": "Login successful",
  "user": { "_id": "...", "name": "John Doe", "email": "...", "role": "member" }
}
```

#### `POST /api/auth/logout`
Clear authentication token.

#### `GET /api/auth/me`
Get current authenticated user.

---

### Team Endpoints

#### `GET /api/teams`
Get user's teams (trainer's owned teams or member's team).

#### `POST /api/teams`
Create new team (trainer only).
```json
{
  "name": "Elite Fitness Team",
  "description": "Advanced strength training group"
}
```

#### `GET /api/teams/:id`
Get team details with populated members and roles.

#### `PATCH /api/teams/:id`
Update team (trainer only).

#### `DELETE /api/teams/:id`
Delete team (trainer only).

#### `POST /api/teams/:id/invite-code`
Generate new invite code (trainer only).

#### `POST /api/teams/:id/join`
Join team via invite link.

#### `POST /api/teams/join`
Join team with invite code.

#### `DELETE /api/teams/:id/members/:memberId`
Remove member from team (trainer only).

#### `PATCH /api/teams/:id/members/:memberId`
Update member role (trainer only).
```json
{
  "role": "coach"  // or "member"
}
```

---

### Training Endpoints

#### `GET /api/trainings`
Get trainings for user's teams.

#### `POST /api/trainings`
Create training (trainer/coach only).
```json
{
  "title": "Chest & Triceps Day",
  "description": "Hypertrophy focus",
  "teamId": "...",
  "scheduledDate": "2026-01-20",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": 4,
      "reps": "8-10",
      "restTime": 120,
      "notes": "Focus on form"
    }
  ]
}
```

#### `GET /api/trainings/:id`
Get training details.

#### `PATCH /api/trainings/:id`
Update training (trainer/coach only).

#### `DELETE /api/trainings/:id`
Delete training (trainer/coach only).

#### `GET /api/trainings/:id/logs`
Get all logs for a training.

#### `POST /api/trainings/:id/logs`
Save workout log (members/coaches only).

---

### Activity Endpoints

#### `GET /api/activity`
Get activity data for calendar.
- **Trainer:** Returns member activity grouped by date and team
- **Member/Coach:** Returns personal workout completion dates

#### `GET /api/activity/:date`
Get detailed activity for specific date (trainer only).

---

### Workout Log Endpoints

#### `GET /api/workout-logs`
Get current user's workout logs with populated training data.

#### `GET /api/teams/:teamId/members/:memberId/logs`
Get specific member's logs (trainer only).

## 👥 User Flows

### New User Registration

**Trainer Flow:**
1. Navigate to `/auth/register`
2. Fill out registration form (name, email, password)
3. Redirected to role selection page
4. Select "Trainer" role
5. Team automatically created with user as trainer
6. Redirected to dashboard with quick actions (Create Training, Manage Teams)

**Member Flow:**
1. Navigate to `/auth/register`
2. Fill out registration form
3. Redirected to role selection page
4. Select "Member" role
5. Modal appears requesting invite code
6. Enter invite code from trainer
7. Automatically joins team
8. Redirected to dashboard with personal stats and scheduled workouts

**Invited User Flow (via link):**
1. Click invite link: `/teams/invite/:teamId`
2. If not logged in, shown registration form
3. Auto-registered as "Member"
4. Automatically joins team
5. Redirected to dashboard - ready to train!

---

### Trainer Inviting Members

**Method 1: Invite Code**
1. Navigate to team details page
2. Click "Add Member" button
3. Switch to "Invite Code" tab
4. Click "Generate New Code" (if needed)
5. Copy the 8-character code
6. Share code with member (text, email, etc.)
7. Member enters code during role selection

**Method 2: Shareable Link**
1. Navigate to team details page
2. Click "Add Member" button
3. "Invite Link" tab (default)
4. Click "Copy Link"
5. Share link with potential member
6. New users automatically register as members and join team
7. Existing users automatically join and redirect to dashboard

---

### Trainer Promoting a Coach

1. Navigate to team details page (`/teams/:id`)
2. Find member in the team members list
3. Click "Promote to Coach" button
4. Member's role updates to Coach
5. Coach icon (🎖️) appears next to their name
6. Coach can now create, edit, and delete trainings
7. To demote: Click "Demote to Member" button

---

### Creating a Workout (Trainer/Coach)

1. Navigate to dashboard or trainings page
2. Click "Create Training" or "Create New Training"
3. Fill out training details:
   - Title (e.g., "Leg Day")
   - Description
   - Scheduled date (calendar picker)
4. Add exercises with "Add Exercise" button:
   - Exercise name
   - Sets (use +/- buttons)
   - Reps (e.g., "8-12")
   - Rest time (seconds, use +/- buttons)
   - Notes (optional)
5. Click "Create Training"
6. Training appears in workout plans list
7. Members can now see and log this workout

---

### Logging a Workout (Member/Coach)

**Step 1: Pre-Workout Overview**
1. Navigate to "Workout Plans" via navbar
2. Find scheduled workout (blue "Scheduled" badge)
3. Click "Log Workout" button
4. Review exercise list and training details
5. Click "Start Workout" - timer begins!

**Step 2: Set-by-Set Logging**
1. For each exercise, log each set:
   - Weight (kg/lbs)
   - Reps completed
   - RPE (1-10 scale)
   - Optional notes
2. Click "Next Set" to proceed
3. Exercise-specific rest timer counts down
4. Navigate between exercises with Previous/Next buttons
5. See total elapsed time at top
6. Click "Finish Workout" when complete

**Step 3: Review & Submit**
1. Review all logged sets in summary table
2. Check elapsed time and completion date
3. Add final workout notes (optional)
4. Click "Save Workout Log"
5. Redirected to "My Workout Stats" page
6. Workout marked as completed (green badge)
7. Activity calendar updates with new training day

---

### Viewing Team Activity (Trainer)

1. Navigate to dashboard
2. Scroll to "Recent Activity" calendar
3. Blue highlights show days when members trained
4. Hover over a day to see member count
5. Click a day with activity
6. Opens detailed breakdown:
   - List of members who trained
   - Training they completed
   - Link to view their workout log details
7. Click "View Log" to see set-by-set data

---

### Viewing Personal Stats (Member/Coach)

1. Click "My Workout Stats" card on dashboard
2. View complete workout history:
   - Training name and date
   - Completion status
   - Link to view log details
3. See current streak (🔥 indicator)
4. Activity calendar shows all training days
5. Click any log to view set-by-set breakdown
6. Filter by "All", "Scheduled", or "Completed"

---

### Member Viewing Team

1. Click "My Team" in navbar (members see this instead of "Teams")
2. Opens team details page directly
3. View team information:
   - Team name and description
   - Trainer name and email
   - List of all team members with roles (Member/Coach icons)
4. No edit/delete/add member buttons (view-only)
5. Cannot manage team settings (trainer-only privilege)

## 🧩 Key Components

### UI Components

**Navbar** (`Navbar.tsx`)
- Role-based navigation links
- Trainer: Dashboard, Workouts, Teams
- Member/Coach: Dashboard, Workouts, My Team
- Theme toggle and logout button
- Responsive mobile menu

**TrainingCard** (`TrainingCard.tsx`)
- Displays training with status badge (Scheduled/Completed)
- Role-based action buttons (Edit/Delete for trainer/coach)
- "Log Workout" button for incomplete trainings
- Responsive button layout (stacks on mobile)
- Shows scheduled date and exercise count

**ActivityChart** (`ActivityChart.tsx`)
- Interactive calendar visualization
- Color-coded activity:
  - Blue: Completed workout
  - Light blue: Scheduled but not completed
  - Neutral: No training
- Trainer view: Click days to see team member breakdown
- Member view: Streak counter with fire emoji
- Dark mode optimized colors

**WorkoutLogForm** (`WorkoutLogForm.tsx`)
- Three-screen workout logging flow
- Real-time elapsed timer
- Exercise-specific rest timers
- Set-by-set input forms
- RPE tracking (1-10 scale)
- Summary review before submission

**CreateTrainingForm** (`CreateTrainingForm.tsx`)
- Dynamic exercise list management
- Add/remove exercises
- Date picker for scheduling
- NumberInput components for sets/rest
- Form validation

**AddMemberModal** (`AddMemberModal.tsx`)
- Tabbed interface (Invite Link / Invite Code)
- One-click link copying
- Generate new invite codes
- Shareable link generation

### UI Primitives (shadcn/ui)

- **Button** - Multiple variants (default, outline, destructive, ghost)
- **Card** - Container with header, content, footer sections
- **Dialog** - Modal confirmations (delete, remove member)
- **Input** - Text inputs with dark mode support
- **Select** - Dropdown selections
- **Badge** - Status indicators (Scheduled, Completed, Coach, Member)
- **Tabs** - Tabbed interfaces (invite methods)
- **Calendar** - Date picker component
- **NumberInput** - Custom +/- button inputs (removes native spinners)

### Context Providers

**AuthContext** (`AuthContext.tsx`)
- Global user authentication state
- Auto-fetches user on mount
- Provides `user`, `loading`, and `setUser`
- Used throughout app for role checks

**ThemeProvider** (`ThemeProvider.tsx`)
- Dark mode state management
- localStorage persistence
- System preference detection
- Applies theme class to document

## 🎨 Styling & Theming

### Dark Mode Implementation
- Class-based dark mode (`dark:` prefix)
- System preference detection on first visit
- Manual toggle persists to localStorage
- Neutral colors in dark mode for inactive calendar cells
- Optimized contrast for accessibility

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px)
- Stacking cards on mobile
- Horizontal layouts on desktop
- Touch-optimized button sizes

### Color Palette
- **Primary:** Blue (#2563eb) - Actions, links, active states
- **Success:** Green - Completed status
- **Warning:** Orange/Red - Streak counter
- **Destructive:** Red - Delete actions
- **Muted:** Slate - Secondary text, borders
- **Background:** White/Slate-950 (light/dark)

## 🔒 Security Features

### Authentication
- **JWT Tokens:** Secure, stateless authentication
- **HTTP-Only Cookies:** Prevents XSS attacks
- **Password Hashing:** bcryptjs with salt rounds
- **Token Expiration:** Configurable expiry (default: 7 days)
- **Secure Password Requirements:** Minimum length enforcement

### Authorization
- **Role-Based Access Control (RBAC):**
  - Trainer: Full team and training management
  - Coach: Training management + member workout logging
  - Member: Workout logging only
- **Ownership Validation:** Users can only modify their own resources
- **Team Membership Checks:** API validates user belongs to team
- **Protected Routes:** Middleware verifies JWT on all protected endpoints

### Data Isolation
- Trainers only see teams they own
- Members only see their team and trainings
- Workout logs filtered by user and team membership
- API queries filtered by user context

### Best Practices
- Environment variables for secrets
- No passwords in responses
- Sanitized error messages (no stack traces in production)
- Unique constraint on emails
- Mongoose schema validation

---

## 🚀 Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET` in environment variables
- [ ] Use MongoDB Atlas or production database
- [ ] Enable HTTPS for secure cookie transmission
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS if needed
- [ ] Set up database backups
- [ ] Monitor error logs
- [ ] Enable rate limiting (recommended)

### Environment Variables

```env
# Required
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/teamtrainer
JWT_SECRET=your-256-bit-secret-key-here

# Optional
NODE_ENV=production
PORT=3000
```

### Build Commands

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel (recommended for Next.js)
vercel deploy
```

---

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run dev:regular  # Start dev server without Turbopack

# Production
npm run build        # Build optimized production bundle
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier (if configured)

# Database
npm run seed         # Seed database with sample data
```

---

## 🛣️ Roadmap & Future Enhancements

### Short-term (v1.1)
- [ ] Exercise library with presets
- [ ] Workout templates
- [ ] Personal record (PR) tracking
- [ ] Progress photos upload
- [ ] Enhanced member search/filter on teams

### Mid-term (v1.2)
- [ ] Performance analytics dashboard
- [ ] Workout performance charts (weight progression, volume)
- [ ] Email notifications for scheduled workouts
- [ ] Team leaderboards and challenges
- [ ] Exercise form videos/GIFs
- [ ] Export workout logs to PDF

### Long-term (v2.0)
- [ ] Mobile app (React Native)
- [ ] Social features (member-to-member messaging)
- [ ] Nutrition tracking integration
- [ ] Advanced workout periodization
- [ ] Multi-language support
- [ ] Custom exercise database with images
- [ ] Third-party integrations (Strava, Fitbit)

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling (no inline styles)
- Add comments for complex logic
- Test on mobile and desktop
- Ensure dark mode compatibility

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful, accessible UI components
- **Tailwind CSS** for utility-first styling
- **Next.js** team for the amazing framework
- **MongoDB** for flexible database solution
- **Lucide** for clean, modern icons

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the user flows and API reference above

---

**Built with ❤️ for fitness teams and enthusiasts**

*Last updated: January 2026*
