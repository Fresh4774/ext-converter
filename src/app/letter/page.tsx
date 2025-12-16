"use client";

import { ArrowLeft } from 'lucide-react';

export default function LetterPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] overflow-x-hidden relative">
      
      {/* Top Gradient */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#fff4e6]/30 to-transparent pointer-events-none z-10" />
      
      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fff4e6]/30 to-transparent pointer-events-none z-10" />

      <div className="max-w-3xl mx-auto py-12 px-6 sm:px-16 relative z-20">
        
        {/* Back Button */}
        <a 
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-black text-base font-light mb-8 transition-colors w-fit"
        >
          <ArrowLeft size={18} />
          <span>back to processor</span>
        </a>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-normal leading-tight tracking-tight text-black mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            ext: the file processor
          </h1>
          <p className="text-xl font-light leading-relaxed tracking-tight text-gray-600">
            the letter
          </p>
        </div>

        {/* Content */}
        <div className="space-y-16">
          
          {/* Why Section */}
          <section className="space-y-6">
            <h2 className="text-3xl font-normal leading-10 tracking-tight text-black" style={{ fontFamily: 'Georgia, serif' }}>
              why?
            </h2>
            <div className="space-y-4 text-lg font-light leading-8 tracking-tight text-gray-700">
              <p>
                AI tools won't accept your files. You're trying to debug code, analyze a project, or get help with a codebase. You select your directory. Hit upload. "File type not supported." Or worse: "File too large."
              </p>
              <p>
                You end up copying and pasting file by file. Open index.js, copy, paste into chat. Open utils.py, copy, paste. Open config.json, copy, paste. You're doing this 50 times for a project that has nested folders. You miss files. You paste them out of order. The AI loses context because it can't see the structure.
              </p>
              <p>
                ChatGPT has an upload limit. Claude has format restrictions. Gemini won't take certain extensions. Every AI tool has different rules about what they'll accept. Your workflow breaks every time you switch tools.
              </p>
              <p>
                You can't get help with your actual work because the format is wrong or the size is too big. The AI could solve your problem in seconds, but first you have to spend 15 minutes manually preparing your files.
              </p>
              <p>
                Large projects are impossible to share. You've got a 500-file React app. You need to explain the architecture to an AI. But there's no way to send "everything at once" in a way these tools understand. You either spend an hour copying files manually, or you give up and try to explain it in text without showing the actual code.
              </p>
              <p>
                Code review becomes a nightmare. You want AI to review your PR, but your PR touches 30 files across 6 directories. Good luck copying all that into a chat window while maintaining file paths and structure.
              </p>
            </div>
          </section>

          {/* Why Now Section */}
          <section className="space-y-6">
            <h2 className="text-3xl font-normal leading-10 tracking-tight text-black" style={{ fontFamily: 'Georgia, serif' }}>
              why now?
            </h2>
            <div className="space-y-4 text-lg font-light leading-8 tracking-tight text-gray-700">
              <p>
                Every developer is using AI assistants. ChatGPT, Claude, Gemini, Copilot—these aren't optional tools anymore. They're how people code, debug, and learn.
              </p>
              <p>
                But the tools weren't built for real projects. They were built for demos. "Paste your code here" works when you're asking about a single function. It breaks down when you're working on anything real.
              </p>
              <p>
                AI context windows got massive. These models can handle 200k+ tokens. They can read your entire codebase at once. But there's no good way to actually give them your entire codebase.
              </p>
              <p>
                File upload limits are artificial. The AI can process the content just fine—the problem is upload restrictions and format limitations built into the interfaces.
              </p>
              <p>
                The Browser File System API exists. Modern browsers can read entire directories. You can select a folder and access everything inside it. We're just using it properly.
              </p>
              <p>
                Everyone is hitting this problem constantly. Every developer working with AI runs into "can't upload this file" multiple times per day. There's no good solution except tedious manual work.
              </p>
            </div>
          </section>

          {/* Value Proposition Section */}
          <section className="space-y-8">
            <h2 className="text-3xl font-normal leading-10 tracking-tight text-black" style={{ fontFamily: 'Georgia, serif' }}>
              value proposition
            </h2>
            
            <div className="space-y-8">
              {/* Universal File Processing */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-xl font-normal text-black mb-3">
                  Universal File Processing
                </h3>
                <ul className="space-y-2 text-base font-light leading-7 text-gray-700">
                  <li>- Upload entire directories with full structure preserved</li>
                  <li>- Select individual files or whole folders</li>
                  <li>- Process unlimited files at once</li>
                  <li>- Works with every file type—code, config, documentation, everything</li>
                  <li>- Zero uploads to servers, everything stays in your browser</li>
                  <li>- Privacy-first: your code never leaves your machine</li>
                </ul>
              </div>

              {/* AI-Ready Conversion */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-xl font-normal text-black mb-3">
                  AI-Ready Conversion
                </h3>
                <ul className="space-y-2 text-base font-light leading-7 text-gray-700">
                  <li>- Converts any project into clean, formatted plain text</li>
                  <li>- Maintains file paths and directory structure</li>
                  <li>- Automatic separators between files for clear organization</li>
                  <li>- Format optimized for AI context windows</li>
                  <li>- One-click download as .txt file you can paste anywhere</li>
                  <li>- Bypasses every AI tool's upload restrictions</li>
                </ul>
              </div>

              {/* Smart File Selection */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-xl font-normal text-black mb-3">
                  Smart File Selection
                </h3>
                <ul className="space-y-2 text-base font-light leading-7 text-gray-700">
                  <li>- Choose exactly which files to include</li>
                  <li>- Exclude node_modules, build folders, or any junk</li>
                  <li>- Visual checkbox interface for quick selection</li>
                  <li>- Select all/deselect all for batch operations</li>
                  <li>- See exactly what you're sending before conversion</li>
                  <li>- No more accidentally including giant dependency folders</li>
                </ul>
              </div>

              {/* Syntax Highlighting */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-xl font-normal text-black mb-3">
                  Syntax Highlighting
                </h3>
                <ul className="space-y-2 text-base font-light leading-7 text-gray-700">
                  <li>- Beautiful code preview with automatic language detection</li>
                  <li>- Supports 15+ programming languages</li>
                  <li>- Prism.js powered syntax highlighting</li>
                  <li>- Makes code readable before you convert it</li>
                  <li>- Verify everything looks correct before export</li>
                </ul>
              </div>

              {/* Language Distribution Analysis */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-xl font-normal text-black mb-3">
                  Language Distribution Analysis
                </h3>
                <ul className="space-y-2 text-base font-light leading-7 text-gray-700">
                  <li>- GitHub-style language breakdown bar</li>
                  <li>- See percentage of each file type in your project</li>
                  <li>- Color-coded visualization of your tech stack</li>
                  <li>- Interactive tooltips with exact percentages</li>
                  <li>- Quick way to verify you selected the right files</li>
                </ul>
              </div>

              {/* Sidebar File Viewer */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-xl font-normal text-black mb-3">
                  Sidebar File Viewer
                </h3>
                <ul className="space-y-2 text-base font-light leading-7 text-gray-700">
                  <li>- Click any file to preview full contents</li>
                  <li>- Desktop: smooth slide from right</li>
                  <li>- Mobile: bottom sheet with full-screen view</li>
                  <li>- Full syntax highlighting in preview</li>
                  <li>- Navigate through files before processing</li>
                </ul>
              </div>

              {/* Zero Configuration */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-xl font-normal text-black mb-3">
                  Zero Configuration
                </h3>
                <ul className="space-y-2 text-base font-light leading-7 text-gray-700">
                  <li>- Works instantly in any browser</li>
                  <li>- No installation, no sign-up, no setup</li>
                  <li>- No dependencies to install</li>
                  <li>- No file size limits</li>
                  <li>- No format restrictions</li>
                  <li>- Just works</li>
                </ul>
              </div>

              {/* Compression for Large Projects */}
              <div>
                <h3 className="text-xl font-normal text-black mb-3">
                  Compression for Large Projects
                </h3>
                <ul className="space-y-2 text-base font-light leading-7 text-gray-700">
                  <li>- Take 500-file codebases and make them AI-sendable</li>
                  <li>- Smart formatting keeps structure clear</li>
                  <li>- Removes unnecessary whitespace</li>
                  <li>- Plain text is dramatically smaller than zip files</li>
                  <li>- Fits massive projects into AI context windows</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Market Fit Section */}
          <section className="space-y-6">
            <h2 className="text-3xl font-normal leading-10 tracking-tight text-black" style={{ fontFamily: 'Georgia, serif' }}>
              market fit
            </h2>
            <div className="space-y-4 text-lg font-light leading-8 tracking-tight text-gray-700">
              <p>
                Millions of developers use AI assistants every day. ChatGPT has 200M+ weekly active users. GitHub Copilot has millions of paid subscribers. Claude, Gemini, Perplexity—everyone's using these tools.
              </p>
              <p>
                Every single one of them has file upload limitations. Every developer hits this problem constantly. There's no good solution—just workarounds and frustration.
              </p>
              <p>
                The workflow is broken. People want to say "here's my project, help me fix it." Instead they're saying "let me copy-paste 50 files one by one and hope I don't miss anything important."
              </p>
              <p>
                AI context windows keep getting bigger. Tools can handle more code. But the upload process hasn't caught up. We're solving the bottleneck between what developers want to do and what the tools allow.
              </p>
              <p>
                This isn't a niche problem. If you code and use AI, you need this.
              </p>
            </div>
          </section>

          {/* Core Offerings Section */}
          <section className="space-y-6 py-8 border-y border-gray-200">
            <div className="space-y-3 text-center">
              <p className="text-2xl font-normal text-black" style={{ fontFamily: 'Georgia, serif' }}>
                Actually Useful File Processing
              </p>
              <p className="text-xl font-light text-gray-700">
                Never Copy-Paste Files Again
              </p>
              <p className="text-xl font-light text-gray-700">
                Works With Every AI Tool
              </p>
              <p className="text-xl font-light text-gray-700">
                Your Entire Project in One Click
              </p>
              <p className="text-xl font-light text-gray-700">
                Privacy-First: Nothing Leaves Your Browser
              </p>
              <p className="text-xl font-light text-gray-700">
                No Size Limits, No Format Restrictions
              </p>
              <p className="text-base font-light text-gray-600 mt-6">
                we offer all of them.
              </p>
            </div>
          </section>

          {/* Manifesto Section */}
          <section className="space-y-6">
            <div className="space-y-4 text-lg font-light leading-8 tracking-tight text-gray-700">
              <p>
                Everyone says "just paste your code into ChatGPT" like that's realistic for real projects.
              </p>
              <p>
                We say that's not how actual development works.
              </p>
              <p>
                Your projects have hundreds of files. They span multiple directories. They use different languages. They include configs, docs, and dependencies. You can't copy-paste that. You shouldn't have to.
              </p>
              <p>
                Everyone says "just share the relevant files" or "simplify it" or "describe it in text."
              </p>
              <p>
                We say stop making developers do manual prep work.
              </p>
              <p>
                EXT reads your entire directory at once. Lets you select exactly what matters. Shows you previews with syntax highlighting. Converts everything to plain text. Downloads it in one click. You paste it wherever you need it.
              </p>
              <p>
                You just select your folder. Choose your files. Click process. Everything else is automatic.
              </p>
              <p>
                File processors shouldn't require configuration. They shouldn't upload your code to random servers. They shouldn't have format restrictions. They shouldn't limit file sizes.
              </p>
              <p>
                Upload limits shouldn't block your workflow. Format restrictions shouldn't force workarounds. AI tools can handle your code—the problem is getting it to them.
              </p>
              <p>
                Privacy shouldn't be optional. Your code is your code. It should never leave your machine unless you explicitly choose to share it.
              </p>
              <p className="text-xl font-normal text-black" style={{ fontFamily: 'Georgia, serif' }}>
                Development is hard enough. Your tools should make it easier.
              </p>
            </div>
          </section>

          {/* Future Section */}
          <section className="space-y-6">
            <h2 className="text-3xl font-normal leading-10 tracking-tight text-black" style={{ fontFamily: 'Georgia, serif' }}>
              future
            </h2>
            <ul className="space-y-2 text-lg font-light leading-7 text-gray-700">
              <li>Custom Formatting Presets</li>
              <li>Team Collaboration Features</li>
              <li>Direct AI Integration</li>
              <li>Git Diff Processing</li>
              <li>API for Tool Developers</li>
            </ul>
          </section>

        </div>

        {/* CTA */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <a 
            href="/"
            className="inline-block px-8 py-4 text-lg font-light text-black border border-gray-200 hover:border-gray-300 transition-colors"
          >
            try ext now
          </a>
        </div>

      </div>
    </div>
  );
}