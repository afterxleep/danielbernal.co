---
id: 562
title: 'Live preview for your UIKit views'
author: Daniel
layout: post
guid: 'https://danielbernal.co/?p=562'
permalink: /live-preview-for-your-uikit-views/
image: /posts/2021-07-30-live-preview-for-your-uikit-views/header.jpg
categories:
    - code
---

One of the best features of SwiftUI is being able to preview your code during development, but did you know that you can also use SwiftUI to preview your old-fashioned UIKit ViewControllers and Views?

Here’s how…<!--more-->

We will be using a protocol called [`UIViewControllerRepresentable`](https://developer.apple.com/documentation/swiftui/uiviewcontrollerrepresentable), which allows us to create and manage a `UIViewController` from SwiftUI.

Start by creating a simple iOS App in Xcode, and choosing a `UIKit App Delegate `Lifecycle.

![](/assets/posts/2021-07-30-live-preview-for-your-uikit-views/screenshot1.png)

Then, in your app main `ViewController`, create a struct that conforms to the `UIViewControllerRepresentable` protocol, and accepts a closure with a `ViewController` return type.

```swift
import UIKit
import SwiftUI

struct ViewControllerPreview: UIViewControllerRepresentable {
    
    let viewControllerGenerator: () -> UIViewController

    init(_ viewControllerGenerator: @escaping () -> UIViewController) {
        self.viewControllerGenerator = viewControllerGenerator
    }

    func makeUIViewController(context: Context) -> some UIViewController {
        return viewControllerGenerator()
    }

    func updateUIViewController(_ uiViewController: UIViewControllerType, context: Context) {
        
    }
}
```

The protocol requires two methods, that will take care of the creation and updating of your ViewController, but as we will only be using this for creating previews, you can leave the update method empty.

Now update the `ViewController` by adding a simple colored `UILabel` and some constraints.

```swift
final class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        
        let helloView = UILabel()
        helloView.text = "Hello World"
        helloView.textAlignment = .center
        helloView.textColor = .black
        view.addSubview(helloView)

        helloView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            helloView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            helloView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            helloView.widthAnchor.constraint(equalTo: view.widthAnchor),
            helloView.heightAnchor.constraint(equalTo: view.widthAnchor),
        ])
    }
}
```

And then, we just need to create a PreviewProvider that passes the `ViewController` to our previewer.

```swift
struct ProfileViewController_Previews: PreviewProvider {
    static var previews: some View {
        ViewControllerPreview {
            ViewController()
        }
    }
}
```

And that’s it! After you add your previewer, Xcode will automatically start generating real-time previews for your UIKit ViewController!

## Here’s a demo

![](/assets/posts/2021-07-30-live-preview-for-your-uikit-views/demo.gif)

## What about an extension?

Now, that everything works, we can write a simple `UIViewController` extension, to enable previews for all `UIViewControllers` in your app.

```swift
//  UIViewController+Preview.swift

import SwiftUI

extension UIViewController {
    private struct Preview: UIViewControllerRepresentable {

        let viewController: UIViewController
        
        func makeUIViewController(context: Context) -> UIViewController {
            return viewController
        }
        
        func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
    }
    
    func showPreview() -> some View {
        Preview(viewController: self)
    }
}
```

And then, for any `UIKit` `ViewController` you want to enable previews, just do as follows:

```swift
#if DEBUG
import SwiftUI

struct ViewController_Preview: PreviewProvider {
    static var previews: some View {
        ViewController().showPreview()
    }
}
#endif
```

## What about UIViews?

For `UIViews`, we have the [`UIVIewRepresentable`](https://developer.apple.com/documentation/swiftui/uiviewrepresentable) protocol, which has the same skills as `UIViewControllerRepresentable`, so we can also write a quick extension to enable previews for any `UIView`, like this:

```swift
//  UIView+Preview.swift

import UIKit
import SwiftUI

extension UIView {
    private struct Preview: UIViewRepresentable {

        let view: UIView
        
        func makeUIView(context: Context) -> UIView {
            return view
        }
        
        func updateUIView(_ uiView: UIView, context: Context) {}
    }
    
    func showPreview() -> some View {
        Preview(view: self)
    }
}
```

That way, you can also use the `showPreview()` method from any UIView in your app.

## Conclusion &amp; sample project

Now that you know how to preview your `UIKit` stuff its time to go back to that old app of yours and preview the hell out of everything.

As usual, you can grab a copy of the project from Github [here](https://github.com/afterxleep/UIKitPreviews), and reach out via [Twitter](https://twitter.com/afterxleep) or the comments below with questions or ideas.

See you soon!

- - - - - -

<sub>Photo by: [Amza Andrei](https://unsplash.com/@andreiamza2000)</sub>
