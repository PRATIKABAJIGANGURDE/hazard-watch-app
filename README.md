# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c6a23b81-312a-4630-8287-139505c88c81

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c6a23b81-312a-4630-8287-139505c88c81) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Development Workflow

### Local Development
The same steps above apply for local development. The app will be available at `http://localhost:8080`

### Code Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── Dashboard.tsx    # Main dashboard layout
│   ├── Navigation.tsx   # Top navigation bar
│   ├── HazardMap.tsx    # Interactive map component
│   ├── FilterSidebar.tsx # Filtering interface
│   ├── LiveFeed.tsx     # Real-time updates feed
│   └── ReportModal.tsx  # Hazard reporting form
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── pages/               # Route components
└── index.css           # Design system & global styles
```

### Key Features Implemented

#### 🗺️ Interactive Map System
- Hazard visualization with color-coded markers
- Tooltip information on hover
- Zoom and pan functionality
- Coastal region focus for Indian Ocean

#### 📊 Real-time Dashboard
- Live statistics display
- Verification status indicators
- Activity timeline
- Alert notifications

#### 🔧 Offline-First Architecture
- Service worker integration ready
- IndexedDB for local storage
- Background sync capabilities
- Network status awareness

#### 🎨 Design System
- Ocean-themed color palette
- HSL-based color tokens
- Responsive breakpoints
- Accessible contrast ratios
- Smooth animations and transitions

## Deployment

### Quick Deploy
Simply open [Lovable](https://lovable.dev/projects/c6a23b81-312a-4630-8287-139505c88c81) and click on Share → Publish.

### Custom Domain
To connect a custom domain:
1. Navigate to Project > Settings > Domains in Lovable
2. Click Connect Domain
3. Follow the DNS configuration steps

*Note: A paid Lovable plan is required for custom domains.*

## API Integration

The app is designed to work with a backend API for:
- Hazard report submission and retrieval
- User authentication and authorization
- Real-time notifications
- Social media monitoring
- Verification workflow

### Recommended Backend Stack
- **Supabase** - Database, authentication, real-time subscriptions
- **Edge Functions** - Serverless API endpoints
- **Webhooks** - Third-party integrations
- **Storage** - Media file handling

## Contributing

This project follows the INCOIS development standards for emergency response systems:

1. **Security First** - All user data is handled securely
2. **Offline Resilience** - App must work without internet
3. **Fast Response** - Optimized for emergency situations
4. **Accessibility** - Usable by all community members
5. **Mobile Priority** - Designed for field reporting

## License & Usage

Developed for the Indian National Centre for Ocean Information Services (INCOIS).
This system is intended for official use in ocean hazard monitoring and public safety.

## Support

For technical support or feature requests:
- Create issues in this repository
- Contact the INCOIS development team
- Refer to the [Lovable documentation](https://docs.lovable.dev/)

---

**🌊 Protecting coastal communities through technology and collaboration**
