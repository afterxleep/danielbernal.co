---
title: Writing a Networking Library with Combine, Codable and Swift 5
date: 2021-01-11 00:00:00 Z
permalink: "/writing-a-networking-library-with-combine-codable-and-swift-5/"
categories:
- code
- learn
id: 464
author: Daniel
layout: post
guid: https://danielbernal.co/?p=464
image: "/posts/2021-01-11-writing-a-networking-library-with-combine-codable-and-swift-5/header.jpg"
---

Most of our apps rely on network calls to work, and thanks to [URLSession](https://developer.apple.com/documentation/foundation/urlsession) and [Codable](https://developer.apple.com/documentation/swift/codable), consuming REST APIs has become a lot easier these days. That said, we are still writing quite a bit of code to deal with async calls, JSON encoding and decoding, HTTP error handling, and more.<!--more-->

With that in mind, let’s write our own simple networking library, specifically designed to consume REST APIs without effort, using a ‘convention over configuration’ approach, alongside Combine, URLSession, and the Codable protocol.

Most of our apps rely on network calls to work, and thanks to [URLSession](https://developer.apple.com/documentation/foundation/urlsession) and [Codable](https://developer.apple.com/documentation/swift/codable), consuming REST APIs has become a lot easier these days. That said, we are still writing quite a bit of code to deal with async calls, JSON encoding and decoding, HTTP error handling, and more.

On the other hand, ready-to-use libs such as [Alamofire](https://github.com/Alamofire/Alamofire) are great, especially because you can start using them right away, but they also have to be multi-purpose and as generic as possible to be useful to the majority of people and include features that you’ll never use.

With that in mind, let’s write our own simple networking library, specifically designed to consume REST APIs without effort, using a ‘convention over configuration’ approach, alongside Combine, URLSession, and the Codable protocol.

## The Request

We will start with a protocol to outline what a network request looks like, and include some of the most common properties we’ll need.

- A Path or URL to call
- The HTTP Method (GET, POST, PUT, DELETE)
- The request Body
- And optionally, some headers

```swift
import Foundation
import Combine
public enum HTTPMethod: String {
    case get     = "GET"
    case post    = "POST"
    case put     = "PUT"
    case delete  = "DELETE"
}
public protocol Request {
    var path: String { get }
    var method: HTTPMethod { get }
    var contentType: String { get }
    var body: [String: Any]? { get }
    var headers: [String: String]? { get }
    associatedtype ReturnType: Codable
}
```

Besides defining the properties, we are also adding an `associatedType`. [Associated Types ](https://www.hackingwithswift.com/example-code/language/what-is-a-protocol-associated-type)are a placeholder for a type we will define when the protocol is adopted.

With the protocol defined, let’s set some default values, via an extension. By default, a request will use the `GET` method, have `application/json` content-type, and it’s body, headers and Query Parameters will be empty.

```swift
extension Request {
    // Defaults
    var method: HTTPMethod { return .get }
    var contentType: String { return “application/json” }
    var queryParams: [String: String]? { return nil }
    var body: [String: Any]? { return nil }
    var headers: [String: String]? { return nil }
}
```

Since we will be using URLSession to perform all the networking calls, let’s write a couple of utility methods to transform our custom Request Type into a plain URLRequest Object.

The first of two methods, `requestBodyFrom`, serializes a dictionary and the second, asURLRequest is used to generate a plain `URLRequest` object.

```swift
extension Request {
    /// Serializes an HTTP dictionary to a JSON Data Object
    /// - Parameter params: HTTP Parameters dictionary
    /// - Returns: Encoded JSON
    private func requestBodyFrom(params: [String: Any]?) -> Data? {
        guard let params = params else { return nil }
        guard let httpBody = try? JSONSerialization.data(withJSONObject: params, options: []) else {
            return nil
        }
        return httpBody
    }
    /// Transforms a Request into a standard URL request
    /// - Parameter baseURL: API Base URL to be used
    /// - Returns: A ready to use URLRequest
    func asURLRequest(baseURL: String) -> URLRequest? {
        guard var urlComponents = URLComponents(string: baseURL) else { return nil }
        urlComponents.path = "\(urlComponents.path)\(path)"
        guard let finalURL = urlComponents.url else { return nil }
        var request = URLRequest(url: finalURL)
        request.httpMethod = method.rawValue
        request.httpBody = requestBodyFrom(params: body)
        request.allHTTPHeaderFields = headers
        return request
    }
}
```

With this new protocol, defining a network request is as simple as doing:

```swift
// Model
struct Todo: Codable {
   var title: String
   var completed: Bool
}
// Request
struct FindTodos: Request {
     typealias ReturnType = [Todo]
     var path: String = "/todos"
}
```

This will translate into a GET request to the `/todo` endpoint, that returns a list of ToDo items.

Note As the ReturnType, we can use any Type that conforms to Codable, depending on the information we are fetching.

## The Dispatcher

Now that we have our request ready, we need a way to dispatch it over the network, fetch the data, and decode it. For that, we will be using Combine and Codable.

The first step is to define an enum to hold the error codes.

```swift
enum NetworkRequestError: LocalizedError, Equatable {
    case invalidRequest
    case badRequest
    case unauthorized
    case forbidden
    case notFound
    case error4xx(_ code: Int)
    case serverError
    case error5xx(_ code: Int)
    case decodingError
    case urlSessionFailed(_ error: URLError)
    case unknownError
}
```

Now let’s write our dispatch function. By using generics, we can define the ReturnType, and return a Publisher that will pass the requested output to its subscribers.

Our NetworkDispatcher will receive a URLRequest, send it over the network and decode the JSON response for us.

```swift
struct NetworkDispatcher {
    let urlSession: URLSession!
    public init(urlSession: URLSession = .shared) {
        self.urlSession = urlSession
    }
    /// Dispatches an URLRequest and returns a publisher
    /// - Parameter request: URLRequest
    /// - Returns: A publisher with the provided decoded data or an error
    func dispatch<ReturnType: Codable>(request: URLRequest) -> AnyPublisher<ReturnType, NetworkRequestError> {
        return urlSession
            .dataTaskPublisher(for: request)
            // Map on Request response
            .tryMap({ data, response in
                // If the response is invalid, throw an error
                if let response = response as? HTTPURLResponse,
                   !(200...299).contains(response.statusCode) {
                    throw httpError(response.statusCode)
                }
                // Return Response data
                return data
            })
            // Decode data using our ReturnType
            .decode(type: ReturnType.self, decoder: JSONDecoder())
            // Handle any decoding errors
            .mapError { error in
                handleError(error)
            }
            // And finally, expose our publisher
            .eraseToAnyPublisher()
    }
}
```

We are using URLSession’s dataTaskPublisher to perform the request and then mapping on the response, to properly handle errors. If the request completes successfully, we move along and try to decode the received JSON data.

In order to make this testable, we are injecting the URLSession, and defaulting it to `URLSession.shared` for convenience.

Now let’s define some helper methods to handle errors. The first, httpError, to deal with HTTP errors, and the second handleError, to help with JSON Decoding and general errors.

```swift
extension NetworkDispatcher {
/// Parses a HTTP StatusCode and returns a proper error
    /// - Parameter statusCode: HTTP status code
    /// - Returns: Mapped Error
    private func httpError(_ statusCode: Int) -> NetworkRequestError {
        switch statusCode {
        case 400: return .badRequest
        case 401: return .unauthorized
        case 403: return .forbidden
        case 404: return .notFound
        case 402, 405...499: return .error4xx(statusCode)
        case 500: return .serverError
        case 501...599: return .error5xx(statusCode)
        default: return .unknownError
        }
    }
    /// Parses URLSession Publisher errors and return proper ones
    /// - Parameter error: URLSession publisher error
    /// - Returns: Readable NetworkRequestError
    private func handleError(_ error: Error) -> NetworkRequestError {
        switch error {
        case is Swift.DecodingError:
            return .decodingError
        case let urlError as URLError:
            return .urlSessionFailed(urlError)
        case let error as NetworkRequestError:
            return error
        default:
            return .unknownError
        }
    }
}
```

## The APIClient

Now that we have both our Request and Dispatcher, let’s create a type to wrap our API Calls.

Our APIClient will receive a NetworkDispatcher and a BaseUrl and will provide a centralized Dispatch method. That method will receive a Request, convert it to a URLRequest and pass it along to the provided network dispatcher.


```swift
struct APIClient {
    var baseURL: String!
    var networkDispatcher: NetworkDispatcher!
    init(baseURL: String,
                networkDispatcher: NetworkDispatcher = NetworkDispatcher()) {
        self.baseURL = baseURL
        self.networkDispatcher = networkDispatcher
    }
    /// Dispatches a Request and returns a publisher
    /// - Parameter request: Request to Dispatch
    /// - Returns: A publisher containing decoded data or an error
    func dispatch<R: Request>(_ request: R) -> AnyPublisher<R.ReturnType, NetworkRequestError> {
        guard let urlRequest = request.asURLRequest(baseURL: baseURL) else {
            return Fail(outputType: R.ReturnType.self, failure: NetworkRequestError.badRequest).eraseToAnyPublisher()
        }
        typealias RequestPublisher = AnyPublisher<R.ReturnType, NetworkRequestError>
        let requestPublisher: RequestPublisher = networkDispatcher.dispatch(request: urlRequest)
        return requestPublisher.eraseToAnyPublisher()
    }
}
```

We are returning a Publisher with either the response or a NetworkRequest error, and since you can inject your own NetworkDispatcher, testing is super-easy.

## Performing a request

That’s it!. Now if we want to perform a network request, we can do as follows:

```swift
private var cancellables = [AnyCancellable]()
let dispatcher = NetworkDispatcher()
let apiClient = APIClient(baseURL: "https://jsonplaceholder.typicode.com")
apiClient.dispatch(FindTodos())
    .sink(receiveCompletion: { _ in },
          receiveValue: { value in
            print(value)
        })
    .store(in: &cancellables)
```

Cool huh?. In this case we are performing a simple GET request, but you can add additional parameters and configure your Request as needed:

For example, if we wanted to Add a Todo we could do something like this:


```swift
// Our Add Request
struct AddTodo: Request {
     typealias ReturnType = [Todo]
     var path: String = "/todos"
     var method: HTTPMethod = .post
    var body: [String: Any]
    init(body: [String: Any]) {
        self.body = body
    }
}
let todo: [String: Any] = ["title": "Test Todo", "completed": true]
apiClient.dispatch(AddTodo(body: todo))
    .sink(receiveCompletion: { result in
        // Do something after adding...
        },
        receiveValue: { _ in })
    .store(in: &cancellables)
```

In this case we are constructing the body from a simple dictionary, but to make things easier, let’s extend Encodable, and add a method to convert a Encodable Type to a Dictionary.

```swift
extension Encodable {
    var asDictionary: [String: Any] {
        guard let data = try? JSONEncoder().encode(self) else { return [:] }
        guard let dictionary = try? JSONSerialization.jsonObject(with: data, options: .allowFragments) as? [String: Any] else {
            return [:]
        }
        return dictionary
    }
}
```


With this, you can write the request as follows:

```swift
let otherTodo: Todo = Todo(title: "Test", completed: true)
apiClient.dispatch(AddTodo(body: otherTodo.asDictionary))
    .sink(receiveCompletion: { result in
        // Do something after adding...
        },
        receiveValue: { _ in })
    .store(in: &cancellables)
```

## Conclusion

Thanks to Combine and Codable, we were able to write a very simple Networking client. The Request Type is extensible and easy to maintain, and both our Network Dispatcher and API clients are easy to test and extremely simple to use.

Some of the next steps could include adding authentication, caching, and more detailed logging to facilitate debugging, but that’s something we can do down the road.

## Get the Code

- [This Playground](https://gist.github.com/afterxleep/29c9af650deadf779e15bb00a8643ee6) includes all the code in this tutorial on a single file.
- [Wirekit](https://github.com/afterxleep/WireKit), based on this approach is an open-source networking library designed to simplify using REST APIs in your app.

As always, feel free to ping me on [Twitter](https://twitter.com/afterxleep) or in the comments below if you have questions or feedback!.

—

<sub>Photo By: [JJ Yink](https://unsplash.com/photos/8bghKxNU1j0)</sub>