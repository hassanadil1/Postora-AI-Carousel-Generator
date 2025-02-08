#Project Overview
Use this guide to build a web app where users can give entire blogs or large contents to AI and get highlighted important parts of the content in a priority order of importance and relevance. The points will then be put in a carousel (text to image) by using a model on replicate.
These carousels will be used for linkedin posts initially, then we will expand the functionality to other social media platforms.


##Content Processing Flow  
flowchart TD
    A[User Input\n(Text/File/URL)] --> B[DeepSeek-R1 Analysis]
    B --> C{Dominant Topic\nDetection}
    C --> D[Priority Bullet Points\nGeneration]
    D --> E[Canva API Workflow]
    E --> F[Template Selection]
    F --> G[Auto-Populate Content]
    G --> H[Design Customization]
    H --> I[Output Generation]
    
    subgraph Canva API Calls
        E --> Auth["Authentication\n(Get Canva API Token)"]
        F --> Template["1. Select Template\n(LinkedIn/TikTok/IG)"]
        G --> Populate["2. Populate Elements\n- Text Boxes\n- Image Placeholders\n- Brand Colors"]
        H --> Edit["3. Enable User Edits\n(Text/Fonts/Positioning)"]
    end
    
    I --> J{Output Options}
    J --> K[Download PDF/PNG]
    J --> L[Save to Canva]
    J --> M[Direct Social Post]
    
    style E stroke:#00c4cc,stroke-width:2px
    style J stroke:#2ecc71,stroke-width:2px


#Feature Requirements
-We will be using nextjs, shadcn, lucid icon, replicate, supabase, clerk for the this project.
## Front-End Feature Requirements for "Postora"  
### Homepage (`/`)  
**Core Elements**:  
- **Hero Section**:  

  - Large header: "Turn Long Content into Scroll-Stopping Carousels 🚀".  
  - Subheader: "Paste a blog, upload a speech, or drag-and-drop files—get AI-designed social media posts in seconds."  
  - CTA Button: "Start Creating →" (links to `/create`).  
- **Features Grid**:  
  - 3 cards with icons: "Blog-to-Carousel", "Speech-to-Post", "1-Click Branding".  
- **Demo Section**:  
  - Side-by-side comparison: "Before (Text)" → "After (Carousel)" with slider.  
- **Footer**:  
  - Links: Pricing, Blog, Contact.  
  - Newsletter signup: "Get 3 free carousels monthly."  

---

### Content Input Page (`/create`)  
**Core Elements**:  
1. **Header**:  
   - Navbar with: Logo (Home), "Templates", "Pricing", Profile Icon (Dropdown: Account, Logout).  
   - Breadcrumb: Home → Create.  

2. **Input Section**:  

    // Frontend workflow
async function processContent(content: string) {
  // Step 1: DeepSeek-R1 Analysis
  const bullets = await replicate.run("deepseek-ai/r1", {
    input: {
      text: content,
      task: "topic_based_bullet_points"
    }
  });
  
  // Step 3: Combine with Canva
  return assembleCarousel(bullets, images);
}

   - **Text Area**:  
     - Placeholder: "Paste your blog, essay, or speech here... (Min. 300 characters)".  
     - Character counter (visible when typing).  
   - **File Upload**:  
     - Drag-and-drop zone: "Or upload PDF/DOCX/TXT files".  
     - Supported formats badge: "Supports: .pdf, .docx, .txt".  
   - **Content Source Toggle**:  
     - Buttons: "Write Here", "Upload File", "Import from URL" (for blogs).  

3. **Output Customization**:  
   - **Format Buttons**: Horizontal scroll of options:  
     - "LinkedIn Carousel", "Twitter Thread", "TikTok Captions", "Instagram Posts".  
   - **Style Presets**:  
     - Buttons: "Professional", "Playful", "Minimalist" (changes preview theme).  
   - **Branding Options** (Collapsible Section):  
     - Color picker: Primary/secondary colors.  
     - Font selector: Dropdown (Arial, Helvetica, etc.).  
     - Logo upload: Drag-and-drop for PNG/SVG.  

4. **Generate Button**:  
   - Centered, large button: "✨ Generate Now" (triggers API call).  
   - Loading state: Spinner + "Analyzing your content..."  

---

### Output Page (`/output`)  

**Core Elements**:  
1. **Preview Panel**:  
   - Mobile/Desktop view toggle.   
   - Carousel slides (swipeable) with:  
     - Slide number indicator.  
     - Edit button per slide: "Edit Text", "Change Image".  
   - Download options: "PDF", "PNG", "PPTX".  

2. **Post Variations**:  
   - Tabs: "Carousel", "Thread", "Reels Captions" (shows reformatted content).  

3. **Action Bar**:  
   - Buttons: "Regenerate", "Save Template", "Share to LinkedIn".  
   - Stats: "Time Saved: 2hrs 15min" (dynamic based on content length).  

---

### Front-End Implementation Guide  
**Component Structure**:  
```tsx
// Layout
<Header>
  <Logo />
  <NavLinks />
  <UserMenu />
</Header>

<Main>
  // Input Page
  <ContentInputForm>
    <TextArea />
    <FileDropzone />
    <SourceToggleButtons />
  </ContentInputForm>

  // Customization
  <StyleCustomizer>
    <FormatButtons />
    <BrandingOptions />
  </StyleCustomizer>

  // Output Page  
  <PreviewPanel>
    <SlideViewer />
    <DownloadOptions />
  </PreviewPanel>
</Main>

<Footer>
  <NewsletterForm />
  <SocialLinks />
</Footer>


#Relevant docs

##How to use the deepseek-r1 model from replicate
Set the REPLICATE_API_TOKEN environment variable


Install Replicate’s Node.js client library

npm install replicate

Run deepseek-ai/deepseek-r1 using Replicate’s API. Check out the models schema for an overview of inputs and outputs.

import Replicate from "replicate";
const replicate = new Replicate();

const input = {
    prompt: "What is the speed of an unladen swallow?"
};

for await (const event of replicate.stream("deepseek-ai/deepseek-r1", { input })) {
  process.stdout.write(`${event}`)
};

##How to use the text to image model from replicate





#Current File Structure

📁 POSTORA
├── 📁 .next
├── 📁 app
│   ├── 🎨 favicon.ico
│   ├── 📄 globals.css
│   ├── 📄 layout.tsx
│   └── 📄 page.tsx
├── 📁 components
├── 📁 hooks
├── 📁 lib
│   └── 📄 utils.ts
├── 📁 node_modules
├── 📁 public
├── 📁 requirements
│   └── 📄 frontend_instructions.md
├── 📄 .gitignore
├── 📄 components.json
├── 📄 eslint.config.mjs
├── 📄 next-env.d.ts
├── 📄 next.config.ts
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 postcss.config.mjs
├── 📄 README.md
├── 📄 tailwind.config.ts
└── 📄 tsconfig.json

#Rules
-All new components should go in /components and be named like example-component.tsx unless otherwise specified
-All new pages go in /app
