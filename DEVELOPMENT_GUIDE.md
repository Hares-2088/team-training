# 💻 Development Guide - TeamTrainer

## Project Overview

**TeamTrainer** is a modern fitness training platform built with:
- React 18 + Next.js 15
- TypeScript for type safety
- Tailwind CSS + shadcn/ui components
- MongoDB for data persistence
- bcryptjs for secure authentication

---

## 🏗️ Architecture

### Frontend Structure
```
Components (Reusable)
    ↓
Pages (Route handlers)
    ↓
API Routes (Backend logic)
    ↓
Database (MongoDB)
```

### Data Flow
```
User Input → Form Component → API Route → Database → Response → UI Update
```

---

## 📝 Development Workflow

### 1. Planning
- Define the feature/page
- Design the UI mockup
- Plan the data flow
- List API endpoints needed

### 2. Backend Development
- Create/update database model
- Create API route
- Add error handling
- Test with Postman/Thunder Client

### 3. Frontend Development
- Create component
- Add form handling
- Connect to API
- Add loading/error states

### 4. Testing
- Test on desktop
- Test on mobile
- Test error cases
- Test edge cases

### 5. Polish
- Add animations
- Improve UX
- Optimize performance
- Clean up code

---

## 🔧 Implementation Guide

### Adding a New Page

1. **Create the page file**
   ```typescript
   // src/app/path/page.tsx
   'use client';
   
   import { useState } from 'react';
   import Link from 'next/link';
   import { Button } from '@/components/ui/button';
   
   export default function YourPage() {
     return (
       <div className="min-h-screen bg-gray-50">
         {/* Your content */}
       </div>
     );
   }
   ```

2. **Add navigation link**
   - Update navbar in layout
   - Add to navigation menu
   - Test the link

3. **Style with Tailwind**
   - Use Tailwind classes
   - Follow existing patterns
   - Mobile responsive design

### Adding a New API Endpoint

1. **Create the route**
   ```typescript
   // src/app/api/endpoint/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { connectDB } from '@/lib/db/mongodb';
   import YourModel from '@/models/YourModel';
   
   export async function POST(request: NextRequest) {
     try {
       await connectDB();
       const data = await request.json();
       
       // Your logic here
       const result = await YourModel.create(data);
       
       return NextResponse.json(result, { status: 201 });
     } catch (error: any) {
       return NextResponse.json(
         { error: error.message },
         { status: 500 }
       );
     }
   }
   ```

2. **Test the endpoint**
   - Use Postman or Thunder Client
   - Test success case
   - Test error case
   - Check response format

3. **Connect to frontend**
   - Fetch data in component
   - Add loading state
   - Handle errors
   - Show success message

### Creating a New Component

1. **Component template**
   ```typescript
   // src/components/YourComponent.tsx
   'use client';
   
   import { useState } from 'react';
   import { Button } from '@/components/ui/button';
   import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
   
   interface Props {
     // Your props
   }
   
   export function YourComponent({ }: Props) {
     const [state, setState] = useState('');
   
     return (
       <Card>
         <CardHeader>
           <CardTitle>Title</CardTitle>
         </CardHeader>
         <CardContent>
           {/* Content */}
         </CardContent>
       </Card>
     );
   }
   ```

2. **Use in pages**
   ```typescript
   import { YourComponent } from '@/components/YourComponent';
   
   export default function Page() {
     return <YourComponent />;
   }
   ```

---

## 🗄️ Database Operations

### Connecting to Database
```typescript
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';

// In your API route
await connectDB();
const users = await User.find();
```

### CRUD Operations

**Create:**
```typescript
const user = await User.create({
  name: 'John',
  email: 'john@example.com',
  password: hashedPassword,
  role: 'trainer'
});
```

**Read:**
```typescript
// Find one
const user = await User.findOne({ email: 'john@example.com' });

// Find all
const users = await User.find();

// Find by ID
const user = await User.findById(id);
```

**Update:**
```typescript
const user = await User.findByIdAndUpdate(
  id,
  { name: 'Jane' },
  { new: true }
);
```

**Delete:**
```typescript
await User.findByIdAndDelete(id);
```

### Relationships
```typescript
// Populate references
const team = await Team.findById(id).populate('trainer').populate('members');

// Filter by reference
const teams = await Team.find({ trainer: userId });
```

---

## 🎨 UI/UX Best Practices

### Colors
- Primary: `text-indigo-600`, `bg-indigo-50`
- Success: `text-green-600`, `bg-green-50`
- Error: `text-red-600`, `bg-red-50`
- Neutral: `text-gray-600`, `bg-gray-50`

