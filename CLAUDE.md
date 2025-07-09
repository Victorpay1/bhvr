IMPORTANT: I AM NOT A DEVELOPER - PLEASE FOLLOW THESE GUIDELINES

Non-Developer Guidelines:
1. I am NOT a technical person - assume I don't know programming terms or concepts
2. When you encounter ANY error or issue:
   - DO NOT ask me technical questions
   - DO NOT ask me to run commands or check logs
   - Instead, figure it out yourself and fix it automatically
   - Only tell me when it's fixed and working
3. When explaining things:
   - Use simple, everyday language
   - Avoid technical jargon
   - Compare to real-world concepts I'd understand
   - Show me visually what's happening when possible
4. If something breaks:
   - Fix it yourself first
   - If you absolutely can't fix it, explain in VERY simple terms what's wrong
   - Give me one-click or copy-paste solutions only

Standard Workflow
1. First think through the problem, read the codebase for relevant files, and write a plan to projectplan.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the projectplan.md file with a summary of the changes you made and any other relevant information.

Terminal & Localhost Management Rules (For Non-Developers)
1. When starting any app:
   - Handle ALL technical setup automatically
   - Just tell me "Your app is ready at [URL]" when done
   - If something's blocking it, fix it yourself
2. If the app won't show in browser:
   - Fix it automatically
   - Try different approaches until it works
   - Only tell me when it's working
3. Keep apps running:
   - Use background processes (nohup, etc.)
   - Auto-restart if they crash
   - Don't ask me to check logs or run commands
4. Simple status updates only:
   - "Setting up your app..."
   - "Almost ready..."
   - "Your app is ready! Click here: http://localhost:5173"
   - "Fixed an issue, everything's working now!"

Developer-Only Terminal Rules (Claude should handle these internally):
- Check ports with lsof before starting
- Install dependencies automatically
- Handle all errors and conflicts
- Keep detailed logs but don't show them to user
- Use nohup for background processes

BHVR Project Setup (For New Projects)
When starting a new web app project, automatically set up bhvr:
1. Check if bhvr is already installed in the current directory
2. If not, install it automatically:
   - First ensure Bun is installed: curl -fsSL https://bun.sh/install | bash
   - Set up PATH: export BUN_INSTALL="$HOME/.bun" && export PATH="$BUN_INSTALL/bin:$PATH"
   - Clone bhvr: git clone https://github.com/stevedylandev/bhvr.git . || git clone https://github.com/stevedylandev/bhvr.git bhvr-temp && mv bhvr-temp/* . && mv bhvr-temp/.* . 2>/dev/null || true && rm -rf bhvr-temp
   - Install dependencies: bun install
   - Start in background: nohup bun run dev > dev-server.log 2>&1 &
3. Always verify the app is running before telling the user
4. Just tell the user: "Your app is ready at http://localhost:5173"

What is bhvr?
- It's a modern web app template (like a pre-built foundation)
- Includes frontend (what users see) and backend (data storage)
- Everything is pre-configured and ready to build on
- Perfect for non-developers because all the complex setup is done

AUTO-SAVE FEATURE
- This project has auto-save set up!
- To save your work at any time, just say: "save my work" or "save progress"
- Claude will automatically run ./save-my-work.sh which will:
  - Commit all changes with a timestamp
  - Try to backup to GitHub if connected
- No git commands needed - just ask to save!
- Works like clicking "Save" in Word or Google Docs