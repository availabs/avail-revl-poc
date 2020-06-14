# tmpDir Module

The initTmpDir module creates the temporary directory
and removes it on exit. This simplifies things
within the server code.

It should **ONLY** be imported by the server's _main_ module.

Auxilary processes, such as the replClient,
**MUST** not import the tmpDir module itself.
They would remove the server's tmpDir on exit.
