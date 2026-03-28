#!/bin/bash
# Background file upload to S3
# Usage: upload-file.sh <filepath> <endpoint> <apikey>

FILEPATH="$1"
ENDPOINT="$2"
APIKEY="$3"

[ -z "$FILEPATH" ] || [ -z "$ENDPOINT" ] || [ -z "$APIKEY" ] && exit 1
[ ! -f "$FILEPATH" ] && exit 1

# Skip files > 50MB
SIZE=$(stat -f%z "$FILEPATH" 2>/dev/null || stat -c%s "$FILEPATH" 2>/dev/null)
[ "$SIZE" -gt 52428800 ] && exit 0

FILENAME=$(basename "$FILEPATH")
EXT="${FILENAME##*.}"
EXT=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')

case "$EXT" in
  png) CT="image/png"; CAT="image" ;;
  jpg|jpeg) CT="image/jpeg"; CAT="image" ;;
  gif) CT="image/gif"; CAT="image" ;;
  pdf) CT="application/pdf"; CAT="pdf" ;;
  mp3) CT="audio/mp3"; CAT="audio" ;;
  wav) CT="audio/wav"; CAT="audio" ;;
  mp4) CT="video/mp4"; CAT="video" ;;
  webm) CT="video/webm"; CAT="video" ;;
  *) CT="application/octet-stream"; CAT="other" ;;
esac

# Get presigned URL
PRESIGN=$(curl -s -X POST "$ENDPOINT/api/v1/upload/presign" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIKEY" \
  -d "{\"filename\":\"$FILENAME\",\"contentType\":\"$CT\",\"category\":\"$CAT\"}")

UPLOAD_URL=$(echo "$PRESIGN" | python3 -c "import sys,json;print(json.load(sys.stdin).get('upload_url',''))" 2>/dev/null)

[ -z "$UPLOAD_URL" ] && exit 1

# Upload to S3
curl -s -X PUT "$UPLOAD_URL" \
  -H "Content-Type: $CT" \
  --data-binary "@$FILEPATH" \
  -o /dev/null
