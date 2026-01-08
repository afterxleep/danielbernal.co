---
layout: post
title: "Why Your iOS Automation Setup Doesn't Work"
date: 2026-01-06
permalink: /writing/why-your-ios-automation-setup-doesnt-work.html
excerpt: "Apple ships five different command-line tools for iOS development. They don't talk to each other. This broke my AI-assisted workflow, so I fixed it."
quote: "A fragmented interface means fragmented AI capabilities."
---

I spent months trying to make AI coding assistants work with iOS development. It was painful.

Apple ships five different command-line tools. `xcodebuild` handles compilation. `simctl` manages simulators. `devicectl` talks to physical devices (but only iOS 17+). `xcrun` finds and runs Xcode tools. `xcode-select` switches between Xcode versions. Each has its own flag syntax, its own output format, its own failure modes.

Building an app and running it on a simulator requires orchestrating three separate tools:
```bash
xcodebuild -workspace MyApp.xcworkspace \
  -scheme MyApp \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=18.1' \
  -derivedDataPath ./build build

xcrun simctl boot "iPhone 16"
xcrun simctl install "iPhone 16" ./build/Build/Products/Debug-iphonesimulator/MyApp.app
xcrun simctl launch "iPhone 16" com.example.MyApp
```

Four commands. Hardcoded paths. A destination string that breaks if you don't have exactly that simulator version. And this is the happy path.

When I started using Claude to help me build iOS apps, I hit a wall. It would generate xcodebuild commands that looked right but failed. It didn't know which simulator runtimes I had installed, which devices were connected, or where my derived data lived. I'd paste the error back. It would try something different. Still fail. Twenty minutes debugging a build command instead of building the app.

The fragmentation exists because Apple built these tools over fifteen years for different purposes. CI systems adapted by wrapping everything in Ruby. Fastlane became the standard because it hid the complexity. But Fastlane wasn't designed for AI agents.

So I built something that was.

I've been working on [FlowDeck](https://flowdeck.studio) for the past few months. It's a CLI that wraps all of Apple's tools into a unified interface designed for AI agents. Eight verbs instead of eighty-four flags. `build`, `run`, `test`, `clean`, `logs`, `stop`, `context`, `init`. Each does one thing. Structured outputs. Predictable errors.

```bash
flowdeck run -S "iPhone 16"
```

Same result as those four commands above. Figures out the workspace, boots the simulator, builds, installs, launches. If something fails, it tells you why with an error code the AI can actually parse.

The interface shapes what's possible. A fragmented interface means fragmented AI capabilities. A unified interface means I can finally build iOS apps with Claude the same way I'd work on a web project.

The toolchain fragmentation is Apple's problem. I got tired of waiting for them to fix it.
