# Common Login Frontend

This is a React-based frontend application for the Hira Community system.

## Features

- **User Authentication**: Login system for both admin and regular users
- **Admin Dashboard**: Comprehensive admin interface with user management
- **District Management**: CRUD operations for districts
- **Area Management**: CRUD operations for areas with district relationships
- **Members Group Management**: CRUD operations for members groups with area and district relationships
- **Halqa Management**: CRUD operations for halqas
- **User Management**: Complete user administration
- **App Management**: Application management system

## District Management

The District page provides full CRUD (Create, Read, Update, Delete) functionality:

### Features:
- **Create**: Add new districts with unique names
- **Read**: View all districts with creation and update timestamps
- **Update**: Edit existing district names
- **Delete**: Remove districts with confirmation (warns about impact on related areas)

### Usage:
1. Navigate to "DISTRICT" in the sidebar
2. Fill out the form with:
   - District Name (required, must be unique)
3. Click "Create District" to add a new district
4. Use the edit/delete buttons to modify existing districts

### API Endpoints:
- `GET /api/districts` - Fetch all districts
- `POST /api/districts` - Create new district
- `PUT /api/districts/:id` - Update existing district
- `DELETE /api/districts/:id` - Delete district

## Members Group Management

The Members Group page provides full CRUD (Create, Read, Update, Delete) functionality:

### Features:
- **Create**: Add new members groups with title, district, and area
- **Read**: View all members groups with their associated district and area information
- **Update**: Edit existing members groups
- **Delete**: Remove members groups with confirmation

### Usage:
1. Navigate to "MEMBERS GROUP" in the sidebar
2. Fill out the form with:
   - District (required)
   - Area (required, filtered based on selected district)
   - Group Name (required)
3. Click "Create Group" to add a new group
4. Use the edit/delete buttons to modify existing groups

### API Endpoints:
- `GET /api/members` - Fetch all members groups
- `POST /api/members` - Create new members group
- `PUT /api/members/:id` - Update existing members group
- `DELETE /api/members/:id` - Delete members group

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Make sure the backend server is running on `http://localhost:3000`

## Dependencies

- React 19.1.0
- React Router DOM 7.6.2
- Axios 1.10.0
- React Icons 5.5.0
- Tailwind CSS 4.1.10

## Backend Integration

This frontend connects to a Node.js/Express backend with MongoDB. The backend provides RESTful APIs for all CRUD operations and includes authentication middleware for admin-only operations.
