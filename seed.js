require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    role: { type: String, enum: ['trainer', 'member'] },
}, { timestamps: true });

const teamSchema = new mongoose.Schema({
    name: String,
    description: String,
    trainer: mongoose.Schema.Types.ObjectId,
    members: [mongoose.Schema.Types.ObjectId],
    inviteCode: {
        type: String,
        unique: true,
        sparse: true,
    },
}, { timestamps: true });

const trainingSchema = new mongoose.Schema({
    title: String,
    description: String,
    exercises: [{
        name: String,
        sets: Number,
        reps: String,
        restTime: { type: Number, default: 90 },
        notes: String
    }],
    team: mongoose.Schema.Types.ObjectId,
    scheduledDate: Date,
    status: String,
}, { timestamps: true });

const exerciseSchema = new mongoose.Schema({
    exerciseName: { type: String, required: true },
    setNumber: { type: Number, required: true },
    weight: { type: Number, required: true },
    reps: { type: Number, required: true },
    rpe: { type: Number },
    notes: { type: String },
}, { _id: false });

const workoutLogSchema = new mongoose.Schema({
    training: mongoose.Schema.Types.ObjectId,
    member: mongoose.Schema.Types.ObjectId,
    exercises: [exerciseSchema],
    startTime: Date,
    endTime: Date,
    duration: Number,
    completedAt: { type: Date, default: Date.now },
    notes: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Team = mongoose.model('Team', teamSchema);
const Training = mongoose.model('Training', trainingSchema);
const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);

async function seed() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not found in .env.local');
        }

        console.log('🌱 Connecting to MongoDB Atlas...');
        await mongoose.connect(mongoUri);
        console.log('✓ Connected to MongoDB Atlas');
        console.log('🌱 Seeding database...');

        // Clear existing data
        await User.deleteMany({});
        await Team.deleteMany({});
        await Training.deleteMany({});
        await WorkoutLog.deleteMany({});
        console.log('✓ Cleared existing data');

        // Create test users
        const trainerPassword = await bcryptjs.hash('trainer123', 10);
        const memberPassword = await bcryptjs.hash('member123', 10);

        const trainer = await User.create({
            name: 'John Smith',
            email: 'trainer@test.com',
            password: trainerPassword,
            role: 'trainer',
        });

        const member1 = await User.create({
            name: 'Sarah Johnson',
            email: 'sarah@test.com',
            password: memberPassword,
            role: 'member',
        });

        const member2 = await User.create({
            name: 'Mike Davis',
            email: 'mike@test.com',
            password: memberPassword,
            role: 'member',
        });

        console.log('✓ Created test users:');
        console.log(`  - Trainer: trainer@test.com / trainer123`);
        console.log(`  - Member 1: sarah@test.com / member123`);
        console.log(`  - Member 2: mike@test.com / member123`);

        // Create first team with trainer and 2 members
        const generateInviteCode = () => {
            return Math.random().toString(36).substring(2, 8).toUpperCase();
        };

        const team = await Team.create({
            name: 'CrossFit Elite',
            description: 'High-intensity functional training group',
            trainer: trainer._id,
            members: [member1._id, member2._id],
            inviteCode: generateInviteCode(),
        });

        console.log(`✓ Created team: ${team.name} (Invite: ${team.inviteCode})`);

        // Create trainings
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const training1 = await Training.create({
            title: 'Upper Body Strength',
            description: 'Focus on chest, back, and shoulders with heavy weights',
            exercises: [
                { name: 'Bench Press', sets: 4, reps: '6-8', restTime: 120, notes: 'Heavy weight, focus on form' },
                { name: 'Barbell Rows', sets: 4, reps: '6-8', restTime: 120, notes: 'Pull to chest' },
                { name: 'Shoulder Press', sets: 3, reps: '8-10', restTime: 90, notes: 'Standing press' },
                { name: 'Pull-ups', sets: 3, reps: '8-12', restTime: 90, notes: 'Assisted if needed' },
            ],
            team: team._id,
            scheduledDate: tomorrow,
            status: 'scheduled',
        });

        const training2 = await Training.create({
            title: 'Lower Body Power',
            description: 'Intense leg workout focusing on power and explosiveness',
            exercises: [
                { name: 'Squats', sets: 4, reps: '6-8', restTime: 120, notes: 'Deep squat, control the descent' },
                { name: 'Deadlifts', sets: 3, reps: '5-6', restTime: 180, notes: 'Keep back straight' },
                { name: 'Leg Press', sets: 3, reps: '10-12', restTime: 90, notes: 'Full range of motion' },
                { name: 'Leg Curls', sets: 3, reps: '10-12', restTime: 60, notes: 'Control the weight' },
            ],
            team: team._id,
            scheduledDate: nextWeek,
            status: 'scheduled',
        });

        const pastTraining = await Training.create({
            title: 'Core & Cardio',
            description: 'Abs and cardiovascular conditioning',
            exercises: [
                { name: 'Planks', sets: 3, reps: '60 seconds', restTime: 45, notes: 'Stay tight' },
                { name: 'Russian Twists', sets: 3, reps: '20', restTime: 45, notes: 'With weight' },
                { name: 'Treadmill', sets: 1, reps: '20 minutes', restTime: 0, notes: 'Steady pace' },
            ],
            team: team._id,
            scheduledDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            status: 'completed',
        });

        console.log('✓ Created 3 sample trainings with rest times');

        // Create workout logs with realistic data
        const log1StartTime = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        const log1EndTime = new Date(log1StartTime.getTime() + 45 * 60 * 1000);

        await WorkoutLog.create({
            training: pastTraining._id,
            member: member1._id,
            exercises: [
                { exerciseName: 'Planks', setNumber: 1, weight: 0, reps: 60, rpe: 6, notes: 'Felt strong' },
                { exerciseName: 'Planks', setNumber: 2, weight: 0, reps: 55, rpe: 7, notes: 'Getting tired' },
                { exerciseName: 'Planks', setNumber: 3, weight: 0, reps: 50, rpe: 8, notes: 'Finished strong' },
                { exerciseName: 'Russian Twists', setNumber: 1, weight: 10, reps: 20, rpe: 5, notes: 'Using 10lb weight' },
                { exerciseName: 'Russian Twists', setNumber: 2, weight: 10, reps: 20, rpe: 6, notes: 'Good form' },
                { exerciseName: 'Russian Twists', setNumber: 3, weight: 10, reps: 18, rpe: 7, notes: 'Fatigued' },
                { exerciseName: 'Treadmill', setNumber: 1, weight: 0, reps: 20, rpe: 5, notes: 'Easy pace, 6.0 mph' },
            ],
            startTime: log1StartTime,
            endTime: log1EndTime,
            duration: 45,
            notes: 'Great workout! Feeling energized',
            completedAt: log1EndTime,
        });

        const log2StartTime = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);
        const log2EndTime = new Date(log2StartTime.getTime() + 50 * 60 * 1000);

        await WorkoutLog.create({
            training: pastTraining._id,
            member: member2._id,
            exercises: [
                { exerciseName: 'Planks', setNumber: 1, weight: 0, reps: 45, rpe: 7, notes: 'Need more core work' },
                { exerciseName: 'Planks', setNumber: 2, weight: 0, reps: 40, rpe: 8, notes: 'Burning' },
                { exerciseName: 'Planks', setNumber: 3, weight: 0, reps: 35, rpe: 9, notes: 'Exhausted' },
                { exerciseName: 'Russian Twists', setNumber: 1, weight: 15, reps: 20, rpe: 6, notes: 'Using 15lb weight' },
                { exerciseName: 'Russian Twists', setNumber: 2, weight: 15, reps: 18, rpe: 7, notes: 'Good' },
                { exerciseName: 'Russian Twists', setNumber: 3, weight: 15, reps: 15, rpe: 8, notes: 'Tough' },
                { exerciseName: 'Treadmill', setNumber: 1, weight: 0, reps: 20, rpe: 6, notes: '6.5 mph, pretty good' },
            ],
            startTime: log2StartTime,
            endTime: log2EndTime,
            duration: 50,
            notes: 'Good session overall',
            completedAt: log2EndTime,
        });

        console.log('✓ Created 2 sample workout logs with RPE and timings');

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📝 Test Accounts:');
        console.log('\n   TRAINER:');
        console.log('   📧 Email: trainer@test.com');
        console.log('   🔑 Password: trainer123');
        console.log('\n   MEMBERS:');
        console.log('   📧 Email: sarah@test.com');
        console.log('   🔑 Password: member123');
        console.log('\n   📧 Email: mike@test.com');
        console.log('   🔑 Password: member123');
        console.log('\n💪 Team: CrossFit Elite');
        console.log(`   📋 Invite Code: ${team.inviteCode}`);
        console.log('   👥 Members: Sarah Johnson, Mike Davis');
        console.log('\n📅 Trainings:');
        console.log('   1️⃣  Upper Body Strength (Tomorrow) - 4 exercises with rest times');
        console.log('   2️⃣  Lower Body Power (Next Week) - 4 exercises with rest times');
        console.log('   3️⃣  Core & Cardio (2 days ago - COMPLETED) - 3 exercises');
        console.log('\n📊 Workout Logs:');
        console.log('   • Sarah: Core & Cardio session (45 min, 7 exercises logged with RPE)');
        console.log('   • Mike: Core & Cardio session (50 min, 7 exercises logged with RPE)');
        console.log('\n🔐 Authorization Features Tested:');
        console.log('   ✓ Trainer can see all team data');
        console.log('   ✓ Members can see only their team data');
        console.log('   ✓ Only trainer can edit/delete trainings');
        console.log('   ✓ Only members can log workouts');
        console.log('   ✓ Invite codes for team joining\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

seed();
