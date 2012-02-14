SPECS = specs/*.spec.js
REPORTER = spec
JSLINT   := /usr/local/bin/gjslint
FIX_STYLE := /usr/local/bin/fixjsstyle
JSLINT_PARAMS := --custom_jsdoc_tags public,static --recurse lib/

test:
	@NODE_ENV=$(NODE_ENV) ./node_modules/mocha/bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--ui bdd \
		--timeout 30000 \
		$(SPECS)

install:
	npm install

jslint:
	$(JSLINT) $(JSLINT_PARAMS)

fixstyle:
	$(FIX_STYLE) $(JSLINT_PARAMS)

.PHONY: test jslint fixstyle install
