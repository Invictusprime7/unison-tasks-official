# 🗑️ Clear Conversation History Feature

## Overview
The AI Code Assistant now includes a clear conversation history button for easy chat management.

## Location
The clear button is located in the AI Assistant header bar (purple/blue gradient bar at bottom of screen).

```
┌─────────────────────────────────────────────────────────┐
│ ✨ AI Code Assistant      🗑️  🧠  ⌄                     │
│ (Sparkles icon + title)  (New!)  (Learning) (Expand)    │
└─────────────────────────────────────────────────────────┘
```

## Button Features

### Visual Appearance
- **Icon**: 🗑️ Trash icon (Trash2 from Lucide)
- **Color**: White on gradient background
- **Hover**: Lighter background on hover
- **State**: Disabled (grayed out) when no messages

### Behavior
1. **Click**: Deletes all messages in current conversation
2. **Confirmation**: Immediate deletion (use carefully!)
3. **Feedback**: Toast notification shows success/error
4. **State**: Automatically disabled when chat is empty

## How to Use

### Step 1: Locate the Button
1. Open the Web Builder page
2. Click the AI Assistant bar at bottom to expand
3. Look for the trash icon (🗑️) in the header

### Step 2: Clear History
1. Click the trash icon button
2. Messages are immediately deleted
3. Toast notification confirms: "Conversation cleared"

### Step 3: Start Fresh
1. Chat area is now empty
2. Quick prompts are visible again
3. Begin new conversation with AI

## When to Use

### Good Times to Clear History:
- ✅ Starting a completely different project
- ✅ Switching between modes (code → design → review)
- ✅ Conversation has too many old messages
- ✅ Want to reset context for new topic
- ✅ Testing AI with fresh prompts

### Consider Keeping History When:
- ⚠️ Building on previous responses
- ⚠️ Iterating on a design
- ⚠️ Making incremental improvements
- ⚠️ Referencing earlier code

## Technical Details

### What Gets Deleted:
- ✅ All user messages in current conversation
- ✅ All AI responses in current conversation
- ✅ Message metadata (timestamps, code flags)
- ✅ Database records in Supabase

### What's Preserved:
- ✅ Conversation ID (for future messages)
- ✅ Learning settings
- ✅ Mode selection (code/design/review)
- ✅ Other conversations (if any)

### Database Operation:
```typescript
// Deletes from chat_messages table
DELETE FROM chat_messages 
WHERE conversation_id = [current_conversation_id]
```

## Button States

### Enabled (Active)
- **Condition**: Messages exist in conversation
- **Appearance**: White icon, hover effect
- **Tooltip**: "Clear conversation history"
- **Action**: Deletes all messages

### Disabled (Inactive)
- **Condition**: No messages in conversation
- **Appearance**: Grayed out, no hover effect
- **Tooltip**: "Clear conversation history"
- **Action**: No action (button not clickable)

## Keyboard Shortcuts

Currently: No keyboard shortcut
Possible future: `Ctrl+Shift+Delete` or `Cmd+Shift+Delete`

## Toast Notifications

### Success
```
✅ Conversation cleared
Chat history has been deleted
```

### Error
```
❌ Error
Failed to clear conversation history
```

## Best Practices

### Do:
- ✅ Clear when switching to unrelated topics
- ✅ Clear to reduce context window for AI
- ✅ Clear periodically for performance
- ✅ Use in combination with mode switching

### Don't:
- ❌ Clear mid-conversation while iterating
- ❌ Clear if you might need reference code
- ❌ Spam the button (unnecessary database operations)

## FAQ

**Q: Can I undo after clearing?**
A: No, deletion is permanent. Be sure before clicking.

**Q: Does clearing affect other modes?**
A: No, each mode (code/design/review) has separate conversations.

**Q: Will AI remember my preferences?**
A: Learning is separate from messages. Cleared messages don't affect learning.

**Q: How often should I clear?**
A: When starting new projects or switching contexts significantly.

**Q: Can I export before clearing?**
A: Not currently, but this could be a future feature.

## Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│ AI Code Assistant Header                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ✨ AI Code Assistant    (5 messages)   🧠 Learning     │
│                                                          │
│  [🗑️ Clear]  [🧠 Learning]  [⌄ Collapse]               │
│    ↑            ↑              ↑                         │
│    NEW!     Toggle       Expand/Collapse                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Integration with Other Features

### Works With:
- ✅ **Learning Mode**: Clearing messages doesn't disable learning
- ✅ **Mode Switching**: Can clear before/after switching modes
- ✅ **Quick Prompts**: Shows prompts again after clearing
- ✅ **Code Viewer**: Clears chat but not code in viewer

### Independent Of:
- ✅ **Canvas State**: Doesn't affect drawn elements
- ✅ **Editor Content**: Doesn't clear code editor
- ✅ **Project Files**: Doesn't delete project data
- ✅ **User Account**: Only affects current conversation

## Privacy & Data

### What Happens to Data:
1. **Immediate**: UI clears (messages disappear)
2. **Database**: Records deleted from Supabase
3. **Memory**: Conversation state resets
4. **AI Context**: Next message starts fresh context

### Data Retention:
- ❌ No backup of deleted messages
- ❌ No recovery option
- ❌ No trash/recycle bin
- ✅ Permanent deletion

## Tips & Tricks

### Pro Tips:
1. **Copy important code** before clearing
2. **Clear between major features** for cleaner context
3. **Use quick prompts** after clearing for inspiration
4. **Switch modes + clear** for completely fresh start
5. **Clear regularly** to keep conversations focused

### Workflow Example:
```
1. Build hero section → Generate code
2. Iterate on design → Multiple exchanges
3. Copy final code to editor
4. 🗑️ Clear conversation
5. Start pricing section → Fresh context
6. AI applies new layout (not influenced by hero)
```

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase connection
3. Try refreshing the page
4. Check AI_SETUP_GUIDE.md for troubleshooting

---

**Feature Status**: ✅ Live and functional
**Version**: Added November 11, 2025
**Compatibility**: All browsers with modern JavaScript support
