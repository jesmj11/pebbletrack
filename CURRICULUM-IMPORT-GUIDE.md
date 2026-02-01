# 📚 Complete Curriculum Import Guide for PebbleTrack

## The Problem: No API Access
Most curriculum websites (Saxon Math, Teaching Textbooks, Apologia, etc.) don't provide APIs for programmatic access. This guide provides **4 practical solutions** to get your lesson structures into PebbleTrack.

---

## 🚀 **Four Import Methods**

### **1. 📊 CSV/Excel Import** 
*Best for: Organized data, bulk imports*

#### How to Use:
1. **Download the CSV Template** from `/curriculum-import`
2. **Fill in your lesson data** using spreadsheet software:
   ```
   Lesson Number,Title,Type,Estimated Minutes,Description
   1,Introduction to Fractions,lesson,30,Basic fraction concepts
   2,Adding Fractions,lesson,35,Adding fractions with common denominators
   3,Fractions Quiz,quiz,20,Assessment of fraction basics
   ```
3. **Upload the file** via drag-and-drop or file picker
4. **Preview and import** with automatic validation

#### Template Columns:
- **Lesson Number**: Sequential numbering (1, 2, 3...)
- **Title**: Lesson name ("Adding Fractions", "Quiz 1", etc.)
- **Type**: `lesson`, `quiz`, `test`, or `review`
- **Estimated Minutes**: Duration (20-90 minutes typical)
- **Description**: Optional details

---

### **2. 📋 Copy-Paste Smart Parser** 
*Best for: Website content, quick imports*

#### How to Use:
1. **Copy lesson lists** from curriculum websites
2. **Paste into the text area** in PebbleTrack
3. **Smart parser automatically**:
   - Extracts lesson numbers and titles
   - Identifies quiz/test/review types by keywords
   - Estimates appropriate durations
   - Provides import suggestions

#### Example Input:
```
Lesson 1: Introduction to Fractions
Lesson 2: Adding Fractions
Quiz 1: Fractions Review
Lesson 3: Subtracting Fractions
Test 1: Fractions Assessment
```

#### What the Parser Detects:
- **Lesson numbers** from various formats
- **Keywords**: "quiz", "test", "review", "assessment"
- **Time estimates** based on lesson type
- **Formatting inconsistencies** for cleanup suggestions

---

### **3. ✏️ Manual Entry Interface** 
*Best for: Small curricula, custom content*

#### How to Use:
1. **Enter curriculum details** (name, subject, publisher)
2. **Add lessons one-by-one**:
   - Title and type selection
   - Duration slider
   - Optional descriptions
3. **Real-time preview** of your curriculum structure
4. **Save when complete** with validation

#### Features:
- **Live lesson counter** and organization
- **Type-specific duration defaults** (quiz=20min, test=45min)
- **Easy editing** and removal of lessons
- **Immediate validation** and error checking

---

### **4. 📚 Template Library** 
*Best for: Popular curricula, proven structures*

#### Pre-Built Templates:
- **Saxon Math 7/6**: 120 lessons with investigations and tests
- **Teaching Textbooks Algebra 1**: 122 lessons with periodic assessments  
- **Apologia General Science**: 16 modules with experiments and tests
- **Trail Guide to Geography**: 36 weekly lessons covering world regions

#### How to Use:
1. **Select a template** from the dropdown
2. **Preview the structure** (lessons, quizzes, tests)
3. **Import with one click** - automatically creates curriculum
4. **Customize after import** if needed

#### Template Structure:
Each template includes:
- **Complete lesson sequence** with proper numbering
- **Integrated assessments** (quizzes every 10-15 lessons, tests every 20-30)
- **Realistic time estimates** based on actual curriculum usage
- **Grade-appropriate pacing** and difficulty progression

---

## 🎯 **Choosing the Right Method**

| Situation | Best Method | Why |
|-----------|-------------|-----|
| **Large curriculum** (100+ lessons) | CSV Import | Bulk processing, spreadsheet power |
| **Website copy-paste** | Smart Parser | Quick extraction from web content |
| **Custom curriculum** | Manual Entry | Full control over every detail |
| **Popular curriculum** | Template Library | Pre-built, tested structures |
| **Mixed sources** | Combination | Use multiple methods as needed |

