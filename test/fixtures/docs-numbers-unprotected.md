# Fixture: a publication document with one number nothing printed

The sweep read 987654321 rows in one pass. No verdict file and no line of NUMBERS.md carries that
value, so tools/docs-numbers.mjs must report this file and exit 1. Used by test/docs-history.test.mjs.
