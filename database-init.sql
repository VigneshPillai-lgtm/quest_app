-- ====================================================
-- THE SUMMIT - Database Initialization Script
-- Run this after setting up your Neon database
-- ====================================================

-- Insert sample FAQs
INSERT INTO faq (question, answer, category, order_num) VALUES
('What is The Summit?', 'The Summit is a 48-hour hackathon where 1000+ students come together to build innovative projects, learn new skills, and connect with industry leaders.', 'General', 1),
('Who can participate?', 'Students of any education level from anywhere in the world are eligible to apply. All attendees must be 13 years or older.', 'General', 2),
('Is there a cost to attend?', 'No! Admission is completely free. We cover food, accommodation, and all resources you need to build an amazing project.', 'General', 3),
('What if I''ve never hacked before?', 'Perfect! The Summit welcomes hackers of all skill levels. We provide workshops, mentorship, and resources to help you succeed.', 'Beginner', 4),
('When and where is The Summit?', 'The Summit takes place in September at a central location. Applications open in June. Follow our updates for exact dates and location!', 'General', 5),
('Can I form a team?', 'Yes! Teams can have up to 4 people. You can form teams before the event or during the event itself.', 'Teams', 6),
('What technologies can we use?', 'You can use any programming language, framework, or technology you want. Sky is the limit!', 'Technical', 7),
('Will there be mentorship?', 'Yes! 180+ industry mentors from top companies will be available to help with your project.', 'Support', 8);

-- Insert sample projects
INSERT INTO projects (title, description, image_url, devpost_link, category) VALUES
('AI Code Assistant', 'Autonomous AI agents that help developers write better code with real-time suggestions and intelligent debugging.', 'https://via.placeholder.com/400x300?text=AI+Code', 'https://devpost.com', 'AI/ML'),
('Health Tracker', 'Real-time health monitoring app that syncs with wearables and provides AI-powered health insights.', 'https://via.placeholder.com/400x300?text=Health+Tracker', 'https://devpost.com', 'Healthcare'),
('Web3 Community', 'Decentralized social network built on blockchain with NFT integration and tokenomics.', 'https://via.placeholder.com/400x300?text=Web3', 'https://devpost.com', 'Web3'),
('IoT Weather Station', 'Smart weather monitoring system using Arduino and cloud computing for real-time data.', 'https://via.placeholder.com/400x300?text=IoT', 'https://devpost.com', 'IoT'),
('Gaming Engine', 'Custom 3D gaming engine built with WebGL supporting multiplayer networking.', 'https://via.placeholder.com/400x300?text=Gaming', 'https://devpost.com', 'Gaming'),
('Mobile Fitness App', 'AI-powered fitness coaching app that creates personalized workout plans based on user data.', 'https://via.placeholder.com/400x300?text=Fitness', 'https://devpost.com', 'Mobile');

-- Display verification
SELECT 'FAQs loaded:' as status, COUNT(*) as count FROM faq;
SELECT 'Projects loaded:' as status, COUNT(*) as count FROM projects;

-- Sample user (optional - use /api/register for production)
-- INSERT INTO users (email, password, xp, isAdmin) VALUES
-- ('admin@thesummit.com', 'hashed_password_here', 1000, true);
