# Profile System Documentation

## Overview
Sistem profil pengguna dengan avatar customization, modern UI design, dan responsive layout untuk mobile/tablet/desktop.

## Components

### ProfilePage
**Location**: `src/pages/ProfilePage.tsx`

#### Description
Halaman profil pengguna dengan fitur edit profil, ganti avatar, dan ubah password. Menggunakan gradient header modern dan card-based layout.

#### Features
- ✅ Gradient header (blue to cyan)
- ✅ Large avatar display dengan edit button
- ✅ Avatar modal picker dengan 20 pilihan gambar
- ✅ Edit profil (nama lengkap, email)
- ✅ Change password dengan validasi
- ✅ Real-time avatar update di header
- ✅ Responsive design untuk semua device

#### State Management
```typescript
// Profile data state
const [profileData, setProfileData] = useState({
  fullName: user?.fullName || '',
  email: user?.email || '',
  avatar: user?.avatar || 'avatar-1',
})

// Password change state
const [passwordData, setPasswordData] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// UI state
const [isEditingProfile, setIsEditingProfile] = useState(false)
const [isChangingPassword, setIsChangingPassword] = useState(false)
const [showAvatarModal, setShowAvatarModal] = useState(false)
```

#### API Integration
**Update Profile**: `PUT /api/auth/profile`
```typescript
// Request
{
  fullName: string,
  email: string,
  avatar: string
}

// Response
{
  success: true,
  message: 'Profil berhasil diperbarui',
  data: {
    id, username, email, fullName, role, opdId, avatar, isActive, lastLogin
  }
}
```

**Change Password**: `POST /api/auth/change-password`
```typescript
// Request
{
  currentPassword: string,
  newPassword: string
}

// Response
{
  success: true,
  message: 'Password berhasil diubah'
}
```

#### Usage Example
```tsx
// ProfilePage automatically loads from useAuth hook
import ProfilePage from './pages/ProfilePage'

// In router
<Route path="/dashboard/profile" element={<ProfilePage />} />
```

---

### AvatarSelector
**Location**: `src/components/AvatarSelector.tsx`

#### Description
Modal component untuk memilih avatar dari 20 pilihan gambar. Clean design tanpa filter atau label, fokus pada visual.

#### Props
| Prop | Type | Description |
|------|------|-------------|
| isOpen | boolean | Modal visibility state |
| selectedAvatarId | string | Currently selected avatar ID |
| onSelect | (avatarId: string) => void | Callback when avatar selected |
| onClose | () => void | Callback to close modal |

#### Features
- ✅ Full-screen modal overlay
- ✅ 20 avatar images (3-5 column responsive grid)
- ✅ Blue ring selection indicator
- ✅ Hover scale effect
- ✅ Keyboard ESC to close
- ✅ Click outside to close

#### Avatar Collection
**Location**: `src/lib/avatars.ts`

20 avatar images stored in `public/assets/avatars/`:
- `avatar-1.png` to `avatar-10.png` - Mixed gender avatars
- `avatar-11.png` to `avatar-20.png` - Mixed gender avatars

```typescript
export interface Avatar {
  id: string
  name: string
  description: string
  gender: 'male' | 'female'
  imageUrl: string
}

export const AVATARS: Avatar[] = [
  {
    id: 'avatar-1',
    name: 'Avatar 1',
    description: 'Professional',
    gender: 'male',
    imageUrl: '/assets/avatars/avatar-1.png',
  },
  // ... 19 more avatars
]
```

#### Usage Example
```tsx
import AvatarSelector from './components/AvatarSelector'

const [showModal, setShowModal] = useState(false)
const [selectedAvatar, setSelectedAvatar] = useState('avatar-1')

<AvatarSelector
  isOpen={showModal}
  selectedAvatarId={selectedAvatar}
  onSelect={(id) => {
    setSelectedAvatar(id)
    setShowModal(false)
  }}
  onClose={() => setShowModal(false)}
/>
```

---

### UserDropdown
**Location**: `src/components/UserDropdown.tsx`

#### Description
Dropdown component di header untuk menampilkan info user dan navigasi ke profile/logout.

#### Props
| Prop | Type | Description |
|------|------|-------------|
| user | User | User object dari localStorage |

