---
layout: page
title: Apps
permalink: /apps/
---

This is a dynamic list of the apps and projects I’m currently (or recently have been) working on. Most are open-source playgrounds to test new ideas, patterns, or features.


### **Bouncer**  
A simple – _open-source_ – SMS blocker.

I wrote this small app as I did not trust any of the available SMS blockers to access my messages. Initially, I used Swift and UIKit in an effort to explore the MVP+Coordinator pattern and released it as an open-source project.

I rewrote the app when the first iOS 14 betas came out, as I wanted to explore pure Swift UI apps while implementing a [Redux-style architecture approach.](https://danielbernal.co/redux-like-architecture-with-swiftui-basics/) (Original UIKit code is available in [this branch](https://github.com/afterxleep/Bouncer/tree/uikit))

- [Github](https://github.com/afterxleep/Bouncer)
- [App Store](https://apps.apple.com/co/app/bouncer-sms-block-list/id1457476313?l=en)

* * *

### **WireKit**  
_Lightweight Networking for your Swift Apps_

WireKit is a lightweight networking library based on Combine, Codable, and URLSession publishers, designed to facilitate the consumption of RestFul APIs.

It takes care of fetching and decoding JSON data, gracefully handling errors so you can focus on what’s important in your app.

For a little background about the approach, check out [this blog post](https://danielbernal.co/writing-a-networking-library-with-combine-codable-and-swift-5/).

- [Github](https://github.com/afterxleep/WireKit)