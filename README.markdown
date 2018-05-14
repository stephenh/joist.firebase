
A fun/hobby project fork of [ninjafire](https://github.com/lineupninja/ninjafire)

This currently requires a patched version of [firemock](https://forest-fire.gitbook.io/firemock) so will probably not build/pass locally.

Disclaimer, "ORM-all-the-things" can be an anti-pattern, I just happen to know ORMs well, so this is a good way for me to learn the pros/cons of what ORMs in particular, and the problem-space in general, of a Firebase/offline-first/mobile-first environment are.

Notes so far:

* The `design:type` decorator data is basically useless, can't resolve it back to the real type
* Decorator cycles are bad, e.g. if `Employee` and `Account` both have annotations that point to the other, and try to pass their `Employee`/`Account` types, one of them will get `undefined`
* Promises on each graph navigation kind of suck, no wonder people like GraphQL

I'm not sure if I'll finish this, I just come back to it now and then to keep progressing/hacking/learning.

