import double
import sys

d3 = double.DRDoubleSDK()

try:
    while True:
        d3.sendCommand('base.turnBy', { "degrees": 360, "degreesWhileDriving": 360 })


except KeyboardInterrupt:
    d3.close()
    print('cleaned up')
    sys.exit(0)