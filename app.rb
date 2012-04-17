set :server, :thin

connections = []

get "/" do
  redirect "/index.html"
end

# Set up a Server-Sent Event connection
get "/sse_endpoint" do
  content_type 'text/event-stream'
  stream(:keep_open) { |out|
    connections << out
  }
end

# Drawer has created some lines send
# to connected clients
post '/drawlines' do
  # write to all open streams
  connections.each {|out|
    out << "event:drawlines\ndata:#{params[:lines]}\n\n"
  }
  "message sent"
end

# Guesser has created an answer send to
# connected clients
post '/answers' do
  connections.each {|out|
    out << "event:answer\ndata:#{params[:answer]}\n\n"
  }
  "message sent"
end
# this could've been improved by storing different
# connections for drawers / guessers