require 'uri'
require 'net/http'
require 'json'

begin
  input = ARGV[0]
  uri = URI.parse(input)
  uri.scheme = 'https'

  Net::HTTP.get(uri)
  p JSON.generate({result: 'OK'})
rescue => e
  p JSON.generate({result: 'ERROR', error: e})

end