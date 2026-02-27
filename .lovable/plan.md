

# Smart City Citizen Issue Processing & Tracking System

## Overview
A full-stack complaint management system where citizens report city issues, and authorities manage and resolve them — built with React + Supabase (database, auth, storage, edge functions).

---

## 1. Authentication & User Roles
- Secure registration and login with email/password via Supabase Auth
- Three roles: **Citizen**, **Admin**, **Department Officer**
- Role-based access control — citizens see their own complaints; admins and officers see all
- Separate `user_roles` table with secure role-checking functions
- User profiles with name, phone, and city info

## 2. Citizen Portal
- **Submit Complaint** form with:
  - Category & sub-category dropdowns (Infrastructure, Water, Waste, Electricity, Public Safety, Environment, Public Services — with all subcategories from the spec)
  - Detailed description text area
  - Image upload for proof (stored in Supabase Storage)
  - Location selection (City + Area)
- **My Complaints** page — view all submitted complaints with status badges
- **Complaint Detail** view with full status history timeline
- Real-time status tracking (Open → In Progress → Resolved → Closed)

## 3. Admin Dashboard
- **Overview analytics** with charts:
  - Complaints by category (bar chart)
  - Complaints by status (pie chart)
  - Complaints by location (bar chart)
  - Trend over time (line chart)
- **All Complaints** table with filters for category, location, status, and priority
- Search and pagination
- Assign complaints to departments/officers
- Update complaint status and priority
- **Export data as CSV**

## 4. Department Officer View
- View complaints assigned to their department
- Update status with notes (creates status history entry)
- Filter and search assigned complaints

## 5. Complaint Lifecycle
- Statuses: Open, In Progress, Resolved, Closed, Rejected
- Priority levels: Low, Medium, High
- Full status history timeline with timestamps and officer notes
- Automatic timestamp tracking on every status change

## 6. UI Design
- Modern, professional Smart City theme with a clean blue/teal color palette
- Responsive layout — works on desktop and mobile
- Sidebar navigation for admin/officer, simple top nav for citizens
- Cards, badges, and data tables for a polished government-app feel

## 7. Database Structure (Supabase/PostgreSQL)
- `profiles` — user info linked to auth
- `user_roles` — role assignments (citizen, admin, officer)
- `complaints` — all complaint data with category, location, status, priority
- `complaint_status_history` — timeline of status changes
- `departments` — department list for assignment
- Storage bucket for complaint images
- Row-Level Security on all tables

