#!/usr/bin/env bash
# Build a signed APT repository (for Linux Mint / Ubuntu Update Manager) from the newest GitHub release .deb.
#   tools/build_apt.sh <output dir>      env: GITHUB_REPOSITORY, GH_TOKEN, APT_GPG_PRIVATE_KEY
# Result: <out>/dists/stable/{Release,Release.gpg,InRelease,main/binary-amd64/Packages[.gz]}, <out>/pool/..., public key files.
set -euo pipefail
OUT=$(realpath -m "$1"); ROOT=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$OUT"
cp "$ROOT/packaging/apt/gan-mishakim.gpg" "$ROOT/packaging/apt/gan-mishakim.asc" "$OUT/"
tmp=$(mktemp -d)
if ! gh release download --repo "$GITHUB_REPOSITORY" --pattern 'gan-mishakim_amd64.deb' --dir "$tmp"; then
  echo "No released .deb yet: publishing the key only."; exit 0
fi
ver=$(dpkg-deb -f "$tmp/gan-mishakim_amd64.deb" Version)
pool="$OUT/pool/main/g/gan-mishakim"; mkdir -p "$pool"
mv "$tmp/gan-mishakim_amd64.deb" "$pool/gan-mishakim_${ver}_amd64.deb"
cd "$OUT"
mkdir -p dists/stable/main/binary-amd64
apt-ftparchive packages pool > dists/stable/main/binary-amd64/Packages
gzip -9kf dists/stable/main/binary-amd64/Packages
apt-ftparchive \
  -o APT::FTPArchive::Release::Origin="gan-mishakim" -o APT::FTPArchive::Release::Label="gan-mishakim" \
  -o APT::FTPArchive::Release::Suite=stable -o APT::FTPArchive::Release::Codename=stable \
  -o APT::FTPArchive::Release::Architectures=amd64 -o APT::FTPArchive::Release::Components=main \
  -o APT::FTPArchive::Release::Description="גן משחקים" release dists/stable > dists/stable/Release
export GNUPGHOME; GNUPGHOME=$(mktemp -d)
printf '%s\n' "$APT_GPG_PRIVATE_KEY" | gpg --batch --quiet --import
gpg --batch --yes --armor --detach-sign -o dists/stable/Release.gpg dists/stable/Release
gpg --batch --yes --clearsign -o dists/stable/InRelease dists/stable/Release
rm -rf "$GNUPGHOME"
echo "APT repository: gan-mishakim $ver"