#### Features
- ✅ Avatar image display
- ✅ Username dan role display
- ✅ Dropdown menu (Profile, Logout)
- ✅ Click outside to close
- ✅ Real-time avatar update via event listener

#### Real-time Update Mechanism
```typescript
// Listen for userUpdated event
useEffect(() => {
  const handleUserUpdate = () => {
    const stored = localStorage.getItem('auth_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }
  
  window.addEventListener('userUpdated', handleUserUpdate)
  return () => window.removeEventListener('userUpdated', handleUserUpdate)
}, [])
```

---

## Responsive Layout System

### DashboardLayout
**Location**: `src/components/layout/DashboardLayout.tsx`

#### Description
Main layout dengan responsive design: sidebar untuk desktop, bottom navigation untuk mobile/tablet.

#### Breakpoints
- **Mobile**: `< 768px` - Bottom nav visible, sidebar hidden
- **Tablet**: `768px - 1024px` - Bottom nav visible, sidebar hidden  
- **Desktop**: `≥ 1024px` - Sidebar visible, bottom nav hidden

#### Bottom Navigation Items
```typescript
const navItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard', show: true },
  { path: '/dashboard/laporan-retribusi', icon: FileText, label: 'Laporan', show: true },
  { path: '/dashboard/laporan-retribusi/new', icon: PlusCircle, label: 'Buat', show: true },
  { path: '/dashboard/profile', icon: User, label: 'Profil', show: true },
  { path: '/dashboard/settings', icon: Settings, label: 'Settings', show: isAdmin },
]
```

#### Active State Detection
```typescript
const location = useLocation()
const isActive = (path: string) => location.pathname === path

// Desktop sidebar
className={`${isActive('/dashboard') 
  ? 'bg-primary-100 text-primary-700 font-medium' 
  : 'text-neutral-700 hover:bg-primary-50'
}`}

// Mobile bottom nav
className={`${active 
  ? 'text-primary-600 bg-primary-50' 
  : 'text-neutral-600 hover:text-primary-600'
}`}
```

---

## Database Schema

### Users Table - Avatar Column
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar VARCHAR(50) DEFAULT 'avatar-1';

UPDATE users 
SET avatar = 'avatar-1' 
WHERE avatar IS NULL;

COMMENT ON COLUMN users.avatar IS 'Avatar ID for user profile (e.g., avatar-1, avatar-2)';
```

### Migration Script
**Location**: `scripts/run-migration.js`

```javascript
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL)

await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(50) DEFAULT 'avatar-1'`
await sql`UPDATE users SET avatar = 'avatar-1' WHERE avatar IS NULL`
```

---

## API Endpoints

### PUT /api/auth/profile
Update authenticated user's profile.

**Authentication**: Required (JWT token)

**Request Body**:
```json
{
  "fullName": "Administrator Bapenda",
  "email": "admin@bapenda.go.id",
  "avatar": "avatar-8"
}
```

**Validation**:
- All fields optional
- Email must be valid format or empty string
- Email uniqueness check (if changing)
- Only non-empty fields are updated

**Response Success**:
```json
{
  "success": true,
  "message": "Profil berhasil diperbarui",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@bapenda.go.id",
    "fullName": "Administrator Bapenda",
    "role": "admin",
    "opdId": null,
    "avatar": "avatar-8",
    "isActive": true,
    "lastLogin": "2025-11-16T02:00:00.000Z"
  }
}
```

**Response Error**:
```json
{
  "success": false,
  "message": "Email sudah terdaftar. Silakan gunakan email lain.",
  "errors": ["Format email tidak valid"]
}
```

**Audit Log**: Creates audit entry with action='update', tableName='users'

---

## Best Practices

### Avatar Management
1. **Always use avatar IDs**: Never hardcode image URLs
2. **Fallback avatar**: Use 'avatar-1' as default
3. **Validate avatar ID**: Check if ID exists in AVATARS array
4. **Optimize images**: Keep avatar images under 100KB

### Profile Updates
1. **Validate before submit**: Check required fields
2. **Handle errors gracefully**: Show user-friendly messages
3. **Update localStorage**: Sync with server response
4. **Dispatch events**: Notify other components of changes
5. **Invalidate queries**: Refresh React Query cache

