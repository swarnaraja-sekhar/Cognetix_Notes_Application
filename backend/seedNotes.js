const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Note = require('./models/Note');

dotenv.config();

const dummyNotes = [
  {
    title: 'Welcome to Cognetix Notes! 🎉',
    content: 'This is your first note. Cognetix Notes helps you organize your thoughts, ideas, and tasks efficiently. Try creating folders, adding tags, and exploring all the features!',
    color: '#fef3c7',
    isPinned: true,
    isFavorite: true
  },
  {
    title: 'Meeting Notes - Project Kickoff',
    content: '## Project Alpha Kickoff Meeting\n\n**Date:** January 26, 2026\n**Attendees:** John, Sarah, Mike, Lisa\n\n### Key Points:\n- Project timeline: 3 months\n- Budget approved: $50,000\n- First milestone: Feb 15\n\n### Action Items:\n1. John - Create project roadmap\n2. Sarah - Set up development environment\n3. Mike - Draft technical specifications',
    color: '#dbeafe',
    isPinned: true
  },
  {
    title: 'Shopping List 🛒',
    content: '### Groceries\n- [ ] Milk\n- [ ] Eggs\n- [ ] Bread\n- [ ] Butter\n- [ ] Fresh vegetables\n- [ ] Chicken breast\n- [ ] Rice\n- [ ] Olive oil\n\n### Household\n- [ ] Dish soap\n- [ ] Paper towels\n- [ ] Laundry detergent',
    color: '#dcfce7'
  },
  {
    title: 'Book Recommendations 📚',
    content: '## Must Read Books for 2026\n\n1. **Atomic Habits** by James Clear\n   - Building good habits, breaking bad ones\n\n2. **Deep Work** by Cal Newport\n   - Focus and productivity in a distracted world\n\n3. **The Pragmatic Programmer** by David Thomas\n   - Essential for software developers\n\n4. **Clean Code** by Robert C. Martin\n   - Writing maintainable code\n\n5. **System Design Interview** by Alex Xu\n   - Prepare for tech interviews',
    color: '#fce7f3',
    isFavorite: true
  },
  {
    title: 'Workout Plan 💪',
    content: '## Weekly Workout Schedule\n\n**Monday - Chest & Triceps**\n- Bench Press: 4x10\n- Incline Dumbbell Press: 3x12\n- Tricep Dips: 3x15\n- Cable Flyes: 3x12\n\n**Wednesday - Back & Biceps**\n- Deadlifts: 4x8\n- Pull-ups: 3x10\n- Barbell Rows: 3x12\n- Bicep Curls: 3x15\n\n**Friday - Legs & Shoulders**\n- Squats: 4x10\n- Leg Press: 3x12\n- Shoulder Press: 3x10\n- Lateral Raises: 3x15',
    color: '#fed7aa'
  },
  {
    title: 'Recipe: Pasta Carbonara 🍝',
    content: '## Classic Pasta Carbonara\n\n### Ingredients:\n- 400g spaghetti\n- 200g guanciale or pancetta\n- 4 egg yolks + 2 whole eggs\n- 100g Pecorino Romano\n- Black pepper\n- Salt\n\n### Instructions:\n1. Cook pasta in salted water until al dente\n2. Crisp the guanciale in a pan\n3. Whisk eggs with cheese and pepper\n4. Toss hot pasta with guanciale\n5. Remove from heat, add egg mixture\n6. Toss quickly to create creamy sauce\n7. Serve immediately with extra cheese',
    color: '#fef9c3'
  },
  {
    title: 'Travel Bucket List ✈️',
    content: '## Places to Visit\n\n### Asia\n- 🇯🇵 Tokyo, Japan - Cherry blossom season\n- 🇹🇭 Bangkok, Thailand - Street food tour\n- 🇻🇳 Ha Long Bay, Vietnam - Cruise trip\n\n### Europe\n- 🇮🇹 Rome, Italy - Ancient history\n- 🇫🇷 Paris, France - Art museums\n- 🇬🇷 Santorini, Greece - Sunset views\n\n### Americas\n- 🇺🇸 New York City - Broadway shows\n- 🇧🇷 Rio de Janeiro - Carnival\n- 🇵🇪 Machu Picchu - Hiking adventure',
    color: '#e0e7ff',
    isFavorite: true
  },
  {
    title: 'Code Snippets - JavaScript',
    content: '## Useful JavaScript Snippets\n\n### Debounce Function\n```javascript\nconst debounce = (fn, delay) => {\n  let timeoutId;\n  return (...args) => {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => fn(...args), delay);\n  };\n};\n```\n\n### Deep Clone Object\n```javascript\nconst deepClone = (obj) => JSON.parse(JSON.stringify(obj));\n```\n\n### Generate UUID\n```javascript\nconst uuid = () => crypto.randomUUID();\n```',
    color: '#f3e8ff'
  },
  {
    title: 'Daily Affirmations 🌟',
    content: '## Morning Affirmations\n\n1. I am capable of achieving my goals\n2. Today is full of possibilities\n3. I choose to be happy and grateful\n4. I am worthy of success and love\n5. Challenges help me grow stronger\n6. I trust my journey and timing\n7. I am surrounded by abundance\n8. My potential is limitless\n9. I radiate positivity and confidence\n10. I am exactly where I need to be\n\n*Read these every morning for a positive start!*',
    color: '#ccfbf1'
  },
  {
    title: 'Project Ideas 💡',
    content: '## Side Project Ideas for 2026\n\n### Web Apps\n1. **Personal Finance Tracker** - Track expenses, budgets, investments\n2. **Recipe Manager** - Store and share family recipes\n3. **Habit Tracker** - Build and maintain good habits\n\n### Mobile Apps\n4. **Meditation Timer** - Guided meditation sessions\n5. **Plant Care Reminder** - Water your plants on time\n\n### AI Projects\n6. **Smart Note Summarizer** - AI-powered note summaries\n7. **Code Review Assistant** - Automated code suggestions\n\n*Pick one and start building this weekend!*',
    color: '#fecaca',
    isPinned: true
  }
];

const seedNotes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a demo user
    let user = await User.findOne({ email: 'demo@cognetix.com' });
    
    if (!user) {
      user = await User.create({
        name: 'Demo User',
        email: 'demo@cognetix.com',
        password: 'Demo@123'
      });
      console.log('✅ Demo user created: demo@cognetix.com / Demo@123');
    } else {
      console.log('✅ Using existing demo user');
    }

    // Delete existing notes for this user (optional - comment out to keep existing)
    await Note.deleteMany({ user: user._id });
    console.log('🗑️ Cleared existing notes for demo user');

    // Create notes with user reference
    const notesWithUser = dummyNotes.map(note => ({
      ...note,
      user: user._id
    }));

    // Insert all notes
    const createdNotes = await Note.insertMany(notesWithUser);
    console.log(`✅ Successfully created ${createdNotes.length} dummy notes!`);

    // Display summary
    console.log('\n📝 Notes Summary:');
    createdNotes.forEach((note, index) => {
      console.log(`   ${index + 1}. ${note.title}`);
    });

    console.log('\n🎉 Seeding completed!');
    console.log('📧 Login with: demo@cognetix.com');
    console.log('🔑 Password: Demo@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding notes:', error.message);
    process.exit(1);
  }
};

seedNotes();
