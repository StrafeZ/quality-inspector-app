# Authentication Setup Guide

This guide explains how to link Supabase Auth users with inspector records in the `workers` table.

## Overview

The app uses Supabase Auth for authentication, but inspector profiles are stored in the `workers` table. We need to link auth users to their corresponding worker records using the `user_id` column.

## Database Setup

### Step 1: Add user_id column to workers table

Run this migration in your Supabase SQL editor:

```sql
-- Add user_id column to workers table
ALTER TABLE workers
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create unique index to ensure one worker per auth user
CREATE UNIQUE INDEX idx_workers_user_id ON workers(user_id) WHERE user_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN workers.user_id IS 'Links worker to Supabase Auth user account';
```

### Step 2: Enable RLS policies for workers table

```sql
-- Enable RLS on workers table
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Policy: Workers can view all workers (for team visibility)
CREATE POLICY "Workers can view all workers"
ON workers
FOR SELECT
TO authenticated
USING (true);

-- Policy: Workers can update their own profile
CREATE POLICY "Workers can update own profile"
ON workers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Only admins can insert workers (optional - adjust as needed)
CREATE POLICY "Admins can insert workers"
ON workers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workers
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

### Step 3: Create helper function to get current worker

```sql
-- Function to get current worker based on auth user
CREATE OR REPLACE FUNCTION get_current_worker()
RETURNS TABLE (
  worker_id INT,
  full_name TEXT,
  email TEXT,
  role TEXT,
  phone TEXT,
  specialization TEXT[],
  employee_number TEXT,
  hourly_rate DECIMAL,
  is_active BOOLEAN,
  user_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.worker_id,
    w.full_name,
    w.email,
    w.role,
    w.phone,
    w.specialization,
    w.employee_number,
    w.hourly_rate,
    w.is_active,
    w.user_id
  FROM workers w
  WHERE w.user_id = auth.uid()
  AND w.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_current_worker() TO authenticated;
```

## Creating Inspector Accounts

### Option 1: Link existing auth user to existing worker

```sql
-- Update worker record with auth user_id
UPDATE workers
SET user_id = 'auth-user-uuid-here'
WHERE worker_id = 1; -- Replace with actual worker_id
```

### Option 2: Create new worker when auth user signs up

```sql
-- Insert new worker linked to auth user
INSERT INTO workers (
  full_name,
  email,
  role,
  phone,
  specialization,
  employee_number,
  is_active,
  user_id
) VALUES (
  'John Doe',
  'john@macleather.co.uk',
  'inspector',
  '+44 7700 900000',
  ARRAY['cutting', 'stitching'],
  'EMP-2025-0001',
  true,
  'auth-user-uuid-here' -- Get from auth.users table
);
```

### Option 3: Automated trigger (recommended)

Create a trigger to automatically create worker record when user signs up:

```sql
-- Function to create worker on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workers (
    full_name,
    email,
    role,
    is_active,
    user_id
  ) VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Inspector'),
    NEW.email,
    'inspector', -- Default role
    true,
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
```

## Frontend Integration

### Getting Current Worker in Components

Use the `getCurrentUser()` utility from `src/lib/auth.ts` combined with a Supabase query:

```typescript
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// Get current worker profile
async function getCurrentWorker() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching worker profile:', error)
    return null
  }

  return data
}
```

### Alternative: Use PostgreSQL function

```typescript
import { supabase } from '@/lib/supabase'

// Use the get_current_worker() function
async function getCurrentWorker() {
  const { data, error } = await supabase
    .rpc('get_current_worker')

  if (error) {
    console.error('Error fetching worker profile:', error)
    return null
  }

  return data?.[0] ?? null
}
```

### Creating a Worker Context (recommended)

Create `src/contexts/WorkerContext.tsx`:

```typescript
import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase'

interface Worker {
  worker_id: number
  full_name: string
  email: string
  role: string
  phone: string | null
  specialization: string[] | null
  employee_number: string
  hourly_rate: number | null
  is_active: boolean
  user_id: string | null
}

interface WorkerContextType {
  worker: Worker | null
  loading: boolean
  refreshWorker: () => Promise<void>
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined)

export function WorkerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [worker, setWorker] = useState<Worker | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchWorker = async () => {
    if (!user) {
      setWorker(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setWorker(data)
    } catch (error) {
      console.error('Error fetching worker:', error)
      setWorker(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorker()
  }, [user])

  return (
    <WorkerContext.Provider value={{ worker, loading, refreshWorker: fetchWorker }}>
      {children}
    </WorkerContext.Provider>
  )
}

export function useWorker() {
  const context = useContext(WorkerContext)
  if (context === undefined) {
    throw new Error('useWorker must be used within WorkerProvider')
  }
  return context
}
```

## Verification

### Check if user_id is linked

```sql
-- List all workers and their auth status
SELECT
  w.worker_id,
  w.full_name,
  w.email,
  w.employee_number,
  w.user_id,
  CASE
    WHEN w.user_id IS NOT NULL THEN 'Linked'
    ELSE 'Not Linked'
  END as auth_status
FROM workers w
ORDER BY w.worker_id;
```

### Check auth users without worker records

```sql
-- Find auth users without worker profiles
SELECT
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN workers w ON w.user_id = u.id
WHERE w.worker_id IS NULL;
```

## Troubleshooting

### Issue: User can't see their worker profile

**Possible causes:**
1. `user_id` not set in workers table
2. Worker record has `is_active = false`
3. RLS policies blocking access

**Solution:**
```sql
-- Check if user_id is set
SELECT * FROM workers WHERE email = 'inspector@example.com';

-- Update user_id if missing
UPDATE workers
SET user_id = (SELECT id FROM auth.users WHERE email = 'inspector@example.com')
WHERE email = 'inspector@example.com';
```

### Issue: Multiple workers with same user_id

**Solution:**
```sql
-- Find duplicates
SELECT user_id, COUNT(*)
FROM workers
WHERE user_id IS NOT NULL
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Remove duplicates (keep only the most recent)
DELETE FROM workers
WHERE worker_id NOT IN (
  SELECT MAX(worker_id)
  FROM workers
  WHERE user_id IS NOT NULL
  GROUP BY user_id
);
```

### Issue: RLS policies preventing access

**Solution:**
```sql
-- Temporarily disable RLS to test (NOT for production)
ALTER TABLE workers DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
```

## Security Best Practices

1. **Never expose sensitive worker data**: Only return necessary fields in API responses
2. **Use RLS policies**: Always enforce row-level security on workers table
3. **Validate worker roles**: Check user role before allowing certain operations
4. **Audit trail**: Consider adding `created_by` and `updated_by` columns that track user_id
5. **Restrict admin functions**: Only allow admins to create/delete workers

## Next Steps

After completing this setup:

1. Run all SQL migrations in Supabase SQL editor
2. Verify RLS policies are working
3. Link existing workers to their auth accounts
4. Test login and profile access
5. Implement WorkerContext in frontend
6. Update Dashboard to show worker-specific data
7. Add role-based access control for admin features
