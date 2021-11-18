require 'net/https'
require 'json'

host = ARGV[2]
begin
  h = Net::HTTP.new(host, 443)
  h.use_ssl = true
  h.verify_mode = OpenSSL::SSL::VERIFY_NONE
  h.get '/'
  p JSON.generate({result: 'OK', testedUrl: "https://#{host}:443/"})
rescue => e
  p JSON.generate({result: 'ERROR', error: e, testedUrl: "https://#{host}:443/"})
end
