# Installation

```bash
npm install -g find-dead-modules
```

# Usage
Navigate to a javascript project of some sort and run `find-dead-modules`. E.g.

```bash
⨠ cd ~/my-awesome-project
⨠ find-dead-modules
```

## Interpreting results

When no unused/dead modules are found, the script prints nothing and has an
exit code of zero.

Any unused/dead modules that are found are loggged to stdout, one file path per
line. An exit code of 1 will signal that one or more of these were found.

# Configuration

The script reads your `.gitignore` file to figure out what can be safely
ignored. Apart from that, you can't configure anything right now. This is
likely to change when the script has proven to be useful.
