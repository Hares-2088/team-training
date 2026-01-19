require('dotenv').config({ path: '.env.local' });
const { connectDB } = require('./src/lib/db/mongodb');
const WorkoutTemplate = require('./src/models/WorkoutTemplate').default;

async function seedWorkoutTemplates() {
    try {
        await connectDB();
        console.log('Seeding workout templates...');

        // Clear existing templates to avoid duplicates
        await WorkoutTemplate.deleteMany({});

        const templates = [
            {
                title: 'Beginner Full Body Circuit',
                description: 'Low-impact circuit designed for beginners to build strength and confidence.',
                category: 'Full Body',
                difficulty: 'beginner',
                tags: ['full-body', 'circuit', 'beginner', 'upper-body', 'legs'],
                estimatedDuration: 40,
                exercises: [
                    { name: 'Bodyweight Squat', sets: 3, reps: '12-15', restTime: 60, notes: 'Slow and controlled' },
                    { name: 'Incline Push-up', sets: 3, reps: '8-12', restTime: 60, notes: 'Hands on bench or wall' },
                    { name: 'Resistance Band Row', sets: 3, reps: '12-15', restTime: 60 },
                    { name: 'Standing Dumbbell Curl', sets: 2, reps: '12-15', restTime: 45 },
                ],
            },
            {
                title: 'Upper Body Strength',
                description: 'Focused upper-body strength session with compound lifts.',
                category: 'Upper Body',
                difficulty: 'intermediate',
                tags: ['upper-body', 'strength'],
                estimatedDuration: 60,
                exercises: [
                    { name: 'Barbell Bench Press', sets: 4, reps: '5-6', restTime: 150 },
                    { name: 'Pull-up', sets: 4, reps: '6-10', restTime: 120, notes: 'Use assistance if needed' },
                    { name: 'Overhead Barbell Press', sets: 3, reps: '6-8', restTime: 120 },
                    { name: 'Dumbbell Lateral Raise', sets: 3, reps: '12-15', restTime: 60 },
                ],
            },
            {
                title: 'Lower Body Strength',
                description: 'Heavy lower-body day focusing on squats and posterior chain.',
                category: 'Lower Body',
                difficulty: 'intermediate',
                tags: ['legs', 'strength'],
                estimatedDuration: 65,
                exercises: [
                    { name: 'Back Squat', sets: 5, reps: '5', restTime: 180 },
                    { name: 'Romanian Deadlift', sets: 4, reps: '6-8', restTime: 150 },
                    { name: 'Walking Lunge', sets: 3, reps: '10 each', restTime: 90 },
                    { name: 'Standing Calf Raise', sets: 3, reps: '15-20', restTime: 60 },
                ],
            },
            {
                title: 'Push Day Hypertrophy',
                description: 'Chest, shoulders, and triceps workout focused on muscle growth.',
                category: 'Hypertrophy',
                difficulty: 'intermediate',
                tags: ['push', 'hypertrophy', 'upper-body'],
                estimatedDuration: 70,
                exercises: [
                    { name: 'Incline Dumbbell Press', sets: 4, reps: '8-12', restTime: 90 },
                    { name: 'Seated Dumbbell Shoulder Press', sets: 4, reps: '10-12', restTime: 90 },
                    { name: 'Cable Chest Fly', sets: 3, reps: '12-15', restTime: 60 },
                    { name: 'Triceps Rope Pushdown', sets: 3, reps: '12-15', restTime: 60 },
                ],
            },
            {
                title: 'Pull Day Hypertrophy',
                description: 'Back and biceps session emphasizing volume and control.',
                category: 'Hypertrophy',
                difficulty: 'intermediate',
                tags: ['pull', 'hypertrophy', 'upper-body'],
                estimatedDuration: 70,
                exercises: [
                    { name: 'Lat Pulldown', sets: 4, reps: '10-12', restTime: 90 },
                    { name: 'Seated Cable Row', sets: 4, reps: '10-12', restTime: 90 },
                    { name: 'Face Pull', sets: 3, reps: '12-15', restTime: 60 },
                    { name: 'EZ-Bar Curl', sets: 3, reps: '10-12', restTime: 60 },
                ],
            },
            {
                title: 'Legs Hypertrophy',
                description: 'High-volume leg workout focused on quads and glutes.',
                category: 'Hypertrophy',
                difficulty: 'advanced',
                tags: ['legs', 'hypertrophy'],
                estimatedDuration: 75,
                exercises: [
                    { name: 'Front Squat', sets: 4, reps: '8-10', restTime: 120 },
                    { name: 'Leg Press', sets: 4, reps: '12-15', restTime: 120 },
                    { name: 'Bulgarian Split Squat', sets: 3, reps: '10 each', restTime: 90 },
                    { name: 'Seated Hamstring Curl', sets: 3, reps: '12-15', restTime: 60 },
                ],
            },
            {
                title: 'HIIT Fat Burner',
                description: 'Short and intense HIIT workout for maximum calorie burn.',
                category: 'Conditioning',
                difficulty: 'advanced',
                tags: ['hiit', 'conditioning', 'cardio', 'legs', 'full-body'],
                estimatedDuration: 25,
                exercises: [
                    { name: 'Jump Squat', sets: 4, reps: '20', restTime: 45 },
                    { name: 'Mountain Climbers', sets: 4, reps: '40 seconds', restTime: 45 },
                    { name: 'Burpees', sets: 4, reps: '15', restTime: 60 },
                    { name: 'High Knees', sets: 4, reps: '45 seconds', restTime: 45 },
                ],
            },
            {
                title: 'Core Strength Builder',
                description: 'Focused core workout improving stability and strength.',
                category: 'Core',
                difficulty: 'beginner',
                tags: ['core', 'abs'],
                estimatedDuration: 30,
                exercises: [
                    { name: 'Plank Hold', sets: 3, reps: '45 seconds', restTime: 45 },
                    { name: 'Russian Twist', sets: 3, reps: '20', restTime: 45 },
                    { name: 'Hanging Knee Raise', sets: 3, reps: '10-15', restTime: 60 },
                    { name: 'Bird Dog', sets: 3, reps: '10 each', restTime: 45 },
                ],
            },
            {
                title: 'Athletic Power',
                description: 'Explosive movements to develop power and athleticism.',
                category: 'Athletic',
                difficulty: 'advanced',
                tags: ['power', 'athletic', 'legs', 'upper-body'],
                estimatedDuration: 55,
                exercises: [
                    { name: 'Power Clean', sets: 5, reps: '3', restTime: 180 },
                    { name: 'Box Jump', sets: 4, reps: '5', restTime: 120 },
                    { name: 'Medicine Ball Slam', sets: 4, reps: '10', restTime: 90 },
                    { name: 'Sprint', sets: 6, reps: '20 seconds', restTime: 60 },
                ],
            },
            {
                title: 'Recovery & Mobility Flow',
                description: 'Active recovery session improving flexibility and joint health.',
                category: 'Recovery',
                difficulty: 'beginner',
                tags: ['recovery', 'mobility'],
                estimatedDuration: 35,
                exercises: [
                    { name: 'Hip Flexor Stretch', sets: 3, reps: '30 seconds each', restTime: 30 },
                    { name: 'Thoracic Spine Rotation', sets: 3, reps: '10 each', restTime: 30 },
                    { name: 'Hamstring Stretch', sets: 3, reps: '30 seconds each', restTime: 30 },
                    { name: 'Child’s Pose', sets: 2, reps: '60 seconds', restTime: 30 },
                ],
            },
        ];

        const bodyweightTemplates = [
            {
                title: 'Bodyweight Full Body Burner',
                description: 'Simple full-body workout using only bodyweight movements.',
                category: 'Full Body',
                difficulty: 'beginner',
                tags: ['bodyweight', 'no-equipment', 'full-body', 'upper-body', 'legs', 'core'],
                estimatedDuration: 35,
                exercises: [
                    { name: 'Air Squat', sets: 3, reps: '15-20', restTime: 60 },
                    { name: 'Push-up', sets: 3, reps: '8-12', restTime: 60 },
                    { name: 'Glute Bridge', sets: 3, reps: '15', restTime: 45 },
                    { name: 'Plank Hold', sets: 3, reps: '30-45 seconds', restTime: 45 },
                ],
            },
            {
                title: 'Beginner Cardio Blast',
                description: 'Low-impact cardio session for endurance and fat loss.',
                category: 'Conditioning',
                difficulty: 'beginner',
                tags: ['cardio', 'bodyweight', 'no-equipment', 'legs'],
                estimatedDuration: 25,
                exercises: [
                    { name: 'March in Place', sets: 4, reps: '60 seconds', restTime: 30 },
                    { name: 'Step Back Lunge', sets: 3, reps: '10 each', restTime: 45 },
                    { name: 'Standing Jumping Jack', sets: 3, reps: '30 seconds', restTime: 45 },
                    { name: 'Wall Sit', sets: 3, reps: '30-45 seconds', restTime: 45 },
                ],
            },
            {
                title: 'Bodyweight Upper Body',
                description: 'Upper-body strength session using push and pull patterns.',
                category: 'Upper Body',
                difficulty: 'intermediate',
                tags: ['upper-body', 'bodyweight', 'no-equipment', 'core'],
                estimatedDuration: 40,
                exercises: [
                    { name: 'Push-up', sets: 4, reps: '10-15', restTime: 60 },
                    { name: 'Pike Push-up', sets: 3, reps: '8-10', restTime: 60 },
                    { name: 'Plank Shoulder Tap', sets: 3, reps: '20 taps', restTime: 45 },
                    { name: 'Bench Dip (Bodyweight)', sets: 3, reps: '12-15', restTime: 45 },
                ],
            },
            {
                title: 'Bodyweight Legs & Glutes',
                description: 'Lower-body focused workout to build strength and endurance.',
                category: 'Lower Body',
                difficulty: 'intermediate',
                tags: ['legs', 'bodyweight', 'no-equipment'],
                estimatedDuration: 45,
                exercises: [
                    { name: 'Bodyweight Squat', sets: 4, reps: '20', restTime: 60 },
                    { name: 'Reverse Lunge', sets: 3, reps: '12 each', restTime: 60 },
                    { name: 'Single-Leg Glute Bridge', sets: 3, reps: '10 each', restTime: 45 },
                    { name: 'Wall Sit', sets: 3, reps: '45-60 seconds', restTime: 45 },
                ],
            },
            {
                title: 'Core & Stability',
                description: 'Core-focused routine to improve balance and trunk stability.',
                category: 'Core',
                difficulty: 'beginner',
                tags: ['core', 'bodyweight', 'no-equipment'],
                estimatedDuration: 30,
                exercises: [
                    { name: 'Dead Bug', sets: 3, reps: '10 each', restTime: 45 },
                    { name: 'Side Plank', sets: 3, reps: '30 seconds each', restTime: 45 },
                    { name: 'Heel Tap Crunch', sets: 3, reps: '20', restTime: 45 },
                    { name: 'Bird Dog', sets: 3, reps: '10 each', restTime: 45 },
                ],
            },
            {
                title: 'Bodyweight HIIT',
                description: 'High-intensity interval workout with explosive movements.',
                category: 'Conditioning',
                difficulty: 'advanced',
                tags: ['hiit', 'bodyweight', 'no-equipment', 'cardio', 'legs', 'full-body'],
                estimatedDuration: 20,
                exercises: [
                    { name: 'Burpees', sets: 4, reps: '12-15', restTime: 60 },
                    { name: 'Jump Squat', sets: 4, reps: '20', restTime: 45 },
                    { name: 'Mountain Climbers', sets: 4, reps: '40 seconds', restTime: 45 },
                    { name: 'High Knees', sets: 4, reps: '45 seconds', restTime: 45 },
                ],
            },
            {
                title: 'Athletic Bodyweight Power',
                description: 'Explosive movements to improve speed and power.',
                category: 'Athletic',
                difficulty: 'advanced',
                tags: ['power', 'bodyweight', 'no-equipment', 'legs', 'upper-body'],
                estimatedDuration: 35,
                exercises: [
                    { name: 'Broad Jump', sets: 5, reps: '5', restTime: 90 },
                    { name: 'Split Squat Jump', sets: 4, reps: '8 each', restTime: 90 },
                    { name: 'Sprint in Place', sets: 5, reps: '20 seconds', restTime: 60 },
                    { name: 'Explosive Push-up', sets: 3, reps: '6-8', restTime: 90 },
                ],
            },
            {
                title: 'Low-Impact Fat Burner',
                description: 'Joint-friendly cardio workout without jumping.',
                category: 'Conditioning',
                difficulty: 'beginner',
                tags: ['low-impact', 'bodyweight', 'no-equipment', 'cardio', 'legs'],
                estimatedDuration: 30,
                exercises: [
                    { name: 'Step Touch', sets: 4, reps: '60 seconds', restTime: 30 },
                    { name: 'Bodyweight Good Morning', sets: 3, reps: '15', restTime: 45 },
                    { name: 'Standing Knee Raise', sets: 3, reps: '20', restTime: 45 },
                    { name: 'Wall Push-up', sets: 3, reps: '15', restTime: 45 },
                ],
            },
            {
                title: 'Morning Mobility Flow',
                description: 'Gentle full-body flow to wake up joints and muscles.',
                category: 'Mobility',
                difficulty: 'beginner',
                tags: ['mobility', 'bodyweight', 'no-equipment'],
                estimatedDuration: 20,
                exercises: [
                    { name: 'Cat-Cow', sets: 3, reps: '10', restTime: 30 },
                    { name: 'World’s Greatest Stretch', sets: 3, reps: '5 each', restTime: 30 },
                    { name: 'Hip Circles', sets: 3, reps: '10 each', restTime: 30 },
                    { name: 'Forward Fold', sets: 2, reps: '45 seconds', restTime: 30 },
                ],
            },
            {
                title: 'Evening Stretch & Reset',
                description: 'Relaxing bodyweight routine for recovery and relaxation.',
                category: 'Recovery',
                difficulty: 'beginner',
                tags: ['recovery', 'bodyweight', 'no-equipment'],
                estimatedDuration: 25,
                exercises: [
                    { name: 'Child’s Pose', sets: 2, reps: '60 seconds', restTime: 30 },
                    { name: 'Seated Spinal Twist', sets: 3, reps: '30 seconds each', restTime: 30 },
                    { name: 'Hamstring Stretch', sets: 3, reps: '30 seconds each', restTime: 30 },
                    { name: 'Deep Breathing', sets: 2, reps: '60 seconds', restTime: 30 },
                ],
            },
        ];


        const home = [
            {
                title: 'Home Full Body Starter',
                description: 'Beginner-friendly full body workout done entirely at home.',
                category: 'Full Body',
                difficulty: 'beginner',
                tags: ['home', 'bodyweight', 'no-equipment', 'full-body', 'upper-body', 'legs', 'core'],
                estimatedDuration: 35,
                exercises: [
                    { name: 'Air Squat', sets: 3, reps: '15', restTime: 60 },
                    { name: 'Push-up', sets: 3, reps: '8-10', restTime: 60 },
                    { name: 'Glute Bridge', sets: 3, reps: '15', restTime: 45 },
                    { name: 'Plank Hold', sets: 3, reps: '30 seconds', restTime: 45 },
                ],
            },
            {
                title: 'Home Cardio Burn',
                description: 'Cardio-focused bodyweight workout to elevate heart rate.',
                category: 'Conditioning',
                difficulty: 'beginner',
                tags: ['home', 'cardio', 'bodyweight', 'legs'],
                estimatedDuration: 25,
                exercises: [
                    { name: 'Jumping Jacks', sets: 4, reps: '45 seconds', restTime: 30 },
                    { name: 'High Knees', sets: 4, reps: '30 seconds', restTime: 30 },
                    { name: 'Mountain Climbers', sets: 3, reps: '30 seconds', restTime: 45 },
                    { name: 'March in Place', sets: 3, reps: '60 seconds', restTime: 30 },
                ],
            },
            {
                title: 'Home Core Builder',
                description: 'Core-focused session to improve stability and strength.',
                category: 'Core',
                difficulty: 'beginner',
                tags: ['home', 'core', 'bodyweight'],
                estimatedDuration: 30,
                exercises: [
                    { name: 'Dead Bug', sets: 3, reps: '10 each', restTime: 45 },
                    { name: 'Bird Dog', sets: 3, reps: '10 each', restTime: 45 },
                    { name: 'Side Plank', sets: 3, reps: '30 seconds each', restTime: 45 },
                    { name: 'Heel Taps', sets: 3, reps: '20', restTime: 45 },
                ],
            },
            {
                title: 'Home Lower Body',
                description: 'Leg and glute focused workout using bodyweight only.',
                category: 'Lower Body',
                difficulty: 'intermediate',
                tags: ['home', 'legs', 'bodyweight'],
                estimatedDuration: 40,
                exercises: [
                    { name: 'Bodyweight Squat', sets: 4, reps: '20', restTime: 60 },
                    { name: 'Reverse Lunge', sets: 3, reps: '12 each', restTime: 60 },
                    { name: 'Wall Sit', sets: 3, reps: '45 seconds', restTime: 45 },
                    { name: 'Single-Leg Glute Bridge', sets: 3, reps: '10 each', restTime: 45 },
                ],
            },
            {
                title: 'Home Upper Body',
                description: 'Upper body strength using push-based bodyweight movements.',
                category: 'Upper Body',
                difficulty: 'intermediate',
                tags: ['home', 'upper-body', 'bodyweight', 'core'],
                estimatedDuration: 40,
                exercises: [
                    { name: 'Push-up', sets: 4, reps: '12-15', restTime: 60 },
                    { name: 'Pike Push-up', sets: 3, reps: '8-10', restTime: 60 },
                    { name: 'Bench Dip', sets: 3, reps: '12-15', restTime: 45 },
                    { name: 'Plank Shoulder Tap', sets: 3, reps: '20 taps', restTime: 45 },
                ],
            },
            {
                title: 'Home HIIT Express',
                description: 'Short and intense HIIT session at home.',
                category: 'Conditioning',
                difficulty: 'intermediate',
                tags: ['home', 'hiit', 'bodyweight', 'cardio', 'legs', 'full-body'],
                estimatedDuration: 20,
                exercises: [
                    { name: 'Burpees', sets: 4, reps: '12', restTime: 60 },
                    { name: 'Jump Squats', sets: 4, reps: '20', restTime: 45 },
                    { name: 'Mountain Climbers', sets: 4, reps: '40 seconds', restTime: 45 },
                    { name: 'High Knees', sets: 4, reps: '45 seconds', restTime: 45 },
                ],
            },
            {
                title: 'Home Mobility Flow',
                description: 'Mobility routine to improve flexibility and joint health.',
                category: 'Mobility',
                difficulty: 'beginner',
                tags: ['home', 'mobility', 'recovery'],
                estimatedDuration: 25,
                exercises: [
                    { name: 'Cat-Cow', sets: 3, reps: '10', restTime: 30 },
                    { name: 'World’s Greatest Stretch', sets: 3, reps: '5 each', restTime: 30 },
                    { name: 'Hip Circles', sets: 3, reps: '10 each', restTime: 30 },
                    { name: 'Forward Fold', sets: 2, reps: '45 seconds', restTime: 30 },
                ],
            },
            {
                title: 'Home Fat Loss Circuit',
                description: 'Full-body fat-burning circuit without equipment.',
                category: 'Full Body',
                difficulty: 'intermediate',
                tags: ['home', 'fat-loss', 'bodyweight', 'full-body', 'upper-body', 'legs'],
                estimatedDuration: 35,
                exercises: [
                    { name: 'Bodyweight Squat', sets: 3, reps: '20', restTime: 45 },
                    { name: 'Push-up', sets: 3, reps: '10-12', restTime: 45 },
                    { name: 'Jumping Jacks', sets: 3, reps: '45 seconds', restTime: 30 },
                    { name: 'Plank', sets: 3, reps: '45 seconds', restTime: 45 },
                ],
            },
            {
                title: 'Home Athletic Power',
                description: 'Explosive movements to build power at home.',
                category: 'Athletic',
                difficulty: 'advanced',
                tags: ['home', 'power', 'bodyweight', 'legs', 'upper-body'],
                estimatedDuration: 35,
                exercises: [
                    { name: 'Broad Jump', sets: 5, reps: '5', restTime: 90 },
                    { name: 'Split Squat Jump', sets: 4, reps: '8 each', restTime: 90 },
                    { name: 'Explosive Push-up', sets: 3, reps: '6-8', restTime: 90 },
                    { name: 'Sprint in Place', sets: 4, reps: '20 seconds', restTime: 60 },
                ],
            },
            {
                title: 'Home Recovery & Stretch',
                description: 'Light recovery session to relax muscles and reduce soreness.',
                category: 'Recovery',
                difficulty: 'beginner',
                tags: ['home', 'recovery', 'bodyweight'],
                estimatedDuration: 20,
                exercises: [
                    { name: 'Child’s Pose', sets: 2, reps: '60 seconds', restTime: 30 },
                    { name: 'Seated Spinal Twist', sets: 3, reps: '30 seconds each', restTime: 30 },
                    { name: 'Hamstring Stretch', sets: 3, reps: '30 seconds each', restTime: 30 },
                    { name: 'Deep Breathing', sets: 2, reps: '60 seconds', restTime: 30 },
                ],
            },
        ];


        await WorkoutTemplate.insertMany(templates);
        await WorkoutTemplate.insertMany(bodyweightTemplates);
        await WorkoutTemplate.insertMany(home);
        console.log(`Inserted ${templates.length + bodyweightTemplates.length + home.length} workout templates.`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding workout templates failed:', error);
        process.exit(1);
    }
}

seedWorkoutTemplates();
