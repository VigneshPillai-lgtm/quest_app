# The Summit — Modern Event Website

A stunning, modern event landing page inspired by Hack the North with animations, nature-themed design, and Neon PostgreSQL database integration.

## 🚀 Features

- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Beautiful Animations** - Floating birds, glowing orbs, particle effects
- **Nature Theme** - Mountains, fireflies, stars, and custom SVG assets
- **Modern Color Palette** - Cyan, purple, pink gradients with glassmorphism
- **Database Backed** - Neon PostgreSQL for newsletters, FAQs, and user data
- **Interactive Elements** - FAQ accordion, smooth scrolling, smooth transitions
- **Performance Optimized** - Fast loading, optimized animations

## 📋 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express.js
- **Database**: Neon PostgreSQL (serverless)
- **Hosting**: Vercel / Render compatible

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web server
- `pg` - PostgreSQL client
- `cors` - Cross-origin requests
- `bcrypt` - Password hashing
- `dotenv` - Environment variables

### 2. Setup Neon Database

1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy your connection string

### 3. Configure Environment

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require
PORT=3000
NODE_ENV=development
```

### 4. Start the Server

**Using the new Neon backend:**
```bash
node server-neon.js
```

**Using the old SQLite backend:**
```bash
node server.js
```

Visit `http://localhost:3000` in your browser.

## 📁 File Structure

```
skyfall/
├── landing-page.html          # Main landing page
├── landing.css                # Landing page styles
├── landing.js                 # Landing page interactivity
├── server-neon.js             # Express server with Neon PostgreSQL
├── server.js                  # Original Express server with SQLite
├── assets-birds.html          # SVG bird and nature assets
├── index.html                 # Original quest app page
├── style.css                  # Original quest app styles
├── app.js                     # Original quest app logic
├── manifest.json              # PWA manifest
├── package.json               # Dependencies
└── .env.example               # Environment template
```

## 🎨 Design Features

### Hero Section
- Animated birds flying across the screen
- Dynamic glowing orbs
- Particle effects in background
- Smooth gradient text
- Statistics display

### About Section
- 4-column card layout
- Hover effects with glow
- Glassmorphic cards
- Icon-based design

### Features Section
- Numbered list design
- Bold typography
- Feature highlights

### Projects Showcase
- 3-column responsive grid
- Card hover animations
- Project links to DevPost
- Gradient backgrounds

### FAQ Accordion
- Smooth expand/collapse
- Click to toggle
- Auto-close other items
- Animated icons

### Newsletter Section
- Call-to-action header
- Email input validation
- Beautiful gradient background
- API integration

### Footer
- Multiple link sections
- Contact information
- Social media links

## 🐦 Bird & Nature Assets

The website includes custom SVG assets:
- Flying birds with gradient fills
- Firefly elements with glow effects
- Geometric mountains
- Sparkle/star elements
- Glowing orbs
- Hexagon shapes

All assets are animated and scale responsively.

## 💾 Database Schema

### users table
```sql
- id (PRIMARY KEY)
- email (UNIQUE)
- password (hashed)
- xp (experience points)
- isAdmin (boolean)
- repoLink (GitHub URL)
- driveLink (Google Drive URL)
- created_at (timestamp)
```

### newsletter table
```sql
- id (PRIMARY KEY)
- email (UNIQUE)
- subscribed (boolean)
- created_at (timestamp)
```

### faq table
```sql
- id (PRIMARY KEY)
- question (text)
- answer (text)
- category (text)
- order_num (integer)
- created_at (timestamp)
```

### projects table
```sql
- id (PRIMARY KEY)
- title (text)
- description (text)
- image_url (text)
- devpost_link (text)
- category (text)
- created_at (timestamp)
```

### user_venues table
```sql
- id (PRIMARY KEY)
- email (FOREIGN KEY)
- venue_id (text)
- visited (boolean)
- completed (boolean)
- task (text)
- created_at (timestamp)
```

## 🌐 API Endpoints

### Public Endpoints
- `GET /` - Landing page
- `GET /api/faq` - Get all FAQs
- `GET /api/projects` - Get all projects
- `POST /api/newsletter` - Subscribe to newsletter

### Auth Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/user/:email` - Get user profile
- `POST /api/user/update/:email` - Update user profile

### Venue Endpoints
- `POST /api/venues/visit` - Mark venue as visited
- `GET /api/venues/:email` - Get user's visited venues

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

All sections automatically adjust layout for smaller screens.

## 🎯 Customization

### Change Theme Colors

Edit `:root` in `landing.css`:

```css
:root {
  --primary: #00f2fe;        /* Cyan */
  --secondary: #7dd3fc;      /* Light Blue */
  --accent: #f0abfc;         /* Purple */
  --accent-pink: #ec4899;    /* Pink */
  --dark-bg: #0f172a;        /* Dark Background */
}
```

### Update Content

Edit section content in `landing-page.html`:
- Hero title and subtitle
- About cards
- Features
- FAQ items
- Newsletter text

### Add More Projects

Create projects in database:
```javascript
INSERT INTO projects (title, description, image_url, devpost_link, category)
VALUES ('Project Name', 'Description', 'image-url', 'devpost-url', 'category');
```

## ⚡ Performance Tips

1. **Image Optimization** - Use WebP format for faster loading
2. **Lazy Loading** - Images load as they come into view
3. **CSS Minification** - Compress CSS for production
4. **Asset Optimization** - SVGs are inline and optimized
5. **Database Indexing** - Add indexes on frequently queried columns

## 🚢 Deployment

### Vercel
```bash
vercel deploy
```

### Render.com
1. Connect GitHub repo
2. Select Node.js environment
3. Add environment variables
4. Deploy

### Heroku
```bash
heroku create your-app-name
heroku config:set DATABASE_URL=your-neon-url
git push heroku main
```

## 🐛 Troubleshooting

### Database Connection Error
- Check DATABASE_URL in .env
- Ensure Neon database is active
- Verify SSL is enabled

### Port Already in Use
```bash
# Change port in .env or run
PORT=3001 node server-neon.js
```

### CORS Errors
- All CORS headers are configured
- Check that API URLs match exactly

## 📚 Resources

- [Neon Database](https://neon.tech)
- [Express.js Docs](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [MDN Web Docs](https://developer.mozilla.org)

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📧 Support

For issues or questions, please open a GitHub issue or contact the team.

---

Made with 💙 for The Summit Community
