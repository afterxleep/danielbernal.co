---
title: A/B testing your app icon
date: 2022-09-24 22:16:00 Z
permalink: "/2022-09-25-ab-testing-your-app-icon/"
categories:
- product
author: Daniel
layout: post
image: "/assets/icons.jpg"
---

Speaking of [A/B tests](/a-b-test-your-design-not-your-product/), Apple has a pretty good set of tools to test (and optimize) your app’s App Store page. They call them «_test treatments_», and you can use them to test different versions of your App’s screenshots to see what drives more downloads.
<!--more-->
Most people don’t know that test treatments support **A/B testing your app icon,** **too**, as long as you include different variations via an asset catalog. Let’s see how.

We’ll be running a little experiment with slight variations of the app icon as follows:

![](/assets/screen1.png)

### Adding multiple icons to your app

Start by creating a new Asset Catalog _(File > New > Asset Catalog)_ and adding all icons. You can test up to three different versions at a time.

> Pro tip: There are several tools to quickly generate all required icon sizes from the original image. I personally use [Applanding](https://applanding.page/ios-app-icon-generator).

Now let’s configure the build system to support alternative icons. In your app’s target build settings, set the» **Include All App Icon Assets**» option to Yes, and pick the icon you want to use as primary. In my case, I’m using the «**Light**» version.

![](/assets/screen2.png)  

The remainder of the changes are performed via App Store Connect after publishing your app to the store, so go ahead, create an archive, submit and come back when it’s approved and available to users.

### Creating an A/B test

Once your app is approved and released, go to the «Product Page Optimization» page in App Store Connect, and once you’re there, hit the **«+»** button to create a new product page test.

![](/assets/screen3.png)

You’ll need to pick a name for the experiment and define the number of treatments you want. I’ll pick two in this case as I have the original icon and two options.

![](/assets/screen4.png)

### Creating a treatment

The traffic proportion is the percentage of users that will be presented with an option from the test. Picking 66% here means that percentage of visitors will be presented with one of your test treatments (33% each in our case), and your original version (control) will get the remaining traffic. When ready, hit «**Create.**«

> Tip: Apple also provides an optional estimation tool below, to help you understand how long it will take to reach your conversion rate given you app statistics. Since tests run for a maximum of 90 days, you can use this tool to figure out how long will you need to get results of the experiment.

After you create the test, select the «App Icon» section at the top, and then pick a different icon from your Asset catalog for each treatment. When you’re ready, Hit «Start Test»

![](/assets/screen5.png)

> Tip: If you don’t see the «App Icon» section at the top, it means you have not added your app icons correctly, so time to go back to the beginning.

### Monitoring Results

Your test will start to run immediately, but it may take a while to see results. You can go back to the Product Page Optimization page to see them.

Remember, tests will run for up to 90 days unless you stop them.

### Conclusion

Unfortunately, A/B testing is limited to the App Store page, which means your users will always see the primary icon after installing the app. But heh… Maybe that’s something Apple will change in the future.

I hope you’ve found this helpful. If you have any questions or comments, feel free to ping me on [Twitter](https://twitter.com/afterxleep).

***

Sources & Refs:

*   [Product Page Optimization (Apple)](https://help.apple.com/app-store-connect/#/dev6aa9d8d7b)
*   [Configuring App to use Alternate Icons (Apple)](https://developer.apple.com/documentation/xcode/asset_management/configuring_your_app_to_use_alternate_app_icons)
*   [Product Page Optimization Tutorial (Apple)](https://developer.apple.com/app-store/product-page-optimization/)

<sup>Photo by [Harpal Singh](https://unsplash.com/@aquatium?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)</sup>
  