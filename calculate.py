
import subprocess
import os

print('short,long,sellThreshold,buyTreshold,start,end,timespan,start price,end price,Buy and Hold profit,amount of trades,original simulated balance,,current simulated balance,,simulated profit,,%,simulated yearly profit,,%')

for filename in os.listdir('configs'):
    if not filename.startswith('.'):
        subprocess.call('node gekko-backtest config=configs/' + filename, shell=True)

