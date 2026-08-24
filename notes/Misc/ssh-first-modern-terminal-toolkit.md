---
title: "SSH First: A Modern Terminal Toolkit for AI Work"
description: "A small, security-conscious terminal toolkit for AI work, from SSH trust and remote persistence to reproducible search, logs, transfers, and model downloads."
kind: "guide"
section: "Misc"
status: "Reviewed"
published: "2026-08-24"
updated: "2026-08-24"
checked: "2026-08-24"
version: "1.0"
topics:
  - AI adoption
  - AI agents
  - agent harnesses
  - tool use
  - workflow design
order: 4
---

# SSH First: A Modern Terminal Toolkit for AI Work

## Start with trust

For AI work across laptops, workstations, and compute hosts, SSH is trust and connectivity infrastructure. A terminal toolkit sits on top of that trust relationship. Make the host identity, account, key, and route explicit before adding convenience.

A small non-secret `~/.ssh/config` entry is often enough:

```sshconfig
Host gpu-lab
  HostName gpu.example.edu
  User les
  IdentityFile ~/.ssh/id_ed25519_lab
  IdentitiesOnly yes
```

Verify a new host key through an independent channel before accepting it. `StrictHostKeyChecking` controls what the client does with unknown or changed keys. Do not disable host checking to make a warning disappear. `ssh-keyscan` discovers public host keys, but does not authenticate them. Compare a fingerprint supplied through a trusted, independent path, for example with `ssh-keygen -l -f`. [ssh_config](https://man.openbsd.org/ssh_config), [ssh-keyscan](https://man.openbsd.org/ssh-keyscan), and [ssh-keygen](https://man.openbsd.org/ssh-keygen).

Use `ProxyJump` when a bastion is the intended network path. Leave agent forwarding off unless a specific remote workflow requires it and its consequences are understood. Forwarded credentials enlarge the trust boundary.

## Explicit forwarding

A forward is a host and port mapping, not magic. Bind local research dashboards to loopback and fail early if the mapping cannot be established:

```sh
ssh -N \
  -L 127.0.0.1:8888:127.0.0.1:8888 \
  -L 127.0.0.1:6006:127.0.0.1:6006 \
  -o ExitOnForwardFailure=yes \
  gpu-lab
```

This exposes a remote Jupyter service on local `127.0.0.1:8888` and TensorBoard on local `127.0.0.1:6006`, if those services are listening on the remote loopback addresses. It does not publish them to the network, start them, authenticate them, or prove that they are safe.

Connection liveness is not process persistence. A working SSH connection says nothing about whether a remote experiment will survive a disconnect, crash, or reboot. Use tmux for generic remote terminal persistence, or an appropriate scheduler or supervisor for managed compute. Refer to Herdr only when agent-aware lifecycle visibility is the actual need. tmux can survive client detachment. It does not survive a host reboot. [tmux](https://github.com/tmux/tmux/wiki/Getting-Started)

## Durable command core

Use a small set of tools with distinct jobs:

```sh
rg -n "OOM|Traceback|val_loss" logs/
fd -t f -e py -e yaml .
fzf
jq -r 'select(.status == "failed") | [.run_id, .error] | @tsv' runs.jsonl
```

- `rg` searches source, configuration, and logs. Its default exclusions matter when an ignored artifact is relevant.
- `fd` makes project file lists readable.
- `fzf` provides interactive selection. Keep previews local to the workflow that needs them.
- `jq` makes JSON and JSONL triage explicit and reproducible.

Use `bat` as an interactive viewer or an explicit `fzf` preview. Do not make it an implicit `cat` replacement in scripts, pipes, or automated output. [ripgrep](https://github.com/BurntSushi/ripgrep/blob/master/README.md), [fd](https://github.com/sharkdp/fd/blob/master/README.md), [fzf](https://github.com/junegunn/fzf/blob/master/README.md), [jq](https://jqlang.org/manual/), and [bat](https://github.com/sharkdp/bat/blob/master/README.md).

`zoxide` is an optional local navigation aid. It learns machine-specific history, so do not use it in scripts or assume its database travels with a repository. Avoid maintaining several historical `z` tools at once. [zoxide](https://github.com/ajeetdsouza/zoxide/blob/main/README.md)

Starship is optional. Keep it minimal. Avoid prompt commands and broad filesystem scans that make an interactive prompt slow or surprising. [Starship configuration](https://starship.rs/config/)

## Transfers and reproducibility

Before a meaningful transfer, dry run it:

```sh
rsync -avhn --progress results/ gpu-lab:~/runs/results/
```

Review source, destination, and trailing slashes. Add destructive flags such as `--delete` only after a dry run and an explicit ownership decision. `rsync` can use SSH as its remote-shell transport, but it does not make data provenance or deletion safe by itself. [rsync](https://download.samba.org/pub/rsync/rsync.1)

For Python projects, run against the project lock state when one exists:

```sh
uv run --locked python -m pytest
```

A Python lockfile does not pin CUDA, drivers, GPU architecture, system libraries, model weights, data, or hardware behavior. Record those separately for experiments that must be reproduced. [uv project sync](https://docs.astral.sh/uv/concepts/projects/sync/)

For model downloads, pin a full Hub commit and inspect before fetching:

```sh
hf download org/model --revision FULL_COMMIT_HASH --dry-run
```

Then record the resolved revision, file set, and destination. A named branch or tag can move. [Hugging Face downloads](https://huggingface.co/docs/huggingface_hub/guides/download)

Use direnv only for reviewed, executable environment code. It is not a secret manager. Do not approve an unfamiliar `.envrc` without reading it, and do not put long-lived credentials in repository environment files. [direnv](https://direnv.net/)

## Cursor is adjacent, not foundational

Cursor is an optional vendor-coupled editor and agent that can edit files and run terminal commands. It is not a terminal primitive, SSH replacement, or reproducibility system. Its approval prompts are not a security boundary. Privacy Mode is not the same claim as local-only execution. Read the product and security documentation before applying it to proprietary code, credentials, remote hosts, or regulated data. [Cursor Agent](https://cursor.com/docs/agent/overview), [agent security](https://cursor.com/docs/agent/security), and [privacy](https://cursor.com/help/security-and-privacy/privacy).

## Small-environment checklist

Before relying on a new local or remote environment, record:

1. Hostname, operating system, SSH host identity, and repository commit.
2. Python version, lockfile state, relevant CUDA or driver information, and hardware.
3. Model revision, data version or checksum, command line, and output location.
4. Whether work runs in tmux, a scheduler, a supervisor, or an interactive shell.
5. Port forwards, exposed listeners, credentials in use, and their owner.
6. The human approval boundary for agent edits, transfers, destructive commands, and external actions.

This is enough to make the next decision inspectable without pretending that every environment is identical.

## Sources

- [OpenSSH client configuration](https://man.openbsd.org/ssh_config): trust, identities, forwarding, and ProxyJump.
- [ssh-keyscan](https://man.openbsd.org/ssh-keyscan): discovery only, not host-key authentication.
- [tmux getting started](https://github.com/tmux/tmux/wiki/Getting-Started): detached terminal persistence.
- [rsync manual](https://download.samba.org/pub/rsync/rsync.1): transfer syntax and deletion caveats.
- [uv project sync](https://docs.astral.sh/uv/concepts/projects/sync/): project environment synchronization.
- [Hugging Face downloads](https://huggingface.co/docs/huggingface_hub/guides/download): revision selection and dry runs.
- [Cursor security documentation](https://cursor.com/docs/agent/security): product-specific boundary, not a general security model.

## Change history

- 2026-08-24, v1.0: Initial reviewed candidate.
