# Reem RPG - Fantasy Adventure Game

# Overview
Reem RPG is an immersive fantasy role-playing game where players create characters, embark on quests, and compete on leaderboards. Built with React for the frontend and ASP.NET Core for the backend, this project delivers a complete gaming experience with user authentication, character management, and adventure gameplay.

# Features

- User Authentication: Secure login and registration system with email verification
- Character System: Create and customize characters with different classes
- Character Selection: Players can have multiple characters and switch between them
- Leaderboard: Compete with other players based on experience and gold
- Adventure Mode: Complete quests and earn rewards
- Responsive Design: Playable on desktop and mobile devices

# Technologies

Frontend
- React 18
- React Router for navigation
- Context API for state management
- Vite for fast development and building
- Axios for API communication
- CSS for styling (with responsive design)

Backend
- ASP.NET Core 8.0 Web API
- Entity Framework Core for database management
- SQL database for data storage
- JWT authentication for secure API access
- Email service integration for verification

# Getting Started

Prerequisites
- Node.js (v16+)
- .NET SDK 8.0
- SQL Server/SQLite

## Frontend Setup

1. Clone the repository
git clone https://github.com/yourusername/ReemRPGFrontend.git
cd ReemRPGFrontend

2. Install dependencies
npm install

3. Start the development server
npm run dev

4. Open your browser and navigate to http://localhost:5173

## Backend setup

1. Clone the backend repository 
git clone https://github.com/yourusername/ReemRPG.git
cd ReemRPG

2. Restore packages
dotnet restore

3. Update the database connection string in appsettings.json

4. Run migrations
dotnet ef database update

5. Run the API
dotnet run

6. API will be available at http://localhost:5233

# Game Mechanics

Characters: Choose between Warrior, Archer, Mage and more classes
Leveling: Gain experience points to level up your character
Gold: Earn gold by completing quests and challenges
Items: Equip weapons and armor to improve your character's stats

# Future Development

PvP battles between players
Guilds and team gameplay
Expanded quest system with story arcs
Crafting and economy system
Mobile app version

# License

This project is licensed under the MIT License - see the LICENSE file for details.

Project Link: https://github.com/yourusername/ReemRPGFrontend

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# ReemRPGFrontend

© 2025 Reem RPG. All rights reserved.