set :server, :thin

connections = []

get "/" do
  redirect "/index.html"
end

get "/sse_endpoint" do
  content_type 'text/event-stream'
  stream(:keep_open) { |out|
    connections << out
  }
end

post '/drawlines' do
  # write to all open streams
  connections.each {|out|
    out << "event:drawlines\ndata:#{params[:lines]}\n\n"
  }
  "message sent"
end