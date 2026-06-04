#!/bin/bash
# Local-only DNS override: 8degree.co → Hostinger WordPress (145.223.108.51)
# Does NOT change public DNS, GoDaddy, Hostinger panel, or Vercel.
set -euo pipefail

WP_IP="145.223.108.51"
MARKER="# 8degree.co — local WordPress only"

if grep -qF "$MARKER" /etc/hosts 2>/dev/null; then
  echo "Hosts entries already present:"
  grep -E "8degree\.co" /etc/hosts || true
else
  echo "Adding hosts entries..."
  printf '\n%s\n%s    8degree.co\n%s    www.8degree.co\n' "$MARKER" "$WP_IP" "$WP_IP" | sudo tee -a /etc/hosts >/dev/null
  echo "Added."
fi

echo "Flushing DNS cache..."
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder 2>/dev/null || true

echo ""
echo "=== ping 8degree.co ==="
ping -c 2 8degree.co || true

echo ""
echo "=== resolved IP ==="
dscacheutil -q host -a name 8degree.co 2>/dev/null | grep ip_address || true

echo ""
echo "Open in browser: https://8degree.co/wp-admin"
echo "To remove later: sudo nano /etc/hosts  (delete the 8degree block)"
