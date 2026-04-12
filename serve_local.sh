#!/usr/bin/env bash
#  vim:ts=4:sts=4:sw=4:et
#
#  Author: Hari Sekhon
#  Date: 2026-04-12 19:23:23 +0200 (Sun, 12 Apr 2026)
#
#  https///github.com/HariSekhon/TamperMonkey
#
#  License: see accompanying Hari Sekhon LICENSE file
#
#  If you're using my code you're welcome to connect with me on LinkedIn
#  and optionally send me feedback
#
#  https://www.linkedin.com/in/HariSekhon
#

# For local development, can use Option 3 described in the README.md to point to
#
#   http://localhost:8000/<filename>

set -euo pipefail
[ -n "${DEBUG:-}" ] && set -x
srcdir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$srcdir"

python3 -m http.server 8000
