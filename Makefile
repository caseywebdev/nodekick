BIN=node_modules/.bin/
COGS=$(BIN)cogs
WATCHY=$(BIN)watchy
SERVER=node server

dev:
	$(MAKE) -j nginx server-w cogs-w redis

nginx:
	mkdir -p log &&	sudo nginx >> log/nginx.log 2>&1

redis:
	redis-server

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
