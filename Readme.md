# make web not war demo app

This is a basic application to play with WebSockets and deploy to Heroku

## running locally

Make sure you have ruby install and the gem bundler.

    $ bundle install

    $ bundle exec rackup

    -> visit http://localhost:9292/

## deploying

Set up a heroku app with the cedar stack

    heroku create app_name --stack cedar