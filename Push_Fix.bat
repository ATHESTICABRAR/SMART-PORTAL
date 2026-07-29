@echo off
echo Pushing Vercel fix to GitHub...
git add .
git commit -m "Fix Vercel 500 Error"
git push
echo.
echo Done! Vercel is now deploying your fix.
pause
