# AutoAuth Frontend

The **AutoAuth Frontend** is a modern, responsive dashboard interface built for healthcare providers and staff to manage Prior Authorization cases effortlessly. It features real-time case tracking, AI-driven insight visualization, and seamless document upload management.

## ✨ Key Features

- **Case Management Dashboard**: Overview of all active, pending, and completed PA cases.
- **AI Insights Viewer**: Visualize detailed eligibility checks and clinical gap analyses performed by AI agents.
- **Document Management**: Easy upload and preview of patient clinical documents.
- **Real-time Status Tracking**: Instant visual updates on case progress and payer responses.
- **Interactive Forms**: User-friendly forms for initiating new authorization requests.
- **Status Badges & Animations**: Sleek, professional UI using Framer Motion and Lucide Icons.

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide-React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Routing**: [React Router Dom](https://reactrouter.com/)

## 📁 Project Structure

```text
frontend/
├── src/
│   ├── components/  # Reusable UI components (Buttons, Cards, Badges)
│   ├── pages/       # Main application views (Dashboard, CaseDetails, NewCase)
│   ├── services/     # API service layer (Axios instances, endpoint definitions)
│   ├── assets/       # Static images, fonts, and global assets
│   ├── context/      # React contexts (Auth, CaseProvider)
│   ├── hooks/        # Custom React hooks (useAuth, useCase)
│   ├── utils/        # Helper functions and constants
│   ├── App.jsx       # Root component and routing
│   └── main.jsx      # Entry point
├── index.html        # HTML template
├── postcss.config.js # Styling configuration
└── vite.config.js    # Vite build settings
```

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (Latest LTS version recommended)
- npm or yarn

### 2. Install Dependencies
```bash
npm install
```

### 3. Running the Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
The output will be in the `dist/` directory.

## 🎨 Design Principles
Frontend excellence is achieved through:
- **Responsive Layouts**: Accessible on any device.
- **Micro-animations**: Enhanced UX with smooth transitions.
- **Consistent Theming**: Professional, accessible healthcare aesthetics.
- **Error Resilience**: Informative feedback on API failures and form validation.
