@echo off
echo ========================================
echo Legal Document Management Platform
echo Installation Script
echo ========================================
echo.

echo Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Backend installation failed!
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Frontend installation failed!
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Copy backend/.env.example to backend/.env and configure
echo 2. Copy frontend/.env.local.example to frontend/.env.local
echo 3. Start MongoDB: mongod
echo 4. Start Backend: cd backend ^&^& npm run dev
echo 5. Start Frontend: cd frontend ^&^& npm run dev
echo.
pause
