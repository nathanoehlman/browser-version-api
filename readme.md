# Browser Version Api

A simple service that exposes browser versions discovered by [BrowserSleuth](https://github.com/nathanoehlman/browser-sleuth) in a standardised way.

### Usage

`/:platform/:browser/:releasechannel/?:language`

Returns the information and download information for the browser specified by the above options.

#### Options

- platforms `['osx', 'linux']`

- browsers `['chrome', 'firefox']`

- channels `['stable', 'beta', 'dev', 'unstable', 'experimental', 'esr']`

- language `['en-US']`

### Deploying

If you want to deploy your own version of this service, I'd recommend using Heroku. Simply install the [CLI](https://devcenter.heroku.com/articles/heroku-cli) and push.

#### Public service

You can access a public version of this service at https://browser-version-api.herokuapp.com/. Availability may vary.

### License

MIT