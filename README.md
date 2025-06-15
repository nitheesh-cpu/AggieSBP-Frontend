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

### 📊 **Data-Driven Insights**

- **GPA Statistics**: Real GPA data from anex.us for informed decision-making
- **Professor Ratings**: Comprehensive ratings from Rate My Professor reviews
- **Difficulty Ratings**: Course difficulty assessments based on student feedback
- **Tag Analysis**: Frequency-based professor tags from student reviews

### 🔄 **Powerful Comparison Tools**

- **Course Comparison**: Side-by-side comparison of up to 4 courses
- **Professor Comparison**: Compare professors across multiple dimensions
- **Interactive Widgets**: Persistent comparison state across the application

### 📱 **Modern User Experience**

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Theme switching with system preference detection
- **Interactive Demos**: Built-in tutorials and sample searches
- **Accessibility**: WCAG compliant with keyboard navigation support

### 📈 **Advanced Analytics**

- **Review Analysis**: Sentiment analysis and tag extraction from reviews
- **Trend Visualization**: Charts and graphs for GPA and rating trends
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
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

### **State Management**

- **React Context** - Global state management
- **React Hook Form** - Form state and validation
- **Local Storage** - Persistent user preferences

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
│   ├── professor/[id]/    # Individual professor pages
│   ├── professors/        # Professor search and browse
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Radix + Tailwind)
│   ├── navigation.tsx    # Main navigation
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

- Hero section with search functionality
- Featured departments and courses
- Quick access to comparison tools

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

### **Professor Details** (`/professor/[id]`)

- Detailed professor profile
- Course history and ratings
- Student reviews and tags
- Teaching statistics

### **Comparison Tools** (`/compare`)

- Side-by-side course comparison
- Professor comparison with multiple tabs
- Export and share functionality

### **About Page** (`/about`)

- Interactive feature demonstrations
- Platform overview and mission
- Getting started guide

## 🌐 API Integration

AggieSB+ integrates with a custom backend API that provides:

- **Course Data**: Comprehensive course information from TAMU
- **Professor Data**: Faculty information and ratings
- **GPA Statistics**: Historical grade distributions from anex.us
- **Review Data**: Student reviews and ratings from Rate My Professor

For detailed API documentation, see [API Docs](https://api-aggiesbp.servehttp.com/docs).

## 🎨 Design System

The application uses a consistent design system built on:

- **Color Palette**: TAMU maroon (#500000) with neutral grays
- **Typography**: System fonts with careful hierarchy
- **Spacing**: 8px grid system
- **Components**: Accessible, reusable UI components
- **Animations**: Subtle transitions and micro-interactions

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
