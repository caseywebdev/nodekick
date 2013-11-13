BIN=node_modules/.bin/
COGS=$(BIN)cogs
WATCHY=$(BIN)watchy
BOWER=$(BIN)bower
SERVER=node server

dev:
	$(MAKE) -j nginx redis server-w cogs-w

nginx:
	mkdir -p log &&	sudo nginx >> log/nginx.log 2>&1

redis:
	mkdir -p log &&	redis-server /usr/local/etc/redis.conf >> log/redis.log 2>&1

server:
	node server

server-w:
	$(WATCHY) -w models,server -- node server

cogs-w:
	$(COGS) -w client,models

compress:
	$(BOWER) install
	$(COGS) -c

deploy:
	git push heroku redux:master
	heroku run make compress

audio:
	scripts/audio-to-mp3.sh

.PHONY: audio server
