import double
import sys

d3 = double.DRDoubleSDK()

try:
    d3.sendCommand('camera.enable', { "width": 1152, "height": 720, "template": "v4l2", "gstreamer": "appsrc name=d3src ! autovideosink" })


except KeyboardInterrupt:
    d3.close()
    print('cleaned up')
    sys.exit(0)