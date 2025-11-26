@echo off
echo ========================================
echo Environment Variables Setup Helper
echo ========================================
echo.

echo This script will help you set up environment variables.
echo.

REM Check if .env files already exist
if exist "backend\.env" (
    echo [WARNING] backend\.env already exists!
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo Skipping backend .env creation...
        goto :frontend
    )
)

echo Creating backend/.env from template...
copy backend\.env.example backend\.env >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Created backend/.env
) else (
    echo [ERROR] Failed to create backend/.env
)

:frontend
if exist "frontend\.env.local" (
    echo [WARNING] frontend\.env.local already exists!
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo Skipping frontend .env.local creation...
        goto :instructions
    )
)

echo Creating frontend/.env.local from template...
copy frontend\.env.local.example frontend\.env.local >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Created frontend/.env.local
) else (
    echo [ERROR] Failed to create frontend/.env.local
)

:instructions
echo.
echo ========================================
echo NEXT STEPS
echo ========================================
echo.
echo 1. Edit backend/.env with your credentials:
echo    - MongoDB URI (local or Atlas)
echo    - JWT secrets (generate random strings)
echo    - Cloudinary credentials (sign up at cloudinary.com)
echo    - OpenAI API key (sign up at platform.openai.com)
echo.
echo 2. Frontend .env.local is ready to use (no changes needed for local dev)
echo.
echo 3. See ENV_SETUP_GUIDE.md for detailed instructions
echo.
echo 4. Quick setup guide:
echo    - MongoDB: Install and run 'mongod'
echo    - Cloudinary: https://cloudinary.com/users/register/free
echo    - OpenAI: https://platform.openai.com/signup
echo.
echo ========================================
echo.

REM Open the .env file in default text editor
set /p open="Do you want to open backend/.env now? (y/n): "
if /i "%open%"=="y" (
    start notepad backend\.env
)

echo.
echo Setup complete! Edit the .env files and then run:
echo   1. install.bat (if not done already)
echo   2. start-backend.bat
echo   3. start-frontend.bat
echo.
pause
