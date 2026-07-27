# 🚀 Slack Dev Client

<div align="center">
  <img src="public/logo.png" alt="Slack Dev Logo" width="200" height="200">
  
  ### *A Developer's Best Friend* 
  **Manage Projects at Ease**
  
  ![React](https://img.shields.io/badge/React-19.1+-61DAFB.svg?logo=react&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
  ![Vite](https://img.shields.io/badge/Vite-7.1+-646CFF.svg?logo=vite&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1+-38B2AC.svg?logo=tailwind-css&logoColor=white)
  ![Socket.io](https://img.shields.io/badge/Socket.io-4.8+-010101.svg?logo=socket.io&logoColor=white)
</div>

---

## ✨ **What is Slack Dev Client?**

Slack Dev Client is a **modern, feature-rich frontend application** designed to streamline project management and development workflows. Built with cutting-edge React technologies, it provides a beautiful, responsive user interface that connects seamlessly with the Slack Dev backend to deliver a complete development experience.

## 🎯 **Why Slack Dev Client?**

- 🎨 **Modern UI/UX** - Beautiful, responsive design with dark mode support
- ⚡ **Lightning Fast** - Built with Vite for instant HMR and optimal performance
- 💬 **Real-time Communication** - Socket.io-powered chat and notifications
- 🔐 **Secure Authentication** - JWT-based auth with protected routes
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- 🎭 **Context-Driven** - Clean state management with React Context API
- 🛠️ **Developer Tools** - Code collaboration, project management, and more
- 🎯 **Type-Safe** - TypeScript support for better development experience

---

## 🚀 **Quick Start**

### Prerequisites

- Node.js 18+
- npm or yarn
- Slack Dev Backend Server running (see [server README](../server/README.md))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd core-stack/client

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API endpoint

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in terminal).

### Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080

# Optional: Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
```

---

## 🎨 **Features**

### 🔒 **Authentication & Security**

- Secure login and registration
- Email verification flow
- Password reset functionality
- Protected routes with role-based access
- JWT token management
- Auto-logout on token expiration

### 💬 **Real-time Communication**

- Live chat with Socket.io
- Real-time notifications
- Online/offline status
- Message delivery status
- File sharing in chat

### 📊 **Dashboard & Analytics**

- Comprehensive dashboard with stats
- Task completion tracking
- Project progress visualization
- Meeting schedules
- Activity timeline

### 📋 **Task Management**

- Create, edit, and delete tasks
- Task status tracking
- Priority management
- Due date reminders
- Task assignment to team members

### 📅 **Meeting Management**

- Schedule and manage meetings
- Calendar integration
- Meeting reminders
- Participant management
- Meeting notes and recordings

### 👥 **Team Collaboration**

- Team creation and management
- Role-based permissions
- Team chat channels
- Shared projects
- Team analytics

### 👫 **Social Features**

- Friend system
- User profiles
- Find and connect with users
- Activity feed
- User search

### 🚀 **Project Management**

- Create and manage projects
- Project templates
- Version control integration
- Project sharing
- Bought projects marketplace

### 💻 **Code Collaboration**

- Real-time code editing
- Multi-language support (JavaScript, Python, Java, C++, etc.)
- Syntax highlighting
- Code sharing
- Collaborative coding sessions

### 🎓 **Learning Hub**

- LearnPoint educational content
- Interactive tutorials
- Code examples
- Learning progress tracking

### 🔍 **Explore & Discovery**

- Browse public projects
- Discover trending content
- Search functionality
- Category filtering

### 🎨 **UI/UX Features**

- Dark/Light theme toggle
- Responsive design
- Smooth animations (Framer Motion)
- Loading states and skeletons
- Toast notifications
- Modal dialogs
- Accessible components (Radix UI)

---

## 🏗️ **Architecture**

```
client/
├── 📁 public/           # Static assets
│   └── logo.png
├── 📁 src/
│   ├── 📁 components/   # Reusable UI components
│   │   ├── ui/         # Base UI components (Radix UI)
│   │   └── ...         # Feature components
│   ├── 📁 contexts/    # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── ChatContext.jsx
│   │   ├── NotificationContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── ...
│   ├── 📁 pages/       # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Tasks.jsx
│   │   ├── Chat.jsx
│   │   └── ...
│   ├── 📁 services/    # API service layer
│   │   ├── authService.js
│   │   ├── chatService.js
│   │   └── ...
│   ├── 📁 hooks/       # Custom React hooks
│   ├── 📁 lib/         # Utility libraries
│   │   ├── axios.js    # HTTP client configuration
│   │   └── utils.js    # Helper functions
│   ├── 📁 utils/       # Utility functions
│   ├── 📁 validations/ # Form validation
│   ├── 📁 assets/      # Images, icons, etc.
│   ├── App.jsx         # Main app component
│   ├── App.css         # Global styles
│   ├── main.jsx        # Application entry point
│   └── index.css       # Base styles
├── 📄 package.json
├── 📄 vite.config.js
└── 📄 tailwind.config.js
```

---

## 🔧 **Tech Stack**

| Technology           | Purpose                 | Version |
| -------------------- | ----------------------- | ------- |
| **React**            | UI Framework            | 19.1+   |
| **Vite**             | Build Tool & Dev Server | 7.1+    |
| **React Router**     | Client-side Routing     | 7.9+    |
| **Tailwind CSS**     | Utility-first CSS       | 4.1+    |
| **Axios**            | HTTP Client             | 1.12+   |
| **Socket.io Client** | Real-time Communication | 4.8+    |
| **CodeMirror**       | Code Editor             | 6.0+    |
| **Radix UI**         | Accessible Components   | Latest  |
| **Framer Motion**    | Animation Library       | 12.23+  |
| **Sonner**           | Toast Notifications     | 2.0+    |
| **Recharts**         | Data Visualization      | 3.2+    |
| **Stripe**           | Payment Processing      | Latest  |
| **date-fns**         | Date Utilities          | 4.1+    |

---

## 📱 **Usage Examples**

### Making API Calls

```javascript
import axios from "@/lib/axios";

// Authenticated request
const fetchUserProfile = async () => {
  try {
    const response = await axios.get("/api/user/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
};
```

### Using Context

```javascript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.username}!</p>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </div>
  );
}
```

### Real-time Chat

```javascript
import { useChat } from "@/contexts/ChatContext";

function ChatComponent() {
  const { messages, sendMessage, isConnected } = useChat();

  const handleSend = (text) => {
    sendMessage(text);
  };

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.text}</div>
      ))}
    </div>
  );
}
```

### Protected Routes

```jsx
import ProtectedRoute from "@/components/ProtectedRoute";

