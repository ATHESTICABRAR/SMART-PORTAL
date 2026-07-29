@echo off
echo Pushing Vercel updates to GitHub...
git add .
git commit -m "Configure API for Vercel deployment"
git push
echo.
echo Done! Vercel is now deploying your new updates.
pause
