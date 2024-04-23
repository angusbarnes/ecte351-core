@echo off
set SQLITE_OBJ=bin\winx64_sqlite3.o
set LIB_OBJ=bin\winx64_lib.o

if exist %SQLITE_OBJ% (
    echo SQLite object file already exists.
) else (
    echo Compiling SQLite object file...
    gcc -c lib/sqlite/sqlite3.c -o %SQLITE_OBJ%
)

echo Building server.c...
gcc *.c lib/*.c %SQLITE_OBJ% -o server.exe
