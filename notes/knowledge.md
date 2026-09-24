# knowledge (Board 9, his P10)

`node tools/ingest-wiki.mjs` streams Simple English Wikipedia through its own bz2 reader (4 workers, CRC checked, byte-identical to native bzip2), strips wikitext, and writes each article into memory/knowledge.mjs as a title, lead and section sentences, and a categories fact.

**Tier.** Text lives on disk (records.bin, append-only); the index keeps 256 sign bits per key from the 8192-lane word bundle act/prompt.mjs encodes prompts with; the head is rescored at 8192 lanes. recall() ranks by hypervector similarity (title buckets, then facts) and a text index (postings on disk) second, provenance "memory". Measured by the tier probe: semantic and assoc stop at 4096 keys, episodic at 65536; only the knowledge tier holds 284749 (10.18 ms per query, 8.7 MB of keys).

**Held-out rule.** hash32(seed, title) % every == 0 marks a title; its first sentence is hidden when its subject holds a title word (or a pronoun) and it has a key noun phrase: the words after the first is/was/are/were, past determiners, through "one of" and "a type of", up to a preposition, conjunction, relative word or participle, six words at most. Graded on the head noun, plural folded. The null arm answers with the title's own words.

**Answer.** Recalled facts about X offer key noun phrases; score = facts offering it + summed similarity of facts holding its head + 8 x its share in the CATEGORY PRIOR (what members of X's categories are, from their visible first sentences only). Weights chosen on the 428 held-out records outside the bar draw.

**Printed (node bench/knowledge.mjs, whole dump):** 284749 articles in 1.26 min, 3772.7 articles/s; breadth 0.9990; 1365 disk and 407 memory bytes/article; recall@1 62.5% vs null 9.0%, recall@5 78.5% vs null 13.0%; mean 9.10 ms per query; 0 hidden sentences found in memory.
