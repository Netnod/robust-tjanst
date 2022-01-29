FROM debian:buster

RUN apt-get update && apt-get install -y locales build-essential libfile-slurp-perl libjson-pp-perl liblist-moreutils-perl libio-socket-inet6-perl libmodule-find-perl libmoose-perl libfile-sharedir-perl libhash-merge-perl libreadonly-perl libmail-rfc822-address-perl libintl-xs-perl libssl-dev libdevel-checklib-perl libtest-fatal-perl libtie-simple-perl libio-capture-perl libgeography-countries-perl libidn11-dev gettext libmoosex-getopt-perl libtext-reflow-perl libmodule-install-perl libnet-interface-perl libclass-accessor-class-perl libemail-valid-perl libmoosex-singleton-perl libnet-ip-perl libtest-pod-coverage-perl libtest-differences-perl libtest-exception-perl libtest-nowarnings-perl libtest-pod-perl libtext-csv-perl dnsutils libmodule-install-xsutil-perl libb-hooks-op-annotation-perl libextutils-depends-perl libextutils-makemaker-cpanfile-perl libtest-number-delta-perl libreadonly-xs-perl file

RUN sed -i '/sv_SE.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG sv_SE.UTF-8
ENV LANGUAGE sv:en

RUN cpan -i CPAN
RUN cpan -i IP::Authority
RUN cpan -i Net::IP::XS
RUN cpan -i Zonemaster::CLI
COPY doit.sh profile.json /
ENTRYPOINT ["sh","/doit.sh"]
