#!/bin/bash

SQLITE_OBJ="bin/sqlite3.o"

if [ -f "$SQLITE_OBJ" ]; then
    echo "SQLite object file already exists."
else
    echo "Compiling SQLite object file..."
    gcc -c lib/sqlite3.c -o "$SQLITE_OBJ"
fi

echo "Building server.c..."
gcc *.c "$SQLITE_OBJ" -o server
