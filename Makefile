BIN=node_modules/.bin/
COGS=$(BIN)cogs
WATCHY=$(BIN)watchy
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
	$(WATCHY) -w server -W 0.25 -- node server

cogs-app-dev:
	$(COGS)

cogs-w:
	$(COGS) -w client,css

compress:
	$(COGS) -c

.PHONY: server
