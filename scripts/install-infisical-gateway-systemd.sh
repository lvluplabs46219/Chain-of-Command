#!/usr/bin/env bash
# Install / update persistent Infisical gateway (chain-of-command) via systemd.
#
# Prerequisites:
#   - Gateway already enrolled; access token present in:
#       /home/andrew/.infisical/gateways/chain-of-command.conf
#
# Usage (as root):
#   sudo bash scripts/install-infisical-gateway-systemd.sh
#
set -euo pipefail

GATEWAY_NAME="${GATEWAY_NAME:-chain-of-command}"
USER_CONF="${USER_CONF:-/home/andrew/.infisical/gateways/${GATEWAY_NAME}.conf}"
ETC_DIR="/etc/infisical/gateways"
ETC_CONF="${ETC_DIR}/${GATEWAY_NAME}.conf"
UNIT_PATH="/etc/systemd/system/${GATEWAY_NAME}.service"
DOMAIN="${INFISICAL_DOMAIN:-https://app.infisical.com}"
INFISICAL_BIN="$(command -v infisical || echo /usr/bin/infisical)"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash $0" >&2
  exit 1
fi

if [[ ! -x "${INFISICAL_BIN}" ]]; then
  echo "infisical binary not found" >&2
  exit 1
fi

if [[ ! -f "${USER_CONF}" ]]; then
  echo "Missing ${USER_CONF}" >&2
  echo "Enroll first as andrew:" >&2
  echo "  infisical gateway start ${GATEWAY_NAME} --enroll-method=token --token=gwe_... --domain=${DOMAIN}" >&2
  exit 1
fi

ACCESS_TOKEN="$(grep '^INFISICAL_GATEWAY_ACCESS_TOKEN=' "${USER_CONF}" | head -1 | cut -d= -f2-)"
if [[ -z "${ACCESS_TOKEN}" ]]; then
  echo "No INFISICAL_GATEWAY_ACCESS_TOKEN in ${USER_CONF}" >&2
  exit 1
fi

mkdir -p "${ETC_DIR}" /var/lib/infisical

# Env file for operators / future tools (token not expanded by systemd from here
# into ExecStart reliably across versions — token is embedded in unit below).
cat >"${ETC_CONF}" <<EOF
INFISICAL_GATEWAY_ACCESS_TOKEN=${ACCESS_TOKEN}
INFISICAL_GATEWAY_DOMAIN=${DOMAIN}
EOF
chmod 600 "${ETC_CONF}"
chown root:root "${ETC_CONF}"

# Persist unit with explicit name + token (fixes: "gateway name is required")
cat >"${UNIT_PATH}" <<EOF
[Unit]
Description=Infisical Gateway Service (${GATEWAY_NAME})
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=${INFISICAL_BIN} gateway start ${GATEWAY_NAME} --token=${ACCESS_TOKEN} --domain=${DOMAIN}
Restart=on-failure
RestartSec=5
PrivateTmp=yes
LimitNOFILE=1000000

[Install]
WantedBy=multi-user.target
EOF
chmod 644 "${UNIT_PATH}"

systemctl daemon-reload
systemctl enable "${GATEWAY_NAME}.service"
systemctl restart "${GATEWAY_NAME}.service"
sleep 2

echo "==== status ===="
systemctl status "${GATEWAY_NAME}.service" --no-pager -l || true
echo "==== logs ===="
journalctl -u "${GATEWAY_NAME}.service" -n 30 --no-pager || true
echo
echo "Installed: ${UNIT_PATH}"
echo "Conf:      ${ETC_CONF}"
echo "After re-enrolling, re-run this script to refresh the token."
