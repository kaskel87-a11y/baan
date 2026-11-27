import sys, glob
from PIL import Image
fs = sorted(glob.glob(sys.argv[1])); cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4; w, h = 360, 640
rows = (len(fs) + cols - 1) // cols; sh = Image.new("RGB", (cols * w, rows * h), "white")
for i, f in enumerate(fs): sh.paste(Image.open(f).resize((w, h)), ((i % cols) * w, (i // cols) * h))
sh.save(sys.argv[2])