### Spacing
```
p-4   → 1rem (padding)
m-4   → 1rem (margin)
gap-4 → 1rem (gap)
```

### Typography
```
text-xl  → Large titles
text-lg  → Section headers
text-sm  → Small text/hints
text-xs  → Tiny text
```

### Responsive
```
grid-cols-1        → Mobile (1 column)
md:grid-cols-2     → Tablet (2 columns)
lg:grid-cols-3     → Desktop (3 columns)
```

---

## 🧪 Testing

### Test API Endpoints
1. Open Postman
2. Create request (POST, GET, etc.)
3. Add headers: `Content-Type: application/json`
4. Add request body
5. Send request
6. Check response

### Test Forms
- Valid input → Should save
- Empty input → Should show error
- Invalid email → Should show error
- On mobile → Should be readable
- Loading → Should show spinner

### Test Navigation
- Links work correctly
- Back buttons work
- Breadcrumbs accurate
- Mobile menu functions

---

## 🐛 Debugging

### Console Logging
```typescript
console.log('Variable:', variable);
console.error('Error:', error);
console.warn('Warning:', message);
```

### Network Tab
1. Open DevTools
2. Go to Network tab
3. Perform action
4. Check API requests
5. Review status codes
6. Check response data

### React DevTools
1. Install React DevTools extension
2. Inspect components
3. Check props
4. Check state
5. Check hooks

---

## 📦 Dependencies Guide

### Key Libraries
```
next             → Framework
react            → UI library
typescript       → Type safety
tailwindcss      → Styling
mongoose         → MongoDB ODM
bcryptjs         → Password hashing
react-hook-form  → Form handling
zod              → Validation
```

### Adding Dependencies
```bash
npm install package-name
npm install --save-dev dev-package
```

### Checking Versions
```bash
npm list package-name
npm outdated
```

---

## 🚀 Deployment Checklist

Before deploying:
- [ ] All API endpoints working
- [ ] Forms validated
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Mobile tested
- [ ] Performance checked
- [ ] Environment variables set
- [ ] Database configured
- [ ] Tests passing
- [ ] Code linted

### Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel
```

---

## 📚 Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [MongoDB](https://docs.mongodb.com)
- [Mongoose](https://mongoosejs.com)

### Learning
- TypeScript handbook
- REST API best practices
- Database design patterns
- Performance optimization

---

## ⚡ Quick Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build production
npm run start        # Start production
npm run lint         # Check code quality

# Database
mongod               # Start MongoDB locally
mongo                # Connect to MongoDB

# Testing
npm test             # Run tests (if configured)
npm run type-check   # Check TypeScript
```

---

## 💡 Pro Tips

1. **Use components liberally**
   - Break pages into smaller components
   - Reuse components across pages
   - Keep components single-purpose

2. **Handle errors gracefully**
   - Try-catch all API calls
   - Show user-friendly messages
   - Log errors for debugging

3. **Optimize performance**
   - Use React.memo for expensive components
   - Lazy load images
   - Minimize bundle size

4. **Keep code clean**
   - Use meaningful variable names
   - Add comments for complex logic
   - Follow existing patterns
   - Remove unused code

5. **Think mobile first**
   - Design for mobile first
   - Test on real devices
   - Use responsive units

6. **Security matters**
   - Hash passwords
   - Validate inputs
   - Sanitize data
   - Use HTTPS in production

---

## 🎯 Common Tasks

### Add a new training field
1. Update Training model in `src/models/Training.ts`
2. Add field to create form
3. Update API endpoint
4. Update display component

### Change colors
1. Edit Tailwind config
2. Or update specific classes
3. Test across all pages
4. Check contrast for accessibility

### Add authentication check
1. Create middleware
2. Protect routes
3. Redirect to login
4. Store user session

### Add search functionality
1. Create search input
2. Filter results
3. Update API if needed
4. Show no results state

---

## 🚨 Common Issues & Fixes

**Issue: MongoDB connection fails**
- Check MONGODB_URI in .env.local
- Ensure MongoDB is running
- Check firewall settings

**Issue: Form not submitting**
- Check browser console for errors
- Verify API endpoint exists
- Check Content-Type header
- Log form data

**Issue: Styles not applying**
- Clear browser cache
- Check Tailwind config
- Verify class names correct
- Rebuild CSS

**Issue: Components not showing**
- Check import statements
- Verify 'use client' directive
- Check prop names
- Check component exports

---

## 🏁 You're Ready!

Now you have all the tools and knowledge to build amazing features!

Start with:
1. ✅ Setting up MongoDB
2. ✅ Testing authentication endpoints
3. ✅ Implementing one complete feature
4. ✅ Deploy and celebrate!

Happy coding! 🚀
