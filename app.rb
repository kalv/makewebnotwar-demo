
set :server, :thin

connections = []

get "/" do
  redirect "/index.html"
end

get "/sse_endpoint" do
  content_type 'text/event-stream'
  stream(:keep_open) { |out|
    connections << out
    #out.callback { connections.delete(out) }
  }
end

get '/send_to_sse' do
  # write to all open streams
  connections.each {|out|
    out << ["event:answer", "data:#{params[:message]}\n\n"].join("\n")
  }
  "message sent"
end