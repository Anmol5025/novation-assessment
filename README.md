# Legal Document Management Platform

A smart filing cabinet for legal documents with AI-powered insights, deadline tracking, and team collaboration.

**Tech Stack:** Next.js 14 | Node.js + Express | MongoDB | Cloudinary | OpenAI

---

## Table of Contents

1. [Quick Start](#-quick-start)
2. [Environment Variables Setup](#-environment-variables-setup)
3. [Architecture Design](#-architecture-design)
4. [Feature Prioritization](#-feature-prioritization)
5. [Scalability & Performance](#-scalability--performance)
6. [Security & Compliance](#-security--compliance)
7. [API Documentation](#-api-documentation)
8. [Project Structure](#-project-structure)

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+

### Installation (5 minutes)

```bash
# 1. Install dependencies
install.bat

# 2. Setup environment variables
setup-env.bat

# 3. Edit backend/.env with your credentials (see below)

# 4. Start MongoDB
mongod

# 5. Start backend
start-backend.bat

# 6. Start frontend
start-frontend.bat

# 7. Open browser
http://localhost:3000
```

---

## Environment Variables Setup

### Step 1: Create .env Files

```bash
# Run setup helper
setup-env.bat

# Or manually:
copy backend\.env.example backend\.env
copy frontend\.env.local.example frontend\.env.local
```

### Step 2: Configure Backend (.env)

Edit `backend/.env` with these values:

#### Required Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database - Choose one:
# Option 1: Local MongoDB (easiest)
MONGODB_URI=mongodb://localhost:27017/legal-docs

# Option 2: MongoDB Atlas (cloud - free tier)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/legal-docs

# JWT Secrets - Generate random 32+ character strings
JWT_SECRET=your-random-secret-key-min-32-characters
JWT_REFRESH_SECRET=your-random-refresh-key-min-32-characters

# Cloudinary (File Storage) - Sign up at https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI (AI Features) - Sign up at https://platform.openai.com
OPENAI_API_KEY=sk-your-openai-api-key
```

#### How to Get Credentials

**1. MongoDB (FREE)**
- **Local:** Install MongoDB, run `mongod`, use `mongodb://localhost:27017/legal-docs`
- **Cloud:** Sign up at [MongoDB Atlas](https://mongodb.com/cloud/atlas), create free cluster, get connection string

**2. JWT Secrets (FREE)**
Generate random strings:
```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**3. Cloudinary (FREE tier - 25GB storage)**
1. Sign up: https://cloudinary.com/users/register/free
2. Dashboard: https://cloudinary.com/console
3. Copy: Cloud Name, API Key, API Secret

**4. OpenAI (~$0.002 per analysis)**
1. Sign up: https://platform.openai.com/signup
2. Add payment: https://platform.openai.com/account/billing
3. Create key: https://platform.openai.com/api-keys
4. Copy key (starts with `sk-`)

### Step 3: Configure Frontend (.env.local)

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

No changes needed for local development!

### Minimum Configuration (For Testing)

If you just want to test authentication and UI:

```env
# backend/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/legal-docs
JWT_SECRET=my-dev-secret-key-12345678901234567890123456789012
JWT_REFRESH_SECRET=my-dev-refresh-key-09876543210987654321098765432109
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=demo-secret
OPENAI_API_KEY=skip
```

Works for: Authentication, UI, Dashboard
Won't work: File uploads (need Cloudinary), AI features (need OpenAI)

---

## Architecture Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  Next.js 14 (App Router) + React + TailwindCSS + Zustand   │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │Dashboard │Documents │Analytics │Deadlines │Settings  │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API (JWT Auth)
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER (Express)                     │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │Auth      │Documents │AI        │Search    │Users     │  │
│  │Routes    │Routes    │Routes    │Routes    │Routes    │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│  Middleware: JWT Verify, RBAC, File Upload, Rate Limiting   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │Document  │AI        │Storage   │Search    │Auth      │  │
│  │Service   │Service   │Service   │Service   │Service   │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATA & STORAGE LAYER                      │
│  ┌──────────────────┬──────────────────┬─────────────────┐ │
│  │   MongoDB        │  Cloudinary      │   OpenAI API    │ │
│  │  (Documents,     │  (File Storage)  │  (AI Analysis)  │ │
│  │   Users, Logs)   │                  │                 │ │
│  └──────────────────┴──────────────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

**Users Collection**
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed with bcrypt),
  name: String,
  role: Enum['admin', 'lawyer', 'paralegal', 'viewer'],
  organization: String,
  createdAt: Date,
  lastLogin: Date
}
```

**Documents Collection**
```javascript
{
  _id: ObjectId,
  title: String (indexed),
  description: String,
  type: Enum['contract', 'nda', 'agreement', 'other'],
  fileUrl: String,
  fileSize: Number,
  uploadedBy: ObjectId (ref: Users, indexed),
  organization: String (indexed),
  tags: [String] (indexed),
  status: Enum['active', 'expired', 'archived'],
  aiInsights: {
    summary: String,
    keyTerms: [String],
    parties: [String],
    obligations: [String],
    risks: [String],
    analyzedAt: Date
  },
  deadlines: [{
    title: String,
    date: Date,
    notified: Boolean
  }],
  version: Number,
  versionHistory: [{
    version: Number,
    fileUrl: String,
    updatedBy: ObjectId,
    updatedAt: Date,
    changes: String
  }],
  accessControl: [{
    userId: ObjectId,
    permission: Enum['view', 'edit', 'admin']
  }],
  createdAt: Date (indexed),
  updatedAt: Date
}
```

**Activity Logs Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  documentId: ObjectId (indexed),
  action: Enum['upload', 'view', 'edit', 'delete', 'share', 'analyze'],
  details: Object,
  timestamp: Date (indexed)
}
```

### Technology Choices & Trade-offs

| Technology | Pros | Cons |
|------------|------|------|
| **Next.js 14** | SSR, built-in optimization, great DX | Steeper learning curve |
| **Node.js + Express** | Full-stack JS, large ecosystem, scalable | Single-threaded |
| **MongoDB** | Flexible schema, document-oriented, full-text search | Less strict than SQL |
| **Cloudinary** | CDN, auto-optimization, generous free tier | Vendor lock-in |
| **OpenAI API** | State-of-the-art AI, easy integration | Cost per request |

---

## Feature Prioritization

### Must-Have (MVP - Launch Blockers)
1.  **User Authentication & Authorization** - Security foundation
2.  **Document Upload & Storage** - Core functionality
3.  **AI Document Analysis** - Key differentiator
4.  **Document Search & Filtering** - Essential usability
5.  **Deadline Tracking** - Critical value proposition

### Should-Have (Post-MVP - High Value)
6.  **Team Collaboration & Sharing** - Enables team workflows
7.  **Version History** - Professional requirement
8.  **Role-Based Access Control** - Enterprise necessity

### Nice-to-Have (Future Enhancements)
9.  **Advanced Analytics Dashboard** - Business intelligence
10. **Email Notifications** - Engagement driver (future)

**Justification:**
- Must-Have features form the core value proposition and MVP
- Should-Have features are necessary for professional/enterprise adoption
- Nice-to-Have features improve engagement but aren't blockers

---

## Scalability & Performance

### Large File Uploads (50MB+)
- **Chunked Upload**: Multipart upload with resumable capability
- **Client-side Compression**: Compress before upload when possible
- **Progress Tracking**: Real-time upload progress
- **Background Processing**: Queue AI analysis jobs (Bull + Redis)
- **CDN Delivery**: Serve files through Cloudinary CDN

### 10,000+ Documents
- **Database Indexing**: Compound indexes on (organization, createdAt, type)
- **Pagination**: Cursor-based pagination for infinite scroll
- **Lazy Loading**: Load document metadata first, content on-demand
- **Caching**: Redis cache for frequently accessed documents
- **Aggregation Pipeline**: MongoDB aggregation for analytics

### Search Optimization
- **Full-Text Search**: MongoDB text indexes on title, description, tags
- **Search Index**: Dedicated search service (Elasticsearch/Algolia for scale)
- **Debounced Search**: Client-side debouncing (300ms)
- **Search Result Caching**: Cache popular queries
- **Faceted Search**: Pre-computed filters (type, date, status)

### What Would Break First?
1. **AI API Rate Limits** → Solution: Queue system, batch processing, caching
2. **Database Connections** → Solution: Connection pooling, read replicas
3. **File Storage Bandwidth** → Solution: CDN, lazy loading, compression
4. **Memory (Large PDFs)** → Solution: Streaming, worker processes

---

## Security & Compliance

### 5 Critical Security Concerns

**1. Data Encryption**
- At-rest: MongoDB encryption, Cloudinary secure storage
- In-transit: HTTPS/TLS for all communications
- Sensitive fields: Additional encryption layer for PII

**2. Access Control**
- JWT with short expiration (15min access, 7day refresh)
- Role-based permissions (admin, lawyer, paralegal, viewer)
- Document-level access control lists
- IP whitelisting for enterprise clients

**3. File Upload Security**
- File type validation (whitelist: PDF, DOCX, TXT)
- Virus scanning integration (ClamAV)
- Size limits (50MB default, configurable)
- Sanitize filenames, prevent path traversal

**4. Audit Logging**
- Log all document access, modifications, deletions
- Immutable audit trail
- Compliance reporting (GDPR, HIPAA ready)

**5. API Security**
- Rate limiting (100 req/min per user)
- Input validation & sanitization
- CORS configuration
- SQL/NoSQL injection prevention

### Data Privacy Strategy
- **Data Isolation**: Organization-level data segregation
- **Anonymization**: PII redaction in logs
- **Right to Delete**: GDPR-compliant data deletion
- **Data Residency**: Configurable storage regions

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, user management, billing |
| **Lawyer** | Upload, edit, delete own docs, share, AI analysis |
| **Paralegal** | Upload, view, comment, limited editing |
| **Viewer** | Read-only access to shared documents |

### Version History Strategy
- **Automatic Versioning**: Every edit creates new version
- **Version Metadata**: Timestamp, user, change description
- **Storage Optimization**: Delta storage for text changes
- **Retention Policy**: Configurable (keep all, last N versions, time-based)
- **Restore Capability**: One-click restore to previous version

---

## API Documentation

### Authentication

```
POST   /api/auth/register
Body: { email, password, name, organization, role }
Response: { user, accessToken, refreshToken }

POST   /api/auth/login
Body: { email, password }
Response: { user, accessToken, refreshToken }

POST   /api/auth/refresh
Body: { refreshToken }
Response: { accessToken, refreshToken }
```

### Documents

```
GET    /api/documents
Query: page, limit, type, status, search
Headers: Authorization: Bearer <token>
Response: { documents[], totalPages, currentPage, total }

POST   /api/documents
Headers: Authorization: Bearer <token>, Content-Type: multipart/form-data
Body: FormData { file, title, description, type, tags }
Response: { message, document }

GET    /api/documents/:id
Headers: Authorization: Bearer <token>
Response: { document }

PUT    /api/documents/:id
Headers: Authorization: Bearer <token>
Body: { title, description, type, status, tags }
Response: { message, document }

DELETE /api/documents/:id
Headers: Authorization: Bearer <token>
Response: { message }

POST   /api/documents/:id/analyze
Headers: Authorization: Bearer <token>
Response: { message, insights }

GET    /api/documents/:id/versions
Headers: Authorization: Bearer <token>
Response: { currentVersion, history[] }

POST   /api/documents/:id/share
Headers: Authorization: Bearer <token>
Body: { userId, permission }
Response: { message, accessControl[] }
```

### Search & Analytics

```
GET    /api/search
Query: q, type, status, dateFrom, dateTo
Headers: Authorization: Bearer <token>
Response: { query, results, documents[] }

GET    /api/deadlines
Query: upcoming (days)
Headers: Authorization: Bearer <token>
Response: { deadlines[] }

GET    /api/analytics
Query: period (days)
Headers: Authorization: Bearer <token>
Response: { totalDocuments, recentDocuments, documentsByType[], documentsByStatus[], recentActivity[], upcomingDeadlines }
```

---

## Project Structure

```
legal-doc-platform/
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── config/              # Database & Cloudinary config
│   │   │   ├── cloudinary.js
│   │   │   └── database.js
│   │   ├── middleware/          # Auth, upload, rate limiting
│   │   │   ├── auth.js
│   │   │   ├── upload.js
│   │   │   └── rateLimiter.js
│   │   ├── models/              # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Document.js
│   │   │   └── ActivityLog.js
│   │   ├── routes/              # API endpoints
│   │   │   ├── auth.js
│   │   │   ├── documents.js
│   │   │   ├── search.js
│   │   │   ├── deadlines.js
│   │   │   └── analytics.js
│   │   ├── services/            # Business logic
│   │   │   ├── aiService.js
│   │   │   └── storageService.js
│   │   └── server.js            # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/                     # Next.js 14 Application
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── analytics/       # Analytics page
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── deadlines/       # Deadlines page
│   │   │   ├── documents/       # Documents list & detail
│   │   │   │   └── [id]/        # Document detail page
│   │   │   ├── login/           # Login page
│   │   │   ├── register/        # Registration page
│   │   │   ├── layout.js        # Root layout
│   │   │   ├── page.js          # Landing page
│   │   │   └── globals.css      # Global styles
│   │   ├── components/          # React components
│   │   │   ├── DocumentCard.js
│   │   │   ├── Navbar.js
│   │   │   └── UploadModal.js
│   │   ├── lib/                 # Utilities
│   │   │   └── api.js           # API client with interceptors
│   │   └── store/               # Zustand state management
│   │       ├── authStore.js
│   │       └── documentStore.js
│   ├── .env.local.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── install.bat                   # Installation script
├── setup-env.bat                # Environment setup helper
├── start-backend.bat            # Backend startup script
├── start-frontend.bat           # Frontend startup script
└── README.md                    # This file
```

---

## Features Implemented

 User authentication (JWT with refresh tokens)
 Document upload (PDF, DOC, DOCX, TXT up to 50MB)
 Cloudinary storage integration
 AI-powered document analysis (OpenAI GPT-3.5)
 Automatic extraction: summary, key terms, parties, obligations, risks, deadlines
 Full-text search across documents
 Filter by type, status, date
 Pagination support
 Deadline tracking with urgency indicators
 Analytics dashboard
 Activity logging
 Role-based access control (4 roles)
 Document sharing with permissions
 Version history tracking
 Responsive UI (mobile, tablet, desktop)
 Rate limiting
 Input validation
 Organization-level data isolation

---

## Troubleshooting

### "MongoDB connection error"
```bash
# Ensure MongoDB is running
mongod

# Or use MongoDB Atlas cloud database
```

### "Cloudinary upload failed"
- Verify all three Cloudinary variables in backend/.env
- Check credentials in Cloudinary dashboard
- Ensure no extra spaces in .env file

### "AI analysis not working"
- Verify OPENAI_API_KEY starts with 'sk-'
- Check API key is active in OpenAI dashboard
- Verify you have credits in OpenAI account

### "Cannot connect to backend"
- Ensure backend is running on port 5000
- Check NEXT_PUBLIC_API_URL in frontend/.env.local
- Restart both servers

### "JWT error" or "Invalid token"
- Ensure JWT_SECRET and JWT_REFRESH_SECRET are set (32+ chars)
- Clear browser localStorage
- Try registering a new account

---

## Future Enhancements

- Real-time collaboration (WebSockets)
- Advanced OCR for scanned documents
- E-signature integration
- Mobile app (React Native)
- Blockchain for document verification
- Multi-language support
- Advanced analytics and reporting
- Email notifications
- Calendar integration
- Document templates

---


## You're Ready!

1. Run `install.bat` to install dependencies
2. Run `setup-env.bat` to create .env files
3. Edit `backend/.env` with your credentials
4. Start MongoDB: `mongod`
5. Start backend: `start-backend.bat`
6. Start frontend: `start-frontend.bat`
7. Open http://localhost:3000
8. Register and start managing documents!

