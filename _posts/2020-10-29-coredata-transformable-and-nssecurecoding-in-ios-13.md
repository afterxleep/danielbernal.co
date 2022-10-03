---
id: 284
title: 'CoreData Transformable and NSSecureCoding in iOS 13+'
author: Daniel
layout: post
guid: 'https://danielbernal.co/?p=284'
permalink: /coredata-transformable-and-nssecurecoding-in-ios-13/
twitterlink: 'https://twitter.com/afterxleep/status/1322183734179909634'
image: /posts/2020-10-29-coredata-transformable-and-nssecurecoding-in-ios-13/CoreDataSecure.png
categories:
    - code
---

If you are using Transformable properties in CoreData, there is a chance (probably when dropping iOS 12 support) that you eventually face compiler warnings about your model properties not using secure Value transformers. While figuring this out, I decided to write a post, so here it is.<!--more-->

If you are using Transformable properties in CoreData, there is a chance (probably when dropping iOS 12 support) that you eventually face this warning:

> A model: is using a nil or insecure value transformer. Please switch to NSSecureUnarchiveFromDataTransformerName or a custom NSValueTransformer subclass of NSSecureUnarchiveFromDataTransformer

The reason behind this message is that starting with iOS 13, Apple is pushing us to adopt [NSSecureCoding](https://developer.apple.com/documentation/foundation/nssecurecoding) (instead of [NSCoding](https://developer.apple.com/documentation/foundation/nscoding)) for our CoreData objects. It’s a simple change, but a huge security improvement. Let’s get into the details.

## NSCoding &amp; the transformable property

<div class="wp-block-image is-style-default"><figure class="alignleft size-large is-resized">![](https://danielbernal.co/wp-content/uploads/2020/10/CoreData-Props.png)</figure></div>Out of the box, CoreData supports several types as part of a Data Model, which are usually enough to cover most needs. Still, from time to time, you’ll need to store different types of objects, and that’s why we have a Transformable type

By using a Transformable type, you can store different types, as long as they implement the [NSCoding](https://developer.apple.com/documentation/foundation/nscoding) protocol, which basically enables any object to be encoded and decoded for archiving and distribution.

To work with transformable objects, a [ValueTransformer](https://developer.apple.com/documentation/foundation/valuetransformer) is required. It is basically a class capable of automatically transforming values from one representation to another.

There is a chance you never had to provide a ValueTransformer before, and that’s because, CoreData uses a default one: `NSKeyedUnarchiveFromData`, which relies on NSCoding, and everything works out of the box.

By using the default attributes (see below), you can use the Transformable type to store any object of the top-level class list, (*NSArray,* *NSDictionary,* *NSSet,* *NSString,* *NSNumber,* *NSDate,* *NSData,* *NSURL,* *NSUUID* and NSNull), without doing anything else.

![](/assets//posts/2020-10-29-coredata-transformable-and-nssecurecoding-in-ios-13//ss1.png)
## NSSecureCoding

While NSCoding is available from iOS 2, it was extended by NSSecureCoding on iOS 6 to enable object transformation more securely.

NSSecureCoding prevents something called “substitution attack”, where an attacker could modify stored data (such as replacing an object of a specific type with other) to put the app in an exploitable state. When used, the class of an object is verified when the object is unarchived making sure it was not replaced by something else. — Simple change, huge benefit.

This means, that with NSSecureCoding, you have to pass the object type upfront to the unarchiver, so it can perform the validation. If there is no match, it will throw an exception and the app will crash preventing any potential damage.

A correct implementation of the the NSSecureCoding protocol in your class, means you have to use: `decodeObject(of: Class, for: Key)` instead of the usual `decodeObject(for: Key).`

Here’s a quick example of a class fully conforming to NSSecureCoding.

```swift
class MyTestClass: NSSecureCoding {

    var name: String = ""
    var last_name: String = ""

    <em>// Make sure you add this property</em>
    static var supportsSecureCoding: Bool = true

    required init?(coder: NSCoder) {
        <em>// NSCoding</em>
        <em>//name = coder.decodeObject(forKey: "name") as? String ?? ""</em>
        <em>//last_name = coder.decodeObject(forKey: "last_name") as? String ?? ""</em>

        <em>// NSSecureCoding</em>
        name = coder.decodeObject(of: NSString.self, forKey: "name") as String? ?? ""
        last_name = coder.decodeObject(of: NSString.self, forKey: "last_name") as String? ?? ""
    }

    func encode(with coder: NSCoder) {
        coder.encode(name, forKey: "name")
        coder.encode(last_name, forKey: "last_name")
    }

}
```

As you can see, we first set the `supportsSecureEncoding `variable to true, and then explicitly define the type of object in advance when decoding our objects.

The NSSecureCoding protocol is adopted by a huge list of Apple native classes, including UIColor, UIImage, and pretty much everything you want, allowing you to store all sorts of things without the need to write a custom Value Transformer. ([Check out the list of conforming types here](https://developer.apple.com/documentation/foundation/nssecurecoding#topics)),

## What about the compiler warning?

The reason you see the warning is simple: As of iOS 13, the default value transformer used by CoreData is the NSKeyedUnarchiveFromData insecure transformer, based on NSCoding. The compiler is simply asking us to provide a secure value transformer.

The good thing is that since iOS 12, Apple provides a new secure value transformer that supports the same set of top-level classes, called NSSecureUnarchiveFromData, and we can use it directly in the DataModel.

The warning also means that in a future version of iOS, Apple will change the default ValueTransformer to be NSSecureUnarchiveFromData, and decoding using `decodeObject(for: Key)` will fail

To use the new Secure Transformer, we can set it up in our CoreData attributes panel as follows:

If you want to securely store any other class that is not part of the top-level classes list, you will have to implement a custom Value Transformer, which basically helps the unarchiver figure out which class it should check for. If you don’t provide one, you’ll get an exception, and the application will crash.

Fortunately, creating a custom ValueTransformer for this purpose is simple. You need to create a subclass of NSSecureUnarchiveDataTransofrmer, and add your class to the `allowedTopLevelClasses `array Let’s write a custom ValueTransformer for our `MyTestClass` class above.

```swift
<em>// It has to be a subclass of `NSSecureUnarchiveFromDataTransformer` and we need to expose it to ObjC.</em>

@objc(MyTestClassValueTransformer)
final class MyTestClassValueTransformer: NSSecureUnarchiveFromDataTransformer {

    <em>// The name of the transformer. This is what we will use to register the transformer `ValueTransformer.setValueTrandformer(_"forName:)`.</em>
    static let name = NSValueTransformerName(rawValue: String(describing: MyTestClassValueTransformer.self))

    <em>// Our class `Test` should in the allowed class list. (This is what the unarchiver uses to check for the right class)</em>
    override static var allowedTopLevelClasses: [AnyClass] {
        return [MyTestClass.self]
    }

    <em>/// Registers the transformer.</em>
    public static func register() {
        let transformer = MyTestClassValueTransformer()
        ValueTransformer.setValueTransformer(transformer, forName: name)
    }
}
```

Here’s what’s happening:

First, we define a name for our value transformer, and then we define a list of classes that would be allowed, which is what the unarchiver uses to validate that the class is correct, and lastly, we create a `register()` method that will allow us to register the new value transformer during CoreData initialization.

## What about top-level classes containing custom classes?

There might be cases where you need to store a top-level class, containing custom classes. An NSArray of MyCustomClass or \[MyCustomClass\] is a good example.

Since the parent class is a top-level one, you can use the `NSSecureUnarchiveFromData` transformer as long as you implement SecureCoding in your inner classes.  
  
[Here’s a quick and dirty example](https://github.com/afterxleep/CoreDataCustomClass) covering this particular case.

## Register your value transformer

Now that you have your ValueTransformer ready, it’s time to put it to work, but ValueTransformers are rarely initialized by hand. Instead, we have to explicitly register it to make it available to our CoreData model.

A good place to do that is during your CoreData stack initialization, but make sure you do it before setting up your Persistent Container.

```swift
<em>// ... Make sure to register before initializing your persistent container</em>

<em>// Register the transformer</em>
MyTestClassValueTransformer.register()

<em>// .. Continue initializing Persistent Container</em>
```

Lastly, configure your model to use your brand new ValueTransformer as follows:

![](/assets//posts/2020-10-29-coredata-transformable-and-nssecurecoding-in-ios-13//ss2.png)

## Note

When I tested this, I had a typo in the Transformer Class name on the Core Data Model. The Xcode warning disappeared, but everything seemed to work fine in the app (although the transformer was never used).

I’m not sure about the reason, but it might be falling back to NSCoding silently, which might be bad in the future, so test properly!

## Conclusion

We had a quick overview of NSSecureCoding and the NSSecureUnarchiverValueTransformer to ensure your apps and data are more secure.

When used alongside NSSecureCoding, ValueTransformers are a speedy way to store your data safely. Still, they are also a powerful way to perform custom transformations to your data before or after it is stored in your data stack. If you are interested in reading a bit more about writing your own, more advanced ValueTransformers, check out this post by [Antoine van der Lee](https://www.avanderlee.com/swift/valuetransformer-core-data/).

Ping me on [Twitter](https://twitter.com/afterxleep/) or in the form below if you have any questions or comments!

- - - - - -

Sources &amp; Further reading:

- [NSCoding](https://developer.apple.com/documentation/foundation/nscoding) &amp;[ ](https://developer.apple.com/documentation/foundation/nscoding)[NSSecureCoding ](https://developer.apple.com/documentation/foundation/nssecurecoding)&amp; [NSKeyedUnarchiver](https://developer.apple.com/documentation/foundation/nskeyedunarchiver)| Apple Docs
- [NSSecureCoding](https://nshipster.com/nssecurecoding/) &amp; [ValueTransformer](https://nshipster.com/valuetransformer/) | NSHipster
- [Value Transformer in Core Data Explained](https://www.avanderlee.com/swift/valuetransformer-core-data/) | SwiftLee
- Special thanks to Kaira Diagne for the [NSSecureCoding and transformable properties in Core Data](https://www.kairadiagne.com/2020/01/13/nssecurecoding-and-transformable-properties-in-core-data.html) post that inspired me to read more and write a little on this.