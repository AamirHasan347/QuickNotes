# Vercel Environment Variables Setup Guide

This guide will help you configure environment variables for QuickNotes on Vercel to enable AI features in production.

## Why This Is Needed

Your QuickNotes app uses OpenRouter AI API to power features like:
- Note summarization
- Mindmap generation
- Quiz creation
- Study assistant

These features work locally because the API key is stored in `.env.local`, but Vercel needs the environment variables configured separately for production deployments.

---

## Step-by-Step Setup Instructions

### 1. Access Your Vercel Project Dashboard

1. Go to [vercel.com](https://vercel.com) and log in
2. Click on your QuickNotes project
3. Navigate to **Settings** tab

### 2. Configure Environment Variables

1. In the Settings sidebar, click on **Environment Variables**
2. Add the following variables one by one:

#### Required Variables:

**OPENROUTER_API_KEY**
```
Variable Name: OPENROUTER_API_KEY
Value: [Your OpenRouter API key]
Environment: Production, Preview, Development (select all)
```

**NEXT_PUBLIC_APP_URL**
```
Variable Name: NEXT_PUBLIC_APP_URL
Value: https://your-app-domain.vercel.app (replace with your actual Vercel URL)
Environment: Production, Preview, Development (select all)
```

### 3. Get Your OpenRouter API Key

If you don't have your API key handy:

1. Visit [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign in to your OpenRouter account
3. Create a new API key or copy your existing one
4. The key should start with `sk-or-v1-...`

### 4. Redeploy Your Application

After adding the environment variables:

1. Go to the **Deployments** tab in Vercel
2. Click on the latest deployment
3. Click the three dots menu (⋯) and select **Redeploy**
4. Check "Use existing Build Cache" for faster deployment
5. Click **Redeploy**

---

## Verification

After redeployment completes:

1. Visit your production URL
2. Try using an AI feature (e.g., summarize a note)
3. Check the browser console (F12) for any errors
4. If you see the error "AI service is not configured", double-check:
   - Variable names are spelled exactly as shown above
   - No extra spaces in variable names or values
   - Variables are enabled for "Production" environment
   - Redeployment completed successfully

---

## Troubleshooting

### AI Features Still Not Working?

1. **Check Environment Variables**
   ```bash
   # In Vercel dashboard, verify:
   - OPENROUTER_API_KEY is set and not empty
   - NEXT_PUBLIC_APP_URL matches your domain
   ```

2. **Check Vercel Logs**
   - Go to Deployments tab
   - Click on your latest deployment
   - View the runtime logs for error messages
   - Look for "OPENROUTER_API_KEY is not configured" errors

3. **Verify API Key is Valid**
   - Test your API key locally first
   - Make sure your OpenRouter account has credits/usage available
   - Check if the API key has been revoked or expired

4. **Browser Cache**
   - Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear browser cache and cookies for your app's domain

### Error: "AI service is not configured"

This means the `OPENROUTER_API_KEY` environment variable is missing or not accessible. Follow these steps:

1. Verify the variable is added in Vercel Settings → Environment Variables
2. Make sure it's enabled for the "Production" environment
3. Redeploy the application
4. Wait 2-3 minutes for the deployment to complete

### API Key Security

**Important:** If your `.env.local` file was ever committed to git, your API key may be exposed in git history. If this happened:

1. Rotate your API key at [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Delete the old key
3. Create a new key
4. Update both your local `.env.local` and Vercel environment variables
5. Optional: Clean git history using `git filter-branch` or BFG Repo-Cleaner

---

## Local Development

For local development, continue using `.env.local`:

```bash
# Copy .env.example to .env.local if you haven't already
cp .env.example .env.local

# Edit .env.local and add your keys:
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Never commit `.env.local` to git!** This file is already in `.gitignore`.

---

## Summary

✅ **What We Fixed:**
- Added API key validation in all AI route handlers
- Fixed hardcoded localhost URL to use dynamic environment variable
- Created `.env.example` for documentation
- Verified `.gitignore` includes environment files

✅ **What You Need To Do:**
1. Add `OPENROUTER_API_KEY` to Vercel environment variables
2. Add `NEXT_PUBLIC_APP_URL` to Vercel environment variables
3. Redeploy your application

After completing these steps, all AI features will work on all devices accessing your production deployment!

---

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/projects/environment-variables)
- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
