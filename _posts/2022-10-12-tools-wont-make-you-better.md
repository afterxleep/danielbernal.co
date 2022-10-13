---
layout: post
title: Tools won't make you better
date: 2022-10-12 9:16:00 Z
categories:
  - life
author: Daniel
---
I moved this blog out of [WordPress](https://wordpress.org/). It has too many moving parts for my needs and the amount of content I put online. 

Since I don't need fancy templates, plugins, databases, comments, stats, a store, and much less dealing with security updates, backups, and hosting providers, I wanted to try a static solution.

It made a lot of sense. I could host it on Github pages and forget about security or hosting providers, and my posts would live in beautiful, clean markdown files.

It took me a couple of hours to set up [Jekyll](https://jekyllrb.com/), import a few posts, migrate my WordPress template, and connect the domain. Pretty cheap for a super-fast, highly reliable, pure HTML blog, right?

Well, maybe, but I spent two hours trying to post the above paragraphs from an iPad last night. 

It went like this:

* Purchase and install a good text editor with Files App support ([Textastic](https://www.textasticapp.com/)).
* Purchase and install a git client with Files App support ([Working Copy](https://workingcopy.app/)).
* Create a file by hand with a particular name.
* Copy and paste some config options.
* Write the post.
* Add a picture to a folder.
* Link the image by hand using markdown.
* Create a git commit and push it to the repository.
* Notice the attached photo was broken.
* Remove the image.
* Create another commit and push it to the repo again.

Pretty rough, huh? Well, I may not be posting much from my iPad, and I just learned about [Netlify CMS](https://www.netlifycms.org/), which is Open Source, plays well with all static site flavors, and may take care of the problem.

Too good to be true? We'll see.