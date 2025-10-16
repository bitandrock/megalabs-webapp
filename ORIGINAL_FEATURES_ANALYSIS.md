# Original Megalabs B4i/B4A Features Analysis

## Architecture Overview

The original application uses a **Remote Database Connector (RDC)** architecture:
- **DBRequestManager**: Handles HTTP requests to MySQL database via RDC server
- **Global Parameters**: Manages user session and app state
- **B4X Pages**: Navigation system between different screens
- **Custom List Views**: Dynamic content display with search functionality

## Core Features Analysis

### 1. User Management & Authentication
- **Global Variables**: `UserID`, `Username`, `Email`, `token`, `celular`, `pais`
- **Country Flag System**: Displays flag emojis based on phone country codes
- **Outlook Integration**: Microsoft authentication support (`loginOutlook`, `CLIENT_ID`, `CLIENT_SECRET`)
- **User Profile**: Personal information management

### 2. Product Management System
**Main Flow**: Areas → Product Categories → Products → Content

#### Key Components:
- **Areas (menup.bas)**: Main product categories
  - Query: `cargaAreas` - Loads all available areas
  - Storage: `mapProducto` (ID→Name), `mapdescripcionCategorias` (ID→Description)

- **Product Categories (categoriaProducto.bas)**: Sub-categories within areas
  - Filtering by area (`catProducto`)
  - Maps product options (`mapOpcioneProducto`)

- **Product Content (producto.bas)**: Detailed product information
  - Displays training content, videos, PDFs
  - Dynamic scrollable content
  - Conditional visibility for media content

### 3. Training System (capacitaciones.bas)
**Core Functionality**: Browse and search training topics by product

#### Database Operations:
```sql
-- Load training topics for a product
selectThemes(productId) → Returns: id, topic, info

-- Search training content
Search4Topics(searchText, productId) → Returns: matching topics
```

#### Key Features:
- **Search Functionality**: Real-time topic search
- **Topic Navigation**: Click topic → Show detailed content in `producto.bas`
- **Content Display**: Topic title, description, and detailed info
- **Product Filtering**: Only shows topics for selected product

### 4. FAQ System (faq.bas)
**Core Functionality**: Frequently Asked Questions management

#### Database Operations:
```sql
-- Load FAQs for a product
selectFAQS(productId) → Returns: id, question, answer

-- Search FAQ content
Search4Questions(searchText, productId) → Returns: matching questions
```

#### Key Features:
- **Question-Answer Pairs**: Structured FAQ content
- **Search Capability**: Find relevant FAQs quickly
- **Product-Specific**: FAQs filtered by selected product
- **Content Mapping**: `mapFAQS` (ID→Question), `mapAnswer` (ID→Answer)

### 5. Chat System (Multiple Components)

#### Chat Topics (chat_topics.bas)
**Purpose**: List of available chat conversations (new + historical)

#### Database Operations:
```sql
-- Get closed chat topics for product
GetClosedTopicsForProduct(productId) → Returns: id, title

-- Get client name for chat topic
selectNombreClienteconIDTopic(topicId) → Returns: ClientFullName

-- Search chat topics
Search4ChatsTopics(searchText) → Returns: matching topics
```

#### Chat Interface (Chat.bas)
**Purpose**: Real-time messaging interface with bubble UI

#### Key Features:
- **Bubble Chat UI**: Left (client) and right (support) message bubbles
- **Message History**: Displays previous conversation
- **New Chat Creation**: Creates new support topics
- **Timestamp Display**: Shows message date/time
- **Performance Optimization**: Cached bubble rendering
- **Push Notifications**: FCM integration for new messages

#### Database Operations:
```sql
-- Create new chat topic
Add_ChatTopic(userID, productID, firstMessage, username)

-- Add message to existing chat
Add_ChatMessage(chatId, sender, message)
```

### 6. User Interface Patterns

#### Common UI Elements:
- **Search Bars**: Real-time search with `edtxtsearch` and `lbliconbuscar`
- **Custom List Views**: `CLVS1` for displaying dynamic content
- **Navigation**: Back button, menu button, username display
- **Country Flags**: Phone-based country detection and emoji display
- **Notification Badge**: `pnlbolita2` for unread messages
- **Image Loading**: Rounded image containers for branding

#### Layout Structure:
- **Header**: Logo, username, menu icon, notifications
- **Search Section**: Search input with icon
- **Content List**: Scrollable list of items
- **Navigation**: Back and menu controls

### 7. Database Query Patterns

#### Common Stored Procedures:
- `cargaAreas` - Load product areas
- `selectThemes(productId)` - Get training topics
- `selectFAQS(productId)` - Get FAQ items  
- `Add_ChatTopic(userID, productID, message, username)` - Create chat
- `Add_ChatMessage(chatId, sender, message)` - Send message
- `Search4Topics(text, productId)` - Search training
- `Search4Questions(text, productId)` - Search FAQs
- `Search4ChatsTopics(text)` - Search chats
- `GetClosedTopicsForProduct(productId)` - Get chat history

#### Data Flow Pattern:
1. **Load**: Execute query → Handle async result → Parse data
2. **Display**: Populate CustomListView with parsed data
3. **Search**: Filter/re-query based on search text
4. **Navigate**: Pass selected item data to next screen

### 8. State Management

#### Global Parameters:
- **User Context**: `UserID`, `Username`, `Email`, `celular`, `pais`
- **Product Context**: `idProducto`, `catProducto`, `mapProducto`, `mapOpcioneProducto`
- **Chat Context**: `chatOPen`, `topicdeCC`, `nombreUsuarioChatActivo`
- **FAQ Context**: `faqSelected`, `mapFAQS`
- **UI State**: `mostrarVisibles`, `bolitavisible`, `CurrentVisiblePageId`

#### Navigation Flow:
```
Main Menu → Product Areas → Categories → Products → Training/FAQ/Chat
                                                  ↓
                                        Content Display → Chat Interface
```

### 9. Media and File Handling
- **PDF Documents**: Product documentation with download capability
- **Video Content**: Training videos with player interface
- **Images**: Rounded image loading with caching
- **Animations**: Lottie animations for UI elements (B4A) / Static images (B4i)

### 10. Notification System
- **Firebase Cloud Messaging**: Push notifications for new messages
- **Badge System**: Visual indicators for unread content
- **Real-time Updates**: Chat refresh and message synchronization

## Migration Strategy

### Database Migration:
1. **Convert RDC calls** → Supabase client calls
2. **Map stored procedures** → Supabase RPC functions or direct queries
3. **Recreate data structures** in Supabase tables
4. **Implement real-time subscriptions** for chat functionality

### UI Migration:
1. **Convert B4X layouts** → Next.js React components
2. **Implement responsive design** for web/mobile
3. **Recreate CustomListView** with modern component libraries
4. **Add modern search** and filtering capabilities

### Feature Parity:
1. **Product Management** - Area/Category/Product hierarchy
2. **Training System** - Topic browsing and search
3. **FAQ System** - Question/Answer management
4. **Chat System** - Real-time messaging with history
5. **User Profiles** - Country detection and preferences
6. **Notification System** - Real-time updates and alerts

This analysis provides the foundation for systematically migrating each feature while maintaining the original functionality and user experience.