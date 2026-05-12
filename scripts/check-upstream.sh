#!/bin/sh
# Check for new Claude Code releases since our tracked version.
# Usage: make check-upstream

TRACKED_FILE="$(cd "$(dirname "$0")/.." && pwd)/upstream-version"
TRACKED=$(cat "$TRACKED_FILE" | tr -d '[:space:]')

# Fetch only the fields we need (body contains control chars that break JSON.parse)
RELEASES_JSON=$(curl -sf "https://api.github.com/repos/anthropics/claude-code/releases?per_page=20" \
  | node -e "
    let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
      const raw=JSON.parse(d);
      const slim=raw.map(r=>({tag_name:r.tag_name,published_at:r.published_at,html_url:r.html_url}));
      process.stdout.write(JSON.stringify(slim));
    });
  ")

if [ -z "$RELEASES_JSON" ]; then
  echo "Error: Failed to fetch releases from GitHub API"
  exit 1
fi

echo "$RELEASES_JSON" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
    const tracked='$TRACKED';
    const releases=JSON.parse(d);
    const newer=releases.filter(r=>{
      const v=r.tag_name.replace(/^v/,'');
      return v>tracked;
    });
    if(newer.length===0){
      console.log('Up to date (tracked: v'+tracked+')');
    } else {
      console.log(newer.length+' new release(s) since v'+tracked+':\n');
      newer.reverse().forEach(r=>{
        console.log('  '+r.tag_name+'  '+r.published_at.slice(0,10)+'  '+r.html_url);
      });
      console.log('\nReview changelogs, then update upstream-version to mark as tracked.');
    }
  });
"
