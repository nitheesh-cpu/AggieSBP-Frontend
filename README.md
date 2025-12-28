# AggieSB+ 🎓

> **Real-time, multidimensional professor intelligence for every Aggie.**

AggieSB+ is a comprehensive course and professor evaluation platform designed specifically for Texas A&M University students. It combines Rate My Professor data with GPA statistics from anex.us to provide data-driven insights for academic planning.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

### 🔍 **Smart Search & Discovery**

- **Course Search**: Find courses by code, name, or department with real-time filtering
- **Professor Search**: Discover professors with advanced filtering by rating, department, and more
- **Department Browse**: Explore all TAMU departments with aggregated statistics
- **Core Curriculum Discovery**: Find the easiest UCC courses ranked by our custom Easiness Score

### 📊 **Data-Driven Insights**

- **GPA Statistics**: Real GPA data from anex.us for informed decision-making
- **Professor Ratings**: Comprehensive ratings from Rate My Professor reviews
- **Easiness Score**: Custom algorithm combining GPA (50%), difficulty (30%), and quality (20%)
- **Confidence Indicators**: Know how reliable each score is based on available data
- **Tag Analysis**: Frequency-based professor tags from student reviews

### 🔄 **Powerful Comparison Tools**

- **Course Comparison**: Side-by-side comparison of up to 4 courses
- **Professor Comparison**: Compare professors across multiple dimensions
- **Interactive Widgets**: Persistent comparison state across the application

### � **Reveille - Your Aggie Guide**

- **8-Bit Mascot**: Pixel-art Reveille guides you through the platform
- **Smart Explanations**: Reveille explains metrics and features in a friendly way
- **UCC Helper**: Get personalized guidance on core curriculum requirements

### �📱 **Modern User Experience**

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Theme switching with system preference detection
- **Scroll-to-Explore**: Animated hero with scroll indicator for first-time users
- **Smooth Animations**: Motion-based transitions and micro-interactions
- **Accessibility**: WCAG compliant with keyboard navigation support

### 📈 **Advanced Analytics**

- **Review Analysis**: AI-powered sentiment analysis and summary generation
- **A/B Rate Statistics**: See what percentage of students earn A's and B's
- **Statistical Insights**: Enrollment data, section counts, and more

## 🏗️ Tech Stack

### **Frontend**

