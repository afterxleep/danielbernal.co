---
title: Protocols and Combine&#58; Using @Published in your Protocol declaration
date: 2020-06-26 00:00:00 Z
categories:
- code
layout: post
comments: true
image: "/assets/protocol_code.jpg"
---

The [@ObservableObject and @Published](https://www.hackingwithswift.com/quick-start/swiftui/what-is-the-published-property-wrapper) property wrappers are the sauce of Combine powered apps. With Combine and SwiftUI, it's easy to use the @Published wrapper in our ViewModel properties and have the Views automatically update as changes to these happen.

Everything works great until you want to use Protocols to facilitate dependency injection and testing in your Models and ViewModel classes, as we've been doing in our regular MVVM apps for the past few years.
<!--more-->
You will soon discover that Swift (As of now, version 5.3) does not support property wrappers in Protocol declarations, and marking a property as @Published in a protocol will throw an error.

## The Problem
To explain the issue, we will use a Playground to write a quick demo app using Combine and SwiftUI, following the MVVM pattern.  It will consist of three components. (You guessed: Model, ViewModel and View)

#### Here's the Code
```swift
import PlaygroundSupport
import SwiftUI
import Combine

class AnimalGenerator: ObservableObject {

     @Published private(set) var name: String = ""
     let animals = ["Cat", "Dog", "Crow", "Horse", "Iguana", "Cow", "Racoon"]

    init() {
        generate()
    }

    func generate() {
        self.name = animals.randomElement() ?? ""
    }
}

class TheViewModel: ObservableObject {

    @Published var displayData: String = "No data"
    var generator: AnimalGenerator = AnimalGenerator()
    var cancellable: AnyCancellable?

    init() {
        cancellable =
            generator
                .$name
                .receive(on: RunLoop.main)
                .sink { [weak self] data in
                    self?.displayData = data
            }
    }

    func generate() {
        generator.generate()
    }
}

struct TheView: View {

    @ObservedObject var viewModel: TheViewModel = TheViewModel()

    var body: some View {
        VStack {
            Text(viewModel.displayData).font(.system(.largeTitle)).padding()
            Button("Tap me", action: { self.viewModel.generate() })
        }
    }
}

PlaygroundPage.current.setLiveView(TheView())
```

#### And voilá. Here is the result
<img src="/assets/demo.gif" width="400">

### The components:

#### AnimalGenerator
This is our Model.  It holds a list of animal names and has a method to publish one random animal name via a Publisher.  *(@Published private(set) var name)*

#### TheViewModel
Our ViewModel, responsible for managing the View.  It owns our Model, subscribes to it and then re-publishes *name* via its *displayData* publisher. *(@Published var textToShow).*

#### TheView
For the sake of simplicity we are using a SwiftUI View with a text and a button.  It owns our ViewModel and subscribes to it.  It displays the ViewModel's *displayData* value as a Text whenever the data changes.

When you tap the button, it calls the generate() method in the ViewModel.  The ViewModel calls the same method in our Model and Combine takes cares of publishing the changes.

### And Where is the Protocol?
Everything works so far, but what if instead of instantiating AnimalGenerator in our ViewModel, we want to use a Protocol as a blueprint to different models with different data generators.  This is when Protocol Oriented Programming shines.

Let's write a simple protocol called "Generator" and update our "AnimalGenerator" class to conform.

#### Our Protocol
```swift
protocol Generator {
    @Published var name: String { get }
    func generate()
}
```

#### Our AnimalGenerator Model conforming to it
```swift
class AnimalGenerator: Generator, ObservableObject {

     @Published private(set) var name: String = ""
     let animals = ["Cat", "Dog", "Crow", "Horse", "Iguana", "Cow", "Racoon"]

    init() {
        generate()
    }

    func generate() {
        self.name = animals.randomElement() ?? ""
    }
}
```

#### Houston, we have a problem

![](/assets/wrapper-error.png)
`Property declared inside a protocol cannot have a wrapper.`

The error is reminding us what I was mentioning at the beginning: Wrappers and Stored properties are not allowed in Swift protocols and extensions (at least for now).


## The Solution
Before doing the fix, let's talk about the @Published wrapper.

In essence, a property wrapper is a type that wraps a value and attaches some logic to it.   When a property has a @Published wrapper, some invisible logic is attached to it in order to automatically publish its value anytime it changes.  In this case, it happens explicitly during the *willSet* block execution..

In simple terms, @Published creates a publisher that can be accessed with the *'$'* operator (as we do in our ViewModel), allowing any subscriber to get its value whenever it changes in the future.

Since we cannot use a @Published wrapper as part of our protocol declaration, we need to describe its synthesized methods explicitly. Let's add them to our Generator protocol and AnimalGenerator Model.

#### Our Updated Protocol
```swift
protocol Generator {
    // Wrapped value  
    var name: String { get }

    // (Published property wrapper)
    var namePublished: Published<String> { get }

     // Publisher
    var namePublisher: Published<String>.Publisher { get }
    func generate()
}
```

#### Our Updated Model conforming to it
```swift
class AnimalGenerator: Generator, ObservableObject {

    @Published private(set) var name: String = ""
    var namePublished: Published<String> { _name }
    var namePublisher: Published<String>.Publisher { $name }

     let animals = ["Cat", "Dog", "Crow", "Horse", "Iguana", "Cow", "Racoon"]

    init() {
        generate()
    }

    func generate() {
        self.name = animals.randomElement() ?? ""
    }
}
```

We have now manually defined our Publisher in the Protocol declaration (namePublisher), and exposed both the Publisher (*namePublisher*) and the Published property (*namePubished*) in the Model.  Now let's update our ViewModel to make it work.

#### Our Updated ViewModel
```swift
class TheViewModel: ObservableObject {

    @Published var textToShow: String = "No data"
    var generator: Generator
    var cancellable: AnyCancellable?

    init(generator: Generator) {
        self.generator = generator
        cancellable =
            generator
                .namePublisher
                .receive(on: RunLoop.main)
                .sink { [weak self] data in
                    self?.textToShow = data
            }
    }

    func generate() {
        generator.generate()
    }
}
```

Note that we are now using our manually exposed *generator.namePublisher* and we are not using the *'$'* operator anymore with *generator.$name*

## And now, let's fix the View
In the original example, we are instantiating the ViewModel from inside the View, and we can continue to do the same, just by passing the Generator we want to use, like this:

#### Our Updated View
```swift
struct TheView: View {

    @ObservedObject var viewModel: TheViewModel = TheViewModel(generator: AnimalGenerator())

    var body: some View {
        VStack {
            Text(viewModel.textToShow).font(.system(.largeTitle)).padding()
            Button("Tap me", action: { self.viewModel.generate() })
        }
    }
}
```

It works, but it does not look good, as we are now mashing the View, ViewModel and Model together there.  Let's better instantiate our ViewModel and Model separately and inject them into our View.

First, let's update our View and remove the initialization for the ViewModel.

#### The final version
```swift
struct TheView: View {

    @ObservedObject var viewModel: TheViewModel

    var body: some View {
        VStack {
            Text(viewModel.textToShow).font(.system(.largeTitle)).padding()
            Button("Tap me", action: { self.viewModel.generate() })
        }
    }
}
```

And then, we can simply instantiate our Model and ViewModel and pass them to the View like this.

#### Instantiating and injecting our ViewModel
```swift
let viewModel: TheViewModel = TheViewModel(generator: AnimalGenerator())

PlaygroundPage.current.setLiveView(
    TheView(viewModel: viewModel)
)
```

#### Let's try it out with another Model

```swift
class PersonGenerator: Generator, ObservableObject {

    var namePublished: Published<String> { _name }
    var namePublisher: Published<String>.Publisher { $name }

     @Published private(set) var name: String = ""
     let persons = ["John", "Jane", "Carlos", "Daniel", "Helen", "David", "Bill"]

    init() {
        generate()
    }

    func generate() {
        self.name = persons.randomElement() ?? ""
    }
}

let viewModel = TheViewModel(generator: PersonGenerator())

PlaygroundPage.current.setLiveView(
    TheView(viewModel: viewModel)
)

```

## Note on iOS 14
iOS 14 introduced a new @StateObject wrapper, and it might be a good idea to use it instead of @ObservedObject.

An @ObservedObject instance is replaced every time SwiftUI decides to discard and redraw the View, and thus you might experience weird crashes in different scenarios.  By using @StateObject, you ensure the instance we create is retained even when the View is redrawn or discarded.

Using @StateObject is then particularly useful when you are instantiating your ViewModel from the View itself, as we did in the first example

## Conclusion
As you can see, it is reasonably straightforward to use Combine and still maintain polymorphic interfaces via Protocol Oriented Programming in your classes.

Some would say that the next step would be decoupling the View itself to become completely ignorant of it's ViewModel and use a Protocols there too.  It can be done easily if your are using UIKit, although it will require a little more work with SwiftUI. Nevertheless, for this case, It's overkill.   Maybe we can cover that in another post.

Check out the [final project](https://github.com/afterxleep/Combine-with-Protocols) as an app, or simply run [this playground](https://github.com/afterxleep/Combine-with-Protocols/blob/master/Playground-Sample.playground/Contents.swift) on your favorite device.

---

I hope you have enjoyed this article.  Feel free to follow me and reach out on [Twitter](https://twitter.com/afterxleep) if you have any questions or feedback.



