const sequelize = require('./models/index');
const User = require('./models/User');
const FeatureClick = require('./models/FeatureClick');
const bcrypt = require('bcryptjs');

const usernames = ['alice', 'bob', 'charlie', 'diana', 'evan', 'fiona', 'george', 'hannah', 'ivan', 'julia'];
const features = ['date_filter', 'gender_filter', 'age_filter', 'bar_chart_click', 'line_chart_hover', 'export_data'];

async function seed() {
    try {
        await sequelize.sync({ force: true });
        console.log('Database synced');

        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const usersToCreate = usernames.map((uname, idx) => ({
            username: uname,
            password: hashedPassword,
            age: 15 + (idx * 4), 
            gender: idx % 3 === 0 ? 'Male' : (idx % 3 === 1 ? 'Female' : 'Other')
        }));

        const users = await User.bulkCreate(usersToCreate, { returning: true });
        console.log(`Created ${users.length} users`);

        const clicksToCreate = [];
        const now = new Date();
        
        for (let i = 0; i < 80; i++) {
            const randomUserId = users[Math.floor(Math.random() * users.length)].id;
            const randomFeature = features[Math.floor(Math.random() * features.length)];
            
            const pastDate = new Date();
            pastDate.setDate(now.getDate() - Math.floor(Math.random() * 60));
            pastDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

            clicksToCreate.push({
                user_id: randomUserId,
                feature_name: randomFeature,
                timestamp: pastDate
            });
        }

        await FeatureClick.bulkCreate(clicksToCreate);
        console.log('Created 80 mock tracking events');

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
}

seed();
