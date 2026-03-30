const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./models/index');
const User = require('./models/User');
const FeatureClick = require('./models/FeatureClick');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/register', async (req, res) => {
  try {
    const { username, password, age, gender } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, age, gender });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, age, gender } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, age: user.age, gender: user.gender } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/track', authenticateToken, async (req, res) => {
  try {
    const { feature_name } = req.body;
    if (!feature_name) return res.status(400).json({ error: 'feature_name required' });
    const click = await FeatureClick.create({
      user_id: req.user.id,
      feature_name,
      timestamp: new Date()
    });
    res.status(201).json(click);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, age, gender } = req.query;
    
    const userWhere = {};
    if (age && age !== 'All Ages') {
        if (age === '<18' || age === 'Under 18') userWhere.age = { [Op.lt]: 18 };
        else if (age === '18-40') userWhere.age = { [Op.between]: [18, 40] };
        else if (age === '>40' || age === 'Over 40') userWhere.age = { [Op.gt]: 40 };
    }
    if (gender && gender !== 'All Genders') {
        userWhere.gender = gender;
    }

    const clickWhere = {};
    if (start_date && end_date) {
        const end = new Date(end_date);
        end.setHours(23, 59, 59, 999);
        clickWhere.timestamp = {
            [Op.between]: [new Date(start_date), end]
        };
    }

    const clicks = await FeatureClick.findAll({
      where: clickWhere,
      include: [{
          model: User,
          where: userWhere,
          attributes: []
      }],
      raw: true
    });

    const featureMap = {}; 
    const dateMap = {};    

    clicks.forEach(click => {
        const feat = click.feature_name;
        featureMap[feat] = (featureMap[feat] || 0) + 1;

        const d = new Date(click.timestamp);
        const dateStr = d.toISOString().split('T')[0];
        if (!dateMap[feat]) dateMap[feat] = {};
        dateMap[feat][dateStr] = (dateMap[feat][dateStr] || 0) + 1;
    });

    const barData = Object.keys(featureMap).map(feat => ({
        feature_name: feat,
        total_clicks: featureMap[feat]
    }));

    const lineData = [];
    Object.keys(dateMap).forEach(feat => {
        Object.keys(dateMap[feat]).forEach(dateStr => {
            lineData.push({
                feature_name: feat,
                date: dateStr,
                click_count: dateMap[feat][dateStr]
            });
        });
    });

    res.json({ barData, lineData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await sequelize.authenticate();
        console.log('Database connected');
    } catch(err) {
        console.error('Database connection error:', err);
    }
});
