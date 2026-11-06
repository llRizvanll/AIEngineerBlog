#!/bin/sh
# Compiles src/content/mobile/*.kt with tests/mobile/MobileTests.kt and runs the tests.
# Uses `kotlinc` from PATH when installed; otherwise the Kotlin compiler, stdlib and
# kotlinx-coroutines jars that Gradle already cached under ~/.gradle.
set -e
cd "$(dirname "$0")/.."
OUT=.build/mobile
rm -rf "$OUT" && mkdir -p "$OUT"
SOURCES="src/content/mobile/*.kt src/content/modules/code/*.kt src/content/programme/code/*.kt tests/mobile/*.kt"

find_jar() { find "$HOME/.gradle" -name "$1" 2>/dev/null | sort -V | tail -1; }
COROUTINES=$(find_jar 'kotlinx-coroutines-core-jvm-1.*.jar')
[ -n "$COROUTINES" ] || { echo "kotlinx-coroutines-core-jvm not found in ~/.gradle; run any Gradle build once" >&2; exit 1; }

if command -v kotlinc >/dev/null 2>&1; then
  kotlinc -Werror -cp "$COROUTINES" $SOURCES -d "$OUT"
  STDLIB=$(dirname "$(command -v kotlinc)")/../lib/kotlin-stdlib.jar
else
  LIB=$(dirname "$(find_jar 'kotlin-compiler-embeddable-2.*.jar')")
  [ -d "$LIB" ] || { echo "No kotlinc on PATH and no Kotlin 2 compiler in ~/.gradle" >&2; exit 1; }
  V=$(ls "$LIB" | sed -n 's/^kotlin-compiler-embeddable-\(.*\)\.jar$/\1/p' | tail -1)
  STDLIB="$LIB/kotlin-stdlib-$V.jar"
  CP="$LIB/kotlin-compiler-embeddable-$V.jar:$STDLIB:$LIB/kotlin-script-runtime-$V.jar:$LIB/kotlin-reflect-$V.jar:$LIB/kotlin-daemon-embeddable-$V.jar"
  ANN=$(ls "$LIB"/annotations-*.jar 2>/dev/null | head -1); [ -n "$ANN" ] && CP="$CP:$ANN"
  CP="$CP:$COROUTINES"                     # the compiler itself runs on coroutines
  java -Xmx1g -cp "$CP" org.jetbrains.kotlin.cli.jvm.K2JVMCompiler -Werror -no-stdlib -no-reflect \
    -cp "$STDLIB:$COROUTINES" $SOURCES -d "$OUT"
fi
java -cp "$OUT:$STDLIB:$COROUTINES" MobileTestsKt
