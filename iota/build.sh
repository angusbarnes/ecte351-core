#!/bin/bash

SQLITE_OBJ="bin/linuxx64_sqlite3.o"
LIB_OBJ="bin/linuxx64_lib.o"

if [ -f "$SQLITE_OBJ" ]; then
    echo "SQLite object file already exists."
else
    echo "Compiling SQLite object file..."
    gcc -c lib/sqLite/sqlite3.c -o "$SQLITE_OBJ"
fi

echo "Building server.c..."
gcc *.c lib/*.c "$SQLITE_OBJ"-o server