---

## 🛠️ **Technical Implementation**

### **Smart Parsing Algorithm**
```javascript
// Extracts lesson structure from unformatted text
function smartParseContent(content) {
  - Identifies lesson numbers from multiple formats
  - Classifies content by type (lesson/quiz/test/review)
  - Estimates duration based on keywords and type
  - Provides quality suggestions for improvement
}
```

### **API Integration**
- **`POST /api/curriculums/import/csv`** - Bulk CSV import
- **`POST /api/curriculums/parse`** - Smart text parsing
- **`GET /api/curriculums/templates`** - Available templates
- **`POST /api/curriculums`** - Manual curriculum creation

### **Data Validation**
- **Required fields**: Title, type, lesson number
- **Type validation**: lesson, quiz, test, review only
- **Duration limits**: 5-180 minutes
- **Duplicate detection**: Prevents accidental re-imports

---

## 💡 **Pro Tips for Success**

### **For CSV Imports:**
- **Use sequential numbering** for lessons (1, 2, 3...)
- **Include assessments** every 10-20 lessons for balance
- **Realistic time estimates** (30min lessons, 45min tests)
- **Consistent naming** ("Lesson 1", not "L1" or "First Lesson")

### **For Copy-Paste Parsing:**
- **Clean formatting** works better than messy text
- **Include lesson numbers** when possible
- **Use standard terms** ("Quiz", "Test", not "Assessment #1")
- **Review parsed results** before importing

### **For Manual Entry:**
- **Start with curriculum outline** before adding details
- **Use consistent naming patterns** across lessons
- **Add descriptions** for complex lessons
- **Save frequently** to avoid losing work

### **For Templates:**
- **Preview before importing** to understand structure
- **Customize after import** to match your pace
- **Use as starting points** for similar curricula

---

## 📊 **Integration with PebbleTrack**

### **Automatic Features:**
- **Progress tracking** for each imported lesson
- **Student assignment** to curriculum tracks
- **Completion reporting** and analytics
- **Pacing adjustments** based on student progress

### **Weekly Planning:**
- **Automatic scheduling** from curriculum sequences
- **Flexible pacing** (1-3 lessons per day)
- **Assessment reminders** for quizzes and tests
- **Progress visualization** in the weekly planner

### **Student Experience:**
- **Clear lesson progression** with visual indicators
- **Time estimates** for planning study sessions
- **Completion tracking** with XP and rewards
- **Parent visibility** into curriculum progress

---

## 🎓 **Example Workflows**

### **Saxon Math Setup:**
1. Download Saxon Math template OR
2. Copy lesson list from Saxon website
3. Use smart parser to extract structure
4. Review and import curriculum
5. Assign to students with appropriate pacing

### **Custom Curriculum Creation:**
1. Plan curriculum outline (units, lessons, assessments)
2. Use manual entry for detailed control
3. Add lessons with proper types and timing
4. Include regular assessments for progress tracking
5. Test with one student before full deployment

### **Mixed Source Import:**
1. Use template for main curriculum structure
2. Add custom lessons via manual entry
3. Supplement with parsed content from websites
4. Combine into comprehensive curriculum plan

---

## ✅ **Quality Assurance**

### **Before Importing:**
- [ ] Lesson numbers are sequential
- [ ] All required fields are filled
- [ ] Time estimates are realistic
- [ ] Assessment frequency is appropriate

### **After Importing:**
- [ ] Preview curriculum structure
- [ ] Test with sample student assignment
- [ ] Verify progress tracking works
- [ ] Adjust pacing if needed

### **Ongoing Management:**
- [ ] Monitor student completion rates
- [ ] Adjust time estimates based on reality
- [ ] Add/remove lessons as needed
- [ ] Share successful curricula with community

---

This comprehensive import system solves the "no API" problem by providing multiple practical methods to get any curriculum into PebbleTrack, regardless of the source format or availability of structured data.