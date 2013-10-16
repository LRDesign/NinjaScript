## NinjaScript
NinjaScript is a jQuery library designed to allow unobstrusive scripting simply
and easily.  Essentially, we use jQuery selectors to apply behavior the same
way we use CSS stylesheets to apply stylings.  Additionally, NinjaScript makes
it easy to package up useful behaviors and apply them quickly to disparate
elements, or in different projects.

For more information, see https://github.com/LRDesign/NinjaScript/wiki

Or jump right in: download it at: https://github.com/downloads/LRDesign/NinjaScript/ninjascript.zip

## Contributing

To contribute to NinjaScript, fork it on GitHub and issue pull requests.   Make
sure you run the tests; this can be accomplished just by loading the file
"SpecRunner.html" in a browser, locally.  All the test libraries necessary are
hosted on http://js-testing.lrdesign.com, so it should just work.

## Development

To set up a development environment you will need:

* Ruby + Rake installed
* Node.js + NPM
* A JVM (for the Closure Compiler)

Once you've cloned the project, run

    bundle
    npm install

And you should get all the developement dependencies.

We're using Karma for testing - there's a karma.conf.js already set up -
hopefully it's assumptions will work for your environment.

My system has Python 3 as it's default: node-gyp needs a Python 2 interpreter
If you get a horrible error about ENOENT, try

    npm --python=python2 install

... you will of course need "python2" installed