- **[Next.js 15.3.2](https://nextjs.org/)** - React framework with App Router
- **[React 19.0.0](https://reactjs.org/)** - UI library with latest features
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - Utility-first CSS framework

### **UI Components**

- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[Recharts](https://recharts.org/)** - Composable charting library
- **[Motion](https://motion.dev/)** - Animation library (formerly Framer Motion)

### **State Management**

- **React Context** - Global state management
- **React Hook Form** - Form state and validation
- **Local Storage** - Persistent user preferences and caching

### **Development Tools**

- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Turbopack](https://turbo.build/pack)** - Fast bundler for development

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── compare/           # Comparison tools
│   ├── course/[id]/       # Individual course pages
│   ├── courses/           # Course search and browse
│   ├── departments/       # Department overview
│   ├── discover/          # Discovery tools
│   │   └── ucc/          # Core Curriculum finder
│   ├── professor/[id]/    # Individual professor pages
│   │   └── reviews/      # Professor reviews page
│   ├── professors/        # Professor search and browse
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── home/             # Home page components
│   │   ├── home-hero-scroll.tsx
│   │   ├── reveille-intro.tsx
│   │   ├── quick-links.tsx
│   │   └── ...
│   ├── ui/               # Base UI components (Radix + Tailwind)
│   ├── navigation.tsx    # Main navigation with Discover dropdown
│   ├── footer.tsx        # Site footer
│   └── ...               # Feature-specific components
├── contexts/             # React Context providers
│   ├── ComparisonContext.tsx
│   └── ProfessorComparisonContext.tsx
├── lib/                  # Utility functions and API
│   ├── api.ts           # API client functions
│   └── utils.ts         # Helper utilities
└── hooks/               # Custom React hooks
```

## 🎯 Key Pages & Features

### **Home Page** (`/`)

- Scroll-reveal hero with Academic Plaza background
- "Scroll to explore" indicator for new users
- Reveille intro section explaining the platform
- Data statistics (courses, professors, reviews)
- Quick links to main features

### **Core Curriculum Discovery** (`/discover/ucc`)

- Find the easiest UCC courses by category
- Easiness Score ranking with confidence indicators
- Professor A/B rates and GPA statistics
- Reveille explains the metrics in a friendly way
- Term-based filtering

### **Course Search** (`/courses`)

- Advanced filtering by department, GPA, difficulty
- Real-time search with debouncing
- Sortable results with pagination

### **Professor Search** (`/professors`)

- Filter by rating, department, courses taught
- Tag-based filtering system
- Add to comparison functionality

### **Course Details** (`/course/[id]`)

- Comprehensive course information
- Professor listings with ratings
- GPA statistics and trends
- Related courses suggestions
- Dynamic page titles (e.g., "CSCE 121 - Aggie Schedule Builder Plus")

### **Professor Details** (`/professor/[id]`)

- Detailed professor profile
- Course history and ratings
- AI-generated review summaries
- Teaching statistics
- Dynamic page titles with professor names

### **Professor Reviews** (`/professor/[id]/reviews`)

- Compact, scannable review cards
- Inline metrics (clarity, difficulty, helpfulness)
- Course and rating filters
- Would-retake indicators

### **Comparison Tools** (`/compare`)

- Side-by-side course comparison
- Professor comparison with multiple metrics
- Export and share functionality

## 🌐 API Integration

AggieSB+ integrates with a custom backend API that provides:

- **Course Data**: Comprehensive course information from TAMU
- **Professor Data**: Faculty information and ratings
- **GPA Statistics**: Historical grade distributions from anex.us
- **Review Data**: Student reviews and ratings from Rate My Professor
- **UCC Data**: Core curriculum course listings with easiness scores

### Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

For detailed API documentation, see [API Docs](https://api-aggiesbp.servehttp.com/docs).

## 🎨 Design System

The application uses a consistent design system built on:

- **Color Palette**: TAMU maroon (#500000) with gold accent (#FFCF3F)
- **Typography**: System fonts with careful hierarchy
- **Spacing**: 8px grid system
- **Dark Mode**: Premium dark theme with glass morphism effects
- **Components**: Accessible, reusable UI components
- **Animations**: Scroll-reveal effects and micro-interactions
- **8-Bit Elements**: Pixel-art Reveille mascot with retro styling

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/nitheesh-cpu/aggiesbp-frontend.git
cd aggiesbp-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

## 🤝 Contributing

We welcome contributions from the TAMU community! Here's how you can help:

### **Reporting Issues**

- **[Report a Bug](https://github.com/nitheesh-cpu/aggiesbp-frontend/issues/new?assignees=maintainer&labels=bug%2Ctriage&projects=&template=01-bug-report.yml&title=%5BBug%5D%3A+)** - Found something broken?
- **[Request a Feature](https://github.com/nitheesh-cpu/aggiesbp-frontend/issues/new?assignees=maintainer&labels=enhancement%2Cfeature-request&projects=&template=02-feature-request.yml&title=%5BFeature%5D%3A+)** - Have an idea for improvement?

### **Development Workflow**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### **Code Standards**

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Add comments for complex logic
- Ensure responsive design compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Texas A&M University** - For providing the educational context
- **Rate My Professor** - For professor rating data
- **anex.us** - For GPA statistics
- **Radix UI** - For accessible component primitives
- **Vercel** - For hosting and deployment platform

## 📞 Support

- **📧 General Questions**: [Create an issue](https://github.com/nitheesh-cpu/aggiesbp-frontend/issues)
- **🐛 Bug Reports**: Use our [bug report template](https://github.com/nitheesh-cpu/aggiesbp-frontend/issues/new?template=01-bug-report.yml)
- **💡 Feature Requests**: Use our [feature request template](https://github.com/nitheesh-cpu/aggiesbp-frontend/issues/new?template=02-feature-request.yml)

---

<div align="center">
  <p>Made with ❤️ for the Aggie community</p>
  <p>
    <a href="https://github.com/nitheesh-cpu">GitHub</a> •
    <a href="https://www.linkedin.com/in/nitheesh-kodarapu/">LinkedIn</a>
  </p>
</div>
