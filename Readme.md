# make web not war demo app

This is a basic application to play with WebSockets and deploy to Heroku

## running locally

Make sure you have ruby install and the gem bundler.

    $ bundle install

    $ bundle exec thin start

    -> visit http://localhost:3000/

## deploying

Set up a heroku app with the cedar stack from this app directory

    $ heroku create app_name --stack cedar

    $ git push heroku master