# AI-Organize Feature Documentation

## Overview

The AI-Organize feature for QuickNotes MindMap is an intelligent auto-organization system that analyzes, clusters, and beautifully arranges mindmap nodes using AI-powered algorithms.

## ✨ Features Implemented

### 1. **AI Clustering Analysis**
- Analyzes node content to identify semantic relationships
- Groups related nodes into 3-7 meaningful clusters
- Assigns descriptive cluster names automatically
- Color-codes clusters for visual clarity

### 2. **Auto-Layout Algorithm**
- Force-directed layout for optimal node positioning
- Evenly distributed cluster centers
- Intelligent spacing to prevent overlap
- Smooth animations during reorganization

### 3. **Interactive UI Components**

#### Auto-Organize Button
- Located in MindMap Editor toolbar
- Glowing gradient effect (blue to green)
- Disabled when less than 2 nodes exist
- Shows "✨ Auto-Organize" text

#### Organizing Modal
- Multi-stage progress indicator:
  - **Analyzing**: Examining node content
  - **Clustering**: Finding patterns
  - **Organizing**: Rearranging layout
  - **Complete**: Success message
- Progress bar (0-100%)
- Smooth fade animations
- Breathing particle effect

#### Cluster Labels
- Floating labels above each cluster
- Inline editing capability
- Color-matched to cluster theme
- Edit icon on hover

### 4. **Undo/Redo System**
- Full history tracking (last 20 states)
- Keyboard shortcuts:
  - `Cmd/Ctrl + Z`: Undo
  - `Cmd/Ctrl + Shift + Z`: Redo
- Visual feedback for disabled states
- Preserves before auto-organize state

### 5. **Settings Integration**
- **Auto-Organize on Add**: Automatically organize when adding new nodes (requires 3+ nodes)
- **Show Suggested Connections**: Display AI-suggested relationships
- Accessible in Settings → AI Features → Mindmap AI Features

## 📂 File Structure

```
src/
├── components/
│   └── mindmap/
│       ├── MindmapEditor.tsx        # Enhanced with AI organize
│       ├── OrganizingModal.tsx      # Progress modal
│       └── ClusterLabel.tsx         # Cluster name labels
├── lib/
│   ├── ai/
│   │   └── mindmap-organizer.ts     # AI clustering service
│   └── store/
│       └── useSettingsStore.ts      # Settings with mindmap options
└── app/
    └── settings/
        └── page.tsx                 # Settings page with toggles
```

## 🎨 Design Tokens

### Colors
- **Cluster Colors**:
  - Blue: `#63cdff`
  - Green: `#8ef292`
  - Pink: `#ff6b9d`
  - Yellow: `#ffd93d`
  - Purple: `#a78bfa`
  - Orange: `#fb923c`

### Animations
- **Modal Fade**: 0.3s spring animation
- **Button Glow**: 2s infinite pulse
- **Progress Bar**: 0.3s ease-out
- **Cluster Labels**: 0.3s scale fade-in

## 🔧 How It Works

### 1. User Triggers Auto-Organize
```typescript
// User clicks "✨ Auto-Organize" button
handleAutoOrganize()
```

### 2. AI Analysis
```typescript
// AI analyzes node labels and identifies clusters
const clusters = await organizerService.analyzeAndCluster(nodes);
```

### 3. Layout Calculation
```typescript
// Force-directed layout algorithm positions nodes
const organized = organizerService.organizeWithForceLayout(
  nodes,
  clusters,
  edges
);
```

### 4. Smooth Animation
```typescript
// React Flow smoothly animates nodes to new positions
setNodes(organized.nodes);
setClusters(organized.clusters);
```

## 💡 Usage Instructions

### For Users

1. **Manual Organization**:
   - Open any mindmap
   - Add at least 2 nodes
   - Click "✨ Auto-Organize" button
   - Watch the AI magic happen!

2. **Auto-Organization**:
   - Go to Settings → AI Features
   - Enable "Auto-Organize on Add"
   - Add nodes and they'll auto-organize

3. **Edit Cluster Names**:
   - Hover over cluster label
   - Click edit icon
   - Type new name
   - Press Enter to save

