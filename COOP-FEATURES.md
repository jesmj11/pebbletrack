# Co-Op Features for PebbleTrack

## ✅ What's Been Added

### **Enhanced Subject Options**
- Added Co-Op subject categories:
  - Co-Op (general)
  - Co-Op Math
  - Co-Op Science
  - Co-Op History
  - Co-Op Art
  - Co-Op PE

### **Co-Op Specific Fields**
When you select a Co-Op subject, additional fields appear:
- **Location**: Where the co-op meets (e.g., "Community Center", "Smith House")
- **Meeting Time**: When the co-op meets (time picker)

### **Visual Enhancements**
- Co-Op classes have distinctive purple/blue gradient styling
- Orange left border to distinguish from regular classes
- Location and time displayed with icons: 📍 Location, 🕐 Time
- Clear visual differentiation when completed vs active

### **Database Schema**
Added comprehensive Co-Op support:
- `coop_groups` table for managing co-op groups
- `coop_group_members` table for student membership
- Enhanced `planner_tasks` table with location and meeting time fields

### **API Endpoints**
New Co-Op management endpoints:
- `GET /api/planner/coop-groups` - List all co-op groups
- `POST /api/planner/coop-groups` - Create new co-op group
- `POST /api/planner/coop-groups/:id/members` - Add student to group
- `DELETE /api/planner/coop-groups/:groupId/members/:studentId` - Remove student from group

## 🎯 How to Use

### **Adding Co-Op Classes**
1. Click any day/student cell in the weekly planner
2. Select a "Co-Op" subject from the dropdown
3. Location and time fields will automatically appear
4. Fill in the co-op details (location, meeting time)
5. Select which days the co-op meets
6. Add the class

### **Visual Identification**
- Regular classes: Green background
- Co-Op classes: Purple/blue gradient with orange border
- Co-Op details show location and time with icons

## 🚀 Future Enhancements

### **Group Management UI** (Suggested)
- Dedicated co-op group management page
- Bulk assign students to co-op groups
- Co-op attendance tracking
- Parent communication features for co-op coordinators

### **Advanced Scheduling** (Suggested)
- Recurring co-op schedule templates
- Multi-week co-op planning
- Co-op resource sharing (curriculum materials, supplies)

### **Reporting Features** (Suggested)
- Co-op attendance reports
- Co-op participation tracking across families
- Coordinator communication tools

## 📝 Notes
- All existing functionality remains unchanged
- Co-Op features are additive and optional
- Visual styling makes Co-Op classes easily identifiable
- Database schema supports future group management features

The Co-Op functionality seamlessly integrates with your existing PebbleTrack workflow while adding the collaborative learning features you requested!