# Public-repository safety and limitations

The supplied source workspace contains development and infrastructure files. This export uses a **strict allowlist**: only the generated JSON research records, a favicon, and new static reader files. No .grok, .env, credentials, database connection code, attachment archives, or server/auth code is included.

A regex-based credential scan and basic JSON integrity check are run during preparation, but cannot guarantee absence of sensitive strings embedded in research text. Public distribution of the source research JSON should be approved by the owner.

**Publication approval**: owner approved Surahs 1–12; unresolved questions stay OPEN/REVERIFY. Existing original record metadata are preserved without edits.

**Audit limit**: copied source JSON is byte-identical to the workspace; a record-by-record check against Master Block 001, CP010, CP011 and Build4 remains outstanding. The full 16-component research platform is not yet presented.
