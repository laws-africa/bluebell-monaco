#!/usr/bin/env bash
set -e

# ***
# Updates src/xslt.js based on bluebell/src/akn_text.xsl
#
# Usage:
#
#  ./update-xslt-from-bluebell.sh [xslt-file]
# ***

src=${1:-../bluebell/bluebell/akn_text.xsl}

# get xsl and replace \ with \\
# we have to escape the backslashes twice: once for bash, and once for sed. Fun!
xslt=`cat $src | sed 's/\\\\/\\\\\\\\/g'`

cat << EOF > src/xslt.js
/**
 * XSLT for transforming AKN into bluebell text.
 *
 * This MUST be kept up to date with https://github.com/laws-africa/bluebell/blob/master/bluebell/akn_text.xsl
 * It is automatically updated by update-xslt.sh
 */
export const AKN_TO_TEXT = \`
$xslt
\`;
EOF
