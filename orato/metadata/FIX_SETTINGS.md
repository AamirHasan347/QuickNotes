# 🔧 Fix AI Settings - Remove GPT-4 Config

## ✅ Problem Found!

Your app was configured to use **GPT-4** (a paid model) instead of the free **DeepSeek R1** model.

From the logs:
```
🤖 [BASE SERVICE] Model: gpt-4
🎨 [BASE SERVICE] Custom model: gpt-4

Error: 402 This request requires more credits
You requested up to 300 tokens, but can only afford 254.
```

## 🔍 Why This Happened

The default settings in `useSettingsStore.ts` had:
```typescript
aiModel: 'gpt-4',  // ❌ Paid model
```

This was saved to your browser's localStorage, so even after I updated the code, your browser still remembers the old setting.

## ✅ Solution - Three Options

### Option 1: Clear Settings via Browser Console (EASIEST)

1. Open your app in browser: `http://localhost:3000`
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Paste this code and press Enter:

```javascript
localStorage.removeItem('quicknotes-settings');
location.reload();
```

This will reset all settings to the new defaults (with free DeepSeek model).

### Option 2: Clear All LocalStorage (NUCLEAR OPTION)

**Warning:** This will clear ALL saved data (notes, settings, workspaces)

1. Open DevTools (`F12`)
2. Go to **Application** tab
3. Click **Local Storage** → `http://localhost:3000`
4. Click **Clear All** button
5. Refresh the page

### Option 3: Manual Settings Update

1. Open your app
2. Go to **Settings** page
3. Find **AI Settings** section
4. Change **AI Model** from `gpt-4` to `deepseek/deepseek-r1:free`
5. Save settings

## 📋 Verify It's Fixed

After clearing settings, check the logs again when using AI features. You should see:

```
🤖 [BASE SERVICE] Model: deepseek/deepseek-r1:free
🎨 [BASE SERVICE] Custom model: none
```

Instead of:
```
🤖 [BASE SERVICE] Model: gpt-4  ❌
🎨 [BASE SERVICE] Custom model: gpt-4  ❌
```

## 🎯 What I Changed

Updated `/src/lib/store/useSettingsStore.ts`:

```diff
- aiModel: 'gpt-4',
+ aiModel: 'deepseek/deepseek-r1:free', // Free model for default
```

## 🚨 Important Notes

### If You Want to Use GPT-4

If you actually want to use GPT-4 and have credits:

1. Add credits to your OpenRouter account: https://openrouter.ai/settings/credits
2. Then you can keep using GPT-4

### If You Want to Stay Free

Use one of these free models in settings:

- `tngtech/deepseek-r1t2-chimera:free` (BEST - Fast & accurate, what we use now! ⭐)
- `deepseek/deepseek-r1:free` (Good for reasoning, slower)
- `meta-llama/llama-3.2-3b-instruct:free` (Faster, simpler)
- `google/gemma-2-9b-it:free` (Good alternative)

## 📝 After Fixing

Once you clear the settings:

1. Refresh your app
2. Try using AI features again (summarize, mindmap, chat)
3. Watch the logs - should show DeepSeek model
4. All AI features should work without 402 errors

## 🎉 Next Steps

1. ✅ Clear localStorage using Option 1 above
2. ✅ Refresh the page
3. ✅ Try the chat feature again
4. ✅ Send me the new logs if you still get errors

The 402 error should be gone! All features will use the free DeepSeek model. 🚀
