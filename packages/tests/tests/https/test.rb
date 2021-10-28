require 'net/https'
require 'json'

begin
  h = Net::HTTP.new(ARGV[0], 443)
  h.use_ssl = true
  h.verify_mode = OpenSSL::SSL::VERIFY_NONE
  h.get '/'
  p JSON.generate({result: 'OK'})
rescue => e
  p JSON.generate({result: 'ERROR', error: e})
end