4. **Undo Changes**:
   - Press `Cmd/Ctrl + Z` to undo
   - Press `Cmd/Ctrl + Shift + Z` to redo

### For Developers

#### Adding New Clustering Logic

```typescript
// In mindmap-organizer.ts
async analyzeAndCluster(nodes: Node[]): Promise<NodeCluster[]> {
  // 1. Prepare node data
  const nodeData = nodes.map(node => ({
    id: node.id,
    label: node.data.label,
  }));

  // 2. Call AI with custom prompt
  const clusters = await this.aiClustering(nodeData);

  // 3. Validate and return
  return this.validateAndEnrichClusters(clusters, nodes);
}
```

#### Customizing Layout Algorithm

```typescript
// In mindmap-organizer.ts
organizeWithForceLayout(
  nodes: Node[],
  clusters: NodeCluster[],
  edges: Edge[]
): OrganizedMindmap {
  // Modify cluster center calculation
  const centers = this.calculateClusterCenters(clusters.length);

  // Adjust node positioning radius
  const radius = Math.max(150, Math.sqrt(clusterNodes.length) * 80);

  // Return organized structure
  return { clusters, nodes, edges };
}
```

## 🚀 Performance Optimizations

### Implemented
- ✅ Lazy loading of AI service
- ✅ Debounced auto-organize on add
- ✅ Limited history to 20 states
- ✅ Memoized callback functions
- ✅ Optimized React Flow rendering

### Recommended for Large Datasets (100+ nodes)
- Use web workers for clustering
- Implement virtual rendering
- Add clustering cache
- Progressive layout updates

## 🎯 Future Enhancements

1. **Suggested Connections**
   - Implement relationship detection
   - Show dashed lines for suggestions
   - Allow accepting/rejecting suggestions

2. **Layout Algorithms**
   - Hierarchical tree layout
   - Circular layout
   - Organic/random layout
   - User-selectable options

3. **Advanced Clustering**
   - Topic modeling for large maps
   - Semantic similarity scoring
   - Custom clustering rules
   - Multi-level clustering

4. **Collaborative Features**
   - Real-time collaboration
   - Shared organization presets
   - Team clustering insights

## 🐛 Known Issues & Solutions

### Issue: AI organizer fails
**Solution**: Check that `OPENROUTER_API_KEY` is set in `.env.local`

### Issue: Nodes overlap after organizing
**Solution**: Increase radius in `organizeWithForceLayout` method

### Issue: Undo doesn't work after organize
**Solution**: Ensure `saveToHistory()` is called before organize

## 📊 Testing

### Manual Test Cases

1. ✅ **Small Map (2-5 nodes)**
   - Create 3-5 nodes with related content
   - Click Auto-Organize
   - Verify clustering makes sense

2. ✅ **Medium Map (10-20 nodes)**
   - Create diverse topics
   - Check cluster distribution
   - Test undo/redo

3. ✅ **Large Map (50+ nodes)**
   - Monitor performance
   - Check for overlaps
   - Verify smooth animations

### Automated Tests (Future)

```typescript
describe('MindmapOrganizer', () => {
  it('should cluster related nodes', async () => {
    const nodes = createTestNodes();
    const clusters = await organizer.analyzeAndCluster(nodes);
    expect(clusters.length).toBeGreaterThan(0);
  });

  it('should position nodes without overlap', () => {
    const organized = organizer.organizeWithForceLayout(nodes, clusters, edges);
    expect(hasNoOverlaps(organized.nodes)).toBe(true);
  });
});
```

## 🎓 Educational Value

This feature demonstrates:
- AI integration in UX workflows
- Force-directed graph layouts
- State management with undo/redo
- Smooth animations with Framer Motion
- LangChain for AI orchestration
- React Flow for interactive diagrams

## 📝 License & Credits

Part of QuickNotes - The Ultimate AI-Powered Note-Taking App

**Technologies Used:**
- React Flow (interactive mindmaps)
- LangChain (AI orchestration)
- Framer Motion (smooth animations)
- OpenRouter API (AI models)
- Zustand (state management)

---

**Status**: ✅ Feature Complete
**Last Updated**: 2025-11-11
**Version**: 1.0.0
