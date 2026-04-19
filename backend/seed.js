const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Event = require('./models/Event');
const Donation = require('./models/Donation');
const Task = require('./models/Task');
const Volunteer = require('./models/Volunteer');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Event.deleteMany({});
        await Donation.deleteMany({});
        await Task.deleteMany({});
        await Volunteer.deleteMany({});
        console.log('Cleared existing data.');

        const salt = await bcrypt.genSalt(10);

        // 1. Create Admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@ngo.com',
            password: await bcrypt.hash('admin123', salt),
            role: 'Admin',
            isApproved: true,
        });
        console.log('✅ Admin created: admin@ngo.com / admin123');

        // 2. Create Approved NGO
        const ngo1 = await User.create({
            name: 'Priya Sharma',
            email: 'ngo@ngo.com',
            password: await bcrypt.hash('ngo123', salt),
            role: 'NGO',
            ngoName: 'Green Earth Foundation',
            isApproved: true,
        });
        console.log('✅ NGO created: ngo@ngo.com / ngo123 (Green Earth Foundation)');

        // 3. Create Pending NGO
        const ngo2 = await User.create({
            name: 'Anita Desai',
            email: 'ngo2@ngo.com',
            password: await bcrypt.hash('ngo123', salt),
            role: 'NGO',
            ngoName: 'Rural Education Trust',
            isApproved: false,
        });
        console.log('✅ Pending NGO created: ngo2@ngo.com / ngo123 (Rural Education Trust)');

        // 4. Create Donor
        const donor = await User.create({
            name: 'Rajesh Kumar',
            email: 'donor@ngo.com',
            password: await bcrypt.hash('donor123', salt),
            role: 'Donor',
            isApproved: true,
        });
        console.log('✅ Donor created: donor@ngo.com / donor123');

        // 5. Create Volunteer User
        const vol1 = await User.create({
            name: 'Sneha Patil',
            email: 'volunteer@ngo.com',
            password: await bcrypt.hash('volunteer123', salt),
            role: 'Volunteer',
            isApproved: true,
        });

        const vol2 = await User.create({
            name: 'Amit Joshi',
            email: 'volunteer2@ngo.com',
            password: await bcrypt.hash('volunteer123', salt),
            role: 'Volunteer',
            isApproved: true,
        });
        console.log('✅ Volunteers created: volunteer@ngo.com, volunteer2@ngo.com / volunteer123');

        // 6. Create Volunteer Records
        const volunteerRec1 = await Volunteer.create({
            userId: vol1._id,
            name: vol1.name,
            email: vol1.email,
            skills: ['Teaching', 'First Aid', 'Event Management'],
            status: 'Available',
        });

        const volunteerRec2 = await Volunteer.create({
            userId: vol2._id,
            name: vol2.name,
            email: vol2.email,
            skills: ['Cooking', 'Driving', 'Photography'],
            status: 'Available',
        });
        console.log('✅ Volunteer records created');

        // 7. Create Events
        const event1 = await Event.create({
            title: 'Community Tree Plantation Drive',
            description: 'Plant 500 trees across the city parks to improve air quality.',
            date: new Date('2026-05-15'),
            location: 'Pune, Maharashtra',
            status: 'Upcoming',
            createdBy: ngo1._id,
            volunteersAssigned: [vol1._id],
        });

        const event2 = await Event.create({
            title: 'Free Health Checkup Camp',
            description: 'Free medical checkups and medicine distribution in rural areas.',
            date: new Date('2026-04-20'),
            location: 'Nashik, Maharashtra',
            status: 'Upcoming',
            createdBy: ngo1._id,
            volunteersAssigned: [vol1._id, vol2._id],
        });

        const event3 = await Event.create({
            title: 'Clean River Campaign',
            description: 'Cleaning the local river banks and spreading awareness about water pollution.',
            date: new Date('2026-06-10'),
            location: 'Mumbai, Maharashtra',
            status: 'Upcoming',
            createdBy: ngo1._id,
            volunteersAssigned: [],
        });

        const event4 = await Event.create({
            title: 'Education Workshop for Children',
            description: 'Free education workshop with books and stationery distribution.',
            date: new Date('2026-03-10'),
            location: 'Delhi',
            status: 'Completed',
            createdBy: ngo1._id,
            volunteersAssigned: [vol2._id],
        });
        console.log('✅ Events created (4 events)');

        // 8. Create Donations
        await Donation.create({
            donorId: donor._id,
            donorName: donor.name,
            ngoId: ngo1._id,
            ngoName: 'Green Earth Foundation',
            amount: 25000,
            campaign: 'Tree Plantation Fund',
            status: 'Completed',
        });

        await Donation.create({
            donorId: donor._id,
            donorName: donor.name,
            ngoId: ngo1._id,
            ngoName: 'Green Earth Foundation',
            amount: 15000,
            campaign: 'Health Camp Sponsorship',
            status: 'Completed',
        });

        await Donation.create({
            donorId: donor._id,
            donorName: donor.name,
            ngoId: ngo1._id,
            ngoName: 'Green Earth Foundation',
            amount: 5000,
            campaign: 'Clean River Initiative',
            status: 'Completed',
        });

        await Donation.create({
            donorId: donor._id,
            donorName: donor.name,
            ngoId: ngo1._id,
            ngoName: 'Green Earth Foundation',
            amount: 10000,
            campaign: 'Education for All',
            status: 'Pending',
        });
        console.log('✅ Donations created (4 donations, ₹55,000 total)');

        // 9. Create Tasks
        await Task.create({
            title: 'Design event posters',
            description: 'Create promotional posters for the tree plantation drive.',
            status: 'Done',
            assignedTo: vol1._id,
            eventId: event1._id,
        });

        await Task.create({
            title: 'Arrange medical supplies',
            description: 'Coordinate with hospitals for medical supplies for the health camp.',
            status: 'In Progress',
            assignedTo: vol2._id,
            eventId: event2._id,
        });

        await Task.create({
            title: 'Book venue for workshop',
            description: 'Find and book a suitable venue for the education workshop.',
            status: 'To Do',
            assignedTo: vol1._id,
            eventId: event4._id,
        });

        await Task.create({
            title: 'Social media campaign',
            description: 'Create and schedule social media posts for upcoming events.',
            status: 'To Do',
            assignedTo: null,
        });

        await Task.create({
            title: 'Volunteer training session',
            description: 'Conduct orientation and training for new volunteers.',
            status: 'In Progress',
            assignedTo: vol1._id,
        });
        console.log('✅ Tasks created (5 tasks)');

        // Update volunteer records with assigned events
        volunteerRec1.assignedEvents = [event1._id, event2._id];
        await volunteerRec1.save();
        volunteerRec2.assignedEvents = [event2._id, event4._id];
        await volunteerRec2.save();

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Admin:     admin@ngo.com / admin123');
        console.log('   NGO:       ngo@ngo.com / ngo123');
        console.log('   Donor:     donor@ngo.com / donor123');
        console.log('   Volunteer: volunteer@ngo.com / volunteer123');
        console.log('\n👀 Open MongoDB Compass → mongodb://127.0.0.1:27017/ngo_management');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seedDB();
