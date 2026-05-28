# Frontend Design Specification

This document outlines the UI/UX design, visual identity, and page-by-page feature breakdown for the Project Management Web App, drawing inspiration from modern tools like Jira and Linear.

---

## 🎨 Visual Identity & Design System

The application will use a clean, professional "Light Mode" theme to ensure maximum readability and a premium feel.

### Color Palette
- **Backgrounds**:
  - Main App Background: `#F4F5F7` (A soft, off-white/light gray to reduce eye strain)
  - Card/Modal Background: `#FFFFFF` (Pure white to make content pop against the main background)
- **Primary Accents**:
  - Primary Action Blue: `#2563EB` (Modern, vibrant blue for main buttons and active states)
  - Hover Blue: `#1D4ED8` (Slightly darker blue for hover states)
- **Text & Typography**:
  - Primary Text (Headings/Important text): `#111827` (Near black)
  - Secondary Text (Descriptions/Metadata): `#6B7280` (Medium gray)
- **Status & Semantic Colors**:
  - Success/Done: `#10B981` (Green)
  - Warning/In Progress: `#F59E0B` (Amber/Yellow)
  - Danger/Overdue: `#EF4444` (Red)
  - Borders/Dividers: `#E5E7EB` (Light gray)

### Typography
We will use **Inter** (available via Google Fonts) for a highly legible, modern sans-serif look.
- **H1 (Page Titles)**: 24px, Semi-Bold, Color: `#111827`
- **H2 (Section/Modal Titles)**: 18px, Semi-Bold, Color: `#111827`
- **H3 (Card Titles/Task Names)**: 15px, Medium, Color: `#111827`
- **Body Text**: 14px, Regular, Color: `#4B5563`
- **Small Text (Dates, Tags, Metadata)**: 12px, Medium, Color: `#6B7280`

---

## 📐 Global Layout Components

Every page (except Auth) will share this underlying structure:

1. **Left Sidebar (Navigation)**:
   - Fixed width, dark or very light background.
   - Links: **Dashboard**, **Projects**, **My Tasks**.
   - Admin Links (conditional): **User Management**.
   - Bottom: Settings, Logout.
2. **Top Navigation Bar**:
   - **Global Search**: Search bar to quickly find tasks or projects by name.
   - **Quick Create Button**: A primary blue `+ Create` button that opens a modal to create a task from anywhere.
   - **User Profile**: Avatar showing user initials.

---

## 📄 Pages & Features Description

### 1. Authentication Pages (Login & Signup)
- **Layout**: A split-screen design. The left side features a subtle gradient or brand illustration, and the right side contains the form centered vertically.
- **Elements**:
  - "Welcome Back" / "Create an Account" heading.
  - Input fields with clean borders (Email, Password, Name).
  - Full-width Primary Blue submit button.
  - Subtle link to toggle between Login and Signup.

### 2. Dashboard (Home)
- **Purpose**: A personalized command center showing what the user needs to focus on immediately.
- **Elements**:
  - **Greeting**: "Good Morning, [Name]".
  - **Metrics Row**: Three large cards showing:
    1. Total Tasks Assigned to Me.
    2. Completed Tasks.
    3. Overdue Tasks (Highlighted with red text).
  - **My Priority Tasks List**: A clean table or list view of tasks assigned to the user, sorted by nearest due date.
    - Columns: Task Key (e.g., PRJ-12), Title, Project Name, Status Badge, Due Date.

### 3. Projects Directory
- **Purpose**: A hub to view all projects the user is a part of.
- **Elements**:
  - Page Title: "Projects".
  - **"New Project" Button** (Top right, visible to Admins only).
  - **Project Cards Grid**:
    - Each card represents a project.
    - Elements inside the card: Project Title, truncated description, a mini progress bar (tasks done / total tasks), and overlapping avatar circles showing team members.

### 4. Project Detail & Task Board (Jira-Style Kanban)
- **Purpose**: The core working area for a specific project.
- **Layout**:
  - **Header**: Project Name, horizontal list of member avatars, "Add Member" button (Admin), and a "Create Task" button.
  - **View Toggles**: Buttons to switch between "Board View" (Kanban) and "List View" (Table).
- **Kanban Board Elements**:
  - **Columns**: "To Do", "In Progress", "Done". Columns have a light gray background (`#F4F5F7`).
  - **Task Cards**: White cards (`#FFFFFF`) with a subtle shadow that sit inside the columns.
    - *Card Details*: Task ID (e.g., TSK-4), Task Title, Priority Icon (Up/Down arrow), Due Date badge (turns red if overdue), Assignee Avatar.
  - **Interactivity**: Cards can be dragged and dropped between columns to instantly update their status.

### 5. Task Detail Modal
- **Purpose**: A deep-dive view that opens when clicking a Task Card, allowing users to view and edit all task information without leaving the board.
- **Layout**: Two-column layout inside the modal.
- **Elements**:
  - **Left Column (Content)**:
    - Task Title (Editable H2).
    - Description Section: A larger text area for detailed instructions.
    - Activity/Comments: A section showing history (e.g., "Status changed from To Do to In Progress").
  - **Right Column (Metadata)**:
    - **Status Dropdown**: Switch between To Do, In Progress, Done.
    - **Assignee Dropdown**: Searchable list of project members.
    - **Due Date Picker**.
    - **Delete Task Button**: A red outlined button at the very bottom (Admin only).
