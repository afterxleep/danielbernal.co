---
title: 'Styling  Gist embeds with CSS'
author: Daniel
layout: post
permalink: /styling-gist-embeds-with-css/
categories:
    - code
    - learn
---

[Gists](https://gist.github.com/discover) are short bits of code you can share and reuse. They act as lightweight repos, feature version control, and can include anything from a string to multiple files. You can also embed them on any website, which is excellent to share examples, but unfortunately, there’s no way to change the default syntax highlighting. Let’s fix that.<!--more-->

I recently moved all the code examples from my posts from inline &lt;code&gt; to[ Gists](https://gist.github.com/discover) as it’s a lot easier to maintain them, reuse them, and keep them up to date. The default syntax highlighting style for Swift looks like this:

![Gist Sample](/assets/posts/2020-10-24-styling-gist-embeds-with-css/gist.png)

After a little bit of digging online, I found about [Github Dark,](https://github.com/StylishThemes/GitHub-Dark#available-syntax-highlighting-themes-demo) by [Stylish themes](https://github.com/StylishThemes), which allows you, as you would imagine, to override github.com’s CSS with your own to produce a fancy ‘dark’ mode, including the code views for which they have some [syntax highlighting themes](https://stylishthemes.github.io/GitHub-Dark/).

I was delighted to find a version of the [Atom One Dark](https://github.com/atom/one-dark-syntax) theme, which is what I use every day. Quickly grabbed a [copy of the CSS,](https://github.com/StylishThemes/GitHub-Dark/blob/master/src/themes/github/one-dark.css) wrapped it around a couple of namespace classes, and threw it inside my custom WordPress theme, spending about an hour (ok, maybe two) tweaking things until I got close to what I wanted.

<script src="https://gist.github.com/afterxleep/231feb0254ae0f32c8cbdc14a7b5ee66.js?file=AnimalService.swift"></script>After a little more digging, I’ve found that [@lonekorean](https://twitter.com/lonekorean) had already done all the heavy-lifting and wrote custom (more simple) CSS versions of the common themes, sharing them in [his repo](https://github.com/lonekorean/gist-syntax-themes), from which you can grab the one you want and just drop it into your site with a couple of clicks.

I used @lonekorean’s One Dark version, with a couple of minor tweaks to the background color and gutter.

Go ahead and [check the theme demos here](https://lonekorean.github.io/gist-syntax-themes/); they’re fantastic!