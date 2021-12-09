require 'net/https'
require 'json'

host = ARGV[2]
begin
  h = Net::HTTP.new(host, 443)
  h.use_ssl = true
  h.verify_mode = OpenSSL::SSL::VERIFY_NONE
  h.get '/'
  p JSON.generate({ passed: true, details: { tested_url: "https://#{host}:443/" }})
rescue => e
  p JSON.generate({ passed: false, details: { error: e, tested_url: "https://#{host}:443/" }})
end
