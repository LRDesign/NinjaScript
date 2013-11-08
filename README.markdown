## NinjaScript
NinjaScript is a jQuery library designed to allow unobstrusive scripting simply
and easily.  Essentially, we use jQuery selectors to apply behavior the same
way we use CSS stylesheets to apply stylings.  Additionally, NinjaScript makes
it easy to package up useful behaviors and apply them quickly to disparate
elements, or in different projects.

For more information, see https://github.com/LRDesign/NinjaScript/wiki

Or jump right in: download it at: [Downloads for Ninjascript](https://googledrive.com/host/0B3Pcyyb1e1BPT2pRX1ZIREdhSjQ/)


## Contributing

To contribute to NinjaScript, fork it on GitHub and issue pull requests.   Make
sure you run the tests; `rake test:start` should get you going.

## Development

To set up a development environment you will need:

* Ruby + Bundler installed
* Node.js
* A JVM (for the Closure Compiler)

Once you've cloned the project, run

    bundle
    rake buildtools

And you should get all the development dependencies.

From there try:

    rake

which should start up the test system. All tests should pass.

Finally, once you get things going and are ready to use Ninjascript somewhere:

    rake build

And look in pkg/

## Environment troubleshooting

You'll need a working Node.js installation. On Mac OS this seems to require recent working XCode.
(Welcomed: a PR explaining details of this.)

We're using Karma for testing - there's a karma.conf.js already set up -
hopefully it's assumptions will work for your environment.

My system has Python 3 as it's default: node-gyp needs a Python 2 interpreter
If you get a horrible error about ENOENT, try

    npm --python=python2 install

... you will of course need "python2" installed
