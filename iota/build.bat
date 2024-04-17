@echo off
set SQLITE_OBJ=bin\sqlite3.o

if exist %SQLITE_OBJ% (
    echo SQLite object file already exists.
) else (
    echo Compiling SQLite object file...
    gcc -c lib/sqlite3.c -o %SQLITE_OBJ%
)

echo Building server.c...
gcc server.c %SQLITE_OBJ% -o server.exe
