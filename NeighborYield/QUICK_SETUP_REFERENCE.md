# Quick Setup Reference: Task 12

## 🚀 Automated Setup (Recommended)

If you have your service role key, run this one command:

```bash
# 1. Add service role key to .env (one time only)
# Get from: Supabase Dashboard > Settings > API > service_role key
echo "SUPABASE_SERVICE_ROLE_KEY=your-key-here" >> .env

# 2. Run automated setup
cd NeighborYield
node apply-task-12-setup.js
```

This will automatically:
- ✅ Apply database migration
- ✅ Create storage bucket
- ✅ Apply storage policies
- ✅ Verify everything works

---

## 📝 Manual Setup (Alternative)

If you prefer manual setup or don't have service role key:

### 1️⃣ Apply Database Migration (2 minutes)

```bash
# 1. Open Supabase Dashboard
https://app.supabase.com → Your Project → SQL Editor

# 2. Copy and run this file:
migrations/add-image-url-to-posts.sql

# 3. Verify it worked:
cd NeighborYield
node test-image-url-migration.js
```

**Expected Result:**
```
✅ image_url column exists and is queryable
✅ Backward compatibility confirmed
🎉 All migration tests passed!
```

---

### 2️⃣ Create Storage Bucket (3 minutes)

```bash
# 1. Open Supabase Dashboard
https://app.supabase.com → Your Project → Storage → New Bucket

# 2. Configure bucket:
Name: post-images
Public: ✅ Enabled
File Size Limit: 5242880
Allowed MIME Types: image/jpeg, image/png

# 3. Apply storage policies:
SQL Editor → Run: migrations/setup-storage-policies.sql

# 4. Verify it worked:
cd NeighborYield
node setup-storage-bucket.js
```

**Expected Result:**
```
✅ Bucket "post-images" already exists
✅ Bucket configuration verified
🎉 Storage bucket setup complete!
```

---

## 📚 Detailed Guides

- **Database Migration**: See `MIGRATION_GUIDE.md`
- **Storage Setup**: See `STORAGE_MANUAL_SETUP.md`
- **Complete Overview**: See `TASK_12_COMPLETION_SUMMARY.md`

---

## ✅ Success Checklist

- [ ] Database migration applied
- [ ] Migration test passes
- [ ] Storage bucket created
- [ ] Storage policies applied
- [ ] Storage test passes

---

## 🆘 Quick Troubleshooting

**Migration test fails?**
→ Run the SQL in Supabase Dashboard first

**Storage test fails?**
→ Follow `STORAGE_MANUAL_SETUP.md` step-by-step

**Need help?**
→ Check the detailed guides or ask for assistance

---

## ⏭️ What's Next?

After both tests pass, you're ready for:
- Task 13: Update App.tsx to handle image posts
- Task 14: Update posts service to handle image URLs
- Task 17: Manual testing and polish
