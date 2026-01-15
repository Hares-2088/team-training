const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    role: { type: String, enum: ['trainer', 'member'] },
    team: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const teamSchema = new mongoose.Schema({
    name: String,
    description: String,
    trainer: mongoose.Schema.Types.ObjectId,
    members: [mongoose.Schema.Types.ObjectId],
}, { timestamps: true });

const trainingSchema = new mongoose.Schema({
    title: String,
    description: String,
    exercises: [{ name: String, sets: Number, reps: String, notes: String }],
    team: mongoose.Schema.Types.ObjectId,
    trainer: mongoose.Schema.Types.ObjectId,
    scheduledDate: Date,
    status: String,
}, { timestamps: true });

const workoutLogSchema = new mongoose.Schema({
    training: mongoose.Schema.Types.ObjectId,
    member: mongoose.Schema.Types.ObjectId,
    exercises: [{ exerciseName: String, setNumber: Number, weight: Number, reps: Number, notes: String }],
    notes: String,
    completedAt: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Team = mongoose.model('Team', teamSchema);
const Training = mongoose.model('Training', trainingSchema);
const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);

async function seed() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/team-training';
        await mongoose.connect(mongoUri);
        console.log('✓ Connected to MongoDB');
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

        // Create team
        const team = await Team.create({
            name: 'CrossFit Elite',
            description: 'High-intensity functional training group',
            trainer: trainer._id,
            members: [member1._id, member2._id],
        });

        trainer.team = team._id;
        member1.team = team._id;
        member2.team = team._id;

        await trainer.save();
        await member1.save();
        await member2.save();

        console.log(`✓ Created team: ${team.name}`);

        // Create trainings
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const training1 = await Training.create({
            title: 'Upper Body Strength',
            description: 'Focus on chest, back, and shoulders with heavy weights',
            exercises: [
                { name: 'Bench Press', sets: 4, reps: '6-8', notes: 'Heavy weight, focus on form' },
                { name: 'Barbell Rows', sets: 4, reps: '6-8', notes: 'Pull to chest' },
                { name: 'Shoulder Press', sets: 3, reps: '8-10', notes: 'Standing press' },
                { name: 'Pull-ups', sets: 3, reps: '8-12', notes: 'Assisted if needed' },
            ],
            team: team._id,
            trainer: trainer._id,
            scheduledDate: tomorrow,
            status: 'scheduled',
        });

        const training2 = await Training.create({
            title: 'Lower Body Power',
            description: 'Intense leg workout focusing on power and explosiveness',
            exercises: [
                { name: 'Squats', sets: 4, reps: '6-8', notes: 'Deep squat, control the descent' },
                { name: 'Deadlifts', sets: 3, reps: '5-6', notes: 'Keep back straight' },
                { name: 'Leg Press', sets: 3, reps: '10-12', notes: 'Full range of motion' },
                { name: 'Leg Curls', sets: 3, reps: '10-12', notes: 'Control the weight' },
            ],
            team: team._id,
            trainer: trainer._id,
            scheduledDate: nextWeek,
            status: 'scheduled',
        });

        const pastTraining = await Training.create({
            title: 'Core & Cardio',
            description: 'Abs and cardiovascular conditioning',
            exercises: [
                { name: 'Planks', sets: 3, reps: '60 seconds', notes: 'Stay tight' },
                { name: 'Russian Twists', sets: 3, reps: '20', notes: 'With weight' },
                { name: 'Treadmill', sets: 1, reps: '20 minutes', notes: 'Steady pace' },
            ],
            team: team._id,
            trainer: trainer._id,
            scheduledDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            status: 'completed',
        });

        console.log('✓ Created sample trainings');

        // Create workout logs
        await WorkoutLog.create({
            training: pastTraining._id,
            member: member1._id,
            exercises: [
                { exerciseName: 'Planks', setNumber: 1, weight: 0, reps: 60, notes: 'Felt strong' },
                { exerciseName: 'Planks', setNumber: 2, weight: 0, reps: 55, notes: 'Getting tired' },
                { exerciseName: 'Planks', setNumber: 3, weight: 0, reps: 50, notes: 'Finished strong' },
                { exerciseName: 'Russian Twists', setNumber: 1, weight: 10, reps: 20, notes: 'Using 10lb weight' },
                { exerciseName: 'Russian Twists', setNumber: 2, weight: 10, reps: 20, notes: 'Good form' },
                { exerciseName: 'Russian Twists', setNumber: 3, weight: 10, reps: 18, notes: 'Fatigued' },
                { exerciseName: 'Treadmill', setNumber: 1, weight: 0, reps: 20, notes: 'Easy pace, 6.0 mph' },
            ],
            notes: 'Great workout! Feeling energized',
            completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        });

        await WorkoutLog.create({
            training: pastTraining._id,
            member: member2._id,
            exercises: [
                { exerciseName: 'Planks', setNumber: 1, weight: 0, reps: 45, notes: 'Need more core work' },
                { exerciseName: 'Planks', setNumber: 2, weight: 0, reps: 40, notes: 'Burning' },
                { exerciseName: 'Planks', setNumber: 3, weight: 0, reps: 35, notes: 'Exhausted' },
                { exerciseName: 'Russian Twists', setNumber: 1, weight: 15, reps: 20, notes: 'Using 15lb weight' },
                { exerciseName: 'Russian Twists', setNumber: 2, weight: 15, reps: 18, notes: 'Good' },
                { exerciseName: 'Russian Twists', setNumber: 3, weight: 15, reps: 15, notes: 'Tough' },
                { exerciseName: 'Treadmill', setNumber: 1, weight: 0, reps: 20, notes: '6.5 mph, pretty good' },
            ],
            notes: 'Good session overall',
            completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        });

        console.log('✓ Created sample workout logs');

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
        console.log('📋 Trainings: 3 (2 scheduled, 1 completed)');
        console.log('📊 Workout Logs: 2 sample logs\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

seed();
