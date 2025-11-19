@echo off

REM Start Django Backend
@REM echo Starting Django Backend...
@REM @REM cd "C:\path\to\your\django_project"
@REM cd "vulnsense_ai_backend"

@REM set no_proxy=172.*


@REM start cmd /k "python manage.py runserver"

@REM cd..

REM Start React Frontend
echo Starting React Frontend...
@REM cd "C:\path\to\your\react_project"

cd "vulnsense_ai_frontend"
start cmd /k "npm run dev -- --host"
cd..

