BIN=node_modules/.bin/
COGS=$(BIN)cogs
WATCHY=$(BIN)watchy
SERVER=node server

dev:
	$(MAKE) -j server-w cogs-w

server:
	node server

server-w:
	$(WATCHY) -w server -W 10 -- node server

cogs-app-dev:
	$(COGS)

cogs-w:
	$(COGS) -w client,css

compress:
	$(COGS) -c

.PHONY: server
