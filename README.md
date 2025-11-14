# MindLink AI - Mental Wellness Support Platform

MindLink AI is an AI-powered mental wellness support platform that connects users with empathetic AI chat, real-time voice support circles, and comprehensive community resources for mental health support.

## Features

- 🤖 **AI-Powered Chat**: Compassionate AI companion for mental wellness support
- 🎙️ **Voice Support Circles**: Real-time voice rooms for community connection
- 📊 **Mood Tracking**: Daily mood check-ins with trend analysis
- 📅 **Community Events**: Join or create wellness events and workshops
- 📚 **Resources**: Access mental health resources and crisis support
- 🔒 **Privacy-Focused**: Anonymous mode and secure, encrypted communication

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd mindlink-support

# Step 3: Install the necessary dependencies
npm i

# Step 4: Start the development server
npm run dev
```

## Technology Stack

This project is built with modern web technologies:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - High-quality component library
- **Tailwind CSS** - Utility-first CSS framework
- **Agora** - Real-time voice communication
- **MongoDB** - Database for user data and conversations

## Development

### Frontend Development

```sh
npm run dev
```

Runs the app in development mode at `http://localhost:8080`

### Backend Development

```sh
cd backend
npm install
npm run dev
```

Runs the backend server at `http://localhost:3001`

### Building for Production

```sh
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Deployment

This project can be deployed to any hosting platform that supports Node.js applications:

- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Deploy with continuous integration
- **Heroku**: Traditional hosting platform
- **AWS/Google Cloud/Azure**: Cloud hosting options

## Project Structure

```
mindlink-support/
├── src/              # Frontend React application
│   ├── components/   # React components
│   ├── pages/        # Page components
│   ├── lib/          # Utilities and API clients
│   └── contexts/     # React contexts
├── backend/          # Node.js/Express backend
│   ├── routes/       # API routes
│   ├── models/       # Database models
│   └── utils/        # Backend utilities
└── public/           # Static assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Support

For support, please contact the MindLink AI team or open an issue in the repository.