---
title: "@backDeployed: Could SwiftUI be backward compatible?"
date: 2023-02-22 22:00:00 Z
categories:
- life
layout: post
image: "/assets/back.jpg"
author: Daniel
---

One of the most exciting (yet obscure) changes with iOS 16.4 is the @backDeployed attribute in Swift. 

@backDeployed will allow you to mark certain functions or properties as backward-compatible. When using it, the Swift compiler generates code that checks at runtime whether the feature is available on the target device.<!--more--> If not, it will generate fallback code that allows the feature to work as expected on older versions of iOS.

Theoretically @backDeployed is going to be part of iOS 16.4, which will be released soon. Still, the real deal relies on Apple using this feature in its SwiftUI implementation, as it could significantly boost backward compatibility for SwiftUI apps.

Here’s a quick example of how this works.

 Let’s assume iOS 17 adds a new function to convert temperatures that looks like this:

```swift
@available(iOS 17, *)
func farenheitToToCelsius(_ temperature: Double) -> Double {
  return (temperature - 32) * 5/9
}
```

If your app is targeting an older version, you’ll have to do something like this:

```swift
if #available(iOS 17, *) {
 let temperature = farenheitToCelsius(temp)
} else {
 let temperature = (temp - 32) * 5/9
}
```

With @backDeployed, there will no longer be a need for conditionals or re-implementation, and Apple could make this method available to older versions like this:

```swift
@available(iOS 13, *)
@backDeployed(before: iOS 17)
func farenheitToToCelsius(_ temperature: Double) -> Double {
  return (temperature - 32) * 5/9
}
```

In this case, the function will now be available from iOS 13 unconditionally. Still, the compiler will detect uses of farenheitToToCelsius in your code, and if your target is lower than iOS 17, a local copy of the original function will be embedded.

We still don’t know what Apple is planning here, in regards to SwiftUI, but I hope this makes future releases of SwiftUI backward compatible at some point. 😎

If you want to read more about this proposal, check out the original proposal. This attribute is part of Swift 5.8.

Disclaimer: This post considers the latest iOS 16.4 beta release notes and docs, and while the feature is not available in the first XCode betas (attribute is not recognized), it should appear soon, so keep your eyes peeled.

—
<sup>Photo by <a href="https://unsplash.com/@cdd20">Cdd20</a> on <a href="https://unsplash.com/photos/HQH-GOZ6K2c">Unsplash</a></sup>
  