<Route
  path="/dashboard"
  element={
    <ProtectedRoute requireAuth={true}>
      <Dashboard />
    </ProtectedRoute>
  }
/>;
```

---

## 🎯 **Available Scripts**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 🎨 **Styling Guide**

This project uses **Tailwind CSS** for styling. Key conventions:

- **Dark Mode**: Use `dark:` prefix for dark mode styles
- **Responsive**: Use breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- **Custom Colors**: Defined in `tailwind.config.js`
- **Components**: Reusable UI components in `src/components/ui/`

Example:

```jsx
<div className="bg-white dark:bg-gray-900 p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Hello World
  </h1>
</div>
```

---

## 🔌 **API Integration**

The client communicates with the backend API through:

- **Base URL**: Configured in `.env` as `VITE_API_URL`
- **Axios Instance**: Pre-configured in `src/lib/axios.js`
- **Authentication**: JWT tokens stored in localStorage
- **Error Handling**: Centralized error handling in axios interceptors

---

## 🧩 **Key Components**

### Context Providers

- `AuthContext` - Authentication state and methods
- `ChatContext` - Real-time chat functionality
- `NotificationContext` - Notification management
- `ThemeContext` - Dark/light theme switching
- `SidebarContext` - Sidebar state management
- `SearchContext` - Global search functionality

### UI Components

- `Header` - Main navigation header
- `Sidebar` - Side navigation menu
- `DashboardHeader` - Dashboard-specific header
- `ChatWindow` - Chat interface
- `TaskEditModal` - Task creation/editing
- `MeetingEditModal` - Meeting management
- `ProtectedRoute` - Route protection wrapper

---

## 🎯 **Perfect For**

- 🚀 **Startups** building modern web applications
- 👨‍💻 **Developers** needing a complete frontend foundation
- 🏢 **Teams** wanting consistent UI/UX patterns
- 📱 **Full-Stack Apps** requiring real-time features
- 🌐 **SaaS Applications** with user management needs

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 **Support**

If you find this project helpful, please give it a ⭐ on GitHub!

For support and questions:

- 📧 Email: support@slackdev.com
- 💬 Issues: [GitHub Issues](https://github.com/slack-dev-client/issues)
- 📖 Docs: [API Documentation](http://localhost:8080/api-docs)

---

## 🐛 **Troubleshooting**

### Common Issues

**Port already in use:**

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Module not found errors:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build errors:**

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

---

<div align="center">
  <p><strong>Made with ❤️ by developers, for developers</strong></p>
  <p><em>Slack Dev Client - Where Development Meets Simplicity</em></p>
</div>