### Responsive Design
1. **Mobile-first approach**: Design for mobile, enhance for desktop
2. **Touch-friendly targets**: Minimum 44x44px for mobile buttons
3. **Test all breakpoints**: Mobile (375px), Tablet (768px), Desktop (1024px+)
4. **Avoid horizontal scroll**: Use proper padding and max-widths
5. **Sticky navigation**: Keep nav accessible on scroll

---

## Troubleshooting

### Avatar not updating in header
**Problem**: Avatar changes in profile but doesn't update in UserDropdown

**Solution**: Ensure custom event is dispatched:
```typescript
localStorage.setItem('auth_user', JSON.stringify(response.data))
window.dispatchEvent(new Event('userUpdated'))
```

### Bottom nav overlapping content
**Problem**: Content hidden behind bottom navigation

**Solution**: Add padding-bottom to main container:
```typescript
<div className="min-h-screen pb-20 lg:pb-0">
```

### Profile fields empty in edit mode
**Problem**: Input fields show empty when clicking "Edit Profil"

**Solution**: Sync profileData with user via useEffect:
```typescript
useEffect(() => {
  if (user) {
    setProfileData({
      fullName: user.fullName || '',
      email: user.email || '',
      avatar: user.avatar || 'avatar-1',
    })
  }
}, [user])
```

### Email validation error with empty string
**Problem**: Zod validation fails when email is empty string

**Solution**: Allow empty string in schema:
```typescript
email: z.string().email('Format email tidak valid').or(z.literal('')).optional()
```

---

## Testing Checklist

### Profile Page
- [ ] Avatar displays correctly on load
- [ ] Click "Edit Profil" shows filled input fields
- [ ] Click avatar edit button opens modal
- [ ] Select new avatar updates preview
- [ ] Save changes updates profile successfully
- [ ] Avatar updates in header without refresh
- [ ] Cancel button resets changes
- [ ] Validation errors show properly

### Avatar Modal
- [ ] Modal opens with overlay
- [ ] Current avatar has blue ring
- [ ] Click avatar selects it
- [ ] Hover shows scale effect
- [ ] ESC key closes modal
- [ ] Click outside closes modal
- [ ] All 20 avatars display correctly

### Responsive Layout
- [ ] Desktop shows sidebar
- [ ] Mobile shows bottom nav
- [ ] Tablet shows bottom nav
- [ ] Active state highlights correctly
- [ ] Navigation works on all devices
- [ ] No horizontal scroll
- [ ] Touch targets are adequate
- [ ] Header sticky on scroll

### Password Change
- [ ] All fields required
- [ ] Password mismatch shows error
- [ ] Current password validated
- [ ] Success message on change
- [ ] Form resets after success

---

## Migration Guide

### From DiceBear to Local Avatars

**Old System**:
```typescript
// DiceBear URLs
imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`
```

**New System**:
```typescript
// Local PNG files
imageUrl: `/assets/avatars/${id}.png`
```

**Migration Steps**:
1. Add 20 avatar PNG files to `public/assets/avatars/`
2. Update `src/lib/avatars.ts` with new imageUrl format
3. Run database migration to add avatar column
4. Update all avatar references to use imageUrl instead of emoji
5. Test avatar display in all components

---

## Performance Considerations

### Image Optimization
- Avatar images: 256x256px PNG
- Optimized with compression
- Lazy loading in modal: `loading="lazy"`
- Total size: ~2MB for all 20 avatars

### State Management
- Use React Query for server state
- Local state for UI interactions
- localStorage for persistence
- Event-driven updates for cross-component sync

### Bundle Size
- Lucide icons: Tree-shakeable, only used icons imported
- No heavy dependencies added
- Modal rendered conditionally (only when open)

---

## Future Enhancements

### Potential Features
1. **Custom Avatar Upload**: Allow users to upload their own images
2. **Avatar Cropper**: Built-in image cropping tool
3. **Avatar Categories**: Group avatars by style/theme
4. **Avatar Search**: Search avatars by description
5. **Profile Completion**: Progress indicator for profile fields
6. **Social Links**: Add social media profile links
7. **Privacy Settings**: Control profile visibility
8. **Two-Factor Auth**: Enhanced security for profile

### Technical Improvements
1. **Image CDN**: Serve avatars from CDN for faster loading
2. **WebP Format**: Use modern image format with fallback
3. **Skeleton Loading**: Show loading state for avatar
4. **Optimistic Updates**: Update UI before server response
5. **Offline Support**: Cache profile data for offline access
