
import subprocess
import os

for filename in os.listdir('configs'):
    if not filename.startswith('.'):
        subprocess.call('node gekko-backtest config=configs/' + filename, shell=True)

