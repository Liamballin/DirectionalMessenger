cls

@echo off
set /p commitMessage=Enter commit message:
git add .
git commit -m "%commitMessage%"
start git push origin master 
start git push heroku master
